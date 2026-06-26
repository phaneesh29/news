import { tavily } from '@tavily/core';
import { config } from '../config/config.js';

export async function tavilySearch(query) {
  if (!config.tavilyApiKey || config.tavilyApiKey === 'your_api_key_here') {
    console.warn('[Tavily Search] TAVILY_API_KEY is not configured.');
    return [];
  }

  console.log(`[Tavily Search] Querying (${config.freshnessHours}h Freshness Filter): "${query}"`);
  try {
    const tvly = tavily({ apiKey: config.tavilyApiKey });
    const response = await tvly.search(query, {
      searchDepth: 'advanced',
      maxResults: 10,
      includeAnswer: true,
      topic: 'news',
      days: Math.max(1, Math.ceil(config.freshnessHours / 24)),
    });

    if (!response || !response.results) return [];

    const freshAfterMs = Date.now() - config.freshnessHours * 60 * 60 * 1000;
    
    const results = response.results
      .filter((result) => {
        const dateStr = result.publishedDate || result.published_date;
        if (!dateStr) return true;
        const pubTime = new Date(dateStr).getTime();
        return Number.isFinite(pubTime) && pubTime >= freshAfterMs;
      })
      .map((result) => {
        return {
          title: result.title || 'Untitled',
          url: result.url,
          date: result.publishedDate || result.published_date || new Date().toISOString(),
          snippet: result.content || '',
          source: 'Tavily',
        };
      });

    if (response.answer && results.length > 0) {
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
