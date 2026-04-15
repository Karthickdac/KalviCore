import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { studentsTable } from "./students";

export const hostelsTable = pgTable("hostels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  totalBlocks: integer("total_blocks").notNull().default(1),
  totalRooms: integer("total_rooms").notNull().default(0),
  wardenName: text("warden_name"),
  wardenPhone: text("warden_phone"),
  address: text("address"),
  facilities: text("facilities"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const hostelRoomsTable = pgTable("hostel_rooms", {
  id: serial("id").primaryKey(),
  hostelId: integer("hostel_id").notNull().references(() => hostelsTable.id),
  roomNumber: text("room_number").notNull(),
  floor: integer("floor").notNull().default(0),
  block: text("block"),
  roomType: text("room_type").notNull(),
  capacity: integer("capacity").notNull().default(1),
  occupancy: integer("occupancy").notNull().default(0),
  amenities: text("amenities"),
  status: text("status").notNull().default("Available"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const hostelAllocationsTable = pgTable("hostel_allocations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  hostelId: integer("hostel_id").notNull().references(() => hostelsTable.id),
  roomId: integer("room_id").notNull().references(() => hostelRoomsTable.id),
  academicYear: text("academic_year").notNull(),
  allocationDate: text("allocation_date").notNull(),
  vacatingDate: text("vacating_date"),
  messType: text("mess_type"),
  status: text("status").notNull().default("Active"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const hostelComplaintsTable = pgTable("hostel_complaints", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  hostelId: integer("hostel_id").notNull().references(() => hostelsTable.id),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("Medium"),
  status: text("status").notNull().default("Open"),
  resolvedDate: text("resolved_date"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Hostel = typeof hostelsTable.$inferSelect;
export type HostelRoom = typeof hostelRoomsTable.$inferSelect;
export type HostelAllocation = typeof hostelAllocationsTable.$inferSelect;
export type HostelComplaint = typeof hostelComplaintsTable.$inferSelect;
