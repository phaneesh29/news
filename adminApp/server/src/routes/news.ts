import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createNews, deleteNews, getAllNews, getNewsById, updateNews, searchNews } from '../controllers/news.js'
import { requireAuth } from '../middlewares/auth.js'
import { createNewsSchema, updateNewsSchema, paramsSchema, searchQuerySchema } from '../schemas/news.js'

export const newsRoutes = new Hono()

newsRoutes.use('*', requireAuth)

newsRoutes.get('/', getAllNews)
newsRoutes.get('/search', zValidator('query', searchQuerySchema), searchNews)
newsRoutes.post('/', zValidator('json', createNewsSchema), createNews)
newsRoutes.get('/:id', zValidator('param', paramsSchema), getNewsById)
newsRoutes.patch('/:id', zValidator('param', paramsSchema), zValidator('json', updateNewsSchema), updateNews)
newsRoutes.delete('/:id', zValidator('param', paramsSchema), deleteNews)
