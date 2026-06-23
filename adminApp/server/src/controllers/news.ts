import { Context } from 'hono'
import { desc, eq, lt, or, and, ilike, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { adminUsers, devNews } from '../db/schema.js'
import { newsLikes } from '../db/userSchema.js'
import { HTTPException } from 'hono/http-exception'

const canManageNews = (role: string) => role === 'admin' || role === 'editor'

const newsSelect = {
  id: devNews.id,
  title: devNews.title,
  content: devNews.content,
  sourceUrl: devNews.sourceUrl,
  priority: devNews.priority,
  tags: devNews.tags,
  authorId: devNews.authorId,
  isPublished: devNews.isPublished,
  createdAt: devNews.createdAt,
  updatedAt: devNews.updatedAt,
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

export const createNews = async (c: Context) => {
  const user = c.get('user')

  if (!canManageNews(user.role)) {
    throw new HTTPException(403, { message: 'Only admins and editors can create news' })
  }

  const body = await c.req.json() as {
    title: string
    content: string
    sourceUrl?: string | null
    priority?: 'low' | 'medium' | 'high' | 'critical'
    tags?: string[]
    isPublished?: boolean
  }

  const insertedNews = await db.insert(devNews)
    .values({
      title: body.title,
      content: body.content,
      sourceUrl: body.sourceUrl ?? null,
      priority: body.priority ?? 'low',
      tags: body.tags ?? [],
      isPublished: body.isPublished ?? false,
      authorId: user.id
    })
    .returning()

  const news = insertedNews[0]

  if (!news) {
    throw new HTTPException(500, { message: 'News could not be created' })
  }

  return c.json({ message: 'News created successfully', news }, 201)
}

export const getAllNews = async (c: Context) => {
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100)
  const cursorParam = c.req.query('cursor')

  const decoded = cursorParam ? decodeCursor(cursorParam) : null

  let condition = undefined
  if (decoded) {
    condition = or(
      lt(devNews.createdAt, decoded.createdAt),
      and(
        eq(devNews.createdAt, decoded.createdAt),
        lt(devNews.id, decoded.id)
      )
    )
  }

  const user = c.get('user')
  const isAdmin = user?.role === 'admin'

  let newsItems
  if (isAdmin) {
    newsItems = await db.select({
      ...newsSelect,
      likesCount: sql<number>`cast(count(${newsLikes.userId}) as integer)`.as('likes_count')
    })
    .from(devNews)
    .leftJoin(adminUsers, eq(devNews.authorId, adminUsers.id))
    .leftJoin(newsLikes, eq(devNews.id, newsLikes.newsId))
    .where(condition)
    .groupBy(devNews.id, adminUsers.email)
    .orderBy(desc(devNews.createdAt), desc(devNews.id))
    .limit(limit + 1)
  } else {
    newsItems = await db.select(newsSelect)
      .from(devNews)
      .leftJoin(adminUsers, eq(devNews.authorId, adminUsers.id))
      .where(condition)
      .orderBy(desc(devNews.createdAt), desc(devNews.id))
      .limit(limit + 1)
  }

  const hasNextPage = newsItems.length > limit
  const results = hasNextPage ? newsItems.slice(0, limit) : newsItems

  const lastItem = results[results.length - 1]
  const nextCursor = hasNextPage && lastItem
    ? encodeCursor(lastItem.createdAt!, lastItem.id!)
    : null

  return c.json({
    news: results,
    nextCursor
  })
}

export const searchNews = async (c: Context) => {
  const query = (c.req as any).valid('query')
  const search = query.q || ''
  const limit = query.limit

  const user = c.get('user')
  const isAdmin = user?.role === 'admin'

  let news
  if (isAdmin) {
    news = await db.select({
      ...newsSelect,
      likesCount: sql<number>`cast(count(${newsLikes.userId}) as integer)`.as('likes_count')
    })
    .from(devNews)
    .leftJoin(adminUsers, eq(devNews.authorId, adminUsers.id))
    .leftJoin(newsLikes, eq(devNews.id, newsLikes.newsId))
    .where(
      or(
        ilike(devNews.content, `%${search}%`),
        ilike(devNews.sourceUrl, `%${search}%`)
      )
    )
    .groupBy(devNews.id, adminUsers.email)
    .orderBy(desc(devNews.createdAt))
    .limit(limit)
  } else {
    news = await db.select(newsSelect)
      .from(devNews)
      .leftJoin(adminUsers, eq(devNews.authorId, adminUsers.id))
      .where(
        or(
          ilike(devNews.content, `%${search}%`),
          ilike(devNews.sourceUrl, `%${search}%`)
        )
      )
      .orderBy(desc(devNews.createdAt))
      .limit(limit)
  }

  return c.json({ news })
}

export const getNewsById = async (c: Context) => {
  const id = c.req.param('id')!

  const user = c.get('user')
  const isAdmin = user?.role === 'admin'

  let newsItems
  if (isAdmin) {
    newsItems = await db.select({
      ...newsSelect,
      likesCount: sql<number>`cast(count(${newsLikes.userId}) as integer)`.as('likes_count')
    })
    .from(devNews)
    .leftJoin(adminUsers, eq(devNews.authorId, adminUsers.id))
    .leftJoin(newsLikes, eq(devNews.id, newsLikes.newsId))
    .where(eq(devNews.id, id))
    .groupBy(devNews.id, adminUsers.email)
    .limit(1)
  } else {
    newsItems = await db.select(newsSelect)
      .from(devNews)
      .leftJoin(adminUsers, eq(devNews.authorId, adminUsers.id))
      .where(eq(devNews.id, id))
      .limit(1)
  }

  const news = newsItems[0]

  if (!news) {
    throw new HTTPException(404, { message: 'News not found' })
  }

  return c.json({ news })
}

export const updateNews = async (c: Context) => {
  const user = c.get('user')

  if (!canManageNews(user.role)) {
    throw new HTTPException(403, { message: 'Only admins and editors can update news' })
  }

  const id = c.req.param('id')!

  const body = await c.req.json() as {
    title?: string
    content?: string
    sourceUrl?: string | null
    priority?: 'low' | 'medium' | 'high' | 'critical'
    tags?: string[]
    isPublished?: boolean
  }

  const updates: Partial<typeof devNews.$inferInsert> = {
    updatedAt: new Date()
  }

  if (body.title !== undefined) {
    updates.title = body.title
  }

  if (body.content !== undefined) {
    updates.content = body.content
  }

  if (body.sourceUrl !== undefined) {
    updates.sourceUrl = body.sourceUrl
  }

  if (body.priority !== undefined) {
    updates.priority = body.priority
  }

  if (body.tags !== undefined) {
    updates.tags = body.tags
  }

  if (body.isPublished !== undefined) {
    updates.isPublished = body.isPublished
  }

  const updatedNews = await db.update(devNews)
    .set(updates)
    .where(eq(devNews.id, id))
    .returning()

  const news = updatedNews[0]

  if (!news) {
    throw new HTTPException(404, { message: 'News not found' })
  }

  return c.json({ message: 'News updated successfully', news })
}

export const deleteNews = async (c: Context) => {
  const user = c.get('user')

  if (!canManageNews(user.role)) {
    throw new HTTPException(403, { message: 'Only admins and editors can delete news' })
  }

  const id = c.req.param('id')!

  const deletedNews = await db.delete(devNews)
    .where(eq(devNews.id, id))
    .returning({ id: devNews.id })

  const news = deletedNews[0]

  if (!news) {
    throw new HTTPException(404, { message: 'News not found' })
  }

  return c.json({ message: 'News deleted successfully', id: news.id })
}
