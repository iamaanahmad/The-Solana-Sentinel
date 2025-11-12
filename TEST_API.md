# API Testing Guide - The Solana Sentinel x402 Integration

## Phase 1 & 2 Completion Summary

✅ **All code implementations completed and validated:**
- Attestation service with Ed25519 signing/verification (type-fixed, compiles cleanly)
- `/api/analyze` endpoint with attestation metadata in responses for Standard/Premium tiers
- `/api/verify-attestation` endpoint for client-side verification
- Middleware: x402 header validation, signature verification, nonce replay prevention
- Service: AnalysisService with tier-based caching and Helius/Nosana integration
- Types: Extended with AttestationMetadata, SwitchboardOracleSnapshot for Phase 2/3
- Config: Tier pricing with Basic (free), Standard (0.1 USDC), Premium (0.5 USDC)
- Environment: Real devnet keypairs in .env.local, comprehensive docs in docs/environment.md

**Build Status:** ✅ Successful (npm run build completed with only upstream Genkit warnings)

---

## Prerequisites for Local Testing

### Option 1: Start PostgreSQL & Redis Locally (Recommended for Full Testing)

#### On Windows with Docker:
```powershell
# Start PostgreSQL
docker run -d --name sentinel-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15

# Start Redis
docker run -d --name sentinel-redis -p 6379:6379 redis:7

# Verify connections
docker ps | grep sentinel

# Run migrations
npm run db:migrate
```

#### On Windows with WSL Ubuntu:
```bash
# In WSL terminal
sudo apt-get update
sudo apt-get install -y postgresql-client redis-server

# Start services
sudo service postgresql start
sudo service redis-server start

# Verify
psql -U postgres -d postgres -c "SELECT version();"
redis-cli ping
```

### Option 2: Quick API Test Without Database (Dev Mode)

If database isn't available, the `/api/analyze` endpoint will fail gracefully. Focus on testing the **request validation** and **routing** layer:

```powershell
# Terminal 1: Start dev server
cd c:\Projects\The-Solana-Sentinel
npm run dev
# Wait for: "✓ Ready in XXXX ms"
```

---

## Testing the x402 Integration

### Test 1: Basic Tier Analysis (Free, No x402 Headers)

**Request:**
```powershell
$headers = @{'Content-Type' = 'application/json'}
$body = @{
    tokenAddress = 'EPjFWaLb3hyccqaToN7I6EyNYYQfJ731JqMjm7aqAC1'
    tier = 'basic'
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:9002/api/analyze' `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

**Expected Response (if DB available):**
```json
{
  "analysisId": "550e8400-e29b-41d4-a716-446655440000",
  "report": {
    "tokenAddress": "EPjFWaLb3hyccqaToN7I6EyNYYQfJ731JqMjm7aqAC1",
    "tokenName": "USDC",
    "tokenSymbol": "USDC",
    "sentinelScore": 95,
    "tier": "basic",
    "cached": false,
    "issuedAt": "2025-11-12T15:30:45.123Z",
    "aiAnalysis": { /* risk verdict and analysis */ },
    "onChainAnalysis": { /* holder concentration, authorities */ },
    "sentimentAnalysis": { /* compound score and summary */ }
  },
  "receipt": {
    "analysisId": "550e8400-e29b-41d4-a716-446655440000",
    "issuedAt": "2025-11-12T15:30:45.123Z",
    "tier": "basic",
    "signature": "*** Ed25519 signature (base58) ***"
  }
}
```

---

### Test 2: Premium Tier with Attestation Headers

To test the paid tier, you need to:
1. Create a valid x402 payment request
2. Sign it with Ed25519
3. Include headers in the request

