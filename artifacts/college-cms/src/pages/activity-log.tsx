import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search, Activity, Download } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const ACTION_COLORS: Record<string, string> = {
  student_enrolled: "bg-green-100 text-green-800",
  fee_payment: "bg-blue-100 text-blue-800",
  user_login: "bg-purple-100 text-purple-800",
  user_created: "bg-orange-100 text-orange-800",
  payroll_created: "bg-yellow-100 text-yellow-800",
};

export default function ActivityLogPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");

  const { data: activities = [], isLoading } = useQuery<any[]>({
    queryKey: ["activity-log"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/dashboard/recent-activity`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
  });

  const filtered = activities.filter((a: any) =>
    !search || a.action?.toLowerCase().includes(search.toLowerCase()) || a.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">System audit trail of all actions.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{activities.length}</p><p className="text-sm text-muted-foreground">Total Activities</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{new Set(activities.map((a: any) => a.action)).size}</p><p className="text-sm text-muted-foreground">Action Types</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{activities.filter((a: any) => { const d = new Date(a.createdAt); const now = new Date(); return d.toDateString() === now.toDateString(); }).length}</p><p className="text-sm text-muted-foreground">Today</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4" /> Audit Trail</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search activities..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Entity ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No activities found</TableCell></TableRow>
              ) : filtered.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm">{new Date(a.createdAt).toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ACTION_COLORS[a.action] || "bg-gray-100 text-gray-800"}>
                      {a.action?.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{a.details}</TableCell>
                  <TableCell className="text-sm font-mono">{a.entityId || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
