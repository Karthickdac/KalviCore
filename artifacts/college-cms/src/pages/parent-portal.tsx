import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { User, GraduationCap, IndianRupee, BookOpen, LogOut, Phone, Home, Megaphone, Pin, AlertTriangle, Clock, Users } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function ParentPortalPage() {
  const { toast } = useToast();
  const [rollNumber, setRollNumber] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/parent-portal/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber, guardianPhone }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Invalid credentials"); setLoading(false); return; }
      const data = await res.json();
      setStudent(data.student);
    } catch { setError("Connection failed"); }
    setLoading(false);
  };

  const { data: feeData } = useQuery({
    queryKey: ["parent-fees", student?.id],
    queryFn: async () => {
      const params = new URLSearchParams({ rollNumber: student.rollNumber, guardianPhone: student.guardianPhone });
      const r = await fetch(`${API_BASE}/api/parent-portal/fees/${student.id}?${params}`);
      return r.json();
    },
    enabled: !!student?.id,
  });

  const { data: results = [] } = useQuery({
    queryKey: ["parent-results", student?.id],
    queryFn: async () => {
      const params = new URLSearchParams({ rollNumber: student.rollNumber, guardianPhone: student.guardianPhone });
      const r = await fetch(`${API_BASE}/api/parent-portal/results/${student.id}?${params}`);
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parent Portal</h1>
          <p className="text-muted-foreground">Parents can view their child's information using roll number and registered phone number.</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mb-2">
              <Home className="w-7 h-7 text-white" />
            </div>
            <CardTitle>Parent Login</CardTitle>
            <CardDescription>Enter your child's roll number and your registered phone number.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">{error}</div>}
              <div className="space-y-2">
                <Label>Student Roll Number</Label>
                <Input value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="e.g., 21TAM001" required />
              </div>
              <div className="space-y-2">
                <Label>Guardian Phone Number</Label>
                <Input value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)} placeholder="e.g., 9876543210" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "View Student Info"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parent Portal</h1>
          <p className="text-muted-foreground">Viewing information for {student.name}</p>
        </div>
        <Button variant="outline" onClick={() => { setStudent(null); setRollNumber(""); setGuardianPhone(""); }}>
          <LogOut className="mr-2 h-4 w-4" />Exit Portal
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">{student.name?.[0]}</div>
            <div>
              <h2 className="text-xl font-bold">{student.name}</h2>
              <p className="text-sm text-muted-foreground">{student.rollNumber} | {student.department} | {student.course}</p>
              <div className="flex gap-2 mt-1">
                <Badge>{student.status}</Badge>
                <Badge variant="outline">Year {student.year} / Sem {student.semester}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><User className="w-6 h-6 mx-auto mb-1 text-blue-500" /><p className="font-bold text-sm">{student.fatherName || "-"}</p><p className="text-xs text-muted-foreground">Father's Name</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Phone className="w-6 h-6 mx-auto mb-1 text-green-500" /><p className="font-bold text-sm">{student.phone || "-"}</p><p className="text-xs text-muted-foreground">Student Phone</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><IndianRupee className="w-6 h-6 mx-auto mb-1 text-amber-500" /><p className="font-bold text-sm">₹{Number(feeData?.totalPaid || 0).toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">Fees Paid</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><BookOpen className="w-6 h-6 mx-auto mb-1 text-purple-500" /><p className="font-bold text-sm">{(results as any[]).length}</p><p className="text-xs text-muted-foreground">Exam Results</p></CardContent></Card>
      </div>

      <Tabs defaultValue="noticeboard">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="noticeboard" className="gap-1.5"><Megaphone className="w-3.5 h-3.5" />Noticeboard</TabsTrigger>
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="fees">Fee Payments</TabsTrigger>
          <TabsTrigger value="results">Exam Results</TabsTrigger>
        </TabsList>

        <TabsContent value="noticeboard">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Megaphone className="w-4 h-4 text-teal-600" />College Noticeboard</CardTitle></CardHeader>
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
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader><CardTitle className="text-base">Student Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                <div className="col-span-2"><Label className="text-muted-foreground">Address</Label><p className="font-medium">{student.address || "-"}</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader><CardTitle className="text-base">Fee Payments (Total Paid: ₹{Number(feeData?.totalPaid || 0).toLocaleString("en-IN")})</CardTitle></CardHeader>
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
              ) : <p className="text-center py-4 text-muted-foreground">No fee payments recorded</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader><CardTitle className="text-base">Exam Results</CardTitle></CardHeader>
            <CardContent>
              {(results as any[]).length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Exam</TableHead><TableHead>Semester</TableHead><TableHead>Marks</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(results as any[]).map((r: any) => (
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
              ) : <p className="text-center py-4 text-muted-foreground">No exam results available</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
