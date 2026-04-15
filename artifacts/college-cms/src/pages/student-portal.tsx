import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { useListStudents, useListDepartments, useListCourses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, User, GraduationCap, CalendarCheck, IndianRupee, BookOpen, TrendingUp } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function StudentPortalPage() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [selectedStudent, setSelectedStudent] = useState("");
  const [search, setSearch] = useState("");

  const { data: students = [] } = useListStudents();
  const { data: departments = [] } = useListDepartments();
  const { data: courses = [] } = useListCourses();

  const studentInfo = (students as any[]).find(s => String(s.id) === selectedStudent);
  const studentFullName = studentInfo ? `${studentInfo.firstName || ""} ${studentInfo.lastName || ""}`.trim() : "";
  const deptName = (departments as any[]).find(d => d.id === studentInfo?.departmentId)?.name || "-";
  const courseName = (courses as any[]).find(c => c.id === studentInfo?.courseId)?.name || "-";

  const { data: attendanceSummary } = useQuery({
    queryKey: ["portal-attendance", selectedStudent],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/attendance/student/${selectedStudent}/summary`, { headers });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedStudent,
  });

  const { data: feeDues } = useQuery({
    queryKey: ["portal-fees", selectedStudent],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/fee-payments/student/${selectedStudent}/dues`, { headers });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedStudent,
  });

  const { data: cgpaData } = useQuery({
    queryKey: ["portal-cgpa", selectedStudent],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/cgpa/${selectedStudent}`, { headers });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedStudent,
  });

  const filteredStudents = (students as any[]).filter((s: any) => {
    if (!search) return true;
    const fullName = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || s.rollNumber?.toLowerCase().includes(search.toLowerCase());
  });

  const attPercentage = attendanceSummary
    ? (attendanceSummary.totalClasses > 0 ? ((attendanceSummary.presentClasses / attendanceSummary.totalClasses) * 100).toFixed(1) : "0")
    : "-";

  const semChartData = cgpaData?.semesters
    ? Object.entries(cgpaData.semesters).map(([sem, data]: [string, any]) => ({ semester: `Sem ${sem}`, gpa: data.gpa }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Portal</h1>
        <p className="text-muted-foreground">Self-service view for student information, attendance, fees, and results.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Select Student</CardTitle></CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or roll number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
          </div>
          {search && (
            <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
              {filteredStudents.slice(0, 10).map((s: any) => (
                <button key={s.id} className={`w-full text-left px-3 py-2 hover:bg-accent text-sm ${String(s.id) === selectedStudent ? "bg-accent" : ""}`}
                  onClick={() => { setSelectedStudent(String(s.id)); setSearch(""); }}>
                  <span className="font-medium">{s.rollNumber}</span> — {s.firstName} {s.lastName}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {studentInfo && (
        <>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {studentFullName?.[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{studentFullName}</h2>
                  <p className="text-sm text-muted-foreground">{studentInfo.rollNumber} | {deptName} | {courseName}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge>{studentInfo.status}</Badge>
                    <Badge variant="outline">Year {studentInfo.year} / Sem {studentInfo.semester}</Badge>
                    <Badge variant="secondary">{studentInfo.community}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <CalendarCheck className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                <p className="text-2xl font-bold">{attPercentage}%</p>
                <p className="text-xs text-muted-foreground">Attendance</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-1 text-green-500" />
                <p className="text-2xl font-bold">{cgpaData?.cgpa || "-"}</p>
                <p className="text-xs text-muted-foreground">CGPA</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <IndianRupee className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                <p className="text-2xl font-bold">₹{feeDues?.totalDue ? Number(feeDues.totalDue).toLocaleString("en-IN") : "0"}</p>
                <p className="text-xs text-muted-foreground">Fees Due</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <GraduationCap className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                <p className="text-2xl font-bold">{Object.keys(cgpaData?.semesters || {}).length}</p>
                <p className="text-xs text-muted-foreground">Semesters Done</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="attendance">
            <TabsList>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="info">Personal Info</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="space-y-4">
              {attendanceSummary && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Attendance Summary</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted"><p className="text-xl font-bold">{attendanceSummary.totalClasses}</p><p className="text-xs">Total Classes</p></div>
                      <div className="text-center p-3 rounded-lg bg-green-50"><p className="text-xl font-bold text-green-600">{attendanceSummary.presentClasses}</p><p className="text-xs">Present</p></div>
                      <div className="text-center p-3 rounded-lg bg-red-50"><p className="text-xl font-bold text-red-600">{attendanceSummary.absentClasses}</p><p className="text-xs">Absent</p></div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1"><span>Attendance</span><span className={Number(attPercentage) < 75 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>{attPercentage}%</span></div>
                      <div className="w-full bg-muted rounded-full h-3"><div className={`h-3 rounded-full ${Number(attPercentage) < 75 ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${Math.min(Number(attPercentage), 100)}%` }} /></div>
                      {Number(attPercentage) < 75 && <p className="text-xs text-red-600 mt-1 font-medium">Below minimum 75% attendance threshold</p>}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {semChartData.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">GPA Trend (CGPA: {cgpaData?.cgpa})</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={semChartData}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="semester" /><YAxis domain={[0, 10]} />
                        <Tooltip /><Bar dataKey="gpa" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              {cgpaData && Object.entries(cgpaData.semesters || {}).map(([sem, data]: [string, any]) => (
                <Card key={sem}>
                  <CardHeader>
                    <div className="flex justify-between"><CardTitle className="text-sm">Semester {sem}</CardTitle><Badge variant="outline">GPA: {data.gpa}</Badge></div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead className="text-center">Marks</TableHead><TableHead className="text-center">Grade</TableHead><TableHead className="text-center">Status</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {data.subjects.map((s: any, i: number) => (
                          <TableRow key={i}><TableCell>{s.subjectName}</TableCell><TableCell className="text-center">{s.marksObtained}</TableCell><TableCell className="text-center"><Badge variant="outline">{s.grade}</Badge></TableCell><TableCell className="text-center"><Badge variant={s.status === "Pass" ? "default" : "destructive"}>{s.status}</Badge></TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="fees">
              <Card>
                <CardHeader><CardTitle className="text-base">Fee Summary</CardTitle></CardHeader>
                <CardContent>
                  {feeDues ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted"><p className="text-xl font-bold">₹{Number(feeDues.totalFees || 0).toLocaleString("en-IN")}</p><p className="text-xs">Total Fees</p></div>
                      <div className="text-center p-3 rounded-lg bg-green-50"><p className="text-xl font-bold text-green-600">₹{Number(feeDues.totalPaid || 0).toLocaleString("en-IN")}</p><p className="text-xs">Paid</p></div>
                      <div className="text-center p-3 rounded-lg bg-red-50"><p className="text-xl font-bold text-red-600">₹{Number(feeDues.totalDue || 0).toLocaleString("en-IN")}</p><p className="text-xs">Due</p></div>
                    </div>
                  ) : <p className="text-center text-muted-foreground py-4">No fee records</p>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <Card>
                <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><Label className="text-muted-foreground">Full Name</Label><p className="font-medium">{studentFullName}</p></div>
                    <div><Label className="text-muted-foreground">Roll Number</Label><p className="font-medium">{studentInfo.rollNumber}</p></div>
                    <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{studentInfo.email}</p></div>
                    <div><Label className="text-muted-foreground">Phone</Label><p className="font-medium">{studentInfo.phone || "-"}</p></div>
                    <div><Label className="text-muted-foreground">Gender</Label><p className="font-medium">{studentInfo.gender}</p></div>
                    <div><Label className="text-muted-foreground">Date of Birth</Label><p className="font-medium">{studentInfo.dateOfBirth ? new Date(studentInfo.dateOfBirth).toLocaleDateString("en-IN") : "-"}</p></div>
                    <div><Label className="text-muted-foreground">Community</Label><p className="font-medium">{studentInfo.community}</p></div>
                    <div><Label className="text-muted-foreground">Admission Type</Label><p className="font-medium">{studentInfo.admissionType}</p></div>
                    <div><Label className="text-muted-foreground">Father's Name</Label><p className="font-medium">{studentInfo.fatherName || "-"}</p></div>
                    <div><Label className="text-muted-foreground">Guardian Phone</Label><p className="font-medium">{studentInfo.guardianPhone || "-"}</p></div>
                    <div className="col-span-2"><Label className="text-muted-foreground">Address</Label><p className="font-medium">{studentInfo.address || "-"}</p></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
