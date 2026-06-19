import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog, searchBlogs } from '../controllers/blog.js'
import { requireAuth } from '../middlewares/auth.js'
import { createBlogSchema, updateBlogSchema, blogParamsSchema, blogSearchQuerySchema } from '../schemas/blog.js'

export const blogRoutes = new Hono()

blogRoutes.use('*', requireAuth)

blogRoutes.get('/', getAllBlogs)
blogRoutes.get('/search', zValidator('query', blogSearchQuerySchema), searchBlogs)
blogRoutes.post('/', zValidator('json', createBlogSchema), createBlog)
blogRoutes.get('/:id', zValidator('param', blogParamsSchema), getBlogById)
blogRoutes.patch('/:id', zValidator('param', blogParamsSchema), zValidator('json', updateBlogSchema), updateBlog)
blogRoutes.delete('/:id', zValidator('param', blogParamsSchema), deleteBlog)
