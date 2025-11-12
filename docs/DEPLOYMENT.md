# The Solana Sentinel - Deployment Guide

Complete guide to setting up, deploying, and maintaining The Solana Sentinel in development and production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Docker Setup](#docker-setup)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## Prerequisites

### System Requirements

- **OS**: Linux, macOS, or Windows (with WSL2)
- **Node.js**: v18.x or later
- **npm**: v9.x or later (or yarn/pnpm)
- **Docker Desktop**: Latest version
- **Git**: For version control
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB for dependencies and database

### Required Services

- PostgreSQL 14+ (or use Docker)
- Redis 7+ (or use Docker)
- Telegram Bot Token
- Helius API Key
- Google Cloud/Genkit API Key

### Optional Services

- Switchboard Devnet Key
- Nosana Account (for sentiment analysis)
- Solana Wallet (for on-chain operations)

---

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/iamaanahmad/The-Solana-Sentinel.git
cd The-Solana-Sentinel
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Install Node Modules (if using lock file)

```bash
npm ci
```

### 4. Verify Installation

```bash
npm --version
node --version
node_modules/.bin/next --version
```

---

## Environment Configuration

### 1. Create Environment File

```bash
cp .env.example .env.local
```

### 2. Edit `.env.local`

Add the following configuration:

```env
# ===== API KEYS =====
HELIUS_API_KEY=your-helius-api-key-here
GOOGLE_GENKIT_API_KEY=your-genkit-api-key-here
OPENAI_API_KEY=your-openai-api-key-here

# ===== DATABASE =====
DATABASE_URL=postgresql://user:password@localhost:5432/solana_sentinel
POSTGRES_USER=solana_user
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=solana_sentinel

# ===== REDIS =====
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=redis_password_here

# ===== SOLANA =====
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_CLUSTER=devnet
PROGRAM_ID=11111111111111111111111111111111

# ===== TELEGRAM BOT =====
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
TELEGRAM_BOT_NAME=YourBotName

# ===== SWITCHBOARD =====
SWITCHBOARD_DEVNET_KEY=your-switchboard-key-here

# ===== OPTIONAL: NOSANA =====
NOSANA_JOB_ID=your-nosana-job-id-here

# ===== APPLICATION =====
NODE_ENV=development
ENVIRONMENT=development
PORT=3000
LOG_LEVEL=debug
```

### 3. Secure Sensitive Data

```bash
# Never commit .env.local to version control
echo ".env.local" >> .gitignore
```

---

## Database Setup

### Option 1: Using Docker (Recommended)

#### Start PostgreSQL & Redis

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

#### Verify Services

```bash
docker ps
```

You should see both containers running.

### Option 2: Local Installation

#### PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
- Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu):**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Windows:**
- Use Windows Subsystem for Linux (WSL2)
- Or use Docker for Windows

### Run Database Migrations

```bash
# Run all pending migrations
npm run migrate

# Specific migration
npm run migrate:run 001_initial_schema

# Rollback last migration
npm run migrate:down
```

### Verify Database Connection

```bash
npm run db:test-connection
```

Expected output:
```
✓ Connected to PostgreSQL
✓ Connected to Redis
✓ Database schema initialized
```

---

## Running Locally

### Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Access Application

- **Dashboard**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health
- **CLI Tool**: `npm run cli --help`

### Development Features

- Hot reload on file changes
- API route hot refresh
- Enhanced error messages
- Debug logging enabled

### View Logs

```bash
# Show last 50 lines
npm run logs

# Follow logs (streaming)
npm run logs:tail

# Filter logs
npm run logs | grep "error"
```

---

## Testing

### Unit Tests

```bash
npm test
```

### Watch Mode

```bash
npm test:watch
```

### Coverage Report

```bash
npm test:coverage
```

### End-to-End Tests

```bash
npm run test:e2e
```

### Test Specific File

```bash
npm test -- src/services/analysis.service.test.ts
```

### API Testing with curl

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test analysis endpoint
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "tokenAddress": "So11111111111111111111111111111111111111112"
  }'

# Test subscription endpoint
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "tokenAddress": "EPjFWaLb3odcccccccccccccccccccccccccccccc",
    "riskThreshold": 60
  }'
```

---

## Production Deployment

### Build Optimization

```bash
# Create optimized production build
npm run build
```

This will:
- Compile TypeScript
- Minify JavaScript
- Optimize CSS
- Generate static pages
- Output: `.next/` directory

### Build Verification

```bash
npm run build:analyze

# Check for build errors
npm run build 2>&1 | grep -i error
```

### Environment Setup for Production

1. **Update `.env` for production:**

```env
NODE_ENV=production
ENVIRONMENT=production
LOG_LEVEL=info

# Use production database URLs
DATABASE_URL=postgresql://prod-user:prod-password@prod-db:5432/sentinel
REDIS_URL=redis://prod-user:prod-password@prod-redis:6379

# Use production API keys
HELIUS_API_KEY=prod-helius-key
GOOGLE_GENKIT_API_KEY=prod-genkit-key

