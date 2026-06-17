import { rateLimiter } from 'hono-rate-limiter'
import { Context } from 'hono'
import { getClientIp } from '../lib/auth.js'

export const globalRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 100,
  keyGenerator: (c: Context) => getClientIp(c) ?? 'anonymous',
  handler: (c: Context) => {
    return c.json({ error: 'Too many requests. Please try again later.' }, 429)
  }
})
