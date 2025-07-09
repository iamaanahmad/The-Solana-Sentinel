'use server';

import { z } from 'zod';
import { summarizeRiskFactors } from '@/ai/flows/summarize-risk-factors';
import type { SentinelReportData } from '@/types';
import { exec } from 'child_process';
import { promisify } from 'util';

// Promisify the exec function to use it with async/await
const execPromise = promisify(exec);

export interface FormState {
  report: SentinelReportData | null;
  error: string | null;
}

const TokenSchema = z.string().min(32, { message: 'Invalid Solana address.' }).max(44, { message: 'Invalid Solana address.' });

/**
 * Fetches on-chain token data from the Helius API.
 * @param tokenAddress The Solana token address.
 * @returns A promise that resolves to the on-chain analysis data.
 */
async function fetchOnChainData(tokenAddress: string) {
  const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
  if (!HELIUS_API_KEY) {
    throw new Error("Helius API key is not configured in environment variables.");
  }
  const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

  try {
    const [assetResponse, largestAccountsResponse, tokenSupplyResponse] = await Promise.all([
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'solana-sentinel-asset',
          method: 'getAsset',
          params: { id: tokenAddress },
        }),
      }),
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'solana-sentinel-holders',
          method: 'getTokenLargestAccounts',
          params: [tokenAddress],
        }),
      }),
       fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'solana-sentinel-supply',
          method: 'getTokenSupply',
          params: [tokenAddress],
        }),
      })
    ]);

    if (!assetResponse.ok || !largestAccountsResponse.ok || !tokenSupplyResponse.ok) {
        const errorBody = await assetResponse.text();
        console.error("Helius API Error Body:", errorBody);
        throw new Error(`Helius API call failed with status ${assetResponse.status}`);
    }

    const assetData = await assetResponse.json();
    const largestAccountsData = await largestAccountsResponse.json();
    const tokenSupplyData = await tokenSupplyResponse.json();

    if (assetData.error || largestAccountsData.error || tokenSupplyData.error) {
        throw new Error(`Helius API returned an error: ${assetData.error?.message || largestAccountsData.error?.message || tokenSupplyData.error?.message}`);
    }

    // --- Data Parsing Logic ---
    const { result: assetResult } = assetData;
    const { result: largestAccountsResult } = largestAccountsData;
    const { result: tokenSupplyResult } = tokenSupplyData;
    
    // 1. Basic Info & Authorities
    const tokenName = assetResult.content?.metadata?.name || 'Unknown Token';
    const tokenSymbol = assetResult.content?.metadata?.symbol || '???';
    const mintAuthorityRenounced = assetResult.ownership?.mint_authority === null;
    const freezeAuthorityRenounced = assetResult.ownership?.freeze_authority === null;

    // 2. Holder Concentration
    let top10HolderConcentrationPercent = 0;
    const totalSupply = parseFloat(tokenSupplyResult.value.amount);
    if (totalSupply > 0 && largestAccountsResult.value.length > 0) {
        const top10Holders = largestAccountsResult.value.slice(0, 10);
        const top10Supply = top10Holders.reduce((acc: number, holder: any) => acc + parseFloat(holder.amount), 0);
        top10HolderConcentrationPercent = (top10Supply / totalSupply) * 100;
    }
    
    // 3. Deployer LP Holdings (Placeholder)
    // TODO: This is a highly complex calculation that requires analyzing transaction history
    // to find the original liquidity provision transaction from the deployer.
    // For now, we use a random value as a placeholder.
    const deployerLpConcentrationPercent = Math.random() * 40; // 0% to 40%

    return {
      tokenName,
      tokenSymbol,
      mintAuthorityRenounced,
      freezeAuthorityRenounced,
      top10HolderConcentrationPercent,
      deployerLpConcentrationPercent,
    };

  } catch (error) {
    console.error("Error fetching from Helius:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch on-chain data from Helius: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching from Helius.");
  }
}

/**
 * Triggers a sentiment analysis job on the Nosana Network.
 * @param tokenSymbol The token symbol to analyze.
 * @returns A promise that resolves to the sentiment analysis results.
 */
