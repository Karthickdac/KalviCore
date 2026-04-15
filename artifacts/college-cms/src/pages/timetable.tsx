import { useState } from "react";
import { useListTimetable, useCreateTimetableEntry, useDeleteTimetableEntry, useListDepartments, useListSubjects, useListStaff, getListTimetableQueryKey } from "@workspace/api-client-react";
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
import { Plus, Trash2, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Timetable() {
  const { data: departments } = useListDepartments();
  const { data: subjects } = useListSubjects();
  const { data: staff } = useListStaff();
  const [deptFilter, setDeptFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const params: any = {};
  if (deptFilter && deptFilter !== "all") params.departmentId = Number(deptFilter);
  if (semFilter && semFilter !== "all") params.semester = Number(semFilter);
  const { data: entries, isLoading } = useListTimetable(Object.keys(params).length > 0 ? params : undefined);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateTimetableEntry();
  const deleteM = useDeleteTimetableEntry();
  const form = useForm({ defaultValues: { departmentId: 0, semester: 1, dayOfWeek: "Monday", periodNumber: 1, startTime: "09:00", endTime: "09:50", subjectId: 0, staffId: 0, room: "", section: "A", academicYear: "2024-2025" } });
  const onSubmit = (data: any) => { const clean = { ...data, subjectId: data.subjectId || undefined, staffId: data.staffId || undefined }; createM.mutate({ data: clean }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListTimetableQueryKey() }); toast({ title: "Entry added" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getSubjectName = (id: number | null | undefined) => id ? subjects?.find(s => s.id === id)?.name || '-' : '-';
  const getStaffName = (id: number | null | undefined) => id ? staff?.find(s => s.id === id)?.firstName || '-' : '-';
  const getDeptName = (id: number) => departments?.find(d => d.id === id)?.name || '-';

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Timetable</h2><p className="text-muted-foreground">Department-wise class timetable management.</p></div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3"><CardTitle><Clock className="w-5 h-5 inline mr-2" />Timetable</CardTitle>
            <Select value={deptFilter} onValueChange={setDeptFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="All Depts" /></SelectTrigger><SelectContent><SelectItem value="all">All Departments</SelectItem>{departments?.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent></Select>
            <Select value={semFilter} onValueChange={setSemFilter}><SelectTrigger className="w-[120px]"><SelectValue placeholder="All Sem" /></SelectTrigger><SelectContent><SelectItem value="all">All Sem</SelectItem>{[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}</SelectContent></Select>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Entry</Button></DialogTrigger>
            <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Timetable Entry</DialogTitle></DialogHeader>
              <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="departmentId" render={({ field }) => (<FormItem><FormLabel>Department *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{departments?.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                  <FormField control={form.control} name="semester" render={({ field }) => (<FormItem><FormLabel>Semester *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                  <FormField control={form.control} name="dayOfWeek" render={({ field }) => (<FormItem><FormLabel>Day *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                  <FormField control={form.control} name="periodNumber" render={({ field }) => (<FormItem><FormLabel>Period *</FormLabel><FormControl><Input type="number" min={1} max={8} {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel>Start Time *</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="endTime" render={({ field }) => (<FormItem><FormLabel>End Time *</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="subjectId" render={({ field }) => (<FormItem><FormLabel>Subject</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{subjects?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.code} - {s.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                  <FormField control={form.control} name="staffId" render={({ field }) => (<FormItem><FormLabel>Staff</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{staff?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                  <FormField control={form.control} name="room" render={({ field }) => (<FormItem><FormLabel>Room</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="section" render={({ field }) => (<FormItem><FormLabel>Section</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                </div>
                <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
              </form></Form></DialogContent></Dialog>
        </CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Day</TableHead><TableHead>Period</TableHead><TableHead>Time</TableHead><TableHead>Subject</TableHead><TableHead>Staff</TableHead><TableHead>Room</TableHead><TableHead>Dept</TableHead><TableHead>Sem</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{isLoading ? <TableRow><TableCell colSpan={9} className="text-center">Loading...</TableCell></TableRow> : entries?.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No entries.</TableCell></TableRow> : entries?.sort((a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek) || a.periodNumber - b.periodNumber).map(e => (
              <TableRow key={e.id}><TableCell className="font-medium">{e.dayOfWeek}</TableCell><TableCell>{e.periodNumber}</TableCell><TableCell>{e.startTime} - {e.endTime}</TableCell><TableCell>{getSubjectName(e.subjectId)}</TableCell><TableCell>{getStaffName(e.staffId)}</TableCell><TableCell>{e.room || '-'}</TableCell><TableCell><Badge variant="secondary">{getDeptName(e.departmentId)}</Badge></TableCell><TableCell>{e.semester}</TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: e.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListTimetableQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
            ))}</TableBody></Table>
        </CardContent>
      </Card>
    </div>
  );
}
