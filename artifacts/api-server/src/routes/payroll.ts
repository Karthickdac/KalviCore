import { Router, type IRouter } from "express";
import { db, payrollTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/payroll", async (req, res): Promise<void> => {
  const { staffId, month, year, status } = req.query;
  let conditions: any[] = [];
  if (staffId) conditions.push(eq(payrollTable.staffId, Number(staffId)));
  if (month) conditions.push(eq(payrollTable.month, Number(month)));
  if (year) conditions.push(eq(payrollTable.year, Number(year)));
  if (status) conditions.push(eq(payrollTable.status, String(status)));

  const records = conditions.length > 0
    ? await db.select().from(payrollTable).where(and(...conditions))
    : await db.select().from(payrollTable);
  res.json(records);
});

router.post("/payroll", async (req, res): Promise<void> => {
  const { staffId, month, year, basicSalary, hra, da, ta, otherAllowances, pf, tax, otherDeductions, remarks } = req.body;
  const gross = Number(basicSalary) + Number(hra || 0) + Number(da || 0) + Number(ta || 0) + Number(otherAllowances || 0);
  const deductions = Number(pf || 0) + Number(tax || 0) + Number(otherDeductions || 0);
  const netSalary = gross - deductions;

  const [record] = await db.insert(payrollTable).values({
    staffId, month, year, basicSalary: String(basicSalary),
    hra: String(hra || 0), da: String(da || 0), ta: String(ta || 0),
    otherAllowances: String(otherAllowances || 0), pf: String(pf || 0),
    tax: String(tax || 0), otherDeductions: String(otherDeductions || 0),
    netSalary: String(netSalary), remarks,
  }).returning();
  await logActivity("payroll_created", `Payroll entry created for staff ${staffId}`, String(record.id));
  res.status(201).json(record);
});

router.patch("/payroll/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const updates = req.body;
  if (updates.basicSalary || updates.hra || updates.da || updates.ta || updates.otherAllowances || updates.pf || updates.tax || updates.otherDeductions) {
    const [existing] = await db.select().from(payrollTable).where(eq(payrollTable.id, id));
    if (existing) {
      const b = Number(updates.basicSalary ?? existing.basicSalary);
      const h = Number(updates.hra ?? existing.hra);
      const d = Number(updates.da ?? existing.da);
      const t = Number(updates.ta ?? existing.ta);
      const oa = Number(updates.otherAllowances ?? existing.otherAllowances);
      const p = Number(updates.pf ?? existing.pf);
      const tx = Number(updates.tax ?? existing.tax);
      const od = Number(updates.otherDeductions ?? existing.otherDeductions);
      updates.netSalary = String((b + h + d + t + oa) - (p + tx + od));
    }
  }
  const [record] = await db.update(payrollTable).set(updates).where(eq(payrollTable.id, id)).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json(record);
});

router.delete("/payroll/:id", async (req, res): Promise<void> => {
  await db.delete(payrollTable).where(eq(payrollTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
