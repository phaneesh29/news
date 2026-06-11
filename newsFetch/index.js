import { mainAgent } from './agent.js';

const run = async () => {
    console.log('Sending prompt to the agent...');
    const result = await mainAgent.generate({
        prompt: 'Please run a comprehensive multi-query news fetch for the latest developer-focused AI updates from the last 12 hours. Execute at least 3-4 distinct queries covering model releases, dev tools/libraries, IDE integrations, open-source trends, and funding/acquisitions. Evaluate and label every news item with a confidence rating (High, Medium, Low) based on source support. Save the summary with confidence labels to news.md, and output the summary and verification report.',
    });

    console.log('\n--- AGENT RESPONSE ---');
    console.log(result.text);
};

run().catch(console.error);
