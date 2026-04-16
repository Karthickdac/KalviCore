import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, FileText, CheckCircle2, Clock, XCircle, CalendarDays, MapPin, Timer, Edit, Trash2, BarChart3, Users, TrendingUp, AlertTriangle, ArrowLeft, Eye } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

interface Exam {
  id: number;
  subjectId: number;
  departmentId: number | null;
  courseId: number | null;
  type: string;
  maxMarks: number;
  passMarks: number | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
  venue: string | null;
  semester: number;
  academicYear: string;
  status: string;
  instructions: string | null;
  subjectName: string | null;
  subjectCode: string | null;
}

interface ExamResult {
  id: number;
  examId: number;
  studentId: number;
  marksObtained: number;
  grade: string | null;
  status: string;
  rollNumber: string | null;
  firstName: string | null;
  lastName: string | null;
}

interface ExamStats {
  total: number;
  scheduled: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  totalResults: number;
  passCount: number;
  failCount: number;
  avgPassRate: number;
  typeBreakdown: Record<string, number>;
}

interface ExamDetailStats {
  total: number;
  passCount: number;
  failCount: number;
  absentCount: number;
  highest: number;
  lowest: number;
  average: number;
  passRate: number;
  gradeDistribution: Record<string, number>;
  markRanges: Record<string, number>;
}

interface EligibleStudent {
  id: number;
  rollNumber: string;
  firstName: string;
  lastName: string;
  departmentId: number;
  semester: number;
}

interface Department { id: number; name: string; }
interface Course { id: number; name: string; code: string; departmentId: number; }
interface Subject { id: number; name: string; code: string; courseId: number; semester: number; }

const STATUS_COLORS: Record<string, string> = {
  Scheduled: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  Ongoing: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Completed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Cancelled: "bg-red-500/15 text-red-600 border-red-500/30",
};

const TYPE_COLORS: Record<string, string> = {
  Internal: "bg-violet-500/15 text-violet-600",
  External: "bg-indigo-500/15 text-indigo-600",
  Supplementary: "bg-orange-500/15 text-orange-600",
  Model: "bg-cyan-500/15 text-cyan-600",
  Practical: "bg-teal-500/15 text-teal-600",
};

