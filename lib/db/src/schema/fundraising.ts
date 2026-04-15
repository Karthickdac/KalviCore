import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fundraisingCampaignsTable = pgTable("fundraising_campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  goalAmount: numeric("goal_amount").notNull(),
  raisedAmount: numeric("raised_amount").notNull().default("0"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  category: text("category").notNull().default("General"),
  status: text("status").notNull().default("Active"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => fundraisingCampaignsTable.id),
  donorName: text("donor_name").notNull(),
  donorType: text("donor_type").notNull().default("Individual"),
  donorEmail: text("donor_email"),
  donorPhone: text("donor_phone"),
  donorRelation: text("donor_relation"),
  amount: numeric("amount").notNull(),
  paymentMode: text("payment_mode").notNull().default("Cash"),
  transactionId: text("transaction_id"),
  donationDate: text("donation_date").notNull(),
  purpose: text("purpose"),
  receiptNumber: text("receipt_number"),
  status: text("status").notNull().default("Received"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFundraisingCampaignSchema = createInsertSchema(fundraisingCampaignsTable).omit({ id: true, createdAt: true });
export const insertDonationSchema = createInsertSchema(donationsTable).omit({ id: true, createdAt: true });

export type FundraisingCampaign = typeof fundraisingCampaignsTable.$inferSelect;
export type Donation = typeof donationsTable.$inferSelect;
