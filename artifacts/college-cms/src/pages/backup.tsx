import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Database, HardDrive, Shield, RefreshCw } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function BackupPage() {
  const { token, hasRole } = useAuth();
  const { toast } = useToast();
  const headers = { Authorization: `Bearer ${token}` };
  const [exporting, setExporting] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["backup-stats"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/backup/stats`, { headers });
      return res.json();
    },
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/api/backup/export`, { headers });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Backup exported successfully" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
    setExporting(false);
  };

  if (!hasRole("SuperAdmin", "Admin")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">Only administrators can access backup management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Backup & Restore</h1>
          <p className="text-muted-foreground">Export and manage database backups.</p>
        </div>
        <Button onClick={handleExport} disabled={exporting} size="lg">
          {exporting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Exporting...</> : <><Download className="mr-2 h-4 w-4" />Export Full Backup</>}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Database className="w-10 h-10 mx-auto mb-3 text-blue-500" />
            <p className="text-3xl font-bold">{stats?.totalRecords || 0}</p>
            <p className="text-sm text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <HardDrive className="w-10 h-10 mx-auto mb-3 text-green-500" />
            <p className="text-3xl font-bold">{stats?.stats ? Object.keys(stats.stats).length : 0}</p>
            <p className="text-sm text-muted-foreground">Tables</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-10 h-10 mx-auto mb-3 text-purple-500" />
            <p className="text-3xl font-bold">JSON</p>
            <p className="text-sm text-muted-foreground">Backup Format</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Database Summary</CardTitle>
          <CardDescription>Records count per table. Click "Export Full Backup" to download all data.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead className="text-right">Records</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.stats && Object.entries(stats.stats).sort(([,a],[,b]) => (b as number) - (a as number)).map(([table, count]) => (
                  <TableRow key={table}>
                    <TableCell className="font-medium capitalize">{table.replace(/([A-Z])/g, " $1").trim()}</TableCell>
                    <TableCell className="text-right font-mono">{String(count)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={(count as number) > 0 ? "default" : "secondary"}>{(count as number) > 0 ? "Has Data" : "Empty"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Database className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Full Database Export</p>
                <p className="text-muted-foreground">Exports all tables including departments, students, staff, fees, exams, events, payroll, and calendar data as a single JSON file.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Data Safety</p>
                <p className="text-muted-foreground">Backups include timestamps and record counts for verification. Store backups securely as they contain sensitive student and staff information.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
