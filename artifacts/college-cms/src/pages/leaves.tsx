import { useState } from "react";
import { useListStaffLeaves, useCreateStaffLeave, useUpdateStaffLeave, useListStaff, getListStaffLeavesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Plus, CalendarOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Leaves() {
  const { data: leaves, isLoading } = useListStaffLeaves();
  const { data: staff } = useListStaff();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateStaffLeave();
  const updateM = useUpdateStaffLeave();
  const form = useForm({ defaultValues: { staffId: 0, leaveType: "Casual Leave", startDate: "", endDate: "", totalDays: 1, reason: "", remarks: "" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListStaffLeavesQueryKey() }); toast({ title: "Leave applied" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getStaffName = (id: number) => { const s = staff?.find(st => st.id === id); return s ? `${s.firstName} ${s.lastName}` : '-'; };
  const handleAction = (id: number, action: 'Approved' | 'Rejected') => {
    const remarks = action === 'Rejected' ? prompt('Rejection reason:') || '' : '';
    updateM.mutate({ id, data: { status: action, approvedBy: 'Admin', remarks } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListStaffLeavesQueryKey() }); toast({ title: `Leave ${action.toLowerCase()}` }); } });
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Staff Leaves</h2><p className="text-muted-foreground">Leave applications and approval management.</p></div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle><CalendarOff className="w-5 h-5 inline mr-2" />Leave Applications</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Apply Leave</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Apply Leave</DialogTitle></DialogHeader>
              <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="staffId" render={({ field }) => (<FormItem><FormLabel>Staff *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{staff?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="leaveType" render={({ field }) => (<FormItem><FormLabel>Leave Type *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Casual Leave">Casual Leave (CL)</SelectItem><SelectItem value="Sick Leave">Sick Leave (SL)</SelectItem><SelectItem value="Earned Leave">Earned Leave (EL)</SelectItem><SelectItem value="Maternity Leave">Maternity Leave</SelectItem><SelectItem value="Paternity Leave">Paternity Leave</SelectItem><SelectItem value="Compensatory Off">Compensatory Off</SelectItem><SelectItem value="On Duty">On Duty (OD)</SelectItem><SelectItem value="Loss of Pay">Loss of Pay (LOP)</SelectItem></SelectContent></Select></FormItem>)} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem><FormLabel>From *</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem><FormLabel>To *</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                </div>
                <FormField control={form.control} name="totalDays" render={({ field }) => (<FormItem><FormLabel>Total Days *</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="reason" render={({ field }) => (<FormItem><FormLabel>Reason *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <DialogFooter><Button type="submit" disabled={createM.isPending}>Apply</Button></DialogFooter>
              </form></Form></DialogContent></Dialog>
        </CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Staff</TableHead><TableHead>Type</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Days</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{isLoading ? <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow> : leaves?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No leave applications.</TableCell></TableRow> : leaves?.map(l => (
              <TableRow key={l.id}><TableCell className="font-medium">{getStaffName(l.staffId)}</TableCell><TableCell><Badge variant="secondary">{l.leaveType}</Badge></TableCell><TableCell>{l.startDate}</TableCell><TableCell>{l.endDate}</TableCell><TableCell>{l.totalDays}</TableCell><TableCell className="max-w-[200px] truncate">{l.reason}</TableCell><TableCell><Badge variant={l.status === 'Approved' ? 'default' : l.status === 'Rejected' ? 'destructive' : 'secondary'}>{l.status}</Badge></TableCell><TableCell className="space-x-1">{l.status === 'Pending' && <><Button variant="outline" size="sm" onClick={() => handleAction(l.id, 'Approved')}>Approve</Button><Button variant="ghost" size="sm" onClick={() => handleAction(l.id, 'Rejected')}>Reject</Button></>}</TableCell></TableRow>
            ))}</TableBody></Table>
        </CardContent>
      </Card>
    </div>
  );
}
