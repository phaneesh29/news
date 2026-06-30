import { z } from 'zod'

export const draftRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
})

export const draftDocRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string()
  })).min(1, 'Messages are required'),
})
