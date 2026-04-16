import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { departmentsTable } from "./departments";

export const laboratoriesTable = pgTable("laboratories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  departmentId: integer("department_id").references(() => departmentsTable.id),
  location: text("location"),
  capacity: integer("capacity"),
  labType: text("lab_type").notNull().default("General"),
  inchargeName: text("incharge_name"),
  inchargePhone: text("incharge_phone"),
  equipment: text("equipment"),
  status: text("status").notNull().default("Active"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const labEquipmentTable = pgTable("lab_equipment", {
  id: serial("id").primaryKey(),
  labId: integer("lab_id").notNull().references(() => laboratoriesTable.id),
  name: text("name").notNull(),
  model: text("model"),
  serialNumber: text("serial_number"),
  quantity: integer("quantity").notNull().default(1),
  condition: text("condition").notNull().default("Working"),
  purchaseDate: text("purchase_date"),
  warrantyExpiry: text("warranty_expiry"),
  vendor: text("vendor"),
  cost: text("cost"),
  status: text("status").notNull().default("Available"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const labSchedulesTable = pgTable("lab_schedules", {
  id: serial("id").primaryKey(),
  labId: integer("lab_id").notNull().references(() => laboratoriesTable.id),
  day: text("day").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  subject: text("subject"),
  faculty: text("faculty"),
  batch: text("batch"),
  semester: text("semester"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Laboratory = typeof laboratoriesTable.$inferSelect;
export type LabEquipment = typeof labEquipmentTable.$inferSelect;
export type LabSchedule = typeof labSchedulesTable.$inferSelect;
