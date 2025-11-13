# End-to-End Testing Guide - Solana Sentinel

**Status:** 🚀 Ready for Testing  
**Program ID:** `9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu`  
**Network:** Solana Devnet  
**RPC:** https://api.devnet.solana.com  
**Explorer:** https://explorer.solana.com/?cluster=devnet

---

## Prerequisites Checklist

Before starting E2E tests, verify the following:

- [ ] **Phantom Wallet installed** and configured for Devnet
- [ ] **Devnet SOL available** (minimum 0.5 SOL for testing)
- [ ] **Browser console** open for debugging (F12)
- [ ] **Solana Explorer** tab open for verification
- [ ] **Program deployed** and verified on-chain
- [ ] **Environment variables** configured in `.env.local`
- [ ] **All API endpoints** responding (check `/api/health`)
- [ ] **Database** connected and migrations run
- [ ] **Redis cache** running (optional but recommended)

---

## Test Environment Setup

### 1. Verify Program Deployment

```bash
# Check program is deployed on Devnet
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getAccountInfo",
    "params": [
      "9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu",
      {"encoding": "base64"}
    ]
  }'

# Expected Response:
# - executable: true
# - lamports: > 0
# - owner: BPFLoaderUpgradeable program
```

### 2. Verify Application Startup

```bash
# Start the Next.js application
npm run dev

# Expected output:
# ▲ Next.js 14.x
# - Local:        http://localhost:3000
# - Environments: .env.local

# Navigate to http://localhost:3000 in browser
```

### 3. Verify API Connectivity

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-...",
#   "network": "devnet",
#   "program": "9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu"
# }
```

---

## E2E Test Scenarios

### Test 1: ✅ Wallet Connection

**Objective:** Verify Phantom wallet integration  
**Time:** 2-3 minutes  
**Critical:** YES (blocks all other tests)

**Steps:**

1. Open application at http://localhost:3000
2. Locate "Connect Wallet" button in top-right
3. Click "Connect Wallet"
4. Select "Phantom" from options
5. Phantom extension popup appears
6. Click "Connect" in Phantom
7. Select Devnet network if prompted
8. Return to application

**Expected Results:**

- ✅ Wallet address displays in top-right (e.g., `2k...abc`)
- ✅ Button text changes from "Connect" to wallet address
- ✅ Console shows: `[Web3] Wallet connected: 2k...abc`
- ✅ Page doesn't show error messages
- ✅ localStorage stores wallet connection state

**Verification on Solana Explorer:**

```
https://explorer.solana.com/address/<YOUR_WALLET_ADDRESS>?cluster=devnet
- Account exists: ✅
- Balance shown: ✅ (should have SOL)
- Transactions visible: ✅
```

**Pass Criteria:**
- [ ] Wallet address visible on screen
- [ ] No console errors
- [ ] Explorer shows account details

---

### Test 2: ✅ Create Subscription

**Objective:** Create new price alert subscription  
**Time:** 3-5 minutes  
**Dependencies:** Test 1 (wallet connected)

**Steps:**

1. Click "Create Subscription" button
2. In form:
   - **Token Mint:** `EPjFWaLb3bSsKUXUK94L2KEMMGiYNEvpNqpXbtEsFbaJ` (USDC)
   - **Low Threshold:** `0.98`
   - **High Threshold:** `1.02`
3. Click "Create" button
4. Phantom popup appears
5. Review transaction details in Phantom
6. Click "Approve" in Phantom
7. Wait for transaction confirmation

**Expected Results:**

- ✅ Transaction submitted (signature appears in console)
- ✅ Browser shows loading state
- ✅ Transaction confirms within 30 seconds
- ✅ Success notification appears: "Subscription created!"
- ✅ Subscription appears in dashboard
- ✅ Console shows: `[Subscription] Created with ID: X`

**Verification on Solana Explorer:**

```
Transaction URL: https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet

Expected:
- Status: ✅ Success
- Instructions: 1 (create_subscription)
- Accounts Modified:
  - Registry account (updated)
  - Subscription PDA (created)
  - Wallet account (pay fees)
```

**On-Chain Verification:**

```bash
# Check subscription account exists
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getAccountInfo",
    "params": ["<SUBSCRIPTION_PDA>", {"encoding": "base64"}]
  }'

