import { Router, type IRouter } from "express";
import { eq, and, isNull } from "drizzle-orm";
import { db, libraryBooksTable, libraryIssuedBooksTable } from "@workspace/db";
import { logActivity } from "../lib/activity";
import { getUserScope } from "../lib/scopeFilter";

const router: IRouter = Router();

router.get("/library-books", async (req, res): Promise<void> => {
  const category = req.query.category as string | undefined;
  let query = db.select().from(libraryBooksTable);
  if (category) query = query.where(eq(libraryBooksTable.category, category)) as any;
  res.json(await (query as any).orderBy(libraryBooksTable.title));
});

router.post("/library-books", async (req, res): Promise<void> => {
  const [book] = await db.insert(libraryBooksTable).values(req.body).returning();
  await logActivity("book_added", `Book "${book.title}" added to library`, String(book.id));
  res.status(201).json(book);
});

router.get("/library-books/:id", async (req, res): Promise<void> => {
  const [book] = await db.select().from(libraryBooksTable).where(eq(libraryBooksTable.id, Number(req.params.id)));
  if (!book) { res.status(404).json({ error: "Not found" }); return; }
  res.json(book);
});

router.patch("/library-books/:id", async (req, res): Promise<void> => {
  const [book] = await db.update(libraryBooksTable).set(req.body).where(eq(libraryBooksTable.id, Number(req.params.id))).returning();
  res.json(book);
});

router.delete("/library-books/:id", async (req, res): Promise<void> => {
  await db.delete(libraryBooksTable).where(eq(libraryBooksTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/library-issued", async (req, res): Promise<void> => {
  const scope = req.user ? getUserScope(req) : null;
  const status = req.query.status as string | undefined;
  const conditions: any[] = [];

  if (scope?.isStudent && scope.studentRecordId) {
    conditions.push(eq(libraryIssuedBooksTable.studentId, scope.studentRecordId));
  }
  if (status) conditions.push(eq(libraryIssuedBooksTable.status, status));

  const records = conditions.length > 0
    ? await db.select().from(libraryIssuedBooksTable).where(and(...conditions))
    : await db.select().from(libraryIssuedBooksTable);
  res.json(records);
});

router.post("/library-issued", async (req, res): Promise<void> => {
  const [issued] = await db.insert(libraryIssuedBooksTable).values(req.body).returning();
  if (issued.bookId) {
    const [book] = await db.select().from(libraryBooksTable).where(eq(libraryBooksTable.id, issued.bookId));
    if (book && book.availableCopies > 0) {
      await db.update(libraryBooksTable).set({ availableCopies: book.availableCopies - 1 }).where(eq(libraryBooksTable.id, issued.bookId));
    }
  }
  await logActivity("book_issued", `Book issued to member`, String(issued.id));
  res.status(201).json(issued);
});

router.patch("/library-issued/:id", async (req, res): Promise<void> => {
  const [existing] = await db.select().from(libraryIssuedBooksTable).where(eq(libraryIssuedBooksTable.id, Number(req.params.id)));
  const [issued] = await db.update(libraryIssuedBooksTable).set(req.body).where(eq(libraryIssuedBooksTable.id, Number(req.params.id))).returning();
  if (req.body.status === "Returned" && existing && existing.status !== "Returned") {
    const [book] = await db.select().from(libraryBooksTable).where(eq(libraryBooksTable.id, issued.bookId));
    if (book) {
      await db.update(libraryBooksTable).set({ availableCopies: book.availableCopies + 1 }).where(eq(libraryBooksTable.id, issued.bookId));
    }
    await logActivity("book_returned", `Book returned`, String(issued.id));
  }
  res.json(issued);
});

export default router;
