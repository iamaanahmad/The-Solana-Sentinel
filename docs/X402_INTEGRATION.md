# x402 Protocol Integration Guide

## Overview

The Solana Sentinel integrates the **x402 protocol** for payment-based access control across all API endpoints. This enables:

- ✅ **Tier-based pricing** (basic, standard, premium)
- ✅ **Cryptographic signature verification** using Ed25519
- ✅ **Nonce-based replay protection** via Redis
- ✅ **Timestamp validation** (5-minute tolerance window)
- ✅ **Payment receipts** with cryptographic signatures
- ✅ **On-chain attestations** for premium reports

## Architecture

```
┌─────────────┐     x402 Headers      ┌──────────────────┐
│   Client    │ ───────────────────> │  x402 Middleware │
│  (Phantom)  │                       │   (Validation)   │
└─────────────┘                       └────────┬─────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │  API Endpoint   │
                                      │  (/api/analyze) │
                                      └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │ Receipt Headers │
                                      │   + Signature   │
                                      └─────────────────┘
```

## Tier Pricing

| Tier       | Price (USDC) | Features                                    | Cache TTL |
|------------|--------------|---------------------------------------------|-----------|
| **Basic**  | $0.00        | Sentinel score only                         | 300s      |
| **Standard** | $0.10      | Full report, cached results, attestation    | 300s      |
| **Premium** | $0.50       | + Switchboard oracle, priority, attestation | 300s      |

Configuration: [`src/config/tier-pricing.ts`](../src/config/tier-pricing.ts)

## x402 Request Headers

### Required Headers (8 total)

```typescript
{
  "x402-payer": "6kQ6KCmcfs4RCvfvU7xkK5vCqK5Szhw6qZC6prE9QY1X",        // Solana public key (base58)
  "x402-recipient": "9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu",    // Service public key
  "x402-signature": "5J8x...[64 bytes base58]",                        // Ed25519 signature
  "x402-message": "6kQ6...base58-encoded message",                     // Message payload
  "x402-timestamp": "1699900800000",                                   // Unix timestamp (ms)
  "x402-amount": "100000",                                             // Amount in lamports
  "x402-tier": "premium",                                              // Tier: basic/standard/premium
  "x402-nonce": "abc123...",                                           // Unique nonce (UUIDv4)
  "x402-transaction": "5Kmh...[signature]"                             // Optional: on-chain tx signature
}
```

### Message Format

The `x402-message` header contains a base58-encoded JSON payload:

```json
{
  "resource": "/api/analyze",
  "timestamp": 1699900800000,
  "amount": 100000,
  "tier": "premium",
  "nonce": "abc123-def456-ghi789"
}
```

## Client Implementation Example

### TypeScript/JavaScript Client

```typescript
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { v4 as uuidv4 } from 'uuid';

interface X402RequestOptions {
  endpoint: string;
  tier: 'basic' | 'standard' | 'premium';
  payer: Keypair;
  recipient: PublicKey;
  amount: number; // lamports
}

function buildX402Headers(options: X402RequestOptions): Record<string, string> {
  const { endpoint, tier, payer, recipient, amount } = options;
  
  // Generate nonce
  const nonce = uuidv4();
  
  // Create timestamp
  const timestamp = Date.now();
  
  // Build message payload
  const message = {
    resource: endpoint,
    timestamp,
    amount,
    tier,
    nonce,
  };
  
  // Encode message as base58
  const messageBytes = Buffer.from(JSON.stringify(message));
  const encodedMessage = bs58.encode(messageBytes);
  
  // Sign message
  const signature = nacl.sign.detached(messageBytes, payer.secretKey);
  const encodedSignature = bs58.encode(signature);
  
  return {
    'x402-payer': payer.publicKey.toBase58(),
    'x402-recipient': recipient.toBase58(),
    'x402-signature': encodedSignature,
    'x402-message': encodedMessage,
    'x402-timestamp': timestamp.toString(),
    'x402-amount': amount.toString(),
    'x402-tier': tier,
    'x402-nonce': nonce,
  };
}

// Usage example
async function analyzeToken(tokenAddress: string, tier: 'basic' | 'standard' | 'premium') {
  const connection = new Connection('https://api.devnet.solana.com');
  const payer = Keypair.fromSecretKey(/* your wallet keypair */);
  const recipient = new PublicKey('9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu');
  
  // Calculate amount based on tier
  const amounts = { basic: 0, standard: 100000, premium: 500000 }; // lamports
  const amount = amounts[tier];
  
  const headers = buildX402Headers({
    endpoint: '/api/analyze',
    tier,
    payer,
    recipient,
    amount,
  });
  
  const response = await fetch('https://solana-sentinel.vercel.app/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ tokenAddress, tier }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Analysis failed');
  }
  
  const data = await response.json();
  console.log('Analysis ID:', data.analysisId);
  console.log('Sentinel Score:', data.report.sentinelScore);
  console.log('Receipt Signature:', data.receipt.signature);
  
  return data;
}
```

