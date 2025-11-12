# The Solana Sentinel

![The-Solana-Sentinel](https://i.ibb.co/5hMp2mkq/image.png)

<h2 align="center">Your AI-Powered Shield Against Risky Tokens on the Solana Blockchain</h2>

<p align="center">
  <strong>The Solana Sentinel</strong> is a cutting-edge web application that provides real-time, AI-driven risk analysis for Solana tokens. By combining live on-chain data with decentralized AI sentiment analysis, it generates a comprehensive "Sentinel Score" to help users identify potentially risky or malicious projects before they invest.
</p>

---

## ✨ Core Features

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
-   **💰 Subscription Service**: Monitor tokens with recurring price/risk alerts powered by **Switchboard Oracle** for real-time data feeds.
-   **🔔 Multi-Channel Alerts**: Receive notifications via Telegram bot with custom risk thresholds.
-   **📱 Subscription Management UI**: Interactive dashboard and subscriptions page to manage monitored tokens.
-   **⚡ Rate Limiting Middleware**: Tier-based rate limiting (Basic/Premium/Public) protecting API endpoints with Redis caching.
-   **🖥️ CLI Tool**: Full command-line interface for analyzing tokens, managing subscriptions, checking balances, and viewing history.
-   **📊 Alert History**: View and filter all triggered alerts with status tracking (delivered/failed/pending).
-   **🏛️ API Endpoints**: RESTful API with 13+ endpoints covering analysis, subscriptions, status monitoring, and system health.

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
```bash
# Analyze a token
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"tokenAddress": "0x..."}'

# Subscribe to alerts
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"tokenAddress": "0x...", "riskThreshold": 50}'
```

See [API Reference](./docs/API.md) for complete documentation.

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

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=your-program-id-here

# Optional: Nosana
NOSANA_JOB_ID=your-nosana-job-id
```

## 🧪 Testing

```bash
# Build project
npm run build

# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e

# Test CLI
npm run cli --help
```

## � System Architecture

The application consists of:

1. **Frontend** (Next.js): React-based dashboard with real-time UI
2. **API Layer** (Next.js API Routes): RESTful endpoints with rate limiting
3. **Services** (TypeScript): Business logic for analysis, subscriptions, alerts
4. **AI Engine** (Genkit): LLM-powered risk analysis and sentiment
5. **On-Chain Integration** (Helius/Switchboard): Real-time blockchain data
6. **Telegram Bot**: Command-driven interface for alerts
7. **CLI Tool**: Command-line access to all features
8. **Cache & Queue** (Redis): Performance optimization
9. **Database** (PostgreSQL): Persistent storage

See [Architecture Documentation](./docs/ARCHITECTURE.md) for detailed system design.

## 🔐 Security Considerations

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