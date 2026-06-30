import { ToolLoopAgent, Output } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { createDocSchema } from '../../schemas/doc.js';
import { tavilySearch, tavilyExtract } from '@tavily/ai-sdk';
import { docDraftInstructions } from './instructions.js';

export const docDraftAgent = new ToolLoopAgent({
  id: 'doc-drafter',
  model: mistral('codestral-2508'),
  instructions: docDraftInstructions,
  tools: {
    tavilySearch: tavilySearch({
      searchDepth: 'advanced',
      timeRange: 'year',
      includeAnswer: true,
      maxResults: 5,
    }),
    tavilyExtract: tavilyExtract(),
  },
  output: Output.object({
    schema: createDocSchema,
  }),
});
