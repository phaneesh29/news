import { tool } from '@openai/agents';
import { z } from 'zod';
import Exa from 'exa-js';
import { tavily } from '@tavily/core';
import { exaSearch } from './exaSearch.js';
import { tavilySearch } from './tavilySearch.js';
import { config } from '../config/config.js';

function mergeResults(...groups) {
  const seen = new Set();
  return groups
    .flat()
    .filter(Boolean)
    .filter((item) => {
      const key = (item.url || item.title || JSON.stringify(item)).trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

async function searchWithBothProviders(query) {
  const [exaResults, tavilyResults] = await Promise.all([
    exaSearch(query),
    tavilySearch(query),
  ]);

  return mergeResults(exaResults, tavilyResults).map((item) => ({
    ...item,
    corroborationProviders: [
      ...(item.source === 'Exa' ? ['Exa'] : []),
      ...(item.source === 'Tavily' || item.source === 'Tavily AI Answer' ? ['Tavily'] : []),
    ],
  }));
}

export const searchWebTool = tool({
  name: 'search_web',
  description: 'Search Exa and Tavily together for general tech and AI news updates. Returns merged raw results for cross-reference.',
  parameters: z.object({
    query: z.string().describe('The search query for retrieving news (e.g. "React 19 release updates")'),
  }),
  execute: async ({ query }) => {
    const results = await searchWithBothProviders(query);
    return JSON.stringify(results, null, 2);
  },
});

export const searchNewsTool = tool({
  name: 'search_news',
  description: 'Searches specifically for recent news stories, blog posts, and articles on a topic.',
  parameters: z.object({
    topic: z.string().describe('The news topic to search for (e.g. "Nemotron model releases")'),
  }),
  execute: async ({ topic }) => {
    const query = `latest news and articles about ${topic}`;
    const results = await searchWithBothProviders(query);
    return JSON.stringify(results, null, 2);
  },
});

export const searchGitHubReleasesTool = tool({
  name: 'search_github_releases',
  description: 'Finds and extracts release logs or changelogs for a specific repository. Repo must be "owner/repo" (e.g. "facebook/react").',
  parameters: z.object({
    repo: z.string().describe('The GitHub repository path in "owner/repo" format'),
  }),
  execute: async ({ repo }) => {
    const query = `site:github.com/${repo}/releases latest release changelog`;
    console.log(`[GitHub Releases Tool] Searching for releases of ${repo} (last ${config.freshnessHours}h)...`);

    let searchResults = [];
    const freshAfter = new Date(Date.now() - config.freshnessHours * 60 * 60 * 1000);

    if (config.exaApiKey) {
      try {
        const exa = new Exa(config.exaApiKey);
        const searchRes = await exa.searchAndContents(query, {
          type: 'keyword',
          numResults: 2,
          startPublishedDate: freshAfter.toISOString(),
          contents: { summary: true, text: true }
        });
        searchResults = searchRes.results || [];
      } catch (e) {
        console.warn('[GitHub Releases Tool] Exa search failed:', e.message);
      }
    }

    if (config.tavilyApiKey && config.tavilyApiKey !== 'your_api_key_here') {
      try {
        const tvly = tavily({ apiKey: config.tavilyApiKey });
        const searchRes = await tvly.search(query, { maxResults: 2 });

        const freshAfterMs = freshAfter.getTime();
        const tavilyResults = (searchRes.results || []).filter((result) => {
          const dateStr = result.publishedDate || result.published_date;
          if (!dateStr) return true;
          const pubTime = new Date(dateStr).getTime();
          return Number.isFinite(pubTime) && pubTime >= freshAfterMs;
        }).map((result) => ({ ...result, source: 'Tavily GitHub Search' }));
        searchResults = mergeResults(searchResults, tavilyResults);
      } catch (e) {
        console.warn('[GitHub Releases Tool] Tavily search failed:', e.message);
      }
    }

    if (searchResults.length === 0) {
      return `No release announcements found in the last ${config.freshnessHours} hours for ${repo} on GitHub.`;
    }

    const formatted = searchResults.map(res => ({
      title: res.title || 'GitHub Release',
      url: res.url,
      snippet: res.summary || res.content || (res.text ? res.text.substring(0, 500) : 'Release changelog details.'),
      source: 'GitHub Search'
    }));

    return JSON.stringify(formatted, null, 2);
  },
});

export const extractPageContentTool = tool({
  name: 'extract_page_content',
  description: 'Extracts clean, LLM-ready text content from a URL using both Exa getContents and Tavily Extract when configured.',
  parameters: z.object({
    url: z.string().url().describe('The exact webpage URL to scrape (e.g., official doc or announcement page)'),
  }),
  execute: async ({ url }) => {
    const extractions = [];

    if (config.exaApiKey) {
      console.log(`[Content Extractor] Scrape via Exa getContents: ${url}`);
      try {
        const exa = new Exa(config.exaApiKey);
        const response = await exa.getContents([url], {
          text: true,
          summary: true,
        });

        if (response && response.results && response.results.length > 0) {
          const result = response.results[0];
          extractions.push({
            provider: 'Exa',
            title: result.title || 'Extracted Page',
            url: result.url,
            summary: result.summary || 'No summary available.',
            content: result.text ? result.text.substring(0, 25000) : 'No content retrieved.'
          });
        }
      } catch (e) {
        console.warn(`[Content Extractor] Exa getContents failed for ${url}:`, e.message);
      }
    }

    if (config.tavilyApiKey && config.tavilyApiKey !== 'your_api_key_here') {
      console.log(`[Content Extractor] Fallback scrape via Tavily Extract: ${url}`);
      try {
        const tvly = tavily({ apiKey: config.tavilyApiKey });
        const response = await tvly.extract(url);

        if (response && response.results && response.results.length > 0) {
          const result = response.results[0];
          extractions.push({
            provider: 'Tavily',
            title: 'Extracted Page',
            url: result.url,
            summary: 'Summary not supported in Tavily extract natively.',
            content: result.rawContent || result.content ? (result.rawContent || result.content).substring(0, 25000) : 'No content retrieved.'
          });
        }
      } catch (e) {
        console.error(`[Content Extractor] Tavily Extract failed for ${url}:`, e.message);
      }
    }

    if (extractions.length === 0) {
      return `Error: Failed to extract content from ${url} using Exa and Tavily SDKs.`;
    }

    return JSON.stringify({
      url,
      extractedBy: extractions.map((item) => item.provider),
      extractions,
    }, null, 2);
  },
});

export const fetchGitHubTrendingTool = tool({
  name: 'fetch_github_trending',
  description: 'Fetches the top trending repositories created inside the configured freshness window using GitHub Search API.',
  parameters: z.object({
    limit: z.number().optional().default(10).describe('Max number of repositories to return'),
  }),
  execute: async ({ limit }) => {
    try {
      const freshAfter = new Date(Date.now() - config.freshnessHours * 60 * 60 * 1000).toISOString().split('.')[0] + 'Z';
      const url = `https://api.github.com/search/repositories?q=created:>${freshAfter}&sort=stars&order=desc&per_page=${limit}`;

      console.log(`[GitHub Trending] Fetching repositories created since: ${freshAfter}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Multi-Agent-News-Briefing-System',
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API returned status ${response.status}`);
      }

      const data = await response.json();
      if (!data.items) return 'No trending repositories found.';

      const repos = data.items.map(repo => ({
        name: repo.full_name,
        description: repo.description || 'No description.',
        stars: repo.stargazers_count,
        url: repo.html_url,
        language: repo.language || 'N/A',
      }));

      return JSON.stringify(repos, null, 2);
    } catch (error) {
      console.error('[GitHub Trending] Failed to fetch trending repositories:', error.message);
      return `Error: Failed to retrieve trending repositories. ${error.message}`;
    }
  },
});

export const fetchHackerNewsTool = tool({
  name: 'fetch_hacker_news',
  description: 'Fetches stories that have hit >150 points on Hacker News inside the configured freshness window.',
  parameters: z.object({
    minPoints: z.number().optional().default(150).describe('Minimum HN points threshold'),
  }),
  execute: async ({ minPoints }) => {
    try {
      const freshAfter = Math.floor((Date.now() - config.freshnessHours * 60 * 60 * 1000) / 1000);
      const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i>${freshAfter},points>=${minPoints}&hitsPerPage=20`;

      console.log(`[Hacker News] Fetching stories with >=${minPoints} points from past ${config.freshnessHours}h...`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Algolia HN API returned status ${response.status}`);
      }

      const data = await response.json();
      if (!data.hits) return `No high-scoring Hacker News stories found in the past ${config.freshnessHours} hours.`;

      const stories = data.hits.map(hit => ({
        title: hit.title,
        points: hit.points,
        author: hit.author,
        commentsCount: hit.num_comments,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        created_at: hit.created_at,
        source: 'Hacker News'
      }));

      return JSON.stringify(stories, null, 2);
    } catch (error) {
      console.error('[Hacker News] Failed to fetch high scoring posts:', error.message);
      return `Error: Failed to retrieve Hacker News stories. ${error.message}`;
    }
  },
});

