import './disable-tracing.js';
import OpenAI from 'openai';
import { setDefaultModelProvider, OpenAIProvider, setTracingDisabled } from '@openai/agents';
import { config } from '../config/config.js';

setTracingDisabled(true);

const client = new OpenAI({
  apiKey: config.llmApiKey || 'ollama',
  baseURL: 'https://ollama.com/v1',
});


const provider = new OpenAIProvider({
  openAIClient: client,
});

setDefaultModelProvider(provider);

