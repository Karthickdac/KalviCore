import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { departmentsTable } from "./departments";

export const assetsTable = pgTable("assets", {
  id: serial("id").primaryKey(),
  assetTag: text("asset_tag").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  departmentId: integer("department_id").references(() => departmentsTable.id),
  location: text("location"),
  purchaseDate: text("purchase_date"),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }),
  vendor: text("vendor"),
  warrantyExpiry: text("warranty_expiry"),
  condition: text("condition").notNull().default("Good"),
  assignedTo: text("assigned_to"),
  serialNumber: text("serial_number"),
  status: text("status").notNull().default("Active"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const storeItemsTable = pgTable("store_items", {
  id: serial("id").primaryKey(),
  itemCode: text("item_code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull().default("Pieces"),
  currentStock: integer("current_stock").notNull().default(0),
  minimumStock: integer("minimum_stock").notNull().default(0),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }),
  lastRestockDate: text("last_restock_date"),
  supplier: text("supplier"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Asset = typeof assetsTable.$inferSelect;
export type StoreItem = typeof storeItemsTable.$inferSelect;
