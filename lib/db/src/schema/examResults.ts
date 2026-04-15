import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { examsTable } from "./exams";
import { studentsTable } from "./students";

export const examResultsTable = pgTable("exam_results", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull().references(() => examsTable.id),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  marksObtained: integer("marks_obtained").notNull(),
  grade: text("grade"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertExamResultSchema = createInsertSchema(examResultsTable).omit({ id: true, createdAt: true });
export type InsertExamResult = z.infer<typeof insertExamResultSchema>;
export type ExamResult = typeof examResultsTable.$inferSelect;
