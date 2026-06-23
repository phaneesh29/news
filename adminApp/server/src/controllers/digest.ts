import { Context } from 'hono'
import { parseMarkdown } from '../utils/markdownParser.js'
import { HTTPException } from 'hono/http-exception'

export const getDigest = async (c: Context) => {
  const url = "https://raw.githubusercontent.com/phaneesh29/news/master/content/news.md"
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new HTTPException(response.status as any, { message: `Failed to fetch digest content: ${response.statusText}` })
  }
  
  const md = await response.text()
  const digestData = parseMarkdown(md)

  return c.json({
    success: true,
    data: digestData
  })
}
