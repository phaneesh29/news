import 'dotenv/config';
import { ToolLoopAgent } from 'ai';
import { systemInstruction } from './instruction.js';
import { getMemory, saveMemory } from './tools/memoryTools.js';


export const memoryAgent = new ToolLoopAgent({
  model: process.env.VERCEL_AI_MODEL,
  instructions: systemInstruction,
  tools: {
    getMemory,
    saveMemory,
  },
});
