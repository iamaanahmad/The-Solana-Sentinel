#!/usr/bin/env node
import { TelegramService } from '../src/services/telegram.service';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function startTelegramBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken || botToken === 'your-telegram-bot-token-here') {
    console.log('⚠️  TELEGRAM_BOT_TOKEN not configured');
    console.log('💡 To enable Telegram bot:');
    console.log('   1. Create a bot via @BotFather on Telegram');
    console.log('   2. Copy the bot token');
    console.log('   3. Add TELEGRAM_BOT_TOKEN=<your-token> to .env.local');
    console.log('   4. Run: npm run telegram:start');
    process.exit(0);
  }

  console.log('🤖 Starting Telegram Bot...');
  
  try {
    const telegramService = new TelegramService(botToken, false); // Use polling mode
    await telegramService.start();
    
    console.log('✅ Telegram bot is running!');
    console.log('📱 Available commands:');
    console.log('   /start - Welcome message');
    console.log('   /verify <wallet> - Verify Solana wallet');
    console.log('   /analyze <token> - Analyze token risk');
    console.log('   /subscribe <token> <threshold> - Create subscription');
    console.log('   /subscriptions - List your subscriptions');
    console.log('   /balance - Check your balance');
    console.log('   /history - View alert history');
    console.log('   /help - Show help message');
    console.log('');
    console.log('Press Ctrl+C to stop');
    
    // Keep process alive
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping Telegram bot...');
      await telegramService.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start Telegram bot:', error);
    process.exit(1);
  }
}

startTelegramBot();
