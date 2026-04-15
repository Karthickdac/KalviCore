import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useListStudents } from "@workspace/api-client-react";
import { Building2, Briefcase, Users, GraduationCap, TrendingUp, Plus, Search, IndianRupee, BookOpen, CheckCircle, Clock, XCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function PlacementsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [tab, setTab] = useState("drives");
  const [companyDialog, setCompanyDialog] = useState(false);
  const [driveDialog, setDriveDialog] = useState(false);
  const [applyDialog, setApplyDialog] = useState(false);
  const [trainingDialog, setTrainingDialog] = useState(false);
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [selectedDriveId, setSelectedDriveId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [companyForm, setCompanyForm] = useState({ name: "", industry: "", website: "", contactPerson: "", contactEmail: "", contactPhone: "", address: "" });
  const [driveForm, setDriveForm] = useState({ companyId: "", title: "", driveDate: "", packageMin: "", packageMax: "", eligibilityCriteria: "", rolesOffered: "", location: "", driveType: "On-Campus", departmentsEligible: "", description: "" });
  const [trainingForm, setTrainingForm] = useState({ title: "", trainer: "", trainerOrg: "", startDate: "", endDate: "", duration: "", type: "Technical", mode: "Offline", maxParticipants: "", description: "" });

  const { data: stats } = useQuery({ queryKey: ["placement-stats"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/placement-stats`, { headers }); return r.json(); } });
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/companies`, { headers }); return r.json(); } });
  const { data: drives = [] } = useQuery({ queryKey: ["placement-drives"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/placement-drives`, { headers }); return r.json(); } });
  const { data: applications = [] } = useQuery({ queryKey: ["placement-applications"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/placement-applications`, { headers }); return r.json(); } });
  const { data: trainings = [] } = useQuery({ queryKey: ["training-programs"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/training-programs`, { headers }); return r.json(); } });
  const { data: enrollments = [] } = useQuery({ queryKey: ["training-enrollments"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/training-enrollments`, { headers }); return r.json(); } });
  const { data: students = [] } = useListStudents();

  const invalidateAll = () => { ["placement-stats", "companies", "placement-drives", "placement-applications", "training-programs", "training-enrollments"].forEach(k => qc.invalidateQueries({ queryKey: [k] })); };

  const addCompany = useMutation({
    mutationFn: async () => { const r = await fetch(`${API_BASE}/api/companies`, { method: "POST", headers, body: JSON.stringify(companyForm) }); if (!r.ok) throw new Error("Failed"); return r.json(); },
    onSuccess: () => { toast({ title: "Company added" }); setCompanyDialog(false); setCompanyForm({ name: "", industry: "", website: "", contactPerson: "", contactEmail: "", contactPhone: "", address: "" }); invalidateAll(); },
    onError: () => toast({ title: "Failed to add company", variant: "destructive" }),
  });

  const addDrive = useMutation({
    mutationFn: async () => { const r = await fetch(`${API_BASE}/api/placement-drives`, { method: "POST", headers, body: JSON.stringify(driveForm) }); if (!r.ok) throw new Error("Failed"); return r.json(); },
    onSuccess: () => { toast({ title: "Drive created" }); setDriveDialog(false); setDriveForm({ companyId: "", title: "", driveDate: "", packageMin: "", packageMax: "", eligibilityCriteria: "", rolesOffered: "", location: "", driveType: "On-Campus", departmentsEligible: "", description: "" }); invalidateAll(); },
    onError: () => toast({ title: "Failed to create drive", variant: "destructive" }),
  });

  const applyStudent = useMutation({
    mutationFn: async () => { const r = await fetch(`${API_BASE}/api/placement-applications`, { method: "POST", headers, body: JSON.stringify({ driveId: selectedDriveId, studentId: selectedStudentId }) }); if (!r.ok) { const d = await r.json(); throw new Error(d.error); } return r.json(); },
    onSuccess: () => { toast({ title: "Application submitted" }); setApplyDialog(false); setSelectedStudentId(""); setStudentSearch(""); invalidateAll(); },
    onError: (e: any) => toast({ title: e.message || "Failed to apply", variant: "destructive" }),
  });

  const updateAppStatus = useMutation({
    mutationFn: async ({ id, status, packageOffered }: { id: number; status: string; packageOffered?: string }) => {
      const r = await fetch(`${API_BASE}/api/placement-applications/${id}`, { method: "PATCH", headers, body: JSON.stringify({ status, packageOffered }) });
      if (!r.ok) throw new Error("Failed"); return r.json();
    },
    onSuccess: () => { toast({ title: "Status updated" }); invalidateAll(); },
  });

  const addTraining = useMutation({
    mutationFn: async () => { const r = await fetch(`${API_BASE}/api/training-programs`, { method: "POST", headers, body: JSON.stringify(trainingForm) }); if (!r.ok) throw new Error("Failed"); return r.json(); },
    onSuccess: () => { toast({ title: "Training program created" }); setTrainingDialog(false); setTrainingForm({ title: "", trainer: "", trainerOrg: "", startDate: "", endDate: "", duration: "", type: "Technical", mode: "Offline", maxParticipants: "", description: "" }); invalidateAll(); },
    onError: () => toast({ title: "Failed to create program", variant: "destructive" }),
  });

  const enrollStudent = useMutation({
    mutationFn: async () => { const r = await fetch(`${API_BASE}/api/training-enrollments`, { method: "POST", headers, body: JSON.stringify({ programId: selectedProgramId, studentId: selectedStudentId }) }); if (!r.ok) throw new Error("Failed"); return r.json(); },
    onSuccess: () => { toast({ title: "Student enrolled" }); setEnrollDialog(false); setSelectedStudentId(""); setStudentSearch(""); invalidateAll(); },
    onError: () => toast({ title: "Failed to enroll", variant: "destructive" }),
  });

  const filteredStudents = (students as any[]).filter((s: any) => {
    if (!studentSearch) return false;
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    return name.includes(studentSearch.toLowerCase()) || s.rollNumber?.toLowerCase().includes(studentSearch.toLowerCase());
  });

  const getStudentName = (id: number) => { const s = (students as any[]).find(s => s.id === id); return s ? `${s.firstName} ${s.lastName}` : "-"; };

  const StudentSearchField = () => (
    <div className="space-y-2">
      <Label>Student</Label>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or roll..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="pl-8" />
      </div>
      {studentSearch && (
        <div className="max-h-32 overflow-y-auto border rounded-md">
          {filteredStudents.slice(0, 5).map((s: any) => (
            <button key={s.id} className="w-full text-left px-3 py-1.5 hover:bg-accent text-sm" onClick={() => { setSelectedStudentId(String(s.id)); setStudentSearch(""); }}>
              {s.rollNumber} — {s.firstName} {s.lastName}
            </button>
          ))}
        </div>
      )}
      {selectedStudentId && !studentSearch && <Badge variant="secondary">{getStudentName(Number(selectedStudentId))}</Badge>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Training & Placement</h1>
          <p className="text-muted-foreground">Manage placement drives, company partnerships, and student training programs.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Building2 className="w-6 h-6 mx-auto mb-1 text-blue-500" /><p className="text-2xl font-bold">{stats?.totalCompanies || 0}</p><p className="text-xs text-muted-foreground">Companies</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Briefcase className="w-6 h-6 mx-auto mb-1 text-indigo-500" /><p className="text-2xl font-bold">{stats?.totalDrives || 0}</p><p className="text-xs text-muted-foreground">Drives</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-500" /><p className="text-2xl font-bold">{stats?.placed || 0}</p><p className="text-xs text-muted-foreground">Students Placed</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><IndianRupee className="w-6 h-6 mx-auto mb-1 text-amber-500" /><p className="text-2xl font-bold">₹{Number(stats?.highestPackage || 0).toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">Highest Package (LPA)</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="drives">Placement Drives</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="training">Training Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Registered Companies</CardTitle>
                <Dialog open={companyDialog} onOpenChange={setCompanyDialog}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Company</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Company</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Company Name *</Label><Input value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} /></div>
                        <div className="space-y-1"><Label>Industry *</Label>
                          <Select value={companyForm.industry} onValueChange={v => setCompanyForm({...companyForm, industry: v})}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>{["IT/Software", "Manufacturing", "Finance/Banking", "Healthcare", "Education", "Consulting", "E-Commerce", "Automobile", "Telecom", "Other"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Contact Person</Label><Input value={companyForm.contactPerson} onChange={e => setCompanyForm({...companyForm, contactPerson: e.target.value})} /></div>
                        <div className="space-y-1"><Label>Contact Email</Label><Input value={companyForm.contactEmail} onChange={e => setCompanyForm({...companyForm, contactEmail: e.target.value})} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Contact Phone</Label><Input value={companyForm.contactPhone} onChange={e => setCompanyForm({...companyForm, contactPhone: e.target.value})} /></div>
                        <div className="space-y-1"><Label>Website</Label><Input value={companyForm.website} onChange={e => setCompanyForm({...companyForm, website: e.target.value})} /></div>
                      </div>
                      <Button className="w-full" onClick={() => addCompany.mutate()} disabled={!companyForm.name || !companyForm.industry || addCompany.isPending}>{addCompany.isPending ? "Adding..." : "Add Company"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Company</TableHead><TableHead>Industry</TableHead><TableHead>Contact</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(companies as any[]).length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No companies registered</TableCell></TableRow> :
                  (companies as any[]).map((c: any) => (
                    <TableRow key={c.id}><TableCell className="font-medium">{c.name}</TableCell><TableCell><Badge variant="outline">{c.industry}</Badge></TableCell><TableCell className="text-sm">{c.contactPerson || "-"}</TableCell><TableCell className="text-sm">{c.contactEmail || "-"}</TableCell><TableCell><Badge variant={c.status === "Active" ? "default" : "secondary"}>{c.status}</Badge></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drives">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Placement Drives</CardTitle>
                <Dialog open={driveDialog} onOpenChange={setDriveDialog}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Schedule Drive</Button></DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Schedule Placement Drive</DialogTitle></DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                      <div className="space-y-1"><Label>Company *</Label>
                        <Select value={driveForm.companyId} onValueChange={v => setDriveForm({...driveForm, companyId: v})}>
                          <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                          <SelectContent>{(companies as any[]).map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Title *</Label><Input value={driveForm.title} onChange={e => setDriveForm({...driveForm, title: e.target.value})} /></div>
                        <div className="space-y-1"><Label>Drive Date *</Label><Input type="date" value={driveForm.driveDate} onChange={e => setDriveForm({...driveForm, driveDate: e.target.value})} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Package Min (LPA)</Label><Input type="number" value={driveForm.packageMin} onChange={e => setDriveForm({...driveForm, packageMin: e.target.value})} /></div>
                        <div className="space-y-1"><Label>Package Max (LPA)</Label><Input type="number" value={driveForm.packageMax} onChange={e => setDriveForm({...driveForm, packageMax: e.target.value})} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Roles Offered</Label><Input value={driveForm.rolesOffered} onChange={e => setDriveForm({...driveForm, rolesOffered: e.target.value})} placeholder="e.g., SDE, QA" /></div>
                        <div className="space-y-1"><Label>Drive Type</Label>
                          <Select value={driveForm.driveType} onValueChange={v => setDriveForm({...driveForm, driveType: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="On-Campus">On-Campus</SelectItem><SelectItem value="Off-Campus">Off-Campus</SelectItem><SelectItem value="Virtual">Virtual</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1"><Label>Eligibility</Label><Input value={driveForm.eligibilityCriteria} onChange={e => setDriveForm({...driveForm, eligibilityCriteria: e.target.value})} placeholder="e.g., Min 7.0 CGPA" /></div>
                      <div className="space-y-1"><Label>Description</Label><Textarea value={driveForm.description} onChange={e => setDriveForm({...driveForm, description: e.target.value})} rows={2} /></div>
                      <Button className="w-full" onClick={() => addDrive.mutate()} disabled={!driveForm.companyId || !driveForm.title || !driveForm.driveDate || addDrive.isPending}>{addDrive.isPending ? "Creating..." : "Create Drive"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Drive</TableHead><TableHead>Company</TableHead><TableHead>Date</TableHead><TableHead>Package</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(drives as any[]).length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No placement drives scheduled</TableCell></TableRow> :
                  (drives as any[]).map((d: any) => (
                    <TableRow key={d.id}>
                      <TableCell><div><p className="font-medium text-sm">{d.title}</p>{d.rolesOffered && <p className="text-xs text-muted-foreground">{d.rolesOffered}</p>}</div></TableCell>
                      <TableCell className="text-sm">{d.companyName}</TableCell>
                      <TableCell className="text-sm">{d.driveDate}</TableCell>
                      <TableCell className="text-sm">{d.packageMin && d.packageMax ? `₹${d.packageMin}-${d.packageMax} LPA` : d.packageMin ? `₹${d.packageMin} LPA` : "-"}</TableCell>
                      <TableCell><Badge variant="outline">{d.driveType}</Badge></TableCell>
                      <TableCell><Badge variant={d.status === "Upcoming" ? "default" : d.status === "Completed" ? "secondary" : "outline"}>{d.status}</Badge></TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={() => { setSelectedDriveId(String(d.id)); setApplyDialog(true); }}>Apply Student</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader><CardTitle className="text-base">Student Applications ({(applications as any[]).length})</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Roll No</TableHead><TableHead>Drive</TableHead><TableHead>Status</TableHead><TableHead>Package</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(applications as any[]).length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No applications yet</TableCell></TableRow> :
                  (applications as any[]).map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-sm">{a.studentName}</TableCell>
                      <TableCell className="text-sm">{a.rollNumber}</TableCell>
                      <TableCell className="text-sm">{a.driveTitle}</TableCell>
                      <TableCell><Badge variant={a.status === "Placed" ? "default" : a.status === "Rejected" ? "destructive" : "secondary"}>{a.status}</Badge></TableCell>
                      <TableCell className="text-sm">{a.packageOffered ? `₹${a.packageOffered} LPA` : "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {a.status === "Applied" && <Button size="sm" variant="outline" onClick={() => updateAppStatus.mutate({ id: a.id, status: "Shortlisted" })}>Shortlist</Button>}
                          {(a.status === "Shortlisted" || a.status === "Applied") && <Button size="sm" variant="default" onClick={() => { const pkg = prompt("Enter package offered (LPA):"); if (pkg) updateAppStatus.mutate({ id: a.id, status: "Placed", packageOffered: pkg }); }}>Place</Button>}
                          {a.status !== "Rejected" && a.status !== "Placed" && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateAppStatus.mutate({ id: a.id, status: "Rejected" })}>Reject</Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Training Programs</CardTitle>
                <Dialog open={trainingDialog} onOpenChange={setTrainingDialog}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Program</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create Training Program</DialogTitle></DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                      <div className="space-y-1"><Label>Program Title *</Label><Input value={trainingForm.title} onChange={e => setTrainingForm({...trainingForm, title: e.target.value})} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Trainer *</Label><Input value={trainingForm.trainer} onChange={e => setTrainingForm({...trainingForm, trainer: e.target.value})} /></div>
                        <div className="space-y-1"><Label>Trainer Org</Label><Input value={trainingForm.trainerOrg} onChange={e => setTrainingForm({...trainingForm, trainerOrg: e.target.value})} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Start Date *</Label><Input type="date" value={trainingForm.startDate} onChange={e => setTrainingForm({...trainingForm, startDate: e.target.value})} /></div>
                        <div className="space-y-1"><Label>End Date</Label><Input type="date" value={trainingForm.endDate} onChange={e => setTrainingForm({...trainingForm, endDate: e.target.value})} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Type</Label>
                          <Select value={trainingForm.type} onValueChange={v => setTrainingForm({...trainingForm, type: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Technical">Technical</SelectItem><SelectItem value="Soft Skills">Soft Skills</SelectItem><SelectItem value="Aptitude">Aptitude</SelectItem><SelectItem value="Communication">Communication</SelectItem><SelectItem value="Industry">Industry</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1"><Label>Mode</Label>
                          <Select value={trainingForm.mode} onValueChange={v => setTrainingForm({...trainingForm, mode: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Offline">Offline</SelectItem><SelectItem value="Online">Online</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1"><Label>Max Participants</Label><Input type="number" value={trainingForm.maxParticipants} onChange={e => setTrainingForm({...trainingForm, maxParticipants: e.target.value})} /></div>
                      <div className="space-y-1"><Label>Description</Label><Textarea value={trainingForm.description} onChange={e => setTrainingForm({...trainingForm, description: e.target.value})} rows={2} /></div>
                      <Button className="w-full" onClick={() => addTraining.mutate()} disabled={!trainingForm.title || !trainingForm.trainer || !trainingForm.startDate || addTraining.isPending}>{addTraining.isPending ? "Creating..." : "Create Program"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Program</TableHead><TableHead>Trainer</TableHead><TableHead>Dates</TableHead><TableHead>Type</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(trainings as any[]).length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No training programs</TableCell></TableRow> :
                  (trainings as any[]).map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell><div><p className="font-medium text-sm">{t.title}</p>{t.trainerOrg && <p className="text-xs text-muted-foreground">{t.trainerOrg}</p>}</div></TableCell>
                      <TableCell className="text-sm">{t.trainer}</TableCell>
                      <TableCell className="text-sm">{t.startDate}{t.endDate ? ` — ${t.endDate}` : ""}</TableCell>
                      <TableCell><Badge variant="outline">{t.type}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{t.mode}</Badge></TableCell>
                      <TableCell><Badge variant={t.status === "Ongoing" ? "default" : t.status === "Completed" ? "secondary" : "outline"}>{t.status}</Badge></TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={() => { setSelectedProgramId(String(t.id)); setEnrollDialog(true); }}>Enroll</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={applyDialog} onOpenChange={setApplyDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply Student to Drive</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <StudentSearchField />
            <Button className="w-full" onClick={() => applyStudent.mutate()} disabled={!selectedStudentId || applyStudent.isPending}>{applyStudent.isPending ? "Applying..." : "Submit Application"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={enrollDialog} onOpenChange={setEnrollDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enroll Student in Training</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <StudentSearchField />
            <Button className="w-full" onClick={() => enrollStudent.mutate()} disabled={!selectedStudentId || enrollStudent.isPending}>{enrollStudent.isPending ? "Enrolling..." : "Enroll Student"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
