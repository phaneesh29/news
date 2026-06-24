import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createDoc, deleteDoc, getAllDocs, getDocById, updateDoc, searchDocs } from '../controllers/doc.js'
import { requireAuth } from '../middlewares/auth.js'
import { createDocSchema, updateDocSchema, docParamsSchema, docSearchQuerySchema } from '../schemas/doc.js'

export const docRoutes = new Hono()

docRoutes.use('*', requireAuth)

docRoutes.get('/', getAllDocs)
docRoutes.get('/search', zValidator('query', docSearchQuerySchema), searchDocs)
docRoutes.post('/', zValidator('json', createDocSchema), createDoc)
docRoutes.get('/:id', zValidator('param', docParamsSchema), getDocById)
docRoutes.patch('/:id', zValidator('param', docParamsSchema), zValidator('json', updateDocSchema), updateDoc)
docRoutes.delete('/:id', zValidator('param', docParamsSchema), deleteDoc)
