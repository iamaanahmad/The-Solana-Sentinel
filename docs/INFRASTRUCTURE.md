# Infrastructure Setup Summary

This document summarizes the infrastructure and dependencies set up for the Solana Sentinel x402 integration.

## Installed Dependencies

### Core Solana & Blockchain
- `@solana/web3.js` (v1.98.4) - Solana JavaScript SDK
- `@coral-xyz/anchor` (v0.32.1) - Anchor framework for Solana programs
- `@switchboard-xyz/on-demand` (v3.2.2) - Switchboard oracle integration

### Communication & CLI
- `node-telegram-bot-api` (v0.66.0) - Telegram bot interface
- `commander` (v14.0.2) - CLI tool framework

### Database & Caching
- `pg` (v8.16.3) - PostgreSQL client
- `redis` (v5.9.0) - Redis client

### Development Dependencies
- `@types/node-telegram-bot-api` (v0.64.12) - TypeScript types
- `@types/pg` (v8.15.6) - TypeScript types
- `tsx` - TypeScript execution for scripts

## Environment Configuration

### Created Files
- `.env.example` - Template with all required environment variables

### Required Environment Variables

#### Solana
- `SOLANA_RPC_URL` - Solana RPC endpoint (devnet/mainnet)
- `SOLANA_NETWORK` - Network identifier
- `SENTINEL_KEYPAIR` - Base58 encoded keypair
- `SENTINEL_PROGRAM_ID` - Deployed program ID

#### External APIs
- `HELIUS_API_KEY` - Helius API key for on-chain data
- `NOSANA_API_KEY` - Nosana network API key
- `SWITCHBOARD_API_KEY` - Switchboard oracle API key
- `TELEGRAM_BOT_TOKEN` - Telegram bot token

#### Database
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

#### x402 Configuration
- `X402_PAYMENT_RECIPIENT` - Payment recipient public key
- `X402_USDC_MINT` - USDC token mint address

#### Pricing
- `TIER_BASIC_PRICE` - Basic tier price (0 USDC)
- `TIER_STANDARD_PRICE` - Standard tier price (0.1 USDC)
- `TIER_PREMIUM_PRICE` - Premium tier price (0.5 USDC)
- `SUBSCRIPTION_ALERT_FEE` - Per-alert fee (0.05 USDC)
- `HISTORICAL_REPORT_FEE` - Per-report fee (0.02 USDC)

## Database Schema

### Tables Created

1. **analyses**
   - Stores token risk analysis results
   - Includes attestation signatures
   - Indexed by token address, requester, and timestamp

2. **subscriptions**
   - Manages real-time alert subscriptions
   - Tracks prepaid balances and alert counts
   - Indexed by agent, status, and token

3. **payments**
   - Tracks all x402 payment transactions
   - Links to analyses and subscriptions
   - Indexed by payer, transaction hash, and timestamp

4. **alerts**
   - Logs triggered alerts
   - Tracks webhook delivery status
   - Indexed by subscription and timestamp

5. **telegram_users**
   - Maps Telegram chat IDs to Solana wallets
   - Enables payment tracking for Telegram users

6. **agent_registrations**
   - Tracks registered autonomous agents
   - Stores agent metadata and PDA addresses

### Views Created

1. **active_subscriptions** - Active subscriptions with alert statistics
2. **payment_summary** - Daily payment summaries by type
3. **token_analysis_summary** - Analysis statistics per token

### Features

- UUID primary keys with automatic generation
- Automatic `updated_at` timestamp triggers
- Foreign key constraints with cascade deletes
- Check constraints for data validation
- Comprehensive indexing for query performance
- JSONB columns for flexible data storage

## Database Utilities

### Created Modules

#### `src/lib/db.ts`
PostgreSQL connection management with:
- Connection pooling (max 20 connections)
- Query execution with automatic error handling
- Transaction support
- Connection testing utilities

#### `src/lib/redis.ts`
Redis connection management with:
- Automatic reconnection with exponential backoff
- Cache helper functions (get, set, del, exists)
- Rate limiting utilities
- TTL management

