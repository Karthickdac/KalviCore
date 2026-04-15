import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { departmentsTable } from "./departments";

export const staffTable = pgTable("staff", {
  id: serial("id").primaryKey(),
  staffId: text("staff_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  gender: text("gender").notNull(),
  dateOfBirth: text("date_of_birth"),
  departmentId: integer("department_id").notNull().references(() => departmentsTable.id),
  designation: text("designation").notNull(),
  qualification: text("qualification"),
  specialization: text("specialization"),
  experience: integer("experience"),
  joiningDate: text("joining_date").notNull(),
  employmentType: text("employment_type").notNull(),
  salary: numeric("salary", { precision: 12, scale: 2 }),
  address: text("address"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStaffSchema = createInsertSchema(staffTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type StaffMember = typeof staffTable.$inferSelect;
