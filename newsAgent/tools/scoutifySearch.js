import { config } from '../config/config.js';

// ─── Fetch with retry + jitter ────────────────────────────────────────────────
// Retries only on transient server errors (5xx) or 429 rate limits.
// Jitter prevents thundering herd when multiple searches fail simultaneously.
// Pro plan limits (25 RPS, burst 50, 20 concurrent) are generous enough that
// no concurrency throttling is needed on our end.
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
          await new Promise((resolve) => setTimeout(resolve, retryAfter));
          continue;
        } else {
          // Last attempt exhausted — return response so caller can handle
          return response;
        }
      }

      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      const retryAfter = baseBackoff * Math.pow(2, i) + Math.random() * 500;
      console.warn(`[Scoutify] Network error: ${error.message}. Retrying in ${Math.round(retryAfter)}ms (attempt ${i + 1}/${retries})...`);
      await new Promise((resolve) => setTimeout(resolve, retryAfter));
    }
  }
  return fetch(url, options);
}

// ─── Core request wrapper ────────────────────────────────────────────────────
export async function scoutifyRequest(path, body, method = 'POST') {
  if (!config.scoutifyApiKey) {
    throw new Error('SCOUTIFY_API_KEY is not configured.');
  }

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
        errorMsg = `[${errBody.error.type}] ${errBody.error.message} (Request ID: ${errBody.error.request_id || 'N/A'})`;
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

// ─── High-level search helper ────────────────────────────────────────────────
export async function scoutifySearch(query) {
  if (!config.scoutifyApiKey) {
    console.warn('[Scoutify Search] SCOUTIFY_API_KEY is not configured.');
    return [];
  }

  let freshnessVal = 'day';
  if (config.freshnessHours > 24) {
    if (config.freshnessHours <= 168) {
      freshnessVal = 'week';
    } else if (config.freshnessHours <= 720) {
      freshnessVal = 'month';
    } else {
      freshnessVal = 'year';
    }
  }

  console.log(`[Scoutify Search] Querying (${config.freshnessHours}h → "${freshnessVal}" freshness): "${query}"`);

  try {
    const data = await scoutifyRequest('/v1/search', {
      query,
      max_results: 20,
      freshness: freshnessVal,
    });

    if (!data || !data.data) return [];

    return data.data.map((result) => ({
      title: result.title || 'Untitled',
      url: result.url,
      date: result.published_date || new Date().toISOString(),
      snippet: result.snippet || '',
      source: 'Scoutify',
    }));
  } catch (error) {
    console.error(`[Scoutify Search] Failed for query "${query}":`, error.message);
    return [];
  }
}

// ─── Async job poller ────────────────────────────────────────────────────────
// Per Scoutify docs: poll GET /v1/jobs/{id} until status is "succeeded",
// then fetch the result from result_url.
export async function pollJob(jobId, delayMs = 3000) {
  console.log(`[Scoutify Job] Polling status for job ${jobId}...`);
  while (true) {
    const job = await scoutifyRequest(`/v1/jobs/${jobId}`, null, 'GET');
    console.log(`[Scoutify Job] Status: ${job.status}`);

    if (job.status === 'succeeded') {
      if (job.result_url) {
        // Fetch the actual result from the provided URL
        const res = await fetch(job.result_url, {
          headers: { 'Authorization': `Bearer ${config.scoutifyApiKey}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch job result from result_url: ${res.status}`);
        return res.json();
      }
      // Fallback if result is inlined
      return job.result;
    } else if (job.status === 'failed') {
      throw new Error(`Job ${jobId} failed: ${job.error?.message || 'Unknown error'}`);
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

