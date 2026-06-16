import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000').transform(
    (value) => value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  ),
  DATABASE_URL: z.url(),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),
  RESEND_API_KEY: z.string().min(1, 'Resend API Key is required')
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error('Invalid environment configuration', JSON.stringify(z.treeifyError(result.error), null, 2))
  process.exit(1)
}

export const env = result.data
