import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createNews, deleteNews, getAllNews, getNewsById, updateNews, searchNews } from '../controllers/news.js'
import { requireAuth } from '../middlewares/auth.js'

export const newsRoutes = new Hono()

const newsPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])

const createNewsSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  content: z.string().trim().min(1, 'Content is required'),
  sourceUrl: z.url('Invalid source URL').max(512).nullable().optional(),
  priority: newsPrioritySchema.optional(),
  tags: z.array(z.string()).optional()
})

const updateNewsSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').optional(),
  content: z.string().trim().min(1, 'Content is required').optional(),
  sourceUrl: z.url('Invalid source URL').max(512).nullable().optional(),
  priority: newsPrioritySchema.optional(),
  tags: z.array(z.string()).optional()
}).refine((body) => Object.keys(body).length > 0, {
  message: 'At least one field is required'
})

const paramsSchema = z.object({
  id: z.uuid('Invalid news ID')
})

const searchQuerySchema = z.object({
  q: z.string().optional().default(''),
  limit: z.string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
})

newsRoutes.use('*', requireAuth)

newsRoutes.get('/', getAllNews)
newsRoutes.get('/search', zValidator('query', searchQuerySchema), searchNews)
newsRoutes.post('/', zValidator('query', createNewsSchema), createNews)
newsRoutes.get('/:id', zValidator('param', paramsSchema), getNewsById)
newsRoutes.patch('/:id', zValidator('param', paramsSchema), zValidator('json', updateNewsSchema), updateNews)
newsRoutes.delete('/:id', zValidator('param', paramsSchema), deleteNews)
