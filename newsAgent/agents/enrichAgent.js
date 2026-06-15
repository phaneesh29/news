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
  extractPageContentTool,
  fetchAcademicPapersTool,
  fetchOpenRouterModelsTool
} from '../tools/agentTools.js';

export const enrichAgent = new Agent({
  name: 'EnrichAgent',
  instructions: ENRICH_AGENT_INSTRUCTIONS,
  model: config.llmModel,
  modelSettings: config.llmModelSettings,
  tools: [
    fetchHackerNewsTool,
    fetchGitHubTrendingTool,
    searchGitHubReleasesTool,
    searchRedditSignalsTool,
    searchSecurityAdvisoriesTool,
    extractPageContentTool,
    fetchAcademicPapersTool,
    fetchOpenRouterModelsTool
  ],
  handoffDescription: 'Use this agent to fetch GitHub releases, trending repositories, Hacker News discussions, Reddit signals, security advisories, Hugging Face daily papers/arXiv preprints, and newly added AI models from OpenRouter.',
});
