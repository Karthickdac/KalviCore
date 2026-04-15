import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { subjectsTable } from "./subjects";
import { staffTable } from "./staff";
import { studentsTable } from "./students";

export const assignmentsTable = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subjectId: integer("subject_id").notNull().references(() => subjectsTable.id),
  staffId: integer("staff_id").notNull().references(() => staffTable.id),
  maxMarks: integer("max_marks").notNull().default(100),
  dueDate: text("due_date").notNull(),
  type: text("type").notNull().default("Assignment"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assignmentSubmissionsTable = pgTable("assignment_submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => assignmentsTable.id),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  submissionDate: text("submission_date").notNull(),
  marksObtained: integer("marks_obtained"),
  grade: text("grade"),
  feedback: text("feedback"),
  isLate: text("is_late").notNull().default("No"),
  status: text("status").notNull().default("Submitted"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Assignment = typeof assignmentsTable.$inferSelect;
export type AssignmentSubmission = typeof assignmentSubmissionsTable.$inferSelect;
