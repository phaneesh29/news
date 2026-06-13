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

    const prompt = `Run the full developer and AI news briefing pipeline:
1. Retrieve general dev and AI company news using the SearchAgent tool.
2. Retrieve GitHub releases, trending repos, HN discussions, Reddit signals, and security alerts using the EnrichAgent tool.
3. Combine all raw findings and pass them to the SynthesisAgent tool to deduplicate, categorize, and rank them.
4. Pass the ranked JSON results to the EditorAgent tool to format and write the nws.md file.`;

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
