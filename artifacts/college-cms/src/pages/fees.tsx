import { useState, useEffect, useCallback } from "react";
import { useListFeeStructures, useCreateFeeStructure, getListFeeStructuresQueryKey, useListFeePayments, useRecordFeePayment, getListFeePaymentsQueryKey, useGetStudentDues, getGetStudentDuesQueryKey, useListCourses, useListStudents, useCreateRazorpayOrder, useVerifyRazorpayPayment, useGetRazorpayConfig, useListFeeInstalments, useCreateFeeInstalment, useUpdateFeeInstalment, getListFeeInstalmentsQueryKey, useListFeeDefaulters, useListScholarships, useCreateScholarship, useUpdateScholarship, getListScholarshipsQueryKey } from "@workspace/api-client-react";
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
import { Plus, CreditCard, IndianRupee } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function useRazorpayScript() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, []);
  return loaded;
}

export default function Fees() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Fees & Payments</h2><p className="text-muted-foreground">Manage fee structures, payments, and student dues.</p></div>
      <Tabs defaultValue="structures">
        <TabsList className="flex-wrap"><TabsTrigger value="structures">Fee Structures</TabsTrigger><TabsTrigger value="payments">Payments</TabsTrigger><TabsTrigger value="dues">Student Dues</TabsTrigger><TabsTrigger value="instalments">Instalments</TabsTrigger><TabsTrigger value="defaulters">Defaulters</TabsTrigger><TabsTrigger value="scholarships">Scholarships</TabsTrigger></TabsList>
        <TabsContent value="structures"><FeeStructures /></TabsContent>
        <TabsContent value="payments"><FeePayments /></TabsContent>
        <TabsContent value="dues"><StudentDues /></TabsContent>
        <TabsContent value="instalments"><FeeInstalments /></TabsContent>
        <TabsContent value="defaulters"><FeeDefaulters /></TabsContent>
        <TabsContent value="scholarships"><Scholarships /></TabsContent>
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
                  <FormField control={form.control} name="paymentMode" render={({ field }) => (<FormItem><FormLabel>Mode *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Cheque">Cheque</SelectItem><SelectItem value="Online">Online</SelectItem><SelectItem value="DD">DD</SelectItem><SelectItem value="Razorpay">Razorpay</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
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
                  <TableCell>
                    {p.paymentMode === 'Razorpay' ? (
                      <Badge className="bg-blue-600"><CreditCard className="w-3 h-3 mr-1" />{p.paymentMode}</Badge>
                    ) : p.paymentMode}
                  </TableCell>
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
  const { data: structures } = useListFeeStructures();
  const razorpayLoaded = useRazorpayScript();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createOrderMutation = useCreateRazorpayOrder();
  const verifyPaymentMutation = useVerifyRazorpayPayment();
  const [payAmount, setPayAmount] = useState("");
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const selectedStudent = students?.find(s => s.id === Number(studentId));
  const studentFeeStructure = structures?.find(s => selectedStudent && s.courseId === selectedStudent.courseId);

  const handlePayOnline = useCallback(() => {
    if (!studentId || !selectedStudent || !studentFeeStructure) {
      toast({ title: "Select a student first", variant: "destructive" });
      return;
    }
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (!razorpayLoaded) {
      toast({ title: "Payment system is loading, please try again", variant: "destructive" });
      return;
    }

    setPaying(true);
    createOrderMutation.mutate({
      data: {
        studentId: Number(studentId),
        feeStructureId: studentFeeStructure.id,
        amount,
        semester: selectedStudent.semester,
        academicYear: studentFeeStructure.academicYear,
      }
    }, {
      onSuccess: (orderData) => {
        const options = {
          key: orderData.keyId,
          amount: Math.round(orderData.amount * 100),
          currency: orderData.currency,
          name: "KalviCore",
          description: `Fee Payment - ${selectedStudent.rollNumber}`,
          order_id: orderData.orderId,
          prefill: {
            name: orderData.studentName,
            email: orderData.studentEmail || undefined,
            contact: orderData.studentPhone || undefined,
          },
          theme: { color: "#1e3a5f" },
          handler: function(response: any) {
            verifyPaymentMutation.mutate({
              data: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }
            }, {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getGetStudentDuesQueryKey(Number(studentId)) });
                queryClient.invalidateQueries({ queryKey: getListFeePaymentsQueryKey() });
                toast({ title: "Payment successful! Fee has been recorded." });
                setIsPayOpen(false);
                setPayAmount("");
                setPaying(false);
              },
              onError: () => {
                toast({ title: "Payment received but recording failed. Contact admin.", variant: "destructive" });
                setPaying(false);
              }
            });
          },
          modal: {
            ondismiss: function() {
              setPaying(false);
              toast({ title: "Payment cancelled" });
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function(response: any) {
          setPaying(false);
          toast({ title: `Payment failed: ${response.error.description}`, variant: "destructive" });
        });
        rzp.open();
      },
      onError: () => {
        setPaying(false);
        toast({ title: "Failed to create payment order", variant: "destructive" });
      }
    });
  }, [studentId, selectedStudent, studentFeeStructure, payAmount, razorpayLoaded, createOrderMutation, verifyPaymentMutation, queryClient, toast]);

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

            {dues.totalDue > 0 && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Pay Online via Razorpay</h4>
                        <p className="text-sm text-muted-foreground">Secure online payment - UPI, Cards, Net Banking</p>
                      </div>
                    </div>
                    <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <IndianRupee className="w-4 h-4 mr-1" /> Pay Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Online Fee Payment</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div className="rounded-lg border p-4 space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Student</span><span className="font-medium">{selectedStudent?.rollNumber} - {selectedStudent?.firstName} {selectedStudent?.lastName}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Due Amount</span><span className="font-bold text-red-600">{dues.totalDue.toLocaleString('en-IN')}</span></div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Amount to Pay (in Rupees)</label>
                            <Input
                              type="number"
                              placeholder={`Max: ${dues.totalDue}`}
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              min={1}
                              max={dues.totalDue}
                            />
                            <div className="flex gap-2 mt-2">
                              <Button variant="outline" size="sm" onClick={() => setPayAmount(String(dues.totalDue))}>Full Amount</Button>
                              <Button variant="outline" size="sm" onClick={() => setPayAmount(String(Math.ceil(dues.totalDue / 2)))}>Half</Button>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={handlePayOnline}
                              disabled={paying || createOrderMutation.isPending || verifyPaymentMutation.isPending}
                            >
                              {paying ? "Processing..." : `Pay ${payAmount ? `Rs. ${Number(payAmount).toLocaleString('en-IN')}` : ''} via Razorpay`}
                            </Button>
                          </DialogFooter>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}

            {dues.payments.length > 0 && (
              <Table>
                <TableHeader><TableRow><TableHead>Receipt</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{dues.payments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.receiptNumber}</TableCell>
                    <TableCell>{p.amountPaid.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{p.paymentDate}</TableCell>
                    <TableCell>
                      {p.paymentMode === 'Razorpay' ? (
                        <Badge className="bg-blue-600"><CreditCard className="w-3 h-3 mr-1" />{p.paymentMode}</Badge>
                      ) : p.paymentMode}
                    </TableCell>
                    <TableCell><Badge variant={p.status === 'Paid' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
          </div>
        ) : (<p className="text-muted-foreground text-center py-8">Select a student to view dues.</p>)}
      </CardContent>
    </Card>
  );
}

