import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";
import { feeStructuresTable } from "./feeStructures";

export const feeInstalmentsTable = pgTable("fee_instalments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  feeStructureId: integer("fee_structure_id").notNull().references(() => feeStructuresTable.id),
  instalmentNumber: integer("instalment_number").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: text("due_date").notNull(),
  paidDate: text("paid_date"),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }),
  lateFee: numeric("late_fee", { precision: 12, scale: 2 }).default("0"),
  status: text("status").notNull().default("Pending"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFeeInstalmentSchema = createInsertSchema(feeInstalmentsTable).omit({ id: true, createdAt: true });
export type InsertFeeInstalment = z.infer<typeof insertFeeInstalmentSchema>;
export type FeeInstalment = typeof feeInstalmentsTable.$inferSelect;