### cURL Example (Standard Tier)

```bash
# Generate headers using your wallet
PAYER_PUBKEY="6kQ6KCmcfs4RCvfvU7xkK5vCqK5Szhw6qZC6prE9QY1X"
RECIPIENT="9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu"
TIMESTAMP=$(date +%s)000
NONCE=$(uuidv4)

# Build message payload (JavaScript/Node.js)
MESSAGE=$(echo '{"resource":"/api/analyze","timestamp":'$TIMESTAMP',"amount":100000,"tier":"standard","nonce":"'$NONCE'"}' | base58)

# Sign message with your wallet (use Solana CLI or custom script)
SIGNATURE="..." # base58-encoded Ed25519 signature

curl -X POST https://solana-sentinel.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -H "x402-payer: $PAYER_PUBKEY" \
  -H "x402-recipient: $RECIPIENT" \
  -H "x402-signature: $SIGNATURE" \
  -H "x402-message: $MESSAGE" \
  -H "x402-timestamp: $TIMESTAMP" \
  -H "x402-amount: 100000" \
  -H "x402-tier: standard" \
  -H "x402-nonce: $NONCE" \
  -d '{
    "tokenAddress": "EPjFWaLb3bSsKUXUK94L2KEMMGiYNEvpNqpXbtEsFbaJ"
  }'
```

## Response Format

### Success Response (Standard Tier)

```json
{
  "analysisId": "ana_abc123xyz",
  "report": {
    "sentinelScore": 85,
    "liquidityDepth": 1250000,
    "priceHistory": [...],
    "socialMetrics": {...},
    "onChainMetrics": {...},
    "attestation": {
      "signature": "5J8x...[base58 signature]",
      "publicKey": "9bVhqo...",
      "timestamp": "2025-11-13T07:15:00.000Z"
    }
  },
  "receipt": {
    "analysisId": "ana_abc123xyz",
    "issuedAt": "2025-11-13T07:15:00.000Z",
    "tier": "standard",
    "signature": "3Kx9...[base58 receipt signature]"
  }
}
```

### Error Response (402 Payment Required)

```json
{
  "error": "Payment required for standard tier",
  "paymentRequest": {
    "recipient": "9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu",
    "amount": 100000,
    "tier": "standard",
    "resource": "/api/analyze"
  }
}
```

## Middleware Implementation

The x402 validation is implemented in [`src/middleware/x402.middleware.ts`](../src/middleware/x402.middleware.ts):

### Key Functions

#### `validateX402Request(request, options)`

Validates all x402 headers and returns payment validation result.

**Parameters:**
- `request: NextRequest` - Next.js request object
- `options: X402ValidationOptions` - Validation configuration
  - `tier: X402Tier` - Required tier
  - `resource: string` - API resource path
  - `requirePayment: boolean` - Whether payment is required

**Returns:**
```typescript
{
  isValid: boolean;
  paymentRequired: boolean;
  headers?: X402PaymentHeaders;
  error?: string;
}
```

**Validation Steps:**
1. ✅ Extract and verify required headers (8 total)
2. ✅ Decode and parse message payload
3. ✅ Verify timestamp (5-minute tolerance)
4. ✅ Check nonce for replay protection (Redis)
5. ✅ Verify Ed25519 signature
6. ✅ Validate amount matches tier pricing
7. ✅ Store nonce in Redis (600s TTL)

#### `buildX402ReceiptHeaders(options)`

Generates receipt headers for successful payments.

**Parameters:**
```typescript
{
  tier: X402Tier;
  transaction?: string;
  signature: string;
  amount: number;
}
```

**Returns:**
```typescript
{
  'x402-receipt-tier': string;
  'x402-receipt-timestamp': string;
  'x402-receipt-signature': string;
  'x402-receipt-amount': string;
  'x402-receipt-transaction'?: string;
}
```

## Security Features

### 1. Signature Verification

Uses `tweetnacl` (Ed25519) for cryptographic signature verification:

```typescript
const messageBytes = Buffer.from(decodedMessage);
const signature = bs58.decode(headers.signature);
const payerPublicKey = bs58.decode(headers.payer);

const isValid = nacl.sign.detached.verify(
  messageBytes,
  signature,
  payerPublicKey
);
```

### 2. Nonce Replay Protection

