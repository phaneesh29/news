import { pgTable, text, timestamp, uuid, primaryKey } from "drizzle-orm/pg-core";
import { devNews } from "./schema.js";

export const feedbacks = pgTable('feedbacks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const newsLikes = pgTable('news_likes', {
  userId: text('user_id').notNull(),
  newsId: uuid('news_id').notNull().references(() => devNews.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  primaryKey({ columns: [table.userId, table.newsId] })
]);
