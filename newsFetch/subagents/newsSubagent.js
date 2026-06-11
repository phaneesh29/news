import 'dotenv/config';
import { ToolLoopAgent } from 'ai';
import { google } from '@ai-sdk/google';
import { webSearch } from '@exalabs/ai-sdk';
import { newsSubagentInstruction } from '../instruction.js';
import { saveNews } from '../tools/saveNews.js';


export const newsSubagent = new ToolLoopAgent({
  model: google(process.env.VERCEL_AI_MODEL),
  instructions: newsSubagentInstruction,
  tools: {
    webSearch: webSearch(),
    saveNews,
  },
});
