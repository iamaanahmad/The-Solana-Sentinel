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
}
