# On-Chain Attestation Storage

## Overview

The Solana Sentinel implements **on-chain attestation storage** for Premium tier token analyses. This feature stores cryptographic proofs of analysis reports directly on the Solana blockchain, providing permanent, trustless verification of all premium analyses.

## Architecture

### Components

1. **Solana Program** (`programs/sentinel/src/lib.rs`)
   - Anchor-based smart contract deployed on Solana Devnet
   - Program ID: `9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu`
   - Implements `create_attestation` instruction

2. **SolanaService** (`src/services/solana.service.ts`)
   - TypeScript service for interacting with the Solana program
   - Handles transaction creation, signing, and confirmation
   - Provides attestation retrieval and verification methods

3. **API Integration** (`src/app/api/analyze/route.ts`)
   - Premium tier analyses automatically trigger on-chain storage
   - Returns on-chain attestation metadata in response

4. **UI Display** (`src/components/sentinel-report.tsx`)
   - Dedicated section showing on-chain attestation details
   - Links to Solana Explorer for verification
   - Copy functionality for transaction signatures and PDAs

## Data Structure

### On-Chain Account (Attestation)

```rust
#[account]
pub struct Attestation {
    pub creator: Pubkey,           // 32 bytes - Sentinel's public key
    pub token_mint: Pubkey,        // 32 bytes - Token address analyzed
    pub risk_score: u16,           // 2 bytes  - Sentinel score (0-100)
    pub analysis_hash: [u8; 32],   // 32 bytes - SHA-256 hash of report
    pub created_at: i64,           // 8 bytes  - Unix timestamp
}
```

**Total Size:** 106 bytes + 8 bytes discriminator = 114 bytes

### Analysis Hash Calculation

The `analysis_hash` is a SHA-256 hash of the report data:

```typescript
const payload = JSON.stringify({
  tokenAddress: report.tokenAddress,
  tokenName: report.tokenName,
  tokenSymbol: report.tokenSymbol,
  sentinelScore: report.sentinelScore,
  aiAnalysis: report.aiAnalysis,
  onChainAnalysis: report.onChainAnalysis,
  sentimentAnalysis: report.sentimentAnalysis,
  issuedAt: report.issuedAt,
});

const analysisHash = createHash('sha256').update(payload).digest();
```

## Flow Diagram

```
┌─────────────────┐
│  Client Request │
│  (Premium Tier) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  /api/analyze endpoint  │
│  1. Validate x402       │
│  2. Perform analysis    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  SolanaService          │
│  storeAttestationOnChain│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Build Transaction      │
│  - create_attestation   │
│  - Sign with Sentinel   │
│  - Sign with new PDA    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Send to Solana         │
│  - Devnet RPC           │
│  - Confirm transaction  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Return Metadata        │
│  - Transaction sig      │
│  - Attestation PDA      │
│  - Block slot/time      │
│  - Explorer URL         │
└─────────────────────────┘
```

## Usage

### Creating an Attestation (Automatic for Premium)

When a user requests a Premium tier analysis, the attestation is automatically stored on-chain:

```bash
curl -X POST https://your-api.com/api/analyze \
  -H "Content-Type: application/json" \
  -H "x402-payer: YourWalletAddress..." \
  -H "x402-signature: ..." \
  -H "x402-tier: premium" \
  -d '{
    "tokenAddress": "So11111111111111111111111111111111111111112",
    "tier": "premium"
  }'
```

**Response includes:**

```json
{
  "analysisId": "uuid-here",
  "report": {
    "tokenAddress": "So11111111...",
    "sentinelScore": 85,
    "onChainAttestation": {
      "signature": "5x7Ks...",
      "attestationPda": "8mPqR...",
      "slot": 123456789,
      "blockTime": 1699999999,
      "explorerUrl": "https://explorer.solana.com/tx/5x7Ks...?cluster=devnet"
    }
  }
}
```

### Retrieving an Attestation

Anyone can retrieve and verify an attestation using the PDA:

```bash
GET /api/attestation/on-chain?attestationPda=8mPqR...
```

**Response:**

```json
{
  "attestation": {
    "creator": "9bVhqoVh...",
    "tokenMint": "So11111111...",
    "riskScore": 85,
    "analysisHash": "a3f2d1...",
    "createdAt": 1699999999
  },
  "explorerUrl": "https://explorer.solana.com/address/8mPqR...?cluster=devnet",
  "network": "devnet",
  "verified": true
}
```

### Manual Verification

To manually verify an attestation on-chain:

1. **Get the PDA from the API response**
   ```
   attestationPda: "8mPqR..."
   ```

2. **Query Solana blockchain**
   ```bash
   solana account 8mPqR... --url devnet
   ```

3. **Verify account data matches report**
   - Check `token_mint` matches token address
   - Check `risk_score` matches Sentinel score
   - Check `analysis_hash` matches SHA-256 of report
   - Check `creator` is Sentinel's public key

## Testing

### Run Automated Test

```bash
npm run test:attestation
```

This test script:
1. ✅ Checks program deployment
2. ✅ Verifies wallet balance
3. ✅ Creates mock attestation on-chain
4. ✅ Retrieves attestation data
5. ✅ Verifies data integrity

