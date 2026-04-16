import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  User, GraduationCap, IndianRupee, BookOpen, LogOut, Phone, Home,
  Megaphone, Pin, AlertTriangle, Clock, Users, ArrowLeft, LayoutDashboard,
  FileText, CreditCard, Award, ChevronLeft, ChevronRight, Menu
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

type ParentSection = "dashboard" | "noticeboard" | "info" | "fees" | "results";

const sidebarItems: { id: ParentSection; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "noticeboard", label: "Noticeboard", icon: <Megaphone className="w-4 h-4" /> },
  { id: "info", label: "Student Info", icon: <User className="w-4 h-4" /> },
  { id: "fees", label: "Fee Payments", icon: <CreditCard className="w-4 h-4" /> },
  { id: "results", label: "Exam Results", icon: <Award className="w-4 h-4" /> },
];

export default function ParentPortalPage() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [student, setStudent] = useState<any>(null);
  const [portalUser, setPortalUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<ParentSection>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/portal/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Invalid credentials"); setLoading(false); return; }
      const data = await res.json();
      setPortalUser(data.user);
      if (data.user.studentRecordId) {
        const studentRes = await fetch(`${API_BASE}/api/parent-portal/student/${data.user.studentRecordId}`);
        if (studentRes.ok) {
          const studentData = await studentRes.json();
          setStudent(studentData);
        } else {
          setStudent({ id: data.user.studentRecordId, rollNumber: data.user.rollNumber, firstName: data.user.fullName, lastName: "", email: data.user.email });
        }
      } else {
        setStudent({ id: null, rollNumber: "-", firstName: data.user.fullName, lastName: "", email: data.user.email });
      }
      setActiveSection("dashboard");
    } catch { setError("Connection failed"); }
    setLoading(false);
  };

  const handleLogout = () => {
    setStudent(null);
    setPortalUser(null);
    setUsername("");
    setPassword("");
    setActiveSection("dashboard");
  };

  const { data: feeData } = useQuery({
    queryKey: ["parent-fees", student?.id],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/parent-portal/fees/${student.id}`);
      return r.json();
    },
    enabled: !!student?.id,
  });

  const { data: results = [] } = useQuery({
    queryKey: ["parent-results", student?.id],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/parent-portal/results/${student.id}`);
      return r.json();
    },
    enabled: !!student?.id,
  });

  const { data: noticeboard = [] } = useQuery({
    queryKey: ["parent-noticeboard"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/api/noticeboard`); return r.json(); },
    enabled: !!student,
  });

  const getPriorityStyle = (p: string) => {
    if (p === "Urgent") return { badge: "bg-red-500/10 text-red-600 border-red-500/20", icon: <AlertTriangle className="w-4 h-4 text-red-500" /> };
    if (p === "High") return { badge: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: <Pin className="w-4 h-4 text-amber-500" /> };
    return { badge: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: <Megaphone className="w-4 h-4 text-blue-500" /> };
  };

  const getTypeColor = (t: string) => {
    if (t === "Academic") return "bg-violet-500/10 text-violet-600 border-violet-500/20";
    if (t === "Placement") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    if (t === "Administrative") return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Login
          </Link>

          <Card className="shadow-xl border-green-200/50">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                <Home className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Parent Portal</CardTitle>
              <CardDescription>Enter your username and password to access.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">{error}</div>}
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? "Verifying..." : "Access Portal"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">KalviCore — Complete Campus. One Intelligent System</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen bg-card border-r flex flex-col transition-all duration-300
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${sidebarCollapsed ? "w-[68px]" : "w-64"}
      `}>
        <div className={`flex items-center gap-3 p-4 border-b ${sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <Home className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h2 className="font-bold text-sm truncate">Parent Portal</h2>
              <p className="text-xs text-muted-foreground truncate">KalviCore</p>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-b">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {student.name?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{student.name}</p>
                <p className="text-xs text-muted-foreground truncate">{student.rollNumber}</p>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }}
                className={`
                  w-full flex items-center gap-3 rounded-lg text-sm transition-colors
                  ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
                  ${activeSection === item.id
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t p-2 space-y-1">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}`}
            title={sidebarCollapsed ? "Exit Portal" : undefined}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Exit Portal</span>}
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex w-full items-center gap-3 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors justify-center px-2 py-2"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b px-4 lg:px-6 h-14 flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-1.5 rounded-md hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg">
            {sidebarItems.find(i => i.id === activeSection)?.label || "Dashboard"}
          </h1>
        </header>

        <div className="p-4 lg:p-6 max-w-6xl">
          {activeSection === "dashboard" && <DashboardSection student={student} feeData={feeData} results={results} noticeboard={noticeboard} getPriorityStyle={getPriorityStyle} getTypeColor={getTypeColor} onNavigate={setActiveSection} />}
          {activeSection === "noticeboard" && <NoticeboardSection noticeboard={noticeboard} getPriorityStyle={getPriorityStyle} getTypeColor={getTypeColor} />}
          {activeSection === "info" && <InfoSection student={student} />}
          {activeSection === "fees" && <FeesSection feeData={feeData} />}
          {activeSection === "results" && <ResultsSection results={results} />}
        </div>
      </main>
    </div>
  );
}

function DashboardSection({ student, feeData, results, noticeboard, getPriorityStyle, getTypeColor, onNavigate }: any) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">{student.name?.[0]}</div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold">{student.name}</h2>
              <p className="text-sm text-muted-foreground">{student.rollNumber} | {student.department} | {student.course}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <Badge>{student.status}</Badge>
                <Badge variant="outline">Year {student.year} / Sem {student.semester}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("info")}>
          <CardContent className="p-4 text-center">
            <User className="w-6 h-6 mx-auto mb-1 text-blue-500" />
            <p className="font-bold text-sm">{student.fatherName || "-"}</p>
            <p className="text-xs text-muted-foreground">Father's Name</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("info")}>
          <CardContent className="p-4 text-center">
            <Phone className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="font-bold text-sm">{student.phone || "-"}</p>
            <p className="text-xs text-muted-foreground">Student Phone</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("fees")}>
          <CardContent className="p-4 text-center">
            <IndianRupee className="w-6 h-6 mx-auto mb-1 text-amber-500" />
            <p className="font-bold text-sm">₹{Number(feeData?.totalPaid || 0).toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground">Fees Paid</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("results")}>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-1 text-purple-500" />
            <p className="font-bold text-sm">{(results as any[]).length}</p>
            <p className="text-xs text-muted-foreground">Exam Results</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Megaphone className="w-4 h-4 text-teal-600" />Latest Notices</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("noticeboard")} className="text-xs">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          {!Array.isArray(noticeboard) || noticeboard.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground text-sm">No active notices at this time.</p>
          ) : (
            <div className="space-y-3">
              {noticeboard.slice(0, 3).map((notice: any) => {
                const ps = getPriorityStyle(notice.priority);
                return (
                  <div key={notice.id} className={`border rounded-lg p-3 ${notice.priority === "Urgent" ? "border-red-500/30 bg-red-500/5" : "hover:bg-muted/30"} transition-colors`}>
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">{ps.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm">{notice.title}</h4>
                          <Badge variant="outline" className={`text-xs ${ps.badge}`}>{notice.priority}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NoticeboardSection({ noticeboard, getPriorityStyle, getTypeColor }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Megaphone className="w-4 h-4 text-teal-600" />College Noticeboard</CardTitle>
      </CardHeader>
      <CardContent>
        {!Array.isArray(noticeboard) || noticeboard.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No active notices at this time.</p>
        ) : (
          <div className="space-y-3">
            {noticeboard.map((notice: any) => {
              const ps = getPriorityStyle(notice.priority);
              return (
                <div key={notice.id} className={`border rounded-lg p-4 space-y-2 ${notice.priority === "Urgent" ? "border-red-500/30 bg-red-500/5" : "hover:bg-muted/30"} transition-colors`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{ps.icon}</div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="font-semibold text-sm">{notice.title}</h4>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={`text-xs ${ps.badge}`}>{notice.priority}</Badge>
                          <Badge variant="outline" className={`text-xs ${getTypeColor(notice.type)}`}>{notice.type}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{notice.content}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{notice.postedBy}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(notice.publishDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoSection({ student }: { student: any }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-blue-500" />Student Information</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><Label className="text-muted-foreground">Full Name</Label><p className="font-medium">{student.name}</p></div>
          <div><Label className="text-muted-foreground">Roll Number</Label><p className="font-medium">{student.rollNumber}</p></div>
          <div><Label className="text-muted-foreground">Department</Label><p className="font-medium">{student.department}</p></div>
          <div><Label className="text-muted-foreground">Course</Label><p className="font-medium">{student.course}</p></div>
          <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{student.email || "-"}</p></div>
          <div><Label className="text-muted-foreground">Phone</Label><p className="font-medium">{student.phone || "-"}</p></div>
          <div><Label className="text-muted-foreground">Gender</Label><p className="font-medium">{student.gender}</p></div>
          <div><Label className="text-muted-foreground">Community</Label><p className="font-medium">{student.community}</p></div>
          <div><Label className="text-muted-foreground">Blood Group</Label><p className="font-medium">{student.bloodGroup || "-"}</p></div>
          <div><Label className="text-muted-foreground">Father's Name</Label><p className="font-medium">{student.fatherName || "-"}</p></div>
          <div className="sm:col-span-2"><Label className="text-muted-foreground">Address</Label><p className="font-medium">{student.address || "-"}</p></div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeesSection({ feeData }: { feeData: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-amber-500" />Fee Payments
          <Badge variant="outline" className="ml-auto">Total Paid: ₹{Number(feeData?.totalPaid || 0).toLocaleString("en-IN")}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feeData?.payments?.length > 0 ? (
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Mode</TableHead><TableHead>Semester</TableHead></TableRow></TableHeader>
            <TableBody>
              {feeData.payments.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                  <TableCell className="font-medium">₹{Number(p.amount || 0).toLocaleString("en-IN")}</TableCell>
                  <TableCell><Badge variant="outline">{p.paymentMode}</Badge></TableCell>
                  <TableCell>{p.semester}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : <p className="text-center py-6 text-muted-foreground">No fee payments recorded</p>}
      </CardContent>
    </Card>
  );
}

function ResultsSection({ results }: { results: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-500" />Exam Results
          <Badge variant="outline" className="ml-auto">{results.length} result{results.length !== 1 ? "s" : ""}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length > 0 ? (
          <Table>
            <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Exam</TableHead><TableHead>Semester</TableHead><TableHead>Marks</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {results.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm"><div><p className="font-medium">{r.subjectName}</p><p className="text-xs text-muted-foreground">{r.subjectCode}</p></div></TableCell>
                  <TableCell><Badge variant="outline">{r.examType}</Badge></TableCell>
                  <TableCell>{r.semester}</TableCell>
                  <TableCell className="font-medium">{r.marksObtained}</TableCell>
                  <TableCell><Badge variant="outline">{r.grade}</Badge></TableCell>
                  <TableCell><Badge variant={r.status === "Pass" ? "default" : "destructive"}>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : <p className="text-center py-6 text-muted-foreground">No exam results available</p>}
      </CardContent>
    </Card>
  );
}
