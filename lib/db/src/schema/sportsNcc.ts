import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { studentsTable } from "./students";

export const sportsActivitiesTable = pgTable("sports_activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("Sports"),
  type: text("type").notNull().default("Team"),
  coach: text("coach"),
  venue: text("venue"),
  schedule: text("schedule"),
  season: text("season"),
  maxMembers: integer("max_members"),
  description: text("description"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sportsEnrollmentsTable = pgTable("sports_enrollments", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull().references(() => sportsActivitiesTable.id),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  role: text("role").notNull().default("Member"),
  joinDate: text("join_date").notNull(),
  bloodGroup: text("blood_group"),
  medicalFitness: text("medical_fitness"),
  achievements: text("achievements"),
  status: text("status").notNull().default("Active"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sportsAchievementsTable = pgTable("sports_achievements", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").references(() => sportsActivitiesTable.id),
  studentId: integer("student_id").references(() => studentsTable.id),
  title: text("title").notNull(),
  level: text("level").notNull().default("College"),
  position: text("position"),
  eventName: text("event_name"),
  eventDate: text("event_date"),
  venue: text("venue"),
  description: text("description"),
  certificateNumber: text("certificate_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SportsActivity = typeof sportsActivitiesTable.$inferSelect;
export type SportsEnrollment = typeof sportsEnrollmentsTable.$inferSelect;
export type SportsAchievement = typeof sportsAchievementsTable.$inferSelect;
