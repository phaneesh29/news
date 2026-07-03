import { pgTable, timestamp, uuid, varchar, integer, text, boolean, pgEnum, index, vector } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'


export const adminRoleEnum = pgEnum('admin_role', ['admin', 'editor', 'viewer'])
export const adminStatusEnum = pgEnum('admin_status', ['active', 'suspended'])


export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: adminRoleEnum('role').notNull().default('admin'),
  status: adminStatusEnum('status').notNull().default('active'),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('admin_users_email_idx').on(table.email)
])

export const adminOtps = pgTable('admin_otps', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  codeHash: varchar('code_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(5),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('admin_otps_admin_id_idx').on(table.adminId),
  index('admin_otps_expires_at_idx').on(table.expiresAt)
])


export const adminSessions = pgTable('admin_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 45 }), // Audit IP of session source
  userAgent: text('user_agent'),
  isValid: boolean('is_valid').notNull().default(true),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('admin_sessions_admin_id_idx').on(table.adminId),
  index('admin_sessions_token_hash_idx').on(table.tokenHash)
])

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  otps: many(adminOtps),
  sessions: many(adminSessions),
  news: many(devNews),
  blogs: many(blogs),
  docs: many(docs)
}))

export const adminOtpsRelations = relations(adminOtps, ({ one }) => ({
  admin: one(adminUsers, {
    fields: [adminOtps.adminId],
    references: [adminUsers.id]
  })
}))

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  admin: one(adminUsers, {
    fields: [adminSessions.adminId],
    references: [adminUsers.id]
  })
}))

export const adminWhitelist = pgTable('admin_whitelist', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('admin_whitelist_email_idx').on(table.email)
])

export const newsPriorityEnum = pgEnum('news_priority', ['low', 'medium', 'high', 'critical'])

export const devNews = pgTable('dev_news', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  sourceUrl: varchar('source_url', { length: 512 }),
  priority: newsPriorityEnum('priority').notNull().default('low'),
  tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
  authorId: uuid('author_id').references(() => adminUsers.id, { onDelete: 'set null' }),
  isPublished: boolean('is_published').notNull().default(false),
  contentEmbedding: vector('content_embedding', { dimensions: 1024 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('dev_news_priority_idx').on(table.priority),
  index('dev_news_created_at_idx').on(table.createdAt)
])

export const devNewsRelations = relations(devNews, ({ one }) => ({
  author: one(adminUsers, {
    fields: [devNews.authorId],
    references: [adminUsers.id]
  })
}))

export const blogs = pgTable('blogs', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  authorId: uuid('author_id').references(() => adminUsers.id, { onDelete: 'set null' }),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('blogs_created_at_idx').on(table.createdAt)
])

export const blogsRelations = relations(blogs, ({ one }) => ({
  author: one(adminUsers, {
    fields: [blogs.authorId],
    references: [adminUsers.id]
  })
}))

export const docs = pgTable('docs', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  parentId: uuid('parent_id').references((): any => docs.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').notNull().default(0),
  authorId: uuid('author_id').references(() => adminUsers.id, { onDelete: 'set null' }),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('docs_created_at_idx').on(table.createdAt),
  index('docs_parent_id_idx').on(table.parentId)
])

export const docsRelations = relations(docs, ({ one, many }) => ({
  author: one(adminUsers, {
    fields: [docs.authorId],
    references: [adminUsers.id]
  }),
  parent: one(docs, {
    fields: [docs.parentId],
    references: [docs.id],
    relationName: 'doc_hierarchy'
  }),
  children: many(docs, {
    relationName: 'doc_hierarchy'
  })
}))
