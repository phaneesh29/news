import { Context } from 'hono'
import { newsDraftAgent } from '../lib/agents/news-agent.js'
import { blogDraftAgent } from '../lib/agents/blog-agent.js'

export const draftNews = async (c: Context) => {
  try {
    const { query } = (c.req as any).valid('json') as { query: string }

    const result = await newsDraftAgent.generate({
      prompt: query,
    })

    return c.json({
      success: true,
      draft: result.output,
    })
  } catch (error: any) {
    console.error('Agent Draft Error:', error)
    return c.json(
      {
        success: false,
        error: {
          code: 'AGENT_DRAFT_ERROR',
          message: error.message || 'Error occurred while generating news draft',
        },
      },
      500
    )
  }
}

export const draftBlog = async (c: Context) => {
  try {
    const { query } = (c.req as any).valid('json') as { query: string }

    const result = await blogDraftAgent.generate({
      prompt: query,
    })

    return c.json({
      success: true,
      draft: result.output,
    })
  } catch (error: any) {
    console.error('Agent Draft Blog Error:', error)
    return c.json(
      {
        success: false,
        error: {
          code: 'AGENT_DRAFT_BLOG_ERROR',
          message: error.message || 'Error occurred while generating blog draft',
        },
      },
      500
    )
  }
}
