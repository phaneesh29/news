import OpenAI from 'openai';
import { setDefaultModelProvider, OpenAIProvider } from '@openai/agents';
import { config } from '../config/config.js';

process.env.OPENAI_TRACING_DISABLED = 'true';

const client = new OpenAI({
  apiKey: config.llmApiKey || 'ollama',
  baseURL: 'https://ollama.com/v1',
});


const provider = new OpenAIProvider({
  openAIClient: client,
});

setDefaultModelProvider(provider);

