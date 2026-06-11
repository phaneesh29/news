import 'dotenv/config';
import { ToolLoopAgent, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { webSearch } from '@exalabs/ai-sdk';
import { searchSubagentInstruction } from '../instruction.js';
import { z } from 'zod';

const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
twoDaysAgo.setHours(0, 0, 0, 0);

export const searchSubagent = new ToolLoopAgent({
  model: google(process.env.VERCEL_AI_MODEL),
  instructions: searchSubagentInstruction,
  tools: {
    webSearch: webSearch({
      category: "news",
      startPublishedDate: twoDaysAgo.toISOString(),
    }),
  },
  output: Output.object({
    schema: z.object({
      draftSummary: z.string().describe('The Markdown-formatted draft summary of the latest AI developer news based on the search results.'),
      sources: z.array(
        z.object({
          title: z.string().describe('Title of the source article/webpage.'),
          url: z.string().describe('URL of the source.'),
          content: z.string().describe('Key snippets or content from the source used for the summary.'),
        })
      ).describe('List of web searched sources containing the raw facts.'),
    }),
  }),
});
