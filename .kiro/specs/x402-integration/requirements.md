# Requirements Document

## Introduction

The Solana Sentinel x402 Integration transforms the existing AI-powered token risk analysis platform into a composable, autonomous agent that leverages the x402 protocol for payments, access control, and agent-to-agent communication. This integration enables the Sentinel to operate as a trustless agent within the Solana ecosystem, accepting payments for premium analysis, providing signed attestations, and interacting with other agents and oracle feeds. The goal is to position the project as a top contender for the Solana X402 Hackathon prizes across multiple tracks: Best Trustless Agent ($10K), Best x402 API Integration ($10K), Best x402 Agent Application ($20K), and Switchboard Bounty ($5K).

## Glossary

- **Sentinel System**: The Solana Sentinel application, including its frontend, backend API, and AI analysis components
- **x402 Protocol**: A protocol for agent-to-agent payments, access control, and communication on Solana
- **Agent**: An autonomous software entity that can execute tasks, make payments, and communicate with other agents
- **Helius API**: The on-chain data provider used by the Sentinel System for token forensics
- **Nosana Network**: The decentralized GPU compute network used for sentiment analysis
- **Switchboard Oracle**: A decentralized oracle network providing real-time data feeds on Solana
- **Attestation**: A cryptographically signed statement or report verifying analysis results
- **USDC**: USD Coin, the stablecoin used for x402 payments
- **Risk Report**: A comprehensive analysis document containing on-chain metrics, sentiment data, and AI-generated risk assessment
- **Sentinel Score**: A numerical risk rating (0-100) synthesized from on-chain and off-chain data
- **Premium Analysis**: Enhanced analysis features requiring payment, including real-time alerts and detailed forensics
- **Agent Endpoint**: An API endpoint that accepts x402 protocol requests and returns structured responses

## Requirements

### Requirement 1

**User Story:** As a developer integrating with the Sentinel System, I want to access the risk analysis API using x402 protocol headers, so that I can pay for analysis services programmatically and receive authenticated responses

#### Acceptance Criteria

1. WHEN a client sends an HTTP request to the analysis endpoint with valid x402 headers, THE Sentinel System SHALL validate the x402 payment proof and process the analysis request
2. WHEN the x402 payment validation fails, THE Sentinel System SHALL return an HTTP 402 status code with a payment request containing the required USDC amount and recipient address
3. WHEN the analysis completes successfully, THE Sentinel System SHALL return the Risk Report with x402 receipt headers containing the transaction signature and timestamp
4. THE Sentinel System SHALL log all x402 payment requests and receipts to a persistent storage system for transparency and audit purposes
5. WHERE the client requests premium analysis features, THE Sentinel System SHALL require a payment amount of at least 0.1 USDC

### Requirement 2

**User Story:** As a token holder, I want to receive cryptographically signed attestations of risk analysis results, so that I can verify the authenticity and integrity of the Sentinel's findings

#### Acceptance Criteria

1. WHEN the Sentinel System completes a Risk Report, THE Sentinel System SHALL generate a cryptographic signature using the Sentinel's private key
2. THE Sentinel System SHALL include the signature, signing public key, and timestamp in the Risk Report response
3. WHEN a user requests attestation verification, THE Sentinel System SHALL provide a verification endpoint that validates the signature against the report data
4. THE Sentinel System SHALL store attestation metadata on Solana blockchain including the report hash, timestamp, and Sentinel Score
5. WHERE the Risk Report indicates high risk (Sentinel Score below 30), THE Sentinel System SHALL include additional forensic evidence in the attestation

### Requirement 3

**User Story:** As an autonomous agent, I want to subscribe to real-time token risk alerts from the Sentinel System, so that I can react to emerging threats without manual intervention

#### Acceptance Criteria

1. WHEN an agent registers a subscription with a token address and webhook URL, THE Sentinel System SHALL store the subscription configuration with the agent's payment credentials
2. WHILE a subscription is active, THE Sentinel System SHALL monitor the subscribed token using Switchboard Oracle feeds for price volatility, liquidity changes, and holder concentration shifts
3. WHEN a monitored metric exceeds the configured threshold, THE Sentinel System SHALL trigger a re-analysis and send the updated Risk Report to the agent's webhook URL
4. THE Sentinel System SHALL deduct the subscription fee (0.05 USDC per alert) from the agent's prepaid balance
5. IF the agent's prepaid balance falls below 0.1 USDC, THEN THE Sentinel System SHALL pause the subscription and notify the agent via webhook

### Requirement 4

**User Story:** As a Telegram user, I want to interact with the Sentinel System through a bot interface, so that I can analyze tokens and receive alerts without using the web application

#### Acceptance Criteria

1. WHEN a user sends a token address to the Telegram bot, THE Sentinel System SHALL initiate a risk analysis and return a formatted summary within 30 seconds
2. THE Sentinel System SHALL support Telegram commands including /analyze, /subscribe, /balance, and /help
3. WHEN a user executes the /subscribe command with a token address, THE Sentinel System SHALL create an alert subscription and provide payment instructions
4. WHERE a user has an active subscription, THE Sentinel System SHALL send Telegram notifications when risk alerts are triggered
5. THE Sentinel System SHALL authenticate Telegram users and associate their chat ID with their Solana wallet address for payment tracking

