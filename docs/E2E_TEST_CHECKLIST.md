# E2E Testing Execution Checklist

**Project:** Solana Sentinel (x402 Hackathon)  
**Phase:** 5 - Final Deployment  
**Status:** 🚀 READY TO EXECUTE  
**Start Date:** [TODAY]  
**Target Duration:** 2-3 hours

---

## Pre-Test Checklist

Before starting any tests, complete these setup steps:

### 1. Environment Setup ✓

- [ ] **Clone latest code from x402 branch**
  ```bash
  git checkout x402
  git pull origin x402
  ```

- [ ] **Install dependencies**
  ```bash
  npm install
  ```

- [ ] **Build project**
  ```bash
  npm run build
  ```

- [ ] **Check .env.local exists**
  ```bash
  ls -la .env.local
  ```

- [ ] **Verify environment variables**
  ```bash
  grep NEXT_PUBLIC_PROGRAM_ID .env.local
  grep NEXT_PUBLIC_SOLANA_RPC_URL .env.local
  ```

### 2. Solana Setup ✓

- [ ] **Phantom wallet installed** in browser
- [ ] **Phantom set to Devnet network**
- [ ] **Devnet SOL available in wallet** (minimum 0.5)
  - Get faucet SOL: https://faucet.solana.com/
  - Or use SPL Faucet
- [ ] **Wallet address noted**: `______________________`

### 3. Application Startup ✓

- [ ] **Start Next.js development server**
  ```bash
  npm run dev
  ```
  - Wait for message: "▲ Next.js [version] - Ready in X.XXs"

- [ ] **Verify application loads**
  - Open: http://localhost:3000
  - See landing page without errors

- [ ] **Check browser console** (F12)
  - No red errors
  - May see blue/yellow warnings (OK)

### 4. Program Verification ✓

- [ ] **Run environment verification script**
  ```bash
  npx ts-node scripts/verify-e2e-environment.ts
  ```
  - All checks should PASS ✅
  - Document any WARNINGS ⚠️
  - No FAILURES ❌

- [ ] **Verify program on Solana Explorer**
  - URL: https://explorer.solana.com/address/9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu?cluster=devnet
  - Status: Executable ✅
  - Owner: BPFLoaderUpgradeable ✅

- [ ] **Check API health endpoint**
  ```bash
  curl http://localhost:3000/api/health
  ```
  - Response: `{"status":"ok",...}`

---

## Test Execution Log

For each test, follow this format and record results.

### TEST 1: Wallet Connection ✓

**Start Time:** `_____:_____ AM/PM`  
**Estimated Duration:** 2-3 minutes

**Steps Completed:**

- [ ] Step 1: Open http://localhost:3000
- [ ] Step 2: Click "Connect Wallet" button
- [ ] Step 3: Select Phantom
- [ ] Step 4: Approve in Phantom
- [ ] Step 5: Verify wallet address displayed

**Results:**

- [ ] Wallet address visible: `_____________________`
- [ ] No console errors: ✅ / ⚠️ / ❌
- [ ] localStorage has connection: ✅ / ❌

**Evidence:**

- [ ] Screenshot taken: `test-1-wallet-connection.png`
- [ ] Console log saved: (paste below)
  ```
  
  ```

**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL  
**End Time:** `_____:_____ AM/PM`

---

### TEST 2: Create Subscription ✓

**Start Time:** `_____:_____ AM/PM`  
**Estimated Duration:** 3-5 minutes

**Input Data:**

- Token Mint: `EPjFWaLb3bSsKUXUK94L2KEMMGiYNEvpNqpXbtEsFbaJ` (USDC)
- Low Threshold: `0.98`
- High Threshold: `1.02`

**Steps Completed:**

- [ ] Step 1: Click "Create Subscription" button
- [ ] Step 2: Fill form with above values
- [ ] Step 3: Click "Create" button
- [ ] Step 4: Approve in Phantom
- [ ] Step 5: Wait for confirmation

**Results:**

- [ ] Transaction signature: `_____________________________`
- [ ] Subscription created in UI: ✅ / ❌
- [ ] Status message shown: `_____________________`
- [ ] Database updated: ✅ / ❌

**Explorer Verification:**

- [ ] URL: `https://explorer.solana.com/tx/[SIGNATURE]?cluster=devnet`
- [ ] Status: Success ✅ / Failed ❌
- [ ] Instructions count: `_____`
- [ ] Accounts modified: `_____`

**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL  
**End Time:** `_____:_____ AM/PM`

---

### TEST 3: View Subscription Details ✓

**Start Time:** `_____:_____ AM/PM`  
**Estimated Duration:** 1-2 minutes

**Steps Completed:**

- [ ] Step 1: Locate created subscription in dashboard
- [ ] Step 2: Click subscription card
- [ ] Step 3: Verify all fields display

