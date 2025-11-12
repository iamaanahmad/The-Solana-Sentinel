# Environment Configuration Guide

This document lists every environment variable required for the Solana Sentinel x402 integration, why it matters, and how to obtain or generate correct values. Keep all secrets out of version control—store them in `.env.local`, Doppler, 1Password, or your preferred secret manager.

## Core Solana + x402 Variables

| Variable | Required | Description | How to Get / Generate |
|----------|----------|-------------|------------------------|
| `X402_RECIPIENT_ADDRESS` | ✅ | Solana address that collects USDC payments from x402 clients. All payment headers must target this exact address. | Use the keypair that controls the Sentinel treasury: <br>1. `solana-keygen new --outfile keys/x402-recipient.json --no-bip39-passphrase` <br>2. `solana-keygen pubkey keys/x402-recipient.json` → copy the 44-character address.<br>3. Fund the wallet with USDC/SOL on the cluster you deploy to. |
| `SENTINEL_RECEIPT_PRIVATE_KEY` | ✅ | Base58-encoded 64-byte Ed25519 secret key used to sign x402 receipts returned to clients. Downstream agents verify receipts with the corresponding public key. | You can reuse the recipient key or generate a dedicated signer: <br>1. `solana-keygen new --outfile keys/receipt-signer.json --no-bip39-passphrase` <br>2. Convert the JSON secret key (array of 64 integers) to base58: <br>`node -e "const bs58=require('bs58'); const key=require('./keys/receipt-signer.json'); console.log(bs58.encode(Buffer.from(key)));"` <br>3. Store the printed string (usually starts with `5K`/`6K`) in the env var. Never commit the JSON file. |
| `DEFAULT_REQUESTER_PUBKEY` | ⭕ | Optional fallback Solana wallet recorded as the requester when UI users do not provide a wallet. Helpful for staging/demo flows. | If you want a default, reuse the receipt signer or create another keypair: <br>1. `solana-keygen new --outfile keys/default-requester.json --no-bip39-passphrase` <br>2. `solana-keygen pubkey keys/default-requester.json` → copy the address. Leave unset to require clients to provide their own pubkey. |

> ℹ️ **Tip:** keep the raw `.json` keypair files in a `keys/` directory that is listed in `.gitignore`. Only the base58 string should enter your environment variables.

## Attestation + Switchboard

| Variable | Required | Description | How to Get / Generate |
|----------|----------|-------------|------------------------|
| `SENTINEL_ATTESTATION_KEY` | ⭕ | (Upcoming) Base58 secret key used to sign premium attestation payloads. You can reuse `SENTINEL_RECEIPT_PRIVATE_KEY` in early builds or rotate to a dedicated keypair for production. | Generate with `solana-keygen new` as above. |
| `SWITCHBOARD_API_KEY` | ⭕ | API key for the Switchboard On-Demand service when fetching premium oracle data. Required for premium tier analytics. | Sign in to the Switchboard dashboard → API Keys → create a new key. |

## Data Providers & External Services

| Variable | Required | Description | How to Get / Generate |
|----------|----------|-------------|------------------------|
| `HELIUS_API_KEY` | ✅ | RPC access key used for on-chain forensics (asset metadata, largest holders, supply). | Helius dashboard → Project → API Keys. Select the key scoped to the cluster you use. |
| `NOSANA_JOB_ID` | ⭕ | Identifier for the Nosana job that performs sentiment analysis. Without it the service falls back to mocked sentiment data. | Deploy a Nosana job and copy the job ID slug; set to `your-sentiment-job-id` to force mock mode. |
| `SWITCHBOARD_RPC_URL` | ⭕ | Optional override for Switchboard RPC endpoint if different from Solana RPC. | Provided by Switchboard when you configure on-demand feeds. |

## Persistence & Messaging

| Variable | Required | Description | How to Get / Generate |
|----------|----------|-------------|------------------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string used by the Prisma-style query helpers and migrations. | Compose either a local `postgres://user:pass@localhost:5432/sentinel` string or copy from your hosted Postgres provider (Neon, Supabase, RDS, etc.). |
| `REDIS_URL` / `REDIS_PASSWORD` | ✅/⭕ | Redis cache endpoint used for rate limiting, nonce tracking, and cached analyses. Include `REDIS_PASSWORD` if your provider issues one. | Use your Redis host connection string (e.g., `redis://default:password@host:6379`). |
| `TELEGRAM_BOT_TOKEN` | ⭕ | Token for the Telegram bot interface. Required once the bot features are enabled. | Talk to [@BotFather](https://t.me/BotFather) → `/newbot` → copy the generated token. |

## Running Locally

1. Duplicate `.env.example` (or create `.env.local`) and populate values from the tables above.
2. Export critical secrets into your shell session when running background workers: <br>`$env:SENTINEL_RECEIPT_PRIVATE_KEY="<base58-secret>"` (PowerShell) or `export SENTINEL_RECEIPT_PRIVATE_KEY=...` (bash/zsh).
3. Keep your `keys/` directory restricted (`chmod 600 keys/*.json`) and never share it in commits.

## Validation Checklist

- [ ] `solana config get` points to the intended cluster (`https://api.devnet.solana.com` for devnet).
- [ ] `solana airdrop 2 <X402_RECIPIENT_ADDRESS>` (devnet) succeeded so the wallet can pay transaction fees.
- [ ] `SENTINEL_RECEIPT_PRIVATE_KEY` decodes to 64 bytes: `node -e "const bs58=require('bs58'); console.log(bs58.decode(process.env.SENTINEL_RECEIPT_PRIVATE_KEY).length);"` → should log `64`.
- [ ] `DATABASE_URL` and `REDIS_URL` pass the provided `npm run db:test` checks.

Once everything validates, restart the Next.js dev server to pick up the new environment variables.
# Environment Configuration Guide

This document explains every environment variable required for the Solana Sentinel x402 integration, why it matters, and how to obtain or generate proper values that work on Solana devnet or mainnet. Keep all secrets out of version control—store them in a `.env.local`, Doppler, 1Password, or your preferred secret manager.

## Core Solana + x402 Variables

| Variable | Required | Description | How to Get / Generate |
|----------|----------|-------------|------------------------|
| `X402_RECIPIENT_ADDRESS` | ✅ | Solana address that receives USDC payments from x402 clients. All payment headers must target this address. | Use the keypair that controls the Sentinel treasury: <br>1. `solana-keygen new --outfile keys/x402-recipient.json --no-bip39-passphrase` <br>2. `solana-keygen pubkey keys/x402-recipient.json` → copy the 44-char address into the env var. <br>Ensure the wallet holds the SPL USDC mint you expect on devnet/mainnet. |
| `SENTINEL_RECEIPT_PRIVATE_KEY` | ✅ | Base58-encoded 64-byte Ed25519 secret key used to sign x402 receipts returned to clients. Verification relies on the matching public key shipped with the app. | You can reuse the same key as `X402_RECIPIENT_ADDRESS` or create a dedicated keypair: <br>1. `solana-keygen new --outfile keys/receipt-signer.json --no-bip39-passphrase` <br>2. Convert the JSON secret key (array of 64 integers) to base58: <br>`node -e "const bs58=require('bs58'); const key=require('./keys/receipt-signer.json'); console.log(bs58.encode(Buffer.from(key)));