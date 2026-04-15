import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { staffTable } from "./staff";

export const staffLeavesTable = pgTable("staff_leaves", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull().references(() => staffTable.id),
  leaveType: text("leave_type").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  totalDays: integer("total_days").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("Pending"),
  approvedBy: text("approved_by"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type StaffLeave = typeof staffLeavesTable.$inferSelect;
