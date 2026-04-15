import { Router, type IRouter } from "express";
import { db, documentsTable, studentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/documents", requireAuth, requirePermission("students"), async (req, res): Promise<void> => {
  try {
    const { studentId } = req.query;
    const docs = studentId
      ? await db.select().from(documentsTable).where(eq(documentsTable.studentId, Number(studentId))).orderBy(desc(documentsTable.createdAt))
      : await db.select().from(documentsTable).orderBy(desc(documentsTable.createdAt)).limit(200);
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/documents", requireAuth, requirePermission("students"), async (req, res): Promise<void> => {
  try {
    const { studentId, documentType, fileName, fileSize, mimeType, description } = req.body;
    if (!studentId || !documentType || !fileName) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, Number(studentId)));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }

    const [doc] = await db.insert(documentsTable).values({
      studentId: Number(studentId), documentType, fileName,
      fileSize: fileSize ? Number(fileSize) : null,
      mimeType: mimeType || null, description: description || null,
    }).returning();

    await logActivity("document_uploaded", `Document uploaded for ${student.firstName} ${student.lastName}: ${documentType}`, String(doc.id));
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/documents/:id/verify", requireAuth, requirePermission("students"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const { verifiedBy } = req.body;
    const [doc] = await db.update(documentsTable).set({
      status: "Verified", verifiedBy: verifiedBy || "Admin",
      verifiedAt: new Date(),
    }).where(eq(documentsTable.id, id)).returning();
    if (!doc) { res.status(404).json({ error: "Document not found" }); return; }
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/documents/:id", requireAuth, requirePermission("students"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [doc] = await db.delete(documentsTable).where(eq(documentsTable.id, id)).returning();
    if (!doc) { res.status(404).json({ error: "Document not found" }); return; }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/documents/stats", requireAuth, requirePermission("students"), async (_req, res): Promise<void> => {
  try {
    const docs = await db.select().from(documentsTable);
    const stats = {
      total: docs.length,
      verified: docs.filter(d => d.status === "Verified").length,
      pending: docs.filter(d => d.status === "Uploaded").length,
      types: {} as Record<string, number>,
    };
    docs.forEach(d => { stats.types[d.documentType] = (stats.types[d.documentType] || 0) + 1; });
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
