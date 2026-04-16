import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("Staff"),
  departmentId: integer("department_id"),
  isActive: boolean("is_active").notNull().default(true),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry", { withTimezone: true }),
  lastLogin: timestamp("last_login", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true, lastLogin: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const ROLES = [
  "SuperAdmin",
  "Admin",
  "Principal",
  "HOD",
  "Faculty",
  "Staff",
  "Student",
] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  SuperAdmin: ["*"],
  Admin: [
    "dashboard", "reports", "calendar",
    "departments", "courses", "subjects", "timetable", "assignments", "exams",
    "students", "staff", "attendance", "leaves",
    "fees", "certificates", "fundraising",
    "hostels", "transport", "library", "inventory", "visitors",
    "events", "communications", "notifications",
    "placements", "id_cards", "laboratory", "sports_ncc",
    "settings", "users", "print_templates", "dashboard_settings", "access_management",
  ],
  Principal: [
    "dashboard", "reports", "calendar",
    "departments", "courses", "subjects", "timetable", "assignments", "exams",
    "students", "staff", "attendance", "leaves",
    "fees", "certificates", "fundraising",
    "hostels", "transport", "library", "inventory", "visitors",
    "events", "communications", "notifications",
    "placements", "id_cards", "laboratory", "sports_ncc",
    "settings", "print_templates", "dashboard_settings",
  ],
  HOD: [
    "dashboard", "calendar",
    "departments", "courses", "subjects", "timetable", "assignments", "exams",
    "students", "staff", "attendance", "leaves",
    "certificates",
    "events", "communications", "notifications",
    "placements", "laboratory", "sports_ncc",
  ],
  Faculty: [
    "dashboard", "calendar",
    "subjects", "timetable", "assignments", "exams",
    "students", "attendance", "leaves",
    "events", "communications", "notifications",
    "laboratory", "sports_ncc",
  ],
  Staff: [
    "dashboard",
    "students", "attendance", "leaves",
    "fees", "certificates",
    "hostels", "transport", "library", "inventory", "visitors",
    "events", "communications",
    "laboratory", "sports_ncc",
  ],
  Student: [
    "dashboard", "calendar",
    "timetable", "assignments", "exams",
    "attendance", "fees", "library", "events",
    "notifications", "sports_ncc", "certificates",
    "hostels", "transport",
  ],
};
