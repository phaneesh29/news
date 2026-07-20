import { config } from '../config/config.js';

let scoutifyQueue = Promise.resolve();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSerial(task) {
  const previous = scoutifyQueue;
  let release;

  scoutifyQueue = new Promise((resolve) => {
    release = resolve;
  });

  await previous;
  try {
    return await task();
  } finally {
    release();
  }
}

function getFreshnessValue() {
  if (config.freshnessHours <= 24) return 'day';
  if (config.freshnessHours <= 720) return 'month';
  return 'year';
}

function buildSearchPayload(query, includeFreshness = true) {
  const payload = { query, limit: 10 };
  if (includeFreshness) payload.time_range = getFreshnessValue();
  return payload;
}

function normalizeSearchResults(data) {
  const results = data?.results;
  if (!Array.isArray(results)) return [];

  return results.map((result) => ({
    title: result.title || 'Untitled',
    url: result.url,
    date: result.published_date || new Date().toISOString(),
    snippet: result.content || '',
    score: typeof result.score === 'number' ? result.score : undefined,
    source: 'Scoutify',
  }));
}

export async function fetchWithRetry(url, options = {}, retries = 3, baseBackoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        let retryAfter = baseBackoff * Math.pow(2, i) + Math.random() * 500;
        const retryAfterHeader = response.headers.get('retry-after');
        if (retryAfterHeader) {
          const seconds = parseInt(retryAfterHeader, 10);
          if (!isNaN(seconds)) retryAfter = seconds * 1000;
        }

        if (i < retries - 1) {
          console.warn(`[Scoutify] Got status ${response.status}. Retrying in ${Math.round(retryAfter)}ms (attempt ${i + 1}/${retries})...`);
          await sleep(retryAfter);
          continue;
        }
        return response;
      }

      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      const retryAfter = baseBackoff * Math.pow(2, i) + Math.random() * 500;
      console.warn(`[Scoutify] Network error: ${error.message}. Retrying in ${Math.round(retryAfter)}ms (attempt ${i + 1}/${retries})...`);
      await sleep(retryAfter);
    }
  }
}

export async function scoutifyRequest(path, body, method = 'POST') {
  if (!config.scoutifyApiKey) {
    throw new Error('SCOUTIFY_API_KEY is not configured.');
  }

  return runSerial(async () => {
    const url = `https://scoutify.switchaicloud.com${path}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${config.scoutifyApiKey}`,
      },
    };

    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetchWithRetry(url, options);

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errBody = await response.json();
        if (errBody && errBody.error) {
          const code = errBody.error.code || 'error';
          const reqId = errBody.request_id || 'N/A';
          errorMsg = `[${code}] ${errBody.error.message} (Request ID: ${reqId})`;
        }
      } catch (_) {
        if (response.status === 503) {
          errorMsg = 'Scoutify service unavailable (503). The upstream API is temporarily down.';
        }
      }
      throw new Error(errorMsg);
    }

    return response.json();
  });
}

export async function scoutifySearch(query) {
  if (!config.scoutifyApiKey) {
    console.warn('[Scoutify Search] SCOUTIFY_API_KEY is not configured.');
    return [];
  }

  const freshness = getFreshnessValue();
  console.log(`[Scoutify Search] Querying (${config.freshnessHours}h → "${freshness}" freshness): "${query}"`);

  try {
    try {
      const data = await scoutifyRequest('/v1/search', buildSearchPayload(query, true));
      return normalizeSearchResults(data);
    } catch (error) {
      const message = String(error?.message || '');
      if (!/validation_error|payload is invalid|invalid request/i.test(message)) {
        throw error;
      }

      console.warn('[Scoutify Search] Retrying search with minimal payload after validation error...');
      const data = await scoutifyRequest('/v1/search', buildSearchPayload(query, false));
      return normalizeSearchResults(data);
    }
  } catch (error) {
    console.error(`[Scoutify Search] Failed for query "${query}":`, error.message);
    return [];
  }
}

export async function pollJob(jobId, delayMs = 3000, maxAttempts = 40) {
  console.log(`[Scoutify Job] Polling status for job ${jobId}...`);
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const job = await scoutifyRequest(`/v1/jobs/${jobId}`, null, 'GET');
    console.log(`[Scoutify Job] Status: ${job.status}`);

    if (job.status === 'completed') {
      return job.result;
    } else if (job.status === 'failed' || job.status === 'cancelled') {
      throw new Error(`Job ${jobId} ${job.status}: ${job.error?.message || 'Unknown error'}`);
    }

    await sleep(delayMs);
  }
  throw new Error(`Job ${jobId} did not complete after ${maxAttempts} polls.`);
}

