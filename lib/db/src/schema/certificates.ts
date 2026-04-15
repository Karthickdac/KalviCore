import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { studentsTable } from "./students";

export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  type: text("type").notNull(),
  requestDate: text("request_date").notNull(),
  issueDate: text("issue_date"),
  certificateNumber: text("certificate_number"),
  purpose: text("purpose"),
  status: text("status").notNull().default("Pending"),
  approvedBy: text("approved_by"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Certificate = typeof certificatesTable.$inferSelect;
