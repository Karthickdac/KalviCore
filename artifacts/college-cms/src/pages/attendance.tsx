import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, XCircle, Plus, AlertTriangle, Users, CalendarCheck, BarChart3, ClipboardList, UserCheck, TrendingDown, Clock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

interface Subject { id: number; name: string; code: string; courseId: number; semester: number; }
interface Student { id: number; rollNumber: string; firstName: string; lastName: string; departmentId: number; semester: number; }
interface Department { id: number; name: string; }
interface AttendanceRecord { id: number; studentId: number; status: string; rollNumber?: string; firstName?: string; lastName?: string; }
interface OverviewStats { totalRecords: number; totalPresent: number; totalAbsent: number; avgPercentage: number; todayMarked: number; todayPresent: number; belowThresholdCount: number; }
interface SummaryItem { subjectId: number; subjectName: string; subjectCode: string; totalClasses: number; present: number; absent: number; percentage: number; }
interface CondonationRequest { id: number; studentId: number; subjectId: number; semester: number; academicYear: string; currentPercentage: string; reason: string; requestDate: string; status: string; approvedBy: string | null; }

export default function AttendancePage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("mark");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchMeta = useCallback(async () => {
    try {
      const [dRes, sRes, stRes, oRes] = await Promise.all([
        fetch(`${API_BASE}/api/departments`, { headers: headers() }),
        fetch(`${API_BASE}/api/subjects`, { headers: headers() }),
        fetch(`${API_BASE}/api/students`, { headers: headers() }),
        fetch(`${API_BASE}/api/attendance/overview`, { headers: headers() }),
      ]);
      if (dRes.ok) setDepartments(await dRes.json());
      if (sRes.ok) setSubjects(await sRes.json());
      if (stRes.ok) setAllStudents(await stRes.json());
      if (oRes.ok) setOverview(await oRes.json());
    } catch {} finally { setLoading(false); }
  }, [headers]);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-emerald-500" />
          Attendance
        </h2>
        <p className="text-muted-foreground">Mark, track, and manage student attendance across subjects.</p>
      </div>

      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-bold">{overview.totalRecords}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><ClipboardList className="h-3 w-3" /> Total Records</div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-bold text-emerald-600">{overview.avgPercentage}%</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Avg Attendance</div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-bold text-blue-600">{overview.todayMarked}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Marked Today</div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-bold text-red-600">{overview.belowThresholdCount}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Below 75%</div>
          </CardContent></Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="summary">Student Summary</TabsTrigger>
          <TabsTrigger value="records">Attendance Records</TabsTrigger>
          <TabsTrigger value="condonation">Condonation</TabsTrigger>
        </TabsList>

        <TabsContent value="mark">
          <MarkAttendanceTab departments={departments} subjects={subjects} headers={headers} onRefresh={fetchMeta} />
        </TabsContent>
        <TabsContent value="summary">
          <StudentSummaryTab allStudents={allStudents} departments={departments} headers={headers} />
        </TabsContent>
        <TabsContent value="records">
          <AttendanceRecordsTab subjects={subjects} headers={headers} />
        </TabsContent>
        <TabsContent value="condonation">
          <CondonationTab allStudents={allStudents} subjects={subjects} headers={headers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MarkAttendanceTab({ departments, subjects, headers, onRefresh }: {
  departments: Department[]; subjects: Subject[]; headers: () => Record<string, string>; onRefresh: () => void;
}) {
  const [filterDept, setFilterDept] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<number, string>>({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [existingRecords, setExistingRecords] = useState(false);

  const filteredSubjects = filterDept === "all" ? subjects : subjects.filter(s => {
    return true;
  });

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const loadStudents = useCallback(async () => {
    if (!selectedSubject) { setStudents([]); return; }
    setLoadingStudents(true);
    try {
      const [studRes, checkRes] = await Promise.all([
        fetch(`${API_BASE}/api/attendance/students-for-subject/${selectedSubject}`, { headers: headers() }),
        fetch(`${API_BASE}/api/attendance/check?subjectId=${selectedSubject}&date=${date}`, { headers: headers() }),
      ]);
      if (studRes.ok) {
        const data = await studRes.json();
        setStudents(data.students || []);
      }
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.exists && checkData.records?.length > 0) {
          setExistingRecords(true);
          const existing: Record<number, string> = {};
          checkData.records.forEach((r: AttendanceRecord) => { existing[r.studentId] = r.status; });
          setRecords(existing);
        } else {
          setExistingRecords(false);
          setRecords({});
        }
      }
    } catch {} finally { setLoadingStudents(false); }
  }, [selectedSubject, date, headers]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const toggleStatus = (studentId: number) => {
    setRecords(prev => {
      const current = prev[studentId];
      if (current === "Present") return { ...prev, [studentId]: "Absent" };
      return { ...prev, [studentId]: "Present" };
    });
  };

  const markAll = (status: string) => {
    const newRecs: Record<number, string> = {};
    students.forEach(s => { newRecs[s.id] = status; });
    setRecords(newRecs);
  };

  const handleSubmit = async () => {
    if (!selectedSubject) { setToast({ type: "error", msg: "Select a subject first" }); return; }
    const entries = Object.entries(records).map(([id, status]) => ({ studentId: Number(id), status }));
    if (entries.length === 0) { setToast({ type: "error", msg: "Mark at least one student" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/attendance`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ subjectId: Number(selectedSubject), date, records: entries }),
      });
      if (res.ok) {
        setToast({ type: "success", msg: `Attendance ${existingRecords ? "updated" : "submitted"} for ${entries.length} students` });
        setExistingRecords(true);
        onRefresh();
      } else {
        const err = await res.json();
        setToast({ type: "error", msg: err.error || "Failed to submit" });
      }
    } catch { setToast({ type: "error", msg: "Failed to submit attendance" }); }
    finally { setSubmitting(false); }
  };

  const presentCount = Object.values(records).filter(v => v === "Present").length;
  const absentCount = Object.values(records).filter(v => v === "Absent").length;
  const unmarkedCount = students.length - presentCount - absentCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
        <CardDescription>Select a subject and date, then mark each student as present or absent. Click a row to toggle.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {toast && (
          <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${
            toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-red-500/10 border-red-500/20 text-red-600"
          }`}>
            {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {toast.msg}
          </div>
        )}

        <div className="flex gap-3 items-end flex-wrap">
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={filterDept} onValueChange={(v) => { setFilterDept(v); setSelectedSubject(""); }}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Subject *</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[300px]"><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.code} - {s.name} (Sem {s.semester})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-[180px]" />
          </div>
        </div>

        {selectedSubject && students.length > 0 && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Present: {presentCount}
                </Badge>
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                  <XCircle className="h-3 w-3 mr-1" /> Absent: {absentCount}
                </Badge>
                {unmarkedCount > 0 && <Badge variant="outline">Unmarked: {unmarkedCount}</Badge>}
                {existingRecords && <Badge variant="secondary" className="text-xs">Previously recorded - editing</Badge>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => markAll("Present")}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> All Present
                </Button>
                <Button variant="outline" size="sm" onClick={() => markAll("Absent")}>
                  <XCircle className="h-3.5 w-3.5 mr-1" /> All Absent
                </Button>
                <Button onClick={handleSubmit} disabled={submitting || (presentCount + absentCount) === 0}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {existingRecords ? "Update Attendance" : "Submit Attendance"}
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center w-[150px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s, idx) => (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleStatus(s.id)}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-mono text-sm">{s.rollNumber}</TableCell>
                    <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                    <TableCell className="text-center">
                      {records[s.id] === "Present" ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 w-24 justify-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Present</Badge>
                      ) : records[s.id] === "Absent" ? (
                        <Badge variant="destructive" className="w-24 justify-center"><XCircle className="w-3 h-3 mr-1" /> Absent</Badge>
                      ) : (
                        <Badge variant="outline" className="w-24 justify-center text-muted-foreground">Not Marked</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {selectedSubject && !loadingStudents && students.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No eligible students found for this subject.</p>
            <p className="text-xs mt-1">Students are matched by department and semester.</p>
          </div>
        )}

        {loadingStudents && (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        )}

        {!selectedSubject && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Select a subject and date to mark attendance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StudentSummaryTab({ allStudents, departments, headers }: {
  allStudents: Student[]; departments: Department[]; headers: () => Record<string, string>;
}) {
  const [filterDept, setFilterDept] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredStudents = filterDept === "all" ? allStudents : allStudents.filter(s => s.departmentId === Number(filterDept));

  useEffect(() => {
    if (!selectedStudent) { setSummary([]); return; }
    setLoading(true);
    fetch(`${API_BASE}/api/attendance/student/${selectedStudent}/summary`, { headers: headers() })
      .then(r => r.ok ? r.json() : [])
      .then(setSummary)
      .catch(() => setSummary([]))
      .finally(() => setLoading(false));
  }, [selectedStudent, headers]);

  const totalClasses = summary.reduce((a, s) => a + s.totalClasses, 0);
  const totalPresent = summary.reduce((a, s) => a + s.present, 0);
  const overallPct = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
  const belowThreshold = summary.filter(s => s.percentage < 75);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Attendance Summary</CardTitle>
        <CardDescription>View subject-wise attendance breakdown for any student.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={filterDept} onValueChange={(v) => { setFilterDept(v); setSelectedStudent(""); }}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-[350px]"><SelectValue placeholder="Select a student" /></SelectTrigger>
              <SelectContent>
                {filteredStudents.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName} {s.lastName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : selectedStudent && summary.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold">{totalClasses}</div>
                <div className="text-[11px] text-muted-foreground">Total Classes</div>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-emerald-600">{totalPresent}</div>
                <div className="text-[11px] text-muted-foreground">Present</div>
              </div>
              <div className={`rounded-lg p-3 text-center ${overallPct >= 75 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                <div className={`text-lg font-bold ${overallPct >= 75 ? "text-emerald-600" : "text-red-600"}`}>{overallPct}%</div>
                <div className="text-[11px] text-muted-foreground">Overall</div>
              </div>
              <div className={`rounded-lg p-3 text-center ${belowThreshold.length > 0 ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
                <div className={`text-lg font-bold ${belowThreshold.length > 0 ? "text-red-600" : "text-emerald-600"}`}>{belowThreshold.length}</div>
                <div className="text-[11px] text-muted-foreground">Below 75%</div>
              </div>
            </div>

            {belowThreshold.length > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Below 75% threshold in: {belowThreshold.map(s => s.subjectName).join(", ")}
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                  <TableHead className="text-center">Absent</TableHead>
                  <TableHead className="text-center">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map(s => (
                  <TableRow key={s.subjectId}>
                    <TableCell>
                      <div className="font-medium">{s.subjectName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{s.subjectCode}</div>
                    </TableCell>
                    <TableCell className="text-center">{s.totalClasses}</TableCell>
                    <TableCell className="text-center text-emerald-600 font-medium">{s.present}</TableCell>
                    <TableCell className="text-center text-red-600 font-medium">{s.absent}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.percentage >= 75 ? "bg-emerald-500" : s.percentage >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${s.percentage}%` }} />
                        </div>
                        <Badge variant={s.percentage >= 75 ? "default" : "destructive"} className="text-xs">{s.percentage}%</Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : selectedStudent ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No attendance records found for this student.</p>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Select a student to view their attendance summary.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AttendanceRecordsTab({ subjects, headers }: {
  subjects: Subject[]; headers: () => Record<string, string>;
}) {
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterSubject !== "all") params.set("subjectId", filterSubject);
      if (filterDate) params.set("date", filterDate);
      const res = await fetch(`${API_BASE}/api/attendance?${params}`, { headers: headers() });
      if (res.ok) setRecords(await res.json());
    } catch {} finally { setLoading(false); }
  }, [filterSubject, filterDate, headers]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const presentCount = records.filter(r => r.status === "Present").length;
  const absentCount = records.filter(r => r.status === "Absent").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Records</CardTitle>
        <CardDescription>Browse all attendance records by subject and date.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-[300px]"><SelectValue placeholder="All subjects" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.code} - {s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-[180px]" />
          </div>
          {filterDate && <Button variant="ghost" size="sm" onClick={() => setFilterDate("")}>Clear Date</Button>}
        </div>

        {records.length > 0 && (
          <div className="flex gap-2">
            <Badge variant="outline">Total: {records.length}</Badge>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Present: {presentCount}</Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Absent: {absentCount}</Badge>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : records.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.date}</TableCell>
                  <TableCell className="font-mono text-sm">{r.rollNumber || "-"}</TableCell>
                  <TableCell className="font-medium">{r.firstName} {r.lastName}</TableCell>
                  <TableCell>{r.subjectCode ? `${r.subjectCode} - ${r.subjectName}` : "-"}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={r.status === "Present" ? "default" : "destructive"} className={r.status === "Present" ? "bg-emerald-600" : ""}>
                      {r.status === "Present" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No attendance records found for the selected filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CondonationTab({ allStudents, subjects, headers }: {
  allStudents: Student[]; subjects: Subject[]; headers: () => Record<string, string>;
}) {
  const [requests, setRequests] = useState<CondonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    studentId: 0, subjectId: 0, semester: 1, academicYear: "2025-2026",
    currentPercentage: "", reason: "", requestDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchRequests = useCallback(async () => {
    try {
      const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const res = await fetch(`${API_BASE}/api/attendance-condonation${params}`, { headers: headers() });
      if (res.ok) setRequests(await res.json());
    } catch {} finally { setLoading(false); }
  }, [headers, filterStatus]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const getStudentName = (id: number) => { const s = allStudents.find(st => st.id === id); return s ? `${s.firstName} ${s.lastName}` : "-"; };
  const getSubjectName = (id: number) => { const s = subjects.find(sub => sub.id === id); return s ? `${s.code} - ${s.name}` : "-"; };

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.subjectId || !formData.reason) {
      setToast({ type: "error", msg: "Student, subject, and reason are required" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/attendance-condonation`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setToast({ type: "success", msg: "Condonation request submitted" });
        setShowForm(false);
        setFormData({ studentId: 0, subjectId: 0, semester: 1, academicYear: "2025-2026", currentPercentage: "", reason: "", requestDate: new Date().toISOString().split("T")[0] });
        fetchRequests();
      } else {
        setToast({ type: "error", msg: "Failed to submit request" });
      }
    } catch { setToast({ type: "error", msg: "Failed to submit request" }); }
  };

  const handleApproval = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/attendance-condonation/${id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ status, approvedBy: "Admin" }),
      });
      if (res.ok) {
        setToast({ type: "success", msg: `Request ${status.toLowerCase()}` });
        fetchRequests();
      }
    } catch { setToast({ type: "error", msg: "Failed to update request" }); }
  };

  const pendingCount = requests.filter(r => r.status === "Pending").length;

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${
          toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-red-500/10 border-red-500/20 text-red-600"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm">
          <AlertTriangle className="h-4 w-4" />
          {pendingCount} pending condonation request(s) awaiting approval
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle>Condonation Requests</CardTitle>
            <CardDescription>Manage attendance condonation requests for students below threshold.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> New Request</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No condonation requests found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Current %</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{getStudentName(r.studentId)}</TableCell>
                    <TableCell>{getSubjectName(r.subjectId)}</TableCell>
                    <TableCell>{r.semester}</TableCell>
                    <TableCell>
                      <Badge variant={Number(r.currentPercentage) < 75 ? "destructive" : "default"}>{r.currentPercentage}%</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={r.reason}>{r.reason}</TableCell>
                    <TableCell className="text-sm">{r.requestDate}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "Approved" ? "default" : r.status === "Rejected" ? "destructive" : "secondary"}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.status === "Pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleApproval(r.id, "Approved")}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleApproval(r.id, "Rejected")}>
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      {r.status !== "Pending" && r.approvedBy && (
                        <span className="text-xs text-muted-foreground">by {r.approvedBy}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Attendance Condonation</DialogTitle>
            <DialogDescription>Submit a condonation request for students with attendance below the required threshold.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Student *</Label>
              <Select value={String(formData.studentId || "")} onValueChange={v => setFormData(f => ({ ...f, studentId: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {allStudents.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName} {s.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Select value={String(formData.subjectId || "")} onValueChange={v => setFormData(f => ({ ...f, subjectId: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.code} - {s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Semester</Label>
                <Input type="number" value={formData.semester} onChange={e => setFormData(f => ({ ...f, semester: Number(e.target.value) }))} min={1} max={8} />
              </div>
              <div className="space-y-1.5">
                <Label>Current Attendance %</Label>
                <Input value={formData.currentPercentage} onChange={e => setFormData(f => ({ ...f, currentPercentage: e.target.value }))} placeholder="e.g. 65" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Academic Year</Label>
                <Select value={formData.academicYear} onValueChange={v => setFormData(f => ({ ...f, academicYear: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                    <SelectItem value="2026-2027">2026-2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Request Date</Label>
                <Input type="date" value={formData.requestDate} onChange={e => setFormData(f => ({ ...f, requestDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Reason *</Label>
              <Textarea value={formData.reason} onChange={e => setFormData(f => ({ ...f, reason: e.target.value }))} placeholder="Reason for condonation request..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
