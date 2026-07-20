import "dotenv/config";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  tavilyApiKey: process.env.TAVILY_API_KEY || '',
  scoutifyApiKey: process.env.SCOUTIFY_API_KEY || '',

  llmProvider: 'ollama',
  llmBaseUrl: 'https://ollama.com/v1',
  llmApiKey: process.env.OLLAMA_API_KEY || '',
  llmModel: 'gemma4:31b',
  llmModelSettings: {},

  freshnessHours: Number(process.env.FRESHNESS_HOURS || 24),
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL || '',
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN || '',
};
