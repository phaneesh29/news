import { Agent } from '@openai/agents';
import { z } from 'zod';
import { MANAGER_AGENT_INSTRUCTIONS } from '../config/instructions.js';
import { config } from '../config/config.js';
import '../utils/llm.js';
import { searchAgent } from './searchAgent.js';
import { enrichAgent } from './enrichAgent.js';
import { synthesisAgent } from './synthesisAgent.js';

export const NewsStorySchema = z.object({
  title: z.string().describe('The headline or title of the news story'),
  summary: z.string().describe('Concise 2-3 sentence summary focused on what changed and why developers should care'),
  category: z.enum([
    'Developer Tools & Platforms',
    'AI & Machine Learning',
    'Chips, Infrastructure & Acquisitions',
    'Security & Advisories'
  ]).describe('The category the story belongs to'),
  tags: z.array(z.string()).min(2).max(6).describe('Short topical tags such as ai-model, devtools, acquisition, chip, security, local-ai'),
  confidence: z.enum(['High', 'Medium', 'Low']).describe('Confidence rating based on source verification'),
  sources: z.array(z.string().url()).describe('List of unique verified source URLs'),
});

export const NewsArraySchema = z.array(NewsStorySchema).describe('Array of verified developer-focused news stories');

export const managerAgent = new Agent({
  name: 'NewsManagerAgent',
  instructions: MANAGER_AGENT_INSTRUCTIONS,
  model: config.llmModel, // Centralized model from config.js
  modelSettings: config.llmModelSettings,
  tools: [
    searchAgent.asTool({
      toolName: 'invoke_SearchAgent',
      toolDescription: 'Asks the SearchAgent to query Scoutify for general developer, AI, chip, acquisition, and security updates.'
    }),
    enrichAgent.asTool({
      toolName: 'invoke_EnrichAgent',
      toolDescription: 'Asks the EnrichAgent to retrieve GitHub releases, trending repositories, Hacker News, Reddit signals, Lobste.rs discussions, security advisories, Hugging Face papers, OpenRouter models, and specialized developer portals.'
    }),
    synthesisAgent.asTool({
      toolName: 'invoke_SynthesisAgent',
      toolDescription: 'Asks the SynthesisAgent to take all raw data, deduplicate, cross-reference, tag, internally score, and return ranked JSON.'
    })
  ],
  outputType: NewsArraySchema,
});
