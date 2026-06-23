import { Context } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { adminWhitelist, adminUsers } from '../db/schema.js'
import { normalizeEmail } from '../lib/auth.js'
import { HTTPException } from 'hono/http-exception'

export const addWhitelistEmail = async (c: Context) => {
  const user = c.get('user')

  if (user.role !== 'admin') {
    throw new HTTPException(403, { message: 'Only admins can whitelist new emails' })
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
}

export const getWhitelistEmails = async (c: Context) => {
  const user = c.get('user')

  if (user.role !== 'admin') {
    throw new HTTPException(403, { message: 'Only admins can view whitelisted emails' })
  }

  const emails = await db.select({
    id: adminWhitelist.id,
    email: adminWhitelist.email,
    createdAt: adminWhitelist.createdAt
  }).from(adminWhitelist)

  return c.json({ emails })
}

export const deleteWhitelistEmail = async (c: Context) => {
  const user = c.get('user')

  if (user.role !== 'admin') {
    throw new HTTPException(403, { message: 'Only admins can delete whitelisted emails' })
  }

  const id = c.req.param('id')
  if (!id) {
    throw new HTTPException(400, { message: 'ID parameter is missing' })
  }

  const entries = await db.select()
    .from(adminWhitelist)
    .where(eq(adminWhitelist.id, id))
    .limit(1)

  const entry = entries[0]
  if (!entry) {
    throw new HTTPException(404, { message: 'Whitelist entry not found' })
  }

  if (entry.email.toLowerCase() === user.email.toLowerCase()) {
    throw new HTTPException(403, { message: 'Action prohibited' })
  }

  await db.transaction(async (tx) => {
    await tx.delete(adminWhitelist)
      .where(eq(adminWhitelist.id, id))
    await tx.delete(adminUsers)
      .where(eq(adminUsers.email, entry.email))
  })

  return c.json({ message: 'Email removed from whitelist and account deleted successfully', email: entry.email })
}
