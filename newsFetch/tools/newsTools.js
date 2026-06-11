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

    const result = await newsSubagent.generate({
      prompt,
      abortSignal,
    });

    return result.text;
  },
});
