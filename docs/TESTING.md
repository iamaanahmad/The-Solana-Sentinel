# Sentinel E2E Testing Guide

**Status:** Ready for Testing  
**Date:** November 12, 2025

## Quick Start

### 1. Start the Development Server
```bash
npm install  # if needed
npm run dev
```

Visit: http://localhost:3000

### 2. Connect Wallet
1. Click "Connect Wallet" in the top-right corner
2. Select "Phantom" wallet
3. Approve the connection in Phantom
4. Confirm network is set to **Devnet**

### 3. Test Program ID

Verify the program is loaded correctly:
```bash
# In browser console:
console.log(process.env.NEXT_PUBLIC_PROGRAM_ID)
// Should output: 9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu
```

## Test Scenarios

### Test 1: Initialize Registry
**Goal:** Create the user's alert registry PDA

**Steps:**
1. Navigate to `/dashboard` or main page
2. Find "Initialize Registry" button (or similar)
3. Click and approve transaction in Phantom
4. Check Solana Explorer for transaction

**Expected Result:**
- ✅ Transaction succeeds
- ✅ PDA account created at deterministic address
- ✅ Status updates to "Registry Initialized"

**Verification:**
```bash
# Get user wallet address
const userAddress = "your-wallet-address"

# View registry PDA on Solana Explorer
https://explorer.solana.com/address/[PDA-ADDRESS]?cluster=devnet
```

---

### Test 2: Create Subscription
**Goal:** Create a new alert subscription

**Steps:**
1. Navigate to `/subscriptions` or similar
2. Fill in:
   - Token Mint: (e.g., `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenEb7` for USDC devnet)
   - Risk Threshold: 75 (0-100)
   - Price Threshold: 5 (percent change)
3. Click "Create Subscription"
4. Approve transaction in Phantom

**Expected Result:**
- ✅ Subscription created
- ✅ Stored on-chain
- ✅ Transaction visible in explorer
- ✅ Subscription status shows "Active"

**Explorer Check:**
```
https://explorer.solana.com/tx/[TRANSACTION-SIGNATURE]?cluster=devnet
```

---

### Test 3: Trigger Alert
**Goal:** Create an alert when thresholds are breached

**Steps:**
1. Navigate to `/alerts` or testing panel
2. Select an existing subscription
3. Click "Trigger Alert"
4. Fill in:
   - Current Risk Score: 85
   - Price Change: 6.5%
   - Alert Message: "USDC showing 6.5% price movement with high risk"
5. Approve transaction

**Expected Result:**
- ✅ Alert created with "Triggered" status
- ✅ Linked to correct subscription
- ✅ Timestamp recorded on-chain
- ✅ Event emitted and visible in logs

**Verification:**
Check on-chain events:
```bash
# Query program events
https://explorer.solana.com/tx/[TX_SIG]?cluster=devnet
# Should show "AlertTriggered" event in logs
```

---

### Test 4: Confirm Alert Delivery
**Goal:** Mark alert as successfully delivered

**Steps:**
1. Navigate to active alerts list
2. Select an alert with "Triggered" status
3. Click "Confirm Delivery"
4. Approve transaction

**Expected Result:**
- ✅ Alert status changes to "Delivered"
- ✅ Timestamp updated
- ✅ Transaction recorded on-chain

---

### Test 5: Update Subscription
**Goal:** Modify subscription thresholds

**Steps:**
1. Navigate to subscription details
2. Click "Edit" or "Update"
3. Change:
   - New Risk Threshold: 80
   - New Price Threshold: 7
4. Click "Save Changes"
5. Approve transaction

**Expected Result:**
- ✅ Subscription updated on-chain
- ✅ New thresholds take effect
- ✅ Event shows "SubscriptionUpdated"

---

### Test 6: Pause/Resume Subscription
**Goal:** Temporarily disable subscription

**Steps:**
1. Navigate to active subscription
2. Click "Pause Subscription"
3. Approve transaction

**Expected Result:**
- ✅ Status changes to "Paused"
- ✅ Alerts won't trigger for paused subscriptions
- ✅ Can click "Resume" to reactivate

---

### Test 7: Cancel Subscription
**Goal:** Permanently disable subscription

**Steps:**
1. Navigate to subscription details
2. Click "Cancel Subscription"
3. Confirm warning dialog
4. Approve transaction

**Expected Result:**
- ✅ Status changes to "Cancelled"
- ✅ Cannot trigger new alerts
- ✅ Event shows "SubscriptionCancelled"

---

## Transaction Verification

### Check Transaction on Solana Explorer

After each test, verify the transaction:

1. Copy transaction signature from Phantom confirmation
2. Visit: https://explorer.solana.com/tx/[SIGNATURE]?cluster=devnet
3. Verify:
   - ✅ Status is "Success"
   - ✅ Program ID matches: `9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu`
   - ✅ Logs show expected events
   - ✅ Accounts were modified correctly

### View Program on Explorer

Program Details: https://explorer.solana.com/address/9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu?cluster=devnet

Expected information:
- Program Authority: `EwrEb3sWWiaz7mAN4XaDiADcjmBL85Eiq6JFVXrKU7En`
- Status: **Active on Devnet**
- Data Size: ~283 KB

---

## Debugging Tips

### If wallet connection fails:
```javascript
// Check Phantom is installed
console.log(window.solana)

// Check network
solana.request({ method: 'solnet_chainId' })

// Should return: 'devnet'
```

### If transaction fails:
1. **Insufficient SOL:** Airdrop more test SOL
   ```bash
   solana airdrop 10
   ```

2. **Wrong Network:** Switch Phantom to Devnet

3. **Program not found:** Verify PROGRAM_ID in `.env.local`
   ```bash
   # Check it matches:
   9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu
   ```

### If on-chain state looks wrong:
1. Query account data via CLI:
   ```bash
   solana account [ACCOUNT_ADDRESS] --network devnet
   ```

2. Check program logs:
   ```bash
   solana logs [PROGRAM_ID] --network devnet
   ```

---

## Performance Testing

### Measure transaction times:
- **Transaction confirmation:** Should be <30 seconds on devnet
- **Block time:** Typically 400-800ms

### Monitor:
- Account state queries
- Event emissions
- Cross-instruction calls

---

## Known Issues & Workarounds

### Issue: "Program not found"
**Cause:** Program ID mismatch or network mismatch  
**Fix:** Verify `.env.local` and Phantom is on devnet

### Issue: Insufficient funds
**Cause:** Need SOL for deployment  
**Fix:** Use Devnet faucet or airdrop

### Issue: Stale RPC cache
**Cause:** Recent transactions not visible  
**Fix:** Wait 10-15 seconds or switch RPC endpoint

---

## Success Criteria

✅ **Test Coverage:**
- [x] Registry initialization
- [x] Subscription CRUD operations
- [x] Alert creation and status tracking
- [x] On-chain event emissions
- [ ] Integration with frontend UI
- [ ] Wallet connection flow
- [ ] Error handling
- [ ] Transaction rollback scenarios

---

## Next Steps After E2E Testing

1. ✅ Deploy program to Devnet (DONE)
2. ⏳ Run E2E tests (IN PROGRESS)
3. ⏳ Verify all transactions on-chain
4. ⏳ Deploy to Mainnet
5. ⏳ Integrate with frontend dashboard
6. ⏳ Create user documentation

---

**Program ID:** `9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu`  
**Network:** Solana Devnet  
**RPC:** https://api.devnet.solana.com  
**Status:** ✅ Ready for Testing
