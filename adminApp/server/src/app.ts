import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { requestId } from 'hono/request-id'

import { env } from './config/env.js'
import { healthRoutes } from './routes/health.js'
import { authRoutes } from './routes/auth.js'
import { whitelistRoutes } from './routes/whitelist.js'
import { newsRoutes } from './routes/news.js'
import { agentRoutes } from './routes/agent.js'
import { blogRoutes } from './routes/blog.js'
import { docRoutes } from './routes/doc.js'
import { feedbackRoutes } from './routes/feedback.js'
import { digestRoutes } from './routes/digest.js'
import { globalRateLimiter } from './middlewares/rateLimit.js'

type Bindings = {
  Variables: {
    requestId: string
  }
}

const app = new Hono<Bindings>()

app.use('*', requestId())
app.use('*', secureHeaders())
app.use('*', compress())
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (env.CORS_ORIGINS.includes('*')) {
        return origin
      }

      return env.CORS_ORIGINS.includes(origin) ? origin : ''
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['authorization', 'content-type', 'x-request-id'],
    exposeHeaders: ['x-request-id'],
    credentials: true,
    maxAge: 86400
  })
)
app.use('*', logger())
app.use('/api/*', globalRateLimiter)

app.route('/api/health', healthRoutes)
app.route('/api/auth', authRoutes)
app.route('/api/whitelist', whitelistRoutes)
app.route('/api/news', newsRoutes)
app.route('/api/agent', agentRoutes)
app.route('/api/blogs', blogRoutes)
app.route('/api/docs', docRoutes)
app.route('/api/feedback', feedbackRoutes)
app.route('/api/digest', digestRoutes)

app.notFound((c) => {
  return c.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found'
      },
      requestId: c.get('requestId')
    },
    404
  )
})

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json(
      {
        error: {
          code: 'REQUEST_ERROR',
          message: error.message
        },
        requestId: c.get('requestId')
      },
      error.status
    )
  }

  console.error(error)

  const isDev = env.NODE_ENV === 'development'
  return c.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: isDev ? error.message : 'Internal server error',
        stack: isDev ? error.stack : undefined
      },
      requestId: c.get('requestId')
    },
    500
  )
})

export default app
