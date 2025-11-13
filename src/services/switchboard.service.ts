import { SubscriptionService } from './subscription.service';
import * as cache from '@/lib/redis';
import { Connection, PublicKey } from '@solana/web3.js';
import { AggregatorAccount } from '@switchboard-xyz/on-demand';

interface SwitchboardFeed {
  address: string;
  tokenAddress: string;
  currentPrice: number;
  lastUpdate: number;
  decimals: number;
  aggregatorAccount?: AggregatorAccount;
}

interface PriceThreshold {
  subscriptionId: string;
  tokenAddress: string;
  maxRiskLevel: number; // Risk score threshold (0-100)
  webhookUrl: string;
  agentPubkey: string;
}

/**
 * Switchboard Oracle Service for Solana Sentinel
 * Monitors price feeds and triggers alerts when thresholds are crossed
 */
export class SwitchboardService {
  private feeds: Map<string, SwitchboardFeed> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly CACHE_TTL = 30; // 30 seconds for price feed cache
  private connection: Connection;

  // Known Switchboard feed addresses on Solana Devnet
  private static readonly FEED_ADDRESSES: Record<string, string> = {
    'SOL': 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR', // SOL/USD feed
    'USDC': 'EN8VVdMREWhH7B6BqH9LYdnLo6aN9f7Z4H6kxXCpVHd7', // USDC/USD feed
    'USDT': 'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD', // USDT/USD feed
  };