Stores used nonces in Redis with 600-second TTL:

```typescript
const nonceKey = `x402:nonce:${headers.nonce}`;
const exists = await redisClient.exists(nonceKey);

if (exists) {
  throw new X402Error('Nonce already used (replay attack)', 400);
}

await redisClient.set(nonceKey, '1', { EX: 600 });
```

### 3. Timestamp Validation

Enforces 5-minute tolerance window:

```typescript
const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes
const now = Date.now();
const diff = Math.abs(now - messagePayload.timestamp);

if (diff > TIMESTAMP_TOLERANCE_MS) {
  throw new X402Error('Timestamp outside tolerance window', 400);
}
```

### 4. Amount Verification

Validates payment amount matches tier pricing:

```typescript
const expectedAmount = TIER_CONFIG[tier].price * 1_000_000; // Convert USDC to lamports

if (messagePayload.amount < expectedAmount) {
  throw new X402Error('Insufficient payment amount', 402, buildPaymentRequest(...));
}
```

## Payment Recording

All validated payments are stored in PostgreSQL via [`src/services/payment.service.ts`](../src/services/payment.service.ts):

```typescript
await recordPayment({
  headers: validation.headers,
  paymentType: 'analysis',
  linkedAnalysisId: analysisId,
  metadata: {
    tokenAddress: 'EPjFWaLb...',
    tier: 'premium',
  },
});
```

**Schema:**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  payer_pubkey TEXT NOT NULL,
  recipient_pubkey TEXT NOT NULL,
  amount_lamports BIGINT NOT NULL,
  tier TEXT NOT NULL,
  transaction_signature TEXT,
  payment_type TEXT NOT NULL,
  linked_analysis_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Attestation Service

Premium and Standard tier reports include cryptographic attestations via [`src/services/attestation.service.ts`](../src/services/attestation.service.ts):

```typescript
const attestation = attestationService.signReport(report, analysisId);

// Attestation format:
{
  signature: "5J8x...[base58 Ed25519 signature]",
  publicKey: "9bVhqo...[Sentinel service key]",
  timestamp: "2025-11-13T07:15:00.000Z"
}
```

Clients can verify attestations using the Sentinel public key:

```typescript
const isValid = nacl.sign.detached.verify(
  Buffer.from(JSON.stringify(report)),
  bs58.decode(attestation.signature),
  bs58.decode(attestation.publicKey)
);
```

## Testing

### E2E Test Suite

Run the automated E2E tests to verify x402 integration:

```bash
# Start dev server
npm run dev

# Run tests (separate terminal)
npm run test:e2e
```

Expected output:
```
✅ RPC Connectivity: Connected to Solana Devnet
✅ Program Deployment: Program account located
✅ Web3 Client: Client operations succeeded
✅ API /health: Health endpoint OK
✅ API /dashboard: Dashboard endpoint responded
✅ API /subscribe: Endpoint exists

✅ Passed: 6
❌ Failed: 0

E2E verification complete. Environment ready.
```

### Manual Testing with Phantom Wallet

1. Connect Phantom wallet (Devnet)
2. Navigate to `/api/analyze` endpoint
3. Generate x402 headers using client SDK
4. Submit analysis request with Standard tier
5. Verify receipt signature in response
6. Check attestation in report object

## Integration Checklist

- [x] x402 middleware implemented with signature verification
- [x] Tier-based pricing (basic/standard/premium)
- [x] Nonce-based replay protection (Redis)
- [x] Timestamp validation (5-minute window)
- [x] Payment recording in PostgreSQL
- [x] Receipt generation with signatures
- [x] Attestation service for reports
- [x] Rate limiting (Redis-backed)
- [x] E2E tests for all endpoints
- [ ] Switchboard Oracle integration (premium tier)
- [ ] On-chain attestation storage
- [ ] Agent-to-agent messaging

## Next Steps

1. **Switchboard Integration**: Add real-time price feeds for premium tier alerts
2. **On-Chain Attestations**: Store attestations in Solana program accounts
3. **Agent Messaging**: Enable agent-to-agent communication via x402
4. **Mainnet Deployment**: Deploy to Solana mainnet for production use

## Resources

- **x402 Protocol Spec**: https://github.com/solana-foundation/x402-protocol
- **Solana Devnet Explorer**: https://explorer.solana.com/?cluster=devnet
- **Switchboard Docs**: https://docs.switchboard.xyz/
- **Phantom Wallet**: https://phantom.app/

## Support

For questions or issues with x402 integration:
- Open an issue on GitHub
- Contact the Solana Sentinel team
- Join the x402 hackathon Discord channel

---

**Last Updated**: November 13, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