const instalmentSchema = z.object({
  studentId: z.coerce.number().min(1),
  feeStructureId: z.coerce.number().min(1),
  instalmentNumber: z.coerce.number().min(1),
  amount: z.string().min(1),
  dueDate: z.string().min(1),
  status: z.string().default("Pending"),
  remarks: z.string().optional().nullable(),
});

function FeeInstalments() {
  const { data: instalments, isLoading } = useListFeeInstalments();
  const { data: students } = useListStudents();
  const { data: structures } = useListFeeStructures();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateFeeInstalment();
  const updateMutation = useUpdateFeeInstalment();

  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.firstName} ${s.lastName}` : '-'; };

  const form = useForm({ resolver: zodResolver(instalmentSchema), defaultValues: { studentId: 0, feeStructureId: 0, instalmentNumber: 1, amount: "", dueDate: "", status: "Pending", remarks: "" } });

  const onSubmit = (values: any) => {
    createMutation.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFeeInstalmentsQueryKey() });
        toast({ title: "Instalment created" });
        setIsOpen(false);
        form.reset();
      },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  const markPaid = (inst: any) => {
    updateMutation.mutate({ id: inst.id, data: { status: "Paid", paidDate: new Date().toISOString().split('T')[0], paidAmount: inst.amount } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFeeInstalmentsQueryKey() });
        toast({ title: "Marked as paid" });
      },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fee Instalments</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Instalment</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Create Instalment</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student</FormLabel><Select onValueChange={field.onChange} value={String(field.value || "")}><FormControl><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => (<SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName} ({s.rollNumber})</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="feeStructureId" render={({ field }) => (<FormItem><FormLabel>Fee Structure</FormLabel><Select onValueChange={field.onChange} value={String(field.value || "")}><FormControl><SelectTrigger><SelectValue placeholder="Select structure" /></SelectTrigger></FormControl><SelectContent>{structures?.map(s => (<SelectItem key={s.id} value={String(s.id)}>{s.academicYear} - ₹{Number(s.totalFee).toLocaleString('en-IN')}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="instalmentNumber" render={({ field }) => (<FormItem><FormLabel>Instalment #</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input {...field} placeholder="10000" /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="dueDate" render={({ field }) => (<FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="remarks" render={({ field }) => (<FormItem><FormLabel>Remarks</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={createMutation.isPending}>Create</Button></DialogFooter>
            </form></Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <p>Loading...</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>#</TableHead><TableHead>Amount</TableHead><TableHead>Due Date</TableHead><TableHead>Paid</TableHead><TableHead>Late Fee</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
            <TableBody>{instalments?.map(inst => (
              <TableRow key={inst.id}>
                <TableCell>{getStudentName(inst.studentId)}</TableCell>
                <TableCell>{inst.instalmentNumber}</TableCell>
                <TableCell>₹{Number(inst.amount).toLocaleString('en-IN')}</TableCell>
                <TableCell>{inst.dueDate}</TableCell>
                <TableCell>{inst.paidDate || '-'}</TableCell>
                <TableCell>{inst.lateFee ? `₹${Number(inst.lateFee).toLocaleString('en-IN')}` : '-'}</TableCell>
                <TableCell><Badge variant={inst.status === 'Paid' ? 'default' : inst.status === 'Overdue' ? 'destructive' : 'secondary'}>{inst.status}</Badge></TableCell>
                <TableCell>{inst.status !== 'Paid' && <Button size="sm" variant="outline" onClick={() => markPaid(inst)}>Mark Paid</Button>}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function FeeDefaulters() {
  const { data: defaulters, isLoading } = useListFeeDefaulters();
  const { data: students } = useListStudents();
  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.firstName} ${s.lastName} (${s.rollNumber})` : '-'; };

  return (
    <Card>
      <CardHeader><CardTitle className="text-red-600">Fee Defaulters</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <p>Loading...</p> : defaulters?.length === 0 ? <p className="text-muted-foreground text-center py-8">No defaulters found.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Instalment #</TableHead><TableHead>Amount Due</TableHead><TableHead>Due Date</TableHead><TableHead>Late Fee</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{defaulters?.map(d => (
              <TableRow key={d.id}>
                <TableCell>{getStudentName(d.studentId)}</TableCell>
                <TableCell>{d.instalmentNumber}</TableCell>
                <TableCell>₹{Number(d.amount).toLocaleString('en-IN')}</TableCell>
                <TableCell>{d.dueDate}</TableCell>
                <TableCell>{d.lateFee ? `₹${Number(d.lateFee).toLocaleString('en-IN')}` : '-'}</TableCell>
                <TableCell><Badge variant="destructive">{d.status}</Badge></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

const scholarshipSchema = z.object({
  studentId: z.coerce.number().min(1),
  scholarshipName: z.string().min(1),
  type: z.string().min(1),
  amount: z.string().min(1),
  academicYear: z.string().min(1),
  awardDate: z.string().optional().nullable(),
  status: z.string().default("Applied"),
  approvedBy: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

function Scholarships() {
  const { data: scholarships, isLoading } = useListScholarships();
  const { data: students } = useListStudents();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateScholarship();
  const updateMutation = useUpdateScholarship();
  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.firstName} ${s.lastName}` : '-'; };

  const form = useForm({ resolver: zodResolver(scholarshipSchema), defaultValues: { studentId: 0, scholarshipName: "", type: "Merit", amount: "", academicYear: "2024-2025", awardDate: "", status: "Applied", approvedBy: "", remarks: "" } });

  const onSubmit = (values: any) => {
    createMutation.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListScholarshipsQueryKey() });
        toast({ title: "Scholarship created" });
        setIsOpen(false);
        form.reset();
      },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  const approve = (sch: any) => {
    updateMutation.mutate({ id: sch.id, data: { status: "Approved", approvedBy: "Admin" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListScholarshipsQueryKey() });
        toast({ title: "Scholarship approved" });
      },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Scholarships</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Scholarship</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Create Scholarship</DialogTitle></DialogHeader>
            <ScrollArea className="max-h-[60vh]">
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 p-1">
              <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student</FormLabel><Select onValueChange={field.onChange} value={String(field.value || "")}><FormControl><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => (<SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName} ({s.rollNumber})</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="scholarshipName" render={({ field }) => (<FormItem><FormLabel>Scholarship Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Merit">Merit</SelectItem><SelectItem value="Need-Based">Need-Based</SelectItem><SelectItem value="Government">Government</SelectItem><SelectItem value="SC/ST">SC/ST</SelectItem><SelectItem value="BC/MBC">BC/MBC</SelectItem><SelectItem value="First Graduate">First Graduate</SelectItem><SelectItem value="Sports">Sports</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input {...field} placeholder="25000" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="academicYear" render={({ field }) => (<FormItem><FormLabel>Academic Year</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="awardDate" render={({ field }) => (<FormItem><FormLabel>Award Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="remarks" render={({ field }) => (<FormItem><FormLabel>Remarks</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={createMutation.isPending}>Create</Button></DialogFooter>
            </form></Form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <p>Loading...</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Scholarship</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Year</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
            <TableBody>{scholarships?.map(sch => (
              <TableRow key={sch.id}>
                <TableCell>{getStudentName(sch.studentId)}</TableCell>
                <TableCell>{sch.scholarshipName}</TableCell>
                <TableCell>{sch.type}</TableCell>
                <TableCell>₹{Number(sch.amount).toLocaleString('en-IN')}</TableCell>
                <TableCell>{sch.academicYear}</TableCell>
                <TableCell><Badge variant={sch.status === 'Approved' ? 'default' : sch.status === 'Rejected' ? 'destructive' : 'secondary'}>{sch.status}</Badge></TableCell>
                <TableCell>{sch.status === 'Applied' && <Button size="sm" variant="outline" onClick={() => approve(sch)}>Approve</Button>}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
