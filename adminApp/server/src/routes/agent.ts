import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { draftNews, draftBlog } from '../controllers/agent.js'
import { draftRequestSchema } from '../schemas/agent.js'

export const agentRoutes = new Hono()

agentRoutes.post('/draft/news', zValidator('json', draftRequestSchema), draftNews)
agentRoutes.post('/draft/blog', zValidator('json', draftRequestSchema), draftBlog)
