import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, feePaymentsTable, studentsTable, feeStructuresTable, pendingOrdersTable } from "@workspace/db";
import {
  CreateRazorpayOrderBody,
  VerifyRazorpayPaymentBody,
  GetRazorpayConfigResponse,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";
import { requireAuth } from "../middleware/auth";
import { getUserScope } from "../lib/scopeFilter";
import crypto from "crypto";

const Razorpay = require("razorpay");

const router: IRouter = Router();

function requireRazorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay API keys are not configured");
  }
  return { keyId, keySecret };
}

function getRazorpayInstance() {
  const { keyId, keySecret } = requireRazorpayKeys();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

router.get("/razorpay/config", async (_req, res): Promise<void> => {
  try {
    const { keyId } = requireRazorpayKeys();
    res.json(
      GetRazorpayConfigResponse.parse({
        keyId,
        collegeName: "KalviCore - Complete Campus. One Intelligent System",
      })
    );
  } catch {
    res.status(500).json({ error: "Razorpay is not configured" });
  }
});

router.post("/razorpay/create-order", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateRazorpayOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { studentId, feeStructureId, amount, semester, academicYear } = parsed.data;

  const scope = getUserScope(req);
  if (scope?.isStudent && scope.studentRecordId !== studentId) {
    res.status(403).json({ error: "You can only make payments for your own account" });
    return;
  }

  if (amount <= 0) {
    res.status(400).json({ error: "Amount must be greater than zero" });
    return;
  }

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const [feeStructure] = await db.select().from(feeStructuresTable).where(eq(feeStructuresTable.id, feeStructureId));
  if (!feeStructure) {
    res.status(404).json({ error: "Fee structure not found" });
    return;
  }

  if (amount > Number(feeStructure.totalFee)) {
    res.status(400).json({ error: "Amount exceeds total fee" });
    return;
  }

  try {
    const razorpay = getRazorpayInstance();
    const { keyId } = requireRazorpayKeys();
    const amountInPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `FEE-${student.rollNumber}-${Date.now()}`,
      notes: {
        studentId: String(studentId),
        feeStructureId: String(feeStructureId),
        semester: String(semester),
        academicYear,
        studentName: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
      },
    });

    await db.insert(pendingOrdersTable).values({
      razorpayOrderId: order.id,
      studentId,
      feeStructureId,
      amount: String(amount),
      semester,
      academicYear,
      status: "pending",
    });

    res.status(201).json({
      orderId: order.id,
      amount,
      currency: "INR",
      keyId,
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email || "",
      studentPhone: student.phone || "",
    });
  } catch (err: any) {
    console.error("Razorpay order creation failed:", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

router.post("/razorpay/verify-payment", requireAuth, async (req, res): Promise<void> => {
  const body = req.body;
  const razorpayOrderId = body?.razorpayOrderId;
  const razorpayPaymentId = body?.razorpayPaymentId;
  const razorpaySignature = body?.razorpaySignature;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400).json({ error: "Missing required Razorpay fields" });
    return;
  }

  const { keySecret } = requireRazorpayKeys();

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    res.status(400).json({ error: "Payment verification failed: invalid signature" });
    return;
  }

  const [pendingOrder] = await db
    .select()
    .from(pendingOrdersTable)
    .where(eq(pendingOrdersTable.razorpayOrderId, razorpayOrderId));

  if (!pendingOrder) {
    res.status(400).json({ error: "No matching pending order found" });
    return;
  }

  if (pendingOrder.status === "completed") {
    res.status(400).json({ error: "This payment has already been processed" });
    return;
  }

  const amount = Number(pendingOrder.amount);

  try {
    const receiptNumber = `RZP-${razorpayPaymentId.slice(-8).toUpperCase()}`;

    const [payment] = await db
      .insert(feePaymentsTable)
      .values({
        studentId: pendingOrder.studentId,
        feeStructureId: pendingOrder.feeStructureId,
        amountPaid: String(amount),
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMode: "Razorpay",
        receiptNumber,
        semester: pendingOrder.semester,
        academicYear: pendingOrder.academicYear,
        status: "Paid",
        razorpayOrderId,
        razorpayPaymentId,
        remarks: `Online payment via Razorpay`,
      })
      .returning();

    await db
      .update(pendingOrdersTable)
      .set({ status: "completed" })
      .where(eq(pendingOrdersTable.id, pendingOrder.id));

    await logActivity(
      "fee_payment_recorded",
      `Online fee payment of Rs.${amount} received via Razorpay`,
      receiptNumber
    );

    res.json({
      ...payment,
      amountPaid: Number(payment.amountPaid),
    });
  } catch (err: any) {
    console.error("Payment recording failed:", err);
    res.status(500).json({ error: "Payment verified but recording failed" });
  }
});

export default router;
