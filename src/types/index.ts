export interface SentinelReportData {
  tokenAddress: string;
  sentinelScore: number;
  aiSummary: string;
  onChainAnalysis: {
    mintAuthorityRenounced: boolean;
    freezeAuthorityRenounced: boolean;
    topHolderPercentage: number;
    liquidity: {
      totalValue: number;
      isLocked: boolean;
    };
  };
  sentimentAnalysis: {
    score: number;
    disposition: 'Positive' | 'Neutral' | 'Negative';
  };
}
