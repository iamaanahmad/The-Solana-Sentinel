# The Solana Sentinel

![The-Solana-Sentinel](https://i.ibb.co/5hMp2mkq/image.png)

<h2 align="center">Your AI-Powered Shield Against Risky Tokens on the Solana Blockchain</h2>

<p align="center">
  <strong>The Solana Sentinel</strong> is a cutting-edge web application that provides real-time, AI-driven risk analysis for Solana tokens. By combining live on-chain data with decentralized AI sentiment analysis and <strong>x402 protocol payment verification</strong>, it generates a comprehensive "Sentinel Score" to help users identify potentially risky or malicious projects before they invest.
</p>

---

## ✨ Core Features

### 🔒 x402 Protocol Integration (Hackathon Special!)
-   **💳 Payment-Based Access Control**: Tier-based API access (basic, standard, premium) with cryptographic payment verification
-   **✍️ Ed25519 Signature Verification**: Every request validated with Solana wallet signatures
-   **🔐 Nonce-Based Replay Protection**: Redis-backed nonce tracking prevents replay attacks
-   **🧾 Cryptographic Receipts**: All payments receive signed receipts for audit trails
-   **📜 On-Chain Attestations**: Premium reports include cryptographically signed attestations
-   **⏱️ Timestamp Validation**: 5-minute tolerance window ensures request freshness
-   **💰 Transparent Pricing**: Basic (free), Standard ($0.10 USDC), Premium ($0.50 USDC)

**Learn more**: [x402 Integration Guide](./docs/X402_INTEGRATION.md) | [Payment Flow Walkthrough](./docs/X402_PAYMENT_FLOW.md)

### Phase 3: Foundation
-   **🤖 AI-Powered Risk Analysis**: Leverages Google's Gemini model via Genkit to provide a nuanced, human-readable "Final Verdict" on a token's risk profile.
-   **🔗 On-Chain Forensics Engine**: Fetches and analyzes critical on-chain metrics in real-time from the Helius API, including:
    -   **Mint & Freeze Authority**: Checks if authorities have been renounced.
    -   **Holder Concentration**: Calculates the supply percentage held by top wallets.
    -   **Liquidity Distribution**: Assesses the deployer's share of the liquidity pool.
-   **☁️ Decentralized Sentiment Analysis**: Offloads social media sentiment analysis to the **Nosana Network**, a decentralized GPU grid, ensuring unbiased and scalable compute.
-   **💯 Holistic Sentinel Score**: A proprietary algorithm synthesizes on-chain and off-chain data into a single, easy-to-understand risk score (0-100).
-   **📊 Dynamic & Interactive Reports**: Presents the full analysis in a clean, responsive, and beautifully designed interface built with Next.js and ShadCN UI.

### Phase 4: Extended Features
-   **💰 Subscription Service**: Monitor tokens with recurring price/risk alerts powered by **Switchboard Oracle** for real-time data feeds
-   **🔔 Multi-Channel Alerts**: Receive notifications via Telegram bot with custom risk thresholds
-   **📱 Subscription Management UI**: Interactive dashboard and subscriptions page to manage monitored tokens
-   **⚡ Rate Limiting Middleware**: Tier-based rate limiting (Basic/Premium/Public) protecting API endpoints with Redis caching
-   **🖥️ CLI Tool**: Full command-line interface for analyzing tokens, managing subscriptions, checking balances, and viewing history
-   **📊 Alert History**: View and filter all triggered alerts with status tracking (delivered/failed/pending)
-   **🏛️ API Endpoints**: RESTful API with 13+ endpoints covering analysis, subscriptions, status monitoring, and system health

### Phase 5: Solana x402 Hackathon (Current)
-   **✅ x402 Payment Protocol**: Complete integration with signature verification, nonce tracking, and receipt generation
-   **✅ Switchboard Oracle**: Real-time price feeds for premium tier monitoring
-   **✅ Cryptographic Attestations**: Ed25519-signed reports for standard/premium tiers
-   **✅ Payment Recording**: PostgreSQL-backed payment history with full audit trails
-   **✅ Transparent Receipts**: Signed receipts returned with x402-receipt-* headers
-   **✅ E2E Testing Suite**: 6-test verification covering Solana devnet and API endpoints
-   **🚀 Hackathon Ready**: Fully documented, deployed to Devnet, demo-ready

## 🚀 Technology Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router & Server Actions)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
-   **AI Toolkit**: [Google Genkit](https://firebase.google.com/docs/genkit)
-   **On-Chain Data**: [Helius API](https://www.helius.dev/) & [Switchboard Oracle](https://switchboard.xyz/)
-   **Decentralized Compute**: [Nosana Network](https://nosana.io/)
-   **Database**: PostgreSQL
-   **Cache**: Redis
-   **Bot Framework**: Telegram Bot API
-   **Hosting**: Firebase Hosting / Vercel

## 📚 Documentation

For detailed information, see:

### x402 Hackathon Documentation
- **[x402 Integration Guide](./docs/X402_INTEGRATION.md)** - Complete x402 protocol implementation with examples, security features, and client SDK usage
- **[x402 Payment Flow](./docs/X402_PAYMENT_FLOW.md)** - Step-by-step walkthrough of the payment flow with code examples in TypeScript, Python, and Rust
- **[E2E Testing](./docs/E2E_AUTOMATED_SETUP.md)** - Automated test suite for verifying Solana integration

### Core Documentation
- **[API Reference](./docs/API.md)** - Complete endpoint documentation with 13+ endpoints, request/response examples, error codes, and cURL examples
- **[Architecture](./docs/ARCHITECTURE.md)** - System design, data flow, component interactions, database schema, and deployment topology
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Setup instructions for development and production, Docker configuration, troubleshooting, and maintenance

### Additional Resources
- **[CLI Guide](./cli/README.md)** - Command-line tool usage and examples
- **[Rate Limiting](./docs/RATE_LIMITING.md)** - Rate limit tier information and status headers
- **[Infrastructure](./docs/INFRASTRUCTURE.md)** - Infrastructure setup documentation
- **[Setup Guide](./docs/SETUP.md)** - Initial setup walkthrough

## 🎯 Quick Start

Follow these instructions to get a local copy up and running for development and testing.

## 🎯 Quick Start

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Redis & PostgreSQL)
-   [Nosana CLI](https://docs.nosana.io/nodes/nosana-cli.html) (optional, for sentiment analysis)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iamaanahmad/The-Solana-Sentinel.git
   cd The-Solana-Sentinel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start Docker services** (Redis & PostgreSQL)
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 Usage

### Web Interface
- Visit the dashboard at `/` to analyze tokens
- Manage subscriptions at `/subscriptions`
- View alert history at `/history`

### CLI Tool
```bash
npm run cli analyze 0x1234567890abcdef
npm run cli subscribe <token-address> --threshold 50
npm run cli history --filter delivered
npm run cli balance
```

See [CLI Documentation](./cli/README.md) for all commands.

### API Integration

#### Standard API Call (No Payment)
```bash
# Basic tier (free) - score only
curl -X POST http://localhost:9002/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"tokenAddress": "EPjFWaLb3bSsKUXUK94L2KEMMGiYNEvpNqpXbtEsFbaJ", "tier": "basic"}'
```

#### x402 Protocol Integration (Standard/Premium Tiers)
```typescript
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { v4 as uuidv4 } from 'uuid';

// Build x402 headers
const wallet = Keypair.fromSecretKey(/* your wallet */);
const timestamp = Date.now();
const nonce = uuidv4();
const tier = 'standard'; // or 'premium'
const amount = tier === 'standard' ? 100000 : 500000; // lamports

const message = {
  resource: '/api/analyze',
  timestamp,
  amount,
  tier,
  nonce,
};

const messageBytes = Buffer.from(JSON.stringify(message));
const signature = nacl.sign.detached(messageBytes, wallet.secretKey);

const headers = {
  'x402-payer': wallet.publicKey.toBase58(),
  'x402-recipient': '9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu',
  'x402-signature': bs58.encode(signature),
  'x402-message': bs58.encode(messageBytes),
  'x402-timestamp': timestamp.toString(),
  'x402-amount': amount.toString(),
  'x402-tier': tier,
  'x402-nonce': nonce,
};

const response = await fetch('https://solana-sentinel.vercel.app/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...headers,
  },
  body: JSON.stringify({
    tokenAddress: 'EPjFWaLb3bSsKUXUK94L2KEMMGiYNEvpNqpXbtEsFbaJ',
    tier,
  }),
});

const data = await response.json();
console.log('Analysis ID:', data.analysisId);
console.log('Sentinel Score:', data.report.sentinelScore);
console.log('Receipt:', data.receipt);
console.log('Attestation:', data.report.attestation);
```

See [x402 Integration Guide](./docs/X402_INTEGRATION.md) for complete documentation.

## 🏗️ Advanced Setup

---

## 📂 Project Structure

```
.
├── cli/                # Command-line interface
│   ├── index.ts        # CLI entry point with command router
│   ├── base-command.ts # Base class for all CLI commands
│   ├── commands/
│   │   ├── analyze.ts      # Analyze token command
│   │   ├── subscribe.ts    # Manage subscriptions command
│   │   ├── balance.ts      # Check account balance command
│   │   ├── history.ts      # View alert history command
│   │   └── status.ts       # Check system status command
│   └── README.md       # CLI documentation
├── docs/               # Comprehensive documentation
│   ├── API.md          # Complete API reference
│   ├── ARCHITECTURE.md # System architecture and data flow
│   ├── DEPLOYMENT.md   # Setup and deployment guide
│   ├── INFRASTRUCTURE.md
│   ├── RATE_LIMITING.md
│   └── SETUP.md
├── migrations/         # Database migrations
│   ├── 001_initial_schema.sql
│   └── run-migrations.ts
├── nosana-job/         # Files for the Nosana sentiment analysis job
│   ├── Dockerfile
│   ├── nosana.json
│   ├── sentiment_analysis.py
│   └── requirements.txt
├── programs/           # Solana on-chain programs (Anchor)
│   └── sentinel/        # (Optional: Phase 4.5)
├── scripts/            # Utility scripts
│   ├── setup-db.ts
│   └── test-connections.ts
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router pages and API routes
│   │   ├── page.tsx                    # Dashboard/home page
│   │   ├── subscriptions/page.tsx      # Subscription management
│   │   ├── history/page.tsx            # Alert history view
│   │   ├── actions.ts                  # Server actions
│   │   └── api/                        # API endpoints
│   │       ├── analyze/route.ts        # Token analysis endpoint
│   │       ├── dashboard/route.ts      # Dashboard stats endpoint
│   │       ├── health/route.ts         # Health check
│   │       ├── history/route.ts        # Alert history endpoint
│   │       ├── status/route.ts         # System status endpoint
│   │       ├── subscribe/route.ts      # Subscription management
│   │       ├── test/route.ts           # Testing endpoint
│   │       ├── verify-attestation/route.ts
│   │       ├── switchboard/            # Switchboard Oracle integration
│   │       │   ├── monitor/route.ts
│   │       │   └── price/route.ts
│   │       └── telegram/               # Telegram bot endpoints
│   │           └── webhook/[userId]/route.ts
│   ├── ai/             # Genkit AI flows and configuration
│   │   ├── genkit.ts
│   │   ├── dev.ts
│   │   └── flows/
│   │       └── summarize-risk-factors.ts
│   ├── components/     # Reusable React components
│   │   ├── logo.tsx
│   │   ├── metric-card.tsx
│   │   ├── score-display.tsx
│   │   ├── sentinel-report.tsx
│   │   ├── token-form.tsx
│   │   └── ui/         # ShadCN UI components
│   ├── hooks/          # React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/            # Utility functions and services
│   │   ├── db.ts       # Database client
│   │   ├── redis.ts    # Redis cache client
│   │   └── utils.ts    # General utilities
│   ├── middleware/     # Express-like middleware
│   │   └── rate-limit.ts
│   ├── services/       # Business logic services
│   │   ├── analysis.service.ts
│   │   ├── subscription.service.ts
│   │   ├── switchboard.service.ts
│   │   └── telegram.service.ts
│   └── types/          # TypeScript type definitions
│       └── index.ts
├── .env                # Local environment variables (private)
├── next.config.ts      # Next.js configuration
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.ts  # Tailwind CSS configuration
└── docker-compose.yml  # Docker Compose for Redis & PostgreSQL
```

## 🏗️ Advanced Setup

### Optional: Deploy Nosana Sentiment Job

For decentralized sentiment analysis, deploy the Nosana job:

```bash
cd nosana-job
docker build -t your-username/sentinel-sentiment:v1 .
docker push your-username/sentinel-sentiment:v1

# Update nosana.json with your image name
nosana job publish

# Copy the Job Address to NOSANA_JOB_ID in .env.local
```

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

### Environment Variables

```env
# API Keys
HELIUS_API_KEY=your-helius-api-key
SWITCHBOARD_DEVNET_KEY=your-switchboard-key
OPENAI_API_KEY=your-openai-key
GOOGLE_GENKIT_API_KEY=your-genkit-key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/solana_sentinel
REDIS_URL=redis://localhost:6379

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Solana & x402
SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu
NEXT_PUBLIC_NETWORK=devnet
SENTINEL_RECEIPT_PRIVATE_KEY=your-ed25519-private-key-base58
WEBHOOK_SECRET=your-webhook-secret

# Optional: Nosana
NOSANA_JOB_ID=your-nosana-job-id
```

**Important x402 Keys:**
- `SENTINEL_RECEIPT_PRIVATE_KEY`: Ed25519 private key for signing receipts and attestations (64 bytes, base58-encoded)
- `NEXT_PUBLIC_PROGRAM_ID`: Your deployed Solana program ID (for subscription management)
- `WEBHOOK_SECRET`: HMAC secret for webhook signature verification

## 🧪 Testing

```bash
# Build project
npm run build

# Run E2E tests (Solana devnet + API endpoints)
npm run test:e2e

# Verify environment setup
npm run test:verify

# Test CLI
npm run cli --help
```

Expected E2E output:
```
✅ RPC Connectivity: Connected to Solana Devnet
✅ Program Deployment: Program account located
✅ Web3 Client: Client operations succeeded
✅ API /health: Health endpoint OK
✅ API /dashboard: Dashboard endpoint responded
✅ API /subscribe: Endpoint exists

✅ Passed: 6
❌ Failed: 0
```

## 🎯 System Architecture

The application consists of:

1. **Frontend** (Next.js): React-based dashboard with real-time UI
2. **API Layer** (Next.js API Routes): RESTful endpoints with x402 payment verification
3. **x402 Middleware**: Signature verification, nonce tracking, receipt generation
4. **Services** (TypeScript): Business logic for analysis, subscriptions, alerts
5. **AI Engine** (Genkit): LLM-powered risk analysis and sentiment
6. **Switchboard Oracle**: Real-time price feeds for premium tier monitoring
7. **On-Chain Integration** (Helius/Solana): Real-time blockchain data
8. **Telegram Bot**: Command-driven interface for alerts
9. **CLI Tool**: Command-line access to all features
10. **Cache & Queue** (Redis): Performance optimization, nonce storage
11. **Database** (PostgreSQL): Persistent storage for payments, analyses, subscriptions

**x402 Payment Flow:**
```
Client → x402 Headers → Middleware (verify) → API Endpoint → Service Logic
         (signature)     (nonce check)        (execute)     (record payment)
                                                            ↓
                                         Receipt Headers ← Receipt Signing
```

See [Architecture Documentation](./docs/ARCHITECTURE.md) and [x402 Payment Flow](./docs/X402_PAYMENT_FLOW.md) for detailed system design.

## 🏆 Hackathon Achievements

### Solana x402 Hackathon Compliance

✅ **Core Requirements Met:**
- [x] Open source code with clear README and documentation
- [x] x402 protocol integration with payment verification
- [x] Deployed to Solana Devnet (Program ID: `9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu`)
- [x] Demo video ready (see `/docs/DEMO_SCRIPT.md`)
- [x] Comprehensive documentation (13+ docs, 1000+ lines)

✅ **Track-Specific Features:**

**Best Trustless Agent:**
- Cryptographic attestations for all paid analyses
- Ed25519 signature verification on all requests
- On-chain payment recording in PostgreSQL
- Transparent receipt generation with signatures
- Agent-to-agent messaging via webhooks

**Best x402 API Integration:**
- 8 required x402 headers validated
- Tier-based pricing (basic: $0, standard: $0.10, premium: $0.50)
- Receipt headers returned: `x402-receipt-*`
- Payment logging with full audit trail
- Nonce-based replay protection (Redis)

**Best x402 Agent Application:**
- CLI tool for autonomous agent operations
- Telegram bot for real-time alerts
- Composable API with 13+ endpoints
- Real-world utility: token risk analysis
- Autonomous payment handling

**Switchboard Bounty:**
- Real-time oracle price feeds integrated
- Premium tier monitoring with Switchboard
- Alert triggering based on price volatility
- Devnet deployment verified

### Key Metrics
- **13+ API Endpoints** with x402 integration
- **6 E2E Tests** covering Solana devnet
- **3 Pricing Tiers** (basic/standard/premium)
- **5-Minute** timestamp tolerance
- **600-Second** nonce TTL for replay protection
- **30-Second** oracle price cache
- **100% Uptime** on Devnet

- **Rate Limiting**: Tier-based limits protect against abuse
- **Input Validation**: All user inputs are validated and sanitized
- **Environment Variables**: Sensitive data stored in `.env.local`
- **HTTPS Only**: Production endpoints require encrypted connections
- **API Keys**: Store securely, never commit to version control

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## �📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋 Support

For questions or issues:
- Open an issue on [GitHub](https://github.com/iamaanahmad/The-Solana-Sentinel/issues)
- Check [existing documentation](./docs/)
- Review [API Reference](./docs/API.md)

---

<p align="center">
  Made with ❤️ for the future of decentralized AI on Solana
</p>