import { memoryAgent } from './agent.js';

const run = async () => {
    console.log('Sending prompt to the agent...');
    const result = await memoryAgent.generate({
        prompt: 'Hi! Please remember that my name is Phaneesh and my favorite color is ocean blue.',
    });

    console.log('\n--- AGENT RESPONSE ---');
    console.log(result.text);
    console.log(result.steps);
};

run().catch(console.error);
