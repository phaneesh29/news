import 'dotenv/config';
import { ToolLoopAgent } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { systemInstruction } from './instruction.js';
import { getMemory, saveMemory } from './tools/memoryTools.js';
import { searchNewsParallel, deduplicateAndRank } from './tools/newsTools.js';
import { saveNews } from './tools/saveNews.js';
import { sendNewsEmail } from './tools/emailTools.js';
import { MODELS } from './config/models.js';

export const mainAgent = new ToolLoopAgent({
  model: mistral(MODELS.orchestrator),
  instructions: systemInstruction,
  tools: {
    getMemory,
    saveMemory,
    searchNewsParallel,
    deduplicateAndRank,
    saveNews,
    sendNewsEmail,
  },
});
