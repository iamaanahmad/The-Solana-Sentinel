
# The Solana Sentinel - API Reference

Complete documentation for all API endpoints with examples, request/response formats, and error codes.

## Table of Contents

- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Token Analysis](#token-analysis)
- [Subscriptions](#subscriptions)
- [Dashboard](#dashboard)
- [History](#history)
- [Status](#status)
- [Switchboard Oracle](#switchboard-oracle)
- [Telegram](#telegram)
- [Error Codes](#error-codes)
- [Examples](#examples)

---

## Authentication

Most endpoints require authentication via headers:

- **User Identification**: `x-user-id` (UUID or unique identifier)
- **API Key** (optional): `Authorization: Bearer YOUR_API_KEY`

```bash
curl -H "x-user-id: user-123" \
     -H "Authorization: Bearer your-api-key" \
     https://api.example.com/api/endpoint
```

---

## Rate Limiting

The API uses tier-based rate limiting with the following limits:

| Tier | Requests/Min | Requests/Hour | Status |
|------|-------------|---------------|--------|
| **Public** | 10 | 60 | Default |
| **Basic** | 100 | 1000 | Free tier |
| **Premium** | 500 | 10000 | Paid tier |

Rate limit headers included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1636920000
```

**Status Code 429** (Too Many Requests) when limit exceeded.

---

## Token Analysis

### POST /api/analyze

Analyze a token for risk factors and generate a comprehensive report.

**Request:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "tokenAddress": "EPjFWaLb3odcccccccccccccccccccccccccccccc",
    "options": {
      "includeSentiment": true,
      "includeHolderAnalysis": true
    }
  }'
```

**Parameters:**
- `tokenAddress` (string, required): Solana token mint address
- `options` (object, optional):
  - `includeSentiment` (boolean): Include social sentiment analysis (default: true)
  - `includeHolderAnalysis` (boolean): Include holder concentration (default: true)

**Response (200 OK):**
```json
{
  "tokenAddress": "EPjFWaLb3odcccccccccccccccccccccccccccccc",
  "tokenSymbol": "USDC",
  "tokenName": "USD Coin",
  "sentinelScore": 15,
  "riskLevel": "low",
  "analysis": {
    "onChain": {
      "mintAuthority": {
        "renounced": true,
        "address": "11111111111111111111111111111111"
      },
      "freezeAuthority": {
        "renounced": true,
        "address": "11111111111111111111111111111111"
      },
      "topHolders": [
        {
          "address": "7mj...",
          "percentageOwned": 15.2,
          "tokens": 152000000
        }
      ],
      "liquidity": {
        "deployer_percentage": 5.3,
        "top_10_percentage": 35.8
      }
    },
    "sentiment": {
      "twitter": {
        "score": 0.75,
        "sentiment": "positive",
        "recent_posts": 245
      },
      "reddit": {
        "score": 0.68,
        "sentiment": "positive",
        "recent_posts": 89
      }
    }
  },
  "verdict": "USDC is a well-established stablecoin with strong fundamentals. Both authorities are renounced, liquidity is distributed, and sentiment is positive.",
  "recommendations": [
    "Verified stablecoin - low risk",
    "Authorities properly renounced",
    "Strong community support"
  ],
  "analyzedAt": "2025-11-12T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid token address
- `404 Not Found`: Token not found on Solana
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Analysis failed

---

## Subscriptions

### POST /api/subscribe

Create a new subscription to monitor a token.

**Request:**
```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "tokenAddress": "So11111111111111111111111111111111111111112",
    "riskThreshold": 60,
    "priceChangeThreshold": 15,
    "telegramChatId": "123456789"
  }'
```

**Parameters:**
- `tokenAddress` (string, required): Token to monitor
- `riskThreshold` (number, optional): Alert if risk score > threshold (0-100, default: 50)
- `priceChangeThreshold` (number, optional): Alert if price change > threshold (%, default: 10)
- `telegramChatId` (string, optional): Telegram chat ID for alerts

**Response (201 Created):**
```json
{
  "id": "sub-001",
  "userId": "user-123",
  "tokenAddress": "So11111111111111111111111111111111111111112",
  "tokenSymbol": "SOL",
  "riskThreshold": 60,
  "priceChangeThreshold": 15,
  "status": "active",
  "createdAt": "2025-11-12T10:30:00Z"
}
```

### GET /api/subscribe

List all subscriptions for the current user.

**Request:**
```bash
curl -X GET http://localhost:3000/api/subscribe \
  -H "x-user-id: user-123"
```

**Response (200 OK):**
```json
{
  "subscriptions": [
    {
      "id": "sub-001",
      "tokenAddress": "So11111111111111111111111111111111111111112",
      "tokenSymbol": "SOL",
      "riskThreshold": 60,
      "priceChangeThreshold": 15,
      "status": "active",
      "alertsThisWeek": 3,
      "lastAlertAt": "2025-11-12T08:15:00Z"
    }
  ],
  "total": 1
}
```

### GET /api/subscribe/:id

Get details for a specific subscription.

**Request:**
```bash
curl -X GET http://localhost:3000/api/subscribe/sub-001 \
  -H "x-user-id: user-123"
```

**Response (200 OK):**
```json
{
  "id": "sub-001",
  "userId": "user-123",
  "tokenAddress": "So11111111111111111111111111111111111111112",
  "tokenSymbol": "SOL",
  "status": "active",
  "riskThreshold": 60,
  "priceChangeThreshold": 15,
  "currentPrice": 145.32,
  "currentRiskScore": 42,
  "alertsThisWeek": 3,
  "createdAt": "2025-11-12T09:00:00Z",
  "lastAlertAt": "2025-11-12T08:15:00Z"
}
```

### PATCH /api/subscribe/:id

Update a subscription.

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/subscribe/sub-001 \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "riskThreshold": 45,
    "status": "paused"
  }'
```

**Parameters:**
- `riskThreshold` (number, optional): New threshold
- `priceChangeThreshold` (number, optional): New change threshold
- `status` (string, optional): "active" or "paused"

**Response (200 OK):**
```json
{
  "id": "sub-001",
  "status": "paused",
  "riskThreshold": 45,
  "updatedAt": "2025-11-12T10:45:00Z"
}
```

### DELETE /api/subscribe/:id

Delete a subscription.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/subscribe/sub-001 \
  -H "x-user-id: user-123"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription deleted successfully"
}
```

---

## Dashboard

### GET /api/dashboard

Get dashboard statistics and analytics.

**Request:**
```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "x-user-id: user-123"
```

**Response (200 OK):**
```json
{
  "stats": {
    "activeSubscriptions": 3,
    "pausedSubscriptions": 1,
    "alertsThisWeek": 12,
    "alertsThisMonth": 47,
    "totalBalance": 250.50,
    "estimatedMonthlySpend": 11.75
  },
  "topTokens": [
    {
      "symbol": "SOL",
      "address": "So11111111111111111111111111111111111111112",
      "price": 145.32,
      "priceChange24h": 8.5,
      "riskScore": 42,
      "volume24h": 250000000
    }
  ],
  "recentAlerts": [
    {
      "id": "alert-001",
      "token": "SOL",
      "message": "Risk score increased to 75",
      "severity": "high",
      "timestamp": "2025-11-12T09:15:00Z"
    }
  ],
  "tierInfo": {
    "currentTier": "premium",
    "requestsUsed": 1250,
    "requestsLimit": 5000,
    "costPerAlert": 0.25
  }
}
```

---

## History

### GET /api/history

Get alert history with filtering options.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/history?limit=50&filter=delivered" \
  -H "x-user-id: user-123"
```

**Query Parameters:**
- `limit` (number, optional): Number of alerts to return (default: 50, max: 500)
- `filter` (string, optional): Filter by status - "all" | "delivered" | "failed" | "pending" (default: "all")
- `startDate` (string, optional): ISO 8601 date string (e.g., "2025-11-01T00:00:00Z")
- `endDate` (string, optional): ISO 8601 date string

**Response (200 OK):**
```json
{
  "alerts": [
    {
      "id": "alert-001",
      "token": "SOL",
      "address": "So11111111111111111111111111111111111111112",
      "riskScore": 82,
      "priceChange": 8.5,
      "status": "delivered",
      "deliveredAt": "2025-11-12T10:15:00Z",
      "subscriptionId": "sub-001"
    },
    {
      "id": "alert-002",
      "token": "USDC",
      "address": "EPjFWaLb3odcccccccccccccccccccccccccccccc",
      "riskScore": 95,
      "priceChange": 12.3,
      "status": "failed",
      "failureReason": "Webhook timeout",
      "triggeredAt": "2025-11-12T09:45:00Z",
      "subscriptionId": "sub-002"
    }
  ],
  "total": 247,
  "limit": 50,
  "filter": "delivered"
}
```

---

## Status

### GET /api/status

Get system status and health metrics.

**Request:**
```bash
curl -X GET http://localhost:3000/api/status \
  -H "x-user-id: user-123"
```

**Response (200 OK):**
```json
{
  "agent": {
    "pubkey": "111111111111111111111111111111112",
    "balance": 50.25,
    "tier": "premium",
    "status": "operational"
  },
  "subscriptions": {
    "active": 3,
    "paused": 1,
    "total": 4
  },
  "monitored": [
    {
      "symbol": "SOL",
      "address": "So11111111111111111111111111111111111111112",
      "price": 145.32,
      "priceChange24h": 8.5,
      "riskScore": 42,
      "status": "active",
      "alerts24h": 2
    }
  ],
  "alerts": {
    "lastTriggered": "2025-11-12T10:15:00Z",
    "thisWeek": 12,
    "thisMonth": 47
  },
  "billing": {
    "nextBillingDate": "2025-12-12",
    "costPerAlert": 0.25,
    "estimatedMonthly": 11.75,
    "upcomingCharges": 5.50
  },
  "health": {
    "webhookStatus": "healthy",
    "lastHealthCheck": "2025-11-12T10:55:00Z",
    "averageResponseTime": "0.23s",
    "successRate": "98.9%"
  }
}
```

---

## Switchboard Oracle

### GET /api/switchboard/price

Get current price from Switchboard Oracle.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/switchboard/price?pair=SOL/USD" \
  -H "x-user-id: user-123"
```

**Parameters:**
- `pair` (string, required): Price pair (e.g., "SOL/USD", "ETH/USD")

**Response (200 OK):**
```json
{
  "pair": "SOL/USD",
  "price": 145.32,
  "source": "switchboard",
  "timestamp": "2025-11-12T10:55:32Z",
  "confidence": 0.98
}
```

### POST /api/switchboard/monitor

Start monitoring a token with Switchboard Oracle.

**Request:**
```bash
curl -X POST http://localhost:3000/api/switchboard/monitor \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "tokenAddress": "So11111111111111111111111111111111111111112",
    "priceFeed": "SOL/USD"
  }'
```

**Response (201 Created):**
```json
{
  "id": "monitor-001",
  "tokenAddress": "So11111111111111111111111111111111111111112",
  "priceFeed": "SOL/USD",
  "status": "monitoring",
  "startedAt": "2025-11-12T10:55:32Z"
}
```

---

## Telegram

### POST /api/telegram/webhook/:userId

Telegram bot webhook for receiving updates.

**Parameters:**
- `userId` (string, required): User ID from Telegram

**Payload (from Telegram):**
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "is_bot": false,
      "first_name": "John"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "date": 1636920932,
    "text": "/subscribe SOL"
  }
}
```

**Webhook Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription created for SOL"
}
```

---

## Health

### GET /api/health

Check API health status.

**Request:**
```bash
curl http://localhost:3000/api/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-12T10:55:32Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "telegram": "connected"
  }
}
```

---

## Error Codes

### Standard HTTP Status Codes

| Code | Message | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid parameters or request format |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | User lacks permission for resource |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Response Format

```json
{
  "error": "INVALID_TOKEN",
  "message": "The provided token address is not valid",
  "statusCode": 400,
  "timestamp": "2025-11-12T10:55:32Z"
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| INVALID_ADDRESS | Invalid Solana address format |
| TOKEN_NOT_FOUND | Token not found on blockchain |
| UNAUTHORIZED | Missing or invalid x-user-id header |
| RATE_LIMITED | Too many requests |
| QUOTA_EXCEEDED | User quota exceeded |
| ANALYSIS_FAILED | Token analysis failed |
| WEBHOOK_ERROR | Webhook delivery failed |

---

## Examples

### Complete Workflow Example

```bash
#!/bin/bash

USER_ID="user-123"
BASE_URL="http://localhost:3000"

# 1. Analyze a token
echo "1. Analyzing token..."
ANALYSIS=$(curl -s -X POST $BASE_URL/api/analyze \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{
    "tokenAddress": "So11111111111111111111111111111111111111112"
  }')

echo $ANALYSIS | jq '.'

# 2. Create a subscription
echo -e "\n2. Creating subscription..."
SUBSCRIPTION=$(curl -s -X POST $BASE_URL/api/subscribe \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{
    "tokenAddress": "So11111111111111111111111111111111111111112",
    "riskThreshold": 60,
    "priceChangeThreshold": 15
  }')

SUBSCRIPTION_ID=$(echo $SUBSCRIPTION | jq -r '.id')
echo "Subscription ID: $SUBSCRIPTION_ID"

# 3. Get dashboard stats
echo -e "\n3. Fetching dashboard..."
curl -s -X GET $BASE_URL/api/dashboard \
  -H "x-user-id: $USER_ID" | jq '.'

# 4. View subscription history
echo -e "\n4. Viewing alert history..."
curl -s -X GET "$BASE_URL/api/history?limit=10&filter=delivered" \
  -H "x-user-id: $USER_ID" | jq '.'

# 5. Get system status
echo -e "\n5. Checking system status..."
curl -s -X GET $BASE_URL/api/status \
  -H "x-user-id: $USER_ID" | jq '.'
```

### JavaScript/Node.js Example

```javascript
const API_BASE = 'http://localhost:3000';
const USER_ID = 'user-123';

async function analyzeToken(address) {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
    },
    body: JSON.stringify({ tokenAddress: address }),
  });
  
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

async function subscribe(address, threshold) {
  const response = await fetch(`${API_BASE}/api/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
    },
    body: JSON.stringify({
      tokenAddress: address,
      riskThreshold: threshold,
    }),
  });
  
  return response.json();
}

