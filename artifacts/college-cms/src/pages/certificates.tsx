import { useState } from "react";
import { useListCertificates, useCreateCertificate, useUpdateCertificate, useListStudents, getListCertificatesQueryKey } from "@workspace/api-client-react";
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
import { Plus, Award } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Certificates() {
  const { data: certificates, isLoading } = useListCertificates();
  const { data: students } = useListStudents();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateCertificate();
  const updateM = useUpdateCertificate();
  const form = useForm({ defaultValues: { studentId: 0, type: "Bonafide", requestDate: new Date().toISOString().split('T')[0], purpose: "", remarks: "" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListCertificatesQueryKey() }); toast({ title: "Certificate request created" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.rollNumber} - ${s.firstName} ${s.lastName}` : '-'; };
  const handleApprove = (id: number) => {
    const certNo = prompt('Enter certificate number:');
    if (certNo) {
      updateM.mutate({ id, data: { status: 'Issued', issueDate: new Date().toISOString().split('T')[0], certificateNumber: certNo, approvedBy: 'Admin' } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListCertificatesQueryKey() }); toast({ title: "Certificate issued" }); } });
    }
  };
  const handleReject = (id: number) => {
    const reason = prompt('Rejection reason:');
    if (reason) {
      updateM.mutate({ id, data: { status: 'Rejected', remarks: reason } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListCertificatesQueryKey() }) });
    }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Certificates</h2><p className="text-muted-foreground">Certificate requests and issuance tracking.</p></div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle><Award className="w-5 h-5 inline mr-2" />Certificate Requests</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Request</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Request Certificate</DialogTitle></DialogHeader>
              <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Certificate Type *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Bonafide">Bonafide Certificate</SelectItem><SelectItem value="Transfer">Transfer Certificate</SelectItem><SelectItem value="Conduct">Conduct Certificate</SelectItem><SelectItem value="Course Completion">Course Completion</SelectItem><SelectItem value="Migration">Migration Certificate</SelectItem><SelectItem value="Character">Character Certificate</SelectItem><SelectItem value="Medium of Instruction">Medium of Instruction</SelectItem><SelectItem value="Provisional">Provisional Certificate</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="requestDate" render={({ field }) => (<FormItem><FormLabel>Request Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="purpose" render={({ field }) => (<FormItem><FormLabel>Purpose</FormLabel><FormControl><Input {...field} placeholder="e.g., Higher studies, Passport" /></FormControl></FormItem>)} />
                <DialogFooter><Button type="submit" disabled={createM.isPending}>Submit Request</Button></DialogFooter>
              </form></Form></DialogContent></Dialog>
        </CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Type</TableHead><TableHead>Request Date</TableHead><TableHead>Issue Date</TableHead><TableHead>Cert No</TableHead><TableHead>Purpose</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{isLoading ? <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow> : certificates?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No certificate requests.</TableCell></TableRow> : certificates?.map(c => (
              <TableRow key={c.id}><TableCell className="font-medium">{getStudentName(c.studentId)}</TableCell><TableCell><Badge variant="secondary">{c.type}</Badge></TableCell><TableCell>{c.requestDate}</TableCell><TableCell>{c.issueDate || '-'}</TableCell><TableCell>{c.certificateNumber || '-'}</TableCell><TableCell>{c.purpose || '-'}</TableCell><TableCell><Badge variant={c.status === 'Issued' ? 'default' : c.status === 'Rejected' ? 'destructive' : 'secondary'}>{c.status}</Badge></TableCell><TableCell className="space-x-1">{c.status === 'Pending' && <><Button variant="outline" size="sm" onClick={() => handleApprove(c.id)}>Issue</Button><Button variant="ghost" size="sm" onClick={() => handleReject(c.id)}>Reject</Button></>}</TableCell></TableRow>
            ))}</TableBody></Table>
        </CardContent>
      </Card>
    </div>
  );
}
