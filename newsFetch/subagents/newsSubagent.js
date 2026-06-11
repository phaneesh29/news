import 'dotenv/config';
import { ToolLoopAgent } from 'ai';
import { google } from '@ai-sdk/google';
import { webSearch } from '@exalabs/ai-sdk';
import { newsSubagentInstruction } from '../instruction.js';
import { saveNews } from '../tools/saveNews.js';

const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
twoDaysAgo.setHours(0, 0, 0, 0);

export const newsSubagent = new ToolLoopAgent({
  model: google(process.env.VERCEL_AI_MODEL),
  instructions: newsSubagentInstruction,
  tools: {
    webSearch: webSearch({
      category: "news",
      startPublishedDate: twoDaysAgo.toISOString(),
    }),
    saveNews,
  },
});
