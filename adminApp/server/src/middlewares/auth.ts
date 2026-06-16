import { Context, type Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { eq, and, gt } from 'drizzle-orm'
import crypto from 'crypto'
import { db } from '../db/index.js'
import { adminSessions, adminUsers } from '../db/schema.js'

export const requireAuth = async (c: Context, next: Next) => {
  try {
    let token = getCookie(c, 'admin_session')
    
    if (!token) {
      const authHeader = c.req.header('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
      }
    }

    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const sessions = await db.select({
      session: adminSessions,
      user: adminUsers
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminId, adminUsers.id))
    .where(
      and(
        eq(adminSessions.tokenHash, tokenHash),
        eq(adminSessions.isValid, true),
        gt(adminSessions.expiresAt, new Date())
      )
    )
    .limit(1)

    const result = sessions[0]

    if (!result) {
      return c.json({ error: 'Session expired or invalid' }, 401)
    }

    if (result.user.status !== 'active') {
      return c.json({ error: 'User account is not active' }, 403)
    }

    c.set('user', result.user)
    c.set('session', result.session)

    await next()
  } catch (error) {
    console.error('Auth Middleware Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
