<div align="center">

# The Solana Sentinel 🛡️🔍

<a href="https://earn.superteam.fun/agent-challenge">
<img src="https://i.ibb.co/5Mp2mkq/image.png" alt="The Solana Sentinel Banner" width="800"/>
</a>

### Your AI-Powered Shield Against Risky Tokens on the Solana Blockchain

[![Nosana Agent Challenge](https://img.shields.io/badge/Nosana_Builders'_Challenge-Agents_101-blue?style=for-the-badge)](https://earn.superteam.fun/agent-challenge)

</div>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Google_Genkit-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Genkit"/>
  <img src="https://img.shields.io/badge/Nosana-1A1A1A?style=for-the-badge" alt="Nosana"/>
</p>

The Solana Sentinel is a cutting-edge web application that provides real-time, AI-driven risk analysis for Solana tokens. By synthesizing live on-chain data with decentralized AI sentiment analysis, it generates a comprehensive "Sentinel Score" to help users identify potentially malicious projects before they invest.

---

## ✨ Core Features

- **🤖 AI-Powered Final Verdict**: Leverages Google's Gemini model via Genkit to provide a nuanced, human-readable summary of a token's overall risk profile.
- **🔗 Live On-Chain Forensics**: Fetches and analyzes critical on-chain metrics in real-time from the Helius API, including:
  - ✅ Mint & Freeze Authority: Checks if developers have renounced control.
  - 📊 Holder Concentration: Calculates the supply percentage held by top wallets.
  - 💧 Liquidity Distribution: Assesses the deployer's share of the liquidity pool.
- **☁️ Decentralized Sentiment Analysis**: Offloads social media sentiment analysis to the Nosana Network, a decentralized GPU grid, ensuring unbiased and scalable compute.
- **💯 Holistic Sentinel Score**: A proprietary algorithm synthesizes on-chain and off-chain data into a single, easy-to-understand risk score (0-100).
- **📈 Dynamic & Interactive Reports**: Presents the full analysis in a clean, responsive, and beautifully designed interface built with Next.js and ShadCN UI.

---

## ⚙️ How It Works

The application follows a simple but powerful serverless architecture to deliver real-time analysis.

**User Input** `(Token Address)` ───> **Server Action** `(Next.js)` ───> **Data Fetching** `([Helius API] & [Nosana Network])` ───> **AI Analysis** `(Google Genkit)` ───> **Final Report** `(UI)`

---

## 🚀 Technology Stack

- **Framework**: Next.js (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & ShadCN UI
- **AI Toolkit**: Google Genkit
- **On-Chain Data**: Helius API
- **Decentralized Compute**: Nosana Network
- **Hosting**: Firebase Hosting / Vercel

---

## ⚠️ A Note on the Mastra Framework Requirement

Given the intense time constraints of this hackathon, we made a strategic decision to focus on delivering a complete, polished, and fully functional end-to-end user experience. Our primary goal was to demonstrate a powerful and innovative use case for the Nosana Network's core compute capabilities.

Our application successfully offloads its AI sentiment analysis workload to a custom Docker container running on Nosana Jobs. While we fully architected the project with the Mastra framework in mind, we ran out of time to complete the final refactoring into the official agent-challenge boilerplate without sacrificing the stability of the final product.

We believe this working prototype, which showcases a real-world integration with Nosana Jobs, is a stronger testament to the platform's power than an incomplete project.

---

## 🛠️ Getting Started

Follow these instructions to get a local copy up and running for development and testing.

### Prerequisites

- Node.js (v18 or later)
- npm
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

Create a new file named `.env` by making a copy of `.env.example`. Then, open the `.env` file and add your secret keys:

```bash
# Get your free API key from https://www.helius.dev/
HELIUS_API_KEY="your-helius-api-key"

# This will be generated in the Nosana Job Deployment step below
NOSANA_JOB_ID="your-nosana-job-id"
```

### 4. Deploy Your Nosana Sentiment Job

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

---

## 📂 Project Structure

Here is a breakdown of the key files and folders in the project:

- **`nosana-job/`**: A self-contained unit for the decentralized part of the application.
  - `sentiment_analysis.py`: The Python script for sentiment analysis that runs on Nosana.
  - `Dockerfile`: Packages the Python script and its dependencies into a container.
  - `nosana.json`: The manifest file used to deploy the job to the Nosana network.
- **`src/app/`**: The core of the Next.js application.
  - `page.tsx`: The main UI page component that users interact with.
  - `actions.ts`: Handles all server-side logic, including Helius API calls and Nosana job orchestration.
  - `layout.tsx`: The main layout for the app, including HTML head, body, and fonts.
- **`src/ai/`**: Contains all Genkit-related code for AI functionality.
  - `genkit.ts`: Configures and initializes the Genkit AI object with the Google AI plugin.
  - `flows/summarize-risk-factors.ts`: The main AI flow that generates the final verdict and risk assessment.
- **`src/components/`**: All reusable React components for the UI.
  - `ui/`: Base components from ShadCN UI (Button, Card, Input, etc.).
  - `sentinel-report.tsx`: The component that displays the final analysis report.
- **`src/types/`**: Contains shared TypeScript type definitions for the application data.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

<p align="center">Made with ❤️ for the future of decentralized AI.</p>