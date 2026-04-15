import { pgTable, text, serial, integer, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { departmentsTable } from "./departments";
import { coursesTable } from "./courses";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  rollNumber: text("roll_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender").notNull(),
  community: text("community").notNull(),
  religion: text("religion"),
  caste: text("caste"),
  nationality: text("nationality").notNull().default("Indian"),
  motherTongue: text("mother_tongue"),
  bloodGroup: text("blood_group"),
  aadharNumber: text("aadhar_number"),
  address: text("address"),
  city: text("city"),
  district: text("district"),
  state: text("state").notNull().default("Tamil Nadu"),
  pincode: text("pincode"),
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  guardianPhone: text("guardian_phone"),
  guardianOccupation: text("guardian_occupation"),
  annualIncome: numeric("annual_income", { precision: 12, scale: 2 }),
  departmentId: integer("department_id").notNull().references(() => departmentsTable.id),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  year: integer("year").notNull(),
  semester: integer("semester").notNull(),
  admissionDate: text("admission_date").notNull(),
  admissionType: text("admission_type").notNull(),
  scholarshipStatus: text("scholarship_status"),
  firstGraduate: boolean("first_graduate").notNull().default(false),
  admissionStatus: text("admission_status").notNull().default("Confirmed"),
  applicationNumber: text("application_number"),
  previousInstitution: text("previous_institution"),
  previousCourse: text("previous_course"),
  entranceScore: text("entrance_score"),
  isAlumni: boolean("is_alumni").notNull().default(false),
  graduationDate: text("graduation_date"),
  alumniEmail: text("alumni_email"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;
