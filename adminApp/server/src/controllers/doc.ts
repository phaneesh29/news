import { Context } from 'hono'
import { desc, eq, lt, or, and, ilike, isNull } from 'drizzle-orm'
import { db } from '../db/index.js'
import { adminUsers, docs } from '../db/schema.js'
import { HTTPException } from 'hono/http-exception'

const canManageDocs = (role: string) => role === 'admin' || role === 'editor'

const docSelect = {
  id: docs.id,
  title: docs.title,
  slug: docs.slug,
  content: docs.content,
  parentId: docs.parentId,
  orderIndex: docs.orderIndex,
  authorId: docs.authorId,
  isPublished: docs.isPublished,
  createdAt: docs.createdAt,
  updatedAt: docs.updatedAt,
  authorEmail: adminUsers.email
}

const encodeCursor = (createdAt: Date, id: string) => {
  const data = JSON.stringify({ createdAt: createdAt.toISOString(), id })
  return Buffer.from(data).toString('base64')
}

const decodeCursor = (cursorStr: string) => {
  try {
    const data = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf-8'))
    return {
      createdAt: new Date(data.createdAt),
      id: data.id as string
    }
  } catch {
    return null
  }
}

export const createDoc = async (c: Context) => {
  const user = c.get('user')

  if (!canManageDocs(user.role)) {
    throw new HTTPException(403, { message: 'Only admins and editors can create docs' })
  }

  const body = await c.req.json() as {
    title: string
    slug: string
    content: string
    parentId?: string | null
    orderIndex?: number
  }

  let insertedDoc
  try {
    insertedDoc = await db.insert(docs)
      .values({
        title: body.title,
        slug: body.slug,
        content: body.content,
        parentId: body.parentId || null,
        orderIndex: body.orderIndex ?? 0,
        authorId: user.id
      }).returning()
  } catch (error: any) {
    if (error.code === '23505') {
      throw new HTTPException(409, { message: 'Slug already exists' })
    }
    throw error
  }

  const doc = insertedDoc[0]

  if (!doc) {
    throw new HTTPException(500, { message: 'Doc could not be created' })
  }

  return c.json({ message: 'Doc created successfully', doc }, 201)
}

export const getAllDocs = async (c: Context) => {
  const parentIdParam = c.req.query('parentId')
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100)
  const cursorParam = c.req.query('cursor')

  const decoded = cursorParam ? decodeCursor(cursorParam) : null

  let condition = undefined

  const parentCondition = parentIdParam === 'null'
    ? isNull(docs.parentId)
    : parentIdParam
      ? eq(docs.parentId, parentIdParam)
      : undefined

  if (decoded) {
    const cursorCondition = or(
      lt(docs.createdAt, decoded.createdAt),
      and(
        eq(docs.createdAt, decoded.createdAt),
        lt(docs.id, decoded.id)
      )
    )
    condition = parentCondition ? and(parentCondition, cursorCondition) : cursorCondition
  } else {
    condition = parentCondition
  }

  const docItems = await db.select(docSelect)
    .from(docs)
    .leftJoin(adminUsers, eq(docs.authorId, adminUsers.id))
    .where(condition)
    .orderBy(desc(docs.createdAt), desc(docs.id))
    .limit(limit + 1)

  const hasNextPage = docItems.length > limit
  const results = hasNextPage ? docItems.slice(0, limit) : docItems

  const lastItem = results[results.length - 1]
  const nextCursor = hasNextPage && lastItem
    ? encodeCursor(lastItem.createdAt!, lastItem.id!)
    : null

  return c.json({
    docs: results,
    nextCursor
  })
}

export const searchDocs = async (c: Context) => {
  const query = (c.req as any).valid('query')
  const search = query.q || ''
  const limit = query.limit

  const docResults = await db.select(docSelect)
    .from(docs)
    .leftJoin(adminUsers, eq(docs.authorId, adminUsers.id))
    .where(
      or(
        ilike(docs.title, `%${search}%`),
        ilike(docs.content, `%${search}%`),
        ilike(docs.slug, `%${search}%`)
      )
    )
    .orderBy(desc(docs.createdAt))
    .limit(limit)

  return c.json({ docs: docResults })
}

export const getDocById = async (c: Context) => {
  const id = c.req.param('id')!

  const docItems = await db.select(docSelect)
    .from(docs)
    .leftJoin(adminUsers, eq(docs.authorId, adminUsers.id))
    .where(eq(docs.id, id))
    .limit(1)

  const doc = docItems[0]

  if (!doc) {
    throw new HTTPException(404, { message: 'Doc not found' })
  }

  return c.json({ doc })
}

export const updateDoc = async (c: Context) => {
  const user = c.get('user')

  if (!canManageDocs(user.role)) {
    throw new HTTPException(403, { message: 'Only admins and editors can update docs' })
  }

  const id = c.req.param('id')!

  const body = await c.req.json() as {
    title?: string
    slug?: string
    content?: string
    parentId?: string | null
    orderIndex?: number
    isPublished?: boolean
  }

  const updates: Partial<typeof docs.$inferInsert> = {
    updatedAt: new Date()
  }

  if (body.title !== undefined) updates.title = body.title
  if (body.slug !== undefined) updates.slug = body.slug
  if (body.content !== undefined) updates.content = body.content
  if (body.parentId !== undefined) updates.parentId = body.parentId
  if (body.orderIndex !== undefined) updates.orderIndex = body.orderIndex
  if (body.isPublished !== undefined) updates.isPublished = body.isPublished

  let updatedDoc
  try {
    updatedDoc = await db.update(docs)
      .set(updates)
      .where(eq(docs.id, id))
      .returning()
  } catch (error: any) {
    if (error.code === '23505') {
      throw new HTTPException(409, { message: 'Slug already exists' })
    }
    throw error
  }

  const doc = updatedDoc[0]

  if (!doc) {
    throw new HTTPException(404, { message: 'Doc not found' })
  }

  return c.json({ message: 'Doc updated successfully', doc })
}

export const deleteDoc = async (c: Context) => {
  const user = c.get('user')

  if (!canManageDocs(user.role)) {
    throw new HTTPException(403, { message: 'Only admins and editors can delete docs' })
  }

  const id = c.req.param('id')!

  const deletedDoc = await db.delete(docs)
    .where(eq(docs.id, id))
    .returning({ id: docs.id })

  const doc = deletedDoc[0]

  if (!doc) {
    throw new HTTPException(404, { message: 'Doc not found' })
  }

  return c.json({ message: 'Doc deleted successfully', id: doc.id })
}
