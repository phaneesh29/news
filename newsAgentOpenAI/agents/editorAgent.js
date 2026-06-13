import { Agent } from '@openai/agents';
import { EDITOR_AGENT_INSTRUCTIONS } from '../config/instructions.js';
import { config } from '../config/config.js';
import '../utils/llm.js';
import { writeFileTool } from '../tools/agentTools.js';

export const editorAgent = new Agent({
  name: 'EditorAgent',
  instructions: EDITOR_AGENT_INSTRUCTIONS,
  model: config.llmModel, 
  modelSettings: config.llmModelSettings,
  tools: [writeFileTool],
  handoffDescription: 'Use this agent to take structured news, format them into premium markdown, and write the final news.md file.',
});
