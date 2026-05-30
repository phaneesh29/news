import { defineConfig } from 'drizzle-kit'
import { env } from './src/config/env.js'

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for Drizzle commands')
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL
  }
})