### Requirement 5

**User Story:** As a DeFi protocol, I want to integrate Switchboard oracle feeds into the Sentinel's monitoring system, so that risk assessments reflect real-time market conditions

#### Acceptance Criteria

1. THE Sentinel System SHALL subscribe to Switchboard price feeds for all analyzed tokens where available
2. WHEN a token's price volatility exceeds 20% within a 1-hour window, THE Sentinel System SHALL trigger an automatic re-analysis
3. WHEN a token's liquidity pool balance decreases by more than 30%, THE Sentinel System SHALL update the Sentinel Score and notify subscribed agents
4. THE Sentinel System SHALL incorporate Switchboard feed data into the Risk Report including current price, 24-hour volume, and liquidity depth
5. WHERE Switchboard feed data is unavailable for a token, THE Sentinel System SHALL indicate this limitation in the Risk Report and reduce confidence scoring by 10 points

### Requirement 6

**User Story:** As a security researcher, I want to query historical risk analysis data through the x402 API, so that I can identify patterns and trends in token risk profiles

#### Acceptance Criteria

1. WHEN a client requests historical data for a token address with valid x402 payment, THE Sentinel System SHALL return all Risk Reports for that token from the past 90 days
2. THE Sentinel System SHALL support query parameters for date range, minimum Sentinel Score, and maximum result count
3. THE Sentinel System SHALL charge 0.02 USDC per historical report returned in the query results
4. THE Sentinel System SHALL include trend analysis showing how the Sentinel Score has changed over time
5. WHERE more than 50 historical reports match the query, THE Sentinel System SHALL implement pagination with a maximum of 50 results per page

### Requirement 7

**User Story:** As an agent developer, I want to deploy the Sentinel System as a composable agent on Solana devnet, so that I can test integration with other agents and protocols

#### Acceptance Criteria

1. THE Sentinel System SHALL deploy a Solana program to devnet that stores agent configuration, payment accounts, and attestation records
2. THE Sentinel System SHALL provide a CLI tool for agent registration, configuration updates, and balance management
3. WHEN an agent registers through the CLI, THE Sentinel System SHALL create a program-derived address (PDA) for the agent's payment account
4. THE Sentinel System SHALL support agent-to-agent messaging by accepting task requests in JSON format and returning structured Risk Report responses
5. THE Sentinel System SHALL maintain uptime of at least 95% on devnet during the hackathon evaluation period

### Requirement 8

**User Story:** As a project administrator, I want comprehensive documentation and demo materials, so that hackathon judges can understand and evaluate the x402 integration

#### Acceptance Criteria

1. THE Sentinel System SHALL include a README file with setup instructions, x402 flow diagrams, and API endpoint documentation
2. THE Sentinel System SHALL provide a demo video of no more than 3 minutes showing real-time token analysis, x402 payment flow, and agent-to-agent interaction
3. THE Sentinel System SHALL include architecture documentation explaining the integration of x402, Switchboard, Helius, and Nosana components
4. THE Sentinel System SHALL provide example code snippets for common integration scenarios including API calls, subscription management, and attestation verification
5. THE Sentinel System SHALL document all environment variables, API keys, and configuration requirements for deployment

### Requirement 9

**User Story:** As a token analyst, I want the Sentinel System to provide different analysis tiers based on payment amount, so that I can choose the appropriate level of detail for my needs

#### Acceptance Criteria

1. THE Sentinel System SHALL offer three analysis tiers: Basic (free), Standard (0.1 USDC), and Premium (0.5 USDC)
2. WHEN a user requests Basic analysis, THE Sentinel System SHALL return only the Sentinel Score and high-level risk category
3. WHEN a user requests Standard analysis with valid payment, THE Sentinel System SHALL return the full Risk Report including on-chain metrics and sentiment analysis
4. WHEN a user requests Premium analysis with valid payment, THE Sentinel System SHALL include Switchboard oracle data, historical trend analysis, and signed attestation
5. THE Sentinel System SHALL clearly document the features included in each tier in the API response and documentation

### Requirement 10

**User Story:** As a compliance officer, I want all x402 transactions and analysis requests to be logged immutably, so that I can audit the system's operations and payment flows

#### Acceptance Criteria

1. THE Sentinel System SHALL record all x402 payment transactions to the Solana blockchain with metadata including request timestamp, token address, and analysis tier
2. THE Sentinel System SHALL emit events for each analysis request containing the requester's public key, payment amount, and request parameters
3. WHEN an analysis completes, THE Sentinel System SHALL store the Risk Report hash on-chain linked to the original payment transaction
4. THE Sentinel System SHALL provide a public dashboard displaying aggregate statistics including total analyses performed, total USDC collected, and average Sentinel Scores
5. THE Sentinel System SHALL retain detailed logs for a minimum of 180 days in a queryable format accessible through the x402 API
