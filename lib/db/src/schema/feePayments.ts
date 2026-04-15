import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";
import { feeStructuresTable } from "./feeStructures";

export const feePaymentsTable = pgTable("fee_payments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  feeStructureId: integer("fee_structure_id").notNull().references(() => feeStructuresTable.id),
  amountPaid: numeric("amount_paid", { precision: 12, scale: 2 }).notNull(),
  paymentDate: text("payment_date").notNull(),
  paymentMode: text("payment_mode").notNull(),
  receiptNumber: text("receipt_number").notNull().unique(),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  status: text("status").notNull().default("Paid"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFeePaymentSchema = createInsertSchema(feePaymentsTable).omit({ id: true, createdAt: true });
export type InsertFeePayment = z.infer<typeof insertFeePaymentSchema>;
export type FeePayment = typeof feePaymentsTable.$inferSelect;
