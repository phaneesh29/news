import { defineConfig } from 'drizzle-kit';
import env from './src/config/env.js';

export default defineConfig({
  schema: './src/db/schema.js',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  migrations: {
    table: 'user_drizzle_migrations',
  },
  tablesFilter: ["user", "session", "account", "verification", "news_likes", "feedbacks"],
});
