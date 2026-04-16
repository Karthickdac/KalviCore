import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, certificatesTable } from "@workspace/db";
import { logActivity } from "../lib/activity";
import { getUserScope } from "../lib/scopeFilter";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/certificates", requireAuth, async (req, res): Promise<void> => {
  const scope = getUserScope(req);
  const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
  const type = req.query.type as string | undefined;
  const conditions: any[] = [];

  if (scope?.isStudent && scope.studentRecordId) {
    conditions.push(eq(certificatesTable.studentId, scope.studentRecordId));
  } else if (studentId) {
    conditions.push(eq(certificatesTable.studentId, studentId));
  }
  if (type) conditions.push(eq(certificatesTable.type, type));

  const records = conditions.length > 0
    ? await db.select().from(certificatesTable).where(and(...conditions))
    : await db.select().from(certificatesTable);
  res.json(records);
});

router.post("/certificates", async (req, res): Promise<void> => {
  const [cert] = await db.insert(certificatesTable).values(req.body).returning();
  await logActivity("certificate_requested", `Certificate request: ${cert.type}`, String(cert.id));
  res.status(201).json(cert);
});

router.get("/certificates/:id", async (req, res): Promise<void> => {
  const [cert] = await db.select().from(certificatesTable).where(eq(certificatesTable.id, Number(req.params.id)));
  if (!cert) { res.status(404).json({ error: "Not found" }); return; }
  res.json(cert);
});

router.patch("/certificates/:id", async (req, res): Promise<void> => {
  const [cert] = await db.update(certificatesTable).set(req.body).where(eq(certificatesTable.id, Number(req.params.id))).returning();
  if (req.body.status === "Issued") {
    await logActivity("certificate_issued", `Certificate ${cert.type} issued`, String(cert.id));
  }
  res.json(cert);
});

export default router;
