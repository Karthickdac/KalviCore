import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { studentsTable } from "./students";
import { departmentsTable } from "./departments";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  departmentId: integer("department_id").references(() => departmentsTable.id),
  venue: text("venue"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  coordinatorName: text("coordinator_name"),
  coordinatorPhone: text("coordinator_phone"),
  maxParticipants: integer("max_participants"),
  budget: text("budget"),
  status: text("status").notNull().default("Upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const eventParticipantsTable = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => eventsTable.id),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  role: text("role").notNull().default("Participant"),
  registrationDate: text("registration_date").notNull(),
  achievement: text("achievement"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Event = typeof eventsTable.$inferSelect;
export type EventParticipant = typeof eventParticipantsTable.$inferSelect;
