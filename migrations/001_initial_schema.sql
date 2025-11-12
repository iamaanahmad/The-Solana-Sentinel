-- Solana Sentinel x402 Integration Database Schema
-- Migration 001: Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analyses table: stores all token risk analysis results
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_address VARCHAR(44) NOT NULL,
    requester_pubkey VARCHAR(44) NOT NULL,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('basic', 'standard', 'premium')),
    sentinel_score INTEGER NOT NULL CHECK (sentinel_score >= 0 AND sentinel_score <= 100),
    report_data JSONB NOT NULL,
    attestation_signature TEXT,
    cost_usdc DECIMAL(10, 6) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for analyses table
CREATE INDEX IF NOT EXISTS idx_analyses_token_address ON analyses(token_address);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_requester_pubkey ON analyses(requester_pubkey);
CREATE INDEX IF NOT EXISTS idx_analyses_tier ON analyses(tier);

-- Subscriptions table: manages real-time alert subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id VARCHAR(44) NOT NULL UNIQUE,
    agent_pubkey VARCHAR(44) NOT NULL,
    token_address VARCHAR(44) NOT NULL,
    webhook_url TEXT NOT NULL,
    thresholds JSONB NOT NULL,
    prepaid_balance DECIMAL(10, 6) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    alerts_triggered INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for subscriptions table
CREATE INDEX IF NOT EXISTS idx_subscriptions_agent_pubkey ON subscriptions(agent_pubkey);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_token_address ON subscriptions(token_address);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON subscriptions(subscription_id);

-- Payments table: tracks all x402 payment transactions
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_hash VARCHAR(88) NOT NULL UNIQUE,
    payer_pubkey VARCHAR(44) NOT NULL,
    amount_usdc DECIMAL(10, 6) NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('analysis', 'subscription', 'alert', 'historical')),
    analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_payer_pubkey ON payments(payer_pubkey);
CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_analysis_id ON payments(analysis_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);

-- Alerts table: logs all triggered alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    token_address VARCHAR(44) NOT NULL,
    trigger_reason TEXT NOT NULL,
    sentinel_score INTEGER NOT NULL CHECK (sentinel_score >= 0 AND sentinel_score <= 100),
    webhook_delivered BOOLEAN DEFAULT FALSE,
    webhook_response_code INTEGER,
    retry_count INTEGER DEFAULT 0,
    analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for alerts table
CREATE INDEX IF NOT EXISTS idx_alerts_subscription_id ON alerts(subscription_id);
CREATE INDEX IF NOT EXISTS idx_alerts_token_address ON alerts(token_address);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_webhook_delivered ON alerts(webhook_delivered);

-- Telegram users table: maps Telegram chat IDs to Solana wallets
CREATE TABLE IF NOT EXISTS telegram_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    username VARCHAR(255),
    wallet_address VARCHAR(44),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for telegram_users table
CREATE INDEX IF NOT EXISTS idx_telegram_users_chat_id ON telegram_users(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_wallet_address ON telegram_users(wallet_address);

-- Agent registrations table: tracks registered agents
CREATE TABLE IF NOT EXISTS agent_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_pubkey VARCHAR(44) NOT NULL UNIQUE,
    agent_name VARCHAR(255),
    api_endpoint TEXT,
    pda_address VARCHAR(44),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for agent_registrations table
CREATE INDEX IF NOT EXISTS idx_agent_registrations_agent_pubkey ON agent_registrations(agent_pubkey);
CREATE INDEX IF NOT EXISTS idx_agent_registrations_status ON agent_registrations(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telegram_users_updated_at BEFORE UPDATE ON telegram_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_registrations_updated_at BEFORE UPDATE ON agent_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries

-- Active subscriptions view
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
    s.*,
    COUNT(a.id) as total_alerts,
    MAX(a.created_at) as last_alert_at
FROM subscriptions s
LEFT JOIN alerts a ON s.id = a.subscription_id
WHERE s.status = 'active'
GROUP BY s.id;

-- Payment summary view
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    DATE(created_at) as payment_date,
    payment_type,
    COUNT(*) as transaction_count,
    SUM(amount_usdc) as total_usdc
FROM payments
GROUP BY DATE(created_at), payment_type
ORDER BY payment_date DESC;

-- Token analysis summary view
CREATE OR REPLACE VIEW token_analysis_summary AS
SELECT 
    token_address,
    COUNT(*) as analysis_count,
    AVG(sentinel_score) as avg_sentinel_score,
    MIN(sentinel_score) as min_sentinel_score,
    MAX(sentinel_score) as max_sentinel_score,
    MAX(created_at) as last_analyzed_at
FROM analyses
GROUP BY token_address;

COMMENT ON TABLE analyses IS 'Stores all token risk analysis results with attestations';
COMMENT ON TABLE subscriptions IS 'Manages real-time alert subscriptions for agents';
COMMENT ON TABLE payments IS 'Tracks all x402 payment transactions';
COMMENT ON TABLE alerts IS 'Logs all triggered alerts and webhook deliveries';
COMMENT ON TABLE telegram_users IS 'Maps Telegram users to Solana wallet addresses';
COMMENT ON TABLE agent_registrations IS 'Tracks registered autonomous agents';