# Should return account data with:
# - Lamports: >= 2039280 (rent exemption)
# - Data: subscription state
# - Owner: 9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu
```

**Pass Criteria:**
- [ ] Transaction confirms on-chain
- [ ] Subscription visible in UI
- [ ] Account created with correct data
- [ ] Fees deducted from wallet

---

### Test 3: ✅ View Subscription Details

**Objective:** Verify subscription data persists correctly  
**Time:** 1-2 minutes  
**Dependencies:** Test 2 (subscription created)

**Steps:**

1. Locate created subscription in dashboard
2. Click subscription card/row
3. View subscription details panel:
   - Token mint: `EPj...baJ` ✓
   - Low threshold: `0.98` ✓
   - High threshold: `1.02` ✓
   - Status: `Active` ✓
   - Created: timestamp ✓
4. Verify all fields match input

**Expected Results:**

- ✅ Subscription details accurate
- ✅ All thresholds displayed correctly
- ✅ Active status shown
- ✅ Timestamp reasonable (recent)

**API Verification:**

```bash
# Check subscription via API
curl http://localhost:3000/api/dashboard?wallet=<YOUR_WALLET>

# Should return subscription in list with exact values
```

**Pass Criteria:**
- [ ] Data displays correctly
- [ ] No data corruption
- [ ] Timestamp reasonable

---

### Test 4: ✅ Trigger Alert (Optional - Manual Price Spike)

**Objective:** Trigger price alert condition  
**Time:** 2-3 minutes  
**Dependencies:** Test 2 (subscription created)

**Note:** Requires actual price movement or manual trigger capability

**Steps:**

1. Monitor USDC price on subscription
2. Either:
   - **Wait for natural price movement** outside thresholds, OR
   - **Use Admin Trigger** button (if available in UI)
3. If manual trigger available:
   - Click "Trigger Alert" button
   - Phantom approves transaction
4. Wait for confirmation

**Expected Results (if triggered):**

- ✅ Alert created on-chain
- ✅ Alert marked as triggered in database
- ✅ Alert visible in "Recent Alerts" section
- ✅ Telegram notification sent (if configured)
- ✅ Console shows: `[Alert] Triggered for subscription X`

**Verification on Solana Explorer:**

```
Look for account with 8-byte discriminator matching alert pattern:
- Alert account created
- is_confirmed: false (initial state)
- triggered_at: current timestamp
```

**Pass Criteria:**
- [ ] Alert account created on-chain
- [ ] Status tracked correctly
- [ ] Timestamp recorded

---

### Test 5: ✅ Update Subscription Thresholds

**Objective:** Modify subscription parameters  
**Time:** 3-4 minutes  
**Dependencies:** Test 2 (subscription created)

**Steps:**

1. Click subscription to view details
2. Click "Edit" or "Update Thresholds" button
3. Change values:
   - **New Low:** `0.95`
   - **New High:** `1.05`
4. Click "Save Changes"
5. Phantom popup confirms transaction
6. Review and approve

**Expected Results:**

- ✅ Transaction submitted
- ✅ Confirmation within 30 seconds
- ✅ UI updates show new thresholds: `0.95` - `1.05`
- ✅ Success message: "Subscription updated!"
- ✅ Database record updated
- ✅ On-chain state changed

**Verification:**

```bash
# Query updated subscription via API
curl http://localhost:3000/api/dashboard?wallet=<YOUR_WALLET>

# Should show updated thresholds:
# - low_threshold: 0.95
# - high_threshold: 1.05
```

**On-Chain Verification:**

```
Explorer shows update_subscription instruction:
- Accounts Modified: subscription account
- Data changed: thresholds field updated
```

**Pass Criteria:**
- [ ] Transaction confirmed
- [ ] Thresholds updated in UI
- [ ] Database reflects changes
- [ ] On-chain state matches

---

### Test 6: ✅ Pause Subscription

**Objective:** Pause active subscription  
**Time:** 2-3 minutes  
**Dependencies:** Test 2 (subscription created)

**Steps:**

1. View subscription details
2. Click "Pause Subscription" button
3. Confirm action if prompted
4. Phantom approves transaction
5. Wait for confirmation

**Expected Results:**

- ✅ Transaction submitted
- ✅ Status changes to "Paused" in UI
- ✅ Success notification: "Subscription paused"
- ✅ On-chain state updated: `is_active: false`
- ✅ Pause timestamp recorded

**Verification:**

```bash
# Check subscription status via API
curl http://localhost:3000/api/dashboard?wallet=<YOUR_WALLET>

