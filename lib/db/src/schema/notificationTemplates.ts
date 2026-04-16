import { pgTable, text, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const notificationTemplatesTable = pgTable("notification_templates", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  channel: text("channel").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  variables: jsonb("variables").$type<string[]>().notNull().default([]),
  description: text("description"),
  isSystem: boolean("is_system").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type NotificationTemplate = typeof notificationTemplatesTable.$inferSelect;
export type InsertNotificationTemplate = typeof notificationTemplatesTable.$inferInsert;
