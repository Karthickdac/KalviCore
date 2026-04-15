import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, LogIn, LogOut, Users, Clock, Shield, Car, Trash2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function VisitorsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [dialog, setDialog] = useState(false);
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    visitorName: "", phone: "", email: "", idProofType: "", idProofNumber: "",
    purpose: "", personToMeet: "", department: "", numberOfVisitors: "1",
    vehicleNumber: "", remarks: "",
  });

  const { data: stats } = useQuery({ queryKey: ["visitor-stats"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/visitors/stats`, { headers }); return r.json(); } });
  const { data: visitors = [] } = useQuery({
    queryKey: ["visitors", filter],
    queryFn: async () => {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const r = await fetch(`${API_BASE}/api/visitors${params}`, { headers });
      return r.json();
    },
  });

  const invalidateAll = () => { ["visitor-stats", "visitors"].forEach(k => qc.invalidateQueries({ queryKey: [k] })); };

  const checkIn = useMutation({
    mutationFn: async () => {
      const r = await fetch(`${API_BASE}/api/visitors`, { method: "POST", headers, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Failed"); return r.json();
    },
    onSuccess: (data) => {
      toast({ title: `Visitor checked in — Badge: ${data.visitorBadge}` });
      setDialog(false);
      setForm({ visitorName: "", phone: "", email: "", idProofType: "", idProofNumber: "", purpose: "", personToMeet: "", department: "", numberOfVisitors: "1", vehicleNumber: "", remarks: "" });
      invalidateAll();
    },
    onError: () => toast({ title: "Check-in failed", variant: "destructive" }),
  });

  const checkOut = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`${API_BASE}/api/visitors/${id}/checkout`, { method: "PATCH", headers });
      if (!r.ok) throw new Error("Failed"); return r.json();
    },
    onSuccess: () => { toast({ title: "Visitor checked out" }); invalidateAll(); },
  });

  const deleteVisitor = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`${API_BASE}/api/visitors/${id}`, { method: "DELETE", headers });
      if (!r.ok) throw new Error("Failed"); return r.json();
    },
    onSuccess: () => { toast({ title: "Record deleted" }); invalidateAll(); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visitor Management</h1>
          <p className="text-muted-foreground">Track visitor check-ins and check-outs at the institution gate.</p>
        </div>
        <Dialog open={dialog} onOpenChange={setDialog}>
          <DialogTrigger asChild><Button><UserPlus className="mr-2 h-4 w-4" />New Check-In</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Visitor Check-In</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Visitor Name *</Label><Input value={form.visitorName} onChange={e => setForm({...form, visitorName: e.target.value})} /></div>
                <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Purpose *</Label>
                  <Select value={form.purpose} onValueChange={v => setForm({...form, purpose: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{["Meeting", "Interview", "Admission Enquiry", "Fee Payment", "Document Collection", "Inspection", "Event", "Guest Lecture", "Maintenance", "Delivery", "Personal Visit", "Other"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Person to Meet *</Label><Input value={form.personToMeet} onChange={e => setForm({...form, personToMeet: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Department</Label><Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
                <div className="space-y-1"><Label>No. of Visitors</Label><Input type="number" min="1" value={form.numberOfVisitors} onChange={e => setForm({...form, numberOfVisitors: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>ID Proof Type</Label>
                  <Select value={form.idProofType} onValueChange={v => setForm({...form, idProofType: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{["Aadhar Card", "Driving License", "Voter ID", "Passport", "PAN Card", "Employee ID", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>ID Number</Label><Input value={form.idProofNumber} onChange={e => setForm({...form, idProofNumber: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Vehicle Number</Label><Input value={form.vehicleNumber} onChange={e => setForm({...form, vehicleNumber: e.target.value})} placeholder="e.g., TN 01 AB 1234" /></div>
                <div className="space-y-1"><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div className="space-y-1"><Label>Remarks</Label><Input value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} /></div>
              <Button className="w-full" onClick={() => checkIn.mutate()} disabled={!form.visitorName || !form.purpose || !form.personToMeet || checkIn.isPending}>
                {checkIn.isPending ? "Checking in..." : "Check In Visitor"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Users className="w-6 h-6 mx-auto mb-1 text-blue-500" /><p className="text-2xl font-bold">{stats?.total || 0}</p><p className="text-xs text-muted-foreground">Total Visitors</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><LogIn className="w-6 h-6 mx-auto mb-1 text-green-500" /><p className="text-2xl font-bold">{stats?.todayTotal || 0}</p><p className="text-xs text-muted-foreground">Today</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="w-6 h-6 mx-auto mb-1 text-amber-500" /><p className="text-2xl font-bold">{stats?.currentlyIn || 0}</p><p className="text-xs text-muted-foreground">Currently Inside</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><LogOut className="w-6 h-6 mx-auto mb-1 text-purple-500" /><p className="text-2xl font-bold">{stats?.checkedOut || 0}</p><p className="text-xs text-muted-foreground">Checked Out</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Visitor Log</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visitors</SelectItem>
                <SelectItem value="Checked In">Currently In</SelectItem>
                <SelectItem value="Checked Out">Checked Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor</TableHead><TableHead>Purpose</TableHead><TableHead>Meeting</TableHead><TableHead>Badge</TableHead>
                <TableHead>Check-In</TableHead><TableHead>Check-Out</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(visitors as any[]).length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No visitor records</TableCell></TableRow>
              ) : (visitors as any[]).map((v: any) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{v.visitorName}</p>
                      <p className="text-xs text-muted-foreground">{v.phone || "-"}{v.numberOfVisitors > 1 ? ` (+${v.numberOfVisitors - 1})` : ""}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{v.purpose}</Badge></TableCell>
                  <TableCell><div><p className="text-sm">{v.personToMeet}</p>{v.department && <p className="text-xs text-muted-foreground">{v.department}</p>}</div></TableCell>
                  <TableCell><Badge variant="secondary" className="font-mono text-xs">{v.visitorBadge}</Badge></TableCell>
                  <TableCell className="text-xs">{v.checkInTime ? new Date(v.checkInTime).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "-"}</TableCell>
                  <TableCell className="text-xs">{v.checkOutTime ? new Date(v.checkOutTime).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "-"}</TableCell>
                  <TableCell><Badge variant={v.status === "Checked In" ? "default" : "secondary"}>{v.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {v.status === "Checked In" && <Button size="sm" variant="outline" onClick={() => checkOut.mutate(v.id)}><LogOut className="w-3 h-3 mr-1" />Out</Button>}
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteVisitor.mutate(v.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
