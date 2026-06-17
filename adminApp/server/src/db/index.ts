import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '../config/env.js'
import * as schema from './schema.js'

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required before using the database')
}

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })
