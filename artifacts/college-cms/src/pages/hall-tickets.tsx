import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { useInstitution } from "@/contexts/institution";
import { useListStudents, useListExams } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Printer, Search, FileText, GraduationCap } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function HallTicketsPage() {
  const { token, user } = useAuth();
  const isStudent = user?.role === "Student";
  const { info: institution } = useInstitution();
  const headers = { Authorization: `Bearer ${token}` };
  const [selectedStudent, setSelectedStudent] = useState(() => isStudent && user?.studentRecordId ? String(user.studentRecordId) : "");
  const [selectedExam, setSelectedExam] = useState("");
  const [search, setSearch] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: students = [] } = useListStudents();
  const { data: exams = [] } = useListExams();

  const { data: hallTicket } = useQuery({
    queryKey: ["hall-ticket", selectedStudent, selectedExam],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/hall-tickets/${selectedStudent}/${selectedExam}`, { headers });
      if (!res.ok) return null;
      const data = await res.json();
      return data.hallTicket;
    },
    enabled: !!selectedStudent && !!selectedExam,
  });

  const filteredStudents = (students as any[]).filter((s: any) =>
    !search || `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) || s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Hall Ticket</title>
      <style>
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; }
        .hall-ticket { border: 3px double #000; padding: 20px; max-width: 700px; margin: auto; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .header h1 { font-size: 18px; margin: 5px 0; }
        .header h2 { font-size: 14px; margin: 5px 0; font-weight: normal; }
        .header h3 { font-size: 16px; margin: 5px 0; text-decoration: underline; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; }
        .info-item { font-size: 13px; }
        .info-item strong { display: inline-block; min-width: 120px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #000; padding: 6px 10px; font-size: 12px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
        .instructions { font-size: 11px; margin-top: 15px; }
        .instructions li { margin-bottom: 4px; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 10px; }
        .signatures div { text-align: center; border-top: 1px solid #000; padding-top: 5px; font-size: 12px; width: 150px; }
        @media print { body { margin: 0; } }
      </style></head><body>
      ${printContent.innerHTML}
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{isStudent ? "My Hall Ticket" : "Hall Tickets"}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">{isStudent ? "View and print your exam hall ticket." : "Generate and print exam hall tickets."}</p>
        </div>
        {hallTicket && <Button onClick={handlePrint} className="w-full sm:w-auto"><Printer className="mr-2 h-4 w-4" />Print Hall Ticket</Button>}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm sm:text-base">{isStudent ? "Select Exam" : "Select Student & Exam"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className={`grid gap-4 ${isStudent ? "" : "md:grid-cols-2"}`}>
            {!isStudent && (
              <div className="space-y-2">
                <Label>Student</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name or roll number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
                </div>
                {search && (
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    {filteredStudents.slice(0, 8).map((s: any) => (
                      <button key={s.id} className={`w-full text-left px-3 py-2 hover:bg-accent text-sm ${String(s.id) === selectedStudent ? "bg-accent" : ""}`}
                        onClick={() => { setSelectedStudent(String(s.id)); setSearch(""); }}>
                        <span className="font-medium">{s.rollNumber}</span> — {s.firstName} {s.lastName}
                      </button>
                    ))}
                  </div>
                )}
                {selectedStudent && !search && (
                  <Badge variant="secondary">{(() => { const st = (students as any[]).find(s => String(s.id) === selectedStudent); return st ? `${st.firstName} ${st.lastName}` : ""; })()}</Badge>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                <SelectContent>
                  {(exams as any[]).map((e: any) => <SelectItem key={e.id} value={String(e.id)}>{e.type} - Sem {e.semester} ({e.academicYear})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {hallTicket && (
        <div ref={printRef}>
          <div className="hall-ticket border-[3px] border-double border-foreground p-4 sm:p-6 max-w-[700px] mx-auto bg-white text-black">
            <div className="text-center border-b-2 border-black pb-3 mb-4">
              <h1 className="text-base sm:text-lg font-bold">{institution.collegeName || "College"}</h1>
              <p className="text-[9px] sm:text-[10px] tracking-wider">Affiliated to {institution.affiliatedUniversity || "University"}</p>
              <h2 className="text-xs sm:text-sm">{institution.location || ""}</h2>
              <h3 className="text-sm sm:text-base font-bold underline mt-2">EXAMINATION HALL TICKET</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs sm:text-sm">
              <div><strong className="inline-block min-w-[100px] sm:min-w-[120px]">Name:</strong> {hallTicket.studentName}</div>
              <div><strong className="inline-block min-w-[100px] sm:min-w-[120px]">Roll No:</strong> {hallTicket.rollNumber}</div>
              <div><strong className="inline-block min-w-[100px] sm:min-w-[120px]">Exam:</strong> {hallTicket.examName}</div>
              <div><strong className="inline-block min-w-[100px] sm:min-w-[120px]">Type:</strong> {hallTicket.examType}</div>
              <div><strong className="inline-block min-w-[100px] sm:min-w-[120px]">Semester:</strong> {hallTicket.semester}</div>
              <div><strong className="inline-block min-w-[100px] sm:min-w-[120px]">Seat No:</strong> <span className="font-bold text-sm sm:text-base">{hallTicket.seatNumber}</span></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs text-left">S.No</th>
                    <th className="border border-black px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs text-left">Subject Code</th>
                    <th className="border border-black px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs text-left">Subject Name</th>
                    <th className="border border-black px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {hallTicket.subjects?.map((s: any, i: number) => (
                    <tr key={s.id}>
                      <td className="border border-black px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs">{i + 1}</td>
                      <td className="border border-black px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs">{s.code}</td>
                      <td className="border border-black px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs">{s.name}</td>
                      <td className="border border-black px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs">{s.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[10px] sm:text-xs mt-4">
              <strong>Instructions:</strong>
              <ol className="list-decimal ml-5 mt-1 space-y-1">
                {hallTicket.instructions?.map((inst: string, i: number) => <li key={i}>{inst}</li>)}
              </ol>
            </div>
            <div className="flex justify-between mt-8 sm:mt-10 pt-2">
              <div className="text-center border-t border-black pt-1 w-28 sm:w-36 text-[10px] sm:text-xs">Student Signature</div>
              <div className="text-center border-t border-black pt-1 w-28 sm:w-36 text-[10px] sm:text-xs">Controller of Exams</div>
              <div className="text-center border-t border-black pt-1 w-28 sm:w-36 text-[10px] sm:text-xs">Principal</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
