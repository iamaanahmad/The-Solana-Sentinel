# Solana Sentinel - On-Chain Program Documentation

## Overview

The Sentinel on-chain program is an Anchor-based Solana smart contract that manages token alert subscriptions and attestations on the blockchain. It provides a decentralized registry for users to create, manage, and track token risk alerts with thresholds for risk scores and price changes.

## Program Architecture

### State Accounts

#### Registry
- **Owner**: Wallet address of the registry owner
- **Bump**: PDA bump seed
- **Active Subscriptions**: Count of active subscriptions
- **Total Alerts Triggered**: Lifetime count of triggered alerts
- **Created At**: Timestamp of registry creation

#### Subscription
- **Owner**: Wallet address of subscription owner
- **Token Mint**: Address of the token being monitored
- **Risk Threshold**: Risk score threshold (0-100)
- **Price Threshold**: Percentage change threshold
- **Status**: Active, Paused, or Cancelled
- **Alerts Triggered**: Count of alerts triggered
- **Created At**: Timestamp of subscription creation
- **Last Alert At**: Timestamp of last triggered alert

#### Alert
- **Subscription**: Address of parent subscription
- **Owner**: Wallet address of alert owner
- **Token Mint**: Token being alerted about
- **Risk Score**: Current risk score when triggered
- **Price Change**: Percentage price change
- **Message**: Alert message (max 256 chars)
- **Status**: Triggered, Delivered, or Failed
- **Triggered At**: When the alert was triggered
- **Delivered At**: When the alert was delivered/failed

#### Attestation
- **Creator**: Address of attestation creator
- **Token Mint**: Token being attested
- **Risk Score**: Attested risk score (0-100)
- **Analysis Hash**: Hash of analysis (32 bytes)
- **Created At**: Timestamp of attestation

### Instructions

#### `initialize_registry`
Initializes a registry for the caller. Creates a PDA-based registry account.

**Parameters:**
- `bump: u8` - PDA bump seed

**Accounts Required:**
- `registry` - Registry PDA (writable)
- `owner` - Registry owner (signer, payer)
- `system_program` - System program

#### `create_subscription`
Creates a new token subscription with risk and price thresholds.

**Parameters:**
- `token_mint: Pubkey` - Token to monitor
- `risk_threshold: u16` - Risk score threshold (0-100)
- `price_threshold: u32` - Price change percentage threshold

**Accounts Required:**
- `subscription` - New subscription account (writable)
- `registry` - User's registry (writable)
- `owner` - Subscription owner (signer, payer)
- `system_program` - System program

#### `update_subscription`
Updates the thresholds for an existing subscription.

**Parameters:**
- `new_risk_threshold: u16` - New risk threshold
- `new_price_threshold: u32` - New price threshold

**Accounts Required:**
- `subscription` - Subscription to update (writable)
- `owner` - Subscription owner (signer)

#### `pause_subscription`
Pauses an active subscription.

**Accounts Required:**
- `subscription` - Subscription to pause (writable)
- `registry` - User's registry (writable)
- `owner` - Subscription owner (signer)

#### `resume_subscription`
Resumes a paused subscription.

**Accounts Required:**
- `subscription` - Subscription to resume (writable)
- `registry` - User's registry (writable)
- `owner` - Subscription owner (signer)

#### `cancel_subscription`
Cancels an active or paused subscription.

**Accounts Required:**
- `subscription` - Subscription to cancel (writable)
- `registry` - User's registry (writable)
- `owner` - Subscription owner (signer)

#### `trigger_alert`
Triggers an alert when thresholds are breached.

**Parameters:**
- `current_risk_score: u16` - Current risk score (0-100)
- `price_change_percent: i32` - Price change percentage
- `alert_message: String` - Alert message (max 256 chars)

**Accounts Required:**
- `alert` - New alert account (writable)
- `subscription` - Target subscription (writable)
- `registry` - User's registry (writable)
- `owner` - Subscription owner (signer, payer)
- `system_program` - System program

#### `confirm_alert_delivery`
Marks an alert as successfully delivered.

**Accounts Required:**
- `alert` - Alert to confirm (writable)
- `owner` - Alert owner (signer)

#### `mark_alert_failed`
Marks an alert as failed delivery.

**Parameters:**
- `reason: String` - Failure reason (max 256 chars)

**Accounts Required:**
- `alert` - Alert to mark failed (writable)
- `owner` - Alert owner (signer)

#### `create_attestation`
Creates an on-chain attestation record for verified analysis.

**Parameters:**
- `token_mint: Pubkey` - Token being attested
- `risk_score: u16` - Attested risk score (0-100)
- `analysis_hash: [u8; 32]` - Hash of analysis

