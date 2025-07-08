# The Solana Sentinel

<p align="center">
  <img src="https://raw.githubusercontent.com/ashish-q/The-Solana-Sentinel/main/public/logo.png" alt="Solana Sentinel Logo" width="150">
</p>

<h2 align="center">Your AI-Powered Shield Against Risky Tokens on the Solana Blockchain</h2>

<p align="center">
  <strong>The Solana Sentinel</strong> is a cutting-edge web application that provides real-time, AI-driven risk analysis for Solana tokens. By combining live on-chain data with decentralized AI sentiment analysis, it generates a comprehensive "Sentinel Score" to help users identify potentially risky or malicious projects before they invest.
</p>

---

## ✨ Core Features

-   **🤖 AI-Powered Risk Analysis**: Leverages Google's Gemini model via Genkit to provide a nuanced, human-readable "Final Verdict" on a token's risk profile.
-   **🔗 On-Chain Forensics Engine**: Fetches and analyzes critical on-chain metrics in real-time from the Helius API, including:
    -   **Mint & Freeze Authority**: Checks if authorities have been renounced.
    -   **Holder Concentration**: Calculates the supply percentage held by top wallets.
    -   **Liquidity Distribution**: Assesses the deployer's share of the liquidity pool.
-   **☁️ Decentralized Sentiment Analysis**: Offloads social media sentiment analysis to the **Nosana Network**, a decentralized GPU grid, ensuring unbiased and scalable compute.
-   **💯 Holistic Sentinel Score**: A proprietary algorithm synthesizes on-chain and off-chain data into a single, easy-to-understand risk score (0-100).
-   **📊 Dynamic & Interactive Reports**: Presents the full analysis in a clean, responsive, and beautifully designed interface built with Next.js and ShadCN UI.

## 🚀 Technology Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router & Server Actions)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
-   **AI Toolkit**: [Google Genkit](https://firebase.google.com/docs/genkit)
-   **On-Chain Data**: [Helius API](https://www.helius.dev/)
-   **Decentralized Compute**: [Nosana Network](https://nosana.io/)
-   **Hosting**: Firebase Hosting / Vercel

## 🛠️ Getting Started

Follow these instructions to get a local copy up and running for development and testing.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [Docker](https://www.docker.com/products/docker-desktop/) (must be running)
-   [Nosana CLI](https://docs.nosana.io/nodes/nosana-cli.html) installed globally (`npm install -g @nosana/cli`)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/solana-sentinel.git
cd solana-sentinel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a new file named `.env` in the root of the project. You can do this by making a copy of the existing `.env` file if it's empty, or just create a new one.

Now, open the `.env` file and add your secret keys:

```env
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

**b. Build the Docker Image**
Replace `your-docker-hub-username` with your actual Docker Hub username.
```bash
docker build -t your-docker-hub-username/solana-sentinel-sentiment:v1 .
```

**c. Push the Image to Docker Hub**
You may need to run `docker login` first.
```bash
docker push your-docker-hub-username/solana-sentinel-sentiment:v1
```

**d. Update `nosana.json`**
Open `nosana-job/nosana.json` and replace the placeholder `image` value with the name of the image you just pushed.

**e. Publish the Job to Nosana**
This command deploys your job and returns its unique ID.
```bash
nosana job publish
```

**f. Update Environment File**
Copy the **Job Address** from the output and paste it as the `NOSANA_JOB_ID` in your root `.env` file.

### 5. Run the Development Server

Navigate back to the project root and start the app.

```bash
cd ..
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

---

## 📂 Project Structure

```
.
├── nosana-job/         # Files for the Nosana sentiment analysis job
│   ├── Dockerfile
│   ├── nosana.json
│   ├── sentiment_analysis.py
│   └── requirements.txt
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router pages and server actions
│   │   ├── page.tsx
│   │   └── actions.ts
│   ├── ai/             # Genkit AI flows and configuration
│   │   └── flows/
│   ├── components/     # Reusable React components (including ShadCN UI)
│   └── types/          # TypeScript type definitions
├── .env                # Local environment variables (private)
├── next.config.ts      # Next.js configuration
└── package.json        # Project dependencies
```

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with ❤️ for the future of decentralized AI.
</p>
