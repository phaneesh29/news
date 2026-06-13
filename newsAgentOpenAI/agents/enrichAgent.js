import { Agent } from '@openai/agents';
import { ENRICH_AGENT_INSTRUCTIONS } from '../config/instructions.js';
import { config } from '../config/config.js';
import '../utils/llm.js';
import {
  fetchHackerNewsTool,
  fetchGitHubTrendingTool,
  searchGitHubReleasesTool,
  searchRedditSignalsTool,
  searchSecurityAdvisoriesTool,
  extractPageContentTool
} from '../tools/agentTools.js';

export const enrichAgent = new Agent({
  name: 'EnrichAgent',
  instructions: ENRICH_AGENT_INSTRUCTIONS,
  model: config.llmModel,
  tools: [
    fetchHackerNewsTool,
    fetchGitHubTrendingTool,
    searchGitHubReleasesTool,
    searchRedditSignalsTool,
    searchSecurityAdvisoriesTool,
    extractPageContentTool
  ],
  handoffDescription: 'Use this agent to fetch GitHub releases, trending repositories, Hacker News discussions, Reddit signals, and security advisories.',
});
