'use server';
/**
 * @fileOverview Analyzes token data to generate a comprehensive Sentinel Report.
 *
 * - summarizeRiskFactors - A function that analyzes token data.
 * - SummarizeRiskFactorsInput - The input type for the summarizeRiskFactors function.
 * - SummarizeRiskFactorsOutput - The return type for the summarizeRiskFactors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRiskFactorsInputSchema = z.object({
  tokenName: z.string().describe('The name of the token, e.g., "RocketMoon".'),
  tokenSymbol: z.string().describe('The symbol of the token, e.g., "RMN".'),
  sentinelScore: z.number().describe('The pre-calculated risk score (0-100), where lower is riskier.'),
  onChainMetrics: z.object({
    mintAuthorityRenounced: z.boolean(),
    freezeAuthorityRenounced: z.boolean(),
    top10HolderConcentrationPercent: z.number(),
    deployerLpConcentrationPercent: z.number(),
  }),
  sentimentAnalysis: z.object({
    compoundScore: z.number().describe('A score from -1.0 (highly negative) to +1.0 (highly positive).'),
    humanReadableSummary: z.string().describe('A human-readable sentiment summary, e.g., "Highly Negative".'),
  }),
});
export type SummarizeRiskFactorsInput = z.infer<typeof SummarizeRiskFactorsInputSchema>;

const SummarizeRiskFactorsOutputSchema = z.object({
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The overall risk level for the token.'),
  onChainRisk: z.object({
    holderConcentrationRisk: z.enum(['Low', 'Medium', 'High']).describe('Risk level for top 10 holder concentration.'),
    deployerLpHoldingsRisk: z.enum(['Low', 'Medium', 'High']).describe('Risk level for deployer LP holdings.'),
  }),
  finalVerdict: z.string().describe('A 1-2 sentence conclusive summary that justifies the risk level based on the most critical data points.'),
});
export type SummarizeRiskFactorsOutput = z.infer<typeof SummarizeRiskFactorsOutputSchema>;

export async function summarizeRiskFactors(input: SummarizeRiskFactorsInput): Promise<SummarizeRiskFactorsOutput> {
  return summarizeRiskFactorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRiskFactorsPrompt',
  input: {schema: SummarizeRiskFactorsInputSchema},
  output: {schema: SummarizeRiskFactorsOutputSchema},
  prompt: `Role: You are "The Solana Sentinel," an expert AI analyst specializing in blockchain security and tokenomics. Your tone is objective, professional, and direct. You provide clear, actionable intelligence to help users avoid crypto scams.

Task: Analyze the following raw data for a Solana token and generate a structured risk analysis. Based on the data, determine the overall risk level (Low, Medium, High), assess the risk for specific on-chain metrics, and write a final verdict.

Input Data:
Token: {{{tokenName}}} ({{{tokenSymbol}}})
Sentinel Score: {{{sentinelScore}}}/100

On-Chain Metrics:
- Mint Authority Renounced: {{{onChainMetrics.mintAuthorityRenounced}}}
- Freeze Authority Renounced: {{{onChainMetrics.freezeAuthorityRenounced}}}
- Top 10 Holder Concentration: {{{onChainMetrics.top10HolderConcentrationPercent}}}%
- Deployer LP Holdings: {{{onChainMetrics.deployerLpConcentrationPercent}}}%

Sentiment Analysis:
- Community Sentiment: {{{sentimentAnalysis.humanReadableSummary}}}
- Sentiment Score: {{{sentimentAnalysis.compoundScore}}}

Your analysis should be based on these rules:
- **Overall Risk (riskLevel):** A lower Sentinel Score means higher risk. < 40 is High, 40-70 is Medium, > 70 is Low.
- **Holder Concentration Risk (holderConcentrationRisk):** > 40% is High, 20-40% is Medium, < 20% is Low.
- **Deployer LP Holdings Risk (deployerLpHoldingsRisk):** > 20% is High, 10-20% is Medium, < 10% is Low.
- **Final Verdict:** Write a 1-2 sentence conclusive summary that justifies your determined risk level, citing the most critical data points from the input. For example, for a high-risk token, mention active authorities and high concentration. For a low-risk token, mention renounced authorities and good distribution.

Produce ONLY the structured JSON output based on the provided schema.`,
});

const summarizeRiskFactorsFlow = ai.defineFlow(
  {
    name: 'summarizeRiskFactorsFlow',
    inputSchema: SummarizeRiskFactorsInputSchema,
    outputSchema: SummarizeRiskFactorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
