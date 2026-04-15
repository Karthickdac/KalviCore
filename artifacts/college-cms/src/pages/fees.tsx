import { useState } from "react";
import { useListFeeStructures, useCreateFeeStructure, getListFeeStructuresQueryKey, useListFeePayments, useRecordFeePayment, getListFeePaymentsQueryKey, useGetStudentDues, getGetStudentDuesQueryKey, useListCourses, useListStudents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Fees() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Fees & Payments</h2><p className="text-muted-foreground">Manage fee structures, payments, and student dues.</p></div>
      <Tabs defaultValue="structures">
        <TabsList><TabsTrigger value="structures">Fee Structures</TabsTrigger><TabsTrigger value="payments">Payments</TabsTrigger><TabsTrigger value="dues">Student Dues</TabsTrigger></TabsList>
        <TabsContent value="structures"><FeeStructures /></TabsContent>
        <TabsContent value="payments"><FeePayments /></TabsContent>
        <TabsContent value="dues"><StudentDues /></TabsContent>
      </Tabs>
    </div>
  );
}

const feeStructureSchema = z.object({
  courseId: z.coerce.number().min(1),
  academicYear: z.string().min(1),
  tuitionFee: z.coerce.number().min(0),
  labFee: z.coerce.number().min(0),
  libraryFee: z.coerce.number().min(0),
  examFee: z.coerce.number().min(0),
  transportFee: z.coerce.number().min(0),
  hostelFee: z.coerce.number().min(0),
  otherFee: z.coerce.number().min(0),
  totalFee: z.coerce.number().min(0),
});

