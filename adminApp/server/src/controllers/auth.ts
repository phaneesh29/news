import { Context } from 'hono'
import { and, desc, eq, gt, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { adminUsers, adminWhitelist, adminOtps, adminSessions } from '../db/schema.js'
import { sendEmail } from '../utils/email.js'
import {
  OTP_TTL_MS,
  SESSION_TTL_MS,
  clearSessionCookie,
  consumeRateLimit,
  generateOtp,
  generateSessionToken,
  getClientIp,
  hashOtp,
  hashToken,
  normalizeEmail,
  secureCompare,
  setSessionCookie,
} from '../lib/auth.js'

export const requestOtp = async (c: Context) => {
  try {
    const body = await c.req.json() as { email: string }
    const email = normalizeEmail(body.email)
    const ipAddress = getClientIp(c)

    const requestKey = `${email}:${ipAddress ?? 'unknown'}`
    if (!await consumeRateLimit(requestKey, 5, OTP_TTL_MS, 'rl:admin:otp-request')) {
      return c.json({ error: 'Too many OTP requests. Please try again later.' }, 429)
    }

    const whitelisted = await db.select()
      .from(adminWhitelist)
      .where(sql`lower(${adminWhitelist.email}) = ${email}`)
      .limit(1)

    if (whitelisted.length === 0) {
      return c.json({ error: 'Email is not authorized' }, 403)
    }

    const users = await db.select()
      .from(adminUsers)
      .where(sql`lower(${adminUsers.email}) = ${email}`)
      .limit(1)

    let user = users[0]
    if (!user) {
      const insertedUsers = await db.insert(adminUsers)
        .values({ email })
        .returning()
      user = insertedUsers[0]
    }

    if (!user) {
      return c.json({ error: 'User could not be created' }, 500)
    }

    if (user.status !== 'active') {
      return c.json({ error: 'User account is not active' }, 403)
    }

    const otp = generateOtp()
    const codeHash = hashOtp(email, otp)
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    await db.transaction(async (tx) => {
      await tx.delete(adminOtps).where(eq(adminOtps.adminId, user.id))

      await tx.insert(adminOtps).values({
        adminId: user.id,
        codeHash,
        expiresAt,
        ipAddress,
        userAgent: c.req.header('user-agent') || null
      })
    })

    const emailRes = await sendEmail({
      to: email,
      subject: 'Your Login OTP',
      text: `Your OTP for login is: ${otp}. It is valid for 15 minutes.`
    })

    if (!emailRes.success) {
      return c.json({ error: 'Failed to send OTP email' }, 500)
    }

    return c.json({ message: 'OTP sent successfully' })
  } catch (error: any) {
    console.error('Request OTP Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const verifyOtp = async (c: Context) => {
  try {
    const body = await c.req.json() as { email: string, otp: string }
    const email = normalizeEmail(body.email)
    const otp = body.otp.trim()
    const ipAddress = getClientIp(c)

    const verifyKey = `${email}:${ipAddress ?? 'unknown'}`
    if (!await consumeRateLimit(verifyKey, 10, OTP_TTL_MS, 'rl:admin:otp-verify')) {
      return c.json({ error: 'Too many verification attempts. Please try again later.' }, 429)
    }

    const whitelisted = await db.select()
      .from(adminWhitelist)
      .where(sql`lower(${adminWhitelist.email}) = ${email}`)
      .limit(1)

    if (whitelisted.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const users = await db.select()
      .from(adminUsers)
      .where(sql`lower(${adminUsers.email}) = ${email}`)
      .limit(1)

    const user = users[0]
    if (!user || user.status !== 'active') {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const otps = await db.select()
      .from(adminOtps)
      .where(eq(adminOtps.adminId, user.id))
      .orderBy(desc(adminOtps.createdAt))
      .limit(1)

    const latestOtp = otps[0]

    if (!latestOtp) {
      return c.json({ error: 'No OTP found. Please request a new one.' }, 401)
    }

    if (latestOtp.expiresAt < new Date()) {
      return c.json({ error: 'OTP has expired' }, 401)
    }

    if (latestOtp.attempts >= latestOtp.maxAttempts) {
      return c.json({ error: 'Maximum attempts reached. Please request a new OTP.' }, 401)
    }

    const codeHash = hashOtp(email, otp)
    if (!secureCompare(latestOtp.codeHash, codeHash)) {
      await db.update(adminOtps)
        .set({ attempts: latestOtp.attempts + 1 })
        .where(eq(adminOtps.id, latestOtp.id))
      return c.json({ error: 'Invalid OTP' }, 401)
    }

    const token = generateSessionToken()
    const tokenHash = hashToken(token)
    const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_MS)

    await db.transaction(async (tx) => {
      await tx.delete(adminOtps).where(eq(adminOtps.adminId, user.id))

      await tx.insert(adminSessions)
        .values({
          adminId: user.id,
          tokenHash,
          expiresAt: sessionExpiresAt,
          ipAddress,
          userAgent: c.req.header('user-agent') || null
        })

      await tx.update(adminUsers)
        .set({ lastLoginAt: new Date(), updatedAt: new Date() })
        .where(eq(adminUsers.id, user.id))
    })

    setSessionCookie(c, token)

    return c.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      }
    })
  } catch (error: any) {
    console.error('Verify OTP Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const logout = async (c: Context) => {
  try {
    const session = c.get('session')

    if (session) {
      await db.delete(adminSessions)
        .where(eq(adminSessions.id, session.id))
    }

    clearSessionCookie(c)

    return c.json({ message: 'Logged out successfully' })
  } catch (error: any) {
    console.error('Logout Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const getProfile = async (c: Context) => {
  try {
    const user = c.get('user')
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error: any) {
    console.error('Get Profile Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const getSessions = async (c: Context) => {
  try {
    const user = c.get('user')
    const currentSession = c.get('session')

    const sessions = await db.select({
      id: adminSessions.id,
      ipAddress: adminSessions.ipAddress,
      userAgent: adminSessions.userAgent,
      isValid: adminSessions.isValid,
      expiresAt: adminSessions.expiresAt,
      createdAt: adminSessions.createdAt,
      updatedAt: adminSessions.updatedAt,
      isCurrent: eq(adminSessions.id, currentSession.id)
    })
      .from(adminSessions)
      .where(eq(adminSessions.adminId, user.id))
      .orderBy(desc(adminSessions.createdAt))

    return c.json({ sessions })
  } catch (error: any) {
    console.error('Get Sessions Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const revokeAllSessions = async (c: Context) => {
  try {
    const user = c.get('user')

    const revokedSessions = await db.delete(adminSessions)
      .where(
        and(
          eq(adminSessions.adminId, user.id),
          eq(adminSessions.isValid, true),
          gt(adminSessions.expiresAt, new Date())
        )
      )
      .returning({ id: adminSessions.id })

    clearSessionCookie(c)

    return c.json({
      message: 'All sessions revoked successfully',
      revokedCount: revokedSessions.length
    })
  } catch (error: any) {
    console.error('Revoke All Sessions Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
