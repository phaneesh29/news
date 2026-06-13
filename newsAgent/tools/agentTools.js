import { tool } from '@openai/agents';
import { z } from 'zod';
import Exa from 'exa-js';
import { tavily } from '@tavily/core';
import { exaSearch } from './exaSearch.js';
import { tavilySearch } from './tavilySearch.js';
import { writeNewsFile } from './fileWriter.js';
import { config } from '../config/config.js';
import { sendEmail } from '../utils/emailHelper.js';

export const searchWebTool = tool({
  name: 'search_web',
  description: 'Search the web for general tech and AI news updates. Returns AI-generated summaries and raw results.',
  parameters: z.object({
    query: z.string().describe('The search query for retrieving news (e.g. "React 19 release updates")'),
  }),
  execute: async ({ query }) => {
    let results = await exaSearch(query);
    if (!results || results.length === 0) {
      console.log('[Agent Tool] Exa search failed or returned no results. Falling back to Tavily...');
      results = await tavilySearch(query);
    }
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
    let results = await exaSearch(query);
    if (!results || results.length === 0) {
      console.log('[Agent Tool] Exa news search failed. Falling back to Tavily...');
      results = await tavilySearch(query);
    }
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
    console.log(`[GitHub Releases Tool] Searching for releases of ${repo} (last 12h)...`);
    
    let searchResults = [];
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    
    if (config.exaApiKey) {
      try {
        const exa = new Exa(config.exaApiKey);
        const searchRes = await exa.searchAndContents(query, {
          type: 'keyword',
          numResults: 2,
          startPublishedDate: twelveHoursAgo.toISOString(), // 12h freshness filter
          contents: { summary: true, text: true }
        });
        searchResults = searchRes.results || [];
      } catch (e) {
        console.warn('[GitHub Releases Tool] Exa search failed:', e.message);
      }
    }

    if (searchResults.length === 0 && config.tavilyApiKey && config.tavilyApiKey !== 'your_api_key_here') {
      try {
        const tvly = tavily({ apiKey: config.tavilyApiKey });
        const searchRes = await tvly.search(query, { maxResults: 2 });
        
        // Programmatic 12h filter for Tavily results
        const twelveHoursAgoMs = twelveHoursAgo.getTime();
        searchResults = (searchRes.results || []).filter((result) => {
          const dateStr = result.publishedDate || result.published_date;
          if (!dateStr) return true;
          return new Date(dateStr).getTime() >= twelveHoursAgoMs;
        });
      } catch (e) {
        console.warn('[GitHub Releases Tool] Tavily search failed:', e.message);
      }
    }

    if (searchResults.length === 0) {
      return `No release announcements found in the last 12 hours for ${repo} on GitHub.`;
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
  description: 'Scrapes and extracts clean, LLM-ready text content and AI summaries from a specific URL.',
  parameters: z.object({
    url: z.string().url().describe('The exact webpage URL to scrape (e.g., official doc or announcement page)'),
  }),
  execute: async ({ url }) => {
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
          return JSON.stringify({
            title: result.title || 'Extracted Page',
            url: result.url,
            summary: result.summary || 'No summary available.',
            content: result.text ? result.text.substring(0, 6000) : 'No content retrieved.'
          }, null, 2);
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
          return JSON.stringify({
            title: 'Extracted Page',
            url: result.url,
            summary: 'Summary not supported in Tavily extract natively.',
            content: result.rawContent || result.content ? (result.rawContent || result.content).substring(0, 6000) : 'No content retrieved.'
          }, null, 2);
        }
      } catch (e) {
        console.error(`[Content Extractor] Tavily Extract failed for ${url}:`, e.message);
      }
    }

    return `Error: Failed to extract content from ${url} using Exa and Tavily SDKs.`;
  },
});

