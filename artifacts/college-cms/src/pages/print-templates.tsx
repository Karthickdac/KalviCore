import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Printer, FileText, Receipt, Award, ClipboardList, GraduationCap, BookOpen, AlertCircle, UserCheck, Landmark, Loader2, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL || "";

function useApi(token: string) {
  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);
  const get = useCallback(async (url: string) => {
    const r = await fetch(`${API_BASE}${url}`, { headers: headers() });
    if (!r.ok) return null;
    return r.json();
  }, [headers]);
  return { get, headers };
}

function PrintHeader({ title, subTitle, collegeName, location, affiliatedUniversity }: { title: string; subTitle?: string; collegeName?: string; location?: string; affiliatedUniversity?: string }) {
  return (
    <div className="text-center border-b-2 border-black pb-3 mb-4">
      <p className="text-[10px] tracking-wider">Affiliated to {affiliatedUniversity || "University"}</p>
      <h1 className="text-lg font-bold uppercase">{collegeName || "College"}</h1>
      <p className="text-[10px]">{location || ""}</p>
      <h2 className="text-base font-bold mt-2 underline uppercase">{title}</h2>
      {subTitle && <p className="text-xs mt-0.5">{subTitle}</p>}
    </div>
  );
}

function PrintFooter2({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex justify-between mt-12 pt-2">
      <div className="text-center"><div className="w-32 border-t border-black pt-1 text-[10px]">{left}</div></div>
      <div className="text-center"><div className="w-32 border-t border-black pt-1 text-[10px]">{right}</div></div>
    </div>
  );
}

function PrintFooter3({ left, center, right }: { left: string; center: string; right: string }) {
  return (
    <div className="flex justify-between mt-12 pt-2">
      <div className="text-center"><div className="w-28 border-t border-black pt-1 text-[10px]">{left}</div></div>
      <div className="text-center"><div className="w-28 border-t border-black pt-1 text-[10px]">{center}</div></div>
      <div className="text-center"><div className="w-28 border-t border-black pt-1 text-[10px]">{right}</div></div>
    </div>
  );
}

function instProps(data: any) {
  return { collegeName: data?.collegeName, location: data?.location, affiliatedUniversity: data?.affiliatedUniversity };
}