export const searchRedditSignalsTool = tool({
  name: 'search_reddit_signals',
  description: 'Searches developer subreddits (r/LocalLLaMA, r/MachineLearning, r/programming, r/webdev, r/selfhosted) for hot discussions in the configured freshness window.',
  parameters: z.object({
    subreddit: z.enum(['LocalLLaMA', 'MachineLearning', 'artificial', 'programming', 'webdev', 'selfhosted']).describe('The subreddit to monitor'),
    query: z.string().optional().default('launch OR release OR new model').describe('Target query within subreddit'),
  }),
  execute: async ({ subreddit, query }) => {
    const searchQuery = `site:reddit.com/r/${subreddit} ${query}`;
    console.log(`[Reddit Signals] Searching r/${subreddit} (${config.freshnessHours}h limit) for: "${query}"...`);

    const results = await searchWithBothProviders(searchQuery);
    return JSON.stringify(results, null, 2);
  },
});

export const searchSecurityAdvisoriesTool = tool({
  name: 'search_security_advisories',
  description: 'Searches GitHub Advisories, NVD, and CVE databases for package compromises or critical vulnerabilities in the configured freshness window.',
  parameters: z.object({
    ecosystem: z.enum(['npm', 'pypi', 'general']).optional().default('general').describe('Filter by package ecosystem'),
  }),
  execute: async ({ ecosystem }) => {
    let query = 'site:github.com/advisories OR site:nvd.nist.gov PyPI npm malware compromise vulnerability 2026';
    if (ecosystem === 'npm') {
      query = 'site:github.com/advisories "npm" malware compromise supply-chain 2026';
    } else if (ecosystem === 'pypi') {
      query = 'site:github.com/advisories "pypi" malware compromise exploit 2026';
    }

    console.log(`[Security Advisories] Searching for security alerts (${config.freshnessHours}h limit) in ecosystem: ${ecosystem}...`);
    const results = await searchWithBothProviders(query);
    return JSON.stringify(results, null, 2);
  },
});

