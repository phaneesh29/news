import 'dotenv/config';
import { wrapLanguageModel } from 'ai';
import { mistral } from '@ai-sdk/mistral';

export const MODELS = {
  orchestrator: 'codestral-2508',
  searchDefault: 'codestral-2508',
  rank: 'codestral-2508',
};

export function getModel(role) {
  const modelName = MODELS[role] || 'mistral-small';
  const baseModel = mistral(modelName);

  return wrapLanguageModel({
    model: baseModel,
    middleware: {
      wrapGenerate: async ({ doGenerate, params }) => {
        await new Promise(resolve => setTimeout(resolve, 1500));

        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          try {
            return await doGenerate();
          } catch (error) {
            const isRateLimit =
              error.statusCode === 429 ||
              (error.message && error.message.toLowerCase().includes('rate limit')) ||
              (error.responseBody && error.responseBody.toLowerCase().includes('rate limit')) ||
              (error.response && error.response.status === 429);

            if (isRateLimit && attempts < maxAttempts - 1) {
              attempts++;
              const delay = Math.pow(2, attempts) * 1000 + Math.floor(Math.random() * 1000);
              console.warn(`⚠️  [Rate Limit Retry] Mistral API rate limited (429). Attempt ${attempts}/${maxAttempts}. Waiting ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              throw error;
            }
          }
        }
      },
    },
  });
}
