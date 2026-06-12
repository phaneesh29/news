import 'dotenv/config';
import { tool } from 'ai';
import { z } from 'zod';
import {
  devToolsSearchSubagent,
  aiMlSearchSubagent,
  devFundingSearchSubagent,
  devToolsTavilySearchSubagent,
  aiMlTavilySearchSubagent,
  devFundingTavilySearchSubagent,
} from '../subagents/searchSubagent.js';
import { deduplicateRankSubagent } from '../subagents/deduplicateRankSubagent.js';
import { verifySubagent } from '../subagents/verifySubagent.js';

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

function buildSearchPrompt(categoryFocus) {
  const now = new Date();
  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(now.getHours() - 12);

  return `Current time is ${formatDateTime(now)}.
Search for the latest developer-focused news from the last 12 hours ONLY (since ${formatDateTime(twelveHoursAgo)}).
Do NOT include anything published before ${formatDateTime(twelveHoursAgo)}.
Focus area: ${categoryFocus}`;
}

const sourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  content: z.string(),
  publishedDate: z.string().optional(),
  aiSummary: z.string().optional(),
});

export const searchNewsParallel = tool({
  description: 'Run 6 specialized news searches in parallel using Exa and Tavily: Dev Tools, AI/ML, and Dev Ecosystem Funding. Returns merged results from all categories.',
  inputSchema: z.object({
    additionalFocus: z.string().optional().describe('Optional additional topic to emphasize across all searches.'),
  }),
  execute: async ({ additionalFocus }, { abortSignal }) => {
    const focusSuffix = additionalFocus ? ` Also emphasize: ${additionalFocus}` : '';

    console.log('🔍 Starting parallel news search across 3 categories using both Exa and Tavily...');

    const [
      devToolsResult,
      aiMlResult,
      devFundingResult,
      devToolsTavilyResult,
      aiMlTavilyResult,
      devFundingTavilyResult,
    ] = await Promise.all([
      devToolsSearchSubagent.generate({
        prompt: buildSearchPrompt('Developer Tools, IDEs, Frameworks, Libraries, Open Source, DevOps' + focusSuffix),
        abortSignal,
      }).then(r => {
        console.log('  ✅ [Exa] Dev Tools search complete');
        return r;
      }),

      aiMlSearchSubagent.generate({
        prompt: buildSearchPrompt('AI Models, LLMs, AI Agents, ML Research, AI APIs and SDKs' + focusSuffix),
        abortSignal,
      }).then(r => {
        console.log('  ✅ [Exa] AI/ML search complete');
        return r;
      }),

      devFundingSearchSubagent.generate({
        prompt: buildSearchPrompt('AI startup funding rounds, developer tool acquisitions, AI infrastructure investments' + focusSuffix),
        abortSignal,
      }).then(r => {
        console.log('  ✅ [Exa] Dev Funding search complete');
        return r;
      }),

      devToolsTavilySearchSubagent.generate({
        prompt: buildSearchPrompt('Developer Tools, IDEs, Frameworks, Libraries, Open Source, DevOps' + focusSuffix),
        abortSignal,
      }).then(r => {
        console.log('  ✅ [Tavily] Dev Tools search complete');
        return r;
      }),

      aiMlTavilySearchSubagent.generate({
        prompt: buildSearchPrompt('AI Models, LLMs, AI Agents, ML Research, AI APIs and SDKs' + focusSuffix),
        abortSignal,
      }).then(r => {
        console.log('  ✅ [Tavily] AI/ML search complete');
        return r;
      }),

      devFundingTavilySearchSubagent.generate({
        prompt: buildSearchPrompt('AI startup funding rounds, developer tool acquisitions, AI infrastructure investments' + focusSuffix),
        abortSignal,
      }).then(r => {
        console.log('  ✅ [Tavily] Dev Funding search complete');
        return r;
      }),
    ]);

    const mergedSummary = `## 🛠️ Developer Tools & Platforms (Exa)
${devToolsResult.output?.draftSummary || 'No results found.'}

## 🛠️ Developer Tools & Platforms (Tavily)
${devToolsTavilyResult.output?.draftSummary || 'No results found.'}

## 🤖 AI & Machine Learning (Exa)
${aiMlResult.output?.draftSummary || 'No results found.'}

## 🤖 AI & Machine Learning (Tavily)
${aiMlTavilyResult.output?.draftSummary || 'No results found.'}

## 💰 Dev Ecosystem Funding & Acquisitions (Exa)
${devFundingResult.output?.draftSummary || 'No results found.'}

## 💰 Dev Ecosystem Funding & Acquisitions (Tavily)
${devFundingTavilyResult.output?.draftSummary || 'No results found.'}`;

    const mergedSources = [
      ...(devToolsResult.output?.sources || []),
      ...(devToolsTavilyResult.output?.sources || []),
      ...(aiMlResult.output?.sources || []),
      ...(aiMlTavilyResult.output?.sources || []),
      ...(devFundingResult.output?.sources || []),
      ...(devFundingTavilyResult.output?.sources || []),
    ];

    console.log(`📊 Total sources gathered: ${mergedSources.length}`);

    return {
      mergedSummary,
      mergedSources,
      categoryCounts: {
        devToolsExa: devToolsResult.output?.sources?.length || 0,
        devToolsTavily: devToolsTavilyResult.output?.sources?.length || 0,
        aiMlExa: aiMlResult.output?.sources?.length || 0,
        aiMlTavily: aiMlTavilyResult.output?.sources?.length || 0,
        devFundingExa: devFundingResult.output?.sources?.length || 0,
        devFundingTavily: devFundingTavilyResult.output?.sources?.length || 0,
      },
    };
  },
});

