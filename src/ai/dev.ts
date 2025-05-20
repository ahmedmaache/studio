
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-content-metadata.ts';
import '@/ai/flows/draft-communication-message-flow.ts';
import '@/ai/flows/generate-image-flow.ts';
import '@/ai/flows/summarize-decision-flow.ts';

