import 'dotenv/config';
import { ToolLoopAgent, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { webSearch } from '@exalabs/ai-sdk';
import { devToolsSearchInstruction, aiMlSearchInstruction, devFundingSearchInstruction } from '../instruction.js';
import { z } from 'zod';

const searchOutputSchema = Output.object({
  schema: z.object({
    draftSummary: z.string().describe('The Markdown-formatted draft summary of news based on search results.'),
    sources: z.array(
      z.object({
        title: z.string().describe('Title of the source article/webpage.'),
        url: z.string().describe('URL of the source.'),
        content: z.string().describe('Key snippets or content from the source used for the summary.'),
        publishedDate: z.string().optional().describe('Published date of the source if available.'),
      })
    ).describe('List of web sources containing the raw facts.'),
  }),
});


function createSearchSubagent(instruction) {
  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

  return new ToolLoopAgent({
    model: google(process.env.VERCEL_AI_MODEL),
    instructions: instruction,
    tools: {
      webSearch: webSearch({
        category: 'news',
        numResults: 10,
        startPublishedDate: twelveHoursAgo.toISOString(),
        contents: {
          text: { maxCharacters: 2000 },
          highlights: { numSentences: 3, highlightsPerUrl: 2 },
          summary: true,
          livecrawl: 'always',
        },
      }),
    },
    output: searchOutputSchema,
  });
}

export const devToolsSearchSubagent = createSearchSubagent(devToolsSearchInstruction);
export const aiMlSearchSubagent = createSearchSubagent(aiMlSearchInstruction);
export const devFundingSearchSubagent = createSearchSubagent(devFundingSearchInstruction);
