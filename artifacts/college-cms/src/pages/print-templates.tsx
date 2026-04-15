import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { useListFeePayments, useListCertificates } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, FileText, Receipt, Award } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

function PrintableReceipt({ data }: { data: any }) {
  if (!data) return null;
  const r = data.receipt;
  return (
    <div className="max-w-lg mx-auto border-2 border-black p-6 bg-white text-black font-serif">
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <h1 className="text-lg font-bold">ANNA UNIVERSITY AFFILIATED COLLEGE</h1>
        <p className="text-xs">Tamil Nadu, India</p>
        <h2 className="text-base font-bold mt-2 underline">FEE RECEIPT</h2>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div><strong>Receipt No:</strong> {r.receiptNo}</div>
        <div><strong>Date:</strong> {r.date ? new Date(r.date).toLocaleDateString("en-IN") : "-"}</div>
        <div><strong>Student:</strong> {r.studentName}</div>
        <div><strong>Roll No:</strong> {r.rollNumber}</div>
        <div><strong>Department:</strong> {r.department}</div>
        <div><strong>Course:</strong> {r.course}</div>
        <div><strong>Year:</strong> {r.year}</div>
        <div><strong>Semester:</strong> {r.semester}</div>
      </div>
      <table className="w-full border-collapse mb-4">
        <thead><tr className="bg-gray-100"><th className="border border-black px-3 py-1.5 text-xs text-left">Description</th><th className="border border-black px-3 py-1.5 text-xs text-right">Amount (₹)</th></tr></thead>
        <tbody>
          <tr><td className="border border-black px-3 py-1.5 text-xs">{r.feeType}</td><td className="border border-black px-3 py-1.5 text-xs text-right font-bold">₹{Number(r.amount || 0).toLocaleString("en-IN")}</td></tr>
        </tbody>
        <tfoot><tr className="bg-gray-50"><td className="border border-black px-3 py-1.5 text-xs font-bold">Total</td><td className="border border-black px-3 py-1.5 text-xs text-right font-bold">₹{Number(r.amount || 0).toLocaleString("en-IN")}</td></tr></tfoot>
      </table>
      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div><strong>Payment Mode:</strong> {r.paymentMode}</div>
        <div><strong>Transaction ID:</strong> {r.transactionId}</div>
        <div><strong>Academic Year:</strong> {r.academicYear}</div>
      </div>
      <div className="flex justify-between mt-10 pt-2">
        <div className="text-center border-t border-black pt-1 w-32 text-[10px]">Student Signature</div>
        <div className="text-center border-t border-black pt-1 w-32 text-[10px]">Cashier</div>
        <div className="text-center border-t border-black pt-1 w-32 text-[10px]">Accounts Officer</div>
      </div>
    </div>
  );
}

