
'use server';
/**
 * @fileOverview Provides AI-powered suggestions for summarizing official decision content.
 *
 * - summarizeDecisionContent - A function that suggests a summary for decision content.
 * - SummarizeDecisionInput - The input type for the summarizeDecisionContent function.
 * - SummarizeDecisionOutput - The return type for the summarizeDecisionContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDecisionInputSchema = z.object({
  decisionContent: z
    .string()
    .describe('The full text or abstract of the official decision to summarize.'),
});
export type SummarizeDecisionInput = z.infer<
  typeof SummarizeDecisionInputSchema
>;

const SummarizeDecisionOutputSchema = z.object({
  summary: z.string().describe('A concise, citizen-friendly summary of the decision.'),
});
export type SummarizeDecisionOutput = z.infer<
  typeof SummarizeDecisionOutputSchema
>;

export async function summarizeDecisionContent(
  input: SummarizeDecisionInput
): Promise<SummarizeDecisionOutput> {
  return summarizeDecisionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDecisionPrompt',
  input: {schema: SummarizeDecisionInputSchema},
  output: {schema: SummarizeDecisionOutputSchema},
  prompt: `You are an AI assistant helping local government officials summarize official decisions for public understanding.
The decision content can be lengthy and formal. Your task is to create a concise, clear, and easy-to-understand summary.
Focus on the key outcomes and impacts of the decision for citizens. Avoid jargon where possible or explain it simply.
The summary should be in French.

Decision Content:
{{{decisionContent}}}

Generate only the summary text.`,
});

const summarizeDecisionFlow = ai.defineFlow(
  {
    name: 'summarizeDecisionFlow',
    inputSchema: SummarizeDecisionInputSchema,
    outputSchema: SummarizeDecisionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
