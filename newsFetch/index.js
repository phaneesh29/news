import { mainAgent } from './agent.js';

const run = async () => {
    console.log('🚀 Starting News Agent Pipeline...\n');
    const startTime = Date.now();

    const result = await mainAgent.generate({
        prompt: `Run the full multi-stage news pipeline now:

1. Execute parallel search across all 3 categories (Dev Tools, AI/ML, Dev Ecosystem Funding) — each uses both Exa and Tavily
2. Deduplicate, rank, verify & assign confidence levels to the merged results
3. Save the final output to news.md
4. Email the news digest to all whitelisted recipients

Focus: Developer-centric news only. All finance/funding must be AI & dev related.
Freshness: Last 12 hours only — reject anything stale.
Quality: Tag trending/breaking items, detect cross-category trends, include TL;DR.`,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Pipeline complete in ${elapsed}s`);
    console.log('\n--- AGENT RESPONSE ---');
    console.log(result.text);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
