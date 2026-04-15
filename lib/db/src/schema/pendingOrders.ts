import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { studentsTable } from "./students";
import { feeStructuresTable } from "./feeStructures";

export const pendingOrdersTable = pgTable("pending_orders", {
  id: serial("id").primaryKey(),
  razorpayOrderId: text("razorpay_order_id").notNull().unique(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  feeStructureId: integer("fee_structure_id").notNull().references(() => feeStructuresTable.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PendingOrder = typeof pendingOrdersTable.$inferSelect;
