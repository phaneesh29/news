import { Context } from 'hono'
import { getClientIp } from '../lib/auth.js'

export const getHealth = async (c: Context) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId'),
    ip: getClientIp(c)
  })
}
