import { tavily } from '@tavily/core';
import { config } from '../config/config.js';

export async function tavilySearch(query) {
  if (!config.tavilyApiKey || config.tavilyApiKey === 'your_api_key_here') {
    console.warn('[Tavily Search] TAVILY_API_KEY is not configured.');
    return [];
  }

  console.log(`[Tavily Search] Querying with includeAnswer enabled: "${query}"`);
  try {
    const tvly = tavily({ apiKey: config.tavilyApiKey });
    const response = await tvly.search(query, {
      searchDepth: 'advanced',
      maxResults: 5,
      includeAnswer: true,
    });

    if (!response || !response.results) return [];

    const results = response.results.map((result) => {
      return {
        title: result.title || 'Untitled',
        url: result.url,
        date: result.publishedDate || result.published_date || new Date().toISOString(),
        snippet: result.content || '',
        source: 'Tavily',
      };
    });

    if (response.answer) {
      results.unshift({
        title: 'Tavily Global Search Synthesis Answer',
        url: 'https://tavily.com',
        date: new Date().toISOString(),
        snippet: response.answer,
        source: 'Tavily AI Answer',
      });
    }

    return results;
  } catch (error) {
    console.error(`[Tavily Search] Failed for query "${query}":`, error.message);
    return [];
  }
}
