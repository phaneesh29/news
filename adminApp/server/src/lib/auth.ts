import { Context } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import crypto from 'crypto'
import { env } from '../config/env.js'

export const SESSION_COOKIE = 'admin_session'
export const OTP_TTL_MS = 15 * 60 * 1000
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60
export const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000

const AUTH_SECRET = env.AUTH_SECRET

type RateLimitBucket = {
  count: number
  resetAt: number
}

export const requestOtpLimits = new Map<string, RateLimitBucket>()
export const verifyOtpLimits = new Map<string, RateLimitBucket>()

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const getClientIp = (c: Context) => {
  const forwardedFor = c.req.header('x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() || c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || null
}

export const consumeRateLimit = (
  store: Map<string, RateLimitBucket>,
  key: string,
  limit: number,
  windowMs: number
) => {
  const now = Date.now()
  const bucket = store.get(key)

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= limit) {
    return false
  }

  bucket.count += 1
  return true
}

export const hashOtp = (email: string, otp: string) =>
  crypto.createHmac('sha256', AUTH_SECRET).update(`${email}:${otp}`).digest('hex')

export const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex')

export const generateOtp = () => crypto.randomInt(100000, 1000000).toString()

export const generateSessionToken = () => crypto.randomBytes(32).toString('hex')

export const secureCompare = (a: string, b: string) => {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export const setSessionCookie = (c: Context, token: string) => {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_TTL_SECONDS,
    path: '/'
  })
}

export const clearSessionCookie = (c: Context) => {
  deleteCookie(c, SESSION_COOKIE, {
    path: '/'
  })
}
