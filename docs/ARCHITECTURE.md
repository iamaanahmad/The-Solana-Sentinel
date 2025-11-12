# The Solana Sentinel - Architecture Documentation

Comprehensive guide to the system architecture, data flow, component interactions, and deployment topology.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Components](#components)
- [Data Flow](#data-flow)
- [Integration Points](#integration-points)
- [Database Schema](#database-schema)
- [Caching Strategy](#caching-strategy)
- [Security](#security)
- [Scalability](#scalability)

---

## System Overview

The Solana Sentinel is a multi-layered application that combines:

1. **Frontend Layer**: React-based web interface (Next.js)
2. **API Layer**: RESTful endpoints with rate limiting
3. **Business Logic**: TypeScript services for core functionality
4. **AI Engine**: LLM-powered analysis and sentiment scoring
5. **Blockchain Integration**: Real-time Solana data via Helius & Switchboard
6. **Notification System**: Telegram bot for alerts
7. **Command Interface**: CLI tool for programmatic access
8. **Data Storage**: PostgreSQL for persistence, Redis for caching

---

## Architecture Diagram

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard (/)  │  Subscriptions (/subscriptions)               │
│  Analytics      │  Alert History (/history)                    │
│  Real-time UI   │  Mobile Responsive                           │
└────────────┬────────────────────────────────────┬────────────────┘
             │                                    │
             └────────────────────┬───────────────┘
                                  │ HTTP/JSON
                    ┌─────────────▼──────────────┐
                    │     API Gateway Layer      │
                    ├────────────────────────────┤
                    │  Rate Limiting Middleware  │
                    │  Request Validation        │
                    │  Error Handling            │
                    └─────────────┬──────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
  │   Analysis   │        │ Subscription │        │  Telegram    │
  │   Service    │        │   Service    │        │    Bot       │
  └──────────────┘        └──────────────┘        └──────────────┘
        │                         │                         │
        │        ┌────────────────┼────────────────┐        │
        │        │                │                │        │
        ▼        ▼                ▼                ▼        ▼
  ┌────────────────────────────────────────────────────────────┐
  │                  Business Logic Layer                       │
  ├────────────────────────────────────────────────────────────┤
  │  • Risk Scoring Engine                                    │
  │  • Alert Triggering & Delivery                           │
  │  • User Management                                        │
  │  • Tier & Quota Management                               │
  │  • Webhook Management                                    │
  └────────────┬─────────────────────────────┬────────────────┘
               │                             │
               ▼                             ▼
  ┌──────────────────────────┐   ┌──────────────────────────┐
  │  Blockchain Integration  │   │   AI Engine (Genkit)     │
  ├──────────────────────────┤   ├──────────────────────────┤
  │ • Helius API (On-chain)  │   │ • Google Gemini LLM      │
  │ • Switchboard (Feeds)    │   │ • Sentiment Analysis     │
  │ • Token Metadata         │   │ • Risk Factor Synthesis  │
  │ • Real-time Prices       │   │ • Report Generation      │
  └──────────┬───────────────┘   └──────────────────────────┘
             │                            │
             └────────────┬───────────────┘
                          │
             ┌────────────▼────────────┐
             │    External Services    │
             ├────────────────────────┤
             │ • Nosana Network       │
             │ • Google Cloud         │
             │ • Telegram Bot API     │
             │ • Solana RPC           │
             └────────────────────────┘
                          │
             ┌────────────▼────────────┐
             │    Data & Cache Layer   │
             ├────────────────────────┤
             │ • PostgreSQL (Data)    │
             │ • Redis (Cache)        │
             │ • Message Queue        │
             └────────────────────────┘
```

### Request Flow Architecture

```
User Request
    │
    ▼
┌─────────────────┐
│  HTTP Request   │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│  Rate Limit Check    │
│  (Redis)             │
└────────┬─────────────┘
         │
    ┌────┴─────────────────────┐
    │                          │
YES │                        NO │
    │                    (429)  │
    ▼                          ▼
┌──────────────────┐      ┌──────────┐
│ Request Valid?   │      │  Return  │
└────────┬─────────┘      │  Error   │
         │                └──────────┘
    ┌────┴──────────────┐
    │                   │
YES │                NO │
    │             (400) │
    ▼                   ▼
┌──────────────────┐  ┌──────────┐
│  Route Handler   │  │  Return  │
│  (Business      │  │  Error   │
│   Logic)        │  └──────────┘
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ Execute Operation    │
│ (Service Method)     │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Format Response     │
│  (JSON)              │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Return 200/201 +    │
│  Rate Limit Headers  │
└──────────────────────┘
```

---

## Components

### Frontend Components

#### Dashboard Page (`/src/app/page.tsx`)
- Main landing page with token analysis form
- Real-time metric cards (subscriptions, alerts, balance)
- Quick action buttons for navigation
- Integration with TokenForm and SentinelReport components

**Dependencies:**
- React hooks (useState, useEffect)
- MetricCard component
- TokenForm component
- SentinelReport component

**State Management:**
- Stats: subscriptions count, alerts count, balance
- Loading state for async operations

#### Subscriptions Page (`/src/app/subscriptions/page.tsx`)
- Table view of all monitored tokens
- Real-time price and risk score updates
- Pause/Resume/Delete subscription controls
- Switchboard Oracle integration info

**Components Used:**
- Table component (shadcn/ui)
- AlertDialog for confirmations
- Button variants
- Badge components for status
- Icons (Pause, Play, Trash2, etc.)

**Features:**
- Responsive grid layout
- Mock data for MVP
- Empty state handling
- Tooltip on hover

#### History Page (`/src/app/history/page.tsx`)
- Alert history with filtering and search
- Status-based filtering (delivered/failed/pending)
- Export to JSON functionality
- Success rate statistics

**Components Used:**
- Table with filtering
- Select dropdown for filters
- Button for export
- Statistics cards

### API Routes

#### Analysis Endpoint (`/api/analyze`)
```
POST /api/analyze
├── Input: Token Address
├── Process: 
│   ├── Fetch on-chain data (Helius)
│   ├── Get sentiment (Nosana)
│   ├── Run Genkit analysis
│   └── Generate risk score
└── Output: Risk report
```

**Rate Limit:** Basic tier (100/min)
**Cache:** 5 minutes per token

#### Subscriptions Endpoint (`/api/subscribe`)
```
POST   /api/subscribe      → Create subscription
GET    /api/subscribe      → List subscriptions
GET    /api/subscribe/:id  → Get subscription
PATCH  /api/subscribe/:id  → Update subscription
DELETE /api/subscribe/:id  → Delete subscription
```

**Features:**
- Full CRUD operations
- Validation and error handling
- User isolation

#### Dashboard Endpoint (`/api/dashboard`)
```
GET /api/dashboard
├── Input: User ID (header)
├── Return:
│   ├── Stats (counts, balance)
│   ├── Top Tokens (trending)
│   ├── Recent Alerts
│   └── Tier Information
└── Cache: 5 minutes (Redis)
```

#### History Endpoint (`/api/history`)
```
GET /api/history
├── Query Params: limit, filter, startDate, endDate
├── Filtering: all|delivered|failed|pending
├── Pagination: limit + offset
└── Return: Alert records
```

#### Status Endpoint (`/api/status`)
```
GET /api/status
├── Agent Status
├── Subscription Summary
├── Monitored Tokens
├── Alert Statistics
├── Billing Information
└── Health Metrics
```

### Services Layer

#### Analysis Service
```typescript
class AnalysisService {
  analyzeToken(address): Promise<Report>
  fetchOnChainData(address): Promise<OnChainMetrics>
  getSentimentScore(address): Promise<SentimentData>
  generateReport(data): Promise<Report>
}
```

**Responsibilities:**
- Coordinate analysis workflow
- Fetch and aggregate data
- Generate risk scores
- Format reports

#### Subscription Service
```typescript
class SubscriptionService {
  create(user, token, thresholds): Promise<Subscription>
  getAll(user): Promise<Subscription[]>
  getById(user, id): Promise<Subscription>
  update(user, id, changes): Promise<Subscription>
  delete(user, id): Promise<boolean>
  checkAlerts(): Promise<void>
}
```

**Responsibilities:**
- Subscription CRUD operations
- Alert threshold management
- Subscription monitoring
- Alert triggering

#### Telegram Service
```typescript
class TelegramService {
  sendAlert(chatId, message): Promise<void>
  sendReport(chatId, report): Promise<void>
  handleCommand(message): Promise<void>
  linkUser(telegramId, userId): Promise<void>
}
```

**Responsibilities:**
- Telegram API integration
- Command handling
- Message formatting
- User linking

#### Switchboard Service
```typescript
class SwitchboardService {
  getPrice(pair): Promise<PriceData>
  startMonitoring(token): Promise<void>
  updatePriceFeed(): Promise<void>
  getTriggerData(): Promise<TriggerData>
}
```

**Responsibilities:**
- Switchboard API integration
- Price feed monitoring
- Real-time data retrieval

---

## Data Flow

### Token Analysis Flow

```
User Input (Token Address)
    │
    ▼
┌──────────────────────┐
│ /api/analyze         │
└──────────┬───────────┘
           │
           ▼
┌────────────────────────────┐
│ Check Cache (Redis)        │
└──────────┬────────┬────────┘
           │        │
      HIT  │        │ MISS
           │        │
           ▼        ▼
      ┌─────────────────────────────────┐
      │ Fetch On-Chain Data (Helius)    │
      │ • Holder concentration          │
      │ • Authority status              │
      │ • Liquidity info                │
      └──────────────┬────────────────────┘
                     │
                     ▼
      ┌─────────────────────────────────┐
      │ Fetch Sentiment (Nosana/API)    │
      │ • Twitter sentiment             │
      │ • Reddit sentiment              │
      │ • Social signals                │
      └──────────────┬────────────────────┘
                     │
                     ▼
      ┌─────────────────────────────────┐
      │ Run Genkit Analysis             │
      │ • Synthesize metrics            │
      │ • Generate verdict              │
      │ • Calculate risk score          │
      └──────────────┬────────────────────┘
                     │
                     ▼
      ┌─────────────────────────────────┐
      │ Store in Cache (5 min)          │
      └──────────────┬────────────────────┘
                     │
                     ▼
      ┌─────────────────────────────────┐
      │ Return Report to Client         │
      └─────────────────────────────────┘
```

### Alert Triggering Flow

```
Subscription Exists
    │
    ▼
┌──────────────────────────┐
│ Background Job (every    │
│ 5 minutes)               │
└──────────────┬───────────┘
               │
               ▼
┌──────────────────────────────┐
│ Fetch Current Price (Switch) │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Run Analysis (Genkit)        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Check Thresholds            │
│ • Price > threshold?         │
│ • Risk > threshold?          │
└───┬─────────┬────────────────┘
    │         │
    │    YES  │
    │         │
    NO        ▼
    │    ┌──────────────────────┐
    │    │ Trigger Alert        │
    │    └────┬──────────────────┘
    │         │
    │         ▼
    │    ┌──────────────────────────┐
    │    │ Save Alert (PostgreSQL)  │
    │    └────┬─────────────────────┘
    │         │
    │         ▼
    │    ┌──────────────────────────┐
    │    │ Send Telegram Message    │
    │    └────┬─────────────────────┘
    │         │
    │         ▼
    │    ┌──────────────────────────┐
    │    │ Mark as Delivered        │
    │    └──────────────────────────┘
    │
    └────▶ Continue
```

---

## Integration Points

### External APIs

#### Helius API
- **Purpose**: On-chain data fetching
- **Endpoints Used**:
  - `POST /v0/addresses/{address}/tokens` - Token holders
  - `GET /v0/token/metadata` - Token info
  - `POST /v1/webhooks` - Real-time updates
- **Authentication**: API key in header
- **Rate Limits**: 100 requests/second

#### Switchboard Oracle
- **Purpose**: Real-time price feeds
- **Integration**: Feed aggregation
- **Use Case**: Monitoring token prices
- **Authentication**: Solana wallet signature

#### Telegram Bot API
- **Purpose**: User notifications
- **Methods**:
  - `sendMessage` - Text alerts
  - `sendDocument` - Report export
  - `getUpdates` - Command parsing
- **Webhook URL**: `/api/telegram/webhook/[userId]`

#### Google Genkit
- **Purpose**: AI-powered analysis
- **Models**: Gemini (text analysis)
- **Features**:
  - Risk factor synthesis
  - Verdict generation
  - Report formatting

#### Nosana Network
- **Purpose**: Decentralized sentiment analysis
- **Deployment**: Docker job on Nosana
- **Input**: Token address + metadata
- **Output**: Sentiment scores

---

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  telegram_id BIGINT UNIQUE,
  tier VARCHAR(50) DEFAULT 'basic',
  balance DECIMAL(18,8),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token_address VARCHAR(255),
  token_symbol VARCHAR(20),
  risk_threshold INT DEFAULT 50,
  price_threshold DECIMAL(18,8),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### alerts
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  user_id UUID REFERENCES users(id),
  token_symbol VARCHAR(20),
  risk_score INT,
  price_change DECIMAL(10,2),
  status VARCHAR(50),
  delivered_at TIMESTAMP,
  failed_reason VARCHAR(255),
  created_at TIMESTAMP
);
```

#### price_history
```sql
CREATE TABLE price_history (
  id UUID PRIMARY KEY,
  token_address VARCHAR(255),
  price DECIMAL(18,8),
  price_change_24h DECIMAL(10,2),
  market_cap DECIMAL(20,2),
  volume_24h DECIMAL(20,2),
  timestamp TIMESTAMP,
  source VARCHAR(50)
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(255),
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  changes JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP
);
```

### Indexes

```sql
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_price_history_token ON price_history(token_address);
CREATE INDEX idx_price_history_timestamp ON price_history(timestamp);
```

---

## Caching Strategy

### Cache Layers

#### L1: Response Cache (Redis)
- **Purpose**: Store API responses
- **TTL**: 5 minutes (configurable)
- **Key Pattern**: `api:{endpoint}:{user_id}:{params_hash}`
- **Invalidation**: Manual on update operations

Example:
```
Key: api:dashboard:user-123:hash
Value: {"stats": {...}, "topTokens": [...]}
TTL: 300 seconds
```

#### L2: Analysis Cache (Redis)
- **Purpose**: Cache token analysis results
- **TTL**: 1 hour (long-lived)
- **Key Pattern**: `analysis:{token_address}`
- **Invalidation**: Time-based (hourly refresh)

#### L3: Price Feed Cache (Redis)
- **Purpose**: Cache price data from Switchboard
- **TTL**: 30 seconds (real-time)
- **Key Pattern**: `price:{pair}`
- **Invalidation**: Automatic on update

### Cache Invalidation

```typescript
// Manual invalidation on update
await cache.invalidate('dashboard', userId);
await cache.invalidate('subscriptions', userId);

// Time-based invalidation (automatic)
// TTL configured per cache key

// Event-based invalidation
subscription.onUpdate(() => {
  cache.invalidate('subscriptions', userId);
  cache.invalidate('dashboard', userId);
});
```

---

## Security

### Authentication & Authorization

- **User Identification**: x-user-id header
- **API Keys**: Bearer token authorization
- **Rate Limiting**: Tier-based (3 tiers)
- **Request Validation**: Input sanitization

### Data Protection

- **Environment Variables**: Sensitive keys in .env
- **HTTPS Only**: TLS 1.2+ in production
- **Database**: Encrypted at rest
- **Secrets**: Vault-based management

### API Security

- **CORS**: Origin validation
- **CSRF**: Token-based protection
- **Request Signing**: Webhook verification
- **Audit Logging**: All operations logged

---

## Scalability

### Horizontal Scaling

```
┌─────────────────────────────────────────┐
│         Load Balancer (nginx)           │
└────────┬────────────────────┬───────────┘
         │                    │
    ┌────▼────┐          ┌────▼────┐
    │ Server  │          │ Server  │
    │    1    │  ......  │    N    │
    └────┬────┘          └────┬────┘
         │                    │
         └────────┬───────────┘
                  │
         ┌────────▼────────┐
         │  PostgreSQL     │
         │  (Replicated)   │
         └─────────────────┘
         
         ┌────────┴────────┐
         │                 │
    ┌────▼────┐      ┌────▼────┐
    │ Redis   │      │ Redis   │
    │ Primary │      │ Replica │
    └─────────┘      └─────────┘
```

### Performance Optimization

- **Query Optimization**: Indexed database columns
- **Connection Pooling**: Database connection reuse
- **Response Compression**: gzip enabled
- **CDN**: Static assets via CDN
- **Batch Processing**: Background jobs for heavy operations

### Monitoring & Observability

```typescript
// Performance Metrics
- Response Time: 50ms (p95)
- Throughput: 1000 req/s (single server)
- Database Query Time: 20ms (p95)
- Cache Hit Rate: 85%+

// Error Tracking
- Application Errors: <1% (5xx responses)
- Rate Limit Hits: Monitored
- API Timeouts: <0.5%

// Infrastructure Metrics
- CPU Usage: <70%
- Memory Usage: <80%
- Disk I/O: <60%
- Network Bandwidth: <50%
```

---

## Deployment Architecture

### Development Environment
```
Local Machine
├── Next.js Dev Server (port 3000)
├── Docker Services
│   ├── PostgreSQL (port 5432)
│   └── Redis (port 6379)
└── Environment: .env.local
```

### Production Environment
```
┌─────────────────────────────────────────┐
│         Vercel/Firebase Hosting         │
├─────────────────────────────────────────┤
│ • Next.js Application (Auto-scaled)    │
│ • Edge Functions                        │
│ • CDN Distribution                      │
└────────────┬────────────────────────────┘
             │
    ┌────────▼────────────┐
    │  Managed Services   │
    ├─────────────────────┤
    │ • PostgreSQL Cloud  │
    │ • Redis Cloud       │
    │ • Telegram Bot API  │
    │ • Helius RPC        │
    │ • Switchboard Feed  │
    └─────────────────────┘
```

---

Last Updated: November 12, 2025
