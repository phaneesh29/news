import { ToolLoopAgent, Output } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { createNewsSchema } from '../../schemas/news.js';
import { tavilySearch, tavilyExtract } from '@tavily/ai-sdk';
import { newsDraftInstructions } from './instructions.js';

export const newsDraftAgent = new ToolLoopAgent({
  id: 'news-drafter',
  model: mistral('codestral-2508'),
  instructions: newsDraftInstructions,
  tools: {
    tavilySearch: tavilySearch({
      searchDepth: 'advanced',
      topic: 'news',
      days: 7,
      includeAnswer: true,
      maxResults: 5,
    }),
    tavilyExtract: tavilyExtract(),
  },
  output: Output.object({
    schema: createNewsSchema,
  }),
});