function PrintablePayslip({ data }: { data: any }) {
  if (!data) return null;
  const p = data.payslip;
  const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return (
    <div className="max-w-lg mx-auto border-2 border-black p-6 bg-white text-black font-serif">
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <h1 className="text-lg font-bold">ANNA UNIVERSITY AFFILIATED COLLEGE</h1>
        <p className="text-xs">Tamil Nadu, India</p>
        <h2 className="text-base font-bold mt-2 underline">SALARY SLIP — {months[p.month] || p.month} {p.year}</h2>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div><strong>Payslip No:</strong> {p.payslipNo}</div>
        <div><strong>Staff ID:</strong> {p.staffId}</div>
        <div><strong>Name:</strong> {p.staffName}</div>
        <div><strong>Department:</strong> {p.department}</div>
        <div><strong>Designation:</strong> {p.designation}</div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-xs font-bold border-b border-black mb-1">EARNINGS</h3>
          <table className="w-full text-xs">
            <tbody>
              <tr><td>Basic Salary</td><td className="text-right">₹{Number(p.basicSalary || 0).toLocaleString("en-IN")}</td></tr>
              <tr><td>HRA</td><td className="text-right">₹{Number(p.hra || 0).toLocaleString("en-IN")}</td></tr>
              <tr><td>DA</td><td className="text-right">₹{Number(p.da || 0).toLocaleString("en-IN")}</td></tr>
              <tr><td>TA</td><td className="text-right">₹{Number(p.ta || 0).toLocaleString("en-IN")}</td></tr>
              <tr><td>Other Allowances</td><td className="text-right">₹{Number(p.otherAllowances || 0).toLocaleString("en-IN")}</td></tr>
              <tr className="font-bold border-t border-black"><td>Gross</td><td className="text-right">₹{Number(p.grossSalary || 0).toLocaleString("en-IN")}</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="text-xs font-bold border-b border-black mb-1">DEDUCTIONS</h3>
          <table className="w-full text-xs">
            <tbody>
              <tr><td>PF</td><td className="text-right">₹{Number(p.pf || 0).toLocaleString("en-IN")}</td></tr>
              <tr><td>Tax</td><td className="text-right">₹{Number(p.tax || 0).toLocaleString("en-IN")}</td></tr>
              <tr><td>Other Deductions</td><td className="text-right">₹{Number(p.otherDeductions || 0).toLocaleString("en-IN")}</td></tr>
              <tr className="font-bold border-t border-black"><td>Total</td><td className="text-right">₹{Number(p.totalDeductions || 0).toLocaleString("en-IN")}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="border-2 border-black p-3 text-center mb-4">
        <p className="text-xs">NET PAY</p>
        <p className="text-xl font-bold">₹{Number(p.netSalary || 0).toLocaleString("en-IN")}</p>
      </div>
      <div className="flex justify-between mt-8 pt-2">
        <div className="text-center border-t border-black pt-1 w-32 text-[10px]">Employee Signature</div>
        <div className="text-center border-t border-black pt-1 w-32 text-[10px]">HR Department</div>
        <div className="text-center border-t border-black pt-1 w-32 text-[10px]">Principal</div>
      </div>
    </div>
  );
}

function PrintableCertificate({ data }: { data: any }) {
  if (!data) return null;
  const c = data.certificate;
  return (
    <div className="max-w-lg mx-auto border-[3px] border-double border-black p-8 bg-white text-black font-serif">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-xl font-bold">ANNA UNIVERSITY AFFILIATED COLLEGE</h1>
        <p className="text-xs mt-1">Tamil Nadu, India</p>
        <h2 className="text-lg font-bold mt-3 underline uppercase">{c.type}</h2>
        <p className="text-xs mt-1">No: {c.certNo}</p>
      </div>
      <div className="text-sm leading-relaxed space-y-4">
        {c.type === "Bonafide Certificate" && (
          <p className="text-justify">This is to certify that <strong>{c.studentName}</strong>, Roll Number <strong>{c.rollNumber}</strong>, {c.gender === "Male" ? "S/o" : "D/o"} <strong>{c.fatherName}</strong>, is a bonafide student of this institution, pursuing <strong>{c.course}</strong> in the Department of <strong>{c.department}</strong>. {c.gender === "Male" ? "He" : "She"} is currently in Year <strong>{c.year}</strong>.</p>
        )}
        {c.type === "Transfer Certificate" && (
          <>
            <p className="text-justify">This is to certify that <strong>{c.studentName}</strong>, Roll Number <strong>{c.rollNumber}</strong>, {c.gender === "Male" ? "S/o" : "D/o"} <strong>{c.fatherName}</strong>, was a student of this institution.</p>
            <div className="grid grid-cols-2 gap-2 text-xs mt-4">
              <div><strong>Date of Birth:</strong> {c.dateOfBirth}</div>
              <div><strong>Nationality:</strong> {c.nationality}</div>
              <div><strong>Community:</strong> {c.community}</div>
              <div><strong>Course:</strong> {c.course}</div>
              <div><strong>Date of Admission:</strong> {c.admissionDate}</div>
              <div><strong>Department:</strong> {c.department}</div>
            </div>
            <p className="text-justify mt-2">{c.gender === "Male" ? "His" : "Her"} conduct and character during the period of study were <strong>GOOD</strong>.</p>
          </>
        )}
        {c.type === "Conduct Certificate" && (
          <p className="text-justify">This is to certify that <strong>{c.studentName}</strong>, Roll Number <strong>{c.rollNumber}</strong>, {c.gender === "Male" ? "S/o" : "D/o"} <strong>{c.fatherName}</strong>, is a student of this institution pursuing <strong>{c.course}</strong> in the Department of <strong>{c.department}</strong>. {c.gender === "Male" ? "His" : "Her"} conduct and character are <strong>GOOD</strong>.</p>
        )}
        {!["Bonafide Certificate", "Transfer Certificate", "Conduct Certificate"].includes(c.type) && (
          <p className="text-justify">This is to certify that <strong>{c.studentName}</strong>, Roll Number <strong>{c.rollNumber}</strong>, is a student of this institution in the Department of <strong>{c.department}</strong>, pursuing <strong>{c.course}</strong>.</p>
        )}
      </div>
      <div className="mt-4 text-xs"><strong>Date:</strong> {c.issuedDate}</div>
      <div className="flex justify-between mt-12 pt-2">
        <div className="text-center"><div className="w-32 border-t border-black pt-1 text-[10px]">HOD</div></div>
        <div className="text-center"><div className="w-32 border-t border-black pt-1 text-[10px]">Principal</div></div>
      </div>
    </div>
  );
}

