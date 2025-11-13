# E2E Testing - Quick Start Guide

**Status:** ✅ All components ready  
**Duration:** 2-3 hours  
**Goal:** Verify production readiness before hackathon submission

---

## 🚀 Get Started in 60 Seconds

### Step 1: Prepare Environment (5 min)

```bash
# Switch to x402 branch and pull latest
git checkout x402
git pull origin x402

# Install dependencies
npm install

# Verify setup
npx ts-node scripts/verify-e2e-environment.ts
```

Expected output: **All checks PASS ✅**

### Step 2: Start Application (2 min)

```bash
# Terminal 1: Start development server
npm run dev

# Wait for: "▲ Next.js X.X.X - Ready in X.XXs"
```

### Step 3: Open in Browser (1 min)

- URL: **http://localhost:3000**
- Check for errors: **Press F12** to open console
- Should see clean landing page

### Step 4: Connect Wallet (2 min)

1. Ensure Phantom wallet installed & set to **Devnet**
2. Click **"Connect Wallet"** button
3. Select **Phantom**
4. Approve in Phantom extension
5. See wallet address displayed ✅

---

## 🧪 Run 9 Test Scenarios

### Quick Test Script (Optional - Automated)

```bash
# Terminal 2: Run automated tests (if dependencies installed)
npm run test:e2e
```

Or follow **Manual Testing Below**

---

## 📋 Manual Test Scenarios

### Test 1-9: Follow This Pattern for Each

**Time per test:** 3-10 minutes

For each test below:
1. Follow the steps exactly
2. Note transaction signatures
3. Verify on Solana Explorer
4. Check results match expected values

---

### ✅ TEST 1: Wallet Connection (2-3 min)

**What:** Connect Phantom wallet  
**Why:** Foundation for all tests

**Steps:**
1. Click "Connect Wallet"
2. Select Phantom
3. Approve connection
4. See address in top-right

**Verify:**
- [ ] Address displays
- [ ] No console errors
- [ ] Can proceed to next test

**Explorer Check:**
```
https://explorer.solana.com/address/<YOUR_WALLET>?cluster=devnet
Should show: Account exists, has balance
```

---

### ✅ TEST 2: Create Subscription (3-5 min)

**What:** Create price alert for USDC  
**Why:** Core feature - test on-chain write

**Steps:**
1. Click "Create Subscription"
2. Fill form:
   - Token: `EPjFWaLb3bSsKUXUK94L2KEMMGiYNEvpNqpXbtEsFbaJ`
   - Low: `0.98`
   - High: `1.02`
3. Click "Create"
4. Approve in Phantom
5. Wait for confirmation

**Verify:**
- [ ] Transaction confirms (< 30 sec)
- [ ] Subscription appears in dashboard
- [ ] Status shows "Active"

**Explorer Check:**
```
https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
Should show: Success ✅, create_subscription instruction
```

**Note:** Save signature: `________________________`

---

### ✅ TEST 3: View Subscription Details (1-2 min)

**What:** Display subscription data correctly  
**Why:** Verify data retrieved from chain

**Steps:**
1. Click created subscription
2. View details panel

**Verify:**
- [ ] Token: `EPj...baJ` ✓
- [ ] Low: `0.98` ✓
- [ ] High: `1.02` ✓
- [ ] Status: `Active` ✓

---

### ✅ TEST 4: Update Subscription (3-4 min)

**What:** Modify subscription thresholds  
**Why:** Test on-chain state updates

**Steps:**
1. Click subscription details
2. Click "Edit"
3. Change:
   - Low: `0.95`
   - High: `1.05`
4. Click "Save"
5. Approve in Phantom

**Verify:**
- [ ] Values update in UI immediately
- [ ] Transaction confirms
- [ ] New values: `0.95` - `1.05`

---

### ✅ TEST 5: Pause Subscription (2-3 min)

**What:** Disable subscription  
**Why:** Test pause functionality

**Steps:**
1. View subscription
2. Click "Pause"
3. Approve transaction

