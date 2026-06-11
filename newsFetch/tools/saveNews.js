import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const NEWS_FILE = path.join(process.cwd(), 'news.md');

export const saveNews = tool({
  description: 'Save the compiled AI developer news to the news.md file.',
  inputSchema: z.object({
    content: z.string().describe('The full, markdown-formatted content of the latest AI news to save to news.md.'),
  }),
  execute: async ({ content }) => {
    try {
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', { timeZoneName: 'short' });
      const cleanContent = content.replace(/^Last flow execution:.*$/gim, '').trim();
      const contentWithTimestamp = `Last flow execution: ${timestamp}\n\n${cleanContent}`;
      
      await fs.writeFile(NEWS_FILE, contentWithTimestamp, 'utf-8');
      return { 
        success: true, 
        message: `News successfully saved to news.md.`,
        lastFlowExecution: timestamp
      };
    } catch (error) {
      return { error: `Failed to save news to news.md: ${error.message}` };
    }
  },
});
