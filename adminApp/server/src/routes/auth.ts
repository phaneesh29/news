import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requestOtp, verifyOtp, logout, getProfile, getSessions, revokeAllSessions } from '../controllers/auth.js'
import { requireAuth } from '../middlewares/auth.js'
import { requestOtpSchema, verifyOtpSchema } from '../schemas/auth.js'

export const authRoutes = new Hono()

authRoutes.post('/request-otp', zValidator('json', requestOtpSchema), requestOtp)
authRoutes.post('/verify-otp', zValidator('json', verifyOtpSchema), verifyOtp)

authRoutes.post('/logout', requireAuth, logout)
authRoutes.get('/profile', requireAuth, getProfile)
authRoutes.get('/sessions', requireAuth, getSessions)
authRoutes.post('/sessions/revoke-all', requireAuth, revokeAllSessions)