**Verify:**
- [ ] Status: `Paused`
- [ ] Button changes to "Resume"

---

### ✅ TEST 6: Resume Subscription (2-3 min)

**What:** Re-enable subscription  
**Why:** Test resume functionality

**Steps:**
1. View paused subscription
2. Click "Resume"
3. Approve transaction

**Verify:**
- [ ] Status: `Active`
- [ ] Button changes to "Pause"

---

### ✅ TEST 7: Cancel Subscription (2-3 min)

**What:** Delete subscription  
**Why:** Test account closure & cleanup

**Steps:**
1. View subscription
2. Click "Cancel"
3. Confirm action
4. Approve in Phantom

**Verify:**
- [ ] Subscription removed from UI
- [ ] SOL refund received (~2 SOL)

**Explorer Check:**
```
Should show: Account closed (lamports returned to wallet)
```

---

### ✅ TEST 8: Multiple Subscriptions (5-7 min)

**What:** Create 3 different subscriptions  
**Why:** Test registry tracking

**Create These:**

1. **USDC** - `EPjFWaLb3bSsKUXUK94L2KEMMGiYNEvpNqpXbtEsFbaJ`
   - Low: `0.98`, High: `1.02`
   - Sig: `________________________`

2. **USDT** - `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcP5Aq`
   - Low: `0.99`, High: `1.01`
   - Sig: `________________________`

3. **SOL** - `So11111111111111111111111111111111111111112`
   - Low: `200`, High: `220`
   - Sig: `________________________`

**Verify:**
- [ ] All 3 visible in dashboard
- [ ] Each maintains separate state
- [ ] Can modify each independently
- [ ] Registry count = 3

---

### ✅ TEST 9: Error Handling (5-10 min)

**Test 9a: Reject Transaction**

1. Try to create subscription
2. Click "Reject" in Phantom
3. See error: "Transaction rejected"
4. Verify no state change
5. Retry works immediately

**Test 9b: Form Validation**

1. Try create with empty token mint
2. Should see: "Invalid token"
3. Try with low > high
4. Should see: "Low must be less than high"

**Verify:**
- [ ] All validation works
- [ ] Errors clear and helpful

---

## 📊 Performance Check

Time each operation (use browser timer or console):

| Operation | Target | Your Time | Status |
|-----------|--------|-----------|--------|
| Create Subscription | 15-30s | ___s | ✅/❌ |
| Update Subscription | 15-30s | ___s | ✅/❌ |
| Pause Subscription | 15-30s | ___s | ✅/❌ |
| Cancel Subscription | 15-30s | ___s | ✅/❌ |

**Target:** All < 30 seconds ✅

---

## 🔍 Verification Checklist

After completing all tests, verify:

### Smart Contract ✅
- [ ] Program deployed at: `9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu`
- [ ] All instructions execute successfully
- [ ] Events emitted correctly
- [ ] Accounts created with right data

### Web3 Integration ✅
- [ ] Phantom wallet connects
- [ ] Transactions sign correctly
- [ ] All signatures valid
- [ ] 13 Web3 methods functional

### User Interface ✅
- [ ] All buttons work
- [ ] Forms validate input
- [ ] Loading states show
- [ ] Errors clear and actionable

### API Endpoints ✅
- [ ] `/api/health` returns 200
- [ ] `/api/subscribe` creates on-chain
- [ ] `/api/dashboard` returns accurate data
- [ ] All endpoints respond in < 1s

### On-Chain State ✅
- [ ] Transactions appear on Explorer
- [ ] Accounts visible and verified
- [ ] Signatures match locally
- [ ] Event logs parseable

---

## ✅ Final Sign-Off

When all 9 tests pass:

```markdown
# E2E Testing Complete ✅

- **Date:** [TODAY]
- **Tester:** [YOUR_NAME]
- **Tests Passed:** 9/9 ✅
- **Issues Found:** 0
- **Performance:** Meets SLAs ✅
- **Status:** PRODUCTION READY 🚀

Approved for:
- [ ] Hackathon submission
- [ ] Mainnet deployment
- [ ] Public use

Signature: ________________
```

