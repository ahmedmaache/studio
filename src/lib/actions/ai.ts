"use server";

import { suggestContentMetadata, type SuggestContentMetadataInput, type SuggestContentMetadataOutput } from "@/ai/flows/suggest-content-metadata";

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
