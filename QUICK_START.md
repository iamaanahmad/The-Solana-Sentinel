# 🚀 Quick Start - Begin Deployment Now

## Current Status
✅ **Phase 1 & 2 Complete:** x402 core + attestation fully functional  
🎯 **Target:** 1st Prize (Best Trustless Agent)  
⏱️ **Timeline:** 2-3 days to 1st prize level  
📊 **Score:** 200/500 (40%) → Target 420+/500 (84%)

---

## What's Working Right Now
```
✅ POST /api/analyze
   - Basic tier: Free, instant results
   - Premium tier: 402 Payment Required with x402 validation
   - Returns: Analysis + Ed25519 signature receipt

✅ POST /api/verify-attestation
   - Validates Ed25519 signatures
   - Checks report integrity
   - Production-ready

✅ GET /api/test
   - Health check endpoint
   - Confirms all environment variables loaded

✅ Infrastructure
   - PostgreSQL: Connected and schema migrated
   - Redis: Running and responding to commands
   - Dev server: Turbopack on port 9002
   - All env vars configured
```

---

## What's Needed for 1st Prize (Next 48 Hours)

### MUST HAVE (Phase 3)
```
🔴 1. Subscription Service (4h)
   File: src/services/subscription.service.ts
   What: Create subscriptions, manage balances, deduct fees
   Why: Core to agent autonomy and recurring payments

🔴 2. Telegram Bot (6h)
   File: src/services/telegram.service.ts
   Commands: /analyze, /subscribe, /balance, /subscriptions, /history, /help
   Why: Makes Sentinel autonomous and user-friendly

🔴 3. /api/subscribe Endpoint (2h)
   File: src/app/api/subscribe/route.ts
   What: Accept subscription requests with x402 payment
   Why: Connects web API to subscription service

🔴 4. Switchboard Oracle (4h)
   File: src/services/switchboard.service.ts
   What: Monitor real-time price/liquidity feeds, trigger alerts
   Why: Required for Switchboard bounty + real-time alerts

🔴 5. Solana Program (3h)
   Directory: programs/sentinel/
   What: Anchor program for on-chain attestation storage
   Why: Makes it trustless - anyone can verify on-chain
```

### IMPORTANT (Phase 4)
```
🟠 6. Rate Limiting (1h)
   File: src/middleware/rate-limit.middleware.ts

🟠 7. CLI Tool (3h)
   Directory: cli/

🟠 8. Documentation (3h)
   Files: docs/API.md, README updates
```

### CRITICAL FOR SUBMISSION
```
🟠 9. Demo Video (1h)
   Show: analyze → payment → subscription → alert → verification
   Where: YouTube link in submission

🔴 10. End-to-End Testing (2h)
   Verify: Full subscription flow from Telegram to alert
```

---

## Recommended Start Order

### TODAY (4-6 hours)
**START with Task #1: Subscription Service**

Why? Everything else depends on it:
- Telegram bot uses it to create subscriptions
- Switchboard bot uses it to trigger alerts
- On-chain program uses it to verify ownership
- /api/subscribe endpoint returns subscriptionId from it

```bash
# Create the file
touch src/services/subscription.service.ts

# Then implement these 6 methods:
1. createSubscription(tokenAddress, thresholds, walletAddress) → subscriptionId
2. listUserSubscriptions(walletAddress) → subscription[]
3. updateSubscription(subscriptionId, newThresholds)
4. deactivateSubscription(subscriptionId)
5. deductFeeFromBalance(walletAddress, amount) → newBalance
6. checkBalance(walletAddress) → balance
```

Database schema needed:
```sql
-- In migrations/002_subscriptions.sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  wallet_address VARCHAR(44) NOT NULL,
  token_address VARCHAR(44) NOT NULL,
  max_risk_level INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_balances (
  wallet_address VARCHAR(44) PRIMARY KEY,
  prepaid_balance DECIMAL(20, 8),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscription_alerts (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  triggered_at TIMESTAMP DEFAULT NOW(),
  old_risk_level INT,
  new_risk_level INT
);
```

### THEN (2-3 hours)
**Task #3: Create /api/subscribe Endpoint**

This is simple - just calls SubscriptionService and validates x402 headers:

```typescript
// src/app/api/subscribe/route.ts
export async function POST(request: NextRequest) {
  const { tokenAddress, maxRiskLevel, xpayHeaders } = await request.json();
  
  // Validate x402 if Premium tier
  if (xpayHeaders?.tier === 'premium') {
    // Validate x402 headers...
  }
  
  // Create subscription
  const subscriptionId = await subscriptionService.createSubscription(
    tokenAddress,
    maxRiskLevel,
    walletAddress
  );
  
  return NextResponse.json({ subscriptionId, status: 'active' });
}
```

### THEN (1-2 hours)
**Task #2 Part 1: Basic Telegram Commands**

