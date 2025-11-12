# Solana Sentinel CLI Tool

A comprehensive command-line interface for monitoring Solana token risk and managing subscription-based alerts.

## Installation

```bash
# Global installation
npm install -g @solana/sentinel-cli

# Or use directly with npx
npx sentinel --help
```

## Quick Start

```bash
# Analyze a token
sentinel analyze EPjFWaLb3odcccccccccccccccccccccccccccccc

# Create a monitoring subscription
sentinel subscribe So11111111111111111111111111111111111111112

# Check your balance
sentinel balance

# View alert history
sentinel history

# Check subscription status
sentinel status
```

## Commands

### `sentinel analyze <token-address>`

Perform token sentiment analysis and risk assessment.

**Usage:**
```bash
sentinel analyze EPjFWaLb3odcccccccccccccccccccccccccccccc [options]
```

**Options:**
- `-f, --full` - Show full analysis report with detailed risk factors and market data
- `-j, --json` - Output as JSON for programmatic integration

**Output Includes:**
- Market sentiment score (0-1) with drivers
- Risk score (0-100) with factor breakdown
- Market data (price, volume, holders, price changes)
- Active alerts and recent alert history

**Examples:**

```bash
# Quick analysis
sentinel analyze EPjFWaLb3odcccccccccccccccccccccccccccccc

# Full report with all details
sentinel analyze EPjFWaLb3odcccccccccccccccccccccccccccccc --full

# JSON output for integration
sentinel analyze EPjFWaLb3odcccccccccccccccccccccccccccccc --json > token-analysis.json

# Combined: Full JSON report
sentinel analyze EPjFWaLb3odcccccccccccccccccccccccccccccc --full --json
```

---

### `sentinel subscribe <token-address>`

Create a price monitoring subscription with customizable risk thresholds.

**Usage:**
```bash
sentinel subscribe So11111111111111111111111111111111111111112 [options]
```

**Options:**
- `-t, --threshold <number>` - Risk threshold 0-100 (default: 75)
- `-w, --webhook <url>` - Webhook URL for alert delivery
- `-f, --feed <address>` - Switchboard price feed address
- `-p, --pubkey <address>` - Agent wallet public key
- `--save` - Save configuration locally (default: true)

**Configuration Files:**
- `.sentinel-config.json` - Stores your preferences locally
  - Wallet public key
  - Webhook URLs
  - Price feed addresses
  - Subscription details

**Examples:**

```bash
# Interactive setup (prompts for missing values)
sentinel subscribe EPjFWaLb3odcccccccccccccccccccccccccccccc

# Specify all values at once
sentinel subscribe EPjFWaLb3odcccccccccccccccccccccccccccccc \
  --threshold 70 \
  --webhook https://your-webhook.com/alerts \
  --pubkey EPjFWaLb3odcccccccccccccccccccccccccccccc \
  --feed EPjFWaLb3odcccccccccccccccccccccccccccccc

# Subscribe and save config for future use
sentinel subscribe EPjFWaLb3odcccccccccccccccccccccccccccccc \
  --threshold 60 \
  --webhook https://hooks.slack.com/... \
  --save

# Use previously saved config
sentinel subscribe EPjFWaLb3odcccccccccccccccccccccccccccccc
```

**Response:**
```json
{
  "id": "sub-abc123",
  "status": "active",
  "tokenAddress": "EPjFWaLb3odcccccccccccccccccccccccccccccc",
  "riskThreshold": 75,
  "webhookUrl": "https://your-webhook.com/alerts",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### `sentinel balance`

Check your account balance and subscription usage statistics.

**Usage:**
```bash
sentinel balance [options]
```

**Options:**
- `-p, --pubkey <address>` - Agent wallet public key (optional)
- `-j, --json` - Output as JSON format

**Display Information:**
- Current balance in USDC
- Subscription tier (basic/premium)
- Cost per alert and remaining alerts
- Estimated usage (months until depletion)
- Recent transaction history
- Low balance warnings

**Examples:**

```bash
# Check balance with wallet address
sentinel balance --pubkey EPjFWaLb3odcccccccccccccccccccccccccccccc

# JSON output
sentinel balance --pubkey EPjFWaLb3odcccccccccccccccccccccccccccccc --json

# Display sample data (without pubkey)
sentinel balance
```

**Sample Output:**
```
💰 Balance Information
  Current Balance: $245.82 USDC
  Tier: PREMIUM
  Status: Active

📊 Usage Statistics
  Cost per Alert: $0.25
  Alerts Remaining: 983
  Estimated Usage: 81 months
  Recent Transactions:
    • Deposit: +$500.00 on Jan 10
    • Alert Cost: -$2.50 on Jan 15
    • Alert Cost: -$1.25 on Jan 15
