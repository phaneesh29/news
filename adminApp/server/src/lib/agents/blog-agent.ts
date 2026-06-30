import { ToolLoopAgent, Output } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { createBlogSchema } from '../../schemas/blog.js';
import { tavilySearch, tavilyExtract } from '@tavily/ai-sdk';
import { blogDraftInstructions } from './instructions.js';

export const blogDraftAgent = new ToolLoopAgent({
  id: 'blog-drafter',
  model: mistral('codestral-2508'),
  instructions: blogDraftInstructions,
  tools: {
    tavilySearch: tavilySearch({
      searchDepth: 'advanced',
      timeRange: 'month',
      includeAnswer: true,
      maxResults: 5,
    }),
    tavilyExtract: tavilyExtract(),
  },
  output: Output.object({
    schema: createBlogSchema,
  }),
});