function FeeStructures() {
  const { data: structures, isLoading } = useListFeeStructures();
  const { data: courses } = useListCourses();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateFeeStructure();

  const getCourseName = (id: number) => courses?.find(c => c.id === id)?.code || '-';

  const form = useForm({ resolver: zodResolver(feeStructureSchema), defaultValues: { courseId: 0, academicYear: "2024-2025", tuitionFee: 0, labFee: 0, libraryFee: 0, examFee: 0, transportFee: 0, hostelFee: 0, otherFee: 0, totalFee: 0 } });

  const onSubmit = (data: any) => {
    createMutation.mutate({ data }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListFeeStructuresQueryKey() }); toast({ title: "Fee structure created" }); setIsOpen(false); form.reset(); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fee Structures</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Structure</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add Fee Structure</DialogTitle></DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pr-4">
                  <FormField control={form.control} name="courseId" render={({ field }) => (<FormItem><FormLabel>Course *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{courses?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="academicYear" render={({ field }) => (<FormItem><FormLabel>Academic Year *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="tuitionFee" render={({ field }) => (<FormItem><FormLabel>Tuition Fee</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="labFee" render={({ field }) => (<FormItem><FormLabel>Lab Fee</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="libraryFee" render={({ field }) => (<FormItem><FormLabel>Library Fee</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="examFee" render={({ field }) => (<FormItem><FormLabel>Exam Fee</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="transportFee" render={({ field }) => (<FormItem><FormLabel>Transport Fee</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="hostelFee" render={({ field }) => (<FormItem><FormLabel>Hostel Fee</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="otherFee" render={({ field }) => (<FormItem><FormLabel>Other Fee</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="totalFee" render={({ field }) => (<FormItem><FormLabel>Total Fee</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                  </div>
                  <DialogFooter><Button type="submit" disabled={createMutation.isPending}>Save</Button></DialogFooter>
                </form>
              </Form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Year</TableHead><TableHead>Tuition</TableHead><TableHead>Lab</TableHead><TableHead>Library</TableHead><TableHead>Exam</TableHead><TableHead>Transport</TableHead><TableHead>Hostel</TableHead><TableHead>Other</TableHead><TableHead className="font-bold">Total</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? (<TableRow><TableCell colSpan={10} className="text-center">Loading...</TableCell></TableRow>) : structures?.length === 0 ? (<TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">No fee structures found.</TableCell></TableRow>) : (
              structures?.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{getCourseName(s.courseId)}</TableCell>
                  <TableCell>{s.academicYear}</TableCell>
                  <TableCell>{s.tuitionFee.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{s.labFee.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{s.libraryFee.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{s.examFee.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{s.transportFee.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{s.hostelFee.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{s.otherFee.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="font-bold">{s.totalFee.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const paymentSchema = z.object({
  studentId: z.coerce.number().min(1),
  feeStructureId: z.coerce.number().min(1),
  amountPaid: z.coerce.number().min(1),
  paymentDate: z.string().min(1),
  paymentMode: z.string().min(1),
  receiptNumber: z.string().min(1),
  semester: z.coerce.number().min(1),
  academicYear: z.string().min(1),
  status: z.string().min(1),
  remarks: z.string().optional().nullable(),
});

function FeePayments() {
  const { data: payments, isLoading } = useListFeePayments();
  const { data: students } = useListStudents();
  const { data: structures } = useListFeeStructures();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const recordMutation = useRecordFeePayment();

  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.rollNumber} - ${s.firstName}` : '-'; };

  const form = useForm({ resolver: zodResolver(paymentSchema), defaultValues: { studentId: 0, feeStructureId: 0, amountPaid: 0, paymentDate: new Date().toISOString().split('T')[0], paymentMode: "Online", receiptNumber: `RCT-${Date.now()}`, semester: 1, academicYear: "2024-2025", status: "Paid", remarks: "" } });

  const onSubmit = (data: any) => {
    const cleanData = { ...data, remarks: data.remarks || null };
    recordMutation.mutate({ data: cleanData }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListFeePaymentsQueryKey() }); toast({ title: "Payment recorded" }); setIsOpen(false); form.reset(); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fee Payments</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Record Payment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Fee Payment</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="feeStructureId" render={({ field }) => (<FormItem><FormLabel>Fee Structure *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{structures?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.academicYear} - Total: {s.totalFee}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="amountPaid" render={({ field }) => (<FormItem><FormLabel>Amount *</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="paymentDate" render={({ field }) => (<FormItem><FormLabel>Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="paymentMode" render={({ field }) => (<FormItem><FormLabel>Mode *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Cheque">Cheque</SelectItem><SelectItem value="Online">Online</SelectItem><SelectItem value="DD">DD</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="receiptNumber" render={({ field }) => (<FormItem><FormLabel>Receipt No *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="semester" render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Partial">Partial</SelectItem><SelectItem value="Pending">Pending</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
                <DialogFooter><Button type="submit" disabled={recordMutation.isPending}>Record</Button></DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Receipt</TableHead><TableHead>Student</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? (<TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>) : payments?.length === 0 ? (<TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No payments recorded.</TableCell></TableRow>) : (
              payments?.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.receiptNumber}</TableCell>
                  <TableCell>{getStudentName(p.studentId)}</TableCell>
                  <TableCell>{p.amountPaid.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{p.paymentDate}</TableCell>
                  <TableCell>{p.paymentMode}</TableCell>
                  <TableCell><Badge variant={p.status === 'Paid' ? 'default' : p.status === 'Partial' ? 'secondary' : 'destructive'}>{p.status}</Badge></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StudentDues() {
  const [studentId, setStudentId] = useState("");
  const { data: students } = useListStudents();
  const { data: dues } = useGetStudentDues(Number(studentId), { query: { enabled: !!studentId, queryKey: getGetStudentDuesQueryKey(Number(studentId)) } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Dues</CardTitle>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger className="w-[350px]"><SelectValue placeholder="Select a student" /></SelectTrigger>
          <SelectContent>{students?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName} {s.lastName}</SelectItem>)}</SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {studentId && dues ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Total Fee</div><div className="text-2xl font-bold">{dues.totalFee.toLocaleString('en-IN')}</div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Total Paid</div><div className="text-2xl font-bold text-green-600">{dues.totalPaid.toLocaleString('en-IN')}</div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Dues Remaining</div><div className="text-2xl font-bold text-red-600">{dues.totalDue.toLocaleString('en-IN')}</div></CardContent></Card>
            </div>
            {dues.payments.length > 0 && (
              <Table>
                <TableHeader><TableRow><TableHead>Receipt</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{dues.payments.map(p => (
                  <TableRow key={p.id}><TableCell>{p.receiptNumber}</TableCell><TableCell>{p.amountPaid.toLocaleString('en-IN')}</TableCell><TableCell>{p.paymentDate}</TableCell><TableCell>{p.paymentMode}</TableCell><TableCell><Badge variant={p.status === 'Paid' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell></TableRow>
                ))}</TableBody>
              </Table>
            )}
          </div>
        ) : (<p className="text-muted-foreground text-center py-8">Select a student to view dues.</p>)}
      </CardContent>
    </Card>
  );
}
