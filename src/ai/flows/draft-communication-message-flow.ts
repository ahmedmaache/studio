
'use server';
/**
 * @fileOverview Provides AI-powered suggestions for drafting communication messages.
 *
 * - draftCommunicationMessage - A function that drafts a message based on summary and channels.
 * - DraftCommunicationMessageInput - The input type for the draftCommunicationMessage function.
 * - DraftCommunicationMessageOutput - The return type for the draftCommunicationMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftCommunicationMessageInputSchema = z.object({
  announcementSummary: z
    .string()
    .describe('The summary of the announcement to draft a message for.'),
  selectedChannels: z
    .array(z.string())
    .describe('An array of selected communication channels (e.g., "SMS", "WhatsApp", "Push Notification").'),
});
export type DraftCommunicationMessageInput = z.infer<
  typeof DraftCommunicationMessageInputSchema
>;

const DraftCommunicationMessageOutputSchema = z.object({
  suggestedMessage: z.string().describe('The AI-drafted communication message.'),
});
export type DraftCommunicationMessageOutput = z.infer<
  typeof DraftCommunicationMessageOutputSchema
>;

export async function draftCommunicationMessage(
  input: DraftCommunicationMessageInput
): Promise<DraftCommunicationMessageOutput> {
  return draftCommunicationMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftCommunicationMessagePrompt',
  input: {schema: DraftCommunicationMessageInputSchema},
  output: {schema: DraftCommunicationMessageOutputSchema},
  prompt: `You are an AI assistant helping local government officials draft clear and effective public announcements.
Given the announcement summary and the target communication channels, generate a suitable message.

Announcement Summary: {{{announcementSummary}}}
Target Channels: {{#each selectedChannels}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Consider the following when drafting the message:
- If "SMS" is a target channel, prioritize brevity (ideally under 160 characters, strict maximum around 450 characters for multi-part SMS).
- If "WhatsApp" is a target channel, the message can be slightly more descriptive and use simple formatting like bolding for emphasis if appropriate (though output raw text here).
- If "Push Notification" is a target channel, make the message engaging and concise to encourage opens.
- The message should be in French.
- Be direct and informative.

Generate one single message that tries to best accommodate all selected channels. If SMS is selected, its constraints are the most important for length.
The output should be just the suggested message text.
`,
});

const draftCommunicationMessageFlow = ai.defineFlow(
  {
    name: 'draftCommunicationMessageFlow',
    inputSchema: DraftCommunicationMessageInputSchema,
    outputSchema: DraftCommunicationMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
