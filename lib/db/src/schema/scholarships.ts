import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";

export const scholarshipsTable = pgTable("scholarships", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  scholarshipName: text("scholarship_name").notNull(),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  academicYear: text("academic_year").notNull(),
  awardDate: text("award_date"),
  status: text("status").notNull().default("Applied"),
  approvedBy: text("approved_by"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertScholarshipSchema = createInsertSchema(scholarshipsTable).omit({ id: true, createdAt: true });
export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type Scholarship = typeof scholarshipsTable.$inferSelect;
