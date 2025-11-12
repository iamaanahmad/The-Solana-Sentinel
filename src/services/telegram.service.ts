import TelegramBot from 'node-telegram-bot-api';
import { SubscriptionService } from './subscription.service';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';

interface UserSession {
  walletAddress?: string;
  verificationSignature?: string;
  lastCommand?: string;
  agentPubkey?: string;
}

interface TelegramUserData {
  [userId: number]: UserSession;
}

/**
 * Telegram Bot Service for Solana Sentinel
 * Provides commands: /analyze, /subscribe, /subscriptions, /balance, /history, /help
 * Supports wallet verification with Solana signatures
 */
export class TelegramService {
  private bot: TelegramBot;
  private userSessions: TelegramUserData = {};
  private webhookSecret: string;

  constructor(botToken: string, useWebhook: boolean = false) {
    const options: any = { polling: !useWebhook };
    if (useWebhook) {
      options.webHook = {
        port: parseInt(process.env.TELEGRAM_WEBHOOK_PORT || '8443'),
        host: '0.0.0.0',
      };
    }

    this.bot = new TelegramBot(botToken, options);
    this.webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || 'default-secret';
    this.setupCommands();
  }

  /**
   * Setup all bot commands
   */
  private setupCommands() {
    // /start - Welcome message
    this.bot.onText(/\/start/, (msg: any) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      if (!this.userSessions[userId]) {
        this.userSessions[userId] = {};
      }

      this.bot.sendMessage(
        chatId,
        '👋 Welcome to Solana Sentinel!\n\n' +
        'I help you monitor token risk and setup alerts.\n\n' +
        'Available commands:\n' +
        '• /analyze <token> - Analyze token risk\n' +
        '• /subscribe <token> <threshold> - Subscribe to alerts\n' +
        '• /subscriptions - View your subscriptions\n' +
        '• /balance - Check your prepaid balance\n' +
        '• /help - Show this help message\n\n' +
        'To get started, verify your wallet with: /verify <wallet_address>'
      );
    });

