import { mainAgent } from './agent.js';

const run = async () => {
    console.log('Sending prompt to the agent...');
    const result = await mainAgent.generate({
        prompt: 'Please fetch and compile a comprehensive summary of the latest AI developer news from June 9-11, 2026. Make sure to include all of the following: (1) Model releases like Google DiffusionGemma, Anthropic Claude Fable 5, Sapient HRM-Text, Decart Oasis 3, and Chatterbox Multilingual v3; (2) Apple WWDC26 developer announcements (Siri AI, App Intents, private cloud compute, iOS 27 betas); (3) OpenAI ChatGPT model picker reasoning updates and Oracle Cloud integrations; (4) Key acquisitions/investments like NEURA Robotics, Nvidia/Kumo AI, Roblox/Morpheus, and Google/Anthropic TPU financing. Ensure all items include correct publication dates and source citation links. Store it in news.md and confirm.',
    });

    console.log('\n--- AGENT RESPONSE ---');
    console.log(result.text);
};

run().catch(console.error);
