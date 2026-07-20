import './utils/disable-tracing.js';
import { run } from '@openai/agents';
import './utils/llm.js';
import { managerAgent } from './agents/managerAgent.js';
import { config } from './config/config.js';
import { storeNewsInRedis } from './utils/redis.js';
import { sendEmail } from './utils/emailHelper.js';

const query = 'latest developer-focused AI releases, chips, acquisitions, devtools, infrastructure, and security advisories';
const maxAttempts = 3;

function buildPrompt(attempt, previousFeedback = '') {
  const now = new Date();
  const freshAfterUtc = new Date(Date.now() - config.freshnessHours * 60 * 60 * 1000).toUTCString();

  return `Current UTC time: ${now.toUTCString()}
Freshness cutoff: ${freshAfterUtc}
Attempt: ${attempt}/${maxAttempts}

Run the 3-step news pipeline.
Keep it simple:
- search fresh developer/AI news
- enrich with releases and discussion
- synthesize into clean JSON

Return only raw JSON.

${previousFeedback ? `Previous quality feedback to fix:\n${previousFeedback}` : ''}`;
}

// Weak/local models often wrap JSON in ```json fences or add prose around it.
// Strip fences and isolate the outer array/object before parsing.
function parseNewsOutput(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.stories)) return raw.stories;
  if (typeof raw !== 'string') return null;

  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  const tryParse = (s) => {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.stories)) return parsed.stories;
      return null;
    } catch {
      return null;
    }
  };

  let result = tryParse(text);
  if (result) return result;

  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end > start) {
    result = tryParse(text.slice(start, end + 1));
    if (result) return result;
  }

  const objStart = text.indexOf('{');
  const objEnd = text.lastIndexOf('}');
  if (objStart !== -1 && objEnd > objStart) {
    result = tryParse(text.slice(objStart, objEnd + 1));
    if (result) return result;
  }

  return null;
}

// Local models drift on field names (description vs summary, url vs sources).
// Coerce common variants into the canonical story shape before validating.
function normalizeStory(story) {
  if (!story || typeof story !== 'object') return story;

  const summary = story.summary ?? story.description ?? story.desc ?? story.content ?? '';

  let sources = story.sources ?? story.source ?? story.url ?? story.link ?? [];
  if (typeof sources === 'string') sources = [sources];
  if (!Array.isArray(sources)) sources = [];
  sources = sources.filter((s) => typeof s === 'string' && /^https?:\/\//i.test(s));

  let tags = story.tags ?? [];
  if (typeof tags === 'string') tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
  if (!Array.isArray(tags)) tags = [];

  return {
    ...story,
    title: typeof story.title === 'string' ? story.title.trim() : story.title,
    summary: typeof summary === 'string' ? summary.trim() : summary,
    category: mapCategory(story.category),
    tags,
    confidence: story.confidence ?? 'Medium',
    sources,
  };
}

const ALLOWED_CATEGORIES = [
  'Developer Tools & Platforms',
  'AI & Machine Learning',
  'Chips, Infrastructure & Acquisitions',
  'Security & Advisories',
];

function mapCategory(raw) {
  if (typeof raw === 'string' && ALLOWED_CATEGORIES.includes(raw)) return raw;
  const c = String(raw || '').toLowerCase();
  if (/secur|cve|vuln|advisor|malware|exploit/.test(c)) return 'Security & Advisories';
  if (/chip|gpu|hardware|infra|acquisi|funding|silicon/.test(c)) return 'Chips, Infrastructure & Acquisitions';
  if (/tool|platform|framework|devops|sdk|ide|library/.test(c)) return 'Developer Tools & Platforms';
  return 'AI & Machine Learning';
}

function evaluateNewsData(rawOutput) {
  const failures = [];
  const parsed = parseNewsOutput(rawOutput);
  if (!Array.isArray(parsed)) {
    failures.push('Output is not a valid JSON array of news objects. Return ONLY a raw JSON array with no markdown code fences or extra prose.');
    return { ok: false, failures };
  }

  const newsArray = parsed.map(normalizeStory);

  if (newsArray.length < 5) {
    failures.push(`Only ${newsArray.length} stories found; publish at least 5 high-quality stories if fresh sources exist.`);
  }

  newsArray.forEach((story, index) => {
    if (!story.title || story.title.trim().length === 0) {
      failures.push(`Story at index ${index} is missing a title.`);
    }
    if (!story.summary || story.summary.trim().length === 0) {
      failures.push(`Story at index ${index} is missing a summary.`);
    }
    if (!story.category) {
      failures.push(`Story at index ${index} is missing a category.`);
    }
    if (!story.tags || story.tags.length < 2) {
      failures.push(`Story at index ${index} must have at least 2 tags.`);
    }
    if (!story.sources || story.sources.length === 0) {
      failures.push(`Story at index ${index} must have at least 1 verified source URL.`);
    }

   if (story.title && (story.title.includes('#') || story.title.includes('*') || story.title.includes('`') || story.title.includes('[') || story.title.includes(']'))) {
      failures.push(`Story at index ${index} title contains markdown formatting.`);
    }
    if (story.summary && (story.summary.includes('**') || story.summary.includes('`') || story.summary.includes('[') || story.summary.includes(']'))) {
      failures.push(`Story at index ${index} summary contains markdown formatting.`);
    }

    if (story.sources) {
      story.sources.forEach(src => {
        if (/example\.com|placeholder|#/i.test(src)) {
          failures.push(`Story at index ${index} contains placeholder source URL: ${src}`);
        }
      });
    }
  });

  return {
    ok: failures.length === 0,
    failures,
    storyCount: newsArray.length,
    stories: newsArray,
  };
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

      const evaluation = evaluateNewsData(result.finalOutput);
      if (evaluation.ok) {
        await storeNewsInRedis(evaluation.stories);
        const emailResult = await sendEmail(evaluation.stories);
        if (!emailResult.success) {
          throw new Error(`Digest saved to Redis, but email failed: ${emailResult.error}`);
        }

        console.log('\n================================================================');
        console.log('PIPELINE RUN COMPLETED');
        console.log(`Stories stored and email dispatched: ${evaluation.storyCount}`);
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