    // /help - Help command
    this.bot.onText(/\/help/, (msg: any) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        '📖 Solana Sentinel Commands:\n\n' +
        '<b>/verify &lt;wallet&gt;</b>\n' +
        'Verify your Solana wallet address\n\n' +
        '<b>/analyze &lt;token&gt;</b>\n' +
        'Get risk analysis for a token\n\n' +
        '<b>/subscribe &lt;token&gt; &lt;threshold&gt;</b>\n' +
        'Create subscription for token alerts\n' +
        'Example: /subscribe SOL 75\n\n' +
        '<b>/subscriptions</b>\n' +
        'View all your active subscriptions\n\n' +
        '<b>/balance</b>\n' +
        'Check your prepaid balance\n\n' +
        '<b>/history</b>\n' +
        'View recent alerts\n\n' +
        '<b>/cancel &lt;subscription_id&gt;</b>\n' +
        'Cancel a subscription',
        { parse_mode: 'HTML' }
      );
    });

    // /verify - Wallet verification
    this.bot.onText(/\/verify (.+)/, (msg: any, match: any) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const walletAddress = match[1];

      if (!this.userSessions[userId]) {
        this.userSessions[userId] = {};
      }

      this.userSessions[userId].agentPubkey = walletAddress;
      this.bot.sendMessage(chatId, `✅ Wallet verified: ${walletAddress}\n\nYou can now create subscriptions!`);
    });

    // /analyze - Analyze token risk
    this.bot.onText(/\/analyze (.+)/, async (msg: any, match: any) => {
      const chatId = msg.chat.id;
      const tokenAddress = match[1];

      try {
        this.bot.sendMessage(chatId, '🔍 Analyzing token risk...');

        // Call the analyze endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenAddress,
            includeMetadata: true,
          }),
        });

        if (!response.ok) {
          this.bot.sendMessage(chatId, '❌ Failed to analyze token. Please try again.');
          return;
        }

        const data = await response.json();
        const analysis = data.data;

        const message =
          `📊 <b>Risk Analysis for ${tokenAddress}</b>\n\n` +
          `🎯 Overall Risk Score: <b>${analysis.risk_score}</b>/100\n` +
          `📈 Status: ${analysis.overall_status}\n\n` +
          `<b>Risk Categories:</b>\n` +
          `• Rugpull Risk: ${analysis.rugpull_risk_score}%\n` +
          `• Exploit Risk: ${analysis.exploit_risk_score}%\n` +
          `• Regulatory Risk: ${analysis.regulatory_risk_score}%\n` +
          `• Market Risk: ${analysis.market_risk_score}%\n\n` +
          `💡 Recommendation: ${analysis.recommendation}\n\n` +
          `Created: ${new Date(analysis.created_at).toLocaleString()}`;

        this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      } catch (error) {
        console.error('❌ Telegram analyze error:', error);
        this.bot.sendMessage(chatId, '❌ Error analyzing token. Please try again later.');
      }
    });

    // /subscribe - Create subscription
    this.bot.onText(/\/subscribe (.+) (\d+)/, async (msg: any, match: any) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const userSession = this.userSessions[userId];

      if (!userSession?.agentPubkey) {
        this.bot.sendMessage(chatId, '❌ Please verify your wallet first with /verify <wallet>');
        return;
      }

      const tokenAddress = match[1];
      const threshold = parseInt(match[2]);

      try {
        this.bot.sendMessage(chatId, '⏳ Creating subscription...');

        // Get webhook URL for Telegram
        const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/telegram/webhook/${userId}`;

        // Create subscription via API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenAddress,
            agentPubkey: userSession.agentPubkey,
            webhookUrl,
            thresholds: { risk_score: threshold },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          this.bot.sendMessage(chatId, `❌ Failed to create subscription: ${error.error}`);
          return;
        }

        const data = await response.json();
        this.bot.sendMessage(
          chatId,
          `✅ Subscription created!\n\n` +
          `📋 Subscription ID: <code>${data.data.subscriptionId}</code>\n` +
          `🔍 Token: ${tokenAddress}\n` +
          `⚠️ Alert Threshold: ${threshold}/100\n` +
          `📌 Status: ${data.data.status}\n\n` +
          `You'll receive alerts when risk score exceeds ${threshold}!`,
          { parse_mode: 'HTML' }
        );
      } catch (error) {
        console.error('❌ Telegram subscribe error:', error);
        this.bot.sendMessage(chatId, '❌ Error creating subscription. Please try again later.');
      }
    });

    // /subscriptions - List subscriptions
    this.bot.onText(/\/subscriptions/, async (msg: any) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const userSession = this.userSessions[userId];

      if (!userSession?.agentPubkey) {
        this.bot.sendMessage(chatId, '❌ Please verify your wallet first with /verify <wallet>');
        return;
      }

      try {
        this.bot.sendMessage(chatId, '⏳ Fetching subscriptions...');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/subscribe?agentPubkey=${userSession.agentPubkey}`
        );

        if (!response.ok) {
          this.bot.sendMessage(chatId, '❌ Failed to fetch subscriptions');
          return;
        }

        const data = await response.json();
        const subscriptions = data.data;

        if (subscriptions.length === 0) {
          this.bot.sendMessage(chatId, '📭 You have no active subscriptions.\n\nCreate one with: /subscribe <token> <threshold>');
          return;
        }

        let message = '📋 <b>Your Subscriptions</b>\n\n';
        subscriptions.forEach((sub: any, idx: number) => {
          const threshold = sub.thresholds?.risk_score || 75;
          message +=
            `<b>${idx + 1}. ${sub.token_address}</b>\n` +
            `ID: <code>${sub.subscription_id}</code>\n` +
            `Threshold: ${threshold}/100\n` +
            `Status: ${sub.status}\n` +
            `Alerts: ${sub.alerts_triggered}\n` +
            `Balance: $${sub.prepaid_balance.toFixed(2)}\n\n`;
        });

        this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      } catch (error) {
        console.error('❌ Telegram subscriptions error:', error);
        this.bot.sendMessage(chatId, '❌ Error fetching subscriptions. Please try again later.');
      }
    });

    // /balance - Check balance
    this.bot.onText(/\/balance/, async (msg: any) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const userSession = this.userSessions[userId];

      if (!userSession?.agentPubkey) {
        this.bot.sendMessage(chatId, '❌ Please verify your wallet first with /verify <wallet>');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/subscribe?agentPubkey=${userSession.agentPubkey}`
        );

        if (!response.ok) {
          this.bot.sendMessage(chatId, '❌ Failed to fetch balance');
          return;
        }

        const data = await response.json();
        const subscriptions = data.data;

        let totalBalance = 0;
        let totalAlerts = 0;

        subscriptions.forEach((sub: any) => {
          totalBalance += sub.prepaid_balance;
          totalAlerts += sub.alerts_triggered;
        });

        this.bot.sendMessage(
          chatId,
          `💰 <b>Your Account Balance</b>\n\n` +
          `Prepaid Balance: <b>$${totalBalance.toFixed(2)}</b> USDC\n` +
          `Total Alerts Triggered: ${totalAlerts}\n` +
          `Active Subscriptions: ${subscriptions.length}\n\n` +
          `Min. Alert Threshold: $0.10\n` +
          `Fee per Alert: $0.05`,
          { parse_mode: 'HTML' }
        );
      } catch (error) {
        console.error('❌ Telegram balance error:', error);
        this.bot.sendMessage(chatId, '❌ Error fetching balance. Please try again later.');
      }
    });

    // /history - View recent alerts
    this.bot.onText(/\/history/, async (msg: any) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const userSession = this.userSessions[userId];

      if (!userSession?.agentPubkey) {
        this.bot.sendMessage(chatId, '❌ Please verify your wallet first with /verify <wallet>');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/subscribe?agentPubkey=${userSession.agentPubkey}`
        );

        if (!response.ok) {
          this.bot.sendMessage(chatId, '❌ Failed to fetch history');
          return;
        }

        const data = await response.json();
        const subscriptions = data.data;

        if (subscriptions.length === 0) {
          this.bot.sendMessage(chatId, '📭 No subscriptions to show history for');
          return;
        }

        let message = '📜 <b>Recent Alert History</b>\n\n';
        let alertCount = 0;

        subscriptions.forEach((sub: any) => {
          if (sub.alerts_triggered > 0) {
            message +=
              `<b>${sub.token_address}</b>\n` +
              `Alerts: ${sub.alerts_triggered}\n` +
              `Last Updated: ${new Date(sub.updated_at).toLocaleString()}\n\n`;
            alertCount++;
          }
        });

        if (alertCount === 0) {
          this.bot.sendMessage(chatId, '✅ No alerts triggered yet!');
          return;
        }

        this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      } catch (error) {
        console.error('❌ Telegram history error:', error);
        this.bot.sendMessage(chatId, '❌ Error fetching history. Please try again later.');
      }
    });

    // /cancel - Cancel subscription
    this.bot.onText(/\/cancel (.+)/, async (msg: any, match: any) => {
      const chatId = msg.chat.id;
      const subscriptionId = match[1];

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/subscribe?subscriptionId=${subscriptionId}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          this.bot.sendMessage(chatId, '❌ Failed to cancel subscription');
          return;
        }

        this.bot.sendMessage(chatId, `✅ Subscription ${subscriptionId} has been cancelled`);
      } catch (error) {
        console.error('❌ Telegram cancel error:', error);
        this.bot.sendMessage(chatId, '❌ Error cancelling subscription. Please try again later.');
      }
    });
  }

  /**
   * Send alert notification to user
   */
  async sendAlert(userId: number, message: string, tokenAddress: string, riskScore: number) {
    try {
      await this.bot.sendMessage(
        userId,
        `⚠️ <b>ALERT: ${tokenAddress}</b>\n\n` +
        `🚨 Risk Score: <b>${riskScore}/100</b>\n\n` +
        `${message}\n\n` +
        `Check details with: /analyze ${tokenAddress}`,
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error(`❌ Failed to send alert to user ${userId}:`, error);
    }
  }

  /**
   * Verify Solana wallet signature
   */
  async verifyWalletSignature(message: string, signature: string, walletAddress: string): Promise<boolean> {
    try {
      const messageBytes = Buffer.from(message, 'utf-8');
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = bs58.decode(walletAddress);

      return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch (error) {
      console.error('❌ Signature verification error:', error);
      return false;
    }
  }

  /**
   * Start the bot
   */
  async start() {
    try {
      console.log('🚀 Starting Telegram bot...');
      // Bot is already started via constructor options
      console.log('✅ Telegram bot is running!');
    } catch (error) {
      console.error('❌ Failed to start Telegram bot:', error);
      throw error;
    }
  }

  /**
   * Stop the bot
   */
  async stop() {
    try {
      this.bot.stopPolling();
      console.log('✅ Telegram bot stopped');
    } catch (error) {
      console.error('❌ Error stopping Telegram bot:', error);
    }
  }

  /**
   * Get bot instance (for webhook handling)
   */
  getBotInstance(): TelegramBot {
    return this.bot;
  }
}