async function fetchSentimentAnalysis(tokenSymbol: string) {
  const NOSANA_JOB_ID = process.env.NOSANA_JOB_ID;
  if (!NOSANA_JOB_ID || NOSANA_JOB_ID === 'your-sentiment-job-id') {
      console.warn("Nosana Job ID is not configured. Falling back to mock sentiment data.");
      return generateMockSentiment();
  }
  
  try {
    // 1. Trigger the job.
    const runCommand = `nosana job run --input '{"symbol": "${tokenSymbol}"}' ${NOSANA_JOB_ID}`;
    console.log(`Executing Nosana command: ${runCommand}`);
    const { stdout: runStdout } = await execPromise(runCommand, { shell: '/bin/bash' });
    const runResult = JSON.parse(runStdout);
    const jobId = runResult.job.id;
    console.log(`Started Nosana job with ID: ${jobId}`);

    // 2. Poll for the result. This is a simplified polling mechanism.
    let jobResult;
    for (let i = 0; i < 15; i++) { // Poll up to 15 times (75 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
      const resultCommand = `nosana job result ${jobId}`;
      console.log(`Polling for result with command: ${resultCommand}`);
      const { stdout: resultStdout } = await execPromise(resultCommand, { shell: '/bin/bash' });
      const parsedResult = JSON.parse(resultStdout);
      if (parsedResult.job.state === 'Completed') {
        // The result from the Nosana job is often a stringified JSON in stdout,
        // so it might need to be parsed twice.
        jobResult = JSON.parse(parsedResult.result.stdout); 
        console.log("Nosana job completed.", jobResult);
        break;
      }
    }

    if (!jobResult) {
      throw new Error("Nosana job did not complete in time.");
    }
    
    // --- Data Parsing Logic ---
    // Assumes your Nosana job returns an object like:
    // { "compound": 0.88, "summary": "Overwhelmingly Positive" }
    return { 
        compoundScore: jobResult.compound, 
        humanReadableSummary: jobResult.summary 
    };
    
  } catch (error) {
    console.warn("Could not execute Nosana CLI. This may be because it is not installed or configured. Falling back to mock sentiment data.", error);
    return generateMockSentiment();
  }
}

async function generateMockSentiment() {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    
    const sentimentScore = Math.random() * 2 - 1; // -1 to 1
    let humanReadableSummary: string;
    if (sentimentScore > 0.6) {
      humanReadableSummary = 'Overwhelmingly Positive';
    } else if (sentimentScore > 0.2) {
      humanReadableSummary = 'Positive';
    } else if (sentimentScore < -0.6) {
      humanReadableSummary = 'Highly Negative';
    } else if (sentimentScore < -0.2) {
      humanReadableSummary = 'Negative';
    } else {
      humanReadableSummary = 'Mixed';
    }

    return {
      compoundScore: sentimentScore,
      humanReadableSummary,
    };
}


export async function analyzeToken(prevState: FormState, formData: FormData): Promise<FormState> {
  const tokenAddress = formData.get('tokenAddress') as string;

  const validation = TokenSchema.safeParse(tokenAddress);

  if (!validation.success) {
    return { report: null, error: validation.error.errors[0].message };
  }

  try {
    // Step 1: Fetch live on-chain data from Helius
    const onChainData = await fetchOnChainData(validation.data);

    // Step 2: Trigger sentiment analysis on Nosana
    const sentimentAnalysis = await fetchSentimentAnalysis(onChainData.tokenSymbol);

    const onChainAnalysis = {
        mintAuthorityRenounced: onChainData.mintAuthorityRenounced,
        freezeAuthorityRenounced: onChainData.freezeAuthorityRenounced,
        top10HolderConcentrationPercent: onChainData.top10HolderConcentrationPercent,
        deployerLpConcentrationPercent: onChainData.deployerLpConcentrationPercent,
    };
    
    // Step 3: Calculate the Holistic Score
    let score = 100;
    if (!onChainAnalysis.mintAuthorityRenounced) score -= 30;
    if (!onChainAnalysis.freezeAuthorityRenounced) score -= 20;
    if (onChainAnalysis.top10HolderConcentrationPercent > 40) score -= 25;
    else if (onChainAnalysis.top10HolderConcentrationPercent > 20) score -= 15;
    if (onChainAnalysis.deployerLpConcentrationPercent > 20) score -= 20;
    
    if(sentimentAnalysis.humanReadableSummary.includes('Negative')) score -= 20;
    if(sentimentAnalysis.humanReadableSummary.includes('Positive')) score += 5;

    const sentinelScore = Math.max(0, Math.min(100, Math.round(score)));

    // Step 4: Generate the AI Summary
    const aiInput = {
      tokenName: onChainData.tokenName,
      tokenSymbol: onChainData.tokenSymbol,
      sentinelScore: sentinelScore,
      onChainMetrics: onChainAnalysis,
      sentimentAnalysis: sentimentAnalysis,
    };
    const aiResult = await summarizeRiskFactors(aiInput);
    
    // Step 5: Assemble the final report
    const report: SentinelReportData = {
      tokenAddress: validation.data,
      tokenName: aiInput.tokenName,
      tokenSymbol: aiInput.tokenSymbol,
      sentinelScore,
      aiAnalysis: aiResult,
      onChainAnalysis,
      sentimentAnalysis,
    };

    return { report, error: null };
  } catch (e: any) {
    console.error(e);
    return { report: null, error: e.message || 'An unexpected error occurred during analysis.' };
  }
}
