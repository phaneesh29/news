import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { draftNews } from '../controllers/agent.js'
import { draftRequestSchema } from '../schemas/agent.js'

export const agentRoutes = new Hono()

agentRoutes.post('/draft', zValidator('json', draftRequestSchema), draftNews)
