import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { Context } from 'hono'
import type { Next } from 'hono'
import { getClientIp } from '../lib/auth.js'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '5 m'),
  prefix: 'rl:admin:global:'
})

export const globalRateLimiter = async (c: Context, next: Next) => {
  if (c.req.method === 'OPTIONS') {
    return await next()
  }

  const ip = getClientIp(c) ?? 'anonymous'
  const { success, limit, remaining, reset } = await ratelimit.limit(ip)

  c.header('RateLimit-Limit', limit.toString())
  c.header('RateLimit-Remaining', remaining.toString())
  c.header('RateLimit-Reset', reset.toString())

  if (!success) {
    return c.json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.'
      },
      requestId: c.get('requestId')
    }, 429)
  }

  await next()
}