function SearchableCombobox({ value, onValueChange, placeholder, options }: { value: string; onValueChange: (v: string) => void; placeholder: string; options: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal h-10 text-left">
          <span className="truncate">{selectedLabel || <span className="text-muted-foreground">{placeholder}</span>}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase().replace("select ", "")}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(o => (
                <CommandItem key={o.value} value={o.label} onSelect={() => { onValueChange(o.value); setOpen(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", value === o.value ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{o.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function InfoGrid({ items }: { items: [string, any][] }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 text-xs mb-4">
      {items.map(([label, value], i) => (
        <div key={i}><strong>{label}:</strong> {value}</div>
      ))}
    </div>
  );
}

function PrintableReceipt({ data }: { data: any }) {
  if (!data) return null;
  const r = data.receipt;
  return (
    <div className="max-w-lg mx-auto border-2 border-black p-6 bg-white text-black font-serif">
      <PrintHeader {...instProps(data)} title="Fee Receipt" />
      <InfoGrid items={[
        ["Receipt No", r.receiptNo], ["Date", r.date ? new Date(r.date).toLocaleDateString("en-IN") : "-"],
        ["Student", r.studentName], ["Roll No", r.rollNumber],
        ["Department", r.department], ["Course", r.course],
        ["Year", r.year], ["Semester", r.semester],
      ]} />
      <table className="w-full border-collapse mb-4">
        <thead><tr className="bg-gray-100"><th className="border border-black px-3 py-1.5 text-xs text-left">Description</th><th className="border border-black px-3 py-1.5 text-xs text-right">Amount (₹)</th></tr></thead>
        <tbody><tr><td className="border border-black px-3 py-1.5 text-xs">{r.feeType}</td><td className="border border-black px-3 py-1.5 text-xs text-right font-bold">₹{Number(r.amount || 0).toLocaleString("en-IN")}</td></tr></tbody>
        <tfoot><tr className="bg-gray-50"><td className="border border-black px-3 py-1.5 text-xs font-bold">Total</td><td className="border border-black px-3 py-1.5 text-xs text-right font-bold">₹{Number(r.amount || 0).toLocaleString("en-IN")}</td></tr></tfoot>
      </table>
      <div className="grid grid-cols-2 gap-1.5 text-xs mb-4">
        <div><strong>Payment Mode:</strong> {r.paymentMode}</div>
        <div><strong>Transaction ID:</strong> {r.transactionId}</div>
        <div><strong>Academic Year:</strong> {r.academicYear}</div>
      </div>
      <PrintFooter3 left="Student Signature" center="Cashier" right="Accounts Officer" />
    </div>
  );
}

function PrintablePayslip({ data }: { data: any }) {
  if (!data) return null;
  const p = data.payslip;
  const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return (
    <div className="max-w-lg mx-auto border-2 border-black p-6 bg-white text-black font-serif">
      <PrintHeader {...instProps(data)} title={`Salary Slip — ${months[p.month] || p.month} ${p.year}`} />
      <InfoGrid items={[
        ["Payslip No", p.payslipNo], ["Staff ID", p.staffId],
        ["Name", p.staffName], ["Department", p.department],
        ["Designation", p.designation],
      ]} />
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-xs font-bold border-b border-black mb-1">EARNINGS</h3>
          <table className="w-full text-xs"><tbody>
            <tr><td>Basic Salary</td><td className="text-right">₹{Number(p.basicSalary || 0).toLocaleString("en-IN")}</td></tr>
            <tr><td>HRA</td><td className="text-right">₹{Number(p.hra || 0).toLocaleString("en-IN")}</td></tr>
            <tr><td>DA</td><td className="text-right">₹{Number(p.da || 0).toLocaleString("en-IN")}</td></tr>
            <tr><td>TA</td><td className="text-right">₹{Number(p.ta || 0).toLocaleString("en-IN")}</td></tr>
            <tr><td>Other Allowances</td><td className="text-right">₹{Number(p.otherAllowances || 0).toLocaleString("en-IN")}</td></tr>
            <tr className="font-bold border-t border-black"><td>Gross</td><td className="text-right">₹{Number(p.grossSalary || 0).toLocaleString("en-IN")}</td></tr>
          </tbody></table>
        </div>
        <div>
          <h3 className="text-xs font-bold border-b border-black mb-1">DEDUCTIONS</h3>
          <table className="w-full text-xs"><tbody>
            <tr><td>PF</td><td className="text-right">₹{Number(p.pf || 0).toLocaleString("en-IN")}</td></tr>
            <tr><td>Tax</td><td className="text-right">₹{Number(p.tax || 0).toLocaleString("en-IN")}</td></tr>
            <tr><td>Other Deductions</td><td className="text-right">₹{Number(p.otherDeductions || 0).toLocaleString("en-IN")}</td></tr>
            <tr className="font-bold border-t border-black"><td>Total</td><td className="text-right">₹{Number(p.totalDeductions || 0).toLocaleString("en-IN")}</td></tr>
          </tbody></table>
        </div>
      </div>
      <div className="border-2 border-black p-3 text-center mb-4">
        <p className="text-xs">NET PAY</p>
        <p className="text-xl font-bold">₹{Number(p.netSalary || 0).toLocaleString("en-IN")}</p>
      </div>
      <PrintFooter3 left="Employee Signature" center="HR Department" right="Principal" />
    </div>
  );
}

function PrintableCertificate({ data }: { data: any }) {
  if (!data) return null;
  const c = data.certificate;
  const pronoun = c.gender === "Male" ? "He" : "She";
  const relation = c.gender === "Male" ? "S/o" : "D/o";
  const possessive = c.gender === "Male" ? "His" : "Her";
  return (
    <div className="max-w-lg mx-auto border-[3px] border-double border-black p-8 bg-white text-black font-serif">
      <PrintHeader {...instProps(data)} title={c.type} subTitle={`No: ${c.certNo}`} />
      <div className="text-sm leading-relaxed space-y-4">
        {c.type === "Bonafide Certificate" && (
          <p className="text-justify">This is to certify that <strong>{c.studentName}</strong>, Roll Number <strong>{c.rollNumber}</strong>, {relation} <strong>{c.fatherName}</strong>, is a bonafide student of this institution, pursuing <strong>{c.course}</strong> in the Department of <strong>{c.department}</strong>. {pronoun} is currently in Year <strong>{c.year}</strong>.</p>
        )}
        {c.type === "Transfer Certificate" && (
          <>
            <p className="text-justify">This is to certify that <strong>{c.studentName}</strong>, Roll Number <strong>{c.rollNumber}</strong>, {relation} <strong>{c.fatherName}</strong>, was a student of this institution.</p>
            <InfoGrid items={[
              ["Date of Birth", c.dateOfBirth], ["Nationality", c.nationality],
              ["Community", c.community], ["Course", c.course],
              ["Date of Admission", c.admissionDate], ["Department", c.department],
            ]} />
            <p className="text-justify">{possessive} conduct and character during the period of study were <strong>GOOD</strong>.</p>
          </>
        )}
        {c.type === "Conduct Certificate" && (
          <p className="text-justify">This is to certify that <strong>{c.studentName}</strong>, Roll Number <strong>{c.rollNumber}</strong>, {relation} <strong>{c.fatherName}</strong>, is a student of this institution pursuing <strong>{c.course}</strong> in the Department of <strong>{c.department}</strong>. {possessive} conduct and character are <strong>GOOD</strong>.</p>
        )}
        {!["Bonafide Certificate", "Transfer Certificate", "Conduct Certificate"].includes(c.type) && (
          <p className="text-justify">This is to certify that <strong>{c.studentName}</strong>, Roll Number <strong>{c.rollNumber}</strong>, is a student of this institution in the Department of <strong>{c.department}</strong>, pursuing <strong>{c.course}</strong>.</p>
        )}
      </div>
      <div className="mt-4 text-xs"><strong>Date:</strong> {c.issuedDate}</div>
      <PrintFooter2 left="HOD" right="Principal" />
    </div>
  );
}

function PrintableAttendanceReport({ data }: { data: any }) {
  if (!data) return null;
  const r = data.report;
  return (
    <div className="max-w-lg mx-auto border-2 border-black p-6 bg-white text-black font-serif">
      <PrintHeader {...instProps(data)} title="Attendance Report" />
      <InfoGrid items={[
        ["Student Name", r.studentName], ["Roll Number", r.rollNumber],
        ["Department", r.department], ["Course", r.course],
        ["Year / Semester", `${r.year} / Sem ${r.semester}`], ["Academic Year", r.academicYear],
      ]} />
      {r.subjects?.length > 0 ? (
        <>
          <table className="w-full border-collapse mb-3">
            <thead><tr className="bg-gray-100">
              <th className="border border-black px-2 py-1 text-[10px] text-left">Code</th>
              <th className="border border-black px-2 py-1 text-[10px] text-left">Subject</th>
              <th className="border border-black px-2 py-1 text-[10px] text-center">Total</th>
              <th className="border border-black px-2 py-1 text-[10px] text-center">Present</th>
              <th className="border border-black px-2 py-1 text-[10px] text-center">Absent</th>
              <th className="border border-black px-2 py-1 text-[10px] text-center">%</th>
            </tr></thead>
            <tbody>
              {r.subjects.map((s: any) => (
                <tr key={s.subjectId}>
                  <td className="border border-black px-2 py-1 text-[10px]">{s.subjectCode}</td>
                  <td className="border border-black px-2 py-1 text-[10px]">{s.subjectName}</td>
                  <td className="border border-black px-2 py-1 text-[10px] text-center">{s.totalClasses}</td>
                  <td className="border border-black px-2 py-1 text-[10px] text-center">{s.present}</td>
                  <td className="border border-black px-2 py-1 text-[10px] text-center">{s.absent}</td>
                  <td className="border border-black px-2 py-1 text-[10px] text-center font-bold">{s.percentage}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-gray-50 font-bold">
              <td colSpan={2} className="border border-black px-2 py-1 text-[10px]">Overall</td>
              <td className="border border-black px-2 py-1 text-[10px] text-center">{r.totalClasses}</td>
              <td className="border border-black px-2 py-1 text-[10px] text-center">{r.totalPresent}</td>
              <td className="border border-black px-2 py-1 text-[10px] text-center">{r.totalAbsent}</td>
              <td className="border border-black px-2 py-1 text-[10px] text-center">{r.overallPercentage}%</td>
            </tr></tfoot>
          </table>
          {r.overallPercentage < 75 && (
            <p className="text-xs text-center font-bold border border-black p-2 mb-2">⚠ Overall attendance below 75% minimum threshold</p>
          )}
        </>
      ) : (
        <p className="text-xs text-center py-4">No attendance records found.</p>
      )}
      <div className="text-[10px] mt-2"><strong>Date of Issue:</strong> {r.generatedDate}</div>
      <PrintFooter3 left="Class Advisor" center="HOD" right="Principal" />
    </div>
  );
}

function PrintableHallTicket({ data }: { data: any }) {
  if (!data) return null;
  const h = data.hallTicket;
  return (
    <div className="max-w-lg mx-auto border-2 border-black p-6 bg-white text-black font-serif">
      <PrintHeader {...instProps(data)} title="Examination Hall Ticket" subTitle={`No: ${h.htNo}`} />
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <InfoGrid items={[
            ["Name", h.studentName], ["Roll No", h.rollNumber],
            ["Father's Name", h.fatherName], ["D.O.B", h.dateOfBirth],
            ["Department", h.department], ["Course", h.course],
            ["Year / Semester", `${h.year} / Sem ${h.semester}`], ["Academic Year", h.academicYear],
          ]} />
        </div>
        <div className="w-24 h-28 border-2 border-black flex items-center justify-center text-[10px] text-gray-400 flex-shrink-0">
          PHOTO
        </div>
      </div>
      {h.exams?.length > 0 ? (
        <table className="w-full border-collapse mb-4">
          <thead><tr className="bg-gray-100">
            <th className="border border-black px-2 py-1 text-[10px] text-left">Date</th>
            <th className="border border-black px-2 py-1 text-[10px] text-left">Subject</th>
            <th className="border border-black px-2 py-1 text-[10px] text-center">Time</th>
            <th className="border border-black px-2 py-1 text-[10px] text-center">Venue</th>
            <th className="border border-black px-2 py-1 text-[10px] text-center">Max</th>
          </tr></thead>
          <tbody>
            {h.exams.map((e: any) => (
              <tr key={e.id}>
                <td className="border border-black px-2 py-1 text-[10px]">{e.date}</td>
                <td className="border border-black px-2 py-1 text-[10px]">{e.subjectCode} - {e.subjectName}</td>
                <td className="border border-black px-2 py-1 text-[10px] text-center">{e.startTime || "-"} - {e.endTime || "-"}</td>
                <td className="border border-black px-2 py-1 text-[10px] text-center">{e.venue || "-"}</td>
                <td className="border border-black px-2 py-1 text-[10px] text-center">{e.maxMarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-xs text-center py-4 border border-black mb-4">No exams scheduled for this semester.</p>
      )}
      <div className="text-[10px] space-y-0.5 mb-2">
        <p className="font-bold">Instructions:</p>
        <p>1. Students must carry this hall ticket to the examination hall.</p>
        <p>2. Use of electronic devices is strictly prohibited.</p>
        <p>3. Students must be present 15 minutes before the exam.</p>
        <p>4. Late entry beyond 30 minutes is not permitted.</p>
      </div>
      <PrintFooter2 left="Student Signature" right="Controller of Examinations" />
    </div>
  );
}

function PrintableAdmissionLetter({ data }: { data: any }) {
  if (!data) return null;
  const a = data.admission;
  return (
    <div className="max-w-lg mx-auto border-2 border-black p-6 bg-white text-black font-serif">
      <PrintHeader {...instProps(data)} title="Admission Letter" subTitle={`No: ${a.admissionNo}`} />
      <div className="text-xs mb-3"><strong>Date:</strong> {a.generatedDate}</div>
      <div className="text-sm leading-relaxed space-y-3">
        <p>To,</p>
        <p><strong>{a.studentName}</strong><br />{a.address}</p>
        <p>Dear <strong>{a.studentName}</strong>,</p>
        <p className="text-justify">We are pleased to inform you that you have been admitted to <strong>{data.collegeName || "this institution"}</strong>, affiliated to <strong>{data.affiliatedUniversity || "the University"}</strong>, for the academic year <strong>{a.academicYear}</strong>.</p>
        <p className="font-bold text-center my-3">Admission Details</p>
        <InfoGrid items={[
          ["Course", a.course], ["Degree", a.degreeType],
          ["Department", a.department], ["Admission Date", a.admissionDate],
          ["Roll Number", a.rollNumber], ["Academic Year", a.academicYear],
        ]} />
        <InfoGrid items={[
          ["Student Name", a.studentName], ["Father's Name", a.fatherName],
          ["Mother's Name", a.motherName], ["Date of Birth", a.dateOfBirth],
          ["Gender", a.gender], ["Community", a.community],
          ["Phone", a.phone], ["Email", a.email],
        ]} />
        <p className="text-justify text-xs">You are requested to report to the college with all original documents and complete the admission formalities on or before the date mentioned. Failure to report may result in cancellation of your admission.</p>
        <p className="text-xs mt-2">Congratulations and we wish you a successful academic career.</p>
      </div>
      <PrintFooter2 left="Admission Officer" right="Principal" />
    </div>
  );
}

function PrintableMarkStatement({ data }: { data: any }) {
  if (!data) return null;
  const m = data.markStatement;
  return (
    <div className="max-w-lg mx-auto border-[3px] border-double border-black p-6 bg-white text-black font-serif">
      <PrintHeader {...instProps(data)} title="Statement of Marks" subTitle={`Semester ${m.semester} Examination`} />
      <InfoGrid items={[
        ["Reg. No", m.regNo], ["Name", m.studentName],
        ["Father's Name", m.fatherName], ["D.O.B", m.dateOfBirth],
        ["Department", m.department], ["Course", m.course],
        ["Year / Semester", `${m.year} / Sem ${m.semester}`], ["Academic Year", m.academicYear],
      ]} />
      {m.results?.length > 0 ? (
        <>
          <table className="w-full border-collapse mb-3">
            <thead><tr className="bg-gray-100">
              <th className="border border-black px-2 py-1 text-[10px] text-left">Code</th>
              <th className="border border-black px-2 py-1 text-[10px] text-left">Subject</th>
              <th className="border border-black px-2 py-1 text-[10px] text-center">Max</th>
              <th className="border border-black px-2 py-1 text-[10px] text-center">Obtained</th>
              <th className="border border-black px-2 py-1 text-[10px] text-center">Grade</th>
              <th className="border border-black px-2 py-1 text-[10px] text-center">Result</th>
            </tr></thead>
            <tbody>
              {m.results.map((r: any, i: number) => (
                <tr key={i}>
                  <td className="border border-black px-2 py-1 text-[10px]">{r.subjectCode}</td>
                  <td className="border border-black px-2 py-1 text-[10px]">{r.subjectName}</td>
                  <td className="border border-black px-2 py-1 text-[10px] text-center">{r.maxMarks}</td>
                  <td className="border border-black px-2 py-1 text-[10px] text-center font-bold">{r.marksObtained}</td>
                  <td className="border border-black px-2 py-1 text-[10px] text-center font-bold">{r.grade || "-"}</td>
                  <td className="border border-black px-2 py-1 text-[10px] text-center">{r.status}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-gray-50 font-bold">
              <td colSpan={2} className="border border-black px-2 py-1 text-[10px]">Total</td>
              <td className="border border-black px-2 py-1 text-[10px] text-center">{m.totalMaxMarks}</td>
              <td className="border border-black px-2 py-1 text-[10px] text-center">{m.totalMarksObtained}</td>
              <td className="border border-black px-2 py-1 text-[10px] text-center">{m.overallGrade}</td>
              <td className="border border-black px-2 py-1 text-[10px] text-center">{m.overallResult}</td>
            </tr></tfoot>
          </table>
          <div className="border border-black p-2 text-xs text-center">
            <strong>Overall Percentage:</strong> {m.overallPercentage}% | <strong>Grade:</strong> {m.overallGrade} | <strong>Result:</strong> {m.overallResult}
          </div>
        </>
      ) : (
        <p className="text-xs text-center py-4 border border-black">No exam results found.</p>
      )}
      <div className="text-[10px] mt-2"><strong>Date of Issue:</strong> {m.generatedDate}</div>
      <PrintFooter3 left="Tabulator" center="Controller of Examinations" right="Principal" />
    </div>
  );
}

function PrintableFeeDueNotice({ data }: { data: any }) {
  if (!data) return null;
  const n = data.feeDueNotice;
  return (
    <div className="max-w-lg mx-auto border-2 border-black p-6 bg-white text-black font-serif">
      <PrintHeader {...instProps(data)} title="Fee Due Notice" subTitle={`Notice No: ${n.noticeNo}`} />
      <div className="text-xs mb-3"><strong>Date:</strong> {n.generatedDate}</div>
      <div className="text-sm leading-relaxed space-y-3">
        <p>To,</p>
        <p><strong>Mr./Mrs. {n.fatherName}</strong> (Parent/Guardian)<br />{n.address}</p>
        <p>Dear Sir/Madam,</p>
        <p className="text-justify">This is to inform you that the following fee instalments for your ward <strong>{n.studentName}</strong> (Roll No: <strong>{n.rollNumber}</strong>), studying in <strong>{n.course}</strong>, Department of <strong>{n.department}</strong>, Year {n.year} / Semester {n.semester}, are pending:</p>
        {n.pendingInstalments?.length > 0 ? (
          <table className="w-full border-collapse mb-3">
            <thead><tr className="bg-gray-100">
              <th className="border border-black px-2 py-1 text-[10px] text-left">Instalment</th>
              <th className="border border-black px-2 py-1 text-[10px] text-center">Due Date</th>
              <th className="border border-black px-2 py-1 text-[10px] text-right">Amount (₹)</th>
            </tr></thead>
            <tbody>
              {n.pendingInstalments.map((i: any) => (
                <tr key={i.id}>
                  <td className="border border-black px-2 py-1 text-[10px]">Instalment {i.instalmentNumber}</td>
                  <td className="border border-black px-2 py-1 text-[10px] text-center">{i.dueDate}</td>
                  <td className="border border-black px-2 py-1 text-[10px] text-right">₹{Number(i.amount || 0).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-gray-50 font-bold">
              <td colSpan={2} className="border border-black px-2 py-1 text-[10px]">Total Due</td>
              <td className="border border-black px-2 py-1 text-[10px] text-right">₹{Number(n.totalDue || 0).toLocaleString("en-IN")}</td>
            </tr></tfoot>
          </table>
        ) : (
          <p className="text-xs text-center py-3 border border-black">No pending instalments found.</p>
        )}
        <p className="text-justify text-xs">You are requested to clear the pending dues at the earliest to avoid any inconvenience. Failure to pay may result in the student being barred from examinations.</p>
        <p className="text-xs">For queries, contact the Accounts Department.</p>
      </div>
      <PrintFooter2 left="Accounts Officer" right="Principal" />
    </div>
  );
}

function PrintableStudyCertificate({ data }: { data: any }) {
  if (!data) return null;
  const s = data.studyCertificate;
  const pronoun = s.gender === "Male" ? "He" : "She";
  const relation = s.gender === "Male" ? "S/o" : "D/o";
  return (
    <div className="max-w-lg mx-auto border-[3px] border-double border-black p-8 bg-white text-black font-serif">
      <PrintHeader {...instProps(data)} title="Study Certificate" subTitle={`No: ${s.certNo}`} />
      <div className="text-sm leading-relaxed space-y-4">
        <p className="text-justify">This is to certify that <strong>{s.studentName}</strong>, Roll Number <strong>{s.rollNumber}</strong>, {relation} <strong>{s.fatherName}</strong>, born on <strong>{s.dateOfBirth}</strong>, is a bonafide student of this institution.</p>
        <InfoGrid items={[
          ["Course", s.course], ["Degree", s.degreeType],
          ["Department", s.department], ["Year / Semester", `${s.year} / Sem ${s.semester}`],
          ["Date of Admission", s.admissionDate], ["Academic Year", s.academicYear],
          ["Nationality", s.nationality], ["Community", s.community],
        ]} />
        <p className="text-justify">{pronoun} is studying in this institution during the academic year <strong>{s.academicYear}</strong>. {pronoun} bears a good moral character.</p>
        <p className="text-justify text-xs">This certificate is issued at the request of the student for the purpose of records.</p>
      </div>
      <div className="text-[10px] mt-2"><strong>Date:</strong> {s.generatedDate}</div>
      <PrintFooter2 left="HOD" right="Principal" />
    </div>
  );
}

function PrintableMediumCertificate({ data }: { data: any }) {
  if (!data) return null;
  const m = data.mediumCertificate;
  const pronoun = m.gender === "Male" ? "He" : "She";
  const relation = m.gender === "Male" ? "S/o" : "D/o";
  return (
    <div className="max-w-lg mx-auto border-[3px] border-double border-black p-8 bg-white text-black font-serif">
      <PrintHeader {...instProps(data)} title="Medium of Instruction Certificate" subTitle={`No: ${m.certNo}`} />
      <div className="text-sm leading-relaxed space-y-4">
        <p className="text-justify">This is to certify that <strong>{m.studentName}</strong>, Roll Number <strong>{m.rollNumber}</strong>, {relation} <strong>{m.fatherName}</strong>, is a bonafide student of this institution, pursuing <strong>{m.course}</strong> in the Department of <strong>{m.department}</strong>.</p>
        <p className="text-justify">{pronoun} is studying in Year <strong>{m.year}</strong>, Semester <strong>{m.semester}</strong> during the academic year <strong>{m.academicYear}</strong>.</p>
        <p className="text-justify">The medium of instruction for the course is <strong className="uppercase">{m.medium}</strong>.</p>
        <p className="text-justify text-xs">This certificate is issued at the request of the student for the purpose of records.</p>
      </div>
      <div className="text-[10px] mt-2"><strong>Date:</strong> {m.generatedDate}</div>
      <PrintFooter2 left="HOD" right="Principal" />
    </div>
  );
}

function PrintableProvisionalCertificate({ data }: { data: any }) {
  if (!data) return null;
  const p = data.provisionalCertificate;
  const relation = p.gender === "Male" ? "S/o" : "D/o";
  return (
    <div className="max-w-lg mx-auto border-[3px] border-double border-black p-8 bg-white text-black font-serif">
      <PrintHeader {...instProps(data)} title="Provisional Certificate" subTitle={`No: ${p.certNo}`} />
      <div className="text-sm leading-relaxed space-y-4">
        <p className="text-justify">This is to certify that <strong>{p.studentName}</strong>, Roll Number <strong>{p.rollNumber}</strong>, {relation} <strong>{p.fatherName}</strong>, born on <strong>{p.dateOfBirth}</strong>, has successfully completed the <strong>{p.degreeType}</strong> degree program in <strong>{p.course}</strong> from the Department of <strong>{p.department}</strong>.</p>
        <InfoGrid items={[
          ["Date of Admission", p.admissionDate], ["Month & Year of Passing", p.monthYear],
          ["Overall Percentage", `${p.overallPercentage}%`], ["Class Obtained", p.classObtained],
          ["Academic Year", p.academicYear],
        ]} />
        <p className="text-justify">This provisional certificate is issued pending the conferment of the degree by <strong>{data.affiliatedUniversity || "the University"}</strong>.</p>
        <p className="text-justify text-xs">This certificate is valid until the original degree certificate is issued by the university.</p>
      </div>
      <div className="text-[10px] mt-2"><strong>Date:</strong> {p.generatedDate}</div>
      <PrintFooter3 left="HOD" center="Controller of Examinations" right="Principal" />
    </div>
  );
}

interface StudentOption { id: number; rollNumber: string; firstName: string; lastName: string; }
interface PaymentOption { id: number; amount: string; paymentMode: string; }
interface PayrollOption { id: number; month: number; year: number; status: string; }
interface CertOption { id: number; type: string; status: string; }

export default function PrintTemplatesPage() {
  const { token } = useAuth();
  const { get } = useApi(token);
  const [tab, setTab] = useState("fee-receipt");
  const [selectedId, setSelectedId] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [printData, setPrintData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [students, setStudents] = useState<StudentOption[]>([]);
  const [feePayments, setFeePayments] = useState<PaymentOption[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollOption[]>([]);
  const [certificates, setCertificates] = useState<CertOption[]>([]);

  useEffect(() => {
    Promise.all([
      get("/api/students"), get("/api/fee-payments"), get("/api/payroll"), get("/api/certificates"),
    ]).then(([st, fp, pr, ce]) => {
      if (st) setStudents(st);
      if (fp) setFeePayments(fp);
      if (pr) setPayrolls(pr);
      if (ce) setCertificates(ce);
    });
  }, [get]);

  useEffect(() => {
    if (!selectedId) { setPrintData(null); return; }
    setLoading(true);
    const endpoints: Record<string, string> = {
      "fee-receipt": `/api/print/fee-receipt/${selectedId}`,
      "payslip": `/api/print/payslip/${selectedId}`,
      "certificate": `/api/print/certificate/${selectedId}`,
      "attendance-report": `/api/print/attendance-report/${selectedId}`,
      "hall-ticket": `/api/print/hall-ticket/${selectedId}${semesterFilter ? `?semester=${semesterFilter}` : ""}`,
      "admission-letter": `/api/print/admission-letter/${selectedId}`,
      "mark-statement": `/api/print/mark-statement/${selectedId}${semesterFilter ? `?semester=${semesterFilter}` : ""}`,
      "fee-due-notice": `/api/print/fee-due-notice/${selectedId}`,
      "study-certificate": `/api/print/study-certificate/${selectedId}`,
      "medium-certificate": `/api/print/medium-certificate/${selectedId}`,
      "provisional-certificate": `/api/print/provisional-certificate/${selectedId}`,
    };
    get(endpoints[tab] || "")
      .then(setPrintData)
      .catch(() => setPrintData(null))
      .finally(() => setLoading(false));
  }, [selectedId, tab, semesterFilter, get]);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Print</title><style>body{font-family:'Times New Roman',serif;margin:20px;} table{border-collapse:collapse;width:100%;} td,th{padding:4px 8px;} .font-bold{font-weight:bold;} .text-center{text-align:center;} .text-right{text-align:right;} .text-justify{text-align:justify;} .underline{text-decoration:underline;} .uppercase{text-transform:uppercase;} strong{font-weight:bold;} @media print{body{margin:0;}}</style></head><body>${content.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  const studentTabs = ["attendance-report", "hall-ticket", "admission-letter", "mark-statement", "fee-due-notice", "study-certificate", "medium-certificate", "provisional-certificate"];
  const showSemesterFilter = ["hall-ticket", "mark-statement"].includes(tab);
  const isStudentTab = studentTabs.includes(tab);

  const tabConfig: { value: string; label: string; icon: any; }[] = [
    { value: "fee-receipt", label: "Fee Receipt", icon: Receipt },
    { value: "payslip", label: "Payslip", icon: FileText },
    { value: "certificate", label: "Certificate", icon: Award },
    { value: "attendance-report", label: "Attendance Report", icon: ClipboardList },
    { value: "hall-ticket", label: "Hall Ticket", icon: GraduationCap },
    { value: "admission-letter", label: "Admission Letter", icon: Landmark },
    { value: "mark-statement", label: "Mark Statement", icon: BookOpen },
    { value: "fee-due-notice", label: "Fee Due Notice", icon: AlertCircle },
    { value: "study-certificate", label: "Study Certificate", icon: UserCheck },
    { value: "medium-certificate", label: "Medium Certificate", icon: BookOpen },
    { value: "provisional-certificate", label: "Provisional Certificate", icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Printer className="h-6 w-6 text-emerald-500" />
            Print Templates
          </h1>
          <p className="text-muted-foreground">Generate printable documents — receipts, certificates, reports, and more.</p>
        </div>
        {printData && (
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> Print Document
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSelectedId(""); setPrintData(null); setSemesterFilter(""); }}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {tabConfig.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 text-xs px-3 py-1.5">
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map(t => (
          <TabsContent key={t.value} value={t.value}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><t.icon className="h-4 w-4" /> {t.label}</CardTitle>
                <CardDescription>
                  {t.value === "fee-receipt" && "Select a fee payment to generate a printable receipt."}
                  {t.value === "payslip" && "Select a payroll record to generate a salary slip."}
                  {t.value === "certificate" && "Select a certificate to generate the printable version."}
                  {t.value === "attendance-report" && "Select a student to generate their attendance report."}
                  {t.value === "hall-ticket" && "Select a student and semester to generate an exam hall ticket."}
                  {t.value === "admission-letter" && "Select a student to generate their admission offer letter."}
                  {t.value === "mark-statement" && "Select a student and semester to generate their mark statement."}
                  {t.value === "fee-due-notice" && "Select a student to generate a fee due notice for pending payments."}
                  {t.value === "study-certificate" && "Select a student to generate a study / enrollment certificate."}
                  {t.value === "medium-certificate" && "Select a student to generate a medium of instruction certificate."}
                  {t.value === "provisional-certificate" && "Select a student to generate a provisional degree certificate."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 flex-wrap items-end">
                  <div className="space-y-1.5 flex-1 min-w-[250px]">
                    <Label>{isStudentTab ? "Student" : t.value === "fee-receipt" ? "Fee Payment" : t.value === "payslip" ? "Payroll Record" : "Certificate"}</Label>
                    {t.value === "fee-receipt" && (
                      <SearchableCombobox
                        value={selectedId}
                        onValueChange={setSelectedId}
                        placeholder="Select a payment record..."
                        options={feePayments.map(p => ({ value: String(p.id), label: `Payment #${p.id} — ₹${Number(p.amount || 0).toLocaleString("en-IN")} (${p.paymentMode})` }))}
                      />
                    )}
                    {t.value === "payslip" && (
                      <SearchableCombobox
                        value={selectedId}
                        onValueChange={setSelectedId}
                        placeholder="Select a payroll record..."
                        options={payrolls.map(p => ({ value: String(p.id), label: `Payroll #${p.id} — Month ${p.month}/${p.year} (${p.status})` }))}
                      />
                    )}
                    {t.value === "certificate" && (
                      <SearchableCombobox
                        value={selectedId}
                        onValueChange={setSelectedId}
                        placeholder="Select a certificate..."
                        options={certificates.map(c => ({ value: String(c.id), label: `#${c.id} — ${c.type} (${c.status})` }))}
                      />
                    )}
                    {isStudentTab && (
                      <SearchableCombobox
                        value={selectedId}
                        onValueChange={setSelectedId}
                        placeholder="Select a student..."
                        options={students.map(s => ({ value: String(s.id), label: `${s.rollNumber} — ${s.firstName} ${s.lastName}` }))}
                      />
                    )}
                  </div>
                  {showSemesterFilter && (
                    <div className="space-y-1.5 w-[160px]">
                      <Label>Semester</Label>
                      <SearchableCombobox
                        value={semesterFilter}
                        onValueChange={setSemesterFilter}
                        placeholder="All Semesters"
                        options={[{ value: "all", label: "All" }, ...[1,2,3,4,5,6,7,8].map(s => ({ value: String(s), label: `Semester ${s}` }))]}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {loading && (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      )}

      {printData && !loading && (
        <div ref={printRef}>
          {tab === "fee-receipt" && <PrintableReceipt data={printData} />}
          {tab === "payslip" && <PrintablePayslip data={printData} />}
          {tab === "certificate" && <PrintableCertificate data={printData} />}
          {tab === "attendance-report" && <PrintableAttendanceReport data={printData} />}
          {tab === "hall-ticket" && <PrintableHallTicket data={printData} />}
          {tab === "admission-letter" && <PrintableAdmissionLetter data={printData} />}
          {tab === "mark-statement" && <PrintableMarkStatement data={printData} />}
          {tab === "fee-due-notice" && <PrintableFeeDueNotice data={printData} />}
          {tab === "study-certificate" && <PrintableStudyCertificate data={printData} />}
          {tab === "medium-certificate" && <PrintableMediumCertificate data={printData} />}
          {tab === "provisional-certificate" && <PrintableProvisionalCertificate data={printData} />}
        </div>
      )}

      {!selectedId && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Printer className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Select a record above to preview the printable document.</p>
            <p className="text-xs mt-1">Click "Print Document" to print or save as PDF.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
