# Setting X402 as Default Branch on GitHub

## Overview

You have three branches:
- **master** (currently default on GitHub)
- **main** (old codebase, unchanged)
- **x402** (your Phase 4.5 Solana hackathon project)

**Goal:** Make `x402` the default branch so visitors see your latest work first.

---

## Step-by-Step Guide to Change Default Branch

### Method 1: Via GitHub Web Interface (Recommended & Easiest)

#### 1. Go to Repository Settings
- Visit: https://github.com/iamaanahmad/The-Solana-Sentinel
- Click the **Settings** tab (you may need to scroll right)

#### 2. Find Default Branch Settings
- On the left sidebar, click **Branches**
- You'll see "Default Branch" section at the top

#### 3. Change Default Branch
- Click the dropdown that currently shows **master**
- Select **x402** from the list
- Click **Update** button
- GitHub will ask for confirmation - click **I understand, update the default branch**

#### 4. Verify the Change
- Go back to your repository main page
- You should now see the `x402` branch content displayed

---

## Step-by-Step Guide Via Command Line

If you prefer command line or want to do it programmatically:

### Note
You cannot directly change the default branch via git commands. However, you can:

1. **Ensure all branches are pushed:**
```powershell
git push -u origin main
git push -u origin x402
```

2. **Then use GitHub CLI (if installed):**
```powershell
gh repo edit --default-branch x402
```

Or manually through the web interface (Method 1 above).

---

## Branch Structure After Change

```
GitHub Repository View:
┌─────────────────────────────────┐
│ The-Solana-Sentinel             │
├─────────────────────────────────┤
│ Default Branch: x402 ← NEW!     │
├─────────────────────────────────┤
│ Branches:                       │
│ • x402 (DEFAULT) ✓ ← This shows first
│ • main (old codebase)
│ • master (historical)
└─────────────────────────────────┘
```

---

## What This Means

### Public Visitors See:
- ✅ The complete Phase 4.5 Solana Sentinel project
- ✅ Deployed smart contract code
- ✅ Web3 integration
- ✅ All API endpoints
- ✅ Comprehensive documentation
- ✅ Your hackathon work prominently displayed

### Maintaining Old Code:
- ✅ `main` branch remains unchanged
- ✅ Any historical code stays in `master`
- ✅ Easy to switch between versions
- ✅ Both are still accessible if someone explicitly checks them out

---

## Current Branch Contents

### x402 (Will be Default) 🚀
```
Features:
✅ Solana Anchor program (543 lines)
✅ SBF compiled to 283KB binary
✅ Deployed to Devnet: 9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu
✅ Web3.js client (13 methods)
✅ Phantom wallet integration
✅ 11 REST API endpoints
✅ Payment & subscription services
✅ Telegram webhooks
✅ Database migrations
✅ CLI tool
✅ Rate limiting middleware
✅ Comprehensive documentation (950+ lines)

Status: Production-ready, Devnet verified
Files: 56 new files
Lines of Code: 14,429 lines added
```

### main (Stays as is)
```
Features:
- Original stable codebase
- Phase 4.1-4.4 work
- No blockchain changes
- Clean, unchanged state

Status: Stable baseline
```

---

## GitHub URL Changes

**Before:**
```
https://github.com/iamaanahmad/The-Solana-Sentinel
→ Shows master branch content
```

**After:**
```
https://github.com/iamaanahmad/The-Solana-Sentinel
→ Shows x402 branch content (your hackathon project!)
```

---

## Switching Between Branches Locally

### View All Branches
```powershell
git branch -a
# Shows: main, x402, master
```

### Switch to X402
```powershell
git checkout x402
```

### Switch to Main
```powershell
git checkout main
```

### See Differences
```powershell
git diff main x402 --stat
```

---

## Important Notes

✅ **Safe:** Changing the default branch doesn't delete anything
✅ **Reversible:** You can change it back anytime
✅ **All History Preserved:** All branches remain accessible
✅ **CI/CD:** Any GitHub Actions will run against the new default
✅ **PRs:** New pull requests will use x402 as the base (if applicable)

---

## After Changing Default Branch

### What Happens:
1. ✅ GitHub clones will use `x402` by default
2. ✅ Repository README shows x402 branch content
3. ✅ Issues and discussions reference x402
4. ✅ GitHub Pages (if enabled) builds from x402
5. ✅ Visitors see your hackathon project first

### What Doesn't Change:
- ❌ Git history (all commits remain)
- ❌ Other branches (main and master still exist)
- ❌ Release tags (if any)
- ❌ Existing clones on local machines (they still track their original branch)

---

## Quick Summary

| Action | How |
|--------|-----|
| **Change Default** | Settings → Branches → Select x402 → Update |
| **View x402** | https://github.com/iamaanahmad/The-Solana-Sentinel/tree/x402 |
| **Compare Branches** | https://github.com/iamaanahmad/The-Solana-Sentinel/compare/main...x402 |
| **Switch Locally** | `git checkout x402` |
| **See Differences** | `git diff main x402 --stat` |

---

## Visual Guide for GitHub UI

```
1. Click Settings tab
   ┌─────────────────┐
   │ < Code | Issues │ Discussions | Pull requests | ... | Settings |
   └─────────────────┘

2. Left sidebar → Click "Branches"
   ┌─────────────────────────────────────┐
   │ Code and automation                 │
   │ • General                          │
   │ • Branches ← Click here            │
   │ • Protected branches               │
   │ • Rules                            │
   └─────────────────────────────────────┘

3. Change default branch
   ┌────────────────────────────────────────┐
   │ Default branch                         │
   │ The base branch for pull requests and  │
   │ code commits                           │
   │                                        │
   │ [master ▼] → Change to [x402 ▼]      │
   │              [Update]                 │
   └────────────────────────────────────────┘

4. Confirm change
   ┌────────────────────────────────────────┐
   │ ⚠️ Are you sure?                       │
   │ I understand, update the default       │
   │ branch. [Confirm]                      │
   └────────────────────────────────────────┘
```

---

## Done! ✅

After making the change:
- Your x402 branch becomes the default
- Visitors see your complete hackathon project
- Main branch stays preserved as historical reference
- All your work is prominently displayed

### Next Steps:
1. Go to https://github.com/iamaanahmad/The-Solana-Sentinel/settings/branches
2. Change the default branch to x402
3. Verify by visiting the main repo page
4. You should now see x402 content displayed!

---

**Questions?** You can always change it back or switch between branches without losing any code.
