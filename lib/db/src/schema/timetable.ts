import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { departmentsTable } from "./departments";
import { subjectsTable } from "./subjects";
import { staffTable } from "./staff";

export const timetableTable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").notNull().references(() => departmentsTable.id),
  semester: integer("semester").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  periodNumber: integer("period_number").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  subjectId: integer("subject_id").references(() => subjectsTable.id),
  staffId: integer("staff_id").references(() => staffTable.id),
  room: text("room"),
  section: text("section").default("A"),
  academicYear: text("academic_year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TimetableEntry = typeof timetableTable.$inferSelect;
