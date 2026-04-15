import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, Users, Briefcase } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ""; });
    return obj;
  });
}

export default function BulkImportPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [tab, setTab] = useState("students");
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [result, setResult] = useState<{ inserted: number; errors: { row: number; error: string }[]; total: number } | null>(null);

  const importMutation = useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any[] }) => {
      const res = await fetch(`${API_BASE}/api/bulk-import/${type}`, {
        method: "POST", headers,
        body: JSON.stringify(type === "students" ? { students: data } : { staff: data }),
      });
      if (!res.ok) throw new Error("Import failed");
      return res.json();
    },
    onSuccess: (data) => { setResult(data); toast({ title: `Imported ${data.inserted} records successfully` }); },
    onError: () => toast({ title: "Import failed", variant: "destructive" }),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setPreview(parsed);
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (preview.length === 0) return;
    importMutation.mutate({ type: tab, data: preview });
  };

  const downloadTemplate = (type: string) => {
    const templates: Record<string, string> = {
      students: "firstName,lastName,rollNumber,email,phone,departmentId,courseId,year,semester,admissionType,community,gender,dateOfBirth,admissionDate,address,fatherName,guardianPhone\nJohn,Doe,21CSE001,john@example.com,9876543210,1,1,1,1,Government,OC,Male,2003-05-15,2021-08-01,Chennai,James Doe,9876543211",
      staff: "firstName,lastName,staffId,email,phone,departmentId,designation,qualification,specialization,experience,salary,joiningDate,gender,employmentType\nSmith,Kumar,FAC001,smith@college.edu,9876543210,1,Professor,Ph.D,AI & ML,15,120000,2020-06-01,Male,Permanent",
    };
    const blob = new Blob([templates[type] || ""], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${type}_template.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExport = async (type: string) => {
    const res = await fetch(`${API_BASE}/api/bulk-export/${type}`, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${type}_export.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bulk Import / Export</h1>
        <p className="text-muted-foreground">Import data from CSV files or export existing records.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setPreview([]); setResult(null); }}>
        <TabsList>
          <TabsTrigger value="students" className="flex items-center gap-2"><Users className="w-4 h-4" />Students</TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2"><Briefcase className="w-4 h-4" />Staff</TabsTrigger>
        </TabsList>

        {["students", "staff"].map(type => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Upload className="w-4 h-4" /> Import {type}</CardTitle>
                  <CardDescription>Upload a CSV file to bulk import {type}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" size="sm" onClick={() => downloadTemplate(type)}>
                    <Download className="mr-2 h-4 w-4" />Download CSV Template
                  </Button>
                  <div>
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer" />
                  </div>
                  {preview.length > 0 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{preview.length} records ready</p>
                      <Button onClick={handleImport} disabled={importMutation.isPending}>
                        {importMutation.isPending ? "Importing..." : `Import ${preview.length} Records`}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Download className="w-4 h-4" /> Export {type}</CardTitle>
                  <CardDescription>Download all {type} records as CSV.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => downloadExport(type)}>
                    <Download className="mr-2 h-4 w-4" />Export All {type} to CSV
                  </Button>
                </CardContent>
              </Card>
            </div>

            {result && (
              <Card>
                <CardHeader><CardTitle className="text-base">Import Results</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-muted"><p className="text-2xl font-bold">{result.total}</p><p className="text-xs text-muted-foreground">Total Rows</p></div>
                    <div className="text-center p-3 rounded-lg bg-green-50"><p className="text-2xl font-bold text-green-600">{result.inserted}</p><p className="text-xs text-muted-foreground">Imported</p></div>
                    <div className="text-center p-3 rounded-lg bg-red-50"><p className="text-2xl font-bold text-red-600">{result.errors.length}</p><p className="text-xs text-muted-foreground">Errors</p></div>
                  </div>
                  {result.errors.length > 0 && (
                    <Table>
                      <TableHeader><TableRow><TableHead>Row</TableHead><TableHead>Error</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {result.errors.map((e, i) => (
                          <TableRow key={i}><TableCell>{e.row}</TableCell><TableCell className="text-red-600 text-sm">{e.error}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {preview.length > 0 && !result && (
              <Card>
                <CardHeader><CardTitle className="text-base">Preview ({preview.length} rows)</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>{Object.keys(preview[0]).slice(0, 6).map(h => <TableHead key={h}>{h}</TableHead>)}<TableHead>...</TableHead></TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.slice(0, 5).map((row, i) => (
                          <TableRow key={i}>{Object.values(row).slice(0, 6).map((v, j) => <TableCell key={j} className="text-sm">{v}</TableCell>)}<TableCell>...</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {preview.length > 5 && <p className="text-sm text-muted-foreground mt-2">Showing 5 of {preview.length} rows</p>}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