**Verification:**

- [ ] Token Mint matches: ✅ / ❌
- [ ] Low Threshold: `0.98` ✅ / ❌
- [ ] High Threshold: `1.02` ✅ / ❌
- [ ] Status: `Active` ✅ / ❌
- [ ] Created timestamp reasonable: ✅ / ❌

**Data Integrity Check:**

- [ ] API returns same data: ✅ / ❌
- [ ] No data corruption: ✅ / ❌

**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL  
**End Time:** `_____:_____ AM/PM`

---

### TEST 4: Update Subscription ✓

**Start Time:** `_____:_____ AM/PM`  
**Estimated Duration:** 3-4 minutes

**New Values:**

- New Low Threshold: `0.95`
- New High Threshold: `1.05`

**Steps Completed:**

- [ ] Step 1: Click subscription to view
- [ ] Step 2: Click "Edit" button
- [ ] Step 3: Update thresholds
- [ ] Step 4: Save changes
- [ ] Step 5: Approve in Phantom

**Results:**

- [ ] Transaction signature: `_____________________________`
- [ ] UI updated immediately: ✅ / ❌
- [ ] Low shows `0.95`: ✅ / ❌
- [ ] High shows `1.05`: ✅ / ❌

**Verification:**

- [ ] Database reflects changes: ✅ / ❌
- [ ] Explorer shows update instruction: ✅ / ❌

**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL  
**End Time:** `_____:_____ AM/PM`

---

### TEST 5: Pause Subscription ✓

**Start Time:** `_____:_____ AM/PM`  
**Estimated Duration:** 2-3 minutes

**Steps Completed:**

- [ ] Step 1: Click subscription details
- [ ] Step 2: Click "Pause" button
- [ ] Step 3: Confirm action
- [ ] Step 4: Approve in Phantom
- [ ] Step 5: Wait for confirmation

**Results:**

- [ ] Transaction signature: `_____________________________`
- [ ] Status changes to "Paused": ✅ / ❌
- [ ] Button text changes to "Resume": ✅ / ❌
- [ ] Success message shown: ✅ / ❌

**Verification:**

- [ ] On-chain state updated: ✅ / ❌
- [ ] No alerts triggered while paused: ✅ / ❌

**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL  
**End Time:** `_____:_____ AM/PM`

---

### TEST 6: Resume Subscription ✓

**Start Time:** `_____:_____ AM/PM`  
**Estimated Duration:** 2-3 minutes

**Steps Completed:**

- [ ] Step 1: With paused subscription visible
- [ ] Step 2: Click "Resume" button
- [ ] Step 3: Approve in Phantom
- [ ] Step 4: Wait for confirmation

**Results:**

- [ ] Transaction signature: `_____________________________`
- [ ] Status changes to "Active": ✅ / ❌
- [ ] Button text changes to "Pause": ✅ / ❌

**Verification:**

- [ ] On-chain state updated: ✅ / ❌
- [ ] Can trigger alerts again: ✅ / ❌

**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL  
**End Time:** `_____:_____ AM/PM`

---

### TEST 7: Cancel Subscription ✓

**Start Time:** `_____:_____ AM/PM`  
**Estimated Duration:** 2-3 minutes

**Steps Completed:**

- [ ] Step 1: Click subscription details
- [ ] Step 2: Click "Cancel" button
- [ ] Step 3: Confirm cancellation
- [ ] Step 4: Approve final transaction

**Results:**

- [ ] Transaction signature: `_____________________________`
- [ ] Subscription removed from UI: ✅ / ❌
- [ ] Success message shown: ✅ / ❌
- [ ] SOL refund received: ✅ / ❌

**Verification:**

- [ ] Account closed on-chain: ✅ / ❌
- [ ] Cannot retrieve deleted subscription: ✅ / ❌
- [ ] Explorer shows close instruction: ✅ / ❌

**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL  
**End Time:** `_____:_____ AM/PM`

---

### TEST 8: Multiple Subscriptions ✓

**Start Time:** `_____:_____ AM/PM`  
**Estimated Duration:** 5-7 minutes

**Subscriptions Created:**

1. **USDC** (EPj...baJ)
   - Low: `0.98`, High: `1.02`
   - Signature: `_____________________________`
   - Status: ✅ / ❌

2. **USDT** (Es9...q3U)
   - Low: `0.99`, High: `1.01`
   - Signature: `_____________________________`
   - Status: ✅ / ❌

3. **SOL** (So1...112)
   - Low: `200`, High: `220`
   - Signature: `_____________________________`
   - Status: ✅ / ❌

**Verification:**

- [ ] All 3 visible in dashboard: ✅ / ❌
- [ ] Independent operations work: ✅ / ❌
- [ ] Registry shows count = 3: ✅ / ❌