export const fetchAcademicPapersTool = tool({
  name: 'fetch_academic_papers',
  description: 'Fetches recent frontier AI academic papers and preprints from Hugging Face Daily Papers (with optional date YYYY-MM-DD).',
  parameters: z.object({
    limit: z.number().optional().default(15).describe('Max number of papers to return'),
    date: z.string().optional().describe('Optional date to fetch papers for (YYYY-MM-DD)'),
  }),
  execute: async ({ limit, date }) => {
    try {
      const url = date
        ? `https://huggingface.co/api/daily_papers?date=${date}`
        : 'https://huggingface.co/api/daily_papers';
      console.log(`[Academic Papers] Fetching curated Hugging Face Daily Papers (date: ${date || 'latest'})...`);
      let response = await fetch(url);
      let data;

      if (!response.ok) {
        console.warn(`[Academic Papers] Hugging Face API returned status ${response.status} for URL ${url}. Falling back to the latest curated papers...`);
        const fallbackResponse = await fetch('https://huggingface.co/api/daily_papers');
        if (!fallbackResponse.ok) {
          throw new Error(`Hugging Face API fallback returned status ${fallbackResponse.status}`);
        }
        data = await fallbackResponse.json();
      } else {
        data = await response.json();
        
        if (date && (!data || data.length === 0)) {
          console.log(`[Academic Papers] No papers found for date ${date}. Falling back to the latest curated papers...`);
          const fallbackResponse = await fetch('https://huggingface.co/api/daily_papers');
          if (fallbackResponse.ok) {
            data = await fallbackResponse.json();
          }
        }
      }

      if (!data || data.length === 0) return 'No academic papers found.';

      const papers = data.slice(0, limit).map(item => {
        const paperId = item.paper?.id || '';
        return {
          title: item.title,
          summary: item.paper?.summary || item.summary || 'No summary available.',
          upvotes: item.paper?.upvotes || 0,
          url: paperId ? `https://huggingface.co/papers/${paperId}` : '',
          pdfUrl: paperId ? `https://arxiv.org/pdf/${paperId}.pdf` : '',
          publishedAt: item.publishedAt || item.paper?.publishedAt || '',
          submittedOnDailyAt: item.paper?.submittedOnDailyAt || '',
          authors: item.paper?.authors?.map(a => a.name) || [],
          source: 'Hugging Face Daily Papers / arXiv'
        };
      });

      return JSON.stringify(papers, null, 2);
    } catch (error) {
      console.error('[Academic Papers] Failed to fetch academic papers:', error.message);
      return `Error: Failed to retrieve academic papers. ${error.message}`;
    }
  },
});

export const fetchOpenRouterModelsTool = tool({
  name: 'fetch_openrouter_models',
  description: 'Fetches recently added or updated AI models from OpenRouter API.',
  parameters: z.object({
    limit: z.number().optional().default(5).describe('Max number of recent models to return'),
  }),
  execute: async ({ limit }) => {
    try {
      console.log(`[OpenRouter] Fetching latest models...`);
      const response = await fetch('https://openrouter.ai/api/v1/models');
      
      if (!response.ok) {
        throw new Error(`OpenRouter API returned status ${response.status}`);
      }

      const data = await response.json();
      if (!data.data || data.data.length === 0) return 'No models found on OpenRouter.';

      const sortedModels = data.data
        .filter(m => m.created)
        .sort((a, b) => b.created - a.created)
        .slice(0, limit);

      const models = sortedModels.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description || 'No description.',
        context_length: model.context_length,
        pricing: model.pricing,
        created: new Date(model.created * 1000).toISOString(),
        source: 'OpenRouter'
      }));

      return JSON.stringify(models, null, 2);
    } catch (error) {
      console.error('[OpenRouter] Failed to fetch models:', error.message);
      return `Error: Failed to retrieve OpenRouter models. ${error.message}`;
    }
  },
});
