import { ToolLoopAgent, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { createNewsSchema } from '../../schemas/news.js';
import { tavilySearch, tavilyExtract } from '@tavily/ai-sdk';

export const newsDraftAgent = new ToolLoopAgent({
  id: 'news-drafter',
  model: google('gemini-2.5-flash'),
  instructions: `You are a professional news drafting assistant. 
Your goal is to fetch or draft a single high-quality news item based on the client's query.

Instructions:
1. Search the web using the search tool (tavilySearch) to find the latest, most relevant, and accurate news or articles about the user's query.
2. If you need more detailed content from specific URLs found in the search results, use the extraction tool (tavilyExtract) to extract clean Markdown text.
3. Synthesize the findings into a high-quality, professional news article that matches the required structured schema.
4. Set the priority appropriately (low, medium, high, or critical) depending on the importance and urgency of the news topic.
5. Create a list of relevant tags for the news item.
6. Make sure to provide a valid sourceUrl (usually from the top search result or extracted URL).`,
  tools: {
    tavilySearch: tavilySearch({
      searchDepth: 'advanced',
      includeAnswer: true,
      maxResults: 5,
    }),
    tavilyExtract: tavilyExtract(),
  },
  output: Output.object({
    schema: createNewsSchema,
  }),
});
