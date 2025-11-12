import { v4 as uuidv4 } from 'uuid';
import * as db from '@/lib/db';
import { cache } from '@/lib/redis';

export interface Subscription {
  id: string;
  subscription_id: string;
  agent_pubkey: string;
  token_address: string;
  webhook_url: string;
  thresholds: Record<string, unknown>;
  prepaid_balance: number;
  status: 'active' | 'paused' | 'cancelled';
  alerts_triggered: number;
  created_at: Date;
  updated_at: Date;
}

const ALERT_FEE_USDC = 0.05; // Fee per alert triggered
const MIN_BALANCE_THRESHOLD = 0.1; // Minimum balance to trigger alerts

export class SubscriptionService {
  /**
   * Create a new subscription for an agent
   */
  static async createSubscription(
    tokenAddress: string,
    agentPubkey: string,
    webhookUrl: string,
    thresholds: Record<string, unknown>
  ): Promise<{ subscriptionId: string; status: string }> {
    try {
      if (!this.validateWebhookUrl(webhookUrl)) {
        throw new Error('Invalid webhook URL');
      }

      const id = uuidv4();
      const subscriptionId = id.substring(0, 44); // Solana pubkey format

      // Create subscription in database
      await db.query(
        `INSERT INTO subscriptions (id, subscription_id, agent_pubkey, token_address, webhook_url, thresholds, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active')`,
        [id, subscriptionId, agentPubkey, tokenAddress, webhookUrl, JSON.stringify(thresholds)]
      );

      // Cache the subscription in Redis for quick access
      await cache.set(
        `subscription:${subscriptionId}`,
        {
          id,
          subscription_id: subscriptionId,
          agent_pubkey: agentPubkey,
          token_address: tokenAddress,
          webhook_url: webhookUrl,
          thresholds,
          status: 'active',
        },
        3600
      );

      console.log(`✅ Subscription created: ${subscriptionId}`);
      return {
        subscriptionId,
        status: 'active',
      };
    } catch (error) {
      console.error('❌ Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * List all subscriptions for a user/agent
   */
  static async listUserSubscriptions(agentPubkey: string): Promise<Subscription[]> {
    try {
      const result = await db.query(
        `SELECT id, subscription_id, agent_pubkey, token_address, webhook_url, thresholds, prepaid_balance, status, alerts_triggered, created_at, updated_at
         FROM subscriptions
         WHERE agent_pubkey = $1
         ORDER BY created_at DESC`,
        [agentPubkey]
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        subscription_id: row.subscription_id,
        agent_pubkey: row.agent_pubkey,
        token_address: row.token_address,
        webhook_url: row.webhook_url,
        thresholds: row.thresholds,
        prepaid_balance: parseFloat(row.prepaid_balance),
        status: row.status,
        alerts_triggered: row.alerts_triggered,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (error) {
      console.error('❌ Error listing subscriptions:', error);
      throw error;
    }
  }

  /**
   * Update subscription thresholds and webhook
   */
  static async updateSubscription(
    subscriptionId: string,
    newThresholds?: Record<string, unknown>,
    newWebhookUrl?: string
  ): Promise<boolean> {
    try {
      if (newWebhookUrl && !this.validateWebhookUrl(newWebhookUrl)) {
        throw new Error('Invalid webhook URL');
      }

      const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
      const values: any[] = [];
      let paramCount = 1;

      if (newThresholds !== undefined) {
        updates.push(`thresholds = $${paramCount++}`);
        values.push(JSON.stringify(newThresholds));
      }

      if (newWebhookUrl !== undefined) {
        updates.push(`webhook_url = $${paramCount++}`);
        values.push(newWebhookUrl);
      }

      values.push(subscriptionId);

      const result = await db.query(
        `UPDATE subscriptions
         SET ${updates.join(', ')}
         WHERE subscription_id = $${paramCount}`,
        values
      );

      // Invalidate cache
      await cache.del(`subscription:${subscriptionId}`);

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('❌ Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Deactivate/cancel a subscription
   */
  static async deactivateSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const result = await db.query(
        `UPDATE subscriptions
         SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
         WHERE subscription_id = $1`,
        [subscriptionId]
      );

      // Invalidate cache
      await cache.del(`subscription:${subscriptionId}`);

      console.log(`✅ Subscription cancelled: ${subscriptionId}`);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('❌ Error deactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Deduct fee from subscription balance when alert is triggered
   */
  static async deductFeeFromBalance(
    subscriptionId: string,
    amount: number = ALERT_FEE_USDC
  ): Promise<{ newBalance: number; success: boolean }> {
    try {
      // Get subscription
      const subResult = await db.query(
        `SELECT prepaid_balance FROM subscriptions WHERE subscription_id = $1`,
        [subscriptionId]
      );

      if (subResult.rows.length === 0) {
        throw new Error('Subscription not found');
      }

      const currentBalance = parseFloat(subResult.rows[0].prepaid_balance);

      // Check if sufficient balance
      if (currentBalance < amount) {
        console.warn(`⚠️ Insufficient balance for subscription ${subscriptionId}. Current: ${currentBalance}, Required: ${amount}`);
        return { newBalance: currentBalance, success: false };
      }

      // Deduct fee
      const result = await db.query(
        `UPDATE subscriptions
         SET prepaid_balance = prepaid_balance - $1,
             alerts_triggered = alerts_triggered + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE subscription_id = $2
         RETURNING prepaid_balance`,
        [amount, subscriptionId]
      );

      const newBalance = parseFloat(result.rows[0].prepaid_balance);

      // Update cache
      await cache.set(
        `balance:${subscriptionId}`,
        { prepaid_balance: newBalance },
        3600
      );

      console.log(`✅ Fee deducted from subscription ${subscriptionId}. New balance: ${newBalance}`);
      return { newBalance, success: true };
    } catch (error) {
      console.error('❌ Error deducting fee:', error);
      throw error;
    }
  }

  /**
   * Check subscription balance
   */
  static async checkBalance(subscriptionId: string): Promise<{
    prepaid_balance: number;
    alerts_triggered: number;
    can_trigger_alerts: boolean;
  }> {
    try {
      // Try cache first
      const cached = await cache.get<{
        prepaid_balance: number;
        alerts_triggered: number;
      }>(`balance:${subscriptionId}`);
      if (cached) {
        return {
          prepaid_balance: cached.prepaid_balance,
          alerts_triggered: cached.alerts_triggered || 0,
          can_trigger_alerts: cached.prepaid_balance >= MIN_BALANCE_THRESHOLD,
        };
      }

      // Fetch from database
      const result = await db.query(
        `SELECT prepaid_balance, alerts_triggered
         FROM subscriptions
         WHERE subscription_id = $1`,
        [subscriptionId]
      );

      if (result.rows.length === 0) {
        throw new Error('Subscription not found');
      }

      const row = result.rows[0];
      const prepaid_balance = parseFloat(row.prepaid_balance);
      const alerts_triggered = row.alerts_triggered;

      const data = {
        prepaid_balance,
        alerts_triggered,
        can_trigger_alerts: prepaid_balance >= MIN_BALANCE_THRESHOLD,
      };

      // Cache the result
      await cache.set(`balance:${subscriptionId}`, data, 3600);

      return data;
    } catch (error) {
      console.error('❌ Error checking balance:', error);
      throw error;
    }
  }

  /**
   * Record an alert that was triggered
   */
  static async recordAlert(
    subscriptionId: string,
    tokenAddress: string,
    reason: string
  ): Promise<string> {
    try {
      // Get the internal UUID from subscription_id
      const subResult = await db.query(
        `SELECT id FROM subscriptions WHERE subscription_id = $1`,
        [subscriptionId]
      );

      if (subResult.rows.length === 0) {
        throw new Error('Subscription not found');
      }

      const internalId = subResult.rows[0].id;
      const alertId = uuidv4();

      await db.query(
        `INSERT INTO alerts (id, subscription_id, token_address, trigger_reason)
         VALUES ($1, $2, $3, $4)`,
        [alertId, internalId, tokenAddress, reason]
      );

      return alertId;
    } catch (error) {
      console.error('❌ Error recording alert:', error);
      throw error;
    }
  }

  /**
   * Get active subscriptions for a token
   */
  static async getActiveSubscriptionsForToken(tokenAddress: string): Promise<Subscription[]> {
    try {
      const result = await db.query(
        `SELECT id, subscription_id, agent_pubkey, token_address, webhook_url, thresholds, prepaid_balance, status, alerts_triggered, created_at, updated_at
         FROM subscriptions
         WHERE token_address = $1 AND status = 'active'`,
        [tokenAddress]
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        subscription_id: row.subscription_id,
        agent_pubkey: row.agent_pubkey,
        token_address: row.token_address,
        webhook_url: row.webhook_url,
        thresholds: row.thresholds,
        prepaid_balance: parseFloat(row.prepaid_balance),
        status: row.status,
        alerts_triggered: row.alerts_triggered,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (error) {
      console.error('❌ Error fetching active subscriptions:', error);
      throw error;
    }
  }

  /**
   * Pause subscription if balance is too low
   */
  static async pauseSubscriptionIfLowBalance(subscriptionId: string): Promise<boolean> {
    try {
      // Check balance
      const balance = await this.checkBalance(subscriptionId);

      if (!balance.can_trigger_alerts) {
        await db.query(
          `UPDATE subscriptions
           SET status = 'paused', updated_at = CURRENT_TIMESTAMP
           WHERE subscription_id = $1`,
          [subscriptionId]
        );

        console.log(`⚠️ Subscription paused due to low balance: ${subscriptionId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error pausing subscription:', error);
      throw error;
    }
  }

  /**
   * Validate webhook URL format and security
   */
  private static validateWebhookUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);

      // Must be HTTPS for production
      if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
        console.warn('⚠️ Webhook URL must use HTTPS');
        return false;
      }

      // Block localhost and private IPs
      const hostname = urlObj.hostname;
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
      ) {
        console.warn('⚠️ Webhook URL cannot be localhost or private IP');
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}
