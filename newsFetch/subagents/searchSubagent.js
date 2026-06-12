import 'dotenv/config';
import { ToolLoopAgent, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { webSearch } from '@exalabs/ai-sdk';
import { tavilyExtract, tavilySearch } from '@tavily/ai-sdk';
import { devToolsSearchInstruction, aiMlSearchInstruction, devFundingSearchInstruction } from '../instruction.js';
import { GEMINI_MODELS } from '../config/models.js';
import { z } from 'zod';

const searchOutputSchema = Output.object({
  schema: z.object({
    draftSummary: z.string().describe('The Markdown-formatted draft summary of news based on search results. Each item must include a short developer-focused summary after the headline.'),
    sources: z.array(
      z.object({
        title: z.string().describe('Title of the source article/webpage.'),
        url: z.string().describe('URL of the source.'),
        content: z.string().describe('Extracted article text, Exa AI summary, Tavily extract content, or key snippets used to write the item summary.'),
        aiSummary: z.string().optional().describe('A 2-3 sentence AI-generated summary of the source, focused on developer impact.'),
        publishedDate: z.string().optional().describe('Published date of the source if available.'),
      })
    ).describe('List of web sources containing the raw facts.'),
  }),
});

function createSearchSubagent(instruction, modelName = GEMINI_MODELS.searchDefault) {
  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

  return new ToolLoopAgent({
    model: google(modelName),
    instructions: instruction,
    tools: {
      webSearch: webSearch({
        type: 'deep',
        category: 'news',
        numResults: 10,
        startPublishedDate: twelveHoursAgo.toISOString(),
        contents: {
          text: { maxCharacters: 4000 },
          highlights: {
            numSentences: 4,
            highlightsPerUrl: 2,
            query: 'developer impact, APIs, SDKs, model capabilities, infrastructure details, release details',
          },
          summary: {
            query: 'Summarize the article in 2-3 sentences for software developers. Include what changed, why it matters, and any concrete API, SDK, model, infrastructure, funding, or adoption detail.',
          },
          livecrawl: 'always',
        },
      }),
      extract: tavilyExtract({
        extractDepth: 'advanced',
        includeImages: false,
      }),
    },
    output: searchOutputSchema,
  });
}

function createTavilySearchSubagent(instruction, modelName = GEMINI_MODELS.searchDefault) {
  return new ToolLoopAgent({
    model: google(modelName),
    instructions: instruction,
    tools: {
      webSearch: tavilySearch({
        searchDepth: 'advanced',
        topic: 'news',
        includeAnswer: true,
        includeRawContent: 'markdown',
        maxResults: 10,
        timeRange: 'day',
      }),
      extract: tavilyExtract({
        extractDepth: 'advanced',
        includeImages: false,
      }),
    },
    output: searchOutputSchema,
  });
}

export const devToolsSearchSubagent = createSearchSubagent(devToolsSearchInstruction, GEMINI_MODELS.searchDefault);
export const aiMlSearchSubagent = createSearchSubagent(aiMlSearchInstruction, GEMINI_MODELS.searchAiMl);
export const devFundingSearchSubagent = createSearchSubagent(devFundingSearchInstruction, GEMINI_MODELS.searchFunding);

export const devToolsTavilySearchSubagent = createTavilySearchSubagent(devToolsSearchInstruction, GEMINI_MODELS.searchDefault);
export const aiMlTavilySearchSubagent = createTavilySearchSubagent(aiMlSearchInstruction, GEMINI_MODELS.searchAiMl);
export const devFundingTavilySearchSubagent = createTavilySearchSubagent(devFundingSearchInstruction, GEMINI_MODELS.searchFunding);
