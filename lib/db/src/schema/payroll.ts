import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";

export const payrollTable = pgTable("payroll", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  basicSalary: numeric("basic_salary", { precision: 12, scale: 2 }).notNull(),
  hra: numeric("hra", { precision: 12, scale: 2 }).default("0"),
  da: numeric("da", { precision: 12, scale: 2 }).default("0"),
  ta: numeric("ta", { precision: 12, scale: 2 }).default("0"),
  otherAllowances: numeric("other_allowances", { precision: 12, scale: 2 }).default("0"),
  pf: numeric("pf", { precision: 12, scale: 2 }).default("0"),
  tax: numeric("tax", { precision: 12, scale: 2 }).default("0"),
  otherDeductions: numeric("other_deductions", { precision: 12, scale: 2 }).default("0"),
  netSalary: numeric("net_salary", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("Pending"),
  paidDate: timestamp("paid_date", { withTimezone: true }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const academicCalendarTable = pgTable("academic_calendar", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  eventType: text("event_type").notNull().default("General"),
  isHoliday: text("is_holiday").default("No"),
  departmentId: integer("department_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
