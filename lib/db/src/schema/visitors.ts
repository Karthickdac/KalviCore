import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const visitorsTable = pgTable("visitors", {
  id: serial("id").primaryKey(),
  visitorName: text("visitor_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  idProofType: text("id_proof_type"),
  idProofNumber: text("id_proof_number"),
  purpose: text("purpose").notNull(),
  personToMeet: text("person_to_meet").notNull(),
  department: text("department"),
  numberOfVisitors: integer("number_of_visitors").notNull().default(1),
  vehicleNumber: text("vehicle_number"),
  checkInTime: timestamp("check_in_time", { withTimezone: true }).notNull().defaultNow(),
  checkOutTime: timestamp("check_out_time", { withTimezone: true }),
  visitorBadge: text("visitor_badge"),
  status: text("status").notNull().default("Checked In"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVisitorSchema = createInsertSchema(visitorsTable).omit({ id: true, createdAt: true });
export type Visitor = typeof visitorsTable.$inferSelect;
