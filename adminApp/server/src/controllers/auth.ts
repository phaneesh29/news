import { Context } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { setCookie, deleteCookie } from 'hono/cookie'
import { db } from '../db/index.js'
import { adminUsers, adminWhitelist, adminOtps, adminSessions } from '../db/schema.js'
import { sendEmail } from '../utils/email.js'
import { env } from '../config/env.js'
import crypto from 'crypto'

export const requestOtp = async (c: Context) => {
  try {
    const { email } = await c.req.json() as { email: string }


    const whitelisted = await db.select().from(adminWhitelist).where(eq(adminWhitelist.email, email)).limit(1)

    if (whitelisted.length === 0) {
      return c.json({ error: 'Email is not authorized' }, 403)
    }

    let users = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1)

    let user = users[0]

    if (!user) {
      const insertedUsers = await db.insert(adminUsers)
        .values({ email })
        .returning()
      user = insertedUsers[0]
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    const codeHash = crypto.createHash('sha256').update(otp).digest('hex')

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    if (!user) {
      return c.json({ error: 'User could not be created' }, 500)
    }

    await db.delete(adminOtps).where(eq(adminOtps.adminId, user.id))

    await db.insert(adminOtps).values({
        adminId: user.id,
        codeHash,
        expiresAt,
        ipAddress: c.req.header('x-forwarded-for') || null,
        userAgent: c.req.header('user-agent') || null
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
    const { email, otp } = await c.req.json() as { email: string, otp: string }

    const users = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1)

    const user = users[0]

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const codeHash = crypto.createHash('sha256').update(otp).digest('hex')

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

    if (latestOtp.codeHash !== codeHash) {
      await db.update(adminOtps)
        .set({ attempts: latestOtp.attempts + 1 })
        .where(eq(adminOtps.id, latestOtp.id))
      return c.json({ error: 'Invalid OTP' }, 401)
    }

    await db.delete(adminOtps).where(eq(adminOtps.adminId, user.id))

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await db.insert(adminSessions)
      .values({
        adminId: user.id,
        tokenHash,
        expiresAt: sessionExpiresAt,
        ipAddress: c.req.header('x-forwarded-for') || null,
        userAgent: c.req.header('user-agent') || null
      })

    await db.update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, user.id))

    setCookie(c, 'admin_session', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    return c.json({ 
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
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
      await db.update(adminSessions)
        .set({ isValid: false })
        .where(eq(adminSessions.id, session.id))
    }

    deleteCookie(c, 'admin_session', {
      path: '/'
    })

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
        lastLoginAt: user.lastLoginAt
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
