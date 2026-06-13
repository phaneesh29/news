import "dotenv/config";
import path from 'path';

export const config = {
  tavilyApiKey: process.env.TAVILY_API_KEY || '',
  exaApiKey: process.env.EXA_API_KEY || '',

  llmProvider: 'ollama',
  llmBaseUrl: 'https://ollama.com/v1',
  llmApiKey: process.env.OLLAMA_API_KEY || '',
  llmModel: 'gemma4:31b',
  llmModelSettings: {
    reasoning: { effort: 'none' }
  },

  outputFile: path.resolve('news.md'),
};
