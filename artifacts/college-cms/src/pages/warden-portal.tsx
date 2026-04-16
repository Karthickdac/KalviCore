import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, LogOut, ArrowLeft, LayoutDashboard, BedDouble, Users,
  AlertTriangle, ChevronLeft, ChevronRight, Menu, Plus, Pencil, Trash2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

type Section = "dashboard" | "hostels" | "rooms" | "allocations" | "complaints";

const sidebarItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "hostels", label: "Hostels", icon: <Building2 className="w-4 h-4" /> },
  { id: "rooms", label: "Rooms", icon: <BedDouble className="w-4 h-4" /> },
  { id: "allocations", label: "Allocations", icon: <Users className="w-4 h-4" /> },
  { id: "complaints", label: "Complaints", icon: <AlertTriangle className="w-4 h-4" /> },
];

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export default function WardenPortalPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
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
      setStaff({ id: data.user.staffRecordId, staffId: data.user.staffId || data.user.username, name: data.user.fullName, email: data.user.email });
    } catch { setError("Connection failed"); }
    setLoading(false);
  };

  const { data: stats } = useQuery({
    queryKey: ["warden-stats"], queryFn: () => apiFetch(`/api/warden-portal/stats`), enabled: !!staff,
  });
  const { data: hostels = [] } = useQuery<any[]>({
    queryKey: ["warden-hostels"], queryFn: () => apiFetch(`/api/hostels`), enabled: !!staff,
  });
  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["warden-rooms"], queryFn: () => apiFetch(`/api/hostel-rooms`), enabled: !!staff,
  });
  const { data: allocations = [] } = useQuery<any[]>({
    queryKey: ["warden-allocations"], queryFn: () => apiFetch(`/api/warden-portal/allocations`), enabled: !!staff,
  });
  const { data: complaints = [] } = useQuery<any[]>({
    queryKey: ["warden-complaints"], queryFn: () => apiFetch(`/api/warden-portal/complaints`), enabled: !!staff,
  });

  if (!staff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Login
          </Link>
          <Card className="shadow-xl border-indigo-200/50">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Hostel Warden Portal</CardTitle>
              <CardDescription>Enter your username and password to access.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">{error}</div>}
                <div className="space-y-2"><Label>Username</Label><Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" required /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required /></div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>{loading ? "Verifying..." : "Access Portal"}</Button>
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
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-card border-r flex flex-col transition-all duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${sidebarCollapsed ? "w-[68px]" : "w-64"}`}>
        <div className={`flex items-center gap-3 p-4 border-b ${sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shrink-0"><Building2 className="w-5 h-5 text-white" /></div>
          {!sidebarCollapsed && <div className="min-w-0"><h2 className="font-bold text-sm truncate">Warden Portal</h2><p className="text-xs text-muted-foreground truncate">KalviCore</p></div>}
        </div>
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-b">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{staff.name?.[0]}</div>
              <div className="min-w-0"><p className="text-sm font-medium truncate">{staff.name}</p><p className="text-xs text-muted-foreground truncate">{staff.staffId}</p></div>
            </div>
          </div>
        )}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 rounded-lg text-sm transition-colors ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"} ${activeSection === item.id ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                title={sidebarCollapsed ? item.label : undefined}
              >{item.icon}{!sidebarCollapsed && <span>{item.label}</span>}</button>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-2 space-y-1">
          <button onClick={() => { setStaff(null); setUsername(""); setPassword(""); }} className={`w-full flex items-center gap-3 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}`}>
            <LogOut className="w-4 h-4" />{!sidebarCollapsed && <span>Exit Portal</span>}
          </button>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex w-full items-center gap-3 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors justify-center px-2 py-2">
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b px-4 lg:px-6 h-14 flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-1.5 rounded-md hover:bg-muted"><Menu className="w-5 h-5" /></button>
          <h1 className="font-semibold text-lg">{sidebarItems.find(i => i.id === activeSection)?.label || "Dashboard"}</h1>
        </header>
        <div className="p-4 lg:p-6 max-w-6xl">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card><CardContent className="p-4 text-center"><Building2 className="w-6 h-6 mx-auto mb-1 text-indigo-500" /><p className="font-bold text-lg">{stats?.totalHostels || 0}</p><p className="text-xs text-muted-foreground">Hostels</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><BedDouble className="w-6 h-6 mx-auto mb-1 text-blue-500" /><p className="font-bold text-lg">{stats?.totalRooms || 0}</p><p className="text-xs text-muted-foreground">Rooms</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><Users className="w-6 h-6 mx-auto mb-1 text-green-500" /><p className="font-bold text-lg">{stats?.occupiedBeds || 0}</p><p className="text-xs text-muted-foreground">Occupied Beds</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><BedDouble className="w-6 h-6 mx-auto mb-1 text-amber-500" /><p className="font-bold text-lg">{stats?.vacantBeds || 0}</p><p className="text-xs text-muted-foreground">Vacant Beds</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><AlertTriangle className="w-6 h-6 mx-auto mb-1 text-red-500" /><p className="font-bold text-lg">{stats?.pendingComplaints || 0}</p><p className="text-xs text-muted-foreground">Pending Complaints</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Recent Complaints</CardTitle></CardHeader>
                <CardContent>
                  {complaints.length === 0 ? <p className="text-center py-6 text-muted-foreground text-sm">No complaints.</p> : (
                    <Table>
                      <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Subject</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {complaints.slice(0, 5).map((c: any) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-sm">{c.studentName}<span className="text-xs text-muted-foreground ml-1">({c.rollNumber})</span></TableCell>
                            <TableCell className="text-sm font-medium">{c.subject || c.complaintType || "-"}</TableCell>
                            <TableCell className="text-sm">{c.complaintDate ? new Date(c.complaintDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                            <TableCell><Badge variant={c.status === "Resolved" ? "outline" : c.status === "Pending" ? "destructive" : "default"}>{c.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "hostels" && <HostelsSection hostels={hostels} />}
          {activeSection === "rooms" && <RoomsSection rooms={rooms} hostels={hostels} />}
          {activeSection === "allocations" && <AllocationsSection allocations={allocations} hostels={hostels} rooms={rooms} />}
          {activeSection === "complaints" && <ComplaintsSection complaints={complaints} />}
        </div>
      </main>
    </div>
  );
}

function DeleteButton({ onConfirm, title }: { onConfirm: () => void; title: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {title}?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function HostelsSection({ hostels }: { hostels: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["warden-hostels"] });
    qc.invalidateQueries({ queryKey: ["warden-stats"] });
  };

  const save = useMutation({
    mutationFn: () => {
      const body = {
        name: form.name,
        type: form.type || "Boys",
        totalBlocks: form.totalBlocks ? Number(form.totalBlocks) : 1,
        totalRooms: form.totalRooms ? Number(form.totalRooms) : 0,
        wardenName: form.wardenName || null,
        wardenPhone: form.wardenPhone || null,
        status: form.status || "Active",
      };
      return editing
        ? apiFetch(`/api/hostels/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch(`/api/hostels`, { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: () => { toast({ title: editing ? "Hostel updated" : "Hostel added" }); invalidate(); setOpen(false); setEditing(null); setForm({}); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/hostels/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Hostel deleted" }); invalidate(); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const openAdd = () => { setEditing(null); setForm({ type: "Boys", status: "Active" }); setOpen(true); };
  const openEdit = (h: any) => { setEditing(h); setForm({ ...h }); setOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Manage Hostels</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2" />Add Hostel</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Hostel" : "Add Hostel"}</DialogTitle><DialogDescription>Configure a hostel.</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2"><Label>Hostel Name *</Label><Input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Type</Label>
                <Select value={form.type || "Boys"} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Boys">Boys</SelectItem><SelectItem value="Girls">Girls</SelectItem><SelectItem value="Co-ed">Co-ed</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={form.status || "Active"} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Total Blocks</Label><Input type="number" value={form.totalBlocks ?? ""} onChange={e => setForm({ ...form, totalBlocks: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Total Rooms</Label><Input type="number" value={form.totalRooms ?? ""} onChange={e => setForm({ ...form, totalRooms: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Warden Name</Label><Input value={form.wardenName || ""} onChange={e => setForm({ ...form, wardenName: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Warden Phone</Label><Input value={form.wardenPhone || ""} onChange={e => setForm({ ...form, wardenPhone: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name} className="bg-indigo-600 hover:bg-indigo-700">{save.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {hostels.length === 0 ? <p className="text-center py-8 text-muted-foreground">No hostels found.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Blocks</TableHead><TableHead>Rooms</TableHead><TableHead>Warden</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {hostels.map((h: any) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium text-sm">{h.name}</TableCell>
                  <TableCell><Badge variant="outline">{h.type}</Badge></TableCell>
                  <TableCell className="text-sm">{h.totalBlocks}</TableCell>
                  <TableCell className="text-sm">{h.totalRooms}</TableCell>
                  <TableCell className="text-sm">{h.wardenName || "-"}</TableCell>
                  <TableCell className="text-sm">{h.wardenPhone || "-"}</TableCell>
                  <TableCell><Badge variant={h.status === "Active" ? "default" : "outline"}>{h.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(h)}><Pencil className="w-4 h-4" /></Button>
                    <DeleteButton title="hostel" onConfirm={() => del.mutate(h.id)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function RoomsSection({ rooms, hostels }: { rooms: any[]; hostels: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["warden-rooms"] });
    qc.invalidateQueries({ queryKey: ["warden-stats"] });
  };

  const save = useMutation({
    mutationFn: () => {
      const body = {
        roomNumber: form.roomNumber,
        hostelId: Number(form.hostelId),
        floor: form.floor || null,
        roomType: form.roomType || "Standard",
        capacity: form.capacity ? Number(form.capacity) : 1,
        status: form.status || "Available",
      };
      return editing
        ? apiFetch(`/api/hostel-rooms/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch(`/api/hostel-rooms`, { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: () => { toast({ title: editing ? "Room updated" : "Room added" }); invalidate(); setOpen(false); setEditing(null); setForm({}); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/hostel-rooms/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Room deleted" }); invalidate(); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const openAdd = () => { setEditing(null); setForm({ roomType: "Standard", status: "Available", capacity: 1 }); setOpen(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ ...r }); setOpen(true); };
  const hostelName = (id: number) => hostels.find(h => h.id === id)?.name || "-";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Manage Rooms</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2" />Add Room</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Room" : "Add Room"}</DialogTitle><DialogDescription>Configure a hostel room.</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Room Number *</Label><Input value={form.roomNumber || ""} onChange={e => setForm({ ...form, roomNumber: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Floor</Label><Input value={form.floor || ""} onChange={e => setForm({ ...form, floor: e.target.value })} placeholder="e.g., 1, G" /></div>
              <div className="space-y-1.5 col-span-2"><Label>Hostel *</Label>
                <Select value={form.hostelId ? String(form.hostelId) : ""} onValueChange={v => setForm({ ...form, hostelId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select hostel" /></SelectTrigger>
                  <SelectContent>{hostels.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Room Type</Label>
                <Select value={form.roomType || "Standard"} onValueChange={v => setForm({ ...form, roomType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Single">Single</SelectItem><SelectItem value="Double">Double</SelectItem><SelectItem value="Triple">Triple</SelectItem><SelectItem value="AC">AC</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Capacity *</Label><Input type="number" value={form.capacity ?? ""} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
              <div className="space-y-1.5 col-span-2"><Label>Status</Label>
                <Select value={form.status || "Available"} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Available">Available</SelectItem><SelectItem value="Occupied">Occupied</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.roomNumber || !form.hostelId} className="bg-indigo-600 hover:bg-indigo-700">{save.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {rooms.length === 0 ? <p className="text-center py-8 text-muted-foreground">No rooms found.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Room No.</TableHead><TableHead>Hostel</TableHead><TableHead>Floor</TableHead><TableHead>Type</TableHead><TableHead>Capacity</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {rooms.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-sm">{r.roomNumber}</TableCell>
                  <TableCell className="text-sm">{r.hostelName || hostelName(r.hostelId)}</TableCell>
                  <TableCell className="text-sm">{r.floor || "-"}</TableCell>
                  <TableCell><Badge variant="outline">{r.roomType || "Standard"}</Badge></TableCell>
                  <TableCell className="text-sm">{r.capacity}</TableCell>
                  <TableCell><Badge variant={r.status === "Available" ? "default" : "outline"}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                    <DeleteButton title="room" onConfirm={() => del.mutate(r.id)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AllocationsSection({ allocations, hostels, rooms }: { allocations: any[]; hostels: any[]; rooms: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["all-students-warden"], queryFn: () => apiFetch(`/api/portal/students`),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["warden-allocations"] });
    qc.invalidateQueries({ queryKey: ["warden-stats"] });
  };

  const save = useMutation({
    mutationFn: () => {
      const body = {
        studentId: Number(form.studentId),
        hostelId: Number(form.hostelId),
        roomId: Number(form.roomId),
        status: form.status || "Active",
        allocationDate: form.allocationDate || new Date().toISOString().slice(0, 10),
      };
      return editing
        ? apiFetch(`/api/hostel-allocations/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch(`/api/hostel-allocations`, { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: () => { toast({ title: editing ? "Allocation updated" : "Allocation created" }); invalidate(); setOpen(false); setEditing(null); setForm({}); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const openAdd = () => { setEditing(null); setForm({ status: "Active" }); setOpen(true); };
  const openEdit = (a: any) => { setEditing(a); setForm({ ...a }); setOpen(true); };
  const studentLabel = (s: any) => `${s.firstName || ""} ${s.lastName || ""} (${s.rollNumber || s.id})`.trim();
  const filteredRooms = form.hostelId ? rooms.filter(r => r.hostelId === Number(form.hostelId)) : rooms;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Manage Allocations</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2" />Add Allocation</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Allocation" : "Add Allocation"}</DialogTitle><DialogDescription>Allocate a student to a hostel room.</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Student *</Label>
                <Select value={form.studentId ? String(form.studentId) : ""} onValueChange={v => setForm({ ...form, studentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent className="max-h-72">{students.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{studentLabel(s)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Hostel *</Label>
                <Select value={form.hostelId ? String(form.hostelId) : ""} onValueChange={v => setForm({ ...form, hostelId: v, roomId: undefined })}>
                  <SelectTrigger><SelectValue placeholder="Select hostel" /></SelectTrigger>
                  <SelectContent>{hostels.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Room *</Label>
                <Select value={form.roomId ? String(form.roomId) : ""} onValueChange={v => setForm({ ...form, roomId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                  <SelectContent className="max-h-72">{filteredRooms.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.roomNumber} ({r.roomType})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={form.status || "Active"} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Vacated">Vacated</SelectItem><SelectItem value="Transferred">Transferred</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.studentId || !form.hostelId || !form.roomId} className="bg-indigo-600 hover:bg-indigo-700">{save.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {allocations.length === 0 ? <p className="text-center py-8 text-muted-foreground">No allocations found.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Roll No.</TableHead><TableHead>Hostel</TableHead><TableHead>Room</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {allocations.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-sm">{a.studentName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.rollNumber}</TableCell>
                  <TableCell className="text-sm">{a.hostelName}</TableCell>
                  <TableCell className="text-sm">{a.roomNumber}</TableCell>
                  <TableCell><Badge variant={a.status === "Active" ? "default" : "outline"}>{a.status}</Badge></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ComplaintsSection({ complaints }: { complaints: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<any>(null);
  const [status, setStatus] = useState("Pending");
  const [resolution, setResolution] = useState("");

  const update = useMutation({
    mutationFn: () => apiFetch(`/api/hostel-complaints/${editing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, resolution: resolution || null, resolvedAt: status === "Resolved" ? new Date().toISOString() : null }),
    }),
    onSuccess: () => {
      toast({ title: "Complaint updated" });
      qc.invalidateQueries({ queryKey: ["warden-complaints"] });
      qc.invalidateQueries({ queryKey: ["warden-stats"] });
      setEditing(null);
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="text-base">Manage Complaints</CardTitle></CardHeader>
        <CardContent className="p-0">
          {complaints.length === 0 ? <p className="text-center py-8 text-muted-foreground">No complaints found.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Roll No.</TableHead><TableHead>Subject</TableHead><TableHead>Description</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {complaints.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-sm">{c.studentName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.rollNumber}</TableCell>
                    <TableCell className="text-sm">{c.subject || c.complaintType || "-"}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{c.description || "-"}</TableCell>
                    <TableCell className="text-sm">{c.complaintDate ? new Date(c.complaintDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                    <TableCell><Badge variant={c.status === "Resolved" ? "outline" : c.status === "Pending" ? "destructive" : "default"}>{c.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(c); setStatus(c.status || "Pending"); setResolution(c.resolution || ""); }}><Pencil className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Complaint</DialogTitle><DialogDescription>{editing?.subject}</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Resolved">Resolved</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Resolution Notes</Label><Textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => update.mutate()} disabled={update.isPending} className="bg-indigo-600 hover:bg-indigo-700">{update.isPending ? "Saving..." : "Update"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
