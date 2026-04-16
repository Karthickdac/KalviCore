import { Router, type IRouter } from "express";
import { db, studentsTable, staffTable, feePaymentsTable, feeStructuresTable, payrollTable, certificatesTable, departmentsTable, coursesTable, examsTable, examResultsTable, subjectsTable, attendanceTable, feeInstalmentsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";
import { getInstitutionInfo } from "../lib/institutionSettings";

const router: IRouter = Router();

async function instFields() {
  const inst = await getInstitutionInfo();
  return { collegeName: inst.collegeName, location: inst.location, affiliatedUniversity: inst.affiliatedUniversity, collegeCode: inst.collegeCode, principalName: inst.principalName, currentAcademicYear: inst.currentAcademicYear, phone: inst.phone, email: inst.email, website: inst.website, address: inst.address };
}

router.get("/print/fee-receipt/:paymentId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const inst = await instFields();
    const id = Number(req.params.paymentId);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [payment] = await db.select().from(feePaymentsTable).where(eq(feePaymentsTable.id, id));
    if (!payment) { res.status(404).json({ error: "Payment not found" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, payment.studentId));
    const [feeStructure] = await db.select().from(feeStructuresTable).where(eq(feeStructuresTable.id, payment.feeStructureId));
    const dept = student ? (await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0] : null;
    const course = student ? (await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0] : null;
    res.json({ ...inst, receipt: {
      receiptNo: `RCP-${String(id).padStart(6, "0")}`, date: payment.paymentDate || new Date().toISOString(),
      studentName: student ? `${student.firstName} ${student.lastName}` : "-", rollNumber: student?.rollNumber || "-",
      department: dept?.name || "-", course: course?.name || "-", year: student?.year || "-", semester: payment.semester,
      feeType: feeStructure?.feeType || "-", amount: payment.amount, paymentMode: payment.paymentMode,
      transactionId: payment.transactionId || "-", academicYear: feeStructure?.academicYear || inst.currentAcademicYear,
    }});
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/print/payslip/:payrollId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const inst = await instFields();
    const id = Number(req.params.payrollId);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [payroll] = await db.select().from(payrollTable).where(eq(payrollTable.id, id));
    if (!payroll) { res.status(404).json({ error: "Payroll not found" }); return; }
    const [staff] = await db.select().from(staffTable).where(eq(staffTable.id, payroll.staffId));
    const dept = staff ? (await db.select().from(departmentsTable).where(eq(departmentsTable.id, staff.departmentId)))[0] : null;
    res.json({ ...inst, payslip: {
      payslipNo: `PAY-${String(id).padStart(6, "0")}`, month: payroll.month, year: payroll.year,
      staffName: staff ? `${staff.firstName} ${staff.lastName}` : "-", staffId: staff?.staffId || "-",
      department: dept?.name || "-", designation: staff?.designation || "-",
      basicSalary: payroll.basicSalary, hra: payroll.hra, da: payroll.da, ta: payroll.ta,
      otherAllowances: payroll.otherAllowances, grossSalary: payroll.grossSalary,
      pf: payroll.pf, tax: payroll.tax, otherDeductions: payroll.otherDeductions,
      totalDeductions: payroll.totalDeductions, netSalary: payroll.netSalary, status: payroll.status,
    }});
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/print/certificate/:certId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const inst = await instFields();
    const id = Number(req.params.certId);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [cert] = await db.select().from(certificatesTable).where(eq(certificatesTable.id, id));
    if (!cert) { res.status(404).json({ error: "Certificate not found" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, cert.studentId));
    const dept = student ? (await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0] : null;
    const course = student ? (await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0] : null;
    res.json({ ...inst, certificate: {
      certNo: `CERT-${String(id).padStart(6, "0")}`, type: cert.type,
      studentName: student ? `${student.firstName} ${student.lastName}` : "-", rollNumber: student?.rollNumber || "-",
      department: dept?.name || "-", course: course?.name || "-", year: student?.year || "-",
      fatherName: student?.fatherName || "-", dateOfBirth: student?.dateOfBirth || "-", admissionDate: student?.admissionDate || "-",
      status: cert.status, issuedDate: cert.issuedDate || new Date().toISOString().split("T")[0],
      reason: cert.reason || "-", gender: student?.gender || "-", community: student?.community || "-", nationality: student?.nationality || "-",
    }});
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/print/attendance-report/:studentId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const inst = await instFields();
    const studentId = Number(req.params.studentId);
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    const dept = (await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0];
    const course = (await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0];
    const summary = await db
      .select({ subjectId: attendanceTable.subjectId, subjectName: subjectsTable.name, subjectCode: subjectsTable.code,
        totalClasses: sql<number>`count(*)::int`, present: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Present')::int`,
        absent: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Absent')::int`,
        percentage: sql<number>`round((count(*) filter (where ${attendanceTable.status} = 'Present')::numeric / nullif(count(*), 0)) * 100)`,
      }).from(attendanceTable).innerJoin(subjectsTable, eq(attendanceTable.subjectId, subjectsTable.id))
      .where(eq(attendanceTable.studentId, studentId)).groupBy(attendanceTable.subjectId, subjectsTable.name, subjectsTable.code);
    const totalClasses = summary.reduce((a, s) => a + s.totalClasses, 0);
    const totalPresent = summary.reduce((a, s) => a + s.present, 0);
    res.json({ ...inst, report: {
      studentName: `${student.firstName} ${student.lastName}`, rollNumber: student.rollNumber,
      department: dept?.name || "-", course: course?.name || "-", year: student.year || "-", semester: student.semester || "-",
      academicYear: inst.currentAcademicYear, subjects: summary, totalClasses, totalPresent,
      totalAbsent: totalClasses - totalPresent, overallPercentage: totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0,
      generatedDate: new Date().toISOString().split("T")[0],
    }});
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/print/hall-ticket/:studentId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const inst = await instFields();
    const studentId = Number(req.params.studentId);
    const semester = req.query.semester ? Number(req.query.semester) : undefined;
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    const dept = (await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0];
    const course = (await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0];
    const conditions: any[] = [];
    if (semester) conditions.push(eq(examsTable.semester, semester));
    else if (student.semester) conditions.push(eq(examsTable.semester, student.semester));
    if (student.departmentId) conditions.push(eq(examsTable.departmentId, student.departmentId));
    const exams = await db.select({ id: examsTable.id, subjectName: subjectsTable.name, subjectCode: subjectsTable.code,
      type: examsTable.type, date: examsTable.date, startTime: examsTable.startTime, endTime: examsTable.endTime,
      venue: examsTable.venue, maxMarks: examsTable.maxMarks,
    }).from(examsTable).innerJoin(subjectsTable, eq(examsTable.subjectId, subjectsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(examsTable.date);
    res.json({ ...inst, hallTicket: {
      htNo: `HT-${student.rollNumber}-${semester || student.semester || 1}`,
      studentName: `${student.firstName} ${student.lastName}`, rollNumber: student.rollNumber,
      department: dept?.name || "-", course: course?.name || "-", year: student.year || "-",
      semester: semester || student.semester || 1, fatherName: student.fatherName || "-",
      dateOfBirth: student.dateOfBirth || "-", gender: student.gender || "-",
      academicYear: inst.currentAcademicYear, exams, generatedDate: new Date().toISOString().split("T")[0],
    }});
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/print/admission-letter/:studentId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const inst = await instFields();
    const studentId = Number(req.params.studentId);
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    const dept = (await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0];
    const course = (await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0];
    res.json({ ...inst, admission: {
      admissionNo: `ADM-${String(studentId).padStart(6, "0")}`,
      studentName: `${student.firstName} ${student.lastName}`, rollNumber: student.rollNumber || "-",
      fatherName: student.fatherName || "-", motherName: student.motherName || "-",
      dateOfBirth: student.dateOfBirth || "-", gender: student.gender || "-",
      community: student.community || "-", nationality: student.nationality || "Indian",
      department: dept?.name || "-", course: course?.name || "-", degreeType: course?.degreeType || "-",
      admissionDate: student.admissionDate || new Date().toISOString().split("T")[0],
      academicYear: inst.currentAcademicYear, address: student.address || "-", phone: student.phone || "-", email: student.email || "-",
      generatedDate: new Date().toISOString().split("T")[0],
    }});
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/print/mark-statement/:studentId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const inst = await instFields();
    const studentId = Number(req.params.studentId);
    const semester = req.query.semester ? Number(req.query.semester) : undefined;
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    const dept = (await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0];
    const course = (await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0];
    const conditions: any[] = [eq(examResultsTable.studentId, studentId)];
    if (semester) conditions.push(eq(examsTable.semester, semester));
    const results = await db.select({ examId: examResultsTable.examId, subjectName: subjectsTable.name, subjectCode: subjectsTable.code,
      examType: examsTable.type, maxMarks: examsTable.maxMarks, passMarks: examsTable.passMarks,
      marksObtained: examResultsTable.marksObtained, grade: examResultsTable.grade, status: examResultsTable.status, semester: examsTable.semester,
    }).from(examResultsTable).innerJoin(examsTable, eq(examResultsTable.examId, examsTable.id))
    .innerJoin(subjectsTable, eq(examsTable.subjectId, subjectsTable.id)).where(and(...conditions)).orderBy(examsTable.semester, subjectsTable.code);
    const totalMax = results.reduce((a, r) => a + (r.maxMarks || 0), 0);
    const totalObtained = results.reduce((a, r) => a + r.marksObtained, 0);
    const passedCount = results.filter(r => r.status === "Pass").length;
    const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    let overallGrade = "F";
    if (overallPct >= 90) overallGrade = "O"; else if (overallPct >= 80) overallGrade = "A+";
    else if (overallPct >= 70) overallGrade = "A"; else if (overallPct >= 60) overallGrade = "B+";
    else if (overallPct >= 50) overallGrade = "B"; else if (overallPct >= 40) overallGrade = "C";
    res.json({ ...inst, markStatement: {
      regNo: student.rollNumber || "-", studentName: `${student.firstName} ${student.lastName}`, rollNumber: student.rollNumber || "-",
      department: dept?.name || "-", course: course?.name || "-", year: student.year || "-",
      semester: semester || student.semester || 1, fatherName: student.fatherName || "-", dateOfBirth: student.dateOfBirth || "-",
      academicYear: inst.currentAcademicYear, results, totalMaxMarks: totalMax, totalMarksObtained: totalObtained,
      overallPercentage: overallPct, overallGrade, passedCount, totalSubjects: results.length,
      overallResult: passedCount === results.length && results.length > 0 ? "PASS" : "FAIL",
      generatedDate: new Date().toISOString().split("T")[0],
    }});
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/print/fee-due-notice/:studentId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const inst = await instFields();
    const studentId = Number(req.params.studentId);
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    const dept = (await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0];
    const course = (await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0];
    const pendingInstalments = await db.select({ id: feeInstalmentsTable.id, instalmentNumber: feeInstalmentsTable.instalmentNumber,
      amount: feeInstalmentsTable.amount, dueDate: feeInstalmentsTable.dueDate, status: feeInstalmentsTable.status,
    }).from(feeInstalmentsTable).where(and(eq(feeInstalmentsTable.studentId, studentId), eq(feeInstalmentsTable.status, "Pending"))).orderBy(feeInstalmentsTable.dueDate);
    const totalDue = pendingInstalments.reduce((a, i) => a + Number(i.amount || 0), 0);
    res.json({ ...inst, feeDueNotice: {
      noticeNo: `FDN-${String(studentId).padStart(6, "0")}`,
      studentName: `${student.firstName} ${student.lastName}`, rollNumber: student.rollNumber || "-",
      department: dept?.name || "-", course: course?.name || "-", year: student.year || "-", semester: student.semester || 1,
      fatherName: student.fatherName || "-", address: student.address || "-", phone: student.phone || "-",
      pendingInstalments, totalDue, generatedDate: new Date().toISOString().split("T")[0],
    }});
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/print/study-certificate/:studentId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const inst = await instFields();
    const studentId = Number(req.params.studentId);
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    const dept = (await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0];
    const course = (await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0];
    res.json({ ...inst, studyCertificate: {
      certNo: `SC-${String(studentId).padStart(6, "0")}`,
      studentName: `${student.firstName} ${student.lastName}`, rollNumber: student.rollNumber || "-",
      department: dept?.name || "-", course: course?.name || "-", degreeType: course?.degreeType || "-",
      year: student.year || "-", semester: student.semester || 1, fatherName: student.fatherName || "-",
      dateOfBirth: student.dateOfBirth || "-", admissionDate: student.admissionDate || "-",
      gender: student.gender || "-", nationality: student.nationality || "Indian", community: student.community || "-",
      medium: "English", academicYear: inst.currentAcademicYear, generatedDate: new Date().toISOString().split("T")[0],
    }});
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/print/medium-certificate/:studentId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const inst = await instFields();
    const studentId = Number(req.params.studentId);
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    const dept = (await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0];
    const course = (await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0];
    res.json({ ...inst, mediumCertificate: {
      certNo: `MOI-${String(studentId).padStart(6, "0")}`,
      studentName: `${student.firstName} ${student.lastName}`, rollNumber: student.rollNumber || "-",
      department: dept?.name || "-", course: course?.name || "-", year: student.year || "-", semester: student.semester || 1,
      fatherName: student.fatherName || "-", gender: student.gender || "-",
      medium: "English", academicYear: inst.currentAcademicYear, generatedDate: new Date().toISOString().split("T")[0],
    }});
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/print/provisional-certificate/:studentId", requireAuth, requirePermission("print_templates"), async (req, res): Promise<void> => {
  try {
    const inst = await instFields();
    const studentId = Number(req.params.studentId);
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    const dept = (await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0];
    const course = (await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0];
    const results = await db.select({ marksObtained: examResultsTable.marksObtained, maxMarks: examsTable.maxMarks, status: examResultsTable.status })
      .from(examResultsTable).innerJoin(examsTable, eq(examResultsTable.examId, examsTable.id)).where(eq(examResultsTable.studentId, studentId));
    const totalMax = results.reduce((a, r) => a + (r.maxMarks || 0), 0);
    const totalObtained = results.reduce((a, r) => a + r.marksObtained, 0);
    const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    let classObtained = "Third Class";
    if (overallPct >= 60) classObtained = "First Class"; else if (overallPct >= 50) classObtained = "Second Class";
    res.json({ ...inst, provisionalCertificate: {
      certNo: `PC-${String(studentId).padStart(6, "0")}`,
      studentName: `${student.firstName} ${student.lastName}`, rollNumber: student.rollNumber || "-",
      department: dept?.name || "-", course: course?.name || "-", degreeType: course?.degreeType || "-",
      fatherName: student.fatherName || "-", dateOfBirth: student.dateOfBirth || "-",
      gender: student.gender || "-", admissionDate: student.admissionDate || "-",
      overallPercentage: overallPct, classObtained,
      monthYear: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      academicYear: inst.currentAcademicYear, generatedDate: new Date().toISOString().split("T")[0],
    }});
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
