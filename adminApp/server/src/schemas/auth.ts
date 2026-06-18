import { z } from 'zod'

export const requestOtpSchema = z.object({
  email: z.email('Invalid email address')
})

export const verifyOtpSchema = z.object({
  email: z.email('Invalid email address'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits')
})
