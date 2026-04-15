import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { coursesTable } from "./courses";

export const feeStructuresTable = pgTable("fee_structures", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  academicYear: text("academic_year").notNull(),
  tuitionFee: numeric("tuition_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  labFee: numeric("lab_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  libraryFee: numeric("library_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  examFee: numeric("exam_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  transportFee: numeric("transport_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  hostelFee: numeric("hostel_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  otherFee: numeric("other_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  totalFee: numeric("total_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertFeeStructureSchema = createInsertSchema(feeStructuresTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFeeStructure = z.infer<typeof insertFeeStructureSchema>;
export type FeeStructure = typeof feeStructuresTable.$inferSelect;
