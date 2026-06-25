import { ToolLoopAgent, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { createBlogSchema } from '../../schemas/blog.js';
import { tavilySearch, tavilyExtract } from '@tavily/ai-sdk';
import { blogDraftInstructions } from './instructions.js';

export const blogDraftAgent = new ToolLoopAgent({
  id: 'blog-drafter',
  model: google('gemini-3.1-flash-lite-preview'),
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
