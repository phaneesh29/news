import 'dotenv/config';
import { ToolLoopAgent, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { verifySubagentInstruction } from '../instruction.js';
import { z } from 'zod';

export const verifySubagent = new ToolLoopAgent({
  model: google(process.env.VERCEL_AI_MODEL),
  instructions: verifySubagentInstruction,
  tools: {},
  output: Output.object({
    schema: z.object({
      verifiedSummary: z.string().describe('The final verified Markdown summary. Prepend "**[Confidence: High/Medium/Low]**" to each news item. Do not delete low-confidence items; keep them with their appropriate tag.'),
      verificationReport: z.array(
        z.object({
          fact: z.string().describe('The specific fact or claim that was checked.'),
          confidenceLevel: z.enum(['High', 'Medium', 'Low']).describe('Confidence rating for the claim based on source grounding.'),
          sourceUrl: z.string().optional().describe('The URL of the source supporting this claim, if supported.'),
          explanation: z.string().describe('Explanation of why this confidence level was assigned.'),
        })
      ).describe('A list of verification checks performed on key claims.'),
    }),
  }),
});
