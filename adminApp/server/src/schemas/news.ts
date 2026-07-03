import { z } from 'zod'

export const newsPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])

export const createNewsSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  content: z.string().trim().min(1, 'Content is required'),
  sourceUrl: z.url('Invalid source URL').max(512).nullable().optional(),
  priority: newsPrioritySchema.optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional()
})

export const updateNewsSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').optional(),
  content: z.string().trim().min(1, 'Content is required').optional(),
  sourceUrl: z.url('Invalid source URL').max(512).nullable().optional(),
  priority: newsPrioritySchema.optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional()
}).refine((body) => Object.keys(body).length > 0, {
  message: 'At least one field is required'
})

export const paramsSchema = z.object({
  id: z.uuid('Invalid news ID')
})

export const searchQuerySchema = z.object({
  q: z.string().optional().default(''),
  limit: z.string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
})

export const checkSimilaritySchema = z.object({
  content: z.string().trim().min(1, 'Content is required for similarity check')
})
