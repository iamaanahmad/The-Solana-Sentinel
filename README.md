# The Solana Sentinel

![The-Solana-Sentinel](https://i.ibb.co/5hMp2mkq/image.png)

<h2 align="center">Your AI-Powered Shield Against Risky Tokens on the Solana Blockchain</h2>

<p align="center">
  <strong>The Solana Sentinel</strong> is a cutting-edge web application that provides real-time, AI-driven risk analysis for Solana tokens. By combining live on-chain data with decentralized AI sentiment analysis and <strong>x402 protocol payment verification</strong>, it generates a comprehensive "Sentinel Score" to help users identify potentially risky or malicious projects before they invest.
</p>

---

## ✨ Key Features

### 🔒 x402 Protocol Integration
-   **💳 Payment-Based Access Control**: Tier-based API access (basic, standard, premium) with cryptographic payment verification
-   **✍️ Ed25519 Signature Verification**: Every request validated with Solana wallet signatures
-   **🔐 Nonce-Based Replay Protection**: Redis-backed nonce tracking prevents replay attacks
-   **🧾 Cryptographic Receipts**: All payments receive signed receipts for audit trails
-   **📜 On-Chain Attestations**: Premium reports include cryptographically signed attestations
-   **⏱️ Timestamp Validation**: 5-minute tolerance window ensures request freshness
-   **💰 Transparent Pricing**: Basic (free), Standard ($0.10 USDC), Premium ($0.50 USDC)

**Learn more**: [x402 Integration Guide](./docs/X402_INTEGRATION.md) | [Payment Flow Walkthrough](./docs/X402_PAYMENT_FLOW.md)

### 🤖 AI-Powered Analysis
-   **Risk Scoring**: Leverages Google's Gemini model via Genkit to provide comprehensive risk analysis with a proprietary 0-100 scoring system
-   **On-Chain Forensics**: Real-time analysis of mint/freeze authority, holder concentration, and liquidity distribution via Helius API
-   **Decentralized Sentiment**: Social media sentiment analysis powered by Nosana Network's decentralized GPU grid
-   **Dynamic Reports**: Clean, responsive interface with interactive visualizations built with Next.js and ShadCN UI

### 🔔 Monitoring & Alerts
-   **Real-Time Monitoring**: Track tokens with recurring price/risk alerts powered by Switchboard Oracle
-   **Multi-Channel Notifications**: Telegram bot integration with customizable risk thresholds
-   **Alert History**: Comprehensive tracking of all triggered alerts with delivery status
-   **Subscription Management**: Interactive dashboard for managing monitored tokens

### 🛠️ Developer Tools
-   **RESTful API**: 13+ endpoints for analysis, subscriptions, and system health monitoring
-   **CLI Tool**: Full command-line interface for token analysis, subscription management, and balance checking
-   **Rate Limiting**: Tier-based protection with Redis caching
-   **E2E Testing**: Comprehensive test suite covering Solana devnet and API endpoints

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

### Core Documentation
- **[x402 Integration Guide](./docs/X402_INTEGRATION.md)** - Complete x402 protocol implementation with examples and security features
- **[x402 Payment Flow](./docs/X402_PAYMENT_FLOW.md)** - Step-by-step payment flow with code examples in TypeScript, Python, and Rust
- **[API Reference](./docs/API.md)** - Complete endpoint documentation with request/response examples and error codes
- **[Architecture](./docs/ARCHITECTURE.md)** - System design, data flow, and component interactions
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Setup instructions for development and production

### Additional Resources
- **[E2E Testing](./docs/E2E_AUTOMATED_SETUP.md)** - Automated test suite for Solana integration
- **[CLI Guide](./cli/README.md)** - Command-line tool usage and examples
- **[Infrastructure](./docs/INFRASTRUCTURE.md)** - Infrastructure setup documentation
- **[Setup Guide](./docs/SETUP.md)** - Initial setup walkthrough

## 🎯 Quick Start

### Prerequisites

-   [Node.js](https://nodejs.org/) v18 or later
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Redis & PostgreSQL)
-   [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (optional, for wallet operations)
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

   Open [http://localhost:9002](http://localhost:9002) in your browser.

## 🎮 Usage

### Web Interface
1. **Dashboard** (`/`) - Analyze token risk and view system stats
2. **Subscriptions** (`/subscriptions`) - Manage real-time monitoring
3. **History** (`/history`) - View triggered alerts and analysis history

### CLI Tool
```bash
# Analyze a token
npm run cli analyze <token-address>

# Create subscription
npm run cli subscribe <token-address> --threshold 50

# View history
npm run cli history

# Check balance
npm run cli balance
```

See [CLI Documentation](./cli/README.md) for complete command reference.

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

## ⚙️ Configuration

### Environment Variables

```env
# Required: API Keys
HELIUS_API_KEY=your-helius-api-key
GOOGLE_GENAI_API_KEY=your-genkit-key

# Required: Database
DATABASE_URL=postgresql://user:password@localhost:5432/solana_sentinel
REDIS_URL=redis://localhost:6379

# Required: Solana & x402
SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=9bVhqoVh2wGa31AssuodP3QH7jJ8QYX27BerAham6Gsu
NEXT_PUBLIC_NETWORK=devnet
SENTINEL_RECEIPT_PRIVATE_KEY=your-ed25519-private-key-base58
X402_PAYMENT_RECIPIENT=your-payment-recipient-pubkey

# Optional: Additional Services
SWITCHBOARD_API_KEY=your-switchboard-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
NOSANA_JOB_ID=your-nosana-job-id
WEBHOOK_SECRET=your-webhook-secret
```

**Important Configuration Notes:**
- `SENTINEL_RECEIPT_PRIVATE_KEY`: Ed25519 private key for signing receipts (64 bytes, base58-encoded)
- `X402_PAYMENT_RECIPIENT`: Solana wallet address for receiving USDC payments
- See [Environment Guide](./docs/environment.md) for detailed configuration instructions

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

## 🏗️ System Architecture

The application consists of:

1. **Frontend** (Next.js): React-based dashboard with real-time UI
2. **API Layer**: RESTful endpoints with x402 payment verification
3. **x402 Middleware**: Signature verification, nonce tracking, receipt generation
4. **Business Services**: Analysis, subscription management, alert dispatching
5. **AI Engine** (Genkit): LLM-powered risk analysis with Gemini
6. **Switchboard Oracle**: Real-time price feeds for monitoring
7. **Blockchain Integration**: Helius API for on-chain data
8. **Telegram Bot**: Command-driven interface for alerts
9. **CLI Tool**: Command-line access to all features
10. **Cache Layer** (Redis): Performance optimization, nonce storage
11. **Database** (PostgreSQL): Persistent storage for all data

**Payment Flow:**
```
Client → x402 Headers → Middleware → API Endpoint → Service
         (signature)    (verify)      (execute)     (process)
                                                        ↓
                                         Response ← Receipt
```

See [Architecture Documentation](./docs/ARCHITECTURE.md) for detailed system design.

## 🔒 Security

- **Rate Limiting**: Tier-based limits protect against abuse
- **Input Validation**: All inputs validated and sanitized
- **Secure Storage**: Sensitive data in environment variables only
- **HTTPS Only**: Production endpoints require encrypted connections
- **Signature Verification**: Ed25519 signatures on all paid requests
- **Replay Protection**: Nonce-based prevention with 10-minute TTL

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