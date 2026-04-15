import { useState } from "react";
import { useListCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, getListCoursesQueryKey, useListDepartments } from "@workspace/api-client-react";
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
  departmentId: z.coerce.number().min(1, "Department is required"),
  duration: z.coerce.number().min(1).max(6),
  degree: z.string().min(1, "Degree is required"),
  regulation: z.string().min(1, "Regulation is required"),
  affiliatedUniversity: z.string().min(1, "University is required"),
  totalSemesters: z.coerce.number().min(1).max(12),
});

export default function Courses() {
  const [search, setSearch] = useState("");
  const { data: courses, isLoading } = useListCourses();
  const { data: departments } = useListDepartments();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filtered = courses?.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()));
  const getDeptName = (id: number) => departments?.find(d => d.id === id)?.name || '-';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">Manage academic courses and programs.</p>
        </div>
        <CourseDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2"><Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" /></div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Degree</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Regulation</TableHead>
                <TableHead>University</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (<TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>) : filtered?.length === 0 ? (<TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No courses found.</TableCell></TableRow>) : (
                filtered?.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.code}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell><Badge variant="outline">{c.degree}</Badge></TableCell>
                    <TableCell className="text-sm">{getDeptName(c.departmentId)}</TableCell>
                    <TableCell>{c.duration} yrs / {c.totalSemesters} sem</TableCell>
                    <TableCell>{c.regulation}</TableCell>
                    <TableCell className="text-sm">{c.affiliatedUniversity}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <CourseDialog course={c} open={editingId === c.id} onOpenChange={(open: boolean) => setEditingId(open ? c.id : null)} trigger={<Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button>} />
                        <DeleteCourseButton id={c.id} name={c.name} />
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

function CourseDialog({ course, open, onOpenChange, trigger }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const { data: departments } = useListDepartments();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: course?.name || "", code: course?.code || "", departmentId: course?.departmentId || 0, duration: course?.duration || 3, degree: course?.degree || "B.Sc", regulation: course?.regulation || "Regulation 2021", affiliatedUniversity: course?.affiliatedUniversity || "Madurai Kamaraj University", totalSemesters: course?.totalSemesters || 6 },
  });

  const onSubmit = (data: any) => {
    const mutation = course ? updateMutation : createMutation;
    const payload = course ? { id: course.id, data } : { data };
    mutation.mutate(payload as any, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() }); toast({ title: `Course ${course ? 'updated' : 'created'}` }); onOpenChange(false); form.reset(); },
      onError: () => toast({ title: "Error saving course", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger || <Button><Plus className="w-4 h-4 mr-2" /> Add Course</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{course ? 'Edit' : 'Add'} Course</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>Code *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="departmentId" render={({ field }) => (<FormItem><FormLabel>Department *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{departments?.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="degree" render={({ field }) => (<FormItem><FormLabel>Degree *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="B.A.">B.A.</SelectItem><SelectItem value="B.Sc">B.Sc</SelectItem><SelectItem value="B.Com">B.Com</SelectItem><SelectItem value="B.C.A">B.C.A</SelectItem><SelectItem value="M.A.">M.A.</SelectItem><SelectItem value="M.Sc">M.Sc</SelectItem><SelectItem value="M.Com">M.Com</SelectItem><SelectItem value="M.C.A">M.C.A</SelectItem><SelectItem value="M.Phil">M.Phil</SelectItem><SelectItem value="Ph.D">Ph.D</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="duration" render={({ field }) => (<FormItem><FormLabel>Duration (years) *</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="totalSemesters" render={({ field }) => (<FormItem><FormLabel>Total Semesters *</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="regulation" render={({ field }) => (<FormItem><FormLabel>Regulation *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="affiliatedUniversity" render={({ field }) => (<FormItem><FormLabel>Affiliated University *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Madurai Kamaraj University">Madurai Kamaraj University</SelectItem><SelectItem value="Bharathidasan University">Bharathidasan University</SelectItem><SelectItem value="Bharathiar University">Bharathiar University</SelectItem><SelectItem value="Anna University">Anna University</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <DialogFooter><Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCourseButton({ id, name }: { id: number; name: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteCourse();
  const handleDelete = () => {
    if (confirm(`Delete course ${name}?`)) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() }); toast({ title: "Course deleted" }); },
        onError: () => toast({ title: "Error deleting course", variant: "destructive" }),
      });
    }
  };
  return <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>;
}
