import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { studentsTable } from "./students";

export const transportRoutesTable = pgTable("transport_routes", {
  id: serial("id").primaryKey(),
  routeName: text("route_name").notNull(),
  routeNumber: text("route_number").notNull().unique(),
  startPoint: text("start_point").notNull(),
  endPoint: text("end_point").notNull(),
  distance: text("distance"),
  estimatedTime: text("estimated_time"),
  fare: numeric("fare", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transportVehiclesTable = pgTable("transport_vehicles", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  vehicleType: text("vehicle_type").notNull(),
  capacity: integer("capacity").notNull(),
  driverName: text("driver_name").notNull(),
  driverPhone: text("driver_phone").notNull(),
  driverLicense: text("driver_license"),
  routeId: integer("route_id").references(() => transportRoutesTable.id),
  insuranceExpiry: text("insurance_expiry"),
  fitnessExpiry: text("fitness_expiry"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transportStopsTable = pgTable("transport_stops", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull().references(() => transportRoutesTable.id),
  stopName: text("stop_name").notNull(),
  stopOrder: integer("stop_order").notNull(),
  pickupTime: text("pickup_time"),
  dropTime: text("drop_time"),
  landmark: text("landmark"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transportAllocationsTable = pgTable("transport_allocations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  routeId: integer("route_id").notNull().references(() => transportRoutesTable.id),
  stopId: integer("stop_id").notNull().references(() => transportStopsTable.id),
  academicYear: text("academic_year").notNull(),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TransportRoute = typeof transportRoutesTable.$inferSelect;
export type TransportVehicle = typeof transportVehiclesTable.$inferSelect;
export type TransportStop = typeof transportStopsTable.$inferSelect;
export type TransportAllocation = typeof transportAllocationsTable.$inferSelect;
