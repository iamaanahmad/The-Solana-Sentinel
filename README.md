<div align="center">

# The Solana Sentinel 🛡️

### Your AI-Powered Shield for Secure Solana Trading

**Instantly analyze any Solana token for security risks. The Solana Sentinel combines live on-chain data with AI-powered sentiment analysis to deliver a comprehensive, easy-to-understand risk report.**

<p align="center"><img src="https://i.ibb.co/5hMp2mkq/image.png" alt="The Solana Sentinel Banner" width="800"/></p>

</div>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini"/>
  <img src="https://img.shields.io/badge/Nosana-1A1A1A?style=for-the-badge" alt="Nosana"/>
</p>

The Solana Sentinel is a cutting-edge web application that provides real-time, AI-driven risk analysis for Solana tokens. By synthesizing live on-chain data with decentralized AI sentiment analysis, it generates a comprehensive "Sentinel Score" to help users identify potentially malicious projects before they invest.

## 🔗 Live Demo & Video

- **Try it live**: [the-solana-sentinel.vercel.app](https://the-solana-sentinel.vercel.app/)
- **Watch the demo**: [YouTube](https://www.youtube.com/watch?v=4GORq9QqTrA)

---

## ✨ Core Features

- **🤖 Gemini-Powered Verdict**: Leverages Google's Gemini model via Genkit to provide a nuanced, human-readable summary of a token's overall risk profile.
- **🔗 Real-Time On-Chain Forensics**: Fetches and analyzes critical on-chain metrics from the Helius API, including:
  - ✅ **Contract Authorities**: Checks if developers have renounced control over minting and freezing tokens.
  - 📊 **Holder Concentration**: Calculates the supply percentage held by top wallets to detect whale dominance.
  - 💧 **Liquidity Analysis**: Assesses the deployer's share of the liquidity pool to identify potential rug-pull risks.
- **☁️ Decentralized AI Sentiment**: Offloads social media sentiment analysis to the Nosana Network, a decentralized GPU grid, for unbiased and scalable compute.
- **💯 Holistic Sentinel Score**: Our proprietary algorithm synthesizes on-chain and off-chain data into a single, intuitive risk score (0-100).
- **📈 Dynamic & Interactive Reports**: Presents the full analysis in a clean, responsive, and beautifully designed interface built with Next.js and ShadCN UI.

---

## ⚙️ How It Works

The application follows a simple but powerful serverless architecture to deliver real-time analysis on demand.

**User Input** `(Token Address)` ───> **Server Action** `(Next.js)` ───> **Data Fetching** `([Helius API] & [Nosana Network])` ───> **AI Analysis** `(Google Genkit)` ───> **Final Report** `(UI)`

---

## 🚀 Technology Stack

- **Framework**: Next.js (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & ShadCN UI
- **AI Toolkit**: Google Genkit (with Gemini)
- **On-Chain Data**: Helius API
- **Decentralized Compute**: Nosana Network
- **Hosting**: Vercel / Firebase Hosting

---

## 🛠️ Getting Started

Follow these instructions to get a local copy up and running for development and testing.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Docker Desktop (must be running)
- Nosana CLI installed globally (`npm install -g @nosana/cli`)

### 1. Clone the Repository

```bash
git clone https://github.com/iamaanahmad/The-Solana-Sentinel.git
cd The-Solana-Sentinel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a new file named `.env` by copying `.env.example`. Then, fill in the required secret keys:

```bash
# Get your free API key from https://www.helius.dev/
HELIUS_API_KEY="your-helius-api-key"

# This will be generated in the Nosana Job Deployment step below
NOSANA_JOB_ID="your-nosana-job-id"
```

### 4. Deploy the Nosana Sentiment Job

The sentiment analysis script is located in the `nosana-job` directory. You need to deploy it to the Nosana Network to get your `NOSANA_JOB_ID`.

**a. Navigate to the Job Directory**

```bash
cd nosana-job
```

**b. Build & Push the Docker Image**
*(Replace `your-docker-hub-username` with your actual Docker Hub username.)*

```bash
# Make sure Docker Desktop is running!
docker build -t your-docker-hub-username/solana-sentinel-sentiment:v1 .
docker push your-docker-hub-username/solana-sentinel-sentiment:v1
```

**c. Update `nosana.json`**

Open `nosana-job/nosana.json` and replace the placeholder `image` value with the name of the image you just pushed.

**d. Publish the Job to Nosana**

This command deploys your job and returns its unique ID.

```bash
nosana job publish
```

**e. Update Environment File**

Copy the **Job Address** from the command output and paste it as the `NOSANA_JOB_ID` in your root `.env` file.

### 5. Run the Development Server

Navigate back to the project root and start the app.

```bash
cd ..
npm run dev
```

Open `http://localhost:3000` in your browser to see the application.


## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

<p align="center">Made with ❤️ for the future of decentralized AI.</p>