**Accounts Required:**
- `attestation` - New attestation account (writable)
- `creator` - Attestation creator (signer, payer)
- `system_program` - System program

## Events

### RegistryInitialized
Emitted when a registry is initialized.

**Fields:**
- `owner: Pubkey`
- `timestamp: i64`

### SubscriptionCreated
Emitted when a subscription is created.

**Fields:**
- `subscription: Pubkey`
- `owner: Pubkey`
- `token_mint: Pubkey`
- `risk_threshold: u16`
- `price_threshold: u32`

### SubscriptionUpdated
Emitted when thresholds are updated.

**Fields:**
- `subscription: Pubkey`
- `new_risk_threshold: u16`
- `new_price_threshold: u32`

### SubscriptionPaused
Emitted when a subscription is paused.

**Fields:**
- `subscription: Pubkey`

### SubscriptionResumed
Emitted when a subscription is resumed.

**Fields:**
- `subscription: Pubkey`

### SubscriptionCancelled
Emitted when a subscription is cancelled.

**Fields:**
- `subscription: Pubkey`

### AlertTriggered
Emitted when an alert is triggered.

**Fields:**
- `alert: Pubkey`
- `subscription: Pubkey`
- `owner: Pubkey`
- `risk_score: u16`
- `price_change: i32`
- `timestamp: i64`

### AlertDelivered
Emitted when an alert is delivered.

**Fields:**
- `alert: Pubkey`
- `delivered_at: i64`

### AlertFailed
Emitted when alert delivery fails.

**Fields:**
- `alert: Pubkey`
- `reason: String`
- `timestamp: i64`

### AttestationCreated
Emitted when an attestation is created.

**Fields:**
- `attestation: Pubkey`
- `token_mint: Pubkey`
- `risk_score: u16`

## Error Codes

| Error | Code | Description |
|-------|------|-------------|
| InvalidThreshold | 6000 | Threshold value is invalid |
| InvalidSubscriptionStatus | 6001 | Subscription has invalid status for operation |
| SubscriptionAlreadyCancelled | 6002 | Subscription was already cancelled |
| SubscriptionNotActive | 6003 | Subscription is not active |
| InvalidRiskScore | 6004 | Risk score out of range (must be 0-100) |
| MessageTooLong | 6005 | Message exceeds 256 character limit |
| ThresholdsNotBreached | 6006 | Neither risk nor price threshold breached |
| InvalidAlertStatus | 6007 | Alert has invalid status for operation |

## Usage Example

```rust
// Initialize registry
let tx = client.initializeRegistry().await?;

// Create subscription
let result = client.createSubscription(
    new PublicKey("token_mint_address"),
    80,  // risk threshold
    5    // price threshold
).await?;

// Trigger alert when conditions met
let alert = client.triggerAlert(
    subscription_address,
    85,           // risk score
    -10,          // price change
    "Risk alert!" // message
).await?;

// Confirm delivery
client.confirmAlertDelivery(alert_address).await?;
```

## Deployment

### Build
```bash
cd programs/sentinel
cargo build --release
```

### Deploy to Devnet
```bash
solana config set --url https://api.devnet.solana.com
anchor deploy
```

### Get Program ID
The Program ID is displayed after deployment and stored in `Anchor.toml`.

## Integration

The program is integrated with the Sentinel web application through:

1. **Web3.js Client** (`src/lib/web3-client.ts`) - TypeScript SDK for program interaction
2. **React Hooks** (`src/hooks/use-sentinel.ts`) - React hooks for component integration
3. **Phantom Wallet** (`src/components/web3-wallet.tsx`) - Wallet connection UI
4. **Next.js Pages** - Frontend pages for subscription management

## Network Configuration

- **Development**: Solana Devnet
- **Environment Variables**: 
  - `NEXT_PUBLIC_PROGRAM_ID` - Deployed program ID
  - `NEXT_PUBLIC_RPC_URL` - RPC endpoint (devnet by default)

## Security Considerations

1. **Owner Verification**: All subscription and alert operations require owner signature
2. **PDA Registry**: Registry account uses PDA for secure per-user state
3. **Threshold Validation**: Risk scores (0-100) and prices are validated
4. **String Length Limits**: Messages capped at 256 characters to control account sizes
5. **Status Checks**: Subscriptions must be active to trigger alerts

## Future Enhancements

1. Multi-signature support for shared subscriptions
2. Cross-program invocation (CPI) for token transfers
3. On-chain oracle integration for price data
4. Automated alert distribution via program
5. Analytics and metrics tracking
6. Fee structure for premium features
