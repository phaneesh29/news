import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { addWhitelistEmail, getWhitelistEmails, deleteWhitelistEmail } from '../controllers/whitelist.js'
import { requireAuth } from '../middlewares/auth.js'
import { addWhitelistSchema } from '../schemas/whitelist.js'

export const whitelistRoutes = new Hono()

whitelistRoutes.use('*', requireAuth)

whitelistRoutes.get('/', getWhitelistEmails)
whitelistRoutes.post('/', zValidator('json', addWhitelistSchema), addWhitelistEmail)
whitelistRoutes.delete('/:id', deleteWhitelistEmail)
