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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Bus, LogOut, ArrowLeft, LayoutDashboard, Route, MapPin, Users,
  ChevronLeft, ChevronRight, Menu, Plus, Pencil, Trash2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

type Section = "dashboard" | "routes" | "vehicles" | "stops" | "allocations";

const sidebarItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "routes", label: "Routes", icon: <Route className="w-4 h-4" /> },
  { id: "vehicles", label: "Vehicles", icon: <Bus className="w-4 h-4" /> },
  { id: "stops", label: "Stops", icon: <MapPin className="w-4 h-4" /> },
  { id: "allocations", label: "Allocations", icon: <Users className="w-4 h-4" /> },
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

export default function TransportPortalPage() {
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
      setStaff({ id: data.user.staffRecordId, staffId: data.user.staffId || data.user.username, name: data.user.fullName, email: data.user.email, department: data.user.department, departmentId: data.user.departmentId });
    } catch { setError("Connection failed"); }
    setLoading(false);
  };

  const handleLogout = () => {
    setStaff(null);
    setUsername("");
    setPassword("");
  };

  const { data: stats } = useQuery({
    queryKey: ["transport-stats"], queryFn: () => apiFetch(`/api/transport-portal/stats`), enabled: !!staff,
  });
  const { data: routes = [] } = useQuery<any[]>({
    queryKey: ["transport-routes-portal"], queryFn: () => apiFetch(`/api/transport-routes`), enabled: !!staff,
  });
  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["transport-vehicles-portal"], queryFn: () => apiFetch(`/api/transport-vehicles`), enabled: !!staff,
  });
  const { data: stops = [] } = useQuery<any[]>({
    queryKey: ["transport-stops-portal"], queryFn: () => apiFetch(`/api/transport-stops`), enabled: !!staff,
  });
  const { data: allocations = [] } = useQuery<any[]>({
    queryKey: ["transport-allocations-portal"], queryFn: () => apiFetch(`/api/transport-portal/allocations`), enabled: !!staff,
  });

  if (!staff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Login
          </Link>
          <Card className="shadow-xl border-cyan-200/50">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                <Bus className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Transport Manager Portal</CardTitle>
              <CardDescription>Enter your username and password to access.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">{error}</div>}
                <div className="space-y-2"><Label>Username</Label><Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" required /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required /></div>
                <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={loading}>{loading ? "Verifying..." : "Access Portal"}</Button>
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
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center shrink-0"><Bus className="w-5 h-5 text-white" /></div>
          {!sidebarCollapsed && <div className="min-w-0"><h2 className="font-bold text-sm truncate">Transport Portal</h2><p className="text-xs text-muted-foreground truncate">KalviCore</p></div>}
        </div>
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-b">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{staff.name?.[0]}</div>
              <div className="min-w-0"><p className="text-sm font-medium truncate">{staff.name}</p><p className="text-xs text-muted-foreground truncate">{staff.staffId}</p></div>
            </div>
          </div>
        )}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 rounded-lg text-sm transition-colors ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"} ${activeSection === item.id ? "bg-cyan-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                title={sidebarCollapsed ? item.label : undefined}
              >{item.icon}{!sidebarCollapsed && <span>{item.label}</span>}</button>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-2 space-y-1">
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}`}>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card><CardContent className="p-4 text-center"><Route className="w-6 h-6 mx-auto mb-1 text-cyan-500" /><p className="font-bold text-lg">{stats?.totalRoutes || 0}</p><p className="text-xs text-muted-foreground">Total Routes</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><Route className="w-6 h-6 mx-auto mb-1 text-green-500" /><p className="font-bold text-lg">{stats?.activeRoutes || 0}</p><p className="text-xs text-muted-foreground">Active Routes</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><Bus className="w-6 h-6 mx-auto mb-1 text-blue-500" /><p className="font-bold text-lg">{stats?.totalVehicles || 0}</p><p className="text-xs text-muted-foreground">Total Vehicles</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><Bus className="w-6 h-6 mx-auto mb-1 text-emerald-500" /><p className="font-bold text-lg">{stats?.activeVehicles || 0}</p><p className="text-xs text-muted-foreground">Active Vehicles</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><MapPin className="w-6 h-6 mx-auto mb-1 text-amber-500" /><p className="font-bold text-lg">{stats?.totalStops || 0}</p><p className="text-xs text-muted-foreground">Total Stops</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><Users className="w-6 h-6 mx-auto mb-1 text-violet-500" /><p className="font-bold text-lg">{stats?.totalAllocations || 0}</p><p className="text-xs text-muted-foreground">Allocations</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Route Overview</CardTitle></CardHeader>
                <CardContent>
                  {routes.length === 0 ? <p className="text-center py-6 text-muted-foreground text-sm">No routes configured.</p> : (
                    <Table>
                      <TableHeader><TableRow><TableHead>Route</TableHead><TableHead>Number</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Distance</TableHead><TableHead>Fare</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {routes.slice(0, 5).map((r: any) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium text-sm">{r.routeName}</TableCell>
                            <TableCell className="text-sm">{r.routeNumber}</TableCell>
                            <TableCell className="text-sm">{r.startPoint}</TableCell>
                            <TableCell className="text-sm">{r.endPoint}</TableCell>
                            <TableCell className="text-sm">{r.distance || "-"}</TableCell>
                            <TableCell className="text-sm">{r.fare ? `₹${r.fare}` : "-"}</TableCell>
                            <TableCell><Badge variant={r.status === "Active" ? "default" : "outline"}>{r.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "routes" && <RoutesSection routes={routes} />}
          {activeSection === "vehicles" && <VehiclesSection vehicles={vehicles} routes={routes} />}
          {activeSection === "stops" && <StopsSection stops={stops} routes={routes} />}
          {activeSection === "allocations" && <AllocationsSection allocations={allocations} routes={routes} />}
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

function RoutesSection({ routes }: { routes: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["transport-routes-portal"] });
    qc.invalidateQueries({ queryKey: ["transport-stats"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const body = {
        routeName: form.routeName,
        routeNumber: form.routeNumber,
        startPoint: form.startPoint,
        endPoint: form.endPoint,
        distance: form.distance ? Number(form.distance) : null,
        estimatedTime: form.estimatedTime || null,
        fare: form.fare ? Number(form.fare) : null,
        status: form.status || "Active",
      };
      return editing
        ? apiFetch(`/api/transport-routes/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch(`/api/transport-routes`, { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: () => { toast({ title: editing ? "Route updated" : "Route added" }); invalidate(); setOpen(false); setEditing(null); setForm({}); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/transport-routes/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Route deleted" }); invalidate(); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const openAdd = () => { setEditing(null); setForm({ status: "Active" }); setOpen(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ ...r }); setOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Manage Routes</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openAdd} className="bg-cyan-600 hover:bg-cyan-700"><Plus className="w-4 h-4 mr-2" />Add Route</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Route" : "Add Route"}</DialogTitle><DialogDescription>Configure a transport route.</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Route Name *</Label><Input value={form.routeName || ""} onChange={e => setForm({ ...form, routeName: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Route Number *</Label><Input value={form.routeNumber || ""} onChange={e => setForm({ ...form, routeNumber: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Start Point *</Label><Input value={form.startPoint || ""} onChange={e => setForm({ ...form, startPoint: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>End Point *</Label><Input value={form.endPoint || ""} onChange={e => setForm({ ...form, endPoint: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Distance (km)</Label><Input type="number" value={form.distance ?? ""} onChange={e => setForm({ ...form, distance: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Est. Time</Label><Input value={form.estimatedTime || ""} onChange={e => setForm({ ...form, estimatedTime: e.target.value })} placeholder="e.g., 45 min" /></div>
              <div className="space-y-1.5"><Label>Fare (₹)</Label><Input type="number" value={form.fare ?? ""} onChange={e => setForm({ ...form, fare: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={form.status || "Active"} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.routeName || !form.routeNumber || !form.startPoint || !form.endPoint} className="bg-cyan-600 hover:bg-cyan-700">{save.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {routes.length === 0 ? <p className="text-center py-8 text-muted-foreground">No routes found.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Route Name</TableHead><TableHead>Number</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Distance</TableHead><TableHead>Est. Time</TableHead><TableHead>Fare</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {routes.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-sm">{r.routeName}</TableCell>
                  <TableCell className="text-sm">{r.routeNumber}</TableCell>
                  <TableCell className="text-sm">{r.startPoint}</TableCell>
                  <TableCell className="text-sm">{r.endPoint}</TableCell>
                  <TableCell className="text-sm">{r.distance || "-"}</TableCell>
                  <TableCell className="text-sm">{r.estimatedTime || "-"}</TableCell>
                  <TableCell className="text-sm">{r.fare ? `₹${r.fare}` : "-"}</TableCell>
                  <TableCell><Badge variant={r.status === "Active" ? "default" : "outline"}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                    <DeleteButton title="route" onConfirm={() => del.mutate(r.id)} />
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

function VehiclesSection({ vehicles, routes }: { vehicles: any[]; routes: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["transport-vehicles-portal"] });
    qc.invalidateQueries({ queryKey: ["transport-stats"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const body = {
        vehicleNumber: form.vehicleNumber,
        vehicleType: form.vehicleType || "Bus",
        routeId: form.routeId ? Number(form.routeId) : null,
        driverName: form.driverName || null,
        driverPhone: form.driverPhone || null,
        capacity: form.capacity ? Number(form.capacity) : null,
        status: form.status || "Active",
      };
      return editing
        ? apiFetch(`/api/transport-vehicles/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch(`/api/transport-vehicles`, { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: () => { toast({ title: editing ? "Vehicle updated" : "Vehicle added" }); invalidate(); setOpen(false); setEditing(null); setForm({}); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/transport-vehicles/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Vehicle deleted" }); invalidate(); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const openAdd = () => { setEditing(null); setForm({ vehicleType: "Bus", status: "Active" }); setOpen(true); };
  const openEdit = (v: any) => { setEditing(v); setForm({ ...v }); setOpen(true); };
  const routeName = (id: number) => routes.find(r => r.id === id)?.routeName || "-";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Manage Vehicles</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openAdd} className="bg-cyan-600 hover:bg-cyan-700"><Plus className="w-4 h-4 mr-2" />Add Vehicle</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle><DialogDescription>Configure a transport vehicle.</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Vehicle Number *</Label><Input value={form.vehicleNumber || ""} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Type</Label>
                <Select value={form.vehicleType || "Bus"} onValueChange={v => setForm({ ...form, vehicleType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Bus">Bus</SelectItem><SelectItem value="Mini Bus">Mini Bus</SelectItem><SelectItem value="Van">Van</SelectItem><SelectItem value="Car">Car</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2"><Label>Route</Label>
                <Select value={form.routeId ? String(form.routeId) : ""} onValueChange={v => setForm({ ...form, routeId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                  <SelectContent>{routes.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.routeName} ({r.routeNumber})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Driver Name</Label><Input value={form.driverName || ""} onChange={e => setForm({ ...form, driverName: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Driver Phone</Label><Input value={form.driverPhone || ""} onChange={e => setForm({ ...form, driverPhone: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Capacity</Label><Input type="number" value={form.capacity ?? ""} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={form.status || "Active"} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.vehicleNumber} className="bg-cyan-600 hover:bg-cyan-700">{save.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {vehicles.length === 0 ? <p className="text-center py-8 text-muted-foreground">No vehicles found.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Vehicle No.</TableHead><TableHead>Type</TableHead><TableHead>Route</TableHead><TableHead>Driver</TableHead><TableHead>Driver Phone</TableHead><TableHead>Capacity</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {vehicles.map((v: any) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium text-sm">{v.vehicleNumber}</TableCell>
                  <TableCell><Badge variant="outline">{v.vehicleType || "Bus"}</Badge></TableCell>
                  <TableCell className="text-sm">{v.routeName || routeName(v.routeId)}</TableCell>
                  <TableCell className="text-sm">{v.driverName || "-"}</TableCell>
                  <TableCell className="text-sm">{v.driverPhone || "-"}</TableCell>
                  <TableCell className="text-sm">{v.capacity || "-"}</TableCell>
                  <TableCell><Badge variant={v.status === "Active" ? "default" : "outline"}>{v.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}><Pencil className="w-4 h-4" /></Button>
                    <DeleteButton title="vehicle" onConfirm={() => del.mutate(v.id)} />
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

function StopsSection({ stops, routes }: { stops: any[]; routes: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["transport-stops-portal"] });
    qc.invalidateQueries({ queryKey: ["transport-stats"] });
  };

  const save = useMutation({
    mutationFn: () => apiFetch(`/api/transport-stops`, {
      method: "POST",
      body: JSON.stringify({
        stopName: form.stopName,
        routeId: Number(form.routeId),
        stopOrder: Number(form.stopOrder),
        pickupTime: form.pickupTime || null,
        dropTime: form.dropTime || null,
      }),
    }),
    onSuccess: () => { toast({ title: "Stop added" }); invalidate(); setOpen(false); setForm({}); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/transport-stops/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Stop deleted" }); invalidate(); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const routeName = (id: number) => routes.find(r => r.id === id)?.routeName || "-";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Manage Stops</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={() => { setForm({}); setOpen(true); }} className="bg-cyan-600 hover:bg-cyan-700"><Plus className="w-4 h-4 mr-2" />Add Stop</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Stop</DialogTitle><DialogDescription>Add a stop to a route.</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2"><Label>Stop Name *</Label><Input value={form.stopName || ""} onChange={e => setForm({ ...form, stopName: e.target.value })} /></div>
              <div className="space-y-1.5 col-span-2"><Label>Route *</Label>
                <Select value={form.routeId ? String(form.routeId) : ""} onValueChange={v => setForm({ ...form, routeId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                  <SelectContent>{routes.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.routeName} ({r.routeNumber})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Stop Order *</Label><Input type="number" value={form.stopOrder ?? ""} onChange={e => setForm({ ...form, stopOrder: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Pickup Time</Label><Input value={form.pickupTime || ""} onChange={e => setForm({ ...form, pickupTime: e.target.value })} placeholder="e.g., 07:30 AM" /></div>
              <div className="space-y-1.5 col-span-2"><Label>Drop Time</Label><Input value={form.dropTime || ""} onChange={e => setForm({ ...form, dropTime: e.target.value })} placeholder="e.g., 04:30 PM" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.stopName || !form.routeId || !form.stopOrder} className="bg-cyan-600 hover:bg-cyan-700">{save.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {stops.length === 0 ? <p className="text-center py-8 text-muted-foreground">No stops found.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Stop Name</TableHead><TableHead>Route</TableHead><TableHead>Order</TableHead><TableHead>Pickup Time</TableHead><TableHead>Drop Time</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {stops.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-sm">{s.stopName}</TableCell>
                  <TableCell className="text-sm">{s.routeName || routeName(s.routeId)}</TableCell>
                  <TableCell className="text-sm">{s.stopOrder}</TableCell>
                  <TableCell className="text-sm">{s.pickupTime || "-"}</TableCell>
                  <TableCell className="text-sm">{s.dropTime || "-"}</TableCell>
                  <TableCell className="text-right"><DeleteButton title="stop" onConfirm={() => del.mutate(s.id)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AllocationsSection({ allocations, routes }: { allocations: any[]; routes: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["all-students-transport"],
    queryFn: () => apiFetch(`/api/students`),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["transport-allocations-portal"] });
    qc.invalidateQueries({ queryKey: ["transport-stats"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const body = {
        studentId: Number(form.studentId),
        routeId: Number(form.routeId),
        pickupPoint: form.pickupPoint || null,
        status: form.status || "Active",
      };
      return editing
        ? apiFetch(`/api/transport-allocations/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch(`/api/transport-allocations`, { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: () => { toast({ title: editing ? "Allocation updated" : "Allocation created" }); invalidate(); setOpen(false); setEditing(null); setForm({}); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const openAdd = () => { setEditing(null); setForm({ status: "Active" }); setOpen(true); };
  const openEdit = (a: any) => { setEditing(a); setForm({ ...a }); setOpen(true); };
  const routeName = (id: number) => routes.find(r => r.id === id)?.routeName || "-";
  const studentLabel = (s: any) => `${s.firstName || ""} ${s.lastName || ""} (${s.rollNumber || s.id})`.trim();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Manage Allocations</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openAdd} className="bg-cyan-600 hover:bg-cyan-700"><Plus className="w-4 h-4 mr-2" />Add Allocation</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Allocation" : "Add Allocation"}</DialogTitle><DialogDescription>Allocate a student to a transport route.</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Student *</Label>
                <Select value={form.studentId ? String(form.studentId) : ""} onValueChange={v => setForm({ ...form, studentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent className="max-h-72">{students.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{studentLabel(s)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Route *</Label>
                <Select value={form.routeId ? String(form.routeId) : ""} onValueChange={v => setForm({ ...form, routeId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                  <SelectContent>{routes.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.routeName} ({r.routeNumber})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Pickup Point</Label><Input value={form.pickupPoint || ""} onChange={e => setForm({ ...form, pickupPoint: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={form.status || "Active"} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.studentId || !form.routeId} className="bg-cyan-600 hover:bg-cyan-700">{save.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {allocations.length === 0 ? <p className="text-center py-8 text-muted-foreground">No allocations found.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Roll No.</TableHead><TableHead>Route</TableHead><TableHead>Pickup Point</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {allocations.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-sm">{a.studentName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.rollNumber}</TableCell>
                  <TableCell className="text-sm">{a.routeName || routeName(a.routeId)}</TableCell>
                  <TableCell className="text-sm">{a.pickupPoint || "-"}</TableCell>
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
