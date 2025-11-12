# Database Migrations

This directory contains SQL migration files for the Solana Sentinel x402 integration.

## Prerequisites

- PostgreSQL 12 or higher
- Redis 6 or higher
- Node.js 18 or higher

## Setup

1. **Install PostgreSQL and Redis**

   For local development, you can use Docker:

   ```bash
   # PostgreSQL
   docker run --name sentinel-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sentinel -p 5432:5432 -d postgres:15

   # Redis
   docker run --name sentinel-redis -p 6379:6379 -d redis:7
   ```

2. **Configure Environment Variables**

   Copy `.env.example` to `.env` and update the database connection strings:

   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/sentinel
   REDIS_URL=redis://localhost:6379
   ```

3. **Test Connections**

   ```bash
   npm run db:test
   ```

4. **Run Migrations**

   ```bash
   npm run db:migrate
   ```

## Migration Files

- `001_initial_schema.sql` - Creates all tables, indexes, and views for the x402 integration

## Database Schema

### Tables

- **analyses** - Stores token risk analysis results
- **subscriptions** - Manages real-time alert subscriptions
- **payments** - Tracks all x402 payment transactions
- **alerts** - Logs triggered alerts and webhook deliveries
- **telegram_users** - Maps Telegram users to Solana wallets
- **agent_registrations** - Tracks registered autonomous agents

### Views

- **active_subscriptions** - Shows active subscriptions with alert counts
- **payment_summary** - Daily payment summaries by type
- **token_analysis_summary** - Analysis statistics per token

## Adding New Migrations

1. Create a new SQL file with the naming convention: `XXX_description.sql`
2. Write your migration SQL (use `IF NOT EXISTS` where appropriate)
3. Run `npm run db:migrate` to apply the migration

## Rollback

Currently, migrations do not support automatic rollback. To rollback:

1. Manually write the reverse SQL statements
2. Execute them against the database
3. Remove the migration entry from `schema_migrations` table

## Production Deployment

For production deployments:

1. Ensure DATABASE_URL uses SSL connection
2. Run migrations as part of your deployment pipeline
3. Monitor migration execution for errors
4. Keep database backups before running migrations

## Troubleshooting

### Connection Refused

- Ensure PostgreSQL is running: `docker ps` or `systemctl status postgresql`
- Check firewall settings
- Verify DATABASE_URL is correct

### Permission Denied

- Ensure the database user has CREATE, ALTER, and INSERT permissions
- For local development, use a superuser or database owner

### Migration Already Applied

- Migrations are tracked in the `schema_migrations` table
- To re-run a migration, delete its entry from `schema_migrations`
- Or create a new migration file with the changes
