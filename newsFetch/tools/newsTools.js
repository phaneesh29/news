import 'dotenv/config';
import { tool } from 'ai';
import { z } from 'zod';
import { unifiedSearchSubagent } from '../subagents/searchSubagent.js';
import { deduplicateRankSubagent } from '../subagents/deduplicateRankSubagent.js';

function formatDateTime(date) {
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
}


const sourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  content: z.string(),
  publishedDate: z.string().optional(),
  aiSummary: z.string().optional(),
  category: z.enum(['devTools', 'aiMl', 'devFunding']).optional(),
});

export const searchNewsParallel = tool({
  description: 'Run a unified news search covering all 3 categories (Dev Tools, AI/ML, Dev Ecosystem Funding) in a single pass. Uses both Exa and Tavily internally. Returns categorized results.',
  inputSchema: z.object({
    additionalFocus: z.string().optional().describe('Optional additional topic to emphasize across all searches.'),
  }),
  execute: async ({ additionalFocus }, { abortSignal }) => {
    const now = new Date();
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(now.getHours() - 12);

    const focusSuffix = additionalFocus ? `\nAlso emphasize: ${additionalFocus}` : '';

    console.log('🔍 Starting unified news search across all 3 categories (single LLM pass, Exa + Tavily)...');

    const prompt = `Current time is ${formatDateTime(now)}.
Search for the latest developer-focused news from the last 12 hours ONLY (since ${formatDateTime(twelveHoursAgo)}).
Do NOT include anything published before ${formatDateTime(twelveHoursAgo)}.

Cover ALL 3 categories in this single search pass:
1. Developer Tools & Platforms — IDEs, Frameworks, Libraries, Open Source, DevOps
2. AI & Machine Learning — AI Models, LLMs, AI Agents, ML Research, AI APIs and SDKs
3. Dev Ecosystem Funding — AI startup funding rounds, developer tool acquisitions, AI infrastructure investments
${focusSuffix}`;

    const result = await unifiedSearchSubagent.generate({ prompt, abortSignal });

    console.log('  ✅ Unified search complete');

    const sources = result.output?.sources || [];
    const categoryCounts = {
      devTools: sources.filter(s => s.category === 'devTools').length,
      aiMl: sources.filter(s => s.category === 'aiMl').length,
      devFunding: sources.filter(s => s.category === 'devFunding').length,
    };

    console.log(`📊 Total sources gathered: ${sources.length} (DevTools: ${categoryCounts.devTools}, AI/ML: ${categoryCounts.aiMl}, Funding: ${categoryCounts.devFunding})`);

    return {
      mergedSummary: result.output?.draftSummary || 'No results found.',
      mergedSources: sources,
      categoryCounts,
    };
  },
});

export const deduplicateAndRank = tool({
  description: 'Deduplicate merged news items, score them by impact, tag as Trending/Breaking/Notable, verify claims with cross-referencing, assign confidence levels, detect trends, and generate a TL;DR.',
  inputSchema: z.object({
    mergedSummary: z.string().describe('The merged Markdown summary from all category searches.'),
    mergedSources: z.array(sourceSchema).describe('The merged list of all sources.'),
  }),
  execute: async ({ mergedSummary, mergedSources }, { abortSignal }) => {
    console.log('🔄 Deduplicating, ranking, and verifying news items...');

    const now = new Date();
    const prompt = `Current time: ${formatDateTime(now)}

Here is the merged news from the unified category search. Please deduplicate, rank, verify, tag, score, detect trends, assign confidence levels, and write a TL;DR.
Every final headline must be followed by a concise "Summary:" paragraph using the source content, Exa AI summaries, and Tavily extracted/raw content. Make the summary developer-focused so the reader does not need to open the source article.

--- MERGED NEWS ---
${mergedSummary}

--- ALL SOURCES ---
${JSON.stringify(mergedSources, null, 2)}`;

    const result = await deduplicateRankSubagent.generate({ prompt, abortSignal });

    console.log(`  ✅ Dedup + verify complete: ${result.output?.totalItems} unique items (${result.output?.duplicatesRemoved} duplicates merged)`);
    if (result.output?.verificationStats) {
      const stats = result.output.verificationStats;
      console.log(`  📊 Confidence: ${stats.highConfidenceCount} High, ${stats.mediumConfidenceCount} Medium, ${stats.lowConfidenceCount} Low | ${stats.crossReferencedCount} cross-referenced`);
    }

    return result.output;
  },
});
