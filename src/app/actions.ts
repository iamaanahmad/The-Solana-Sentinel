'use server';

import { z } from 'zod';
import type { SentinelReportData, X402Tier } from '@/types';
import { AnalysisService } from '@/services/analysis.service';

export interface FormState {
  report: SentinelReportData | null;
  error: string | null;
}

const TokenSchema = z.string().min(32, { message: 'Invalid Solana address.' }).max(44, { message: 'Invalid Solana address.' });

const analysisService = new AnalysisService();

export async function analyzeToken(prevState: FormState, formData: FormData): Promise<FormState> {
  const tokenAddress = formData.get('tokenAddress') as string;
  const tier = (formData.get('tier') as X402Tier) ?? 'basic';
  const requesterPubkey = formData.get('walletAddress') as string | undefined;

  const validation = TokenSchema.safeParse(tokenAddress);

  if (!validation.success) {
    return { report: null, error: validation.error.errors[0].message };
  }

  try {
    const { report } = await analysisService.analyzeToken({
      tokenAddress: validation.data,
      tier,
      requesterPubkey,
    });

    return { report, error: null };
  } catch (e: any) {
    console.error(e);
    return { report: null, error: e.message || 'An unexpected error occurred during analysis.' };
  }
}
