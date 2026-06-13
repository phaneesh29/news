import { Agent } from '@openai/agents';
import { z } from 'zod';
import { SYNTHESIS_AGENT_INSTRUCTIONS } from '../config/instructions.js';
import { config } from '../config/config.js';
import '../utils/llm.js';

export const SynthesisOutputSchema = z.object({
  stories: z.array(
    z.object({
      title: z.string().describe('The headline or title of the news story'),
      summary: z.string().describe('Concise 2-3 sentence summary focused on what changed and why developers should care'),
      score: z.number().describe('The calculated final score out of 10'),
      scoringBreakdown: z.object({
        impact: z.number().describe('Impact score (1-10)'),
        community: z.number().describe('Community/Signal score (1-10)'),
        freshness: z.number().describe('Freshness score (1-10)'),
        authority: z.number().describe('Source authority score (1-10)'),
      }).describe('The detailed breakdown of the score components'),
      category: z.enum([
        '🛠️ Developer Tools & Platforms',
        '🤖 AI & Machine Learning',
        '💰 Dev Ecosystem Funding & Acquisitions',
        '🛡️ Security & Advisories'
      ]).describe('The category the story belongs to'),
      confidence: z.enum(['High', 'Medium', 'Low']).describe('Confidence rating based on source verification'),
      sources: z.array(z.string().url()).describe('List of unique verified source URLs'),
    })
  ).describe('List of deduplicated, verified, and ranked news stories'),
});

export const synthesisAgent = new Agent({
  name: 'SynthesisAgent',
  instructions: SYNTHESIS_AGENT_INSTRUCTIONS,
  model: config.llmModel,
  modelSettings: config.llmModelSettings,
  outputType: SynthesisOutputSchema,
  tools: [],
  handoffDescription: 'Use this agent to deduplicate gathered news, evaluate sources, verify official document facts, and assign confidence levels.',
});

