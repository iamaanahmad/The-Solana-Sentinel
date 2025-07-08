export interface SentinelReportData {
  tokenAddress: string;
  sentinelScore: number;
  aiSummary: string;
  onChainAnalysis: {
    mintAuthorityRenounced: boolean;
    freezeAuthorityRenounced: boolean;
    top10HolderPercentage: number;
    liquidity: {
      totalValue: number;
      isLocked: boolean;
      deployerLpPercentage: number;
    };
  };
  sentimentAnalysis: {
    score: number;
    disposition: 'Positive' | 'Neutral' | 'Negative';
  };
}
