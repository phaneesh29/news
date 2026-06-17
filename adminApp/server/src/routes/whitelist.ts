import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { addWhitelistEmail, getWhitelistEmails, deleteWhitelistEmail } from '../controllers/whitelist.js'
import { requireAuth } from '../middlewares/auth.js'

export const whitelistRoutes = new Hono()

const addWhitelistSchema = z.object({
  email: z.email('Invalid email address')
})

whitelistRoutes.use('*', requireAuth)

whitelistRoutes.get('/', getWhitelistEmails)
whitelistRoutes.post('/', zValidator('json', addWhitelistSchema), addWhitelistEmail)
whitelistRoutes.delete('/:id', deleteWhitelistEmail)
