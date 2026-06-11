import 'dotenv/config';
import { ToolLoopAgent } from 'ai';
import { google } from '@ai-sdk/google';
import { systemInstruction } from './instruction.js';
import { getMemory, saveMemory } from './tools/memoryTools.js';
import { fetchAINews } from './tools/newsTools.js';

export const mainAgent = new ToolLoopAgent({
  model: google(process.env.VERCEL_AI_MODEL),
  instructions: systemInstruction,
  tools: {
    getMemory,
    saveMemory,
    fetchAINews,
  },
});
