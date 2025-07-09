# The Solana Sentinel

<p align="center">
  <img src="https://i.ibb.co/5hMp2mkq/image.png" alt="The Solana Sentinel Banner" width="800"/>
</p>

<h2 align="center">Your AI-Powered Shield Against Risky Tokens on the Solana Blockchain</h2>

<p align="center">
  <strong>The Solana Sentinel</strong> is a cutting-edge web application that provides real-time, AI-driven risk analysis for Solana tokens. By synthesizing live on-chain data with decentralized AI sentiment analysis, it generates a comprehensive "Sentinel Score" to help users identify potentially malicious projects before they invest.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Google_Genkit-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Genkit"/>
  <img src="https://img.shields.io/badge/Nosana-1A1A1A?style=for-the-badge" alt="Nosana"/>
</p>

---

## ✨ Core Features

-   **🤖 AI-Powered Final Verdict**: Leverages Google's Gemini model via **Genkit** to provide a nuanced, human-readable summary of a token's overall risk profile.
-   **🔗 Live On-Chain Forensics**: Fetches and analyzes critical on-chain metrics in real-time from the **Helius API**, including:
    -   ✅ **Mint & Freeze Authority**: Checks if developers have renounced control.
    -   📊 **Holder Concentration**: Calculates the supply percentage held by top wallets.
    -   💧 **Liquidity Distribution**: Assesses the deployer's share of the liquidity pool.
-   **☁️ Decentralized Sentiment Analysis**: Offloads social media sentiment analysis to the **Nosana Network**, a decentralized GPU grid, ensuring unbiased and scalable compute.
-   **💯 Holistic Sentinel Score**: A proprietary algorithm synthesizes on-chain and off-chain data into a single, easy-to-understand risk score (0-100).
-   **📈 Dynamic & Interactive Reports**: Presents the full analysis in a clean, responsive, and beautifully designed interface built with Next.js and ShadCN UI.

## ⚙️ How It Works

The application follows a simple but powerful serverless architecture to deliver real-time analysis.

```
1. User Input         2. Server Action         3. Data Fetching         4. AI Analysis           5. Final Report
(Token Address)  ───>  (Next.js Backend)  ───>  [Helius API]       ───>  (Google Genkit)    ───>    (Rendered UI)
                                            └─>  [Nosana Network]   ┘
```

## 🚀 Technology Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions)
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
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (**must be running**)
-   [Nosana CLI](https://docs.nosana.io/nodes/nosana-cli.html) installed globally (`npm install -g @nosana/cli`)

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

Create a new file named `.env`. You can do this by making a copy of the existing `.env` file if it's empty, or just create a new one.

Now, open the `.env` file and add your secret keys:

```env
# Get your free API key from https://www.helius.dev/
HELIUS_API_KEY="your-helius-api-key"

# This will be generated in the Nosana Job Deployment step below
NOSANA_JOB_ID="your-nosana-job-id"
```

### 4. Deploy Your Nosana Sentiment Job

The sentiment analysis script is located in the `nosana-job` directory. You need to deploy it to the Nosana Network to get your `NOSANA_JOB_ID`. For a detailed walkthrough, see the `nosana-job/README.md` file.

**a. Navigate to the Job Directory**
```bash
cd nosana-job
```

**b. Build & Push the Docker Image**
Replace `your-docker-hub-username` with your actual Docker Hub username.
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
nosana job post
```

**e. Update Environment File**
Copy the **Job Address** from the command output and paste it as the `NOSANA_JOB_ID` in your root `.env` file.

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

<p align="center">Made with ❤️ for the future of decentralized AI.</p>
