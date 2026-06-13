import './utils/disable-tracing.js';
import { run } from '@openai/agents';
import './utils/llm.js';
import { managerAgent } from './agents/managerAgent.js';
import { config } from './config/config.js';

const query = 'latest software development and AI news, new LLM model releases, developer tool updates, and framework releases';

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
Run the full developer and AI news briefing pipeline:
1. Retrieve general dev and AI company news using the SearchAgent tool. Ensure all retrieved news items are strictly published in the last 12 hours (since ${twelveHoursAgoUtc}).
2. Retrieve GitHub releases, trending repos, HN discussions, Reddit signals, and security alerts using the EnrichAgent tool. Ensure all items are strictly from the last 12 hours.
3. Combine all raw findings and pass them to the SynthesisAgent tool to deduplicate, categorize, and rank them. Verify and enforce the 12-hour freshness limit for all items.
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
