import { tool } from '@openai/agents';
import { z } from 'zod';
import { scoutifySearch, scoutifyRequest, pollJob } from './scoutifySearch.js';
import { config } from '../config/config.js';

export const searchGitHubReleasesTool = tool({
  name: 'search_github_releases',
  description: 'Finds and extracts release logs or changelogs for a specific repository. Repo must be "owner/repo" (e.g. "facebook/react").',
  parameters: z.object({
    repo: z.string().describe('The GitHub repository path in "owner/repo" format'),
  }),
  execute: async ({ repo }) => {
    const query = `site:github.com/${repo}/releases latest release changelog`;
    console.log(`[GitHub Releases Tool] Searching for releases of ${repo} (last ${config.freshnessHours}h)...`);

    const scoutifyResults = await scoutifySearch(query);
    const searchResults = scoutifyResults.slice(0, 2).map(r => ({
      title: r.title,
      url: r.url,
      content: r.snippet,
      source: 'Scoutify GitHub Search'
    }));

    if (searchResults.length === 0) {
      return `No release announcements found in the last ${config.freshnessHours} hours for ${repo} on GitHub.`;
    }

    const formatted = searchResults.map(res => ({
      title: res.title || 'GitHub Release',
      url: res.url,
      snippet: res.snippet || res.content || 'Release changelog details.',
      source: 'GitHub Search'
    }));

    return JSON.stringify(formatted, null, 2);
  },
});