Start with just `/analyze` command:

```typescript
// src/services/telegram.service.ts
bot.onText(/\/analyze (.+)/, async (msg, match) => {
  const tokenAddress = match[1];
  const response = await analysisService.analyzeToken({
    tokenAddress,
    tier: 'basic'
  });
  bot.sendMessage(msg.chat.id, `Analysis: ${response.report.sentinelScore}`);
});
```

Then add `/balance`, `/subscriptions`, `/subscribe` one by one.

---

## File Template: Start Here

### Create `src/services/subscription.service.ts`

```typescript
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid';

export class SubscriptionService {
  async createSubscription(
    tokenAddress: string,
    maxRiskLevel: number,
    walletAddress: string
  ) {
    const subscriptionId = uuidv4();
    
    // Check balance
    const balance = await this.checkBalance(walletAddress);
    if (balance < 0.1) {
      throw new Error('Insufficient balance for subscription (0.1 USDC required)');
    }
    
    // Create subscription
    await db.query(
      `INSERT INTO subscriptions (id, wallet_address, token_address, max_risk_level)
       VALUES ($1, $2, $3, $4)`,
      [subscriptionId, walletAddress, tokenAddress, maxRiskLevel]
    );
    
    // Deduct fee
    await this.deductFeeFromBalance(walletAddress, 0.1);
    
    // Cache for quick lookup
    await cache.set(`sub:${subscriptionId}`, JSON.stringify({
      tokenAddress,
      maxRiskLevel,
      walletAddress,
      createdAt: new Date()
    }), 3600);
    
    return subscriptionId;
  }

  async checkBalance(walletAddress: string) {
    const result = await db.query(
      `SELECT prepaid_balance FROM user_balances WHERE wallet_address = $1`,
      [walletAddress]
    );
    return result.rows[0]?.prepaid_balance || 0;
  }

  async deductFeeFromBalance(walletAddress: string, amount: number) {
    const currentBalance = await this.checkBalance(walletAddress);
    const newBalance = currentBalance - amount;
    
    await db.query(
      `INSERT INTO user_balances (wallet_address, prepaid_balance)
       VALUES ($1, $2)
       ON CONFLICT (wallet_address) DO UPDATE SET prepaid_balance = $2`,
      [walletAddress, newBalance]
    );
    
    return newBalance;
  }

  // ... other methods
}
```

---

## Command Sequence to Start

```bash
# 1. Create subscription service
touch src/services/subscription.service.ts
# → Copy template above, implement 6 methods

# 2. Create migration for subscriptions
touch migrations/002_subscriptions.sql
# → Add CREATE TABLE statements

# 3. Run migration
npm run db:migrate

# 4. Test subscription service
npm run test -- src/services/subscription.service.ts

# 5. Create /api/subscribe endpoint
touch src/app/api/subscribe/route.ts

# 6. Create Telegram service
touch src/services/telegram.service.ts

# 7. Test full flow
npm run dev
# Then call POST /api/subscribe in another terminal
# Then test Telegram bot commands
```

---

## Success Looks Like

After today:
- ✅ Subscriptions working via API
- ✅ Telegram bot responds to /analyze and /balance
- ✅ Database tracks user subscriptions
- ✅ Balances deduct correctly for new subscriptions

After tomorrow:
- ✅ Switchboard feeds monitored in background
- ✅ Alerts triggered when thresholds crossed
- ✅ Solana program deployed with attestations
- ✅ CLI tool fully functional

After day 3:
- ✅ Demo video recorded and uploaded
- ✅ All documentation complete
- ✅ Full end-to-end test passing
- ✅ Rate limiting in place
- ✅ Ready for final 1st prize submission

---

## Quick Wins This Week

1. **Monday**: Subscription service + /api/subscribe + basic Telegram
   - **ROI:** Jumps from 40% to 60% completion
   - **Time:** 6-8 hours

2. **Tuesday**: Switchboard + Solana program + end-to-end test
   - **ROI:** Jumps from 60% to 80% completion
   - **Time:** 8-10 hours

3. **Wednesday**: Documentation + demo video + final polish
   - **ROI:** Jumps from 80% to 95%+ (1st prize tier)
   - **Time:** 4-6 hours

---

## Questions to Answer Before Starting

1. Do you have a Telegram bot token? (Get from @BotFather)
2. Do you want to deploy Solana program to devnet or testnet?
3. Do you have Switchboard oracle feeds you want to monitor?
4. What's your wallet address for testing?

---

## Let's Begin! 🎯

**Next step:** I'm ready to help you implement the Subscription Service. Ready to start Task #1?

Just say the word and I'll:
1. Create the service file with all template code
2. Create the database migrations
3. Create /api/subscribe endpoint
4. Create basic Telegram bot scaffold
5. Test everything works

**Estimate:** 2-3 hours to have Phase 3 foundation ready.

🚀 Ready?