```

---

### `sentinel history`

View alert history and activity logs.

**Usage:**
```bash
sentinel history [options]
```

**Options:**
- `-l, --limit <number>` - Number of alerts to show (default: 10)
- `-f, --filter <type>` - Filter by type: `all|triggered|failed` (default: all)
- `-p, --pubkey <address>` - Agent wallet public key (optional)
- `-j, --json` - Output as JSON

**Displays:**
- Alert timestamp and delivery status
- Token address and risk score
- Price changes that triggered the alert
- Failure reasons (if applicable)
- Success rate statistics
- Response time metrics

**Examples:**

```bash
# Last 10 alerts
sentinel history

# Show last 25 alerts
sentinel history --limit 25

# Show only triggered alerts
sentinel history --filter triggered --limit 20

# Show failed deliveries
sentinel history --filter failed

# JSON export
sentinel history --limit 50 --json > alerts.json

# With specific pubkey
sentinel history --pubkey EPjFWaLb3odcccccccccccccccccccccccccccccc --limit 15
```

**Output Example:**
```
📜 Alert History

📊 Summary Statistics
  Period: Last 30 days
  Total alerts: 47
  Successful: 45 | Failed: 2
  Success rate: 95.7%

🔔 Recent Alerts
  ID          | Token  | Risk | Change | Status    | Time
  alert-001   | USDC   | 82   | +8.5%  | delivered | 10s ago
  alert-002   | SOL    | 95   | +12.3% | delivered | 45s ago
  alert-003   | USDC   | 45   | +2.1%  | pending   | 5m ago
  alert-004   | SOL    | 88   | +11.2% | failed    | 1h ago
```

---

### `sentinel status`

Check subscription status and monitoring health.

**Usage:**
```bash
sentinel status [options]
```

**Options:**
- `-p, --pubkey <address>` - Agent wallet public key (optional)
- `-j, --json` - Output as JSON

**Information Provided:**
- Agent wallet status and tier
- Active subscriptions count
- Monitored tokens with current prices and risk scores
- Recent alert activity
- Webhook health status
- Next billing date and estimated charges

**Examples:**

```bash
# Check status
sentinel status

# With specific wallet
sentinel status --pubkey EPjFWaLb3odcccccccccccccccccccccccccccccc

# JSON output for monitoring
sentinel status --json | jq '.health'

# Export full status
sentinel status --json > status-report.json
```

**Sample Output:**
```
📊 Subscription Status

👤 Agent Information
  Pubkey: EPjFWaLb3odcccccccccccccccccccccccccccccc
  Balance: $245.82 USDC
  Tier: PREMIUM
  Status: active

📋 Subscriptions
  Active: 3
  Paused: 1
  Total: 4

🔍 Monitored Tokens
  Symbol | Price    | 24h Change | Risk | 24h Alerts
  SOL    | $142.35  | +5.2%      | 45   | 2
  USDC   | $1.00    | +0.1%      | 18   | 0
  ORCA   | $2.45    | -8.3%      | 72   | 5

🏥 System Health
  Webhook: healthy
  Success rate: 98.9%
  Response time: 0.23s
```

---

## Configuration Management

### Local Configuration File

The CLI automatically creates and manages `.sentinel-config.json` in your current working directory.

**Example Configuration:**
```json
{
  "pubkey": "EPjFWaLb3odcccccccccccccccccccccccccccccc",
  "webhookUrl": "https://your-webhook.com/alerts",
  "feedAddresses": {
    "SOL": "EPjFWaLb3odcccccccccccccccccccccccccccccc",
    "USDC": "EPjFWaLb3odcccccccccccccccccccccccccccccc"
  },
  "subscriptions": [
    {
      "id": "sub-001",
      "token": "EPjFWaLb3odcccccccccccccccccccccccccccccc",
      "threshold": 75
    }
  ]
}
```

### Environment Variables

```bash
# Set API endpoint (default: http://localhost:9002)
export SENTINEL_API_URL=https://api.sentinel.local
sentinel analyze EPjFWaLb3odcccccccccccccccccccccccccccccc

# Set webhook URL
export SENTINEL_WEBHOOK=https://hooks.slack.com/...
sentinel subscribe EPjFWaLb3odcccccccccccccccccccccccccccccc
```

---

## API Integration

All CLI commands interact with the Solana Sentinel REST API. The CLI automatically handles:

- Authentication via headers
- Rate limiting (429 responses with Retry-After)
- Error handling and retries
- JSON request/response formatting

### Example: Programmatic Usage

```bash
#!/bin/bash

# Analyze multiple tokens
tokens=(
  "EPjFWaLb3odcccccccccccccccccccccccccccccc"
  "So11111111111111111111111111111111111111112"
  "orcaEKTdK7LKz57chysJ34T1R74Vj2M7XCJB3eJ5cS"
)

for token in "${tokens[@]}"; do
  sentinel analyze "$token" --json >> analyses.jsonl
done

# Create subscriptions from file
cat subscriptions.json | jq -r '.tokens[]' | while read token; do
  sentinel subscribe "$token" --threshold 70
done

