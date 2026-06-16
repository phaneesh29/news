import { Context } from 'hono'
import { db } from '../db/index.js'
import { adminWhitelist } from '../db/schema.js'
import { normalizeEmail } from '../lib/auth.js'

export const addWhitelistEmail = async (c: Context) => {
  try {
    const user = c.get('user')
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can whitelist new emails' }, 403)
    }

    const body = await c.req.json() as { email: string }
    const email = normalizeEmail(body.email)

    await db.insert(adminWhitelist)
      .values({ email })
      .onConflictDoNothing({ target: adminWhitelist.email })

    return c.json({ message: 'Email whitelisted successfully', email })
  } catch (error: any) {
    console.error('Add Whitelist Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const getWhitelistEmails = async (c: Context) => {
  try {
    const user = c.get('user')
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can view whitelisted emails' }, 403)
    }

    const emails = await db.select({
      id: adminWhitelist.id,
      email: adminWhitelist.email,
      createdAt: adminWhitelist.createdAt
    }).from(adminWhitelist)

    return c.json({ emails })
  } catch (error: any) {
    console.error('Get Whitelist Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