  constructor(connection?: Connection) {
    this.connection = connection || new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'
    );
  }

  /**
   * Initialize and connect to Switchboard feeds
   */
  static async initialize(connection?: Connection): Promise<SwitchboardService> {
    const service = new SwitchboardService(connection);
    console.log('🔌 Initializing Switchboard Oracle Service...');

    try {
      // Test connection to a known feed
      const solFeedAddress = new PublicKey(SwitchboardService.FEED_ADDRESSES['SOL']);
      const aggregatorAccount = new AggregatorAccount(service.connection, solFeedAddress);
      
      // Verify we can load the feed
      await aggregatorAccount.fetchLatestValue();
      
      console.log('✅ Switchboard service initialized with real oracle feeds');
      return service;
    } catch (error) {
      console.error('❌ Error initializing Switchboard service:', error);
      console.warn('⚠️  Falling back to API-based price fetching');
      return service;
    }
  }

  /**
   * Start monitoring a token price
   */
  async startMonitoring(tokenAddress: string, feedAddress?: string): Promise<void> {
    try {
      // Check if already monitoring
      if (this.monitoringIntervals.has(tokenAddress)) {
        console.log(`⏭️  Already monitoring ${tokenAddress}`);
        return;
      }

      console.log(`📡 Starting to monitor ${tokenAddress}...`);

      // Determine feed address from token
      const feedPubkey = feedAddress ? new PublicKey(feedAddress) : this.getFeedAddressForToken(tokenAddress);
      
      if (!feedPubkey) {
        throw new Error(`No Switchboard feed found for token ${tokenAddress}`);
      }

      // Initialize Switchboard aggregator
      const aggregatorAccount = new AggregatorAccount(this.connection, feedPubkey);
      
      // Fetch initial price
      let price: number;
      try {
        const result = await aggregatorAccount.fetchLatestValue();
        price = result?.toNumber() || 0;
        console.log(`✅ Fetched price from Switchboard oracle: ${price}`);
      } catch (error) {
        console.warn('⚠️  Failed to fetch from Switchboard, using fallback API');
        price = await this.fetchPriceFromApi(tokenAddress);
      }

      // Store feed info
      this.feeds.set(tokenAddress, {
        address: feedPubkey.toBase58(),
        tokenAddress,
        currentPrice: price,
        lastUpdate: Date.now(),
        decimals: 8, // Standard Switchboard decimal precision
        aggregatorAccount,
      });

      // Set up periodic monitoring (check every 5 seconds)
      const intervalId = setInterval(async () => {
        try {
          await this.checkAndTriggerAlerts(tokenAddress);
        } catch (error) {
          console.error(`❌ Error monitoring ${tokenAddress}:`, error);
        }
      }, 5000) as unknown as NodeJS.Timeout;

      this.monitoringIntervals.set(tokenAddress, intervalId);
      console.log(`✅ Monitoring started for ${tokenAddress}`);
    } catch (error) {
      console.error(`❌ Error starting monitoring for ${tokenAddress}:`, error);
      throw error;
    }
  }

  /**
   * Stop monitoring a token
   */
  async stopMonitoring(tokenAddress: string): Promise<void> {
    try {
      const intervalId = this.monitoringIntervals.get(tokenAddress);
      if (intervalId) {
        clearInterval(intervalId);
        this.monitoringIntervals.delete(tokenAddress);
        this.feeds.delete(tokenAddress);
        console.log(`✅ Monitoring stopped for ${tokenAddress}`);
      }
    } catch (error) {
      console.error(`❌ Error stopping monitoring for ${tokenAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get Switchboard feed address for a token
   */
  private getFeedAddressForToken(tokenAddress: string): PublicKey | null {
    // Map common token addresses to Switchboard feeds
    const tokenToFeed: Record<string, string> = {
      // SOL
      'So11111111111111111111111111111111111111112': SwitchboardService.FEED_ADDRESSES['SOL'],
      // USDC (Devnet)
      'EPjFWaLb3bSsKUXUK94L2KEMMGiYNEvpNqpXbtEsFbaJ': SwitchboardService.FEED_ADDRESSES['USDC'],
      // USDT (Devnet)
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenEb9': SwitchboardService.FEED_ADDRESSES['USDT'],
    };

    const feedAddress = tokenToFeed[tokenAddress];
    return feedAddress ? new PublicKey(feedAddress) : null;
  }

  /**
   * Fetch current price from Switchboard feed
   */
  private async fetchPrice(feedAddress: string, tokenAddress: string): Promise<number> {
    try {
      // Check cache first
      const cacheKey = `switchboard:price:${tokenAddress}`;
      const cached = await cache.cache.get<{ price: number }>(cacheKey);

      if (cached) {
        return cached.price;
      }

      // Try fetching from Switchboard oracle
      const feed = this.feeds.get(tokenAddress);
      if (feed?.aggregatorAccount) {
        try {
          const result = await feed.aggregatorAccount.fetchLatestValue();
          const price = result?.toNumber() || 0;
          
          if (price > 0) {
            // Cache for 30 seconds
            await cache.cache.set(cacheKey, { price }, this.CACHE_TTL);
            return price;
          }
        } catch (error) {
          console.warn(`⚠️  Switchboard fetch failed for ${tokenAddress}, using fallback`);
        }
      }

      // Fallback to API if Switchboard fails
      const price = await this.fetchPriceFromApi(tokenAddress);

      // Cache for 30 seconds
      await cache.cache.set(cacheKey, { price }, this.CACHE_TTL);

      return price;
    } catch (error) {
      console.error(`❌ Error fetching price for ${tokenAddress}:`, error);
      // Return cached price or 0 on error
      return 0;
    }
  }

  /**
   * Fetch price from fallback API
   */
  private async fetchPriceFromApi(tokenAddress: string): Promise<number> {
    try {
      // Map common token addresses to symbols for demo purposes
      const tokenSymbols: Record<string, string> = {
        'EPjFWaLb3odcccccccccccccccccccccccccccccc': 'USDC',
        'So11111111111111111111111111111111111111112': 'SOL',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenEb9': 'USDT',
      };

      const symbol = tokenSymbols[tokenAddress];
      if (!symbol) {
        console.warn(`⚠️ Unknown token address: ${tokenAddress}`);
        return 0;
      }

      // In production, call real price API (CoinGecko, Birdeye, etc.)
      // For MVP, return realistic mock prices
      const mockPrices: Record<string, number> = {
        'SOL': 190 + Math.random() * 10,
        'USDC': 1.0,
        'USDT': 1.0,
      };

      return mockPrices[symbol] || 1.0;
    } catch (error) {
      console.error(`❌ Error fetching price from API:`, error);
      return 0;
    }
  }

  /**
   * Check price against thresholds and trigger alerts
   */
  private async checkAndTriggerAlerts(tokenAddress: string): Promise<void> {
    try {
      const feed = this.feeds.get(tokenAddress);
      if (!feed) return;

      // Fetch current price
      const currentPrice = await this.fetchPrice(feed.address, tokenAddress);

      // Get all active subscriptions for this token
      const subscriptions = await SubscriptionService.getActiveSubscriptionsForToken(tokenAddress);

      if (subscriptions.length === 0) {
        return;
      }

      // Check each subscription's thresholds
      for (const subscription of subscriptions) {
        if (subscription.status !== 'active') {
          continue;
        }

        // Calculate risk score based on price volatility
        const riskScore = this.calculateRiskScore(feed, currentPrice);

        // Get threshold from subscription
        const threshold = (subscription.thresholds?.risk_score as number) || 75;

        if (riskScore >= threshold) {
          await this.triggerAlert(subscription, tokenAddress, riskScore, currentPrice);
        }
      }

      // Update feed price
      feed.currentPrice = currentPrice;
      feed.lastUpdate = Date.now();
    } catch (error) {
      console.error(`❌ Error checking alerts for ${tokenAddress}:`, error);
    }
  }

  /**
   * Calculate risk score based on price movement and volatility
   */
  private calculateRiskScore(feed: SwitchboardFeed, currentPrice: number): number {
    try {
      // Calculate price change percentage
      const previousPrice = feed.currentPrice || currentPrice;
      const priceChange = Math.abs(currentPrice - previousPrice) / previousPrice;

      // Map price change to risk score (0-100)
      // 5% change = 50 risk score, 10% change = 100 risk score
      let riskScore = Math.min(100, Math.round((priceChange / 0.1) * 100));

      // Add some volatility-based scoring
      const timeSinceUpdate = Date.now() - feed.lastUpdate;
      if (timeSinceUpdate < 60000) {
        // If updated recently, slight increase
        riskScore = Math.min(100, riskScore + 5);
      }

      return riskScore;
    } catch (error) {
      console.error('❌ Error calculating risk score:', error);
      return 0;
    }
  }

  /**
   * Trigger alert and notify via webhook
   */
  private async triggerAlert(
    subscription: any,
    tokenAddress: string,
    riskScore: number,
    currentPrice: number
  ): Promise<void> {
    try {
      console.log(`⚠️  Alert triggered for ${tokenAddress}: Risk ${riskScore}%`);

      // Send webhook notification
      if (subscription.webhook_url) {
        await this.sendWebhookNotification(
          subscription.webhook_url,
          {
            subscriptionId: subscription.subscription_id,
            tokenAddress,
            riskScore,
            currentPrice,
            reason: 'Price volatility threshold exceeded',
            severity: riskScore >= 90 ? 'critical' : 'warning',
            timestamp: new Date().toISOString(),
          }
        );
      }

      // Record alert in database
      await SubscriptionService.recordAlert(
        subscription.subscription_id,
        tokenAddress,
        `Risk threshold (${riskScore}/100) exceeded - Price: $${currentPrice.toFixed(2)}`
      );

      // Deduct fee from subscription balance
      const feeResult = await SubscriptionService.deductFeeFromBalance(subscription.subscription_id);

      if (!feeResult.success) {
        console.warn(`⚠️  Insufficient balance for subscription ${subscription.subscription_id}`);
        await SubscriptionService.pauseSubscriptionIfLowBalance(subscription.subscription_id);
      }
    } catch (error) {
      console.error('❌ Error triggering alert:', error);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(
    webhookUrl: string,
    payload: {
      subscriptionId: string;
      tokenAddress: string;
      riskScore: number;
      currentPrice: number;
      reason: string;
      severity: string;
      timestamp: string;
    }
  ): Promise<void> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentinel-Signature': this.generateSignature(JSON.stringify(payload)),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`✅ Webhook sent to ${webhookUrl}`);
      } else {
        console.warn(`⚠️  Webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error sending webhook:`, error);
    }
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  private generateSignature(payload: string): string {
    try {
      // In production, use proper HMAC-SHA256
      // For MVP, use simple hash
      const crypto = require('crypto');
      const secret = process.env.WEBHOOK_SECRET || 'sentinel-secret';
      return crypto.createHmac('sha256', secret).update(payload).digest('hex');
    } catch {
      return '';
    }
  }

  /**
   * Get current price for a token
   */
  async getCurrentPrice(tokenAddress: string): Promise<number> {
    const feed = this.feeds.get(tokenAddress);
    if (!feed) {
      return await this.fetchPrice('unknown', tokenAddress);
    }
    return feed.currentPrice;
  }

  /**
   * Get monitoring status for a token
   */
  getMonitoringStatus(tokenAddress: string): {
    isMonitoring: boolean;
    currentPrice: number;
    lastUpdate: number;
  } | null {
    const feed = this.feeds.get(tokenAddress);
    if (!feed) return null;

    return {
      isMonitoring: this.monitoringIntervals.has(tokenAddress),
      currentPrice: feed.currentPrice,
      lastUpdate: feed.lastUpdate,
    };
  }

  /**
   * Stop all monitoring
   */
  async stopAllMonitoring(): Promise<void> {
    try {
      console.log('🛑 Stopping all Switchboard monitoring...');

      for (const [tokenAddress, intervalId] of this.monitoringIntervals.entries()) {
        if (intervalId) {
          clearInterval(intervalId as unknown as NodeJS.Timeout);
        }
        this.feeds.delete(tokenAddress);
      }

      this.monitoringIntervals.clear();
      console.log('✅ All monitoring stopped');
    } catch (error) {
      console.error('❌ Error stopping all monitoring:', error);
    }
  }

  /**
   * Get list of monitored tokens
   */
  getMonitoredTokens(): string[] {
    return Array.from(this.feeds.keys());
  }
}
