import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { subjectsTable } from "./subjects";
import { departmentsTable } from "./departments";
import { coursesTable } from "./courses";

export const examsTable = pgTable("exams", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull().references(() => subjectsTable.id),
  departmentId: integer("department_id").references(() => departmentsTable.id),
  courseId: integer("course_id").references(() => coursesTable.id),
  type: text("type").notNull(),
  maxMarks: integer("max_marks").notNull(),
  passMarks: integer("pass_marks"),
  date: text("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  duration: integer("duration"),
  venue: text("venue"),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  status: text("status").notNull().default("Scheduled"),
  instructions: text("instructions"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertExamSchema = createInsertSchema(examsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof examsTable.$inferSelect;
