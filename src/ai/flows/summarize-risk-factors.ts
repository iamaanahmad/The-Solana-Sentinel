'use server';
/**
 * @fileOverview Summarizes the key risk factors identified in the Sentinel Report.
 *
 * - summarizeRiskFactors - A function that summarizes the risk factors.
 * - SummarizeRiskFactorsInput - The input type for the summarizeRiskFactors function.
 * - SummarizeRiskFactorsOutput - The return type for the summarizeRiskFactors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRiskFactorsInputSchema = z.object({
  onChainAnalysis: z.string().describe('The on-chain analysis data.'),
  sentimentAnalysis: z.string().describe('The sentiment analysis data.'),
  sentinelScore: z.number().describe('The comprehensive risk score (0-100).'),
});
export type SummarizeRiskFactorsInput = z.infer<typeof SummarizeRiskFactorsInputSchema>;

const SummarizeRiskFactorsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key risk factors.'),
});
export type SummarizeRiskFactorsOutput = z.infer<typeof SummarizeRiskFactorsOutputSchema>;

export async function summarizeRiskFactors(input: SummarizeRiskFactorsInput): Promise<SummarizeRiskFactorsOutput> {
  return summarizeRiskFactorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRiskFactorsPrompt',
  input: {schema: SummarizeRiskFactorsInputSchema},
  output: {schema: SummarizeRiskFactorsOutputSchema},
  prompt: `You are an AI assistant that generates a brief summary of the risk factors associated with a Solana token.

  Given the following data:

  On-Chain Analysis: {{{onChainAnalysis}}}
  Sentiment Analysis: {{{sentimentAnalysis}}}
  Sentinel Score: {{{sentinelScore}}}

  Create a concise summary of the key risk factors.
  `,
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
