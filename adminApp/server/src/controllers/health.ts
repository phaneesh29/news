import { Context } from 'hono'

export const getHealth = async (c: Context) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId')
  })
}
