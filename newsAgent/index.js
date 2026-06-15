import './utils/disable-tracing.js';
import { run } from '@openai/agents';
import './utils/llm.js';
import { managerAgent } from './agents/managerAgent.js';
import { config } from './config/config.js';

const query = 'latest software development, AI model releases, agentic frameworks, developer tools, and security advisories';

async function main() {
  console.log('\n================================================================');
  console.log('🤖 STARTING MULTI-AGENT SUBAGENT (PARENT-CHILD) TECH NEWS PIPELINE 🤖');
  console.log(`Query Target: "${query}"`);
  console.log('================================================================\n');

  try {
    console.log('🔄 Launching NewsManagerAgent...');
    console.log('   (Orchestrator will invoke subagents as tools to complete the pipeline)\n');

    const nowUtc = new Date().toUTCString();
    const twelveHoursAgoUtc = new Date(Date.now() - 12 * 60 * 60 * 1000).toUTCString();
    const prompt = `Today's date is strictly ${nowUtc}.
Run the full developer and AI news briefing pipeline focusing on these targets:
- **AI & LLMs**: Model releases/updates from OpenAI, Anthropic, Google DeepMind, Mistral, Meta (Llama), Qwen (Alibaba), DeepSeek, NVIDIA AI, Ollama, vLLM, and Hugging Face.
- **Agentic AI**: OpenAI Agents SDK, LangChain, LangGraph, LlamaIndex, AI workflow orchestration, tool-calling improvements, and evaluation harnesses/benchmarks.
- **Developer Tools**: Releases, updates, and developer acquisitions for TypeScript, Node.js, Bun, Deno, Vite, npm ecosystem, VS Code, Cursor, Windsurf.
- **Web Development**: Next.js, React, Vercel, Cloudflare, Supabase, Turso, PostgreSQL.
- **Open Source & GitHub**: Major GitHub releases, trending repositories, fast-growing AI projects, developer tooling launches.
- **Local AI & Self-Hosting**: Ollama, Open WebUI, vLLM, LM Studio, local model releases, quantization updates.
- **Security & Advisories**: Critical CVEs, package malware (npm, PyPI), GitHub Security Advisories, supply-chain attacks.

Ignore consumer gadgets, Apple/iPhone rumors, gaming, celebrity tech, crypto prices, general business news, and startup funding unless it directly impacts developer tools or AI.

Execution Steps:
1. Retrieve general dev and AI company news using the SearchAgent tool. Ensure all retrieved news items are strictly published in the last 12 hours (since ${twelveHoursAgoUtc}).
2. Retrieve GitHub releases, trending repos, HN discussions, Reddit signals, security alerts, Hugging Face daily papers/arXiv preprints, and newly added OpenRouter AI models using the EnrichAgent tool. Ensure all items are strictly from the last 12 hours.
3. Combine all raw findings and pass them to the SynthesisAgent tool to deduplicate, categorize, and rank them. Verify and enforce the 12-hour freshness limit.
4. Pass the ranked JSON results to the EditorAgent tool to format and write the news.md file, using ${nowUtc} as the "Current Date/Time in UTC" and "Last updated" date.`;

    const result = await run(managerAgent, prompt);

    console.log('\n================================================================');
    console.log('🎉 PIPELINE RUN COMPLETED!');
    console.log(`Output File: ${config.outputFile}`);
    console.log('Final Manager Output:');
    console.log(result.finalOutput);
    console.log('================================================================\n');

  } catch (error) {
    console.error('❌ Pipeline failed with error:', error);
    process.exit(1);
  }
}

main();