export default function Exams() {
  const { token, user } = useAuth();
  const isStudent = user?.role === "Student";
  const [activeTab, setActiveTab] = useState("schedule");
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState<ExamStats | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterDept, setFilterDept] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchExams = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterDept !== "all") params.set("departmentId", filterDept);
      if (filterType !== "all") params.set("type", filterType);
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterSemester !== "all") params.set("semester", filterSemester);
      const res = await fetch(`${API_BASE}/api/exams?${params}`, { headers: headers() });
      if (res.ok) setExams(await res.json());
    } catch {}
  }, [headers, filterDept, filterType, filterStatus, filterSemester]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/exam-stats`, { headers: headers() });
      if (res.ok) setStats(await res.json());
    } catch {}
  }, [headers]);

  const fetchMeta = useCallback(async () => {
    try {
      const [dRes, cRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/api/departments`, { headers: headers() }),
        fetch(`${API_BASE}/api/courses`, { headers: headers() }),
        fetch(`${API_BASE}/api/subjects`, { headers: headers() }),
      ]);
      if (dRes.ok) setDepartments(await dRes.json());
      if (cRes.ok) setCourses(await cRes.json());
      if (sRes.ok) setSubjects(await sRes.json());
    } catch {}
  }, [headers]);

  useEffect(() => {
    Promise.all([fetchExams(), fetchStats(), fetchMeta()]).finally(() => setLoading(false));
  }, [fetchExams, fetchStats, fetchMeta]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/exams/${id}`, { method: "DELETE", headers: headers() });
      if (res.ok) { fetchExams(); fetchStats(); setDeleteConfirm(null); }
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  if (isStudent) {
    const upcomingExams = exams.filter(e => e.status === "Scheduled" || e.status === "Ongoing");
    const completedExams = exams.filter(e => e.status === "Completed");
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-5 sm:h-6 w-5 sm:w-6 text-indigo-500" />
            My Examinations
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">View your upcoming and completed exams.</p>
        </div>

        {upcomingExams.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm sm:text-base">Upcoming Exams</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 sm:hidden">
                {upcomingExams.map(e => (
                  <div key={e.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-sm">{e.subjectCode} - {e.subjectName}</div>
                      <Badge className={STATUS_COLORS[e.status] || ""} variant="outline">{e.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{e.date}</div>
                      {e.startTime && <div className="flex items-center gap-1"><Timer className="h-3 w-3" />{e.startTime}{e.endTime ? `-${e.endTime}` : ""}</div>}
                      {e.venue && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.venue}</div>}
                      <div>Marks: {e.maxMarks}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={TYPE_COLORS[e.type] || ""}>{e.type}</Badge>
                      <Badge variant="outline">Sem {e.semester}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Sem</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingExams.map(e => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <div className="font-medium">{e.subjectCode} - {e.subjectName}</div>
                          <div className="text-xs text-muted-foreground">{e.academicYear}</div>
                        </TableCell>
                        <TableCell><Badge className={TYPE_COLORS[e.type] || ""}>{e.type}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm"><CalendarDays className="h-3 w-3 text-muted-foreground" /> {e.date}</div>
                          {e.startTime && <div className="text-xs text-muted-foreground flex items-center gap-1"><Timer className="h-3 w-3" /> {e.startTime}{e.endTime ? ` - ${e.endTime}` : ""}{e.duration ? ` (${e.duration}min)` : ""}</div>}
                        </TableCell>
                        <TableCell>{e.venue ? <div className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3 text-muted-foreground" /> {e.venue}</div> : <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{e.maxMarks}</div>
                          {e.passMarks && <div className="text-xs text-muted-foreground">Pass: {e.passMarks}</div>}
                        </TableCell>
                        <TableCell>{e.semester}</TableCell>
                        <TableCell><Badge variant="outline" className={STATUS_COLORS[e.status] || ""}>{e.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {completedExams.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm sm:text-base">Completed Exams</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 sm:hidden">
                {completedExams.map(e => (
                  <div key={e.id} className="border rounded-lg p-3 space-y-1">
                    <div className="font-medium text-sm">{e.subjectCode} - {e.subjectName}</div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{e.date}</span>
                      <Badge className={TYPE_COLORS[e.type] || ""} >{e.type}</Badge>
                      <span>Marks: {e.maxMarks}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Max Marks</TableHead>
                      <TableHead>Sem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedExams.map(e => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.subjectCode} - {e.subjectName}</TableCell>
                        <TableCell><Badge className={TYPE_COLORS[e.type] || ""}>{e.type}</Badge></TableCell>
                        <TableCell>{e.date}</TableCell>
                        <TableCell>{e.maxMarks}</TableCell>
                        <TableCell>{e.semester}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {exams.length === 0 && (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              No exams scheduled for your department yet.
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-5 sm:h-6 w-5 sm:w-6 text-indigo-500" />
            Examinations
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">Schedule exams, manage results, and track performance analytics.</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <Card><CardContent className="pt-4 pb-3 px-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Exams</div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Scheduled</div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <div className="text-xl sm:text-2xl font-bold text-amber-600">{stats.ongoing}</div>
            <div className="text-xs text-muted-foreground">Ongoing</div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <div className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <div className="text-xl sm:text-2xl font-bold text-teal-600">{stats.avgPassRate}%</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Pass Rate</div>
          </CardContent></Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
          <TabsTrigger value="results">Results Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <ExamScheduleTab
            exams={exams} departments={departments} courses={courses} subjects={subjects}
            filterDept={filterDept} setFilterDept={setFilterDept}
            filterType={filterType} setFilterType={setFilterType}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            filterSemester={filterSemester} setFilterSemester={setFilterSemester}
            onNew={() => { setEditingExam(null); setShowForm(true); }}
            onEdit={(e) => { setEditingExam(e); setShowForm(true); }}
            onDelete={setDeleteConfirm}
            onViewResults={(e) => { setSelectedExam(e); setShowResults(true); setActiveTab("results"); }}
            onStatusChange={async (id, status) => {
              await fetch(`${API_BASE}/api/exams/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify({ status }) });
              fetchExams(); fetchStats();
            }}
          />
        </TabsContent>

        <TabsContent value="results">
          <ResultsTab
            exams={exams} selectedExam={selectedExam} setSelectedExam={setSelectedExam}
            headers={headers} onRefresh={() => { fetchExams(); fetchStats(); }}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab exams={exams} stats={stats} headers={headers} />
        </TabsContent>
      </Tabs>

      {showForm && (
        <ExamFormDialog
          exam={editingExam}
          departments={departments}
          courses={courses}
          subjects={subjects}
          headers={headers}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchExams(); fetchStats(); }}
        />
      )}

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam</DialogTitle>
            <DialogDescription>This will permanently delete this exam and all associated results. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExamScheduleTab({ exams, departments, filterDept, setFilterDept, filterType, setFilterType, filterStatus, setFilterStatus, filterSemester, setFilterSemester, onNew, onEdit, onDelete, onViewResults, onStatusChange }: {
  exams: Exam[]; departments: Department[]; courses: Course[]; subjects: Subject[];
  filterDept: string; setFilterDept: (v: string) => void;
  filterType: string; setFilterType: (v: string) => void;
  filterStatus: string; setFilterStatus: (v: string) => void;
  filterSemester: string; setFilterSemester: (v: string) => void;
  onNew: () => void; onEdit: (e: Exam) => void; onDelete: (id: number) => void;
  onViewResults: (e: Exam) => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
        <CardTitle>Exam Schedule</CardTitle>
        <Button onClick={onNew}><Plus className="w-4 h-4 mr-2" /> Schedule Exam</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {["Internal", "External", "Supplementary", "Model", "Practical"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {["Scheduled", "Ongoing", "Completed", "Cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterSemester} onValueChange={setFilterSemester}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Semester" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {[1,2,3,4,5,6].map(s => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Sem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12">No exams found. Click "Schedule Exam" to create one.</TableCell></TableRow>
              ) : exams.map(e => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="font-medium">{e.subjectCode} - {e.subjectName}</div>
                    <div className="text-xs text-muted-foreground">{e.academicYear}</div>
                  </TableCell>
                  <TableCell><Badge className={TYPE_COLORS[e.type] || ""}>{e.type}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm"><CalendarDays className="h-3 w-3 text-muted-foreground" /> {e.date}</div>
                    {e.startTime && <div className="text-xs text-muted-foreground flex items-center gap-1"><Timer className="h-3 w-3" /> {e.startTime}{e.endTime ? ` - ${e.endTime}` : ""}{e.duration ? ` (${e.duration}min)` : ""}</div>}
                  </TableCell>
                  <TableCell>{e.venue ? <div className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3 text-muted-foreground" /> {e.venue}</div> : <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{e.maxMarks}</div>
                    {e.passMarks && <div className="text-xs text-muted-foreground">Pass: {e.passMarks}</div>}
                  </TableCell>
                  <TableCell>{e.semester}</TableCell>
                  <TableCell>
                    <Select value={e.status} onValueChange={(v) => onStatusChange(e.id, v)}>
                      <SelectTrigger className="h-7 w-[120px] p-0 px-2 border-0">
                        <Badge variant="outline" className={`${STATUS_COLORS[e.status] || ""} cursor-pointer`}>{e.status}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {["Scheduled", "Ongoing", "Completed", "Cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onViewResults(e)} title="View Results"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(e)} title="Edit"><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => onDelete(e.id)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ExamFormDialog({ exam, departments, courses, subjects, headers, onClose, onSaved }: {
  exam: Exam | null; departments: Department[]; courses: Course[]; subjects: Subject[];
  headers: () => Record<string, string>; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    subjectId: exam?.subjectId || 0,
    departmentId: exam?.departmentId || 0,
    courseId: exam?.courseId || 0,
    type: exam?.type || "Internal",
    maxMarks: exam?.maxMarks || 100,
    passMarks: exam?.passMarks || 40,
    date: exam?.date || new Date().toISOString().split("T")[0],
    startTime: exam?.startTime || "",
    endTime: exam?.endTime || "",
    duration: exam?.duration || 180,
    venue: exam?.venue || "",
    semester: exam?.semester || 1,
    academicYear: exam?.academicYear || "2025-2026",
    status: exam?.status || "Scheduled",
    instructions: exam?.instructions || "",
  });
  const [saving, setSaving] = useState(false);

  const filteredCourses = form.departmentId ? courses.filter(c => c.departmentId === form.departmentId) : courses;
  const filteredSubjects = form.courseId ? subjects.filter(s => s.courseId === form.courseId) : subjects;

  const handleSubmit = async () => {
    if (!form.subjectId || !form.date) return;
    setSaving(true);
    try {
      const url = exam ? `${API_BASE}/api/exams/${exam.id}` : `${API_BASE}/api/exams`;
      const res = await fetch(url, {
        method: exam ? "PUT" : "POST",
        headers: headers(),
        body: JSON.stringify({
          ...form,
          departmentId: form.departmentId || null,
          courseId: form.courseId || null,
          startTime: form.startTime || null,
          endTime: form.endTime || null,
          venue: form.venue || null,
          instructions: form.instructions || null,
        }),
      });
      if (res.ok) onSaved();
    } catch {} finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{exam ? "Edit Exam" : "Schedule New Exam"}</DialogTitle>
          <DialogDescription>Fill in the exam details below. Fields marked with * are required.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={String(form.departmentId || "")} onValueChange={(v) => setForm(f => ({ ...f, departmentId: Number(v), courseId: 0, subjectId: 0 }))}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Departments</SelectItem>
                  {departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Course</Label>
              <Select value={String(form.courseId || "")} onValueChange={(v) => setForm(f => ({ ...f, courseId: Number(v), subjectId: 0 }))}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Courses</SelectItem>
                  {filteredCourses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.code} - {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Subject *</Label>
            <Select value={String(form.subjectId || "")} onValueChange={(v) => setForm(f => ({ ...f, subjectId: Number(v) }))}>
              <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {filteredSubjects.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.code} - {s.name} (Sem {s.semester})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Internal", "External", "Supplementary", "Model", "Practical"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Max Marks *</Label>
              <Input type="number" value={form.maxMarks} onChange={e => setForm(f => ({ ...f, maxMarks: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Pass Marks</Label>
              <Input type="number" value={form.passMarks} onChange={e => setForm(f => ({ ...f, passMarks: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Semester *</Label>
              <Select value={String(form.semester)} onValueChange={(v) => setForm(f => ({ ...f, semester: Number(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6].map(s => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>End Time</Label>
              <Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Venue / Room</Label>
              <Input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="e.g. Hall A, Room 201" />
            </div>
            <div className="space-y-1.5">
              <Label>Academic Year</Label>
              <Select value={form.academicYear} onValueChange={(v) => setForm(f => ({ ...f, academicYear: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["2024-2025", "2025-2026", "2026-2027"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {exam && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Scheduled", "Ongoing", "Completed", "Cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Instructions</Label>
            <Textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Exam instructions for students..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.subjectId}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {exam ? "Update Exam" : "Schedule Exam"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResultsTab({ exams, selectedExam, setSelectedExam, headers, onRefresh }: {
  exams: Exam[]; selectedExam: Exam | null; setSelectedExam: (e: Exam | null) => void;
  headers: () => Record<string, string>; onRefresh: () => void;
}) {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [eligibleStudents, setEligibleStudents] = useState<EligibleStudent[]>([]);
  const [resultRecords, setResultRecords] = useState<Record<number, { marks: number; grade: string; status: string }>>({});
  const [examStats, setExamStats] = useState<ExamDetailStats | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"view" | "entry">("view");

  const fetchResults = useCallback(async (examId: number) => {
    setLoading(true);
    try {
      const [resR, resS, resE] = await Promise.all([
        fetch(`${API_BASE}/api/exam-results?examId=${examId}`, { headers: headers() }),
        fetch(`${API_BASE}/api/exam-stats/${examId}`, { headers: headers() }),
        fetch(`${API_BASE}/api/exam-eligible-students/${examId}`, { headers: headers() }),
      ]);
      if (resR.ok) {
        const data = await resR.json();
        setResults(data);
        if (data.length > 0) setMode("view");
        else setMode("entry");
      }
      if (resS.ok) setExamStats(await resS.json());
      if (resE.ok) setEligibleStudents(await resE.json());
    } catch {} finally { setLoading(false); }
  }, [headers]);

  useEffect(() => {
    if (selectedExam) fetchResults(selectedExam.id);
    else { setResults([]); setExamStats(null); setEligibleStudents([]); setMode("view"); }
  }, [selectedExam, fetchResults]);

  const handleAutoGrade = (studentId: number, marks: number) => {
    if (!selectedExam) return;
    const pct = Math.round((marks / selectedExam.maxMarks) * 100);
    const threshold = selectedExam.passMarks ? Math.round((selectedExam.passMarks / selectedExam.maxMarks) * 100) : 40;
    let grade = "F", status = "Fail";
    if (pct >= threshold) {
      const grades = [
        { min: 91, g: "O" }, { min: 81, g: "A+" }, { min: 71, g: "A" },
        { min: 61, g: "B+" }, { min: 51, g: "B" }, { min: 41, g: "C" },
      ];
      const match = grades.find(g => pct >= g.min);
      grade = match?.g || "C";
      status = "Pass";
    }
    setResultRecords(prev => ({ ...prev, [studentId]: { marks, grade, status } }));
  };

  const handleSubmitResults = async () => {
    if (!selectedExam) return;
    const entries = Object.entries(resultRecords)
      .filter(([, r]) => r.marks >= 0)
      .map(([sid, r]) => ({ studentId: Number(sid), marksObtained: r.marks, grade: r.grade, status: r.status }));
    if (entries.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/exam-results`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ examId: selectedExam.id, results: entries }),
      });
      if (res.ok) {
        setResultRecords({});
        fetchResults(selectedExam.id);
        onRefresh();
      }
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Results Management</CardTitle>
            {selectedExam && mode === "view" && results.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => {
                const existing: Record<number, { marks: number; grade: string; status: string }> = {};
                results.forEach(r => { existing[r.studentId] = { marks: r.marksObtained, grade: r.grade || "", status: r.status }; });
                setResultRecords(existing);
                setMode("entry");
              }}>
                <Edit className="h-4 w-4 mr-2" /> Edit Results
              </Button>
            )}
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <Select value={selectedExam ? String(selectedExam.id) : ""} onValueChange={(v) => {
              const e = exams.find(ex => ex.id === Number(v));
              setSelectedExam(e || null);
            }}>
              <SelectTrigger className="w-[400px]"><SelectValue placeholder="Select an exam..." /></SelectTrigger>
              <SelectContent>
                {exams.map(e => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.subjectCode} - {e.subjectName} | {e.type} | {e.date} | Sem {e.semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedExam && (
              <div className="flex gap-2">
                <Badge className={TYPE_COLORS[selectedExam.type] || ""}>{selectedExam.type}</Badge>
                <Badge variant="outline">Max: {selectedExam.maxMarks}</Badge>
                {selectedExam.passMarks && <Badge variant="outline">Pass: {selectedExam.passMarks}</Badge>}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : !selectedExam ? (
            <p className="text-muted-foreground text-center py-12">Select an exam to view or enter results.</p>
          ) : (
            <div className="space-y-4">
              {examStats && examStats.total > 0 && mode === "view" && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{examStats.total}</div>
                    <div className="text-[11px] text-muted-foreground">Total</div>
                  </div>
                  <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-emerald-600">{examStats.passCount}</div>
                    <div className="text-[11px] text-muted-foreground">Passed</div>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-red-600">{examStats.failCount}</div>
                    <div className="text-[11px] text-muted-foreground">Failed</div>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-amber-600">{examStats.absentCount}</div>
                    <div className="text-[11px] text-muted-foreground">Absent</div>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">{examStats.passRate}%</div>
                    <div className="text-[11px] text-muted-foreground">Pass Rate</div>
                  </div>
                  <div className="bg-violet-500/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-violet-600">{examStats.highest}</div>
                    <div className="text-[11px] text-muted-foreground">Highest</div>
                  </div>
                  <div className="bg-cyan-500/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-cyan-600">{examStats.average}</div>
                    <div className="text-[11px] text-muted-foreground">Average</div>
                  </div>
                </div>
              )}

              {mode === "view" && results.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map(r => {
                      const pct = selectedExam ? Math.round((r.marksObtained / selectedExam.maxMarks) * 100) : 0;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono text-sm">{r.rollNumber || "-"}</TableCell>
                          <TableCell className="font-medium">{r.firstName} {r.lastName}</TableCell>
                          <TableCell>{r.marksObtained} / {selectedExam?.maxMarks}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${pct >= 60 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-sm">{pct}%</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="font-mono">{r.grade || "-"}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={r.status === "Pass" ? "default" : r.status === "Absent" ? "secondary" : "destructive"}>
                              {r.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {mode === "entry" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {results.length > 0 ? "Editing existing results. Grades auto-calculate based on marks." : "Enter marks below. Grades and pass/fail auto-calculate."}
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Marks (/{selectedExam.maxMarks})</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eligibleStudents.map(s => {
                        const rec = resultRecords[s.id];
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="font-mono text-sm">{s.rollNumber}</TableCell>
                            <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                className="w-24"
                                min={0}
                                max={selectedExam.maxMarks}
                                value={rec?.marks ?? ""}
                                onChange={e => handleAutoGrade(s.id, Number(e.target.value))}
                              />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono w-10 justify-center">{rec?.grade || "-"}</Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={rec?.status || "Pass"}
                                onValueChange={(v) => setResultRecords(prev => ({
                                  ...prev,
                                  [s.id]: { marks: prev[s.id]?.marks || 0, grade: prev[s.id]?.grade || "", status: v }
                                }))}
                              >
                                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pass">Pass</SelectItem>
                                  <SelectItem value="Fail">Fail</SelectItem>
                                  <SelectItem value="Absent">Absent</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {eligibleStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No eligible students found for this exam's department/semester combination.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center">
                    {results.length > 0 && (
                      <Button variant="outline" onClick={() => { setResultRecords({}); setMode("view"); }}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Results
                      </Button>
                    )}
                    <Button
                      onClick={handleSubmitResults}
                      disabled={saving || Object.keys(resultRecords).length === 0}
                      className="ml-auto"
                    >
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {results.length > 0 ? "Update Results" : "Submit Results"}
                    </Button>
                  </div>
                </div>
              )}

              {mode === "view" && results.length === 0 && eligibleStudents.length > 0 && (
                <div className="text-center py-8 space-y-3">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">No results recorded yet.</p>
                  <Button onClick={() => setMode("entry")}>
                    <Plus className="h-4 w-4 mr-2" /> Enter Results
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsTab({ exams, stats, headers }: {
  exams: Exam[]; stats: ExamStats | null; headers: () => Record<string, string>;
}) {
  if (!stats) return null;

  const gradeOrder = ["O", "A+", "A", "B+", "B", "C", "F"];
  const gradeColors: Record<string, string> = {
    O: "bg-emerald-500", "A+": "bg-teal-500", A: "bg-blue-500",
    "B+": "bg-indigo-500", B: "bg-violet-500", C: "bg-amber-500", F: "bg-red-500",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Exam Type Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.typeBreakdown).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={TYPE_COLORS[type] || ""}>{type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(count / stats.total) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Overall Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Results Recorded</span>
                <span className="font-bold">{stats.totalResults}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Passed</span>
                <span className="font-bold text-emerald-600">{stats.passCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600 flex items-center gap-1"><XCircle className="h-3 w-3" /> Failed</span>
                <span className="font-bold text-red-600">{stats.failCount}</span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="text-sm font-medium">Overall Pass Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${stats.avgPassRate >= 60 ? "bg-emerald-500" : stats.avgPassRate >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${stats.avgPassRate}%` }} />
                  </div>
                  <span className="font-bold">{stats.avgPassRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Status Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Scheduled", count: stats.scheduled, color: "text-blue-600", bg: "bg-blue-500/10" },
              { label: "Ongoing", count: stats.ongoing, color: "text-amber-600", bg: "bg-amber-500/10" },
              { label: "Completed", count: stats.completed, color: "text-emerald-600", bg: "bg-emerald-500/10" },
              { label: "Cancelled", count: stats.cancelled, color: "text-red-600", bg: "bg-red-500/10" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-lg p-4 text-center`}>
                <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Exams</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Max Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.slice(0, 10).map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.subjectCode} - {e.subjectName}</TableCell>
                  <TableCell><Badge className={TYPE_COLORS[e.type] || ""}>{e.type}</Badge></TableCell>
                  <TableCell>{e.date}</TableCell>
                  <TableCell><Badge variant="outline" className={STATUS_COLORS[e.status] || ""}>{e.status}</Badge></TableCell>
                  <TableCell>{e.maxMarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
