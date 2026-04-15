import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";
import { subjectsTable } from "./subjects";

export const attendanceCondonationTable = pgTable("attendance_condonation", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  subjectId: integer("subject_id").notNull().references(() => subjectsTable.id),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  currentPercentage: text("current_percentage").notNull(),
  reason: text("reason").notNull(),
  supportingDocument: text("supporting_document"),
  requestDate: text("request_date").notNull(),
  status: text("status").notNull().default("Pending"),
  approvedBy: text("approved_by"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAttendanceCondonationSchema = createInsertSchema(attendanceCondonationTable).omit({ id: true, createdAt: true });
export type InsertAttendanceCondonation = z.infer<typeof insertAttendanceCondonationSchema>;
export type AttendanceCondonation = typeof attendanceCondonationTable.$inferSelect;
