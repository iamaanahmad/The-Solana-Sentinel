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
      throw new Error(`Helius API call failed`);
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
 * This function is a placeholder and needs to be implemented with the Nosana CLI/SDK.
 * @param tokenSymbol The token symbol to analyze.
 * @returns A promise that resolves to the sentiment analysis results.
 */
async function fetchSentimentAnalysis(tokenSymbol: string) {
  // TODO: Replace with a live Nosana job trigger.
  // This assumes the Nosana CLI is installed and configured in the environment.
  // The command will depend on your specific Nosana job definition.
  /*
  try {
    // 1. Trigger the job. This command is an example.
    const runCommand = `nosana job run --input '{"symbol": "${tokenSymbol}"}' your-sentiment-job`;
    const { stdout: runStdout } = await execPromise(runCommand);
    const runResult = JSON.parse(runStdout);
    const jobId = runResult.job.id;

    // 2. Poll for the result. This is a simplified polling mechanism.
    let jobResult;
    for (let i = 0; i < 10; i++) { // Poll up to 10 times
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
      const resultCommand = `nosana job result ${jobId}`;
      const { stdout: resultStdout } = await execPromise(resultCommand);
      const parsedResult = JSON.parse(resultStdout);
      if (parsedResult.job.state === 'Completed') {
        jobResult = JSON.parse(parsedResult.result.stdout); // Assuming the job result is in stdout
        break;
      }
    }

    if (!jobResult) {
      throw new Error("Nosana job did not complete in time.");
    }
    
    //
    // --- Data Parsing Logic ---
    // You'd extract the scores from the 'jobResult' object.
    // return { compoundScore: jobResult.compound, humanReadableSummary: jobResult.summary };
    //
  } catch (error) {
    console.error("Error running Nosana job:", error);
    throw new Error("Failed to fetch sentiment analysis from Nosana.");
  }
  */

  // Using mock data until the above is implemented.
  console.log(`Simulating Nosana sentiment analysis for: ${tokenSymbol}`);
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
