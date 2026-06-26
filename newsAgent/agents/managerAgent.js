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
  modelSettings: config.llmModelSettings,
  tools: [
    searchAgent.asTool({
      toolName: 'invoke_SearchAgent',
      toolDescription: 'Asks the SearchAgent to query both Exa and Tavily for general developer, AI, chip, acquisition, and security updates.'
    }),
    enrichAgent.asTool({
      toolName: 'invoke_EnrichAgent',
      toolDescription: 'Asks the EnrichAgent to retrieve GitHub releases, trending repositories, Hacker News (stories >150 points), Reddit signals, package compromises/CVEs, and Hugging Face Daily Papers/arXiv preprints.'
    }),
    synthesisAgent.asTool({
      toolName: 'invoke_SynthesisAgent',
      toolDescription: 'Asks the SynthesisAgent to take all raw data, deduplicate, cross-reference, tag, internally score, and return ranked JSON.'
    }),
    editorAgent.asTool({
      toolName: 'invoke_EditorAgent',
      toolDescription: 'Asks the EditorAgent to take structured ranked JSON and format it into a premium score-free news.md bulletin.'
    })
  ],
});
