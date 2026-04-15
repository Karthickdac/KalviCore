import { useState } from "react";
import { useListAssignments, useCreateAssignment, useDeleteAssignment, useListAssignmentSubmissions, useCreateAssignmentSubmission, useUpdateAssignmentSubmission, useListSubjects, useListStaff, useListStudents, getListAssignmentsQueryKey, getListAssignmentSubmissionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Plus, ClipboardList, FileCheck, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Assignments() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Assignments</h2><p className="text-muted-foreground">Manage assignments, submissions, and grading.</p></div>
      <Tabs defaultValue="assignments">
        <TabsList><TabsTrigger value="assignments"><ClipboardList className="w-4 h-4 mr-1" />Assignments</TabsTrigger><TabsTrigger value="submissions"><FileCheck className="w-4 h-4 mr-1" />Submissions</TabsTrigger></TabsList>
        <TabsContent value="assignments"><AssignmentList /></TabsContent>
        <TabsContent value="submissions"><SubmissionList /></TabsContent>
      </Tabs>
    </div>
  );
}

function AssignmentList() {
  const { data: assignments, isLoading } = useListAssignments();
  const { data: subjects } = useListSubjects();
  const { data: staff } = useListStaff();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateAssignment();
  const deleteM = useDeleteAssignment();
  const form = useForm({ defaultValues: { title: "", description: "", subjectId: 0, staffId: 0, maxMarks: 20, dueDate: "", type: "Assignment", status: "Active" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListAssignmentsQueryKey() }); toast({ title: "Assignment created" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getSubjectName = (id: number) => subjects?.find(s => s.id === id)?.name || '-';
  const getStaffName = (id: number) => { const s = staff?.find(st => st.id === id); return s ? `${s.firstName} ${s.lastName}` : '-'; };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Assignments</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Create Assignment</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="subjectId" render={({ field }) => (<FormItem><FormLabel>Subject *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{subjects?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.code} - {s.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="staffId" render={({ field }) => (<FormItem><FormLabel>Staff *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{staff?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Assignment">Assignment</SelectItem><SelectItem value="Internal">Internal Assessment</SelectItem><SelectItem value="Lab">Lab Record</SelectItem><SelectItem value="Project">Project</SelectItem><SelectItem value="Seminar">Seminar</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="maxMarks" render={({ field }) => (<FormItem><FormLabel>Max Marks</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="dueDate" render={({ field }) => (<FormItem><FormLabel>Due Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Create</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Subject</TableHead><TableHead>Staff</TableHead><TableHead>Type</TableHead><TableHead>Max Marks</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow> : assignments?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No assignments.</TableCell></TableRow> : assignments?.map(a => (
            <TableRow key={a.id}><TableCell className="font-medium">{a.title}</TableCell><TableCell>{getSubjectName(a.subjectId)}</TableCell><TableCell>{getStaffName(a.staffId)}</TableCell><TableCell><Badge variant="secondary">{a.type}</Badge></TableCell><TableCell>{a.maxMarks}</TableCell><TableCell>{a.dueDate}</TableCell><TableCell><Badge variant={a.status === 'Active' ? 'default' : 'secondary'}>{a.status}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: a.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListAssignmentsQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}

function SubmissionList() {
  const { data: assignments } = useListAssignments();
  const [assignFilter, setAssignFilter] = useState("");
  const { data: submissions, isLoading } = useListAssignmentSubmissions(assignFilter && assignFilter !== "all" ? { assignmentId: Number(assignFilter) } : undefined);
  const { data: students } = useListStudents();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateAssignmentSubmission();
  const updateM = useUpdateAssignmentSubmission();
  const form = useForm({ defaultValues: { assignmentId: 0, studentId: 0, submissionDate: new Date().toISOString().split('T')[0], isLate: "No" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListAssignmentSubmissionsQueryKey() }); toast({ title: "Submission recorded" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.rollNumber} - ${s.firstName}` : '-'; };
  const getAssignmentTitle = (id: number) => assignments?.find(a => a.id === id)?.title || '-';
  const getMaxMarks = (id: number) => assignments?.find(a => a.id === id)?.maxMarks || 0;
  const handleGrade = (sub: any) => {
    const marks = prompt(`Enter marks (max ${getMaxMarks(sub.assignmentId)}):`);
    if (marks) {
      const m = Number(marks);
      const pct = (m / getMaxMarks(sub.assignmentId)) * 100;
      const grade = pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B+' : pct >= 50 ? 'B' : pct >= 40 ? 'C' : 'F';
      updateM.mutate({ id: sub.id, data: { marksObtained: m, grade, status: 'Graded' } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListAssignmentSubmissionsQueryKey() }) });
    }
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3"><CardTitle>Submissions</CardTitle>
          <Select value={assignFilter} onValueChange={setAssignFilter}><SelectTrigger className="w-[200px]"><SelectValue placeholder="All Assignments" /></SelectTrigger><SelectContent><SelectItem value="all">All Assignments</SelectItem>{assignments?.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.title}</SelectItem>)}</SelectContent></Select>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Record Submission</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Record Submission</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="assignmentId" render={({ field }) => (<FormItem><FormLabel>Assignment *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{assignments?.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.title}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="submissionDate" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="isLate" render={({ field }) => (<FormItem><FormLabel>Late?</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent></Select></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Record</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Assignment</TableHead><TableHead>Student</TableHead><TableHead>Date</TableHead><TableHead>Late</TableHead><TableHead>Marks</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow> : submissions?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No submissions.</TableCell></TableRow> : submissions?.map(s => (
            <TableRow key={s.id}><TableCell className="font-medium">{getAssignmentTitle(s.assignmentId)}</TableCell><TableCell>{getStudentName(s.studentId)}</TableCell><TableCell>{s.submissionDate}</TableCell><TableCell>{s.isLate === 'Yes' ? <Badge variant="destructive">Yes</Badge> : 'No'}</TableCell><TableCell>{s.marksObtained !== null && s.marksObtained !== undefined ? `${s.marksObtained}/${getMaxMarks(s.assignmentId)}` : '-'}</TableCell><TableCell>{s.grade ? <Badge>{s.grade}</Badge> : '-'}</TableCell><TableCell><Badge variant={s.status === 'Graded' ? 'default' : 'secondary'}>{s.status}</Badge></TableCell><TableCell>{s.status !== 'Graded' && <Button variant="outline" size="sm" onClick={() => handleGrade(s)}>Grade</Button>}</TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}
