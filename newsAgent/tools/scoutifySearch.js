import { config } from '../config/config.js';

export async function fetchWithRetry(url, options = {}, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        let retryAfter = backoff * Math.pow(2, i);
        const retryAfterHeader = response.headers.get('retry-after');
        if (retryAfterHeader) {
          const seconds = parseInt(retryAfterHeader, 10);
          if (!isNaN(seconds)) {
            retryAfter = seconds * 1000;
          }
        }
        console.warn(`[Scoutify] Got status ${response.status}. Retrying in ${retryAfter}ms (attempt ${i + 1}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        continue;
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      const retryAfter = backoff * Math.pow(2, i);
      console.warn(`[Scoutify] Network error: ${error.message}. Retrying in ${retryAfter}ms (attempt ${i + 1}/${retries})...`);
      await new Promise((resolve) => setTimeout(resolve, retryAfter));
    }
  }
  return fetch(url, options);
}

export async function scoutifyRequest(path, body, method = 'POST') {
  if (!config.scoutifyApiKey) {
    throw new Error('SCOUTIFY_API_KEY is not configured.');
  }

  const url = `https://scoutify.switchaicloud.com${path}`;
  const options = {
    method: method,
    headers: {
      'Authorization': `Bearer ${config.scoutifyApiKey}`,
    }
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

export async function scoutifySearch(query) {
  if (!config.scoutifyApiKey) {
    console.warn('[Scoutify Search] SCOUTIFY_API_KEY is not configured.');
    return [];
  }

  let timeRange = 'day';
  if (config.freshnessHours > 24) {
    if (config.freshnessHours <= 720) {
      timeRange = 'month';
    } else {
      timeRange = 'year';
    }
  }

  console.log(`[Scoutify Search] Querying (${config.freshnessHours}h mapped to "${timeRange}" time_range): "${query}"`);

  try {
    const data = await scoutifyRequest('/v1/search', {
      query: query,
      limit: 20,
      time_range: timeRange
    });

    if (!data || !data.results) return [];

    return data.results.map((result) => {
      return {
        title: result.title || 'Untitled',
        url: result.url,
        date: result.published_date || new Date().toISOString(),
        snippet: result.content || '',
        source: 'Scoutify',
      };
    });
  } catch (error) {
    console.error(`[Scoutify Search] Failed for query "${query}":`, error.message);
    return [];
  }
}

export async function pollJob(jobId, delayMs = 2000) {
  console.log(`[Scoutify Job] Polling status for job ${jobId}...`);
  while (true) {
    const job = await scoutifyRequest(`/v1/jobs/${jobId}`, null, 'GET');
    console.log(`[Scoutify Job] Status: ${job.status}, progress: ${job.progress}%`);
    if (job.status === 'succeeded') {
      return job.result;
    } else if (job.status === 'failed') {
      throw new Error(`Job ${jobId} failed: ${job.error?.message || 'Unknown error'}`);
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
