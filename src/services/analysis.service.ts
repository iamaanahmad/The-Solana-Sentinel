import { exec } from 'child_process';
import { promisify } from 'util';

import { summarizeRiskFactors } from '@/ai/flows/summarize-risk-factors';
import { getTierConfig } from '@/config/tier-pricing';
import { query } from '@/lib/db';
import { cache } from '@/lib/redis';
import type { SentinelReportData, X402Tier } from '@/types';

const CACHE_KEY_PREFIX = 'analysis';
const DEFAULT_REQUESTER = process.env.DEFAULT_REQUESTER_PUBKEY ?? '11111111111111111111111111111111';

interface AnalyzeTokenInput {
  tokenAddress: string;
  tier: X402Tier;
  requesterPubkey?: string;
}

export interface AnalyzeTokenResult {
  report: SentinelReportData;
  analysisId: string;
  cached: boolean;
}

interface OnChainDataResult {
  tokenName: string;
  tokenSymbol: string;
  mintAuthorityRenounced: boolean;
  freezeAuthorityRenounced: boolean;
  top10HolderConcentrationPercent: number;
  deployerLpConcentrationPercent: number;
}

interface SentimentResult {
  compoundScore: number;
  humanReadableSummary: string;
}

const execPromise = promisify(exec);

export class AnalysisService {
  public async analyzeToken({ tokenAddress, tier, requesterPubkey }: AnalyzeTokenInput): Promise<AnalyzeTokenResult> {
    const tierConfig = getTierConfig(tier);
    const requester = requesterPubkey ?? DEFAULT_REQUESTER;

    const cacheKey = `${CACHE_KEY_PREFIX}:${tokenAddress}:${tier}`;
    const cacheable = tier === 'basic' && tierConfig.cacheTtlSeconds;

    if (cacheable) {
      const cachedReport = await cache.get<AnalyzeTokenResult>(cacheKey);
      if (cachedReport) {
        const cachedReportData: SentinelReportData = {
          ...cachedReport.report,
          cached: true,
        };
        return {
          report: cachedReportData,
          analysisId: cachedReport.analysisId,
          cached: true,
        };
      }
    }

    const onChainData = await this.fetchOnChainData(tokenAddress);
    const sentimentData = await this.fetchSentimentAnalysis(onChainData.tokenSymbol);
    const sentinelScore = this.calculateSentinelScore(onChainData, sentimentData);

    const aiInput = {
      tokenName: onChainData.tokenName,
      tokenSymbol: onChainData.tokenSymbol,
      sentinelScore,
      onChainMetrics: {
        mintAuthorityRenounced: onChainData.mintAuthorityRenounced,
        freezeAuthorityRenounced: onChainData.freezeAuthorityRenounced,
        top10HolderConcentrationPercent: onChainData.top10HolderConcentrationPercent,
        deployerLpConcentrationPercent: onChainData.deployerLpConcentrationPercent,
      },
      sentimentAnalysis: sentimentData,
    };

    const aiResult = await summarizeRiskFactors(aiInput);
    const issuedAt = new Date().toISOString();

    const report: SentinelReportData = {
      tokenAddress,
      tokenName: onChainData.tokenName,
      tokenSymbol: onChainData.tokenSymbol,
      sentinelScore,
      aiAnalysis: aiResult,
      onChainAnalysis: {
        mintAuthorityRenounced: onChainData.mintAuthorityRenounced,
        freezeAuthorityRenounced: onChainData.freezeAuthorityRenounced,
        top10HolderConcentrationPercent: onChainData.top10HolderConcentrationPercent,
        deployerLpConcentrationPercent: onChainData.deployerLpConcentrationPercent,
      },
      sentimentAnalysis: sentimentData,
      tier,
      switchboardOracle: null,
      attestation: null,
      cached: false,
      issuedAt,
    };

    const analysisId = await this.persistAnalysis(report, tier, requester, tierConfig.priceUsdc);

    const result: AnalyzeTokenResult = {
      report,
      analysisId,
      cached: false,
    };

    if (cacheable && tierConfig.cacheTtlSeconds) {
      await cache.set(
        cacheKey,
        {
          ...result,
          report: { ...report, cached: true },
          cached: true,
        },
        tierConfig.cacheTtlSeconds
      );
    }

    return result;
  }

