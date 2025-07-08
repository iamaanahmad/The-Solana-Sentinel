'use server';

import { z } from 'zod';
import { summarizeRiskFactors } from '@/ai/flows/summarize-risk-factors';
import type { SentinelReportData } from '@/types';

export interface FormState {
  report: SentinelReportData | null;
  error: string | null;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const TokenSchema = z.string().min(32, { message: 'Invalid Solana address.' }).max(44, { message: 'Invalid Solana address.' });

export async function analyzeToken(prevState: FormState, formData: FormData): Promise<FormState> {
  const tokenAddress = formData.get('tokenAddress') as string;

  const validation = TokenSchema.safeParse(tokenAddress);

  if (!validation.success) {
    return { report: null, error: validation.error.errors[0].message };
  }

  try {
    // Simulate network delay for API calls to Helius and Nosana
    await sleep(2000);

    // --- Mock Data Generation (simulating Helius API) ---
    const onChainAnalysis = {
      mintAuthorityRenounced: Math.random() > 0.3, // 70% chance of being renounced
      freezeAuthorityRenounced: Math.random() > 0.2, // 80% chance
      top10HolderPercentage: Math.random() * 50 + 10, // 10% to 60%
      liquidity: {
        totalValue: Math.floor(Math.random() * 500000) + 50000,
        isLocked: Math.random() > 0.4, // 60% chance
        deployerLpPercentage: Math.random() * 40, // 0% to 40% held by deployer
      },
    };

    // --- Mock Data Generation (simulating Nosana job for VADER sentiment) ---
    const sentimentScore = Math.random() * 2 - 1; // -1 to 1
    let disposition: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
    if (sentimentScore > 0.3) {
      disposition = 'Positive';
    } else if (sentimentScore < -0.3) {
      disposition = 'Negative';
    }

    const sentimentAnalysis = {
      score: sentimentScore,
      disposition,
    };
    
    // --- Holistic Score Calculation (Weighted Algorithm) ---
    let score = 100;
    if (!onChainAnalysis.mintAuthorityRenounced) score -= 30;
    if (!onChainAnalysis.freezeAuthorityRenounced) score -= 20;
    if (onChainAnalysis.top10HolderPercentage > 40) score -= 25;
    else if (onChainAnalysis.top10HolderPercentage > 20) score -= 15;
    if (!onChainAnalysis.liquidity.isLocked) score -= 15;
    if (onChainAnalysis.liquidity.deployerLpPercentage > 20) score -= 20;
    if (onChainAnalysis.liquidity.totalValue < 100000) score -= 10;
    
    if(sentimentAnalysis.disposition === 'Negative') score -= 20;
    if(sentimentAnalysis.disposition === 'Positive') score += 5;

    const sentinelScore = Math.max(0, Math.min(100, Math.round(score)));

    // --- AI Summary Generation ---
    const aiInput = {
      onChainAnalysis: `Mint Authority Renounced: ${onChainAnalysis.mintAuthorityRenounced}, Freeze Authority Renounced: ${onChainAnalysis.freezeAuthorityRenounced}, Top 10 Holders Own: ${onChainAnalysis.top10HolderPercentage.toFixed(2)}%, Liquidity Locked: ${onChainAnalysis.liquidity.isLocked}, Liquidity Value: $${onChainAnalysis.liquidity.totalValue.toLocaleString()}, Deployer LP Share: ${onChainAnalysis.liquidity.deployerLpPercentage.toFixed(2)}%`,
      sentimentAnalysis: `Overall sentiment is ${sentimentAnalysis.disposition} (Score: ${sentimentAnalysis.score.toFixed(2)})`,
      sentinelScore: sentinelScore,
    };
    const aiResult = await summarizeRiskFactors(aiInput);
    
    const report: SentinelReportData = {
      tokenAddress: validation.data,
      sentinelScore,
      aiSummary: aiResult.summary,
      onChainAnalysis,
      sentimentAnalysis,
    };

    return { report, error: null };
  } catch (e) {
    console.error(e);
    return { report: null, error: 'An unexpected error occurred during analysis.' };
  }
}
