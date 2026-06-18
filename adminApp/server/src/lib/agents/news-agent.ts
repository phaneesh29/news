import { ToolLoopAgent } from 'ai';
import { google } from '@ai-sdk/google';
import { calculatorTool } from '../tools/calculator-tool.js';

export const newsAgent = new ToolLoopAgent({
  id: 'news-assistant',
  model: google('gemini-2.5-flash'),
  instructions: 'You are a helpful assistant. You can perform calculations when asked by utilizing your calculator tool.',
  tools: {
    calculator: calculatorTool,
  },
});
