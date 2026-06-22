import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(100, "15 m"),
});

const rateLimiter = async (req, res, next) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : null)
    || req.headers['cf-connecting-ip']
    || req.headers['x-real-ip']
    || req.ip
    || req.socket?.remoteAddress
    || 'unknown';

  const { success, limit, remaining, reset } = await ratelimit.limit(`api:${ip}`);

  res.set({
    'RateLimit-Limit': limit.toString(),
    'RateLimit-Remaining': remaining.toString(),
    'RateLimit-Reset': reset.toString()
  });

  if (!success) {
    res.set('Retry-After', Math.max(1, Math.ceil((reset - Date.now()) / 1000)).toString());
    return res.status(429).json({
      status: 'fail',
      message: 'Too many requests, please try again later.'
    });
  }

  next();
};

export default rateLimiter;
