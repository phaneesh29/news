import { Redis } from '@upstash/redis';
import { config } from '../config/config.js';

let redisClient = null;

export function getRedisClient() {
  if (!redisClient) {
    if (!config.upstashRedisRestUrl || !config.upstashRedisRestToken) {
      throw new Error('Upstash Redis credentials are not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your environment.');
    }
    redisClient = new Redis({
      url: config.upstashRedisRestUrl,
      token: config.upstashRedisRestToken,
    });
  }
  return redisClient;
}

export async function storeNewsInRedis(newsArray) {
  const client = getRedisClient();
  const key = 'news:latest';
  const ttlSeconds = 13 * 60 * 60; 
  
  await client.del(key);
  
  const hashFields = {};
  newsArray.forEach((story, idx) => {
    hashFields[`story:${idx + 1}`] = story;
  });
  
  await client.hset(key, hashFields);
  await client.expire(key, ttlSeconds);
  
  console.log(`[Redis] Successfully stored ${newsArray.length} stories in Redis Hash "${key}" via hset with TTL of 13 hours.`);
}
