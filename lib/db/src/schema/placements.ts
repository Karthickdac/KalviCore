import { pgTable, text, serial, integer, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";
import { departmentsTable } from "./departments";

export const companiesTable = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  website: text("website"),
  contactPerson: text("contact_person"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const placementDrivesTable = pgTable("placement_drives", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id),
  title: text("title").notNull(),
  driveDate: text("drive_date").notNull(),
  packageMin: numeric("package_min"),
  packageMax: numeric("package_max"),
  eligibilityCriteria: text("eligibility_criteria"),
  rolesOffered: text("roles_offered"),
  location: text("location"),
  driveType: text("drive_type").notNull().default("On-Campus"),
  status: text("status").notNull().default("Upcoming"),
  departmentsEligible: text("departments_eligible"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const placementApplicationsTable = pgTable("placement_applications", {
  id: serial("id").primaryKey(),
  driveId: integer("drive_id").notNull().references(() => placementDrivesTable.id),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  status: text("status").notNull().default("Applied"),
  roundsCleared: integer("rounds_cleared").default(0),
  packageOffered: numeric("package_offered"),
  offerLetterDate: text("offer_letter_date"),
  remarks: text("remarks"),
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
});

export const trainingProgramsTable = pgTable("training_programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  trainer: text("trainer").notNull(),
  trainerOrg: text("trainer_org"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  duration: text("duration"),
  type: text("type").notNull().default("Technical"),
  mode: text("mode").notNull().default("Offline"),
  departmentId: integer("department_id"),
  maxParticipants: integer("max_participants"),
  description: text("description"),
  status: text("status").notNull().default("Upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const trainingEnrollmentsTable = pgTable("training_enrollments", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull().references(() => trainingProgramsTable.id),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  status: text("status").notNull().default("Enrolled"),
  completionStatus: text("completion_status"),
  certificateIssued: text("certificate_issued").default("No"),
  feedback: text("feedback"),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCompanySchema = createInsertSchema(companiesTable).omit({ id: true, createdAt: true });
export const insertPlacementDriveSchema = createInsertSchema(placementDrivesTable).omit({ id: true, createdAt: true });
export const insertPlacementApplicationSchema = createInsertSchema(placementApplicationsTable).omit({ id: true, appliedAt: true });
export const insertTrainingProgramSchema = createInsertSchema(trainingProgramsTable).omit({ id: true, createdAt: true });
export const insertTrainingEnrollmentSchema = createInsertSchema(trainingEnrollmentsTable).omit({ id: true, enrolledAt: true });

export type Company = typeof companiesTable.$inferSelect;
export type PlacementDrive = typeof placementDrivesTable.$inferSelect;
export type PlacementApplication = typeof placementApplicationsTable.$inferSelect;
export type TrainingProgram = typeof trainingProgramsTable.$inferSelect;
export type TrainingEnrollment = typeof trainingEnrollmentsTable.$inferSelect;
