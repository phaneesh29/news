import { Hono } from 'hono'
import { getHealth } from '../controllers/health.js'

type Bindings = {
  Variables: {
    requestId: string
  }
}

export const healthRoutes = new Hono<Bindings>()

healthRoutes.get('/', getHealth)
