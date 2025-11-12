# Branch Strategy

## Overview

The project uses two main branches to separate the core application from the experimental Phase 4.5 Solana blockchain integration:

### 🌿 `main` Branch
**Purpose:** Stable, production-ready codebase  
**Status:** Clean, unchanged from original deployment  
**Contents:**
- Original application infrastructure
- Phase 4.1-4.4 completed work (Rate Limiting, CLI, Frontend, Docs)
- No blockchain integration changes

**Last Commit:**
```
0e4b637 - feat: update dockerfile and build image
```

### 🚀 `x402` Branch
**Purpose:** Phase 4.5 Solana Sentinel blockchain integration  
**Status:** Active development with full on-chain program deployment  
**Contents:**
- **Smart Contract (Rust/Anchor)**
  - `programs/sentinel/` - Full Anchor program (543 lines)
  - Compiled to SBF bytecode (283KB)
  - Deployed to Solana Devnet: `9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu`

- **Web3 Integration**
  - `src/lib/web3-client.ts` - 13-method Web3.js SDK client
  - `src/components/web3-wallet.tsx` - Phantom wallet connection UI
  - `src/hooks/use-sentinel.ts` - React hooks for Web3 operations

- **Backend Services**
  - `src/services/` - Analysis, Payment, Attestation, Subscription, Switchboard, Telegram services
  - `src/app/api/` - RESTful endpoints for analysis, dashboards, webhooks

- **Configuration**
  - `Anchor.toml` - Anchor framework configuration with deployed PROGRAM_ID
  - `.env.local` - Environment variables with Solana RPC and network settings
  - `docs/ONCHAIN_PROGRAM.md` - Architecture documentation (700+ lines)
  - `DEPLOYMENT.md` - Deployment report with transaction verification
  - `docs/TESTING.md` - End-to-end testing guide (250+ lines)

**Last Commit:**
```
3b437c9 - feat(phase-4.5): Deploy Solana Sentinel program to Devnet
         31 files changed, 7676 insertions(+)
```

## Usage

### Switch to Main Branch (Stable)
```bash
git checkout main
```

### Switch to X402 Branch (Experimental)
```bash
git checkout x402
```

### View Branch Differences
```bash
git diff main x402 --stat
```

### Merge X402 into Main (When Ready for Production)
```bash
git checkout main
git merge x402 -m "merge: integrate Phase 4.5 Solana deployment"
```

## Key Metrics

| Metric | Value |
|--------|-------|
| **Program ID** | `9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu` |
| **Network** | Solana Devnet |
| **Binary Size** | 283 KB (SBF format) |
| **Smart Contract Lines** | 543 lines (Rust/Anchor) |
| **Web3 Client Methods** | 13 methods |
| **API Endpoints** | 11 endpoints |
| **Documentation** | 950+ lines (across 3 docs) |
| **Files Added in x402** | 31 files |
| **Lines of Code Added** | 7,676 lines |

## Next Steps

### On `x402` Branch:
1. ✅ Program deployed and verified on-chain
2. ⏳ Run E2E tests with Phantom wallet
3. ⏳ Validate transaction verification on Solana Explorer
4. ⏳ Test API endpoints with deployed program

### When Ready:
1. Thoroughly test all features on `x402`
2. Merge `x402` → `main` for production deployment
3. Tag release version (e.g., `v1.0.0-phase-4.5`)

## Development Workflow

### Adding Changes to X402
```bash
git checkout x402
git add src/your-changes
git commit -m "feat: your feature description"
git push origin x402
```

### Keeping Main Clean
```bash
git checkout main
# Make only critical hotfixes if needed
git push origin main
```

## Safety Notes

- ✅ Main branch remains untouched and deployable at any time
- ✅ X402 branch contains experimental blockchain integration
- ✅ Build artifacts (.so, target/) excluded via .gitignore
- ⚠️ .env.local committed to x402 (contains test credentials only)
- ⚠️ For production, move sensitive env vars to secure vaults

## Support

For branch-specific issues:
- **Main branch issues:** Core application problems
- **X402 branch issues:** Solana integration, Web3, blockchain-related

Run diagnostics:
```bash
# Check current branch
git branch -v

# Show branch history
git log --oneline -5

# Compare branches
git diff main x402 -- src/
```
