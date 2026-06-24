import { ToolLoopAgent, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { createDocSchema } from '../../schemas/doc.js';
import { tavilySearch, tavilyExtract } from '@tavily/ai-sdk';
import { docDraftInstructions } from './instructions.js';

export const docDraftAgent = new ToolLoopAgent({
  id: 'doc-drafter',
  model: google('gemini-3.1-flash-lite-preview'),
  instructions: docDraftInstructions,
  tools: {
    tavilySearch: tavilySearch({
      searchDepth: 'advanced',
      includeAnswer: true,
      maxResults: 5,
    }),
    tavilyExtract: tavilyExtract(),
  },
  output: Output.object({
    schema: createDocSchema,
  }),
});
