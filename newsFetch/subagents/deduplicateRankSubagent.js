import 'dotenv/config';
import { ToolLoopAgent, Output } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { webSearch } from '@exalabs/ai-sdk';
import { deduplicateRankVerifyInstruction } from '../instruction.js';
import { MODELS } from '../config/models.js';
import { z } from 'zod';

const twelveHoursAgo = new Date();
twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

/**
 * Combined Dedup + Rank + Verify subagent.
 * Has web search for cross-referencing claims (previously done by the separate verify agent).
 * One LLM pass handles dedup, ranking, confidence tagging, and verification.
 */
export const deduplicateRankSubagent = new ToolLoopAgent({
  model: mistral(MODELS.rank),
  instructions: deduplicateRankVerifyInstruction,
  tools: {
    // Web search for cross-referencing uncertain claims
    webSearch: webSearch({
      category: 'news',
      numResults: 5,
      startPublishedDate: twelveHoursAgo.toISOString(),
      contents: {
        text: { maxCharacters: 2000 },
        highlights: {
          numSentences: 3,
          highlightsPerUrl: 1,
          query: 'developer impact, API, SDK, model capability, infrastructure, release details',
        },
        summary: {
          query: 'Summarize the article in 2-3 sentences for software developers. Include what changed and why it matters to builders.',
        },
        livecrawl: 'always',
      },
    }),
  },
  output: Output.object({
    schema: z.object({
      tldr: z.string().describe('A 2-3 sentence executive summary of the biggest stories.'),
      trends: z.array(z.string()).describe('List of detected trends across categories.'),
      rankedSummary: z.string().describe('The full Markdown summary organized by tags (Breaking -> Trending -> Notable), with impact scores, confidence levels, deduplication applied, all citations preserved, and a short developer-focused Summary paragraph under every headline.'),
      totalItems: z.number().describe('Total unique news items after deduplication.'),
      duplicatesRemoved: z.number().describe('Number of duplicate items merged.'),
      sources: z.array(
        z.object({
          title: z.string().describe('Title of the source.'),
          url: z.string().describe('URL of the source.'),
          content: z.string().describe('Key content from the source.'),
          publishedDate: z.string().optional().describe('Published date of the source if available.'),
          aiSummary: z.string().optional().describe('AI-generated summary of the source if available.'),
        })
      ).describe('Consolidated list of all unique sources.'),
      verificationStats: z.object({
        totalItemsVerified: z.number().describe('Total number of news items verified.'),
        highConfidenceCount: z.number().describe('Number of High confidence items.'),
        mediumConfidenceCount: z.number().describe('Number of Medium confidence items.'),
        lowConfidenceCount: z.number().describe('Number of Low confidence items.'),
        crossReferencedCount: z.number().describe('Number of items independently cross-referenced.'),
      }).describe('Summary statistics of the verification process.'),
    }),
  }),
});
