import { Context } from 'hono'
import { parseMarkdown } from '../utils/markdownParser.js'

export const getDigest = async (c: Context) => {
  try {
    const url = "https://raw.githubusercontent.com/phaneesh29/news/master/content/news.md"
    const response = await fetch(url)
    if (!response.ok) {
      return c.json({ error: `Failed to fetch digest content: ${response.statusText}` }, response.status as any)
    }
    const md = await response.text()
    const digestData = parseMarkdown(md)

    return c.json({
      success: true,
      data: digestData
    })
  } catch (error: any) {
    console.error('Get Digest Error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
