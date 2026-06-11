import 'dotenv/config';
import { tool } from 'ai';
import { z } from 'zod';
import { searchSubagent } from '../subagents/searchSubagent.js';
import { verifySubagent } from '../subagents/verifySubagent.js';

export const searchNews = tool({
  description: 'Search for the latest AI/developer news. Returns a draft summary and a list of sources used.',
  inputSchema: z.object({
    query: z.string().optional().describe('An optional search query or topic to focus the news search on.'),
  }),
  execute: async ({ query }, { abortSignal }) => {
    const today = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const todayStr = formatDate(today);
    const twoDaysAgoStr = formatDate(twoDaysAgo);

    const prompt = `Today's date is ${todayStr}.
Please search for and compile the latest AI news specifically from ${twoDaysAgoStr} to ${todayStr} (inclusive). Do not include news from before ${twoDaysAgoStr}.
${query ? `Focus on: ${query}` : 'Include new model releases, acquisitions, investments, and new tech releases.'}`;

    const result = await searchSubagent.generate({
      prompt,
      abortSignal,
    });

    return result.output;
  },
});

export const verifyNews = tool({
  description: 'Verify a draft news summary against its sources to check for hallucinations and ensure 100% grounding.',
  inputSchema: z.object({
    draftSummary: z.string().describe('The Markdown-formatted draft news summary to verify.'),
    sources: z.array(
      z.object({
        title: z.string().describe('Title of the source.'),
        url: z.string().describe('URL of the source.'),
        content: z.string().describe('Key snippets or content from the source.'),
      })
    ).describe('The list of sources containing the raw facts.'),
  }),
  execute: async ({ draftSummary, sources }, { abortSignal }) => {
    const prompt = `Please verify the following draft summary against the provided sources.

Draft Summary:
${draftSummary}

Sources:
${JSON.stringify(sources, null, 2)}
`;

    const result = await verifySubagent.generate({
      prompt,
      abortSignal,
    });

    return result.output;
  },
});
