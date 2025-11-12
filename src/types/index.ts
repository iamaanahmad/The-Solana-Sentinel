import type { X402Tier } from './x402';

export interface SwitchboardOracleSnapshot {
  feedAddress: string;
  price?: number;
  priceChange1h?: number;
  priceChange24h?: number;
  volume24h?: number;
  liquidity?: number;
  feedAvailable: boolean;
  fetchedAt: string;
}

export interface AttestationMetadata {
  signature: string;
  publicKey: string;
  reportHash: string;
  issuedAt: string;
  network: 'devnet' | 'mainnet-beta' | 'testnet';
  transaction?: string;
  verified?: boolean;
}

export interface SentinelReportData {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  sentinelScore: number;
  aiAnalysis: {
    riskLevel: 'Low' | 'Medium' | 'High';
    onChainRisk: {
      holderConcentrationRisk: 'Low' | 'Medium' | 'High';
      deployerLpHoldingsRisk: 'Low' | 'Medium' | 'High';
    };
    finalVerdict: string;
  };
  onChainAnalysis: {
    mintAuthorityRenounced: boolean;
    freezeAuthorityRenounced: boolean;
    top10HolderConcentrationPercent: number;
    deployerLpConcentrationPercent: number;
  };
  sentimentAnalysis: {
    compoundScore: number;
    humanReadableSummary: string;
  };
  tier: X402Tier;
  switchboardOracle?: SwitchboardOracleSnapshot | null;
  attestation?: AttestationMetadata | null;
  cached?: boolean;
  issuedAt: string;
}

export * from './x402';
