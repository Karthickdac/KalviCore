import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { studentsTable } from "./students";
import { staffTable } from "./staff";

export const libraryBooksTable = pgTable("library_books", {
  id: serial("id").primaryKey(),
  isbn: text("isbn"),
  title: text("title").notNull(),
  author: text("author").notNull(),
  publisher: text("publisher"),
  edition: text("edition"),
  category: text("category").notNull(),
  subject: text("subject"),
  shelfLocation: text("shelf_location"),
  totalCopies: integer("total_copies").notNull().default(1),
  availableCopies: integer("available_copies").notNull().default(1),
  price: numeric("price", { precision: 10, scale: 2 }),
  yearOfPublication: text("year_of_publication"),
  status: text("status").notNull().default("Available"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const libraryIssuedBooksTable = pgTable("library_issued_books", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => libraryBooksTable.id),
  memberId: integer("member_id").notNull(),
  memberType: text("member_type").notNull(),
  issueDate: text("issue_date").notNull(),
  dueDate: text("due_date").notNull(),
  returnDate: text("return_date"),
  fineAmount: numeric("fine_amount", { precision: 10, scale: 2 }).default("0"),
  fineStatus: text("fine_status").default("None"),
  status: text("status").notNull().default("Issued"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LibraryBook = typeof libraryBooksTable.$inferSelect;
export type LibraryIssuedBook = typeof libraryIssuedBooksTable.$inferSelect;
