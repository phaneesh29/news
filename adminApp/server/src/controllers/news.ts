import { Context } from 'hono'
import { desc, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { adminUsers, devNews } from '../db/schema.js'

const canManageNews = (role: string) => role === 'admin' || role === 'editor'

const newsSelect = {
  id: devNews.id,
  content: devNews.content,
  sourceUrl: devNews.sourceUrl,
  priority: devNews.priority,
  authorId: devNews.authorId,
  createdAt: devNews.createdAt,
  updatedAt: devNews.updatedAt,
  authorEmail: adminUsers.email
}

export const createNews = async (c: Context) => {
  try {
    const user = c.get('user')

    if (!canManageNews(user.role)) {
      return c.json({ error: 'Only admins and editors can create news' }, 403)
    }

    const body = await c.req.json() as {
      content: string
      sourceUrl?: string | null
      priority?: 'low' | 'medium' | 'high' | 'critical'
    }

    const insertedNews = await db.insert(devNews)
      .values({
        content: body.content,
        sourceUrl: body.sourceUrl ?? null,
        priority: body.priority ?? 'low',
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
    const news = await db.select(newsSelect)
      .from(devNews)
      .leftJoin(adminUsers, eq(devNews.authorId, adminUsers.id))
      .orderBy(desc(devNews.createdAt))

    return c.json({ news })
  } catch (error: any) {
    console.error('Get All News Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const getNewsById = async (c: Context) => {
  try {
    const id = c.req.param('id')
    if (!id) {
      return c.json({ error: 'ID parameter is missing' }, 400)
    }

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

    const id = c.req.param('id')
    if (!id) {
      return c.json({ error: 'ID parameter is missing' }, 400)
    }

    const body = await c.req.json() as {
      content?: string
      sourceUrl?: string | null
      priority?: 'low' | 'medium' | 'high' | 'critical'
    }

    const updates: Partial<typeof devNews.$inferInsert> = {
      updatedAt: new Date()
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

    const id = c.req.param('id')
    if (!id) {
      return c.json({ error: 'ID parameter is missing' }, 400)
    }

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
