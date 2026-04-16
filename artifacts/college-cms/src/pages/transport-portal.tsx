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
  Bus, LogOut, ArrowLeft, LayoutDashboard, Route, MapPin, Users,
  ChevronLeft, ChevronRight, Menu
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

export default function TransportPortalPage() {
  const [staffId, setStaffId] = useState("");
  const [phone, setPhone] = useState("");
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
      const res = await fetch(`${API_BASE}/api/staff-portal/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, phone }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Invalid credentials"); setLoading(false); return; }
      const data = await res.json();
      setStaff(data.staff);
    } catch { setError("Connection failed"); }
    setLoading(false);
  };

  const { data: stats } = useQuery({
    queryKey: ["transport-stats"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/transport-portal/stats`); return r.json(); }, enabled: !!staff,
  });
  const { data: routes = [] } = useQuery({
    queryKey: ["transport-routes-portal"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/transport-portal/routes`); return r.json(); }, enabled: !!staff,
  });
  const { data: vehicles = [] } = useQuery({
    queryKey: ["transport-vehicles-portal"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/transport-portal/vehicles`); return r.json(); }, enabled: !!staff,
  });
  const { data: stops = [] } = useQuery({
    queryKey: ["transport-stops-portal"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/transport-portal/stops`); return r.json(); }, enabled: !!staff,
  });
  const { data: allocations = [] } = useQuery({
    queryKey: ["transport-allocations-portal"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/transport-portal/allocations`); return r.json(); }, enabled: !!staff,
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
              <CardDescription>Enter your Staff ID and registered phone number.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">{error}</div>}
                <div className="space-y-2"><Label>Staff ID</Label><Input value={staffId} onChange={e => setStaffId(e.target.value)} placeholder="e.g., FAC001" required /></div>
                <div className="space-y-2"><Label>Phone Number</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g., 9876543210" required /></div>
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
                        {(routes as any[]).slice(0, 5).map((r: any) => (
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

          {activeSection === "routes" && (
            <Card>
              <CardContent className="p-0">
                {routes.length === 0 ? <p className="text-center py-8 text-muted-foreground">No routes found.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Route Name</TableHead><TableHead>Number</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Distance</TableHead><TableHead>Est. Time</TableHead><TableHead>Fare</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {(routes as any[]).map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium text-sm">{r.routeName}</TableCell>
                          <TableCell className="text-sm">{r.routeNumber}</TableCell>
                          <TableCell className="text-sm">{r.startPoint}</TableCell>
                          <TableCell className="text-sm">{r.endPoint}</TableCell>
                          <TableCell className="text-sm">{r.distance || "-"}</TableCell>
                          <TableCell className="text-sm">{r.estimatedTime || "-"}</TableCell>
                          <TableCell className="text-sm">{r.fare ? `₹${r.fare}` : "-"}</TableCell>
                          <TableCell><Badge variant={r.status === "Active" ? "default" : "outline"}>{r.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "vehicles" && (
            <Card>
              <CardContent className="p-0">
                {vehicles.length === 0 ? <p className="text-center py-8 text-muted-foreground">No vehicles found.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Vehicle No.</TableHead><TableHead>Type</TableHead><TableHead>Route</TableHead><TableHead>Driver</TableHead><TableHead>Driver Phone</TableHead><TableHead>Capacity</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {(vehicles as any[]).map((v: any) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium text-sm">{v.vehicleNumber}</TableCell>
                          <TableCell><Badge variant="outline">{v.vehicleType || "Bus"}</Badge></TableCell>
                          <TableCell className="text-sm">{v.routeName}</TableCell>
                          <TableCell className="text-sm">{v.driverName || "-"}</TableCell>
                          <TableCell className="text-sm">{v.driverPhone || "-"}</TableCell>
                          <TableCell className="text-sm">{v.capacity || "-"}</TableCell>
                          <TableCell><Badge variant={v.status === "Active" ? "default" : "outline"}>{v.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "stops" && (
            <Card>
              <CardContent className="p-0">
                {stops.length === 0 ? <p className="text-center py-8 text-muted-foreground">No stops found.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Stop Name</TableHead><TableHead>Route</TableHead><TableHead>Order</TableHead><TableHead>Pickup Time</TableHead><TableHead>Drop Time</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {(stops as any[]).map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium text-sm">{s.stopName}</TableCell>
                          <TableCell className="text-sm">{s.routeName}</TableCell>
                          <TableCell className="text-sm">{s.stopOrder}</TableCell>
                          <TableCell className="text-sm">{s.pickupTime || "-"}</TableCell>
                          <TableCell className="text-sm">{s.dropTime || "-"}</TableCell>
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
                    <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Roll No.</TableHead><TableHead>Route</TableHead><TableHead>Pickup Point</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {(allocations as any[]).map((a: any) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium text-sm">{a.studentName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{a.rollNumber}</TableCell>
                          <TableCell className="text-sm">{a.routeName}</TableCell>
                          <TableCell className="text-sm">{a.pickupPoint || "-"}</TableCell>
                          <TableCell><Badge variant={a.status === "Active" ? "default" : "outline"}>{a.status}</Badge></TableCell>
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
