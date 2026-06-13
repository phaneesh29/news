import Exa from 'exa-js';
import { config } from '../config/config.js';


export async function exaSearch(query) {
  if (!config.exaApiKey) {
    console.warn('[Exa Search] EXA_API_KEY is not configured.');
    return [];
  }

  console.log(`[Exa Search] Querying with AI Summary enabled: "${query}"`);
  try {
    const exa = new Exa(config.exaApiKey);
    const response = await exa.searchAndContents(query, {
      type: 'deep',
      numResults: 5,
      contents: {
        text: true,
        summary: true,
      },
    });

    if (!response || !response.results) return [];

    return response.results.map((result) => {
      const snippet = result.summary || (result.text ? result.text.substring(0, 300) + '...' : '');

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
