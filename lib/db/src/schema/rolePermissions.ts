import { pgTable, serial, text, boolean, timestamp, unique } from "drizzle-orm/pg-core";

export const rolePermissionsTable = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  permission: text("permission").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  unique("role_perm_unique").on(table.role, table.permission),
]);

export type RolePermission = typeof rolePermissionsTable.$inferSelect;