# Should show:
# - is_active: false
# - status: "paused"
```

**Pass Criteria:**
- [ ] Status changes to Paused
- [ ] No new alerts triggered
- [ ] Can be resumed later

---

### Test 7: ✅ Resume Subscription

**Objective:** Resume paused subscription  
**Time:** 2-3 minutes  
**Dependencies:** Test 6 (subscription paused)

**Steps:**

1. View paused subscription
2. Click "Resume Subscription" button
3. Phantom approves transaction
4. Wait for confirmation

**Expected Results:**

- ✅ Status changes back to "Active"
- ✅ Transaction confirmed on-chain
- ✅ Success message: "Subscription resumed"
- ✅ On-chain state: `is_active: true`

**Verification:**

```bash
# Check subscription status
curl http://localhost:3000/api/dashboard?wallet=<YOUR_WALLET>

# Should show:
# - is_active: true
# - status: "active"
```

**Pass Criteria:**
- [ ] Status returns to Active
- [ ] Alerts can trigger again

---

### Test 8: ✅ Cancel Subscription

**Objective:** Cancel and remove subscription  
**Time:** 2-3 minutes  
**Dependencies:** Test 2 (subscription created)

**Steps:**

1. View subscription details
2. Click "Cancel Subscription" button
3. Confirmation dialog appears
4. Click "Yes, Cancel"
5. Phantom approves final transaction
6. Wait for confirmation

**Expected Results:**

- ✅ Transaction submitted
- ✅ Subscription removed from UI
- ✅ Success message: "Subscription cancelled"
- ✅ On-chain state: `is_active: false` (cancelled)
- ✅ Dashboard no longer shows subscription
- ✅ SOL refund applied (rent exemption returned)

**Verification:**

```bash
# Subscription should no longer appear
curl http://localhost:3000/api/dashboard?wallet=<YOUR_WALLET>

# Old subscription ID should not be in list
```

**On-Chain Verification:**

```
Explorer shows cancel_subscription instruction:
- Account closed: subscription PDA
- SOL returned to wallet: ~2 SOL (rent exemption)
```

**Pass Criteria:**
- [ ] Subscription removed from UI
- [ ] Account closed on-chain
- [ ] SOL refunded to wallet
- [ ] Cannot retrieve deleted subscription

---

### Test 9: ✅ Multiple Subscriptions

**Objective:** Verify multiple subscriptions work independently  
**Time:** 5-7 minutes  
**Dependencies:** Tests 1-2

**Steps:**

1. Create first subscription:
   - Token: USDC (`EPj...baJ`)
   - Low: `0.98`, High: `1.02`

2. Create second subscription:
   - Token: USDT (`Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcP5Aq`)
   - Low: `0.99`, High: `1.01`

3. Create third subscription:
   - Token: SOL (`So11111111111111111111111111111111111111112`)
   - Low: `200`, High: `220`

4. Verify dashboard shows all 3

**Expected Results:**

- ✅ All 3 subscriptions visible
- ✅ Each maintains independent state
- ✅ Updating one doesn't affect others
- ✅ Pausing one doesn't pause others
- ✅ Registry shows `num_subscriptions: 3`

**On-Chain Verification:**

```bash
# Query registry account
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getProgramAccounts",
    "params": [
      "9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu",
      {
        "filters": [
          {"memcmp": {"offset": 0, "bytes": "<SUBSCRIPTION_DISCRIMINATOR>"}}
        ]
      }
    ]
  }'