export const deduplicateAndRank = tool({
  description: 'Deduplicate merged news items, score them by impact, tag as Trending/Breaking/Notable, detect trends, and generate a TL;DR.',
  inputSchema: z.object({
    mergedSummary: z.string().describe('The merged Markdown summary from all category searches.'),
    mergedSources: z.array(sourceSchema).describe('The merged list of all sources.'),
  }),
  execute: async ({ mergedSummary, mergedSources }, { abortSignal }) => {
    console.log('🔄 Deduplicating and ranking news items...');

    const now = new Date();
    const prompt = `Current time: ${formatDateTime(now)}

Here is the merged news from 3 category searches. Please deduplicate, rank, tag, score, detect trends, and write a TL;DR.
Every final headline must be followed by a concise "Summary:" paragraph using the source content, Exa AI summaries, and Tavily extracted/raw content. Make the summary developer-focused so the reader does not need to open the source article.

--- MERGED NEWS ---
${mergedSummary}

--- ALL SOURCES ---
${JSON.stringify(mergedSources, null, 2)}`;

    const result = await deduplicateRankSubagent.generate({
      prompt,
      abortSignal,
    });

    console.log(`  ✅ Dedup complete: ${result.output?.totalItems} unique items (${result.output?.duplicatesRemoved} duplicates merged)`);

    return result.output;
  },
});

export const verifyNews = tool({
  description: 'Verify a ranked news summary against sources. The verifier can independently web-search to cross-reference claims.',
  inputSchema: z.object({
    rankedSummary: z.string().describe('The Markdown-formatted ranked news summary to verify.'),
    tldr: z.string().describe('The TL;DR executive summary.'),
    trends: z.array(z.string()).describe('Detected trends to preserve.'),
    sources: z.array(sourceSchema).describe('The list of sources containing the raw facts.'),
  }),
  execute: async ({ rankedSummary, tldr, trends, sources }, { abortSignal }) => {
    console.log('🔎 Verifying news items with cross-referencing...');

    const prompt = `Please verify the following news summary against the provided sources. Use your web search tool to independently cross-reference any claims you are uncertain about.
Ensure each verified item still has a short "Summary:" paragraph after the headline. The summary should be grounded in Exa/Tavily content and should explain why the story matters to developers.

TL;DR:
${tldr}

Trends Detected:
${trends.map(t => `- ${t}`).join('\n')}

Ranked Summary:
${rankedSummary}

Sources:
${JSON.stringify(sources, null, 2)}`;

    const result = await verifySubagent.generate({
      prompt,
      abortSignal,
    });

    console.log(`  ✅ Verification complete: ${result.output?.stats?.totalItemsVerified} items verified, ${result.output?.stats?.crossReferencedCount} cross-referenced`);

    return result.output;
  },
});
