import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z.string().default('http://localhost:3001,http://localhost:3000').transform(
    (value) => value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  ),
  DATABASE_URL: z.url(),
  DB_POOL_MAX: z.coerce.number().int().positive().default(1),
  RESEND_API_KEY: z.string().min(1, 'Resend API Key is required'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  UPSTASH_REDIS_REST_URL: z.url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error('Invalid environment configuration', JSON.stringify(z.treeifyError(result.error), null, 2))
  process.exit(1)
}

export const env = result.data
