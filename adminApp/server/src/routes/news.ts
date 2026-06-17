import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createNews, deleteNews, getAllNews, getNewsById, updateNews } from '../controllers/news.js'
import { requireAuth } from '../middlewares/auth.js'

export const newsRoutes = new Hono()

const newsPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])

const createNewsSchema = z.object({
  content: z.string().trim().min(1, 'Content is required'),
  sourceUrl: z.url('Invalid source URL').max(512).nullable().optional(),
  priority: newsPrioritySchema.optional()
})

const updateNewsSchema = z.object({
  content: z.string().trim().min(1, 'Content is required').optional(),
  sourceUrl: z.url('Invalid source URL').max(512).nullable().optional(),
  priority: newsPrioritySchema.optional()
}).refine((body) => Object.keys(body).length > 0, {
  message: 'At least one field is required'
})

const paramsSchema = z.object({
  id: z.uuid('Invalid news ID')
})

newsRoutes.use('*', requireAuth)

newsRoutes.get('/', getAllNews)
newsRoutes.post('/', zValidator('json', createNewsSchema), createNews)
newsRoutes.get('/:id', zValidator('param', paramsSchema), getNewsById)
newsRoutes.patch('/:id', zValidator('param', paramsSchema), zValidator('json', updateNewsSchema), updateNews)
newsRoutes.delete('/:id', zValidator('param', paramsSchema), deleteNews)