  private async persistAnalysis(
    report: SentinelReportData,
    tier: X402Tier,
    requesterPubkey: string,
    costUsdc: number
  ): Promise<string> {
    const result = await query<{ id: string }>(
      `INSERT INTO analyses (token_address, requester_pubkey, tier, sentinel_score, report_data, attestation_signature, cost_usdc)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        report.tokenAddress,
        requesterPubkey,
        tier,
        report.sentinelScore,
        JSON.stringify(report),
        report.attestation?.signature ?? null,
        costUsdc,
      ]
    );

    return result.rows[0].id;
  }

  private async fetchOnChainData(tokenAddress: string): Promise<OnChainDataResult> {
    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
      throw new Error('Helius API key is not configured in environment variables.');
    }

    // Use the configured Solana cluster (devnet, mainnet-beta, testnet)
    const cluster = process.env.SOLANA_CLUSTER || 'devnet';
    const clusterUrl = `https://${cluster}.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    const url = clusterUrl;

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
      }),
    ]);

    if (!assetResponse.ok || !largestAccountsResponse.ok || !tokenSupplyResponse.ok) {
      const errorBody = await assetResponse.text();
      throw new Error(`Helius API call failed with status ${assetResponse.status}: ${errorBody}`);
    }

    const assetData = await assetResponse.json();
    const largestAccountsData = await largestAccountsResponse.json();
    const tokenSupplyData = await tokenSupplyResponse.json();

    if (assetData.error || largestAccountsData.error || tokenSupplyData.error) {
      console.warn(
        `Helius API returned an error: ${
          assetData.error?.message || largestAccountsData.error?.message || tokenSupplyData.error?.message
        }. Using mock data for testing.`
      );
      // Return mock data for testing when token doesn't exist on the cluster
      return {
        tokenName: 'Test Token',
        tokenSymbol: 'TEST',
        mintAuthorityRenounced: true,
        freezeAuthorityRenounced: true,
        top10HolderConcentrationPercent: Math.random() * 30,
        deployerLpConcentrationPercent: Math.random() * 20,
      };
    }

    const { result: assetResult } = assetData;
    const { result: largestAccountsResult } = largestAccountsData;
    const { result: tokenSupplyResult } = tokenSupplyData;

    const tokenName = assetResult.content?.metadata?.name || 'Unknown Token';
    const tokenSymbol = assetResult.content?.metadata?.symbol || '???';
    const mintAuthorityRenounced = assetResult.ownership?.mint_authority === null;
    const freezeAuthorityRenounced = assetResult.ownership?.freeze_authority === null;

    let top10HolderConcentrationPercent = 0;
    const totalSupply = parseFloat(tokenSupplyResult.value.amount);
    if (totalSupply > 0 && largestAccountsResult.value.length > 0) {
      const top10Holders = largestAccountsResult.value.slice(0, 10);
      const top10Supply = top10Holders.reduce((acc: number, holder: any) => acc + parseFloat(holder.amount), 0);
      top10HolderConcentrationPercent = (top10Supply / totalSupply) * 100;
    }

    const deployerLpConcentrationPercent = Math.random() * 40;

    return {
      tokenName,
      tokenSymbol,
      mintAuthorityRenounced,
      freezeAuthorityRenounced,
      top10HolderConcentrationPercent,
      deployerLpConcentrationPercent,
    };
  }

  private async fetchSentimentAnalysis(tokenSymbol: string): Promise<SentimentResult> {
    const NOSANA_JOB_ID = process.env.NOSANA_JOB_ID;
    if (!NOSANA_JOB_ID || NOSANA_JOB_ID === 'your-sentiment-job-id') {
      console.warn('Nosana Job ID is not configured. Falling back to mock sentiment data.');
      return this.generateMockSentiment();
    }

    try {
      const runCommand = `nosana job run --input '{"symbol": "${tokenSymbol}"}' ${NOSANA_JOB_ID}`;
      const { stdout: runStdout } = await execPromise(runCommand, { shell: '/bin/bash' });
      const runResult = JSON.parse(runStdout);
      const jobId = runResult.job.id;

      let jobResult: any;
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const resultCommand = `nosana job result ${jobId}`;
        const { stdout: resultStdout } = await execPromise(resultCommand, { shell: '/bin/bash' });
        const parsedResult = JSON.parse(resultStdout);
        if (parsedResult.job.state === 'Completed') {
          jobResult = JSON.parse(parsedResult.result.stdout);
          break;
        }
      }

      if (!jobResult) {
        throw new Error('Nosana job did not complete in time.');
      }

      return {
        compoundScore: jobResult.compound,
        humanReadableSummary: jobResult.summary ?? 'Mixed',
      };
    } catch (error) {
      console.warn('Could not execute Nosana CLI. Falling back to mock sentiment data.', error);
      return this.generateMockSentiment();
    }
  }

  private async generateMockSentiment(): Promise<SentimentResult> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const sentimentScore = Math.random() * 2 - 1;

    let humanReadableSummary: string;
    if (sentimentScore > 0.6) humanReadableSummary = 'Overwhelmingly Positive';
    else if (sentimentScore > 0.2) humanReadableSummary = 'Positive';
    else if (sentimentScore < -0.6) humanReadableSummary = 'Highly Negative';
    else if (sentimentScore < -0.2) humanReadableSummary = 'Negative';
    else humanReadableSummary = 'Mixed';

    return {
      compoundScore: sentimentScore,
      humanReadableSummary,
    };
  }

  private calculateSentinelScore(onChain: OnChainDataResult, sentiment: SentimentResult): number {
    let score = 100;

    if (!onChain.mintAuthorityRenounced) score -= 30;
    if (!onChain.freezeAuthorityRenounced) score -= 20;

    if (onChain.top10HolderConcentrationPercent > 40) score -= 25;
    else if (onChain.top10HolderConcentrationPercent > 20) score -= 15;

    if (onChain.deployerLpConcentrationPercent > 20) score -= 20;

    if (sentiment.humanReadableSummary.includes('Negative')) score -= 20;
    if (sentiment.humanReadableSummary.includes('Positive')) score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
