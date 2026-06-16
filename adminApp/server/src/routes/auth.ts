import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requestOtp, verifyOtp, logout, getProfile, getSessions } from '../controllers/auth.js'
import { requireAuth } from '../middlewares/auth.js'

export const authRoutes = new Hono()

const requestOtpSchema = z.object({
  email: z.string().email('Invalid email address')
})

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits')
})

authRoutes.post('/request-otp', zValidator('json', requestOtpSchema), requestOtp)
authRoutes.post('/verify-otp', zValidator('json', verifyOtpSchema), verifyOtp)

authRoutes.post('/logout', requireAuth, logout)
authRoutes.get('/profile', requireAuth, getProfile)
authRoutes.get('/sessions', requireAuth, getSessions)
