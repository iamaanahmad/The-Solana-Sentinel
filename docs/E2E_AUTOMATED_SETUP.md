# E2E Automated Testing Setup

This document explains how to run the automated E2E tests that verify Solana integration and API endpoints.

## Prerequisites

1. **Environment Setup**
   - All environment variables configured in `.env.local`
   - Dependencies installed: `npm install`
   - Devnet RPC accessible

2. **Required Services**
   - Solana Devnet connection (no local services needed)
   - Next.js dev server running on port 9002

## Running E2E Tests

### Option 1: Quick Test (API tests require running server)

```bash
# Start the dev server in one terminal
npm run dev

# In another terminal, run E2E tests
npm run test:e2e
```

The tests will:
1. ✅ Verify Solana RPC connectivity
2. ✅ Check program deployment on Devnet
3. ✅ Test Web3 client operations (PDAs, rent calculations)
4. ✅ Test `/api/health` endpoint
5. ✅ Test `/api/dashboard` endpoint (stub mode)
6. ✅ Test `/api/subscribe` endpoint (stub mode)

### Option 2: Environment Verification Only

```bash
# Test only Solana connectivity (no server needed)
npm run test:verify
```

This runs a lightweight check of:
- RPC connection
- Environment variables
- Program deployment

## Test Configuration

### Port Configuration

The E2E tests connect to: `http://localhost:9002` (or `PORT` env var)

Update `package.json` if you change the dev server port:
```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 9002"
  }
}
```

### E2E Test Mode

When `E2E_TEST_MODE=true`, API routes return stub responses to avoid requiring:
- Redis connection
- PostgreSQL database
- External API calls

This allows the tests to verify endpoint structure without full infrastructure.

## Expected Output

### Successful Test Run

```
🔍 Solana Sentinel E2E Verification

✅ RPC Connectivity: Connected to Solana Devnet
   • RPC URL: https://api.devnet.solana.com
   • Genesis Hash: EtWTRABZaYq6iMfe...

✅ Program Deployment: Program account located
   • Executable: true
   • Owner: BPFLoaderUpgradeab1e11111111111111111111111
   • Lamports: 1141440
   • Data Size: 36 bytes

✅ Web3 Client: Client operations succeeded
   • Program: 9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu
   • Registry PDA: D7W1MAVmEQJjn2yKDZTgy9m5SV2HV3BsTqCdmYT48uXd
   • Subscription PDA: Fsx4fpztgydU9zKxNj3UE46E3AWcVVAzVdJmeAJwdP6y
   • Latest Blockhash: FWQP9814PAE3UB5W...
   • Rent (128 bytes): 1781760 lamports

✅ API /health: Health endpoint OK
   • Network: devnet
   • Program: 9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu

✅ API /dashboard: Dashboard endpoint responded
   • Subscriptions: 0
   • Top tokens: 0

✅ API /subscribe: Subscription endpoint responded
   • Subscription ID: 1
   • Signature: mock

✅ Passed: 6
❌ Failed: 0

E2E verification complete. Environment ready.
```

## Troubleshooting

### "fetch failed" errors

**Problem:** API tests fail with `fetch failed`

**Solution:**
1. Ensure dev server is running: `npm run dev`
2. Wait for "Ready in X.XXs" message
3. Verify port 9002 is accessible
4. Re-run tests: `npm run test:e2e`

### "Cannot find module" errors

**Problem:** Test runner fails with module import errors

**Solution:**
- Tests use HTTP `fetch` to avoid importing Next.js modules
- Ensure you're running the latest version from git
- Check that `tests/e2e-runner.js` uses `fetch()` calls, not `require()`

### Program not found

**Problem:** Test 2 fails with "Program not found on Devnet"

**Solution:**
1. Verify `NEXT_PUBLIC_PROGRAM_ID` in `.env.local`
2. Check program exists on Solana Explorer (Devnet)
3. Ensure RPC URL is Devnet: `https://api.devnet.solana.com`

### RPC rate limits

**Problem:** Tests timeout or fail intermittently

**Solution:**
- Use a dedicated RPC endpoint (Helius, QuickNode, etc.)
- Add retry logic (already implemented in client)
- Increase timeout values if needed

## Next Steps

After E2E tests pass:
1. ✅ Commit test results
2. ✅ Proceed with x402 hackathon requirements
3. ✅ Test x402 payment flow with real signatures
4. ✅ Integrate Switchboard Oracle for premium tier
5. ✅ Document usage examples for submission

## Related Documentation

- **Manual Testing:** `docs/E2E_QUICK_START.md`
- **Test Checklist:** `docs/E2E_TEST_CHECKLIST.md`
- **Full Guide:** `docs/E2E_TESTING_GUIDE.md`
