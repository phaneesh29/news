import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const MEMORY_FILE = path.join(process.cwd(), 'memory.md');

export const getMemory = tool({
  description: 'Retrieve the contents of the memory file (memory.md) containing user preferences, key details, and past interaction memories.',
  inputSchema: z.object({}),
  execute: async () => {
    try {
      await fs.access(MEMORY_FILE).catch(async () => {
        await fs.writeFile(MEMORY_FILE, '# Memory\n\nNo memories recorded yet.\n');
      });
      const data = await fs.readFile(MEMORY_FILE, 'utf-8');
      return { content: data };
    } catch (error) {
      return { error: `Failed to read memory file: ${error.message}` };
    }
  },
});

export const saveMemory = tool({
  description: 'Save or update the contents of the memory file (memory.md). Provide the full updated content for the file.',
  inputSchema: z.object({
    content: z.string().describe('The full, markdown-formatted content to save to the memory file.'),
  }),
  execute: async ({ content }) => {
    try {
      await fs.writeFile(MEMORY_FILE, content, 'utf-8');
      return { success: true, message: 'Memory successfully saved.' };
    } catch (error) {
      return { error: `Failed to save memory: ${error.message}` };
    }
  },
});
