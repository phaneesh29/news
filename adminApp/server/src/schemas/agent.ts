import { z } from 'zod'

export const agentRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string()
  })).min(1, 'Messages are required'),
})
