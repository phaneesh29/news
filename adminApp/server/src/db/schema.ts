import { pgTable, timestamp, uuid, varchar, integer, text, boolean, pgEnum, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'


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
  sessions: many(adminSessions)
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