export const extractPageContentTool = tool({
  name: 'extract_page_content',
  description: 'Extracts clean, LLM-ready text content from a URL using Scoutify Extract.',
  parameters: z.object({
    url: z.string().url().describe('The exact webpage URL to scrape'),
  }),
  execute: async ({ url }) => {
    console.log(`[Content Extractor] Scrape via Scoutify Extract: ${url}`);
    try {
      const response = await scoutifyRequest('/v1/extract', { urls: [url] });
      const results = response.results;
      if (!results || results.length === 0) {
        return `Error: Failed to extract content from ${url}.`;
      }
      const result = results[0];
      return JSON.stringify({
        url: result.url || url,
        title: result.title || 'Extracted Page',
        content: result.content ? result.content.substring(0, 25000) : 'No content retrieved.',
      }, null, 2);
    } catch (e) {
      return `Error: Failed to extract content from ${url}: ${e.message}`;
    }
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
  description: 'Searches developer subreddits (r/LocalLLaMA, r/MachineLearning, r/programming, r/webdev, r/selfhosted, r/node, r/reactjs, r/golang, r/rust, r/devops, r/nextjs) for hot discussions in the configured freshness window.',
  parameters: z.object({
    subreddit: z.enum(['LocalLLaMA', 'MachineLearning', 'artificial', 'programming', 'webdev', 'selfhosted', 'node', 'reactjs', 'golang', 'rust', 'devops', 'nextjs']).describe('The subreddit to monitor'),
    query: z.string().optional().default('launch OR release OR new model').describe('Target query within subreddit'),
  }),
  execute: async ({ subreddit, query }) => {
    const searchQuery = `site:reddit.com/r/${subreddit} ${query}`;
    console.log(`[Reddit Signals] Searching r/${subreddit} (${config.freshnessHours}h limit) for: "${query}"...`);

    const results = await searchWithScoutify(searchQuery);
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
    const results = await searchWithScoutify(query);
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
      let data = response.ok ? await response.json() : null;

      if (!data || data.length === 0) {
        const fallback = await fetch('https://huggingface.co/api/daily_papers');
        if (!fallback.ok) throw new Error(`Hugging Face API returned status ${fallback.status}`);
        data = await fallback.json();
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

export const fetchLobstersNewsTool = tool({
  name: 'fetch_lobsters_news',
  description: 'Fetches hot developer-focused stories and programming discussions from Lobste.rs.',
  parameters: z.object({
    limit: z.number().optional().default(15).describe('Max number of stories to retrieve'),
  }),
  execute: async ({ limit }) => {
    try {
      console.log(`[Lobsters] Fetching hot stories...`);
      const response = await fetch('https://lobste.rs/hottest.json');
      if (!response.ok) {
        throw new Error(`Lobsters API returned status ${response.status}`);
      }
      const data = await response.json();
      if (!data || data.length === 0) return 'No stories found on Lobsters.';

      const stories = data.slice(0, limit).map(item => ({
        title: item.title,
        url: item.url || item.comments_url,
        commentsUrl: item.comments_url,
        score: item.score,
        tags: item.tags,
        created: item.created_at,
        source: 'Lobsters'
      }));
      return JSON.stringify(stories, null, 2);
    } catch (error) {
      console.error('[Lobsters] Failed to fetch hot stories:', error.message);
      return `Error: Failed to retrieve Lobsters stories. ${error.message}`;
    }
  }
});

export const fetchSpecializedDevNewsTool = tool({
  name: 'fetch_specialized_dev_news',
  description: 'Searches specialized high-signal developer news portals (InfoQ, Phoronix, HackerNoon, Dev.to) for recent updates.',
  parameters: z.object({
    query: z.string().describe('The topic or technology keyword to search (e.g. "WebAssembly", "PostgreSQL")'),
  }),
  execute: async ({ query }) => {
    const siteQuery = `(site:infoq.com OR site:phoronix.com OR site:hackernoon.com OR site:dev.to) ${query}`;
    console.log(`[Specialized Dev News] Searching dev portals for: "${query}"...`);
    const results = await searchWithScoutify(siteQuery);
    return JSON.stringify(results, null, 2);
  }
});

export const scoutifySearchTool = tool({
  name: 'scoutify_search',
  description: 'Search the web using Scoutify Search API for structured web results.',
  parameters: z.object({
    query: z.string().describe('The natural-language search query'),
    max_results: z.number().optional().describe('Maximum number of results to return (1-20, defaults to 10)'),
    freshness: z.enum(['day', 'month', 'year']).optional().describe('Recency filter: day | month | year'),
  }),
  execute: async ({ query, max_results, freshness }) => {
    console.log(`[Scoutify Tool] Searching: "${query}" (max_results: ${max_results}, freshness: ${freshness})`);
    try {
      const payload = { query };
      if (max_results !== undefined) payload.limit = Math.min(50, Math.max(1, Math.trunc(max_results)));
      if (freshness !== undefined) payload.time_range = freshness;
      const res = await scoutifyRequest('/v1/search', payload);

      const results = (res.results || []).map((r) => ({
        title: r.title || 'Untitled',
        url: r.url,
        date: r.published_date || null,
        snippet: r.content || '',
        score: r.score,
      }));
      return JSON.stringify({ query: res.query || query, result_count: results.length, results }, null, 2);
    } catch (e) {
      return `Scoutify search failed for "${query}": ${e.message}`;
    }
  }
});

export const scoutifyExtractTool = tool({
  name: 'scoutify_extract',
  description: 'Extract clean, main text content from one or more known URLs using Scoutify Extract.',
  parameters: z.object({
    urls: z.array(z.string().url()).describe('One or more absolute URLs to extract content from (max 20)'),
    output_format: z.enum(['markdown', 'text']).optional().describe('Output format. Default markdown.'),
  }),
  execute: async ({ urls, output_format }) => {
    console.log(`[Scoutify Tool] Extracting URLs: ${urls.join(', ')}`);
    try {
      const payload = { urls: urls.slice(0, 20) };
      if (output_format !== undefined) payload.output_format = output_format;
      const res = await scoutifyRequest('/v1/extract', payload);

      const pages = (res.results || []).map((p) => ({
        url: p.url,
        title: p.title || 'Extracted Page',
        content: p.content ? p.content.substring(0, 25000) : '',
      }));
      return JSON.stringify({ extracted_count: pages.length, pages }, null, 2);
    } catch (e) {
      return `Scoutify extract failed: ${e.message}`;
    }
  }
});

export const scoutifyMapTool = tool({
  name: 'scoutify_map',
  description: 'Discover and map URLs across a website starting from a base URL using Scoutify Map.',
  parameters: z.object({
    url: z.string().url().describe('The absolute starting URL of the site to map'),
    max_urls: z.number().optional().describe('Maximum number of URLs to discover and return'),
    async_mode: z.boolean().optional().default(false).describe('Whether to run as a background job and poll for completion'),
  }),
  execute: async ({ url, max_urls, async_mode }) => {
    console.log(`[Scoutify Tool] Mapping: ${url} (async_mode: ${async_mode})`);
    const payload = { url };
    if (max_urls !== undefined) payload.max_urls = max_urls;
    if (async_mode !== undefined) payload.async_mode = async_mode;
    try {
      const res = await scoutifyRequest('/v1/map', payload);
      const jobId = res.id || res.job_id;
      if (async_mode && jobId) {
        const result = await pollJob(jobId);
        return JSON.stringify(result, null, 2);
      }
      return JSON.stringify(res, null, 2);
    } catch (e) {
      return `Scoutify map failed for ${url}: ${e.message}`;
    }
  }
});

export const scoutifyCrawlTool = tool({
  name: 'scoutify_crawl',
  description: 'Map a website and extract content from accepted pages using Scoutify Crawl.',
  parameters: z.object({
    url: z.string().url().describe('The absolute starting URL of the site to crawl'),
    max_pages: z.number().optional().describe('Maximum pages to process'),
    async_mode: z.boolean().optional().default(false).describe('Whether to run as a background job and poll for completion'),
  }),
  execute: async ({ url, max_pages, async_mode }) => {
    console.log(`[Scoutify Tool] Crawling: ${url} (async_mode: ${async_mode})`);
    const payload = { url };
    if (max_pages !== undefined) payload.max_pages = max_pages;
    if (async_mode !== undefined) payload.async_mode = async_mode;
    try {
      const res = await scoutifyRequest('/v1/crawl', payload);
      const jobId = res.id || res.job_id;
      if (async_mode && jobId) {
        const result = await pollJob(jobId);
        return JSON.stringify(result, null, 2);
      }
      return JSON.stringify(res, null, 2);
    } catch (e) {
      return `Scoutify crawl failed for ${url}: ${e.message}`;
    }
  }
});
