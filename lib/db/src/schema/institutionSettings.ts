import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const institutionSettingsTable = pgTable("institution_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  category: text("category").notNull().default("General"),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInstitutionSettingSchema = createInsertSchema(institutionSettingsTable).omit({ id: true, updatedAt: true });
export type InsertInstitutionSetting = z.infer<typeof insertInstitutionSettingSchema>;
export type InstitutionSetting = typeof institutionSettingsTable.$inferSelect;
