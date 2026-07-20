import './utils/disable-tracing.js';
import { run } from '@openai/agents';
import './utils/llm.js';
import { managerAgent } from './agents/managerAgent.js';
import { config } from './config/config.js';
import { storeNewsInRedis } from './utils/redis.js';
import { sendEmail } from './utils/emailHelper.js';

const query = 'latest developer-focused AI releases, chips, acquisitions, devtools, infrastructure, and security advisories';
const maxAttempts = 3;

function buildPrompt(attempt, previousFeedback = '') {
  const now = new Date();
  const nowUtc = now.toUTCString();
  const nowIso = now.toISOString();
  const currentYear = now.getUTCFullYear();
  const currentDate = nowIso.slice(0, 10);
  const freshAfterUtc = new Date(Date.now() - config.freshnessHours * 60 * 60 * 1000).toUTCString();

  return `Current UTC time: ${nowUtc}
Current ISO timestamp: ${nowIso}
Current YYYY-MM-DD date: ${currentDate}
Current year: ${currentYear}
Freshness cutoff: ${freshAfterUtc}
Freshness window: last ${config.freshnessHours} hours.
Attempt: ${attempt}/${maxAttempts}

Run the full multi-agent developer and AI news briefing pipeline.

Focus hard on:
- AI and LLM releases from OpenAI, Anthropic, Google DeepMind, Mistral, Meta/Llama, Qwen, DeepSeek, NVIDIA AI, Hugging Face, Ollama, vLLM, LM Studio, and OpenRouter.
- Agentic AI and coding-agent updates: OpenAI Agents SDK, LangChain/LangGraph, LlamaIndex, tool calling, evals, IDE agents, workflow orchestration.
- Developer tools and web platforms: TypeScript, Node.js, Bun, Deno, Vite, React, Next.js, npm, VS Code, Cursor, Windsurf, Vercel, Cloudflare, Supabase, Turso, PostgreSQL.
- Chips and infrastructure: NVIDIA, AMD, Intel, hyperscaler AI chips, inference hardware, model-serving platforms.
- Developer-relevant acquisitions and partnerships.
- Security, but keep it lean: critical CVEs, active exploitation, package malware, GitHub/NVD/CISA advisories, supply-chain attacks.

Quality bar:
- Use Scoutify search.
- Use extraction for primary/important links; extraction should attempt Scoutify.
- Cross-reference important news with multiple sources whenever possible.
- Every story must have a title, clear summary, tags, confidence, and real source URLs.
- Reject stale stories outside the freshness window unless a primary source proves the update is fresh.
- Do not use any markdown formatting inside string fields like title or summary. Keep them clean.
- Match the schema fields exactly: use "sources" (not "source_urls"), "category", "title", "summary", "tags", and "confidence" ('High', 'Medium', or 'Low').
- CRITICAL: Return the final output as raw JSON only. Do not wrap the response in markdown blocks like \`\`\`json or \`\`\`. Start your output directly with [ and end with ].

${previousFeedback ? `Previous quality feedback to fix:\n${previousFeedback}` : ''}`;
}

function evaluateNewsData(newsArray) {
  const failures = [];
  if (!Array.isArray(newsArray)) {
    failures.push('Output is not a valid array of news objects.');
    return { ok: false, failures };
  }

  if (newsArray.length < 5) {
    failures.push(`Only ${newsArray.length} stories found; publish at least 5 high-quality stories if fresh sources exist.`);
  }

  newsArray.forEach((story, index) => {
    if (!story.title || story.title.trim().length === 0) {
      failures.push(`Story at index ${index} is missing a title.`);
    }
    if (!story.summary || story.summary.trim().length === 0) {
      failures.push(`Story at index ${index} is missing a summary.`);
    }
    if (!story.category) {
      failures.push(`Story at index ${index} is missing a category.`);
    }
    if (!story.tags || story.tags.length < 2) {
      failures.push(`Story at index ${index} must have at least 2 tags.`);
    }
    if (!story.sources || story.sources.length === 0) {
      failures.push(`Story at index ${index} must have at least 1 verified source URL.`);
    }

   if (story.title && (story.title.includes('#') || story.title.includes('*') || story.title.includes('`') || story.title.includes('[') || story.title.includes(']'))) {
      failures.push(`Story at index ${index} title contains markdown formatting.`);
    }
    if (story.summary && (story.summary.includes('**') || story.summary.includes('`') || story.summary.includes('[') || story.summary.includes(']'))) {
      failures.push(`Story at index ${index} summary contains markdown formatting.`);
    }

    if (story.sources) {
      story.sources.forEach(src => {
        if (/example\.com|placeholder|#/i.test(src)) {
          failures.push(`Story at index ${index} contains placeholder source URL: ${src}`);
        }
      });
    }
  });

  return {
    ok: failures.length === 0,
    failures,
    storyCount: newsArray.length,
  };
}

async function main() {
  console.log('\n================================================================');
  console.log('STARTING MULTI-AGENT DEVELOPER + AI NEWS PIPELINE');
  console.log(`Query target: "${query}"`);
  console.log(`Freshness window: last ${config.freshnessHours} hours`);
  console.log('================================================================\n');

  let previousFeedback = '';

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      console.log(`Launching NewsManagerAgent (attempt ${attempt}/${maxAttempts})...`);
      const result = await run(managerAgent, buildPrompt(attempt, previousFeedback), { maxTurns: 40 });

      console.log('Manager output:');
      console.log(result.finalOutput);

      const evaluation = evaluateNewsData(result.finalOutput);
      if (evaluation.ok) {
        await storeNewsInRedis(result.finalOutput);
        const emailResult = await sendEmail(result.finalOutput);
        if (!emailResult.success) {
          throw new Error(`Digest saved to Redis, but email failed: ${emailResult.error}`);
        }

        console.log('\n================================================================');
        console.log('PIPELINE RUN COMPLETED');
        console.log(`Stories stored and email dispatched: ${evaluation.storyCount}`);
        console.log('================================================================\n');
        return;
      }

      previousFeedback = evaluation.failures.map((failure) => `- ${failure}`).join('\n');
      console.warn(`Quality gate failed on attempt ${attempt}:\n${previousFeedback}`);
    }

    throw new Error(`Quality gate failed after ${maxAttempts} attempts.\n${previousFeedback}`);
  } catch (error) {
    console.error('Pipeline failed with error:', error);
    process.exit(1);
  }
}

main();
