import { Context } from 'hono'
import { desc, eq, lt, or, and, ilike } from 'drizzle-orm'
import { db } from '../db/index.js'
import { adminUsers, blogs } from '../db/schema.js'

const canManageBlogs = (role: string) => role === 'admin' || role === 'editor'

const blogSelect = {
  id: blogs.id,
  title: blogs.title,
  slug: blogs.slug,
  content: blogs.content,
  authorId: blogs.authorId,
  isPublished: blogs.isPublished,
  createdAt: blogs.createdAt,
  updatedAt: blogs.updatedAt,
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

export const createBlog = async (c: Context) => {
  try {
    const user = c.get('user')

    if (!canManageBlogs(user.role)) {
      return c.json({ error: 'Only admins and editors can create blogs' }, 403)
    }

    const body = await c.req.json() as {
      title: string
      slug: string
      content: string
    }

    const insertedBlog = await db.insert(blogs)
      .values({
        title: body.title,
        slug: body.slug,
        content: body.content,
        authorId: user.id
      })
      .returning()

    const blog = insertedBlog[0]

    if (!blog) {
      return c.json({ error: 'Blog could not be created' }, 500)
    }

    return c.json({ message: 'Blog created successfully', blog }, 201)
  } catch (error: any) {
    console.error('Create Blog Error:', error)
    if (error.code === '23505') {
      return c.json({ error: 'Slug already exists' }, 409)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const getAllBlogs = async (c: Context) => {
  try {
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100)
    const cursorParam = c.req.query('cursor')

    const decoded = cursorParam ? decodeCursor(cursorParam) : null

    let condition = undefined
    if (decoded) {
      condition = or(
        lt(blogs.createdAt, decoded.createdAt),
        and(
          eq(blogs.createdAt, decoded.createdAt),
          lt(blogs.id, decoded.id)
        )
      )
    }

    const blogItems = await db.select(blogSelect)
      .from(blogs)
      .leftJoin(adminUsers, eq(blogs.authorId, adminUsers.id))
      .where(condition)
      .orderBy(desc(blogs.createdAt), desc(blogs.id))
      .limit(limit + 1)

    const hasNextPage = blogItems.length > limit
    const results = hasNextPage ? blogItems.slice(0, limit) : blogItems

    const lastItem = results[results.length - 1]
    const nextCursor = hasNextPage && lastItem
      ? encodeCursor(lastItem.createdAt!, lastItem.id!)
      : null

    return c.json({
      blogs: results,
      nextCursor
    })
  } catch (error: any) {
    console.error('Get All Blogs Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const searchBlogs = async (c: Context) => {
  try {
    const query = (c.req as any).valid('query')
    const search = query.q || ''
    const limit = query.limit

    const blogResults = await db.select(blogSelect)
      .from(blogs)
      .leftJoin(adminUsers, eq(blogs.authorId, adminUsers.id))
      .where(
        or(
          ilike(blogs.title, `%${search}%`),
          ilike(blogs.content, `%${search}%`),
          ilike(blogs.slug, `%${search}%`)
        )
      )
      .orderBy(desc(blogs.createdAt))
      .limit(limit)

    return c.json({ blogs: blogResults })
  } catch (error: any) {
    console.error('Search Blogs Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const getBlogById = async (c: Context) => {
  try {
    const id = c.req.param('id')!

    const blogItems = await db.select(blogSelect)
      .from(blogs)
      .leftJoin(adminUsers, eq(blogs.authorId, adminUsers.id))
      .where(eq(blogs.id, id))
      .limit(1)

    const blog = blogItems[0]

    if (!blog) {
      return c.json({ error: 'Blog not found' }, 404)
    }

    return c.json({ blog })
  } catch (error: any) {
    console.error('Get Blog Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const updateBlog = async (c: Context) => {
  try {
    const user = c.get('user')

    if (!canManageBlogs(user.role)) {
      return c.json({ error: 'Only admins and editors can update blogs' }, 403)
    }

    const id = c.req.param('id')!

    const body = await c.req.json() as {
      title?: string
      slug?: string
      content?: string
      isPublished?: boolean
    }

    const updates: Partial<typeof blogs.$inferInsert> = {
      updatedAt: new Date()
    }

    if (body.title !== undefined) updates.title = body.title
    if (body.slug !== undefined) updates.slug = body.slug
    if (body.content !== undefined) updates.content = body.content
    if (body.isPublished !== undefined) updates.isPublished = body.isPublished

    const updatedBlog = await db.update(blogs)
      .set(updates)
      .where(eq(blogs.id, id))
      .returning()

    const blog = updatedBlog[0]

    if (!blog) {
      return c.json({ error: 'Blog not found' }, 404)
    }

    return c.json({ message: 'Blog updated successfully', blog })
  } catch (error: any) {
    console.error('Update Blog Error:', error)
    if (error.code === '23505') {
      return c.json({ error: 'Slug already exists' }, 409)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export const deleteBlog = async (c: Context) => {
  try {
    const user = c.get('user')

    if (!canManageBlogs(user.role)) {
      return c.json({ error: 'Only admins and editors can delete blogs' }, 403)
    }

    const id = c.req.param('id')!

    const deletedBlog = await db.delete(blogs)
      .where(eq(blogs.id, id))
      .returning({ id: blogs.id })

    const blog = deletedBlog[0]

    if (!blog) {
      return c.json({ error: 'Blog not found' }, 404)
    }

    return c.json({ message: 'Blog deleted successfully', id: blog.id })
  } catch (error: any) {
    console.error('Delete Blog Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
