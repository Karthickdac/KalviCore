import { useState } from "react";
import { useListExams, useCreateExam, getListExamsQueryKey, useListExamResults, useRecordExamResults, getListExamResultsQueryKey, useListSubjects, useListStudents } from "@workspace/api-client-react";
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

export default function Exams() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Examinations</h2><p className="text-muted-foreground">Schedule exams and manage results.</p></div>
      <Tabs defaultValue="exams">
        <TabsList><TabsTrigger value="exams">Exam Schedule</TabsTrigger><TabsTrigger value="results">Results Entry</TabsTrigger></TabsList>
        <TabsContent value="exams"><ExamSchedule /></TabsContent>
        <TabsContent value="results"><ExamResults /></TabsContent>
      </Tabs>
    </div>
  );
}

const examSchema = z.object({
  subjectId: z.coerce.number().min(1),
  type: z.string().min(1),
  maxMarks: z.coerce.number().min(1),
  date: z.string().min(1),
  semester: z.coerce.number().min(1),
  academicYear: z.string().min(1),
});

function ExamSchedule() {
  const { data: exams, isLoading } = useListExams();
  const { data: subjects } = useListSubjects();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateExam();

  const getSubjectName = (id: number) => { const s = subjects?.find(sub => sub.id === id); return s ? `${s.code} - ${s.name}` : '-'; };

  const form = useForm({ resolver: zodResolver(examSchema), defaultValues: { subjectId: 0, type: "Internal", maxMarks: 50, date: new Date().toISOString().split('T')[0], semester: 1, academicYear: "2024-2025" } });

  const onSubmit = (data: any) => {
    createMutation.mutate({ data }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListExamsQueryKey() }); toast({ title: "Exam scheduled" }); setIsOpen(false); form.reset(); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Exam Schedule</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Schedule Exam</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule Exam</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="subjectId" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Subject *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{subjects?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.code} - {s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Internal">Internal</SelectItem><SelectItem value="External">External</SelectItem><SelectItem value="Supplementary">Supplementary</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="maxMarks" render={({ field }) => (<FormItem><FormLabel>Max Marks *</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="semester" render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="academicYear" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Academic Year</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                </div>
                <DialogFooter><Button type="submit" disabled={createMutation.isPending}>Schedule</Button></DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Type</TableHead><TableHead>Max Marks</TableHead><TableHead>Date</TableHead><TableHead>Semester</TableHead><TableHead>Year</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? (<TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>) : exams?.length === 0 ? (<TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No exams scheduled.</TableCell></TableRow>) : (
              exams?.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{getSubjectName(e.subjectId)}</TableCell>
                  <TableCell><Badge variant={e.type === 'Internal' ? 'default' : e.type === 'External' ? 'secondary' : 'outline'}>{e.type}</Badge></TableCell>
                  <TableCell>{e.maxMarks}</TableCell>
                  <TableCell>{e.date}</TableCell>
                  <TableCell>{e.semester}</TableCell>
                  <TableCell>{e.academicYear}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ExamResults() {
  const [examId, setExamId] = useState("");
  const { data: exams } = useListExams();
  const { data: subjects } = useListSubjects();
  const { data: students } = useListStudents();
  const { data: results } = useListExamResults({ examId: examId ? Number(examId) : undefined });
  const [resultRecords, setResultRecords] = useState<Record<number, { marks: number; grade: string; status: string }>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const recordMutation = useRecordExamResults();

  const getSubjectName = (id: number) => { const s = subjects?.find(sub => sub.id === id); return s ? `${s.code} - ${s.name}` : '-'; };
  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.rollNumber} - ${s.firstName}` : '-'; };

  const selectedExam = exams?.find(e => e.id === Number(examId));

  const handleRecordSubmit = () => {
    if (!examId) return;
    const entries = Object.entries(resultRecords).map(([sid, r]) => ({ studentId: Number(sid), marksObtained: r.marks, grade: r.grade || null, status: r.status }));
    if (entries.length === 0) { toast({ title: "Enter results for at least one student", variant: "destructive" }); return; }
    recordMutation.mutate({ data: { examId: Number(examId), results: entries } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListExamResultsQueryKey() }); toast({ title: "Results recorded" }); setResultRecords({}); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Results</CardTitle>
        <div className="flex gap-3 items-end">
          <div>
            <label className="text-sm font-medium">Select Exam</label>
            <Select value={examId} onValueChange={setExamId}>
              <SelectTrigger className="w-[350px]"><SelectValue placeholder="Select an exam" /></SelectTrigger>
              <SelectContent>{exams?.map(e => <SelectItem key={e.id} value={String(e.id)}>{getSubjectName(e.subjectId)} - {e.type} ({e.date})</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {examId && results && results.length > 0 ? (
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Marks</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{results.map(r => (
              <TableRow key={r.id}>
                <TableCell>{getStudentName(r.studentId)}</TableCell>
                <TableCell>{r.marksObtained} / {selectedExam?.maxMarks}</TableCell>
                <TableCell>{r.grade || '-'}</TableCell>
                <TableCell><Badge variant={r.status === 'Pass' ? 'default' : 'destructive'}>{r.status}</Badge></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        ) : examId ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">No results recorded yet. Enter marks below:</p>
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Marks (/{selectedExam?.maxMarks})</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {students?.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>{s.rollNumber} - {s.firstName} {s.lastName}</TableCell>
                    <TableCell><Input type="number" className="w-20" min={0} max={selectedExam?.maxMarks} value={resultRecords[s.id]?.marks ?? ''} onChange={(e) => setResultRecords(prev => ({ ...prev, [s.id]: { ...prev[s.id], marks: Number(e.target.value), grade: prev[s.id]?.grade || '', status: prev[s.id]?.status || 'Pass' } }))} /></TableCell>
                    <TableCell><Input className="w-16" value={resultRecords[s.id]?.grade ?? ''} onChange={(e) => setResultRecords(prev => ({ ...prev, [s.id]: { ...prev[s.id], marks: prev[s.id]?.marks || 0, grade: e.target.value, status: prev[s.id]?.status || 'Pass' } }))} /></TableCell>
                    <TableCell>
                      <Select value={resultRecords[s.id]?.status || 'Pass'} onValueChange={(v) => setResultRecords(prev => ({ ...prev, [s.id]: { ...prev[s.id], marks: prev[s.id]?.marks || 0, grade: prev[s.id]?.grade || '', status: v } }))}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Pass">Pass</SelectItem><SelectItem value="Fail">Fail</SelectItem><SelectItem value="Absent">Absent</SelectItem></SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={handleRecordSubmit} disabled={recordMutation.isPending}>Submit Results</Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Select an exam to view or enter results.</p>
        )}
      </CardContent>
    </Card>
  );
}