export const fetchGitHubTrendingTool = tool({
  name: 'fetch_github_trending',
  description: 'Fetches the top trending repositories created in the past 24 hours using GitHub Search API.',
  parameters: z.object({
    limit: z.number().optional().default(10).describe('Max number of repositories to return'),
  }),
  execute: async ({ limit }) => {
    try {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString().split('.')[0] + 'Z';
      const url = `https://api.github.com/search/repositories?q=created:>${twelveHoursAgo}&sort=stars&order=desc&per_page=${limit}`;
      
      console.log(`[GitHub Trending] Fetching repositories created since: ${twelveHoursAgo}...`);
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
  description: 'Fetches stories that have hit >150 points on Hacker News in the past 12 hours.',
  parameters: z.object({
    minPoints: z.number().optional().default(150).describe('Minimum HN points threshold'),
  }),
  execute: async ({ minPoints }) => {
    try {
      const past12h = Math.floor((Date.now() - 12 * 60 * 60 * 1000) / 1000);
      const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i>${past12h},points>=${minPoints}&hitsPerPage=20`;
      
      console.log(`[Hacker News] Fetching stories with >=${minPoints} points from past 12h...`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Algolia HN API returned status ${response.status}`);
      }

      const data = await response.json();
      if (!data.hits) return 'No high-scoring Hacker News stories found in the past 12 hours.';

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
  description: 'Searches developer subreddits (r/LocalLLaMA, r/MachineLearning, r/programming, r/webdev, r/selfhosted) for hot discussions in the last 12 hours.',
  parameters: z.object({
    subreddit: z.enum(['LocalLLaMA', 'MachineLearning', 'artificial', 'programming', 'webdev', 'selfhosted']).describe('The subreddit to monitor'),
    query: z.string().optional().default('launch OR release OR new model').describe('Target query within subreddit'),
  }),
  execute: async ({ subreddit, query }) => {
    const searchQuery = `site:reddit.com/r/${subreddit} ${query}`;
    console.log(`[Reddit Signals] Searching r/${subreddit} (12h limit) for: "${query}"...`);
    
    let results = await exaSearch(searchQuery);
    if (!results || results.length === 0) {
      results = await tavilySearch(searchQuery);
    }
    return JSON.stringify(results, null, 2);
  },
});

export const searchSecurityAdvisoriesTool = tool({
  name: 'search_security_advisories',
  description: 'Searches GitHub Advisories, NVD, and CVE databases for package compromises or critical vulnerabilities in the last 12 hours.',
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
    
    console.log(`[Security Advisories] Searching for security alerts (12h limit) in ecosystem: ${ecosystem}...`);
    let results = await exaSearch(query);
    if (!results || results.length === 0) {
      results = await tavilySearch(query);
    }
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
      
      if (!response.ok) {
        throw new Error(`Hugging Face API returned status ${response.status}`);
      }

      let data = await response.json();
      
      // If date was specified but no papers were found, fallback to the latest papers
      if (date && (!data || data.length === 0)) {
        console.log(`[Academic Papers] No papers found for date ${date}. Falling back to the latest curated papers...`);
        const fallbackResponse = await fetch('https://huggingface.co/api/daily_papers');
        if (fallbackResponse.ok) {
          data = await fallbackResponse.json();
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

export const writeFileTool = tool({
  name: 'write_news_bulletin',
  description: 'Saves the final formatted markdown news bulletin to news.md.',
  parameters: z.object({
    content: z.string().describe('The complete markdown news bulletin content to write to the file'),
  }),
  execute: async ({ content }) => {
    const success = await writeNewsFile(config.outputFile, content);
    if (success) {
      console.log('[Agent Tool] News bulletin written successfully. Sending email digest...');
      const emailResult = await sendEmail(content);
      if (emailResult.success) {
        return `Successfully saved news bulletin to ${config.outputFile} and sent email digest successfully to whitelisted recipients.`;
      } else {
        return `Successfully saved news bulletin to ${config.outputFile}, but email sending failed: ${emailResult.error}`;
      }
    }
    return `Error: Failed to write news bulletin to ${config.outputFile}`;
  },
});
