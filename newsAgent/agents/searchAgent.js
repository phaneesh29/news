import { Agent } from '@openai/agents';
import { SEARCH_AGENT_INSTRUCTIONS } from '../config/instructions.js';
import { config } from '../config/config.js';
import '../utils/llm.js';
import {
  searchWebTool,
  searchNewsTool,
  searchGitHubReleasesTool,
  extractPageContentTool,
  scoutifySearchTool,
  scoutifyExtractTool,
  scoutifyMapTool,
  scoutifyCrawlTool
} from '../tools/agentTools.js';

export const searchAgent = new Agent({
  name: 'SearchAgent',
  instructions: SEARCH_AGENT_INSTRUCTIONS,
  model: config.llmModel, 
  modelSettings: config.llmModelSettings,
  tools: [
    searchWebTool,
    searchNewsTool,
    searchGitHubReleasesTool,
    extractPageContentTool,
    scoutifySearchTool,
    scoutifyExtractTool,
    scoutifyMapTool,
    scoutifyCrawlTool
  ],
  handoffDescription: 'Use this agent to search the web, news feeds, GitHub releases, and extract or map page contents using Scoutify and Tavily SDKs.',
});
