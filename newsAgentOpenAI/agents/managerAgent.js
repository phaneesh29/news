import { Agent } from '@openai/agents';
import { MANAGER_AGENT_INSTRUCTIONS } from '../config/instructions.js';
import { config } from '../config/config.js';
import '../utils/llm.js';
import { searchAgent } from './searchAgent.js';
import { enrichAgent } from './enrichAgent.js';
import { synthesisAgent } from './synthesisAgent.js';
import { editorAgent } from './editorAgent.js';

export const managerAgent = new Agent({
  name: 'NewsManagerAgent',
  instructions: MANAGER_AGENT_INSTRUCTIONS,
  model: config.llmModel, // Centralized model from config.js
  tools: [
    searchAgent.asTool({
      toolName: 'invoke_SearchAgent',
      toolDescription: 'Asks the SearchAgent to query Exa/Tavily for general developer and AI company blog updates.'
    }),
    enrichAgent.asTool({
      toolName: 'invoke_EnrichAgent',
      toolDescription: 'Asks the EnrichAgent to retrieve GitHub releases, trending repositories, Hacker News (stories >150 points), Reddit signals, and package compromises/CVEs.'
    }),
    synthesisAgent.asTool({
      toolName: 'invoke_SynthesisAgent',
      toolDescription: 'Asks the SynthesisAgent to take all raw data, deduplicate, score impact, community, freshness, and source authority, and return ranked JSON.'
    }),
    editorAgent.asTool({
      toolName: 'invoke_EditorAgent',
      toolDescription: 'Asks the EditorAgent to take structured ranked JSON and format it into a premium nws.md bulletin.'
    })
  ],
});
