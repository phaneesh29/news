import { z } from 'zod'

export const addWhitelistSchema = z.object({
  email: z.email('Invalid email address')
})