**Example PowerShell script (requires client-side signing):**
```powershell
# This is pseudo-code - real implementation requires client SDK

$clientSecret = "*** your client Ed25519 secret (base58) ***"
$nonce = [guid]::NewGuid().ToString()
$timestamp = [DateTime]::UtcNow.ToUniversalTime().ToString('o')
$amount = "0.5"  # USDC for premium tier

$paymentHeaders = @{
    "X-Sentinel-Payer" = "*** your wallet address ***"
    "X-Sentinel-Recipient" = "9uUdZhuE9KpDjQY2DqAbnqoqGu9JQMSfTjRuU4cRXpgM"
    "X-Sentinel-Amount" = $amount
    "X-Sentinel-Tier" = "premium"
    "X-Sentinel-Timestamp" = $timestamp
    "X-Sentinel-Nonce" = $nonce
    "X-Sentinel-Signature" = "*** Ed25519 signature of above fields ***"
    "X-Sentinel-Message" = "Sentinel Premium Analysis Request"
}

$body = @{
    tokenAddress = 'EPjFWaLb3hyccqaToN7I6EyNYYQfJ731JqMjm7aqAC1'
    tier = 'premium'
    requesterPubkey = "*** your wallet address ***"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri 'http://localhost:9002/api/analyze' `
    -Method POST `
    -Headers $paymentHeaders `
    -Body $body -ContentType 'application/json'
```

**Expected Response (Premium tier includes attestation):**
```json
{
  "analysisId": "550e8400-e29b-41d4-a716-446655440001",
  "report": {
    "tokenAddress": "EPjFWaLb3hyccqaToN7I6EyNYYQfJ731JqMjm7aqAC1",
    "sentinelScore": 95,
    "tier": "premium",
    "attestation": {
      "signature": "*** base58-encoded Ed25519 signature ***",
      "publicKey": "9uUdZhuE9KpDjQY2DqAbnqoqGu9JQMSfTjRuU4cRXpgM",
      "reportHash": "*** SHA-256 hash (hex) ***",
      "issuedAt": "2025-11-12T15:30:45.123Z",
      "network": "devnet"
    },
    /* ... other report fields ... */
  },
  "receipt": {
    /* ... receipt fields with signature ... */
  }
}
```

---

### Test 3: Attestation Verification

**Request:**
```powershell
$attestationPayload = @{
    reportHash = "4d967a2a9f4e8d6d5c3e2f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b"
    timestamp = "2025-11-12T15:30:45.123Z"
    sentinelScore = 95
    tokenAddress = "EPjFWaLb3hyccqaToN7I6EyNYYQfJ731JqMjm7aqAC1"
    tier = "premium"
    analysisId = "550e8400-e29b-41d4-a716-446655440001"
}

$attestation = @{
    signature = "*** from premium response above ***"
    publicKey = "9uUdZhuE9KpDjQY2DqAbnqoqGu9JQMSfTjRuU4cRXpgM"
    reportHash = "4d967a2a9f4e8d6d5c3e2f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b"
    issuedAt = "2025-11-12T15:30:45.123Z"
    network = "devnet"
}

