import { Agent } from '@openai/agents';
import { SYNTHESIS_AGENT_INSTRUCTIONS } from '../config/instructions.js';
import { config } from '../config/config.js';
import '../utils/llm.js';

export const synthesisAgent = new Agent({
  name: 'SynthesisAgent',
  instructions: SYNTHESIS_AGENT_INSTRUCTIONS,
  model: config.llmModel,
  modelSettings: config.llmModelSettings,
  tools: [],
  handoffDescription: 'Use this agent to deduplicate gathered news, evaluate sources, verify official document facts, and assign confidence levels.',
});
