import { Context } from 'hono'
import { newsDraftAgent } from '../lib/agents/news-agent.js'
import { blogDraftAgent } from '../lib/agents/blog-agent.js'

export const draftNews = async (c: Context) => {
  const { query } = (c.req as any).valid('json') as { query: string }

  const result = await newsDraftAgent.generate({
    prompt: query,
  })

  return c.json({
    success: true,
    draft: result.output,
  })
}

export const draftBlog = async (c: Context) => {
  const { query } = (c.req as any).valid('json') as { query: string }

  const result = await blogDraftAgent.generate({
    prompt: query,
  })

  return c.json({
    success: true,
    draft: result.output,
  })
}
