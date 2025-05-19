// src/ai/flows/suggest-content-metadata.ts
'use server';

/**
 * @fileOverview Provides AI-powered suggestions for content metadata (categories, tags, summary).
 *
 * - suggestContentMetadata - A function that suggests metadata for content.
 * - SuggestContentMetadataInput - The input type for the suggestContentMetadata function.
 * - SuggestContentMetadataOutput - The return type for the suggestContentMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestContentMetadataInputSchema = z.object({
  content: z
    .string()
    .describe('The content of the announcement or event to analyze.'),
});
export type SuggestContentMetadataInput = z.infer<
  typeof SuggestContentMetadataInputSchema
>;

const SuggestContentMetadataOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the content.'),
  categories: z
    .array(z.string())
    .describe('Suggested categories for the content.'),
  tags: z.array(z.string()).describe('Suggested tags for the content.'),
});
export type SuggestContentMetadataOutput = z.infer<
  typeof SuggestContentMetadataOutputSchema
>;

export async function suggestContentMetadata(
  input: SuggestContentMetadataInput
): Promise<SuggestContentMetadataOutput> {
  return suggestContentMetadataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestContentMetadataPrompt',
  input: {schema: SuggestContentMetadataInputSchema},
  output: {schema: SuggestContentMetadataOutputSchema},
  prompt: `You are an AI assistant helping local government officials to publish announcements and events.

  Given the following content, suggest a concise summary, relevant categories, and tags to improve discoverability and organization.

  Content: {{{content}}}

  Format your response as a JSON object conforming to the following schema:
  {summary: string, categories: string[], tags: string[]}. The category and tag arrays should contain 3-5 items.`,
});

const suggestContentMetadataFlow = ai.defineFlow(
  {
    name: 'suggestContentMetadataFlow',
    inputSchema: SuggestContentMetadataInputSchema,
    outputSchema: SuggestContentMetadataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
