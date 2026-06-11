import 'dotenv/config';
import { ToolLoopAgent, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { deduplicateRankInstruction } from '../instruction.js';
import { z } from 'zod';

export const deduplicateRankSubagent = new ToolLoopAgent({
  model: google(process.env.VERCEL_AI_MODEL),
  instructions: deduplicateRankInstruction,
  tools: {},
  output: Output.object({
    schema: z.object({
      tldr: z.string().describe('A 2-3 sentence executive summary of the biggest stories.'),
      trends: z.array(z.string()).describe('List of detected trends across categories (e.g., "Multiple AI coding tools released today").'),
      rankedSummary: z.string().describe('The full Markdown summary organized by tags (Breaking → Trending → Notable), with impact scores, deduplication applied, and all citations preserved.'),
      totalItems: z.number().describe('Total unique news items after deduplication.'),
      duplicatesRemoved: z.number().describe('Number of duplicate items merged.'),
      sources: z.array(
        z.object({
          title: z.string().describe('Title of the source.'),
          url: z.string().describe('URL of the source.'),
          content: z.string().describe('Key content from the source.'),
        })
      ).describe('Consolidated list of all unique sources.'),
    }),
  }),
});
