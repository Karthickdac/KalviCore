import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { useListStaff } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, IndianRupee, CheckCircle, Clock, Download } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function PayrollPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: staff = [] } = useListStaff();
  const { data: payroll = [], isLoading } = useQuery<any[]>({
    queryKey: ["payroll", selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/payroll?month=${selectedMonth}&year=${selectedYear}`, { headers });
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/api/payroll`, { method: "POST", headers, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["payroll"] }); toast({ title: "Payroll entry created" }); setDialogOpen(false); },
  });

  const processMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/api/payroll/${id}`, { method: "PATCH", headers, body: JSON.stringify({ status: "Paid", paidDate: new Date().toISOString() }) });
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["payroll"] }); toast({ title: "Salary marked as paid" }); },
  });

  const getStaffName = (id: number) => staff.find((s: any) => s.id === id)?.name || `Staff #${id}`;
  const totalNet = payroll.reduce((s: number, p: any) => s + Number(p.netSalary), 0);
  const paid = payroll.filter((p: any) => p.status === "Paid").length;
  const pending = payroll.filter((p: any) => p.status === "Pending").length;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      staffId: Number(fd.get("staffId")), month: Number(selectedMonth), year: Number(selectedYear),
      basicSalary: fd.get("basicSalary"), hra: fd.get("hra"), da: fd.get("da"), ta: fd.get("ta"),
      otherAllowances: fd.get("otherAllowances"), pf: fd.get("pf"), tax: fd.get("tax"),
      otherDeductions: fd.get("otherDeductions"), remarks: fd.get("remarks"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">Process staff salaries and manage payroll.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Payroll Entry</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Payroll Entry</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Staff Member</Label>
                <select name="staffId" className="w-full rounded-md border px-3 py-2 text-sm" required>
                  <option value="">Select staff</option>
                  {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name} - {s.designation}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Basic Salary</Label><Input name="basicSalary" type="number" required placeholder="0" /></div>
                <div className="space-y-1"><Label className="text-xs">HRA</Label><Input name="hra" type="number" defaultValue="0" /></div>
                <div className="space-y-1"><Label className="text-xs">DA</Label><Input name="da" type="number" defaultValue="0" /></div>
                <div className="space-y-1"><Label className="text-xs">TA</Label><Input name="ta" type="number" defaultValue="0" /></div>
                <div className="space-y-1"><Label className="text-xs">Other Allowances</Label><Input name="otherAllowances" type="number" defaultValue="0" /></div>
                <div className="space-y-1"><Label className="text-xs">PF Deduction</Label><Input name="pf" type="number" defaultValue="0" /></div>
                <div className="space-y-1"><Label className="text-xs">Tax</Label><Input name="tax" type="number" defaultValue="0" /></div>
                <div className="space-y-1"><Label className="text-xs">Other Deductions</Label><Input name="otherDeductions" type="number" defaultValue="0" /></div>
              </div>
              <div className="space-y-2"><Label>Remarks</Label><Input name="remarks" /></div>
              <DialogFooter><Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Creating..." : "Create"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 items-center">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>{[2024, 2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{payroll.length}</p><p className="text-sm text-muted-foreground">Total Entries</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">₹{totalNet.toLocaleString("en-IN")}</p><p className="text-sm text-muted-foreground">Total Net Salary</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{paid}</p><p className="text-sm text-muted-foreground">Paid</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-amber-600">{pending}</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Payroll - {MONTHS[Number(selectedMonth) - 1]} {selectedYear}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead className="text-right">Basic</TableHead>
                <TableHead className="text-right">Allowances</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : payroll.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No payroll entries</TableCell></TableRow>
              ) : payroll.map((p: any) => {
                const allowances = Number(p.hra) + Number(p.da) + Number(p.ta) + Number(p.otherAllowances);
                const deductions = Number(p.pf) + Number(p.tax) + Number(p.otherDeductions);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{getStaffName(p.staffId)}</TableCell>
                    <TableCell className="text-right">₹{Number(p.basicSalary).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right text-green-600">+₹{allowances.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right text-red-600">-₹{deductions.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right font-bold">₹{Number(p.netSalary).toLocaleString("en-IN")}</TableCell>
                    <TableCell><Badge variant={p.status === "Paid" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                    <TableCell>
                      {p.status === "Pending" && (
                        <Button size="sm" variant="outline" onClick={() => processMutation.mutate(p.id)}>
                          <CheckCircle className="mr-1 h-3 w-3" />Mark Paid
                        </Button>
                      )}
                      {p.status === "Paid" && p.paidDate && (
                        <span className="text-xs text-muted-foreground">{new Date(p.paidDate).toLocaleDateString("en-IN")}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
