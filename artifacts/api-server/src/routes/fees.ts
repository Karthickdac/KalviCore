import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, feeStructuresTable, feePaymentsTable, studentsTable } from "@workspace/db";
import {
  CreateFeeStructureBody,
  ListFeeStructuresResponse,
  ListFeeStructuresQueryParams,
  RecordFeePaymentBody,
  ListFeePaymentsResponse,
  ListFeePaymentsQueryParams,
  GetStudentDuesParams,
  GetStudentDuesResponse,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

const mapFeeStructure = (f: typeof feeStructuresTable.$inferSelect) => ({
  ...f,
  tuitionFee: Number(f.tuitionFee),
  labFee: Number(f.labFee),
  libraryFee: Number(f.libraryFee),
  examFee: Number(f.examFee),
  transportFee: Number(f.transportFee),
  hostelFee: Number(f.hostelFee),
  otherFee: Number(f.otherFee),
  totalFee: Number(f.totalFee),
});

const mapFeePayment = (p: typeof feePaymentsTable.$inferSelect) => ({
  ...p,
  amountPaid: Number(p.amountPaid),
});

router.get("/fee-structures", async (req, res): Promise<void> => {
  const query = ListFeeStructuresQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  let structures;
  if (query.data.courseId) {
    structures = await db.select().from(feeStructuresTable).where(eq(feeStructuresTable.courseId, query.data.courseId));
  } else {
    structures = await db.select().from(feeStructuresTable).orderBy(feeStructuresTable.academicYear);
  }
  res.json(ListFeeStructuresResponse.parse(structures.map(mapFeeStructure)));
});

router.post("/fee-structures", async (req, res): Promise<void> => {
  const parsed = CreateFeeStructureBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const values = {
    courseId: parsed.data.courseId,
    academicYear: parsed.data.academicYear,
    tuitionFee: String(parsed.data.tuitionFee),
    labFee: String(parsed.data.labFee),
    libraryFee: String(parsed.data.libraryFee),
    examFee: String(parsed.data.examFee),
    transportFee: String(parsed.data.transportFee),
    hostelFee: String(parsed.data.hostelFee),
    otherFee: String(parsed.data.otherFee),
    totalFee: String(parsed.data.totalFee),
  };
  const [structure] = await db.insert(feeStructuresTable).values(values).returning();
  await logActivity("fee_structure_created", `Fee structure for academic year ${structure.academicYear} created`, structure.academicYear);
  res.status(201).json(mapFeeStructure(structure));
});

router.get("/fee-payments", async (req, res): Promise<void> => {
  const query = ListFeePaymentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  let payments;
  if (query.data.studentId) {
    payments = await db.select().from(feePaymentsTable).where(eq(feePaymentsTable.studentId, query.data.studentId));
  } else {
    payments = await db.select().from(feePaymentsTable).orderBy(feePaymentsTable.paymentDate).limit(500);
  }
  res.json(ListFeePaymentsResponse.parse(payments.map(mapFeePayment)));
});

router.post("/fee-payments", async (req, res): Promise<void> => {
  const parsed = RecordFeePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const values = {
    ...parsed.data,
    amountPaid: String(parsed.data.amountPaid),
  };
  const [payment] = await db.insert(feePaymentsTable).values(values).returning();
  await logActivity("fee_payment_recorded", `Fee payment of Rs.${payment.amountPaid} recorded`, payment.receiptNumber);
  res.status(201).json(mapFeePayment(payment));
});

router.get("/fee-payments/student/:studentId/dues", async (req, res): Promise<void> => {
  const params = GetStudentDuesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, params.data.studentId));
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const feeStructures = await db.select().from(feeStructuresTable).where(eq(feeStructuresTable.courseId, student.courseId));
  const totalFee = feeStructures.reduce((sum, f) => sum + Number(f.totalFee), 0);

  const payments = await db.select().from(feePaymentsTable).where(eq(feePaymentsTable.studentId, params.data.studentId));
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);

  res.json(GetStudentDuesResponse.parse({
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`,
    totalFee,
    totalPaid,
    totalDue: totalFee - totalPaid,
    payments: payments.map(mapFeePayment),
  }));
});

export default router;
