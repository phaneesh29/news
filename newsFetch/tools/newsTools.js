import 'dotenv/config';
import { tool } from 'ai';
import { z } from 'zod';
import { newsSubagent } from '../subagents/newsSubagent.js';

export const fetchAINews = tool({
  description: 'Delegate a task to search for the latest AI/developer news (new model releases, acquisitions, investments, tech releases), save it to news.md, and report the status.',
  inputSchema: z.object({
    query: z.string().optional().describe('An optional search query or topic to focus the news search on.'),
  }),
  execute: async ({ query }, { abortSignal }) => {
    const prompt = query
      ? `Search for latest AI news focusing on: ${query}`
      : 'Search for the latest AI news including new model releases, acquisitions, investments, and new tech releases.';

    const result = await newsSubagent.generate({
      prompt,
      abortSignal,
    });

    return result.text;
  },
});
