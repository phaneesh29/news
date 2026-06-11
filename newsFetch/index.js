import { mainAgent } from './agent.js';

const run = async () => {
    console.log('Sending prompt to the agent...');
    const result = await mainAgent.generate({
        prompt: 'Please fetch the latest AI developer news (including new model releases, acquisitions, investments, and tech releases), store it in news.md, and confirm that it has been stored.',
    });

    console.log('\n--- AGENT RESPONSE ---');
    console.log(result.text);
};

run().catch(console.error);
