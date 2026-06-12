import 'dotenv/config';
import { ToolLoopAgent } from 'ai';
import { systemInstruction } from './instruction.js';
import { getMemory, saveMemory } from './tools/memoryTools.js';
import { searchNewsParallel, deduplicateAndRank } from './tools/newsTools.js';
import { saveNews } from './tools/saveNews.js';
import { sendNewsEmail } from './tools/emailTools.js';
import { getModel } from './config/models.js';

export const mainAgent = new ToolLoopAgent({
  model: getModel('orchestrator'),
  instructions: systemInstruction,
  providerOptions: {
    mistral: {
      parallelToolCalls: false,
    },
  },
  tools: {
    getMemory,
    saveMemory,
    searchNewsParallel,
    deduplicateAndRank,
    saveNews,
    sendNewsEmail,
  },
});