# Use production Solana RPC
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_CLUSTER=mainnet-beta
```

2. **Verify database:**

```bash
npm run db:verify
```

3. **Run migrations:**

```bash
npm run migrate
```

### Deploy to Vercel

#### 1. Connect GitHub Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

#### 2. Configure Project

During deployment, Vercel will ask for:
- Production domain
- Environment variables
- Build settings

#### 3. Set Environment Variables

```bash
vercel env add HELIUS_API_KEY
vercel env add GOOGLE_GENKIT_API_KEY
vercel env add DATABASE_URL
# ... add all required variables
```

#### 4. Redeploy

```bash
vercel --prod
```

### Deploy to Firebase Hosting

#### 1. Install Firebase Tools

```bash
npm install -g firebase-tools
```

#### 2. Initialize Firebase

```bash
firebase init hosting
```

#### 3. Configure Build Settings

In `firebase.json`:

```json
{
  "hosting": {
    "site": "solana-sentinel",
    "public": ".next",
    "ignore": [".git", "node_modules"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### 4. Build and Deploy

```bash
npm run build
firebase deploy
```

### Docker Production Build

#### Create Docker Image

```bash
docker build -t solana-sentinel:latest .
```

#### Run Container

```bash
docker run -d \
  --name sentinel \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  solana-sentinel:latest
```

#### Push to Docker Hub

```bash
docker tag solana-sentinel:latest username/solana-sentinel:latest
docker push username/solana-sentinel:latest
```

---

## Docker Setup

### Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

### Services Included

- **PostgreSQL**: Database on port 5432
- **Redis**: Cache on port 6379

### Docker File Example

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

---

## Monitoring & Logging

### Application Logs

```bash
# View logs
tail -f logs/application.log

# Filter errors
grep "ERROR" logs/application.log

# Real-time monitoring
npm run logs:tail
```

### Performance Monitoring

```bash
# Enable performance metrics
NODE_OPTIONS=--enable-source-maps npm run dev

# View metrics
npm run metrics
```

### Database Monitoring

```bash
# Check connections
psql -U solana_user -d solana_sentinel -c "SELECT * FROM pg_stat_activity;"

# Monitor slow queries
psql -U solana_user -d solana_sentinel -c "\dt"
```

### Redis Monitoring

```bash
redis-cli
> INFO
> MONITOR
> QUIT
```

---

## Backup & Recovery

### Database Backup

```bash
# Full backup
pg_dump -U solana_user solana_sentinel > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump -U solana_user solana_sentinel | gzip > backup.sql.gz

# Restore from backup
psql -U solana_user solana_sentinel < backup.sql
```

### Redis Backup

```bash
# Manual save
redis-cli SAVE

# Copy dump file
cp /var/lib/redis/dump.rdb ./backup/dump.rdb

# Restore
redis-cli SHUTDOWN
cp ./backup/dump.rdb /var/lib/redis/
redis-server
```

### Automated Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U solana_user solana_sentinel | gzip > $BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed"
EOF

chmod +x backup.sh

# Schedule with cron (runs daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup.sh") | crontab -
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Use different port
PORT=3001 npm run dev
```

### Database Connection Failed

```bash
# Test PostgreSQL connection
psql -U solana_user -h localhost -d solana_sentinel

# Check PostgreSQL status
docker ps | grep postgres

# Restart PostgreSQL
docker restart solana_sentinel_postgres_1
```

### Redis Connection Failed

```bash
# Test Redis connection
redis-cli ping

# Check Redis status
docker ps | grep redis

# Restart Redis
docker restart solana_sentinel_redis_1
```

### Build Fails

```bash
# Clean cache
rm -rf node_modules .next
npm install
npm run build

# Check for TypeScript errors
npm run type-check

# Linting errors
npm run lint
```

### Memory Issues

```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Monitor memory usage
docker stats solana_sentinel
```

### API Rate Limiting

```bash
# Check Redis for rate limit keys
redis-cli
> KEYS "rate-limit*"
> TTL "rate-limit:user-123"

# Flush cache if needed
> FLUSHDB  # WARNING: Clears all cache
```

---

## Maintenance

### Regular Tasks

#### Daily
- Monitor error logs
- Check API health
- Verify database connectivity

#### Weekly
- Review performance metrics
- Check disk space usage
- Update dependencies (if patches available)

#### Monthly
- Database maintenance (VACUUM, ANALYZE)
- Security updates
- Backup verification

### Database Maintenance

```bash
# Optimize database
psql -U solana_user -d solana_sentinel -c "VACUUM ANALYZE;"

# Check table sizes
psql -U solana_user -d solana_sentinel -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Dependencies Update

```bash
# Check outdated packages
npm outdated

# Update production dependencies
npm update

# Update dev dependencies
npm update --save-dev

# Update specific package
npm install package-name@latest
```

### Security Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Review changes
npm audit fix --dry-run
```

### Logs Rotation

```bash
# Install logrotate
sudo apt-get install logrotate

# Create config
cat > /etc/logrotate.d/sentinel << 'EOF'
/var/log/sentinel/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 sentinel sentinel
    sharedscripts
    postrotate
        systemctl reload sentinel > /dev/null 2>&1 || true
    endscript
}
EOF
```

---

## Performance Tuning

### Database Query Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_price_history_timestamp ON price_history(timestamp DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM alerts WHERE user_id = 'user-123';
```

### Redis Optimization

```bash
redis-cli CONFIG GET maxmemory
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Application Optimization

```typescript
// Enable caching
const cacheMiddleware = (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
};

// Enable compression
import compression from 'compression';
app.use(compression());

// Connection pooling
const pool = new Pool({ max: 20 });
```

---

## Support & Documentation

- **Issues**: [GitHub Issues](https://github.com/iamaanahmad/The-Solana-Sentinel/issues)
- **Documentation**: See [docs/](../docs/) folder
- **API Reference**: [docs/API.md](./API.md)
- **Architecture**: [docs/ARCHITECTURE.md](./ARCHITECTURE.md)

---

Last Updated: November 12, 2025
