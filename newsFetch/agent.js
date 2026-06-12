import 'dotenv/config';
import { ToolLoopAgent } from 'ai';
import { google } from '@ai-sdk/google';
import { systemInstruction } from './instruction.js';
import { getMemory, saveMemory } from './tools/memoryTools.js';
import { searchNewsParallel, deduplicateAndRank, verifyNews } from './tools/newsTools.js';
import { saveNews } from './tools/saveNews.js';
import { sendNewsEmail } from './tools/emailTools.js';
import { GEMINI_MODELS } from './config/models.js';

export const mainAgent = new ToolLoopAgent({
  model: google(GEMINI_MODELS.orchestrator),
  instructions: systemInstruction,
  tools: {
    getMemory,
    saveMemory,
    searchNewsParallel,
    deduplicateAndRank,
    verifyNews,
    saveNews,
    sendNewsEmail,
  },
});
