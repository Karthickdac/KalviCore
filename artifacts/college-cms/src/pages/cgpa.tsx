import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { useListStudents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GraduationCap, TrendingUp, Search, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_URL || "";

const GRADE_COLORS: Record<string, string> = {
  O: "bg-green-100 text-green-800", "A+": "bg-blue-100 text-blue-800", A: "bg-blue-100 text-blue-700",
  "B+": "bg-cyan-100 text-cyan-800", B: "bg-yellow-100 text-yellow-800", C: "bg-orange-100 text-orange-800",
  P: "bg-gray-100 text-gray-800", F: "bg-red-100 text-red-800", AB: "bg-red-100 text-red-800",
};

export default function CGPAPage() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [selectedStudent, setSelectedStudent] = useState("");
  const [search, setSearch] = useState("");

  const { data: students = [] } = useListStudents();

  const { data: cgpaData } = useQuery({
    queryKey: ["cgpa", selectedStudent],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/cgpa/${selectedStudent}`, { headers });
      return res.json();
    },
    enabled: !!selectedStudent,
  });

  const filteredStudents = (students as any[]).filter((s: any) =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const semesterChartData = cgpaData?.semesters
    ? Object.entries(cgpaData.semesters).map(([sem, data]: [string, any]) => ({ semester: `Sem ${sem}`, gpa: data.gpa, credits: data.totalCredits }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CGPA Tracker</h1>
          <p className="text-muted-foreground">Track cumulative GPA across semesters for students.</p>
        </div>
        {cgpaData && <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Select Student</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students by name or roll number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
            </div>
          </div>
          {search && (
            <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
              {filteredStudents.slice(0, 10).map((s: any) => (
                <button key={s.id} className={`w-full text-left px-3 py-2 hover:bg-accent text-sm ${String(s.id) === selectedStudent ? "bg-accent" : ""}`}
                  onClick={() => { setSelectedStudent(String(s.id)); setSearch(""); }}>
                  <span className="font-medium">{s.rollNumber}</span> — {s.name}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {cgpaData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-4 text-center">
                <GraduationCap className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-4xl font-bold text-primary">{cgpaData.cgpa}</p>
                <p className="text-sm text-muted-foreground">CGPA</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">{cgpaData.totalCredits}</p>
                <p className="text-sm text-muted-foreground">Total Credits</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">{Object.keys(cgpaData.semesters || {}).length}</p>
                <p className="text-sm text-muted-foreground">Semesters</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">{(cgpaData.cgpa * 10 - 7.5).toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Approx Percentage</p>
              </CardContent>
            </Card>
          </div>

          {semesterChartData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" /> GPA Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={semesterChartData}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="semester" /><YAxis domain={[0, 10]} />
                    <Tooltip /><Bar dataKey="gpa" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {Object.entries(cgpaData.semesters || {}).map(([sem, data]: [string, any]) => (
            <Card key={sem}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Semester {sem}</CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">GPA: {data.gpa}</Badge>
                    <Badge variant="secondary">{data.totalCredits} Credits</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-center">Marks</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Grade Point</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.subjects.map((s: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{s.subjectName}</TableCell>
                        <TableCell className="text-center">{s.credits}</TableCell>
                        <TableCell className="text-center">{s.marksObtained}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={GRADE_COLORS[s.grade] || ""}>{s.grade || "-"}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">{s.gradePoint}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={s.status === "Pass" ? "default" : "destructive"}>{s.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
