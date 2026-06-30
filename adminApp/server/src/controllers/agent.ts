import { Context } from 'hono'
import { newsDraftAgent } from '../lib/agents/news-agent.js'
import { blogDraftAgent } from '../lib/agents/blog-agent.js'
import { docDraftAgent } from '../lib/agents/doc-agent.js'
import { db } from '../db/index.js'
import { docs } from '../db/schema.js'
import { createUIMessageStreamResponse, toUIMessageStream } from 'ai'

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
  const { messages } = (c.req as any).valid('json') as { messages: any[] }
  const query = messages[messages.length - 1].content

  const existingDocs = await db.select({
    id: docs.id,
    title: docs.title,
    slug: docs.slug
  }).from(docs)

  let crossLinkContext = ''
  if (existingDocs.length > 0) {
    crossLinkContext = `\n\nHere are the existing documentation titles, IDs, and slugs in the system. Use this list to determine if the document you are drafting should have a parent (nesting), to cross-link pages when appropriate, and to select a logical orderIndex:\n` +
      existingDocs.map(d => `- "${d.title}" (ID: ${d.id}, slug: /docs/${d.slug})`).join('\n') +
      `\n\nIf this document belongs under one of the existing pages as a child, set the 'parentId' field to that page's ID (UUID). Otherwise, set 'parentId' to null. Select a logical 'orderIndex' (0 or higher) relative to other documents.`;
  } else {
    crossLinkContext = `\n\nThere are no existing documents, so 'parentId' should be null and 'orderIndex' should be 0.`;
  }

  const result = await docDraftAgent.stream({
    prompt: query + crossLinkContext,
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
