import { Hono } from 'hono'
import { requireAuth } from '../middlewares/auth.js'
import { getFeedbacks } from '../controllers/feedback.js'

export const feedbackRoutes = new Hono()

feedbackRoutes.use('*', requireAuth)
feedbackRoutes.get('/', getFeedbacks)
