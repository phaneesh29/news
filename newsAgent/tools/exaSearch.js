import Exa from 'exa-js';
import { config } from '../config/config.js';


export async function exaSearch(query) {
  if (!config.exaApiKey) {
    console.warn('[Exa Search] EXA_API_KEY is not configured.');
    return [];
  }

  const freshAfter = new Date(Date.now() - config.freshnessHours * 60 * 60 * 1000);
  console.log(`[Exa Search] Querying (${config.freshnessHours}h Freshness Filter): "${query}"`);
  
  try {
    const exa = new Exa(config.exaApiKey);
    const response = await exa.searchAndContents(query, {
      type: 'auto',
      numResults: 20,
      startPublishedDate: freshAfter.toISOString(),
      contents: {
        text: true,
        summary: true,
      },
    });

    if (!response || !response.results) return [];

    const freshAfterMs = freshAfter.getTime();
    return response.results
      .filter((result) => {
        if (!result.publishedDate) return true;
        const pubTime = new Date(result.publishedDate).getTime();
        return Number.isFinite(pubTime) && pubTime >= freshAfterMs;
      })
      .map((result) => {
        const snippet = result.summary || (result.text ? result.text.substring(0, 1500) + '...' : '');

        return {
          title: result.title || 'Untitled',
          url: result.url,
          date: result.publishedDate || new Date().toISOString(),
          snippet: snippet,
          source: 'Exa',
        };
      });
  } catch (error) {
    console.error(`[Exa Search] Failed for query "${query}":`, error.message);
    return [];
  }
}
