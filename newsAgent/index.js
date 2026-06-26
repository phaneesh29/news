import './utils/disable-tracing.js';
import fs from 'fs/promises';
import { run } from '@openai/agents';
import './utils/llm.js';
import { managerAgent } from './agents/managerAgent.js';
import { config } from './config/config.js';
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
- Use Tavily search and Exa search together, not as fallbacks.
- Use extraction for primary/important links; extraction should attempt both Exa and Tavily.
- Cross-reference important news with multiple sources whenever possible.
- Every story must have a title, clear summary, tags, confidence, and real source URLs.
- Reject stale stories outside the freshness window unless a primary source proves the update is fresh.
- The markdown header, Last updated, and Pipeline Stats Generated At must use ${nowUtc} or ${nowIso}, never any other year.
- If calling fetch_academic_papers with a date, use ${currentDate}; otherwise omit the date. Never use a 2025 date.
- Do not include scoring, score tables, score breakdowns, or ranking formulas in news.md or email.
- Write the final markdown through the write_news_bulletin tool. It will save a draft that is promoted to ${config.outputFile} only after validation.

${previousFeedback ? `Previous quality feedback to fix:\n${previousFeedback}` : ''}`;
}

async function evaluateNewsFile(filePath = config.draftOutputFile) {
  const content = await fs.readFile(filePath, 'utf-8');
  const failures = [];
  const storyCount = (content.match(/^### (?!Developer-Focused)/gm) || []).length;
  const sourceCount = (content.match(/^- \[[^\]]+\]\(https?:\/\//gm) || []).length;
  const tagCount = (content.match(/^Tags:\s*`/gm) || []).length;
  const genericRootLinkCount = (content.match(/\]\(https:\/\/(?:openai\.com|nvidia\.com|vercel\.com|developer\.apple\.com|cloud\.google\.com|github\.com|npmjs\.com|arxiv\.org)\/?\)/gi) || []).length;

  if (storyCount < 5) failures.push(`Only ${storyCount} stories found; publish at least 5 high-quality stories if fresh sources exist.`);
  if (sourceCount < storyCount * 2) failures.push('Each story needs at least two real source links for cross-reference.');
  if (tagCount < storyCount) failures.push('Some stories are missing tag lines.');
  if (/\bscore\b|scoring breakdown|impact:\s*\d|authority:\s*\d/i.test(content)) failures.push('Visible scoring language found; remove all scores and scoring breakdowns.');
  if (/\]\(#\)|placeholder|example\.com/i.test(content)) failures.push('Placeholder links found; use only real source URLs.');
  if (genericRootLinkCount > 0) failures.push('Generic root-domain source links found; use specific article, release, advisory, or repo URLs.');
  if (!/Freshness window:/i.test(content)) failures.push('Freshness window is missing from the digest header.');
  if (!content.includes(String(new Date().getUTCFullYear()))) failures.push(`Digest timestamps do not include the current UTC year ${new Date().getUTCFullYear()}.`);

  return {
    ok: failures.length === 0,
    failures,
    storyCount,
    sourceCount,
    tagCount,
  };
}

async function promoteDraft() {
  const content = await fs.readFile(config.draftOutputFile, 'utf-8');
  await fs.copyFile(config.draftOutputFile, config.outputFile);
  return content;
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

      const evaluation = await evaluateNewsFile();
      if (evaluation.ok) {
        const content = await promoteDraft();
        const emailResult = await sendEmail(content);
        if (!emailResult.success) {
          throw new Error(`Digest passed quality gate and was promoted, but email failed: ${emailResult.error}`);
        }

        console.log('\n================================================================');
        console.log('PIPELINE RUN COMPLETED');
        console.log(`Output file: ${config.outputFile}`);
        console.log(`Email ID: ${emailResult.emailId}`);
        console.log(`Stories: ${evaluation.storyCount}, sources: ${evaluation.sourceCount}, tag lines: ${evaluation.tagCount}`);
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