**Expected Output:**
```
🧪 Starting On-Chain Attestation Test...

1️⃣ Initializing Solana service...
✅ Solana service initialized

2️⃣ Checking program deployment...
✅ Program found:
   - Executable: true
   - Owner: BPFLoaderUpgradeab1e...

3️⃣ Checking sentinel wallet balance...
✅ Balance: 1.2345 SOL

4️⃣ Creating mock analysis report...
✅ Mock report created

5️⃣ Storing attestation on-chain...
✅ Attestation stored successfully:
   - Transaction: 5x7Ks...
   - Attestation PDA: 8mPqR...
   - Slot: 123456789
   - Block Time: 2024-11-13T10:00:00Z
   - Explorer: https://explorer.solana.com/tx/5x7Ks...?cluster=devnet

⏳ Waiting 5 seconds for blockchain confirmation...

6️⃣ Retrieving attestation from on-chain...
✅ Attestation retrieved:
   - Creator: 9bVhqoVh...
   - Token Mint: So11111111...
   - Risk Score: 85
   - Analysis Hash: a3f2d1...
   - Created At: 2024-11-13T10:00:00Z

7️⃣ Verifying data integrity...
✅ Data integrity verified:
   - Risk score matches: true
   - Token mint matches: true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 TEST PASSED: On-Chain Attestation Working!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Manual Testing with Real Analysis

1. **Start dev server**
   ```bash
   npm run dev
   ```

2. **Request Premium analysis**
   - Navigate to http://localhost:9002
   - Select "Premium" tier ($0.50 USDC)
   - Enter a token address
   - Submit analysis request

3. **Check on-chain attestation section**
   - Should display transaction signature
   - Should show attestation PDA
   - Click Explorer link to verify on Solana blockchain

## Configuration

### Environment Variables

```env
# Required for on-chain attestation
SENTINEL_RECEIPT_PRIVATE_KEY=your-ed25519-private-key-base58
SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu
NEXT_PUBLIC_NETWORK=devnet
```

### Wallet Requirements

- **Minimum Balance:** 0.01 SOL for transaction fees
- **Key Format:** Ed25519 private key (64 bytes, base58-encoded)
- **Network:** Devnet (can be changed to mainnet-beta)

### Cost Analysis

Each attestation costs approximately:
- **Rent-exempt minimum:** ~0.002 SOL (114 bytes account)
- **Transaction fee:** ~0.000005 SOL
- **Total per attestation:** ~0.002005 SOL (~$0.20 at $100/SOL)

With Premium tier at $0.50 USDC, this leaves healthy margin for infrastructure costs.

## Security Considerations

### Data Integrity

1. **SHA-256 Hashing:** All report data is hashed before storage
2. **Immutable Storage:** Once on-chain, attestations cannot be modified
3. **Public Verification:** Anyone can verify attestation authenticity
4. **Ed25519 Signatures:** Cryptographic proof of Sentinel authorship

### Access Control

- Only Sentinel's wallet can create attestations (payer/signer)
- Attestation accounts are publicly readable
- No permissions needed to verify attestations

### Risk Mitigation

1. **Wallet Security:** Sentinel private key stored in environment variables only
2. **Rate Limiting:** Premium tier protected by x402 payment verification
3. **Error Handling:** Graceful fallback if on-chain storage fails
4. **Balance Monitoring:** Check wallet balance before transactions

## Troubleshooting

### Common Issues

**Issue:** "Sentinel keypair not available - skipping on-chain storage"
- **Cause:** SENTINEL_RECEIPT_PRIVATE_KEY not configured
- **Fix:** Add private key to `.env.local`

**Issue:** "Failed to store attestation on-chain: Insufficient funds"
- **Cause:** Wallet balance below 0.01 SOL
- **Fix:** Fund wallet with devnet SOL from faucet

**Issue:** "Transaction failed" with program logs
- **Cause:** Program instruction data malformed or program not deployed
- **Fix:** Verify program deployment with `solana program show 9bVhqoVh...`

**Issue:** "Attestation not found on-chain"
- **Cause:** Transaction not confirmed yet or wrong PDA
- **Fix:** Wait 5-10 seconds and retry, or check transaction signature on Explorer

## Future Enhancements

### Planned Features

1. **Batch Attestations** - Store multiple attestations in single transaction
2. **Mainnet Deployment** - Production-ready attestation storage
3. **Compression** - Use Solana compression for cost reduction
4. **Indexing** - Build attestation index for faster lookups
5. **Third-Party Verification SDK** - JavaScript/Rust SDK for external verification

### Upgrade Path

- **Standard → Premium:** Upgrade existing analyses to on-chain storage
- **Retroactive Attestation:** Store historical analysis attestations
- **Cross-Chain:** Explore attestation bridges to other blockchains

## References

- [Solana Program Source Code](../programs/sentinel/src/lib.rs)
- [SolanaService Implementation](../src/services/solana.service.ts)
- [API Endpoint](../src/app/api/analyze/route.ts)
- [UI Component](../src/components/sentinel-report.tsx)
- [Test Script](../scripts/test-attestation.ts)
- [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
- [Anchor Documentation](https://book.anchor-lang.com/)