# Should return 3 subscription accounts
```

**Pass Criteria:**
- [ ] All 3 subscriptions created
- [ ] Independent state management
- [ ] Registry count accurate

---

## Performance Verification

### Transaction Speed

| Operation | Expected Time | Max Acceptable |
| --- | --- | --- |
| Wallet Connection | < 2 seconds | 5 seconds |
| Subscription Create | 15-30 seconds | 45 seconds |
| Subscription Update | 15-30 seconds | 45 seconds |
| Subscription Pause | 15-30 seconds | 45 seconds |
| Subscription Resume | 15-30 seconds | 45 seconds |
| Subscription Cancel | 15-30 seconds | 45 seconds |

### API Response Times

| Endpoint | Expected | Max |
| --- | --- | --- |
| `/api/health` | < 100ms | 500ms |
| `/api/dashboard` | < 200ms | 1000ms |
| `/api/analyze` | < 500ms | 3000ms |
| `/api/subscribe` | < 2s | 5s |

---

## Error Handling Tests

### Test Phantom Rejection

**Steps:**

1. Click "Create Subscription"
2. In Phantom popup, click "Reject"
3. Return to app

**Expected:**

- ✅ Error shown: "Transaction rejected"
- ✅ No changes to state
- ✅ Can retry immediately

### Test Invalid Parameters

**Steps:**

1. Try to create subscription with:
   - Empty token mint
   - Low threshold > High threshold
   - Negative values

**Expected:**

- ✅ Form validation prevents submission
- ✅ Error messages shown: "Invalid value"

### Test Network Timeout

**Steps:**

1. Disable network (DevTools or browser)
2. Try to create subscription
3. Wait 30+ seconds

**Expected:**

- ✅ Timeout error shown
- ✅ User can retry
- ✅ No orphaned transactions

---

## Rollback Testing

### Test State Consistency

**Steps:**

1. Create subscription A
2. Create subscription B
3. Cancel subscription A
4. Refresh page
5. Verify only subscription B visible

**Expected:**

- ✅ State consistent after refresh
- ✅ Cancelled sub doesn't reappear
- ✅ Active sub still there

---

## Final Verification Checklist

Complete all tests and verify:

### Smart Contract
- [ ] Program deployed to correct address
- [ ] All instructions executable
- [ ] PDAs derived correctly
- [ ] Events emitted properly
- [ ] Accounts created with correct data
- [ ] Account rent-exempt

### Web3 Integration
- [ ] Phantom wallet connects
- [ ] Transactions signed correctly
- [ ] Signatures verified on-chain
- [ ] All 13 Web3 methods functional

### User Interface
- [ ] All buttons responsive
- [ ] Forms validate input
- [ ] Loading states show
- [ ] Error messages clear
- [ ] Dashboard updates real-time

### API Endpoints
- [ ] `/api/health` → 200 OK
- [ ] `/api/subscribe` → creates on-chain
- [ ] `/api/dashboard` → returns accurate data
- [ ] All endpoints documented

### Database
- [ ] PostgreSQL connected
- [ ] Tables exist and populated
- [ ] Migrations applied
- [ ] Data consistency maintained

### Explorer Integration
- [ ] Transactions appear on Explorer
- [ ] All accounts visible
- [ ] Event logs parseable
- [ ] Signatures match local

---

## Test Results Template

Use this template to record test results:

```markdown
# E2E Test Results - [DATE]

## Environment
- **Wallet:** [ADDRESS]
- **Network:** Devnet
- **Program:** 9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu
- **Start Time:** [TIME]
- **End Time:** [TIME]

## Test Summary
| Test | Status | Time | Notes |
|------|--------|------|-------|
| 1. Wallet Connection | ✅ PASS | 2m | No issues |
| 2. Create Subscription | ✅ PASS | 3m | Confirmed on-chain |
| 3. View Details | ✅ PASS | 1m | Data accurate |
| 4. Trigger Alert | ⏭️ SKIP | - | No price movement |
| 5. Update Subscription | ✅ PASS | 3m | Thresholds updated |
| 6. Pause Subscription | ✅ PASS | 2m | Status changed |
| 7. Resume Subscription | ✅ PASS | 2m | Active again |
| 8. Cancel Subscription | ✅ PASS | 2m | Removed from UI |
| 9. Multiple Subscriptions | ✅ PASS | 6m | All independent |

## Observations
- All transactions confirmed quickly
- No console errors
- Explorer verified all on-chain actions
- Performance meets requirements

## Issues Found
- None

## Recommendations
- Ready for mainnet deployment
- Consider adding transaction retry logic
- Monitor event parsing in production

## Sign Off
**Tester:** [NAME]
**Date:** [DATE]
**Status:** APPROVED ✅
```

---

## Troubleshooting

### "Wallet not connected"
- ✅ Check Phantom is installed
- ✅ Set Phantom to Devnet network
- ✅ Try disconnect/reconnect in Phantom
- ✅ Check browser console for errors

### "Transaction rejected"
- ✅ Verify Phantom set to Devnet
- ✅ Check wallet has SOL (minimum 0.5)
- ✅ Try transaction again
- ✅ Check program is deployed

### "Account not found"
- ✅ Verify program ID in `.env.local`
- ✅ Check Solana Explorer - program deployed?
- ✅ Ensure transaction confirmed (wait 10+ seconds)

### "Timeout waiting for confirmation"
- ✅ Check internet connection
- ✅ Verify RPC endpoint responsive: `curl https://api.devnet.solana.com`
- ✅ Try transaction again
- ✅ Check Solana network status

---

## Production Readiness Criteria

Before deploying to mainnet, verify:

✅ **All 9 tests pass** consistently  
✅ **No console errors** in any test  
✅ **Transactions confirmed** on Solana Explorer  
✅ **Performance meets SLAs** (see Performance table)  
✅ **Error handling works** for all edge cases  
✅ **Data consistency maintained** after restarts  
✅ **No security vulnerabilities** found  
✅ **Audit ready** - code reviewed and tested  

---

**E2E Testing Started:** [NOW]  
**Target Completion:** 2-3 hours  
**Status:** 🚀 READY TO EXECUTE

Good luck with testing! 🎯
