# **App Name**: The Solana Sentinel

## Core Features:

- On-Chain Forensics Engine: The Firebase Cloud Function will call the Helius API to analyze critical on-chain risk indicators for a given token address.
- AI-Powered Sentiment Analysis: The Firebase Cloud Function will trigger a job on the Nosana Network. This job will execute a Docker container running our VADER sentiment analysis script on a sample of social media text related to the token.
- Holistic Risk Score Generation: Once the on-chain data is received from Helius and the sentiment score is returned from Nosana, the Firebase Cloud Function will synthesize these two data streams. A weighted algorithm will combine the on-chain red flags and the off-chain sentiment score into a final, comprehensive "Sentinel Score" (e.g., 0-100).
- Dynamic Risk Score Display: The frontend, built with HTML/CSS/JS and hosted on Firebase Hosting, will provide a clean user interface. A user pastes a Solana token address into an input field and clicks "Analyze." The frontend calls the Firebase Cloud Function and displays a loading indicator. Upon receiving the results, it dynamically renders the full "Sentinel Report."

## Style Guidelines:

- Primary: Deep Blue (`#293B5F`) - Used for headers, buttons, and key UI elements to convey trust and stability.
- Background: Light Gray (`#E9EEF2`) - A neutral, clean backdrop that makes data pop.
- Accent & Alerts: Yellow-Orange (`#D68430`) - Reserved for highlighting the final risk score, warnings, and critical alerts to draw immediate user attention.
- High Risk: A strong Red (`#BF4D4D`)
- Medium Risk: The Yellow-Orange Accent (`#D68430`)
- Low Risk: A clear Green (`#4A934A`)
- Font: 'Inter' (sans-serif) - Chosen for its exceptional readability on screens, ensuring all data is presented clearly and professionally.
- Layout: A clean, single-column layout. The top of the page will feature the "Solana Sentinel" title and the token address input field. The results will appear below in a structured card.
- Icons: Use minimalist, line-art style SVG icons to represent each on-chain metric (e.g., a mint icon, a wallet icon for holders). This enhances scannability.
- Data Display: Use clear tables or definition lists to present the on-chain metrics and their status (e.g., "Mint Authority: Renounced ✅").
- Animations: Incorporate subtle, non-intrusive animations. A loading spinner will appear while the analysis is in progress. The final score can fade in and scale up slightly for emphasis.