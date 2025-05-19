
"use server";

import { suggestContentMetadata, type SuggestContentMetadataInput, type SuggestContentMetadataOutput } from "@/ai/flows/suggest-content-metadata";
import { draftCommunicationMessage, type DraftCommunicationMessageInput, type DraftCommunicationMessageOutput } from "@/ai/flows/draft-communication-message-flow";

export async function getAISuggestions(input: SuggestContentMetadataInput): Promise<SuggestContentMetadataOutput | { error: string }> {
  try {
    if (!input.content || input.content.trim().length < 10) {
        return { error: "Content is too short to generate meaningful suggestions." };
    }
    const suggestions = await suggestContentMetadata(input);
    return suggestions;
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    return { error: "Failed to get AI suggestions. Please try again." };
  }
}

export async function getAIDraftedMessage(input: DraftCommunicationMessageInput): Promise<DraftCommunicationMessageOutput | { error: string }> {
  try {
    if (!input.announcementSummary || input.announcementSummary.trim().length < 5) {
        return { error: "Announcement summary is too short to draft a meaningful message." };
    }
    if (!input.selectedChannels || input.selectedChannels.length === 0) {
        return { error: "No communication channels selected for AI drafting." };
    }
    const suggestion = await draftCommunicationMessage(input);
    return suggestion;
  } catch (error) {
    console.error("Error getting AI drafted message:", error);
    return { error: "Failed to get AI drafted message. Please try again." };
  }
}
