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
 * This function is a placeholder and needs to be implemented with a real Helius API key.
 * @param tokenAddress The Solana token address.
 * @returns A promise that resolves to the on-chain analysis data.
 */
async function fetchOnChainData(tokenAddress: string) {
  // TODO: Replace with a live Helius API call.
  // You will need a Helius API key stored in your environment variables.
  // Example: const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
  // const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  /*
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "solana-sentinel",
        method: "getAsset", // Or other methods like 'getTokenLargestAccounts'
        params: { id: tokenAddress, displayOptions: { showFungible: true } },
      }),
    });
    if (!response.ok) {
      throw new Error(`Helius API call failed: ${response.statusText}`);
    }
    const data = await response.json();
    
    //
    // --- Data Parsing Logic ---
    // You would parse the 'data' object here to extract the metrics.
    // This is complex and depends on the exact response structure.
    // - Check data.result.ownership.mint_authority === null (for renounced)
    // - Check data.result.ownership.freeze_authority === null (for renounced)
    // - Calculate holder concentration (may require another API call).
    // - Calculate deployer LP holdings (very complex, requires multiple steps).
    //
  } catch (error) {
    console.error("Error fetching from Helius:", error);
    throw new Error("Failed to fetch on-chain data from Helius.");
  }
  */

  // Using mock data until the above is implemented.
  console.log(`Simulating Helius API call for: ${tokenAddress}`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  
  return {
    tokenName: 'Mock Token',
    tokenSymbol: 'MOCK',
    mintAuthorityRenounced: Math.random() > 0.3, // 70% chance
    freezeAuthorityRenounced: Math.random() > 0.2, // 80% chance
    top10HolderConcentrationPercent: Math.random() * 50 + 10, // 10% to 60%
    deployerLpConcentrationPercent: Math.random() * 40, // 0% to 40%
  };
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
