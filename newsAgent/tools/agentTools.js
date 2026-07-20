import { tool } from '@openai/agents';
import { z } from 'zod';
import { tavily } from '@tavily/core';
import { scoutifySearch, scoutifyRequest, pollJob } from './scoutifySearch.js';
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
  const [scoutifyResults, tavilyResults] = await Promise.all([
    scoutifySearch(query),
    tavilySearch(query),
  ]);

  return mergeResults(scoutifyResults, tavilyResults).map((item) => ({
    ...item,
    corroborationProviders: [
      ...(item.source === 'Scoutify' ? ['Scoutify'] : []),
      ...(item.source === 'Tavily' || item.source === 'Tavily AI Answer' ? ['Tavily'] : []),
    ],
  }));
}

export const searchWebTool = tool({
  name: 'search_web',
  description: 'Search Scoutify and Tavily together for general tech and AI news updates. Returns merged raw results for cross-reference.',
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

    if (config.scoutifyApiKey) {
      try {
        const scoutifyResults = await scoutifySearch(query);
        searchResults = scoutifyResults.slice(0, 2).map(r => ({
          title: r.title,
          url: r.url,
          content: r.snippet,
          source: 'Scoutify GitHub Search'
        }));
      } catch (e) {
        console.warn('[GitHub Releases Tool] Scoutify search failed:', e.message);
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
  description: 'Extracts clean, LLM-ready text content from a URL using both Scoutify Extract and Tavily Extract when configured.',
  parameters: z.object({
    url: z.string().url().describe('The exact webpage URL to scrape (e.g., official doc or announcement page)'),
  }),
  execute: async ({ url }) => {
    const extractions = [];

    if (config.scoutifyApiKey) {
      console.log(`[Content Extractor] Scrape via Scoutify Extract: ${url}`);
      try {
        const response = await scoutifyRequest('/v1/extract', {
          urls: [url],
          output_format: 'markdown'
        });

        if (response && response.results && response.results.length > 0) {
          const result = response.results[0];
          extractions.push({
            provider: 'Scoutify',
            title: result.title || 'Extracted Page',
            url: result.url,
            summary: 'Summary not supported in Scoutify extract natively.',
            content: result.content ? result.content.substring(0, 25000) : 'No content retrieved.'
          });
        }
      } catch (e) {
        console.warn(`[Content Extractor] Scoutify Extract failed for ${url}:`, e.message);
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
      return `Error: Failed to extract content from ${url} using Scoutify and Tavily SDKs.`;
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

export const scoutifySearchTool = tool({
  name: 'scoutify_search',
  description: 'Search the web using Scoutify Search API for structured web results.',
  parameters: z.object({
    query: z.string().describe('The natural-language search query'),
    limit: z.number().optional().describe('Maximum number of results to return (1-20, defaults to 10)'),
    time_range: z.enum(['day', 'month', 'year']).optional().describe('Recency filter: day | month | year'),
  }),
  execute: async ({ query, limit, time_range }) => {
    console.log(`[Scoutify Tool] Searching: "${query}" (limit: ${limit}, time_range: ${time_range})`);
    const payload = { query };
    if (limit !== undefined) payload.limit = limit;
    if (time_range !== undefined) payload.time_range = time_range;
    const res = await scoutifyRequest('/v1/search', payload);
    return JSON.stringify(res, null, 2);
  }
});

export const scoutifyExtractTool = tool({
  name: 'scoutify_extract',
  description: 'Extract clean, main text content from one or more known URLs using Scoutify Extract.',
  parameters: z.object({
    urls: z.array(z.string().url()).describe('One or more absolute URLs to extract content from'),
    output_format: z.enum(['markdown', 'text']).optional().default('markdown').describe('Output format of extracted content'),
    include_links: z.boolean().optional().describe('Whether to extract and return links found on the page'),
  }),
  execute: async ({ urls, output_format, include_links }) => {
    console.log(`[Scoutify Tool] Extracting URLs: ${urls.join(', ')}`);
    const payload = { urls };
    if (output_format !== undefined) payload.output_format = output_format;
    if (include_links !== undefined) payload.include_links = include_links;
    const res = await scoutifyRequest('/v1/extract', payload);
    return JSON.stringify(res, null, 2);
  }
});

export const scoutifyMapTool = tool({
  name: 'scoutify_map',
  description: 'Discover and map URLs across a website starting from a base URL using Scoutify Map.',
  parameters: z.object({
    url: z.string().url().describe('The absolute starting URL of the site to map'),
    max_depth: z.number().optional().describe('Maximum crawling depth'),
    max_urls: z.number().optional().describe('Maximum number of URLs to discover and return'),
    include_subdomains: z.boolean().optional().describe('Whether to include subdomains'),
    async_mode: z.boolean().optional().default(false).describe('Whether to run as a background job and poll for completion'),
  }),
  execute: async (args) => {
    console.log(`[Scoutify Tool] Mapping: ${args.url} (async_mode: ${args.async_mode})`);
    const res = await scoutifyRequest('/v1/map', args);
    if (args.async_mode && res.id) {
      const result = await pollJob(res.id);
      return JSON.stringify(result, null, 2);
    }
    return JSON.stringify(res, null, 2);
  }
});

export const scoutifyCrawlTool = tool({
  name: 'scoutify_crawl',
  description: 'Map a website and extract content from accepted pages using Scoutify Crawl.',
  parameters: z.object({
    url: z.string().url().describe('The absolute starting URL of the site to crawl'),
    max_depth: z.number().optional().describe('Maximum crawling depth'),
    max_pages: z.number().optional().describe('Maximum number of pages to process'),
    include_subdomains: z.boolean().optional().describe('Whether to include subdomains'),
    output_format: z.enum(['markdown', 'text']).optional().default('markdown').describe('Content format of extracted pages'),
    include_links: z.boolean().optional().describe('Whether to include links in extraction'),
    async_mode: z.boolean().optional().default(false).describe('Whether to run as a background job and poll for completion'),
  }),
  execute: async (args) => {
    console.log(`[Scoutify Tool] Crawling: ${args.url} (async_mode: ${args.async_mode})`);
    const res = await scoutifyRequest('/v1/crawl', args);
    if (args.async_mode && res.id) {
      const result = await pollJob(res.id);
      return JSON.stringify(result, null, 2);
    }
    return JSON.stringify(res, null, 2);
  }
});
