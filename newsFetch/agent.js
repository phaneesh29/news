import 'dotenv/config';
import { ToolLoopAgent } from 'ai';
import { google } from '@ai-sdk/google';
import { systemInstruction } from './instruction.js';
import { getMemory, saveMemory } from './tools/memoryTools.js';
import { searchNewsParallel, deduplicateAndRank, verifyNews } from './tools/newsTools.js';
import { saveNews } from './tools/saveNews.js';

export const mainAgent = new ToolLoopAgent({
  model: google(process.env.VERCEL_AI_MODEL),
  instructions: systemInstruction,
  tools: {
    getMemory,
    saveMemory,
    searchNewsParallel,
    deduplicateAndRank,
    verifyNews,
    saveNews,
  },
});
