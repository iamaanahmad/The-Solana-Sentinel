# Solana Sentinel x402 Integration - Setup Guide

This guide will help you set up the Solana Sentinel with x402 protocol integration for local development.

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (recommended) OR PostgreSQL 12+ and Redis 6+ installed locally
- Solana CLI tools (for program deployment)
- Git

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd The-Solana-Sentinel
npm install
```

### 2. Start Database Services

**Option A: Using Docker (Recommended)**

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432 and Redis on port 6379.

**Option B: Using Local Services**

Ensure PostgreSQL and Redis are running on your system.

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure the following required variables:

```env
# Database (if using Docker Compose, these are already correct)
DATABASE_URL=postgresql://sentinel:sentinel_dev_password@localhost:5432/sentinel
REDIS_URL=redis://localhost:6379

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
SENTINEL_KEYPAIR=<your-keypair-here>

# Helius API
HELIUS_API_KEY=<your-helius-api-key>
HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=<your-key>

# Google AI (existing)
GOOGLE_GENAI_API_KEY=<your-google-ai-key>
```

### 4. Test Database Connections

```bash
npm run db:test
```

You should see:
```
✅ PostgreSQL: Connected
✅ Redis: Connected
```

### 5. Run Database Migrations

```bash
npm run db:migrate
```

This will create all necessary tables, indexes, and views.

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:9002

## Detailed Configuration

### Solana Configuration

#### Generate a Keypair

```bash
solana-keygen new --outfile ~/.config/solana/sentinel-keypair.json
```

#### Get Devnet SOL

```bash
solana airdrop 2 <your-public-key> --url devnet
```

#### Set Environment Variable

Convert your keypair to base58 and add to `.env`:

```bash
# Using Solana CLI
solana-keygen pubkey ~/.config/solana/sentinel-keypair.json
```

### Helius API Setup

1. Sign up at https://helius.dev
2. Create a new project
3. Copy your API key to `.env`

### Switchboard Oracle Setup

1. Sign up at https://switchboard.xyz
2. Get your API key
3. Add to `.env`:

```env
SWITCHBOARD_API_KEY=<your-key>
```

### Telegram Bot Setup (Optional)

1. Message @BotFather on Telegram
2. Create a new bot with `/newbot`
3. Copy the bot token to `.env`:

```env
TELEGRAM_BOT_TOKEN=<your-bot-token>
```

### Nosana Network Setup (Optional)

1. Sign up at https://nosana.io
2. Get your API key
3. Add to `.env`:

```env
NOSANA_API_KEY=<your-key>
```

## Database Management

### View Database

```bash
# Using psql
docker exec -it sentinel-postgres psql -U sentinel -d sentinel

# List tables
\dt

# View table structure
\d analyses
```

### Reset Database

```bash
# Stop containers
docker-compose down -v

# Start fresh
docker-compose up -d
npm run db:migrate
```

### Backup Database

```bash
docker exec sentinel-postgres pg_dump -U sentinel sentinel > backup.sql
```

### Restore Database

```bash
docker exec -i sentinel-postgres psql -U sentinel sentinel < backup.sql
```

## Redis Management

### View Redis Data

```bash
# Connect to Redis
docker exec -it sentinel-redis redis-cli

# View all keys
KEYS *

# Get a value
GET analysis:SomeTokenAddress:basic

# Clear all data
FLUSHALL
```

## Troubleshooting

### Port Already in Use

If ports 5432 or 6379 are already in use:

1. Stop existing services
2. Or modify `docker-compose.yml` to use different ports:

```yaml
ports:
  - "5433:5432"  # PostgreSQL
  - "6380:6379"  # Redis
```

Then update `.env` accordingly.

### Database Connection Failed

1. Check if PostgreSQL is running:
   ```bash
   docker ps | grep postgres
   ```

2. Check logs:
   ```bash
   docker logs sentinel-postgres
   ```

3. Verify credentials in `.env`

### Redis Connection Failed

1. Check if Redis is running:
   ```bash
   docker ps | grep redis
   ```

2. Check logs:
   ```bash
   docker logs sentinel-redis
   ```

3. Test connection:
   ```bash
   docker exec sentinel-redis redis-cli ping
   ```

### Migration Errors

1. Check PostgreSQL logs
2. Verify database user has proper permissions
3. Try running migrations manually:
   ```bash
   docker exec -i sentinel-postgres psql -U sentinel sentinel < migrations/001_initial_schema.sql
   ```

## Development Workflow

1. Start services: `docker-compose up -d`
2. Run migrations: `npm run db:migrate`
3. Start dev server: `npm run dev`
4. Make changes to code
5. Test changes at http://localhost:9002
6. Stop services: `docker-compose down`

## Next Steps

After setup is complete:

1. Deploy Solana program (see `programs/sentinel/README.md`)
2. Configure x402 payment settings
3. Test analysis endpoints
4. Set up Telegram bot (optional)
5. Configure Switchboard feeds

## Production Deployment

For production deployment:

1. Use managed PostgreSQL (e.g., AWS RDS, Supabase)
2. Use managed Redis (e.g., AWS ElastiCache, Upstash)
3. Set `NODE_ENV=production`
4. Enable SSL for database connections
5. Use secrets management for API keys
6. Set up monitoring and alerting
7. Configure backup strategy

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review logs: `docker-compose logs`
3. Open an issue on GitHub
