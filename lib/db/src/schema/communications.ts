import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { departmentsTable } from "./departments";

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("General"),
  priority: text("priority").notNull().default("Normal"),
  targetAudience: text("target_audience").notNull().default("All"),
  departmentId: integer("department_id").references(() => departmentsTable.id),
  publishDate: text("publish_date").notNull(),
  expiryDate: text("expiry_date"),
  postedBy: text("posted_by").notNull(),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const grievancesTable = pgTable("grievances", {
  id: serial("id").primaryKey(),
  submittedBy: text("submitted_by").notNull(),
  submitterType: text("submitter_type").notNull(),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("Medium"),
  status: text("status").notNull().default("Open"),
  assignedTo: text("assigned_to"),
  resolution: text("resolution"),
  resolvedDate: text("resolved_date"),
  isAnonymous: text("is_anonymous").notNull().default("No"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Announcement = typeof announcementsTable.$inferSelect;
export type Grievance = typeof grievancesTable.$inferSelect;
