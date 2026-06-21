import { Hono } from 'hono'
import { getDigest } from '../controllers/digest.js'
import { requireAuth } from '../middlewares/auth.js'

export const digestRoutes = new Hono()

digestRoutes.use('*', requireAuth)
digestRoutes.get('/', getDigest)
