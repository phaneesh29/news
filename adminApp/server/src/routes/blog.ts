import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createBlog, deleteBlog, getAllBlogs, getBlogBySlug, updateBlog, searchBlogs } from '../controllers/blog.js'
import { requireAuth } from '../middlewares/auth.js'
import { createBlogSchema, updateBlogSchema, blogParamsSchema, blogSearchQuerySchema } from '../schemas/blog.js'

export const blogRoutes = new Hono()

blogRoutes.use('*', requireAuth)

blogRoutes.get('/', getAllBlogs)
blogRoutes.get('/search', zValidator('query', blogSearchQuerySchema), searchBlogs)
blogRoutes.post('/', zValidator('json', createBlogSchema), createBlog)
blogRoutes.get('/:slug', zValidator('param', blogParamsSchema), getBlogBySlug)
blogRoutes.patch('/:slug', zValidator('param', blogParamsSchema), zValidator('json', updateBlogSchema), updateBlog)
blogRoutes.delete('/:slug', zValidator('param', blogParamsSchema), deleteBlog)
