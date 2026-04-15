import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, FileText, Users, CalendarCheck, IndianRupee, GraduationCap, Printer } from "lucide-react";
import { useListDepartments } from "@workspace/api-client-react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

function exportCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(","), ...data.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [tab, setTab] = useState("students");
  const [deptFilter, setDeptFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: departments = [] } = useListDepartments();

  const { data: studentReport } = useQuery({
    queryKey: ["report-students", deptFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (deptFilter !== "all") params.set("departmentId", deptFilter);
      const res = await fetch(`${API_BASE}/api/reports/students?${params}`, { headers });
      return res.json();
    },
    enabled: tab === "students",
  });

  const { data: attendanceReport } = useQuery({
    queryKey: ["report-attendance", fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);
      const res = await fetch(`${API_BASE}/api/reports/attendance?${params}`, { headers });
      return res.json();
    },
    enabled: tab === "attendance",
  });

  const { data: feeReport } = useQuery({
    queryKey: ["report-fees", fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);
      const res = await fetch(`${API_BASE}/api/reports/fees?${params}`, { headers });
      return res.json();
    },
    enabled: tab === "fees",
  });

  const { data: examReport } = useQuery({
    queryKey: ["report-exams"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/reports/exams`, { headers });
      return res.json();
    },
    enabled: tab === "exams",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and export institutional reports.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students" className="flex items-center gap-2"><Users className="w-4 h-4" />Students</TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2"><CalendarCheck className="w-4 h-4" />Attendance</TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2"><IndianRupee className="w-4 h-4" />Fee Collection</TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2"><GraduationCap className="w-4 h-4" />Exam Results</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <div className="flex gap-3 items-end">
            <div>
              <Label>Department</Label>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d: any) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => studentReport?.students && exportCSV(studentReport.students, "students_report.csv")}>
              <Download className="mr-2 h-4 w-4" />Export CSV
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />Print
            </Button>
          </div>
          {studentReport && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{studentReport.summary.total}</p><p className="text-sm text-muted-foreground">Total Students</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{studentReport.summary.active}</p><p className="text-sm text-muted-foreground">Active</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-red-600">{studentReport.summary.inactive}</p><p className="text-sm text-muted-foreground">Inactive</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{Object.keys(studentReport.summary.byCommunity).length}</p><p className="text-sm text-muted-foreground">Communities</p></CardContent></Card>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">By Community</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={Object.entries(studentReport.summary.byCommunity).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {Object.keys(studentReport.summary.byCommunity).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">By Year</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={Object.entries(studentReport.summary.byYear).map(([name, value]) => ({ name, count: value }))}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis />
                        <Tooltip /><Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="flex gap-3 items-end">
            <div><Label>From Date</Label><Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-44" /></div>
            <div><Label>To Date</Label><Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-44" /></div>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
          </div>
          {attendanceReport && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{attendanceReport.summary.totalClasses}</p><p className="text-sm text-muted-foreground">Total Records</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{attendanceReport.summary.present}</p><p className="text-sm text-muted-foreground">Present</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-red-600">{attendanceReport.summary.absent}</p><p className="text-sm text-muted-foreground">Absent</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{attendanceReport.summary.percentage}%</p><p className="text-sm text-muted-foreground">Avg Attendance</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-amber-600">{attendanceReport.summary.belowThreshold}</p><p className="text-sm text-muted-foreground">Below 75%</p></CardContent></Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <div className="flex gap-3 items-end">
            <div><Label>From Date</Label><Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-44" /></div>
            <div><Label>To Date</Label><Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-44" /></div>
            <Button variant="outline" onClick={() => feeReport?.payments && exportCSV(feeReport.payments, "fee_report.csv")}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          </div>
          {feeReport && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{feeReport.summary.totalPayments}</p><p className="text-sm text-muted-foreground">Total Payments</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">₹{Number(feeReport.summary.totalCollected).toLocaleString("en-IN")}</p><p className="text-sm text-muted-foreground">Total Collected</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{Object.keys(feeReport.summary.byMode).length}</p><p className="text-sm text-muted-foreground">Payment Modes</p></CardContent></Card>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">By Payment Mode</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={Object.entries(feeReport.summary.byMode).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {Object.keys(feeReport.summary.byMode).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Monthly Collection</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={Object.entries(feeReport.summary.byMonth).map(([month, amount]) => ({ month, amount }))}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis />
                        <Tooltip /><Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <div className="flex gap-3 items-end">
            <Button variant="outline" onClick={() => examReport?.results && exportCSV(examReport.results, "exam_report.csv")}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          </div>
          {examReport && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{examReport.summary.totalStudents}</p><p className="text-sm text-muted-foreground">Students</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{examReport.summary.passed}</p><p className="text-sm text-muted-foreground">Passed</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-red-600">{examReport.summary.failed}</p><p className="text-sm text-muted-foreground">Failed</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{examReport.summary.passPercentage}%</p><p className="text-sm text-muted-foreground">Pass %</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{examReport.summary.avgMarks}</p><p className="text-sm text-muted-foreground">Avg Marks</p></CardContent></Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
