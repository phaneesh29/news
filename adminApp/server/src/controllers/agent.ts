import { Context } from 'hono'
import { newsDraftAgent } from '../lib/agents/news-agent.js'
import { blogDraftAgent } from '../lib/agents/blog-agent.js'
import { docDraftAgent } from '../lib/agents/doc-agent.js'
import { db } from '../db/index.js'
import { docs } from '../db/schema.js'

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

export const draftDoc = async (c: Context) => {
  const { query } = (c.req as any).valid('json') as { query: string }

  const existingDocs = await db.select({
    title: docs.title,
    slug: docs.slug
  }).from(docs)

  let crossLinkContext = ''
  if (existingDocs.length > 0) {
    crossLinkContext = `\n\nHere are the existing documentation titles and slugs in the system. When appropriate, write markdown links to these pages using their slugs (e.g., [Title](/docs/slug)):\n` +
      existingDocs.map(d => `- "${d.title}" (slug: /docs/${d.slug})`).join('\n')
  }

  const result = await docDraftAgent.generate({
    prompt: query + crossLinkContext,
  })

  return c.json({
    success: true,
    draft: result.output,
  })
}