### Migration System

#### `migrations/run-migrations.ts`
- Tracks applied migrations in `schema_migrations` table
- Applies pending migrations in order
- Transaction-based migration execution
- Rollback on errors

#### `migrations/001_initial_schema.sql`
- Complete database schema
- All tables, indexes, and views
- Triggers and functions

## Scripts

### Database Management

#### `npm run db:setup`
- Tests database connection
- Validates configuration
- Provides setup guidance

#### `npm run db:migrate`
- Runs pending database migrations
- Creates schema_migrations tracking table
- Applies migrations in transaction

#### `npm run db:test`
- Tests PostgreSQL connection
- Tests Redis connection
- Validates API key configuration
- Checks Solana RPC connectivity

## Docker Support

### `docker-compose.yml`
Provides local development environment with:
- PostgreSQL 15 (port 5432)
- Redis 7 (port 6379)
- Persistent volumes for data
- Health checks
- Automatic restart

### Usage
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset data
docker-compose down -v
```

## Documentation

### Created Guides

1. **`docs/SETUP.md`**
   - Complete setup instructions
   - Configuration guide
   - Troubleshooting section
   - Development workflow

2. **`migrations/README.md`**
   - Migration system documentation
   - Schema overview
   - Adding new migrations
   - Rollback procedures

3. **`docs/INFRASTRUCTURE.md`** (this file)
   - Infrastructure summary
   - Dependency list
   - Configuration reference

## Connection Pooling

### PostgreSQL
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds
- Automatic error handling

### Redis
- Automatic reconnection
- Exponential backoff (max 3 seconds)
- Max retry attempts: 10
- Connection state monitoring

## Rate Limiting

Implemented in Redis with:
- Per-identifier counters
- Sliding window algorithm
- Automatic expiration
- Fail-open on Redis errors

### Default Limits
- Free tier: 10 requests/hour per IP
- Paid tier: 100 requests/hour per wallet
- Window: 3600 seconds (1 hour)

## Caching Strategy

### Cache Keys Format
- Analysis: `analysis:{tokenAddress}:basic`
- Switchboard: `switchboard:{tokenAddress}:data`
- Rate limit: `rate_limit:{identifier}`

### TTL Configuration
- Basic analysis: 300 seconds (5 minutes)
- Switchboard data: 30 seconds
- Rate limit window: 3600 seconds (1 hour)

## Security Features

### Database
- Parameterized queries (SQL injection prevention)
- Connection pooling with limits
- SSL support for production
- Transaction isolation

### Redis
- Password authentication support
- Connection encryption (TLS)
- Key expiration for sensitive data

### Environment Variables
- Sensitive data in .env (not committed)
- .env.example for reference
- Validation on startup

## Performance Optimizations

### Database
- Strategic indexing on frequently queried columns
- JSONB for flexible schema
- Connection pooling
- Query logging in development

### Redis
- In-memory caching
- Automatic expiration
- Pipelining support
- Pub/sub for real-time updates

## Monitoring & Observability

### Logging
- Query execution time logging (development)
- Error logging with context
- Connection state changes
- Migration execution logs

### Health Checks
- Database connection test
- Redis connection test
- API key validation
- RPC endpoint connectivity

## Next Steps

After infrastructure setup:

1. ✅ Dependencies installed
2. ✅ Environment template created
3. ✅ Database schema defined
4. ✅ Redis configuration ready
5. ⏭️ Deploy Solana program (Task 2)
6. ⏭️ Implement x402 middleware (Task 3)
7. ⏭️ Build services (Tasks 4-9)
8. ⏭️ Create API routes (Task 12)

## Maintenance

### Regular Tasks
- Monitor connection pool usage
- Review slow query logs
- Update dependencies
- Rotate API keys
- Backup database
- Monitor Redis memory usage

### Scaling Considerations
- Increase connection pool size
- Add read replicas for PostgreSQL
- Use Redis cluster for high availability
- Implement query caching
- Add database partitioning
