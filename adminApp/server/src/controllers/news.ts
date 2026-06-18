import { Context } from 'hono'
import { desc, eq, lt, or, and, ilike } from 'drizzle-orm'
import { db } from '../db/index.js'
import { adminUsers, devNews } from '../db/schema.js'

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
  try {
    const user = c.get('user')

    if (!canManageNews(user.role)) {
      return c.json({ error: 'Only admins and editors can create news' }, 403)
    }

    const body = await c.req.json() as {
      title: string
      content: string
      sourceUrl?: string | null
      priority?: 'low' | 'medium' | 'high' | 'critical'
      tags?: string[]
    }

    const insertedNews = await db.insert(devNews)
      .values({
        title: body.title,
        content: body.content,
        sourceUrl: body.sourceUrl ?? null,
        priority: body.priority ?? 'low',
        tags: body.tags ?? [],
        authorId: user.id
      })
      .returning()

    const news = insertedNews[0]

    if (!news) {
      return c.json({ error: 'News could not be created' }, 500)
    }

    return c.json({ message: 'News created successfully', news }, 201)
  } catch (error: any) {
    console.error('Create News Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const getAllNews = async (c: Context) => {
  try {
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

    const newsItems = await db.select(newsSelect)
      .from(devNews)
      .leftJoin(adminUsers, eq(devNews.authorId, adminUsers.id))
      .where(condition)
      .orderBy(desc(devNews.createdAt), desc(devNews.id))
      .limit(limit + 1)

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
  } catch (error: any) {
    console.error('Get All News Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const searchNews = async (c: Context) => {
  try {
    const query = (c.req as any).valid('query')
    const search = query.q || ''
    const limit = query.limit

    const news = await db.select(newsSelect)
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

    return c.json({ news })
  } catch (error: any) {
    console.error('Search News Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const getNewsById = async (c: Context) => {
  try {
    const id = c.req.param('id')!

    const newsItems = await db.select(newsSelect)
      .from(devNews)
      .leftJoin(adminUsers, eq(devNews.authorId, adminUsers.id))
      .where(eq(devNews.id, id))
      .limit(1)

    const news = newsItems[0]

    if (!news) {
      return c.json({ error: 'News not found' }, 404)
    }

    return c.json({ news })
  } catch (error: any) {
    console.error('Get News Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const updateNews = async (c: Context) => {
  try {
    const user = c.get('user')

    if (!canManageNews(user.role)) {
      return c.json({ error: 'Only admins and editors can update news' }, 403)
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
      return c.json({ error: 'News not found' }, 404)
    }

    return c.json({ message: 'News updated successfully', news })
  } catch (error: any) {
    console.error('Update News Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const deleteNews = async (c: Context) => {
  try {
    const user = c.get('user')

    if (!canManageNews(user.role)) {
      return c.json({ error: 'Only admins and editors can delete news' }, 403)
    }

    const id = c.req.param('id')!

    const deletedNews = await db.delete(devNews)
      .where(eq(devNews.id, id))
      .returning({ id: devNews.id })

    const news = deletedNews[0]

    if (!news) {
      return c.json({ error: 'News not found' }, 404)
    }

    return c.json({ message: 'News deleted successfully', id: news.id })
  } catch (error: any) {
    console.error('Delete News Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
