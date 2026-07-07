import { z } from 'zod'

export const createBlogSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z.string().trim().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  content: z.string().trim().min(1, 'Content is required'),
})

export const updateBlogSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').optional(),
  slug: z.string().trim().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format').optional(),
  content: z.string().trim().min(1, 'Content is required').optional(),
  isPublished: z.boolean().optional()
}).refine((body) => Object.keys(body).length > 0, {
  message: 'At least one field is required'
})

export const blogParamsSchema = z.object({
  slug: z.string().trim().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
})

export const blogSearchQuerySchema = z.object({
  q: z.string().optional().default(''),
  limit: z.string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
})
