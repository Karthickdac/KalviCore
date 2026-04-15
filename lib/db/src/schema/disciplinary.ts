import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";

export const disciplinaryRecordsTable = pgTable("disciplinary_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  incidentDate: text("incident_date").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull().default("Minor"),
  actionTaken: text("action_taken"),
  actionDate: text("action_date"),
  reportedBy: text("reported_by"),
  status: text("status").notNull().default("Open"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDisciplinaryRecordSchema = createInsertSchema(disciplinaryRecordsTable).omit({ id: true, createdAt: true });
export type InsertDisciplinaryRecord = z.infer<typeof insertDisciplinaryRecordSchema>;
export type DisciplinaryRecord = typeof disciplinaryRecordsTable.$inferSelect;
