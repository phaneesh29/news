import 'dotenv/config';
import { ToolLoopAgent } from 'ai';
import { google } from '@ai-sdk/google';
import { systemInstruction } from './instruction.js';
import { getMemory, saveMemory } from './tools/memoryTools.js';


export const memoryAgent = new ToolLoopAgent({
  model: google(process.env.VERCEL_AI_MODEL),
  instructions: systemInstruction,
  tools: {
    getMemory,
    saveMemory,
  },
});
