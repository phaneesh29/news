import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '../config/env.js'
import * as schema from './schema.js'

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required before using the database')
}

export const queryClient = neon(env.DATABASE_URL)

export const db = drizzle(queryClient, { schema })
