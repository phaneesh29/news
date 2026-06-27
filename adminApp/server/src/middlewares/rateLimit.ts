import { rateLimiter, RedisStore } from 'hono-rate-limiter'
import { Context } from 'hono'
import { getClientIp } from '../lib/auth.js'
import { redis } from '../lib/redis.js'

export const globalRateLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  skip: (c: Context) => c.req.method === 'OPTIONS',
  store: new RedisStore({
    client: redis,
    prefix: 'rl:admin:global:'
  }),
  keyGenerator: (c: Context) => getClientIp(c) ?? 'anonymous',
  handler: (c: Context) => {
    return c.json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.'
      },
      requestId: c.get('requestId')
    }, 429)
  }
})
