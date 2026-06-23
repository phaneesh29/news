import { Context } from 'hono'
import { desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { feedbacks } from '../db/userSchema.js'
import { HTTPException } from 'hono/http-exception'

export const getFeedbacks = async (c: Context) => {
  const adminUser = c.get('user')

  if (adminUser.role !== 'admin') {
    throw new HTTPException(403, { message: 'Forbidden: Only admin can view feedback' })
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
}
