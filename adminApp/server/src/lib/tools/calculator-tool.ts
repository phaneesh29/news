import { tool } from 'ai';
import { z } from 'zod';

export const calculatorTool = tool({
  description: 'Perform a basic mathematical calculation (addition, subtraction, multiplication, division).',
  inputSchema: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The math operation to perform'),
    a: z.number().describe('The first operand'),
    b: z.number().describe('The second operand'),
  }),
  execute: async ({ operation, a, b }) => {
    switch (operation) {
      case 'add':
        return { result: a + b };
      case 'subtract':
        return { result: a - b };
      case 'multiply':
        return { result: a * b };
      case 'divide':
        if (b === 0) {
          return { error: 'Division by zero is not allowed' };
        }
        return { result: a / b };
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  },
});
