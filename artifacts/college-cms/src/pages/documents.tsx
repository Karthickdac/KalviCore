import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { useListStudents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, CheckCircle, Search, FolderOpen, Shield, Trash2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const DOC_TYPES = ["10th Marksheet", "12th Marksheet", "Transfer Certificate", "Community Certificate", "Income Certificate", "Aadhar Card", "Passport Photo", "Migration Certificate", "Conduct Certificate", "Medical Certificate", "Other"];

export default function DocumentsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [studentFilter, setStudentFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formStudentId, setFormStudentId] = useState("");
  const [formDocType, setFormDocType] = useState("");
  const [formFileName, setFormFileName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSearch, setFormSearch] = useState("");

  const { data: students = [] } = useListStudents();

  const { data: stats } = useQuery({
    queryKey: ["doc-stats"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/api/documents/stats`, { headers }); return r.json(); },
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["documents", studentFilter],
    queryFn: async () => {
      const params = studentFilter ? `?studentId=${studentFilter}` : "";
      const r = await fetch(`${API_BASE}/api/documents${params}`, { headers });
      return r.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`${API_BASE}/api/documents`, {
        method: "POST", headers,
        body: JSON.stringify({ studentId: formStudentId, documentType: formDocType, fileName: formFileName, description: formDescription }),
      });
      if (!r.ok) throw new Error("Upload failed");
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Document recorded successfully" });
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["doc-stats"] });
      setDialogOpen(false); setFormStudentId(""); setFormDocType(""); setFormFileName(""); setFormDescription(""); setFormSearch("");
    },
    onError: () => toast({ title: "Failed to record document", variant: "destructive" }),
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`${API_BASE}/api/documents/${id}/verify`, { method: "PATCH", headers, body: JSON.stringify({}) });
      if (!r.ok) throw new Error("Verify failed");
      return r.json();
    },
    onSuccess: () => { toast({ title: "Document verified" }); qc.invalidateQueries({ queryKey: ["documents"] }); qc.invalidateQueries({ queryKey: ["doc-stats"] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`${API_BASE}/api/documents/${id}`, { method: "DELETE", headers });
      if (!r.ok) throw new Error("Delete failed");
      return r.json();
    },
    onSuccess: () => { toast({ title: "Document deleted" }); qc.invalidateQueries({ queryKey: ["documents"] }); qc.invalidateQueries({ queryKey: ["doc-stats"] }); },
  });

  const filteredFormStudents = (students as any[]).filter((s: any) => {
    if (!formSearch) return false;
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    return name.includes(formSearch.toLowerCase()) || s.rollNumber?.toLowerCase().includes(formSearch.toLowerCase());
  });

  const getStudentName = (studentId: number) => {
    const s = (students as any[]).find(s => s.id === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Vault</h1>
          <p className="text-muted-foreground">Manage student document uploads — marksheets, certificates, ID proofs.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Upload className="mr-2 h-4 w-4" />Add Document</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Document</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search student..." value={formSearch} onChange={e => setFormSearch(e.target.value)} className="pl-8" />
                </div>
                {formSearch && (
                  <div className="max-h-32 overflow-y-auto border rounded-md">
                    {filteredFormStudents.slice(0, 5).map((s: any) => (
                      <button key={s.id} className="w-full text-left px-3 py-1.5 hover:bg-accent text-sm" onClick={() => { setFormStudentId(String(s.id)); setFormSearch(""); }}>
                        {s.rollNumber} — {s.firstName} {s.lastName}
                      </button>
                    ))}
                  </div>
                )}
                {formStudentId && !formSearch && <Badge variant="secondary">{getStudentName(Number(formStudentId))}</Badge>}
              </div>
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={formDocType} onValueChange={setFormDocType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>File Name</Label>
                <Input value={formFileName} onChange={e => setFormFileName(e.target.value)} placeholder="e.g., marksheet_10th.pdf" />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Any notes..." />
              </div>
              <Button className="w-full" onClick={() => uploadMutation.mutate()} disabled={!formStudentId || !formDocType || !formFileName || uploadMutation.isPending}>
                {uploadMutation.isPending ? "Recording..." : "Record Document"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><FolderOpen className="w-6 h-6 mx-auto mb-1 text-blue-500" /><p className="text-2xl font-bold">{stats?.total || 0}</p><p className="text-xs text-muted-foreground">Total Documents</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-500" /><p className="text-2xl font-bold">{stats?.verified || 0}</p><p className="text-xs text-muted-foreground">Verified</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Upload className="w-6 h-6 mx-auto mb-1 text-amber-500" /><p className="text-2xl font-bold">{stats?.pending || 0}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><FileText className="w-6 h-6 mx-auto mb-1 text-purple-500" /><p className="text-2xl font-bold">{stats?.types ? Object.keys(stats.types).length : 0}</p><p className="text-xs text-muted-foreground">Document Types</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Documents</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filter by student..." value={search} onChange={e => {
                setSearch(e.target.value);
                const match = (students as any[]).find(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(e.target.value.toLowerCase()) || s.rollNumber?.toLowerCase().includes(e.target.value.toLowerCase()));
                setStudentFilter(match ? String(match.id) : "");
              }} className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Student</TableHead><TableHead>Document Type</TableHead><TableHead>File Name</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {(documents as any[]).length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No documents found</TableCell></TableRow>
              ) : (documents as any[]).map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium text-sm">{getStudentName(d.studentId)}</TableCell>
                  <TableCell><Badge variant="outline">{d.documentType}</Badge></TableCell>
                  <TableCell className="text-sm">{d.fileName}</TableCell>
                  <TableCell><Badge variant={d.status === "Verified" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(d.createdAt).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {d.status !== "Verified" && <Button size="sm" variant="outline" onClick={() => verifyMutation.mutate(d.id)}><CheckCircle className="w-3 h-3 mr-1" />Verify</Button>}
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(d.id)}><Trash2 className="w-3 h-3" /></Button>
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