export default function PrintTemplatesPage() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [tab, setTab] = useState("fee-receipt");
  const [selectedId, setSelectedId] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: feePayments = [] } = useListFeePayments();
  const { data: certificates = [] } = useListCertificates();

  const { data: payrolls = [] } = useQuery({
    queryKey: ["payrolls-for-print"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/api/payroll`, { headers }); return r.json(); },
  });

  const { data: printData } = useQuery({
    queryKey: ["print-data", tab, selectedId],
    queryFn: async () => {
      const endpoint = tab === "fee-receipt" ? `/api/print/fee-receipt/${selectedId}` : tab === "payslip" ? `/api/print/payslip/${selectedId}` : `/api/print/certificate/${selectedId}`;
      const r = await fetch(`${API_BASE}${endpoint}`, { headers });
      if (!r.ok) return null;
      return r.json();
    },
    enabled: !!selectedId,
  });

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Print</title><style>body{font-family:'Times New Roman',serif;margin:20px;} table{border-collapse:collapse;width:100%;} td,th{padding:4px 8px;} @media print{body{margin:0;}}</style></head><body>${content.innerHTML}</body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Print Templates</h1>
          <p className="text-muted-foreground">Generate printable fee receipts, payslips, and certificates.</p>
        </div>
        {printData && <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>}
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSelectedId(""); }}>
        <TabsList>
          <TabsTrigger value="fee-receipt" className="flex items-center gap-2"><Receipt className="w-4 h-4" />Fee Receipt</TabsTrigger>
          <TabsTrigger value="payslip" className="flex items-center gap-2"><FileText className="w-4 h-4" />Payslip</TabsTrigger>
          <TabsTrigger value="certificate" className="flex items-center gap-2"><Award className="w-4 h-4" />Certificate</TabsTrigger>
        </TabsList>

        <TabsContent value="fee-receipt">
          <Card>
            <CardHeader><CardTitle className="text-base">Select Fee Payment</CardTitle></CardHeader>
            <CardContent>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger><SelectValue placeholder="Select a payment record..." /></SelectTrigger>
                <SelectContent>
                  {(feePayments as any[]).map((p: any) => <SelectItem key={p.id} value={String(p.id)}>Payment #{p.id} — ₹{Number(p.amount || 0).toLocaleString("en-IN")} ({p.paymentMode})</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payslip">
          <Card>
            <CardHeader><CardTitle className="text-base">Select Payroll Record</CardTitle></CardHeader>
            <CardContent>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger><SelectValue placeholder="Select a payroll record..." /></SelectTrigger>
                <SelectContent>
                  {(payrolls as any[]).map((p: any) => <SelectItem key={p.id} value={String(p.id)}>Payroll #{p.id} — Month {p.month}/{p.year} ({p.status})</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificate">
          <Card>
            <CardHeader><CardTitle className="text-base">Select Certificate</CardTitle></CardHeader>
            <CardContent>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger><SelectValue placeholder="Select a certificate..." /></SelectTrigger>
                <SelectContent>
                  {(certificates as any[]).map((c: any) => <SelectItem key={c.id} value={String(c.id)}>#{c.id} — {c.type} ({c.status})</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {printData && (
        <div ref={printRef}>
          {tab === "fee-receipt" && <PrintableReceipt data={printData} />}
          {tab === "payslip" && <PrintablePayslip data={printData} />}
          {tab === "certificate" && <PrintableCertificate data={printData} />}
        </div>
      )}
    </div>
  );
}
