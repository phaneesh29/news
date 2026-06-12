import 'dotenv/config';
import { ToolLoopAgent, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { webSearch } from '@exalabs/ai-sdk';
import { verifySubagentInstruction } from '../instruction.js';
import { GEMINI_MODELS } from '../config/models.js';
import { z } from 'zod';

const twelveHoursAgo = new Date();
twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

export const verifySubagent = new ToolLoopAgent({
  model: google(GEMINI_MODELS.verify),
  instructions: verifySubagentInstruction,
  tools: {
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
      verifiedSummary: z.string().describe('The final verified Markdown summary with confidence tags, trending/breaking/notable tags, impact scores, TL;DR, trends, citations, and a short developer-focused Summary paragraph under every headline. Prepend "**[Confidence: High/Medium/Low]**" to each news item.'),
      verificationReport: z.array(
        z.object({
          fact: z.string().describe('The specific fact or claim that was checked.'),
          confidenceLevel: z.enum(['High', 'Medium', 'Low']).describe('Confidence rating based on source grounding and independent verification.'),
          sourceUrl: z.string().optional().describe('The URL of the source supporting this claim.'),
          crossReferenced: z.boolean().describe('Whether this claim was independently cross-referenced via web search.'),
          explanation: z.string().describe('Explanation of how the confidence level was determined.'),
        })
      ).describe('A list of verification checks performed on key claims.'),
      stats: z.object({
        totalItemsVerified: z.number().describe('Total number of news items verified.'),
        highConfidenceCount: z.number().describe('Number of High confidence items.'),
        mediumConfidenceCount: z.number().describe('Number of Medium confidence items.'),
        lowConfidenceCount: z.number().describe('Number of Low confidence items.'),
        crossReferencedCount: z.number().describe('Number of items independently cross-referenced.'),
      }).describe('Summary statistics of the verification process.'),
    }),
  }),
});