// Usage
const analysis = await analyzeToken('So11111111111111111111111111111111111111112');
console.log('Risk Score:', analysis.sentinelScore);

const subscription = await subscribe('So11111111111111111111111111111111111111112', 60);
console.log('Subscription ID:', subscription.id);
```

---

## Rate Limiting Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1636920000
Retry-After: 60
```

When rate limited, responses include:
- **Retry-After**: Seconds until next request allowed
- **Status Code**: 429 (Too Many Requests)

---

## Pagination

List endpoints support pagination via query parameters:

```bash
curl "http://localhost:3000/api/history?limit=50&offset=0"
```

**Parameters:**
- `limit` (number): Items per page (default: 50, max: 500)
- `offset` (number): Number of items to skip (default: 0)

**Response includes:**
```json
{
  "data": [...],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 247,
    "hasMore": true
  }
}
```

---

## Webhooks

Subscribe to real-time events via webhooks:

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/webhook",
    "events": ["alert.triggered", "alert.delivered", "subscription.created"]
  }'
```

**Webhook Events:**
- `alert.triggered`: Alert condition met
- `alert.delivered`: Alert sent successfully
- `alert.failed`: Alert delivery failed
- `subscription.created`: New subscription
- `subscription.updated`: Subscription modified
- `subscription.deleted`: Subscription removed

---

Last Updated: November 12, 2025
