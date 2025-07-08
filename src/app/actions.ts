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
      top10HolderConcentrationPercent: Math.random() * 50 + 10, // 10% to 60%
      deployerLpConcentrationPercent: Math.random() * 40, // 0% to 40%
    };

    // --- Mock Data Generation (simulating Nosana job for VADER sentiment) ---
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

    const sentimentAnalysis = {
      compoundScore: sentimentScore,
      humanReadableSummary,
    };
    
    // --- Holistic Score Calculation (Weighted Algorithm) ---
    let score = 100;
    if (!onChainAnalysis.mintAuthorityRenounced) score -= 30;
    if (!onChainAnalysis.freezeAuthorityRenounced) score -= 20;
    if (onChainAnalysis.top10HolderConcentrationPercent > 40) score -= 25;
    else if (onChainAnalysis.top10HolderConcentrationPercent > 20) score -= 15;
    if (onChainAnalysis.deployerLpConcentrationPercent > 20) score -= 20;
    
    if(sentimentAnalysis.humanReadableSummary.includes('Negative')) score -= 20;
    if(sentimentAnalysis.humanReadableSummary.includes('Positive')) score += 5;

    const sentinelScore = Math.max(0, Math.min(100, Math.round(score)));

    // --- AI Summary Generation ---
    const aiInput = {
      tokenName: 'Mock Token', // Mocked
      tokenSymbol: 'MOCK', // Mocked
      sentinelScore: sentinelScore,
      onChainMetrics: onChainAnalysis,
      sentimentAnalysis: sentimentAnalysis,
    };
    const aiResult = await summarizeRiskFactors(aiInput);
    
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
  } catch (e) {
    console.error(e);
    return { report: null, error: 'An unexpected error occurred during analysis.' };
  }
}
