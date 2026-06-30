import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { draftNews, draftBlog, draftDoc } from '../controllers/agent.js'
import { agentRequestSchema } from '../schemas/agent.js'

export const agentRoutes = new Hono()

agentRoutes.post('/draft/news', zValidator('json', agentRequestSchema), draftNews)
agentRoutes.post('/draft/blog', zValidator('json', agentRequestSchema), draftBlog)
agentRoutes.post('/draft/doc', zValidator('json', agentRequestSchema), draftDoc)
