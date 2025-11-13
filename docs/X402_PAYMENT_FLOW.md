# x402 Payment Flow - Detailed Walkthrough

This document provides a step-by-step explanation of the x402 payment flow in The Solana Sentinel, from request generation to receipt verification.

## Table of Contents

1. [Overview](#overview)
2. [Flow Diagram](#flow-diagram)
3. [Step-by-Step Walkthrough](#step-by-step-walkthrough)
4. [Code Examples](#code-examples)
5. [Error Handling](#error-handling)
6. [Verification Examples](#verification-examples)

## Overview

The x402 payment flow enables cryptographically-verified, tier-based payments for API access. The flow ensures:

- ✅ **Authenticity**: Ed25519 signature verification
- ✅ **Non-repudiation**: Cryptographic receipts
- ✅ **Replay Protection**: Nonce tracking
- ✅ **Timestamp Validation**: 5-minute tolerance
- ✅ **Transparent Pricing**: Clear tier-based amounts

## Flow Diagram

```
┌──────────┐                                                  ┌──────────┐
│  Client  │                                                  │  Server  │
│ (Wallet) │                                                  │ (Sentinel)│
└────┬─────┘                                                  └─────┬────┘
     │                                                              │
     │ 1. Generate Payment Request                                 │
     ├─────────────────────────────────────────────────────────────┤
     │   - Tier selection (basic/standard/premium)                 │
     │   - Create message payload (resource, amount, timestamp)    │
     │   - Generate unique nonce (UUIDv4)                          │
     │                                                              │
     │ 2. Sign Message with Wallet                                 │
     ├─────────────────────────────────────────────────────────────┤
     │   - Ed25519 signature using wallet private key              │
     │   - Encode signature as base58                              │
     │                                                              │
     │ 3. Build x402 Headers                                       │
     ├─────────────────────────────────────────────────────────────┤
     │   - x402-payer: Wallet public key                           │
     │   - x402-recipient: Service public key                      │
     │   - x402-signature: Base58 Ed25519 signature                │
     │   - x402-message: Base58-encoded message payload            │
     │   - x402-timestamp: Current timestamp (ms)                  │
     │   - x402-amount: Amount in lamports                         │
     │   - x402-tier: Tier name (basic/standard/premium)           │
     │   - x402-nonce: Unique nonce                                │
     │                                                              │
     │ 4. Send HTTP Request                                        │
     │────────────────────────────────────────────────────────────>│
     │   POST /api/analyze                                         │
     │   Headers: x402-* (8 headers)                               │
     │   Body: { tokenAddress, tier }                              │
     │                                                              │
     │                          5. Validate Headers                │
     │                          ├──────────────────────────────────┤
     │                          │ - Extract headers (8 required)   │
     │                          │ - Decode message and signature   │
     │                          │ - Parse message payload          │
     │                          │                                  │
     │                          6. Security Checks                 │
     │                          ├──────────────────────────────────┤
     │                          │ - Timestamp within 5-min window  │
     │                          │ - Nonce not used (Redis check)   │
     │                          │ - Signature valid (Ed25519)      │
     │                          │ - Amount matches tier pricing    │
     │                          │                                  │
     │                          7. Store Nonce                     │
     │                          ├──────────────────────────────────┤
     │                          │ Redis: SET x402:nonce:{nonce} 1  │
     │                          │        EX 600                    │
     │                          │                                  │
     │                          8. Perform Analysis                │
     │                          ├──────────────────────────────────┤
     │                          │ - Analyze token risk             │
     │                          │ - Generate sentinel score        │
     │                          │ - Create analysis report         │
     │                          │                                  │
     │                          9. Record Payment                  │
     │                          ├──────────────────────────────────┤
     │                          │ PostgreSQL: INSERT INTO payments │
     │                          │   (payer, amount, tier, ...)     │
     │                          │                                  │
     │                          10. Sign Attestation               │
     │                          ├──────────────────────────────────┤
     │                          │ - Sign report with service key   │
     │                          │ - Ed25519 signature              │
     │                          │ - Include timestamp              │
     │                          │                                  │
     │                          11. Generate Receipt               │
     │                          ├──────────────────────────────────┤
     │                          │ - Build receipt payload          │
     │                          │ - Sign with service key          │
     │                          │ - Create receipt headers         │
     │                          │                                  │
     │ 12. Return Response                                         │
     │<────────────────────────────────────────────────────────────│
     │   200 OK                                                    │
     │   Headers: x402-receipt-* (5 headers)                       │
     │   Body: { analysisId, report, receipt }                     │
     │                                                              │
     │ 13. Verify Receipt                                          │
     ├─────────────────────────────────────────────────────────────┤
     │   - Verify receipt signature                                │
     │   - Verify attestation signature                            │
     │   - Store receipt for records                               │
     │                                                              │
     ▼                                                              ▼
```

## Step-by-Step Walkthrough

### Phase 1: Client Preparation

#### Step 1: Generate Payment Request

The client selects a tier and builds the message payload:

```typescript
import { v4 as uuidv4 } from 'uuid';

const tier = 'standard'; // or 'basic', 'premium'
const resource = '/api/analyze';
const timestamp = Date.now();
const nonce = uuidv4(); // e.g., "abc123-def456-ghi789"

// Tier pricing (in lamports)
const amounts = {
  basic: 0,
  standard: 100000,  // 0.1 USDC
  premium: 500000,   // 0.5 USDC
};

const amount = amounts[tier];

const message = {
  resource,
  timestamp,
  amount,
  tier,
  nonce,
};
```

#### Step 2: Sign Message with Wallet

The client signs the message using their Solana wallet:

```typescript
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

// Assume wallet is a Keypair from Phantom or other wallet
const wallet: Keypair = ...;

// Encode message as base58
const messageBytes = Buffer.from(JSON.stringify(message));
const encodedMessage = bs58.encode(messageBytes);

// Sign message with Ed25519
const signature = nacl.sign.detached(messageBytes, wallet.secretKey);
const encodedSignature = bs58.encode(signature);
```

#### Step 3: Build x402 Headers

Assemble all required headers:

```typescript
const headers = {
  'x402-payer': wallet.publicKey.toBase58(),
  'x402-recipient': '9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu', // Sentinel service
  'x402-signature': encodedSignature,
  'x402-message': encodedMessage,
  'x402-timestamp': timestamp.toString(),
  'x402-amount': amount.toString(),
  'x402-tier': tier,
  'x402-nonce': nonce,
};
```

#### Step 4: Send HTTP Request

Send the request with x402 headers:

```typescript
const response = await fetch('https://solana-sentinel.vercel.app/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...headers,
  },
  body: JSON.stringify({
    tokenAddress: 'EPjFWaLb3bSsKUXUK94L2KEMMGiYNEvpNqpXbtEsFbaJ',
    tier,
  }),
});
```

### Phase 2: Server Validation

#### Step 5: Validate Headers

The middleware extracts and validates headers:

```typescript
// src/middleware/x402.middleware.ts

const REQUIRED_HEADERS = [
  'x402-payer',
  'x402-recipient',
  'x402-signature',
  'x402-message',
  'x402-timestamp',
  'x402-amount',
  'x402-tier',
  'x402-nonce',
];

const headers: Record<string, string> = {};
for (const key of REQUIRED_HEADERS) {
  const value = request.headers.get(key);
  if (!value) {
    throw new X402Error(`Missing required header: ${key}`, 400);
  }
  headers[key.replace('x402-', '')] = value;
}

// Decode message
const decodedMessage = bs58.decode(headers.message).toString('utf-8');
const messagePayload = JSON.parse(decodedMessage);
```

#### Step 6: Security Checks

Four critical security validations:

```typescript
// 1. Timestamp Validation (5-minute window)
const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;
const now = Date.now();
const diff = Math.abs(now - messagePayload.timestamp);

if (diff > TIMESTAMP_TOLERANCE_MS) {
  throw new X402Error('Timestamp outside tolerance window', 400);
}

// 2. Nonce Replay Protection
const nonceKey = `x402:nonce:${headers.nonce}`;
const exists = await redisClient.exists(nonceKey);

if (exists) {
  throw new X402Error('Nonce already used (replay attack)', 400);
}

// 3. Signature Verification (Ed25519)
const messageBytes = Buffer.from(decodedMessage);
const signature = bs58.decode(headers.signature);
const payerPublicKey = bs58.decode(headers.payer);

const isValid = nacl.sign.detached.verify(
  messageBytes,
  signature,
  payerPublicKey
);

if (!isValid) {
  throw new X402Error('Invalid signature', 401);
}

// 4. Amount Verification
const expectedAmount = TIER_CONFIG[tier].price * 1_000_000;

if (messagePayload.amount < expectedAmount) {
  throw new X402Error('Insufficient payment amount', 402, {
    paymentRequest: {
      recipient: headers.recipient,
      amount: expectedAmount,
      tier,
      resource: messagePayload.resource,
    },
  });
}
```

#### Step 7: Store Nonce

Mark the nonce as used (10-minute TTL):

```typescript
await redisClient.set(nonceKey, '1', { EX: 600 });
```

### Phase 3: Service Execution

#### Step 8: Perform Analysis

Execute the core service logic:

```typescript
const { report, analysisId } = await analysisService.analyzeToken({
  tokenAddress,
  tier,
  requesterPubkey: headers.payer,
});

// report contains:
// - sentinelScore: number (0-100)
// - liquidityDepth: number
// - priceHistory: array
// - socialMetrics: object
// - onChainMetrics: object
// - issuedAt: ISO timestamp
```

#### Step 9: Record Payment

Store payment in PostgreSQL:

```typescript
await recordPayment({
  headers: {
    payer: headers.payer,
    recipient: headers.recipient,
    amount: headers.amount,
    tier: headers.tier,
    signature: headers.signature,
    nonce: headers.nonce,
    transaction: headers.transaction, // optional
  },
  paymentType: 'analysis',
  linkedAnalysisId: analysisId,
  metadata: {
    tokenAddress,
    tier,
  },
});

// Database record:
// {
//   id: UUID,
//   payer_pubkey: "6kQ6...",
//   recipient_pubkey: "9bVh...",
//   amount_lamports: 100000,
//   tier: "standard",
//   transaction_signature: "5Kmh..." (optional),
//   payment_type: "analysis",
//   linked_analysis_id: "ana_abc123",
//   metadata: { tokenAddress, tier },
//   created_at: NOW()
// }
```

#### Step 10: Sign Attestation

Generate cryptographic attestation (standard/premium tiers only):

```typescript
const attestation = attestationService.signReport(report, analysisId);

// attestation format:
// {
//   signature: "5J8x...", // base58 Ed25519 signature
//   publicKey: "9bVhqo...", // Sentinel service key
//   timestamp: "2025-11-13T07:15:00.000Z"
// }
```

#### Step 11: Generate Receipt

Create receipt with service signature:

```typescript
const receiptPayload = {
  analysisId,
  issuedAt: report.issuedAt,
  tier,
  transaction: headers.transaction, // optional
};

// Sign receipt
const receiptBytes = Buffer.from(JSON.stringify(receiptPayload));
const receiptSecretKey = bs58.decode(process.env.SENTINEL_RECEIPT_PRIVATE_KEY);
const receiptSignature = nacl.sign.detached(receiptBytes, receiptSecretKey);
const encodedReceiptSignature = bs58.encode(receiptSignature);

// Build receipt headers
const receiptHeaders = {
  'x402-receipt-tier': tier,
  'x402-receipt-timestamp': Date.now().toString(),
  'x402-receipt-signature': encodedReceiptSignature,
  'x402-receipt-amount': headers.amount,
  'x402-receipt-transaction': headers.transaction, // optional
};
```

### Phase 4: Response & Verification

#### Step 12: Return Response

Send response with receipt headers:

```typescript
return NextResponse.json(
  {
    analysisId,
    report: {
      ...report,
      attestation, // for standard/premium tiers
    },
    receipt: {
      analysisId,
      issuedAt: report.issuedAt,
      tier,
      signature: encodedReceiptSignature,
      transaction: headers.transaction,
    },
  },
  {
    status: 200,
    headers: receiptHeaders,
  }
);
```

#### Step 13: Verify Receipt

Client verifies the receipt:

```typescript
// 1. Verify Receipt Signature
const receiptPayload = {
  analysisId: response.receipt.analysisId,
  issuedAt: response.receipt.issuedAt,
  tier: response.receipt.tier,
  transaction: response.receipt.transaction,
};

const receiptBytes = Buffer.from(JSON.stringify(receiptPayload));
const receiptSignature = bs58.decode(response.receipt.signature);
const servicePublicKey = bs58.decode('9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu');

const isReceiptValid = nacl.sign.detached.verify(
  receiptBytes,
  receiptSignature,
  servicePublicKey
);

// 2. Verify Attestation Signature (standard/premium tiers)
if (response.report.attestation) {
  const reportBytes = Buffer.from(JSON.stringify({
    ...response.report,
    attestation: undefined, // exclude attestation from signed payload
  }));
  const attestationSignature = bs58.decode(response.report.attestation.signature);
  
  const isAttestationValid = nacl.sign.detached.verify(
    reportBytes,
    attestationSignature,
    servicePublicKey
  );
}
```

## Code Examples

### Complete Client Example

```typescript
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { v4 as uuidv4 } from 'uuid';

class SentinelClient {
  private connection: Connection;
  private wallet: Keypair;
  private servicePublicKey: PublicKey;
  private apiBaseUrl: string;

  constructor(
    connection: Connection,
    wallet: Keypair,
    servicePublicKey: PublicKey,
    apiBaseUrl: string
  ) {
    this.connection = connection;
    this.wallet = wallet;
    this.servicePublicKey = servicePublicKey;
    this.apiBaseUrl = apiBaseUrl;
  }

  private buildX402Headers(
    resource: string,
    tier: 'basic' | 'standard' | 'premium',
    amount: number
  ): Record<string, string> {
    const timestamp = Date.now();
    const nonce = uuidv4();

    const message = {
      resource,
      timestamp,
      amount,
      tier,
      nonce,
    };

    const messageBytes = Buffer.from(JSON.stringify(message));
    const encodedMessage = bs58.encode(messageBytes);

    const signature = nacl.sign.detached(messageBytes, this.wallet.secretKey);
    const encodedSignature = bs58.encode(signature);

    return {
      'x402-payer': this.wallet.publicKey.toBase58(),
      'x402-recipient': this.servicePublicKey.toBase58(),
      'x402-signature': encodedSignature,
      'x402-message': encodedMessage,
      'x402-timestamp': timestamp.toString(),
      'x402-amount': amount.toString(),
      'x402-tier': tier,
      'x402-nonce': nonce,
    };
  }

  async analyzeToken(
    tokenAddress: string,
    tier: 'basic' | 'standard' | 'premium'
  ) {
    const amounts = { basic: 0, standard: 100000, premium: 500000 };
    const amount = amounts[tier];

    const headers = this.buildX402Headers('/api/analyze', tier, amount);

    const response = await fetch(`${this.apiBaseUrl}/api/analyze`, {
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

    // Verify receipt
    const isValid = this.verifyReceipt(data.receipt);
    if (!isValid) {
      throw new Error('Invalid receipt signature');
    }

    return data;
  }

  private verifyReceipt(receipt: any): boolean {
    const payload = {
      analysisId: receipt.analysisId,
      issuedAt: receipt.issuedAt,
      tier: receipt.tier,
      transaction: receipt.transaction,
    };

    const bytes = Buffer.from(JSON.stringify(payload));
    const signature = bs58.decode(receipt.signature);
    const publicKey = bs58.decode(this.servicePublicKey.toBase58());

    return nacl.sign.detached.verify(bytes, signature, publicKey);
  }
}

// Usage
const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.fromSecretKey(/* your wallet bytes */);
const serviceKey = new PublicKey('9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu');

const client = new SentinelClient(
  connection,
  wallet,
  serviceKey,
  'https://solana-sentinel.vercel.app'
);

// Analyze token with standard tier
const result = await client.analyzeToken(
  'EPjFWaLb3bSsKUXUK94L2KEMMGiYNEvpNqpXbtEsFbaJ',
  'standard'
);

console.log('Sentinel Score:', result.report.sentinelScore);
console.log('Receipt ID:', result.receipt.analysisId);
console.log('Attestation:', result.report.attestation?.signature);
```

## Error Handling

### Common Errors

#### 400 Bad Request - Missing Headers

```json
{
  "error": "Missing required header: x402-signature"
}
```

**Solution:** Ensure all 8 x402 headers are present.

#### 400 Bad Request - Invalid Timestamp

```json
{
  "error": "Timestamp outside tolerance window"
}
```

**Solution:** Use current timestamp (`Date.now()`), ensure system clock is synced.

#### 400 Bad Request - Nonce Replay

```json
{
  "error": "Nonce already used (replay attack)"
}
```

**Solution:** Generate a new unique nonce for each request (use `uuidv4()`).

#### 401 Unauthorized - Invalid Signature

```json
{
  "error": "Invalid signature"
}
```

**Solution:** Verify you're signing the exact message payload, check wallet keypair.

#### 402 Payment Required

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

**Solution:** Ensure `x402-amount` matches the tier pricing (basic: 0, standard: 100000, premium: 500000).

## Verification Examples

### Verify Receipt in Python

```python
import base58
import json
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError

def verify_receipt(receipt, service_public_key):
    payload = {
        "analysisId": receipt["analysisId"],
        "issuedAt": receipt["issuedAt"],
        "tier": receipt["tier"],
        "transaction": receipt.get("transaction")
    }
    
    message = json.dumps(payload).encode('utf-8')
    signature = base58.b58decode(receipt["signature"])
    public_key = base58.b58decode(service_public_key)
    
    verify_key = VerifyKey(public_key)
    
    try:
        verify_key.verify(message, signature)
        return True
    except BadSignatureError:
        return False

# Usage
service_key = "9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu"
receipt = {
    "analysisId": "ana_abc123",
    "issuedAt": "2025-11-13T07:15:00.000Z",
    "tier": "standard",
    "signature": "3Kx9...",
    "transaction": "5Kmh..."
}

is_valid = verify_receipt(receipt, service_key)
print(f"Receipt valid: {is_valid}")
```

### Verify Attestation in Rust

```rust
use bs58;
use ed25519_dalek::{PublicKey, Signature, Verifier};
use serde_json::json;

fn verify_attestation(report: &serde_json::Value, attestation_signature: &str, service_public_key: &str) -> bool {
    // Remove attestation from report before verification
    let mut report_copy = report.clone();
    report_copy.as_object_mut().unwrap().remove("attestation");
    
    let message = serde_json::to_vec(&report_copy).unwrap();
    let signature_bytes = bs58::decode(attestation_signature).into_vec().unwrap();
    let public_key_bytes = bs58::decode(service_public_key).into_vec().unwrap();
    
    let signature = Signature::try_from(&signature_bytes[..]).unwrap();
    let public_key = PublicKey::from_bytes(&public_key_bytes).unwrap();
    
    public_key.verify(&message, &signature).is_ok()
}

// Usage
let service_key = "9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu";
let attestation_sig = "5J8x...";
let is_valid = verify_attestation(&report, attestation_sig, service_key);
println!("Attestation valid: {}", is_valid);
```

## Best Practices

1. **Always use unique nonces**: Generate UUIDv4 for each request
2. **Sync system clock**: Ensure timestamp within 5-minute tolerance
3. **Store receipts**: Save receipts for audit trails
4. **Verify signatures**: Always verify receipt and attestation signatures
5. **Handle 402 errors**: Gracefully handle payment required responses
6. **Use appropriate tier**: Select tier based on required features
7. **Rate limiting**: Respect rate limits (100 req/min for basic tier)
8. **Error retry**: Implement exponential backoff for retries

## Next Steps

- Read [X402_INTEGRATION.md](./X402_INTEGRATION.md) for complete integration guide
- Check [E2E_AUTOMATED_SETUP.md](./E2E_AUTOMATED_SETUP.md) for testing
- Review [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) for deployment
- See [SETUP.md](./SETUP.md) for environment configuration

---

**Last Updated**: November 13, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
