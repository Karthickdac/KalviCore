import { useState } from "react";
import { useListSubjects, useListStudents, useMarkAttendance, useGetStudentAttendanceSummary, getListAttendanceQueryKey, getGetStudentAttendanceSummaryQueryKey, getGetAttendanceOverviewQueryKey, useListAttendanceCondonation, useCreateAttendanceCondonation, useUpdateAttendanceCondonation, getListAttendanceCondonationQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, XCircle, Plus, AlertTriangle } from "lucide-react";

export default function Attendance() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Attendance</h2><p className="text-muted-foreground">Mark and track student attendance.</p></div>
      <Tabs defaultValue="mark">
        <TabsList><TabsTrigger value="mark">Mark Attendance</TabsTrigger><TabsTrigger value="summary">Student Summary</TabsTrigger><TabsTrigger value="condonation">Condonation</TabsTrigger></TabsList>
        <TabsContent value="mark"><MarkAttendance /></TabsContent>
        <TabsContent value="summary"><StudentAttendanceSummary /></TabsContent>
        <TabsContent value="condonation"><CondonationRequests /></TabsContent>
      </Tabs>
    </div>
  );
}

function MarkAttendance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<Record<number, string>>({});
  const { data: subjects } = useListSubjects();
  const { data: students } = useListStudents();
  const markMutation = useMarkAttendance();

  const toggleStatus = (studentId: number) => {
    setRecords(prev => ({ ...prev, [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present' }));
  };

  const markAll = (status: string) => {
    if (!students) return;
    const newRecords: Record<number, string> = {};
    students.forEach(s => { newRecords[s.id] = status; });
    setRecords(newRecords);
  };

  const handleSubmit = () => {
    if (!subjectId) { toast({ title: "Select a subject", variant: "destructive" }); return; }
    const attendanceRecords = Object.entries(records).map(([id, status]) => ({ studentId: Number(id), status }));
    if (attendanceRecords.length === 0) { toast({ title: "Mark attendance for at least one student", variant: "destructive" }); return; }
    markMutation.mutate({ data: { subjectId: Number(subjectId), date, records: attendanceRecords } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAttendanceQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAttendanceOverviewQueryKey() });
        toast({ title: "Attendance marked successfully" });
        setRecords({});
      },
      onError: () => toast({ title: "Error marking attendance", variant: "destructive" }),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="w-[280px]"><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>{subjects?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.code} - {s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-[180px]" />
          </div>
          <Button variant="outline" onClick={() => markAll('Present')}>All Present</Button>
          <Button variant="outline" onClick={() => markAll('Absent')}>All Absent</Button>
          <Button onClick={handleSubmit} disabled={markMutation.isPending}>Submit Attendance</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Roll No</TableHead><TableHead>Name</TableHead><TableHead className="text-center">Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {students?.map(s => (
              <TableRow key={s.id} className="cursor-pointer" onClick={() => toggleStatus(s.id)}>
                <TableCell className="font-medium">{s.rollNumber}</TableCell>
                <TableCell>{s.firstName} {s.lastName}</TableCell>
                <TableCell className="text-center">
                  {records[s.id] === 'Present' ? (
                    <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Present</Badge>
                  ) : records[s.id] === 'Absent' ? (
                    <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Absent</Badge>
                  ) : (
                    <Badge variant="outline">Not Marked</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StudentAttendanceSummary() {
  const [studentId, setStudentId] = useState("");
  const { data: students } = useListStudents();
  const { data: summary } = useGetStudentAttendanceSummary(Number(studentId), { query: { enabled: !!studentId, queryKey: getGetStudentAttendanceSummaryQueryKey(Number(studentId)) } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Attendance Summary</CardTitle>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger className="w-[350px]"><SelectValue placeholder="Select a student" /></SelectTrigger>
          <SelectContent>{students?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName} {s.lastName}</SelectItem>)}</SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {studentId && summary ? (
          <Table>
            <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Total Classes</TableHead><TableHead>Present</TableHead><TableHead>Absent</TableHead><TableHead>Percentage</TableHead></TableRow></TableHeader>
            <TableBody>
              {summary.length === 0 ? (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No attendance records found.</TableCell></TableRow>) : (
                summary.map(s => (
                  <TableRow key={s.subjectId}>
                    <TableCell className="font-medium">{s.subjectName}</TableCell>
                    <TableCell>{s.totalClasses}</TableCell>
                    <TableCell className="text-green-600 font-medium">{s.present}</TableCell>
                    <TableCell className="text-red-600 font-medium">{s.absent}</TableCell>
                    <TableCell><Badge variant={s.percentage >= 75 ? 'default' : 'destructive'}>{s.percentage}%</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">Select a student to view attendance summary.</p>
        )}
      </CardContent>
    </Card>
  );
}

const condonationSchema = z.object({
  studentId: z.coerce.number().min(1),
  subjectId: z.coerce.number().min(1),
  semester: z.coerce.number().min(1).max(8),
  academicYear: z.string().min(1),
  currentPercentage: z.string().min(1),
  reason: z.string().min(1),
  supportingDocument: z.string().optional().nullable(),
  requestDate: z.string().min(1),
  status: z.string().default("Pending"),
});

function CondonationRequests() {
  const { data: requests, isLoading } = useListAttendanceCondonation();
  const { data: students } = useListStudents();
  const { data: subjects } = useListSubjects();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateAttendanceCondonation();
  const updateMutation = useUpdateAttendanceCondonation();

  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.firstName} ${s.lastName}` : '-'; };
  const getSubjectName = (id: number) => subjects?.find(s => s.id === id)?.name || '-';

  const form = useForm({ resolver: zodResolver(condonationSchema), defaultValues: { studentId: 0, subjectId: 0, semester: 1, academicYear: "2024-2025", currentPercentage: "", reason: "", supportingDocument: "", requestDate: new Date().toISOString().split('T')[0], status: "Pending" } });

  const onSubmit = (values: any) => {
    createMutation.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAttendanceCondonationQueryKey() });
        toast({ title: "Condonation request submitted" });
        setIsOpen(false);
        form.reset();
      },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  const handleApproval = (id: number, status: string) => {
    updateMutation.mutate({ id, data: { status, approvedBy: "Admin" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAttendanceCondonationQueryKey() });
        toast({ title: `Request ${status.toLowerCase()}` });
      },
    });
  };

  const belowThreshold = requests?.filter(r => Number(r.currentPercentage) < 75) || [];

  return (
    <div className="space-y-4">
      {belowThreshold.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-800">{belowThreshold.length} student(s) below 75% attendance threshold</span>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Condonation Requests</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Request</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request Attendance Condonation</DialogTitle></DialogHeader>
              <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student</FormLabel><Select onValueChange={field.onChange} value={String(field.value || "")}><FormControl><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => (<SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="subjectId" render={({ field }) => (<FormItem><FormLabel>Subject</FormLabel><Select onValueChange={field.onChange} value={String(field.value || "")}><FormControl><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger></FormControl><SelectContent>{subjects?.map(s => (<SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.code})</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="semester" render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="currentPercentage" render={({ field }) => (<FormItem><FormLabel>Current %</FormLabel><FormControl><Input {...field} placeholder="65" /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="academicYear" render={({ field }) => (<FormItem><FormLabel>Academic Year</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="reason" render={({ field }) => (<FormItem><FormLabel>Reason</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="requestDate" render={({ field }) => (<FormItem><FormLabel>Request Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <DialogFooter><Button type="submit" disabled={createMutation.isPending}>Submit</Button></DialogFooter>
              </form></Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? <p>Loading...</p> : requests?.length === 0 ? <p className="text-muted-foreground text-center py-8">No condonation requests.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Subject</TableHead><TableHead>Semester</TableHead><TableHead>Current %</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>{requests?.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{getStudentName(r.studentId)}</TableCell>
                  <TableCell>{getSubjectName(r.subjectId)}</TableCell>
                  <TableCell>{r.semester}</TableCell>
                  <TableCell><Badge variant={Number(r.currentPercentage) < 75 ? 'destructive' : 'default'}>{r.currentPercentage}%</Badge></TableCell>
                  <TableCell className="max-w-[200px] truncate">{r.reason}</TableCell>
                  <TableCell><Badge variant={r.status === 'Approved' ? 'default' : r.status === 'Rejected' ? 'destructive' : 'secondary'}>{r.status}</Badge></TableCell>
                  <TableCell className="space-x-1">
                    {r.status === 'Pending' && (<>
                      <Button size="sm" onClick={() => handleApproval(r.id, 'Approved')}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleApproval(r.id, 'Rejected')}>Reject</Button>
                    </>)}
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
