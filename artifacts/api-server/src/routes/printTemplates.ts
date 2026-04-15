import { Router, type IRouter } from "express";
import { db, studentsTable, staffTable, feePaymentsTable, feeStructuresTable, payrollTable, certificatesTable, departmentsTable, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";

const router: IRouter = Router();

router.get("/print/fee-receipt/:paymentId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.paymentId);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [payment] = await db.select().from(feePaymentsTable).where(eq(feePaymentsTable.id, id));
    if (!payment) { res.status(404).json({ error: "Payment not found" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, payment.studentId));
    const [feeStructure] = await db.select().from(feeStructuresTable).where(eq(feeStructuresTable.id, payment.feeStructureId));
    const dept = student ? (await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0] : null;
    const course = student ? (await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0] : null;

    res.json({
      receipt: {
        receiptNo: `RCP-${String(id).padStart(6, "0")}`,
        date: payment.paymentDate || new Date().toISOString(),
        studentName: student ? `${student.firstName} ${student.lastName}` : "-",
        rollNumber: student?.rollNumber || "-",
        department: dept?.name || "-",
        course: course?.name || "-",
        year: student?.year || "-",
        semester: payment.semester,
        feeType: feeStructure?.feeType || "-",
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        transactionId: payment.transactionId || "-",
        academicYear: feeStructure?.academicYear || "-",
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/print/payslip/:payrollId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.payrollId);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [payroll] = await db.select().from(payrollTable).where(eq(payrollTable.id, id));
    if (!payroll) { res.status(404).json({ error: "Payroll not found" }); return; }
    const [staff] = await db.select().from(staffTable).where(eq(staffTable.id, payroll.staffId));
    const dept = staff ? (await db.select().from(departmentsTable).where(eq(departmentsTable.id, staff.departmentId)))[0] : null;

    res.json({
      payslip: {
        payslipNo: `PAY-${String(id).padStart(6, "0")}`,
        month: payroll.month,
        year: payroll.year,
        staffName: staff ? `${staff.firstName} ${staff.lastName}` : "-",
        staffId: staff?.staffId || "-",
        department: dept?.name || "-",
        designation: staff?.designation || "-",
        basicSalary: payroll.basicSalary,
        hra: payroll.hra,
        da: payroll.da,
        ta: payroll.ta,
        otherAllowances: payroll.otherAllowances,
        grossSalary: payroll.grossSalary,
        pf: payroll.pf,
        tax: payroll.tax,
        otherDeductions: payroll.otherDeductions,
        totalDeductions: payroll.totalDeductions,
        netSalary: payroll.netSalary,
        status: payroll.status,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/print/certificate/:certId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.certId);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [cert] = await db.select().from(certificatesTable).where(eq(certificatesTable.id, id));
    if (!cert) { res.status(404).json({ error: "Certificate not found" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, cert.studentId));
    const dept = student ? (await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0] : null;
    const course = student ? (await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0] : null;

    res.json({
      certificate: {
        certNo: `CERT-${String(id).padStart(6, "0")}`,
        type: cert.type,
        studentName: student ? `${student.firstName} ${student.lastName}` : "-",
        rollNumber: student?.rollNumber || "-",
        department: dept?.name || "-",
        course: course?.name || "-",
        year: student?.year || "-",
        fatherName: student?.fatherName || "-",
        dateOfBirth: student?.dateOfBirth || "-",
        admissionDate: student?.admissionDate || "-",
        status: cert.status,
        issuedDate: cert.issuedDate || new Date().toISOString().split("T")[0],
        reason: cert.reason || "-",
        gender: student?.gender || "-",
        community: student?.community || "-",
        nationality: student?.nationality || "-",
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
