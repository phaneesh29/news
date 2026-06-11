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
      verifiedSummary: z.string().describe('The final verified Markdown summary. Every fact in this summary MUST be fully supported by the provided sources. Unsupported claims MUST be removed.'),
      verificationReport: z.array(
        z.object({
          fact: z.string().describe('The specific fact or claim that was checked.'),
          isSupported: z.boolean().describe('Whether the claim is fully supported by the sources.'),
          sourceUrl: z.string().optional().describe('The URL of the source supporting this claim, if supported.'),
          explanation: z.string().describe('A brief explanation of how the claim is supported or why it was rejected/modified.'),
        })
      ).describe('A list of verification checks performed on key claims.'),
    }),
  }),
});
