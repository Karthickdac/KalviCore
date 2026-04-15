import { useState } from "react";
import { useListSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject, getListSubjectsQueryKey, useListCourses, useListStaff } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  courseId: z.coerce.number().min(1, "Course is required"),
  semester: z.coerce.number().min(1).max(8),
  credits: z.coerce.number().min(1).max(10),
  type: z.string().min(1, "Type is required"),
  staffId: z.coerce.number().optional().nullable(),
});

export default function Subjects() {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const { data: subjects, isLoading } = useListSubjects({ courseId: courseFilter && courseFilter !== "all" ? Number(courseFilter) : undefined });
  const { data: courses } = useListCourses();
  const { data: staff } = useListStaff();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filtered = subjects?.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()));
  const getCourseName = (id: number) => courses?.find(c => c.id === id)?.code || '-';
  const getStaffName = (id: number | null) => { if (!id) return '-'; const s = staff?.find(st => st.id === id); return s ? `${s.firstName} ${s.lastName}` : '-'; };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold tracking-tight">Subjects</h2><p className="text-muted-foreground">Manage subjects and curriculum.</p></div>
        <SubjectDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2"><Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Search subjects..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" /></div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Courses" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Courses</SelectItem>{courses?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.code}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Course</TableHead><TableHead>Semester</TableHead><TableHead>Credits</TableHead><TableHead>Type</TableHead><TableHead>Staff</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? (<TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>) : filtered?.length === 0 ? (<TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No subjects found.</TableCell></TableRow>) : (
                filtered?.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.code}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{getCourseName(s.courseId)}</TableCell>
                    <TableCell>{s.semester}</TableCell>
                    <TableCell>{s.credits}</TableCell>
                    <TableCell><Badge variant={s.type === 'Lab' ? 'secondary' : s.type === 'Elective' ? 'outline' : 'default'}>{s.type}</Badge></TableCell>
                    <TableCell className="text-sm">{getStaffName(s.staffId)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <SubjectDialog subject={s} open={editingId === s.id} onOpenChange={(open: boolean) => setEditingId(open ? s.id : null)} trigger={<Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button>} />
                        <DeleteSubjectButton id={s.id} name={s.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SubjectDialog({ subject, open, onOpenChange, trigger }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const { data: courses } = useListCourses();
  const { data: staff } = useListStaff();

  const form = useForm({ resolver: zodResolver(formSchema), defaultValues: { name: subject?.name || "", code: subject?.code || "", courseId: subject?.courseId || 0, semester: subject?.semester || 1, credits: subject?.credits || 3, type: subject?.type || "Theory", staffId: subject?.staffId || null } });

  const onSubmit = (data: any) => {
    const cleanData = { ...data, staffId: data.staffId || null };
    const mutation = subject ? updateMutation : createMutation;
    const payload = subject ? { id: subject.id, data: cleanData } : { data: cleanData };
    mutation.mutate(payload as any, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSubjectsQueryKey() }); toast({ title: `Subject ${subject ? 'updated' : 'created'}` }); onOpenChange(false); form.reset(); },
      onError: () => toast({ title: "Error saving subject", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger || <Button><Plus className="w-4 h-4 mr-2" /> Add Subject</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{subject ? 'Edit' : 'Add'} Subject</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>Code *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="courseId" render={({ field }) => (<FormItem><FormLabel>Course *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{courses?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="semester" render={({ field }) => (<FormItem><FormLabel>Semester *</FormLabel><FormControl><Input type="number" min={1} max={8} {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="credits" render={({ field }) => (<FormItem><FormLabel>Credits *</FormLabel><FormControl><Input type="number" min={1} max={10} {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Theory">Theory</SelectItem><SelectItem value="Lab">Lab</SelectItem><SelectItem value="Elective">Elective</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="staffId" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Assigned Staff</FormLabel><Select onValueChange={(v) => field.onChange(v === "none" ? null : Number(v))} value={field.value ? String(field.value) : "none"}><FormControl><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">Unassigned</SelectItem>{staff?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName} ({s.designation})</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <DialogFooter><Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteSubjectButton({ id, name }: { id: number; name: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteSubject();
  const handleDelete = () => { if (confirm(`Delete subject ${name}?`)) { deleteMutation.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSubjectsQueryKey() }); toast({ title: "Subject deleted" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); } };
  return <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>;
}
