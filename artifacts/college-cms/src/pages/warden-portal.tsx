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
import {
  Building2, LogOut, ArrowLeft, LayoutDashboard, BedDouble, Users,
  AlertTriangle, ChevronLeft, ChevronRight, Menu
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
      setStaff({ id: data.user.staffRecordId, staffId: data.user.staffId || data.user.username, name: data.user.fullName, email: data.user.email, department: data.user.department, departmentId: data.user.departmentId });
    } catch { setError("Connection failed"); }
    setLoading(false);
  };

  const { data: stats } = useQuery({
    queryKey: ["warden-stats"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/warden-portal/stats`); return r.json(); }, enabled: !!staff,
  });
  const { data: hostels = [] } = useQuery({
    queryKey: ["warden-hostels"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/warden-portal/hostels`); return r.json(); }, enabled: !!staff,
  });
  const { data: rooms = [] } = useQuery({
    queryKey: ["warden-rooms"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/warden-portal/rooms`); return r.json(); }, enabled: !!staff,
  });
  const { data: allocations = [] } = useQuery({
    queryKey: ["warden-allocations"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/warden-portal/allocations`); return r.json(); }, enabled: !!staff,
  });
  const { data: complaints = [] } = useQuery({
    queryKey: ["warden-complaints"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/warden-portal/complaints`); return r.json(); }, enabled: !!staff,
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
          <button onClick={() => { setStaff(null); setStaffId(""); setPhone(""); }} className={`w-full flex items-center gap-3 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}`}>
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
                        {(complaints as any[]).slice(0, 5).map((c: any) => (
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

          {activeSection === "hostels" && (
            <Card>
              <CardContent className="p-0">
                {hostels.length === 0 ? <p className="text-center py-8 text-muted-foreground">No hostels found.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Blocks</TableHead><TableHead>Rooms</TableHead><TableHead>Warden</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {(hostels as any[]).map((h: any) => (
                        <TableRow key={h.id}>
                          <TableCell className="font-medium text-sm">{h.name}</TableCell>
                          <TableCell><Badge variant="outline">{h.type}</Badge></TableCell>
                          <TableCell className="text-sm">{h.totalBlocks}</TableCell>
                          <TableCell className="text-sm">{h.totalRooms}</TableCell>
                          <TableCell className="text-sm">{h.wardenName || "-"}</TableCell>
                          <TableCell className="text-sm">{h.wardenPhone || "-"}</TableCell>
                          <TableCell><Badge variant={h.status === "Active" ? "default" : "outline"}>{h.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "rooms" && (
            <Card>
              <CardContent className="p-0">
                {rooms.length === 0 ? <p className="text-center py-8 text-muted-foreground">No rooms found.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Room No.</TableHead><TableHead>Hostel</TableHead><TableHead>Floor</TableHead><TableHead>Type</TableHead><TableHead>Capacity</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {(rooms as any[]).map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium text-sm">{r.roomNumber}</TableCell>
                          <TableCell className="text-sm">{r.hostelName}</TableCell>
                          <TableCell className="text-sm">{r.floor || "-"}</TableCell>
                          <TableCell><Badge variant="outline">{r.roomType || "Standard"}</Badge></TableCell>
                          <TableCell className="text-sm">{r.capacity}</TableCell>
                          <TableCell><Badge variant={r.status === "Available" ? "default" : "outline"}>{r.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "allocations" && (
            <Card>
              <CardContent className="p-0">
                {allocations.length === 0 ? <p className="text-center py-8 text-muted-foreground">No allocations found.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Roll No.</TableHead><TableHead>Hostel</TableHead><TableHead>Room</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {(allocations as any[]).map((a: any) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium text-sm">{a.studentName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{a.rollNumber}</TableCell>
                          <TableCell className="text-sm">{a.hostelName}</TableCell>
                          <TableCell className="text-sm">{a.roomNumber}</TableCell>
                          <TableCell><Badge variant={a.status === "Active" ? "default" : "outline"}>{a.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "complaints" && (
            <Card>
              <CardContent className="p-0">
                {complaints.length === 0 ? <p className="text-center py-8 text-muted-foreground">No complaints found.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Roll No.</TableHead><TableHead>Subject</TableHead><TableHead>Description</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {(complaints as any[]).map((c: any) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium text-sm">{c.studentName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{c.rollNumber}</TableCell>
                          <TableCell className="text-sm">{c.subject || c.complaintType || "-"}</TableCell>
                          <TableCell className="text-sm max-w-xs truncate">{c.description || "-"}</TableCell>
                          <TableCell className="text-sm">{c.complaintDate ? new Date(c.complaintDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                          <TableCell><Badge variant={c.status === "Resolved" ? "outline" : c.status === "Pending" ? "destructive" : "default"}>{c.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
