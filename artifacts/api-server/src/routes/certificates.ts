import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, certificatesTable } from "@workspace/db";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/certificates", async (req, res): Promise<void> => {
  const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
  const type = req.query.type as string | undefined;
  let query = db.select().from(certificatesTable);
  if (studentId) query = query.where(eq(certificatesTable.studentId, studentId)) as any;
  if (type) query = query.where(eq(certificatesTable.type, type)) as any;
  res.json(await query);
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
