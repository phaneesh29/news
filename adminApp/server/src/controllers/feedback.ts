import { Context } from 'hono'
import { desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { feedbacks } from '../db/userSchema.js'

export const getFeedbacks = async (c: Context) => {
  try {
    const adminUser = c.get('user')

    if (adminUser.role !== 'admin') {
      return c.json({ error: 'Forbidden: Only admin can view feedback' }, 403)
    }

    const feedbackList = await db.select({
      id: feedbacks.id,
      email: feedbacks.email,
      message: feedbacks.message,
      createdAt: feedbacks.createdAt
    })
    .from(feedbacks)
    .orderBy(desc(feedbacks.createdAt))

    return c.json({ feedbacks: feedbackList })
  } catch (error: any) {
    console.error('Get Feedbacks Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
