import { Context } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { adminWhitelist, adminUsers } from '../db/schema.js'
import { normalizeEmail } from '../lib/auth.js'

export const addWhitelistEmail = async (c: Context) => {
  try {
    const user = c.get('user')
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can whitelist new emails' }, 403)
    }

    const body = await c.req.json() as { email: string }
    const email = normalizeEmail(body.email)

    const result = await db.insert(adminWhitelist)
      .values({ email })
      .onConflictDoNothing({ target: adminWhitelist.email })
      .returning()

    const item = result[0]

    return c.json({ 
      message: 'Email whitelisted successfully', 
      email, 
      id: item?.id, 
      createdAt: item?.createdAt 
    })
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

export const deleteWhitelistEmail = async (c: Context) => {
  try {
    const user = c.get('user')
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can delete whitelisted emails' }, 403)
    }

    const id = c.req.param('id')
    if (!id) {
      return c.json({ error: 'ID parameter is missing' }, 400)
    }

    const entries = await db.select()
      .from(adminWhitelist)
      .where(eq(adminWhitelist.id, id))
      .limit(1)

    const entry = entries[0]
    if (!entry) {
      return c.json({ error: 'Whitelist entry not found' }, 404)
    }

    if (entry.email.toLowerCase() === user.email.toLowerCase()) {
      return c.json({ error: 'Action prohibited' }, 403)
    }

    await db.delete(adminWhitelist)
      .where(eq(adminWhitelist.id, id))

    await db.delete(adminUsers)
      .where(eq(adminUsers.email, entry.email))

    return c.json({ message: 'Email removed from whitelist and account deleted successfully', email: entry.email })
  } catch (error: any) {
    console.error('Delete Whitelist Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