**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL  
**End Time:** `_____:_____ AM/PM`

---

## Performance Verification

### Transaction Times

| Operation | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Wallet Connect | < 2s | ___s | ✅ / ❌ |
| Create Sub | 15-30s | ___s | ✅ / ❌ |
| Update Sub | 15-30s | ___s | ✅ / ❌ |
| Pause Sub | 15-30s | ___s | ✅ / ❌ |
| Resume Sub | 15-30s | ___s | ✅ / ❌ |
| Cancel Sub | 15-30s | ___s | ✅ / ❌ |

**Performance Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL

### API Response Times

| Endpoint | Expected | Actual | Status |
|----------|----------|--------|--------|
| /api/health | < 100ms | ___ms | ✅ / ❌ |
| /api/dashboard | < 200ms | ___ms | ✅ / ❌ |
| /api/subscribe | < 2s | ___s | ✅ / ❌ |

**API Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL

---

## Error Handling Tests

### Test: Transaction Rejection

- [ ] Try to create subscription
- [ ] Click "Reject" in Phantom
- [ ] Error shown: ✅ / ❌
- [ ] No state change: ✅ / ❌
- [ ] Can retry: ✅ / ❌

**Status:** ✅ PASS / ❌ FAIL

### Test: Invalid Parameters

- [ ] Try to create with empty mint: ✅ / ❌ (blocked)
- [ ] Try with low > high: ✅ / ❌ (blocked)
- [ ] Try with negative values: ✅ / ❌ (blocked)

**Status:** ✅ PASS / ❌ FAIL

---

## Data Consistency Verification

- [ ] All transactions appear in history
- [ ] Wallet balance decreases by fees
- [ ] No duplicate subscriptions
- [ ] No lost state after refresh
- [ ] Database matches blockchain state

**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL

---

## Security Verification

- [ ] No SQL injection vulnerabilities: ✅ / ❌
- [ ] No XSS vulnerabilities: ✅ / ❌
- [ ] Proper authorization checks: ✅ / ❌
- [ ] Signatures verified correctly: ✅ / ❌
- [ ] No private keys exposed: ✅ / ❌

**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL

---

## Final Test Summary

### Overall Results

| Category | Passed | Failed | Status |
|----------|--------|--------|--------|
| Wallet Integration | __/1 | __ | ✅ / ❌ |
| Subscription CRUD | __/5 | __ | ✅ / ❌ |
| Multiple Subscriptions | __/1 | __ | ✅ / ❌ |
| Performance | __/1 | __ | ✅ / ❌ |
| Error Handling | __/3 | __ | ✅ / ❌ |
| Data Consistency | __/1 | __ | ✅ / ❌ |
| **TOTAL** | **__/12** | **__** | **✅ / ❌** |

### Critical Issues Found

```
Issue 1: _______________________________________________
  Severity: Critical / High / Medium / Low
  Impact: _______________________________________________
  Resolution: _______________________________________________

Issue 2: _______________________________________________
  Severity: Critical / High / Medium / Low
  Impact: _______________________________________________
  Resolution: _______________________________________________
```

### Recommendations

1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

---

## Sign-Off

**Testing Completed By:** `_____________________`

**Date:** `_____________________`

**Time:** `_____:_____ AM/PM` to `_____:_____ AM/PM`

**Total Duration:** `___` hours `___` minutes

**Environment:**

- Node Version: `_____________________`
- Browser: `_____________________`
- Wallet: Phantom v`_____________________`
- Network: Devnet ✅

**Approval Status:**

- [ ] All tests passed ✅
- [ ] Ready for mainnet deployment
- [ ] Ready for hackathon submission
- [ ] Recommended for production use

**Sign-Off Signature:**

_____________________

**Date:** `_____________________`

---

## Post-Test Cleanup

After all tests complete:

- [ ] Capture all console logs
- [ ] Export all transaction signatures
- [ ] Document all Explorer links
- [ ] Save test screenshots
- [ ] Backup test results
- [ ] Update tasks.md with completion
- [ ] Commit test results to x402 branch

```bash
# Commit test results
git add tests/ docs/
git commit -m "chore(e2e): Complete end-to-end testing - all scenarios verified"
git push origin x402
```

---

**E2E Testing Checklist - END**

---

## Additional Notes

Use this section for any observations during testing:

```
Notes:

_______________________________________________________________________

_______________________________________________________________________

_______________________________________________________________________

_______________________________________________________________________
```

---

**Good Luck! 🚀**

This is the final critical test before hackathon submission.  
All tests passing = Production Ready ✅  
Estimated 2-3 hours to complete all scenarios.

Start time: __________  
Target end time: __________  

Go forth and conquer! 💪
