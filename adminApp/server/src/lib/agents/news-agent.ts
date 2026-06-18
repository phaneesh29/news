import { ToolLoopAgent, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { createNewsSchema } from '../../schemas/news.js';
import { tavilySearch, tavilyExtract } from '@tavily/ai-sdk';
import { newsDraftInstructions } from './instructions.js';

export const newsDraftAgent = new ToolLoopAgent({
  id: 'news-drafter',
  model: google('gemini-2.5-flash'),
  instructions: newsDraftInstructions,
  tools: {
    tavilySearch: tavilySearch({
      searchDepth: 'advanced',
      includeAnswer: true,
      maxResults: 5,
    }),
    tavilyExtract: tavilyExtract(),
  },
  output: Output.object({
    schema: createNewsSchema,
  }),
});
