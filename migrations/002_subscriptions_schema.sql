-- Migration: Add subscriptions and user_balances tables
-- Purpose: Support subscription service for real-time alerts

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet VARCHAR(255) NOT NULL,
  token_address VARCHAR(255) NOT NULL,
  max_risk_level INT NOT NULL CHECK (max_risk_level >= 0 AND max_risk_level <= 100),
  alert_webhook VARCHAR(2048),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_balances table for prepaid balance management
CREATE TABLE IF NOT EXISTS user_balances (
  wallet_address VARCHAR(255) PRIMARY KEY,
  prepaid_balance DECIMAL(20, 6) NOT NULL DEFAULT 0.0,
  total_spent DECIMAL(20, 6) NOT NULL DEFAULT 0.0,
  alerts_triggered INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription_alerts table for alert history
CREATE TABLE IF NOT EXISTS subscription_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL,
  token_address VARCHAR(255) NOT NULL,
  triggered_reason VARCHAR(255) NOT NULL,
  alert_data JSONB,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  webhook_sent BOOLEAN DEFAULT FALSE,
  webhook_response VARCHAR(500),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_wallet ON subscriptions(user_wallet);
CREATE INDEX IF NOT EXISTS idx_subscriptions_token_address ON subscriptions(token_address);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_wallet, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_token_status ON subscriptions(token_address, status);
CREATE INDEX IF NOT EXISTS idx_user_balances_prepaid_balance ON user_balances(prepaid_balance);
CREATE INDEX IF NOT EXISTS idx_subscription_alerts_subscription_id ON subscription_alerts(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_alerts_triggered_at ON subscription_alerts(triggered_at);