$body = @{
    payload = $attestationPayload
    attestation = $attestation
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:9002/api/verify-attestation' `
    -Method POST `
    -Headers @{'Content-Type' = 'application/json'} `
    -Body $body | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

**Expected Response:**
```json
{
  "verified": true,
  "reportHashValid": null,
  "valid": true,
  "attestation": {
    "issuedAt": "2025-11-12T15:30:45.123Z",
    "publicKey": "9uUdZhuE9KpDjQY2DqAbnqoqGu9JQMSfTjRuU4cRXpgM",
    "reportHash": "4d967a2a9f4e8d6d5c3e2f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b",
    "network": "devnet"
  }
}
```

---

## Architecture Summary

### File Structure (Phase 1 & 2 Complete)
```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts              ✅ POST /api/analyze (x402 + attestation)
│   │   └── verify-attestation/route.ts   ✅ POST /api/verify-attestation
│   ├── actions.ts                        ✅ Server action using AnalysisService
│   └── page.tsx                          ✅ Frontend form
├── middleware/
│   └── x402.middleware.ts                ✅ x402 validation, signature checking, nonce tracking
├── services/
│   ├── analysis.service.ts               ✅ Token analysis (Helius + Nosana + AI)
│   ├── attestation.service.ts            ✅ Ed25519 signing & verification (Type-fixed)
│   └── payment.service.ts                ✅ Payment logging to PostgreSQL
├── config/
│   └── tier-pricing.ts                   ✅ Tier definitions & pricing
├── types/
│   ├── x402.ts                           ✅ x402 protocol types
│   └── index.ts                          ✅ Extended with attestation metadata
└── lib/
    ├── db.ts                             ✅ PostgreSQL connection pool
    └── redis.ts                          ✅ Redis client with rate limiting helpers
```

### Cryptography Implementation
- **x402 Request Validation:** Ed25519 signature verification using tweetnacl
- **Receipt Signing:** Ed25519 detached signatures (base58-encoded)
- **Attestation:** SHA-256 report hashing + Ed25519 signing
- **Key Format:** base58-encoded Ed25519 secrets from Solana CLI

### Tier-Based Features
| Feature | Basic | Standard | Premium |
|---------|-------|----------|---------|
| Cost (USDC) | Free | 0.1 | 0.5 |
| Analysis Scope | On-chain + Sentiment | + Real-time Oracle (TBD) | + Webhooks (TBD) |
| Caching | 5 min Redis | None | None |
| Attestation | None | ✅ Signed | ✅ Signed |
| Results Format | JSON | JSON + Receipt | JSON + Receipt + Attestation |

---

## Next Steps (Phases 3 & 4 - Not Yet Implemented)

### Phase 3: Subscriptions & Real-Time Alerts
- Rate limiting middleware (10 req/hr basic, 100 req/hr paid)
- Webhook URL validation and retry logic
- Telegram bot for `/subscribe` and `/balance` commands
- Real-time price change alerting

### Phase 4: Switchboard Oracle & Historical Queries
- Switchboard SDK integration for real-time price feeds
- WebSocket subscriptions for liquidity tracking
- Historical database queries with date range filtering
- Public dashboard for token analytics

---

## Troubleshooting

### 500 Error on All Requests
**Cause:** Database or Redis not available
**Solution:** 
- Ensure PostgreSQL is running: `docker ps | grep postgres`
- Ensure Redis is running: `docker ps | grep redis`
- Run migrations: `npm run db:migrate` (creates tables if needed)
- Check `.env.local` DATABASE_URL and REDIS_URL

### "SENTINEL_RECEIPT_PRIVATE_KEY not configured"
**Cause:** Environment variable missing
**Solution:** Check `.env.local` has `SENTINEL_RECEIPT_PRIVATE_KEY=Ma95f...`

### "Invalid signature" on x402 request
**Cause:** Client signature doesn't match server verification
**Solution:** Ensure:
- Message format matches exactly (JSON stringified payload)
- Ed25519 secret key is the correct 64-byte value
- Timestamp is within ±5 minute window
- Nonce hasn't been used before (checked in Redis)

### Genkit/OpenTelemetry Warnings During Build
**Status:** Expected upstream warnings from Genkit dependency (not breaking)
**Impact:** None - build succeeds with `-w` flag

---

## Deployment Checklist

- [ ] Set real `HELIUS_API_KEY` in production .env
- [ ] Set real `SWITCHBOARD_API_KEY` when ready for Phase 3
- [ ] Set real PostgreSQL DATABASE_URL (cloud database)
- [ ] Set real Redis REDIS_URL (cloud Redis)
- [ ] Set real Telegram `TELEGRAM_BOT_TOKEN` for bot integration
- [ ] Deploy to Vercel with environment variables configured
- [ ] Update `X402_RECIPIENT_ADDRESS` to production mainnet keypair
- [ ] Create Anchor program for on-chain attestation storage
- [ ] Test `/api/analyze` and `/api/verify-attestation` endpoints in production

---

## API Response Headers

### x402 Receipt Headers (All Responses)
- `X-Sentinel-Tier`: The tier used for this analysis
- `X-Sentinel-Signature`: Ed25519 signature of receipt payload
- `X-Sentinel-Amount`: Amount charged (0 for basic tier)
- `X-Sentinel-Analysis-Id`: UUID of analysis record

### x402 Payment Request (402 Errors)
- `X-Sentinel-Payment-Request`: JSON with tier, amount, recipient, expiry

---

Generated: 2025-11-12  
Project: The Solana Sentinel (x402 Hackathon)  
Status: **Phase 1 & 2 Complete** ✅
