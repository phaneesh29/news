import { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { redis } from '../lib/redis.js'

export const getDigest = async (c: Context) => {
  try {
    const digestData = await redis.hgetall('news:latest');
    return c.json({
      success: true,
      data: digestData || {}
    });
  } catch (error: any) {
    throw new HTTPException(500, { message: `Failed to fetch digest: ${error.message}` });
  }
}