# Export alert history
sentinel history --limit 100 --json | jq '.alerts[] | select(.status == "delivered")' > delivered-alerts.json
```

---

## Troubleshooting

### Connection Issues

**Error:** `Cannot connect to API at http://localhost:9002`

**Solutions:**
```bash
# Check API is running
curl http://localhost:9002/api/health

# Set custom API URL
sentinel status --api-url http://your-server:9002

# Or use environment variable
export SENTINEL_API_URL=http://your-server:9002
sentinel analyze EPjFWaLb3odcccccccccccccccccccccccccccccc
```

### Rate Limiting

**Error:** `429 Too Many Requests`

**Solutions:**
```bash
# Add delay between commands
for token in $tokens; do
  sentinel analyze "$token"
  sleep 1  # 1 second delay
done

# Check rate limit status
sentinel status

# Upgrade to premium tier for higher limits
# Basic: 100 requests/minute
# Premium: 500 requests/minute
```

### Configuration Issues

**Error:** `Config file not found`

**Solutions:**
```bash
# Recreate config interactively
sentinel subscribe EPjFWaLb3odcccccccccccccccccccccccccccccc --save

# Or manually create
cat > .sentinel-config.json << EOF
{
  "pubkey": "YOUR_PUBKEY",
  "webhookUrl": "YOUR_WEBHOOK_URL"
}
EOF
```

### Invalid Token Address

**Error:** `Invalid Solana token address`

**Solutions:**
```bash
# Verify token is 44 characters
echo "EPjFWaLb3odcccccccccccccccccccccccccccccc" | wc -c

# Get token address from blockchain
solana token list | grep "TOKEN_NAME"

# Or use devnet token for testing
# Devnet USDC: EPjFWaLb3odcccccccccccccccccccccccccccccc
```

---

## Performance Tips

### Batch Operations

```bash
# Use jq for batch analysis
cat tokens.json | jq -r '.[]' | xargs -P 4 -I {} sentinel analyze {} --json
```

### Caching Results

```bash
# Cache analysis results
mkdir -p cache
sentinel analyze EPjFWaLb3odcccccccccccccccccccccccccccccc --json > cache/token.json

# Use cached data
jq '.sentiment' cache/token.json
```

### Scheduled Monitoring

```bash
# Crontab: Check status every hour
0 * * * * /usr/local/bin/sentinel status --json >> /var/log/sentinel.log

# Using systemd timer
[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
```

---

## Output Formats

### JSON Output

All commands support `--json` flag for structured output.

```bash
# Pretty-printed JSON
sentinel analyze EPjFWaLb3odcccccccccccccccccccccccccccccc --json | jq

# Specific field extraction
sentinel balance --json | jq '.balance'

# JSON Lines (streaming)
sentinel history --limit 100 --json | jq -c '.[]' > alerts.jsonl
```

### Colored Terminal Output

Default terminal output uses color coding:
- 🟢 Green: Success, positive sentiment
- 🔴 Red: Error, negative sentiment
- 🟡 Yellow: Warning, neutral sentiment
- 🔵 Blue: Info messages

Disable colors:
```bash
NO_COLOR=1 sentinel analyze EPjFWaLb3odcccccccccccccccccccccccccccccc
```

---

## Advanced Usage

### Custom Webhook Integration

```bash
# Create subscription with Slack webhook
sentinel subscribe EPjFWaLb3odcccccccccccccccccccccccccccccc \
  --webhook "https://hooks.slack.com/services/YOUR/WEBHOOK" \
  --threshold 70

# Or Discord
sentinel subscribe EPjFWaLb3odcccccccccccccccccccccccccccccc \
  --webhook "https://discordapp.com/api/webhooks/..." \
  --threshold 70
```

### Monitoring Multiple Tokens

```bash
#!/bin/bash

# Monitor top 10 tokens
tokens=(
  "EPjFWaLb3odcccccccccccccccccccccccccccccc"  # USDC
  "So11111111111111111111111111111111111111112" # SOL
  "orcaEKTdK7LKz57chysJ34T1R74Vj2M7XCJB3eJ5cS" # ORCA
)

for token in "${tokens[@]}"; do
  echo "Analyzing $token..."
  sentinel analyze "$token" --json | jq '.sentiment.score'
  sleep 0.5
done
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Monitor Tokens
  run: |
    npm install -g @solana/sentinel-cli
    sentinel analyze ${{ env.TOKEN_ADDRESS }} --json > analysis.json
    
- name: Upload Results
  uses: actions/upload-artifact@v2
  with:
    name: token-analysis
    path: analysis.json
```

---

## Support & Contributing

- **GitHub:** https://github.com/solana-sentinel/cli
- **Documentation:** https://docs.sentinel.local
- **Issues:** Report via GitHub Issues
- **Community:** Join our Discord server

---

## Version History

### v1.0.0 (Current)
- Initial CLI release
- 5 core commands: analyze, subscribe, balance, history, status
- Local configuration management
- JSON export support
- Rate limiting integration
- Color-coded terminal output
- Comprehensive error handling

---

## License

MIT - See LICENSE file for details