---

## 📁 Test Documentation

All test artifacts saved to:

```
docs/
├── E2E_TESTING_GUIDE.md          ← Detailed test procedures
├── E2E_TEST_CHECKLIST.md         ← Comprehensive checklist
├── E2E_TEST_RESULTS_[DATE].md    ← Your test results
└── ...

tests/
└── e2e.test.ts                   ← Automated test suite
```

---

## 🚨 Troubleshooting

### "Wallet not connected"
```bash
✓ Check Phantom installed
✓ Set Phantom to Devnet
✓ Try disconnect/reconnect
✓ Clear browser cache
```

### "Transaction timeout"
```bash
✓ Check internet connection
✓ Verify RPC: curl https://api.devnet.solana.com
✓ Wait 10+ seconds for confirmation
✓ Check Phantom network settings
```

### "Program not found"
```bash
✓ Verify Program ID in .env.local
✓ Check on Explorer - is it deployed?
✓ Ensure on Devnet (not mainnet)
```

### "Account not found"
```bash
✓ Transaction may still confirming
✓ Wait 30+ seconds
✓ Check Solana network status
✓ Verify RPC endpoint responsive
```

---

## 📞 Support

If you encounter issues:

1. **Check console (F12)** for error messages
2. **Search code** for related functionality
3. **Review git log** for recent changes
4. **Ask for help** on x402 channel

---

## 🎯 Success Criteria

✅ **ALL of these must be true:**

- [ ] 9/9 test scenarios pass
- [ ] All transactions confirm on-chain
- [ ] No console errors in browser
- [ ] Explorer verifies all accounts
- [ ] Performance within SLAs
- [ ] No security issues found
- [ ] Data consistency maintained
- [ ] Can run tests multiple times

**Result:** PRODUCTION READY 🚀

---

## 📝 Log Results

### Summary Template

```markdown
# E2E Test Results - [DATE]

**Tester:** [NAME]
**Duration:** [X hours Y minutes]
**Environment:** Devnet, Phantom, Chrome/Firefox

**Test Results:**
1. Wallet Connection: ✅
2. Create Subscription: ✅
3. View Details: ✅
4. Update Subscription: ✅
5. Pause: ✅
6. Resume: ✅
7. Cancel: ✅
8. Multiple Subscriptions: ✅
9. Error Handling: ✅

**Overall:** ✅ ALL PASS

**Performance:** Within SLAs ✅

**Issues Found:** None

**Status:** APPROVED FOR PRODUCTION ✅
```

---

## 🎉 Next Steps

After successful testing:

1. **Commit results:**
   ```bash
   git add docs/E2E_TEST_RESULTS_[DATE].md
   git commit -m "docs(e2e): Testing complete - production ready"
   git push origin x402
   ```

2. **Update tasks.md:**
   - Mark "E2E Testing" as ✅ COMPLETE
   - Update Phase 5 status to COMPLETE
   - Score should increase to 420+/500

3. **Prepare for submission:**
   - Create mainnet deployment plan
   - Document all test evidence
   - Archive test logs
   - Prepare presentation

4. **Deploy to mainnet** (after hackathon approval):
   - Verify all credentials
   - Deploy smart contract to mainnet
   - Update frontend configuration
   - Enable production endpoints

---

## 📚 Related Documentation

- **Full Testing Guide:** `docs/E2E_TESTING_GUIDE.md`
- **Detailed Checklist:** `docs/E2E_TEST_CHECKLIST.md`
- **Deployment Guide:** `DEPLOYMENT.md`
- **Architecture Docs:** `docs/ONCHAIN_PROGRAM.md`

---

**Start Testing Now! ⏱️**

Estimated Time: **2-3 hours**  
Expected Result: **✅ APPROVED FOR PRODUCTION**

Let's go! 🚀
