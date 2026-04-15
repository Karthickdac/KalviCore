import { useState } from "react";
import { useListStaff, useCreateStaff, useUpdateStaff, useDeleteStaff, getListStaffQueryKey, useListDepartments } from "@workspace/api-client-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().optional().nullable(),
  departmentId: z.coerce.number().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  qualification: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  experience: z.coerce.number().optional().nullable(),
  joiningDate: z.string().min(1, "Joining date is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  salary: z.coerce.number().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.string().default("Active"),
});

export default function Staff() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const { data: staff, isLoading } = useListStaff({ search: search || undefined, departmentId: deptFilter && deptFilter !== "all" ? Number(deptFilter) : undefined });
  const { data: departments } = useListDepartments();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff</h2>
          <p className="text-muted-foreground">Manage faculty and staff members.</p>
        </div>
        <StaffDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" data-testid="input-search-staff" />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
              ) : staff?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No staff found.</TableCell></TableRow>
              ) : (
                staff?.map((s) => (
                  <TableRow key={s.id} data-testid={`row-staff-${s.id}`}>
                    <TableCell className="font-medium">{s.staffId}</TableCell>
                    <TableCell>{s.firstName} {s.lastName}</TableCell>
                    <TableCell>{s.designation}</TableCell>
                    <TableCell className="text-sm">{s.qualification || '-'}</TableCell>
                    <TableCell>{s.experience ? `${s.experience} yrs` : '-'}</TableCell>
                    <TableCell><Badge variant="outline">{s.employmentType}</Badge></TableCell>
                    <TableCell><Badge variant={s.status === "Active" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <StaffDialog staffMember={s} open={editingId === s.id} onOpenChange={(open: boolean) => setEditingId(open ? s.id : null)} trigger={<Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button>} />
                        <DeleteStaffButton id={s.id} name={`${s.firstName} ${s.lastName}`} />
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

function StaffDialog({ staffMember, open, onOpenChange, trigger }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const { data: departments } = useListDepartments();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staffId: staffMember?.staffId || "",
      firstName: staffMember?.firstName || "",
      lastName: staffMember?.lastName || "",
      email: staffMember?.email || "",
      phone: staffMember?.phone || "",
      gender: staffMember?.gender || "Male",
      dateOfBirth: staffMember?.dateOfBirth || "",
      departmentId: staffMember?.departmentId || 0,
      designation: staffMember?.designation || "Assistant Professor",
      qualification: staffMember?.qualification || "",
      specialization: staffMember?.specialization || "",
      experience: staffMember?.experience || null,
      joiningDate: staffMember?.joiningDate || new Date().toISOString().split('T')[0],
      employmentType: staffMember?.employmentType || "Regular",
      salary: staffMember?.salary || null,
      address: staffMember?.address || "",
      status: staffMember?.status || "Active",
    },
  });

  const onSubmit = (data: any) => {
    const cleanData = { ...data, email: data.email || null, phone: data.phone || null, dateOfBirth: data.dateOfBirth || null, qualification: data.qualification || null, specialization: data.specialization || null, experience: data.experience || null, salary: data.salary || null, address: data.address || null };
    const mutation = staffMember ? updateMutation : createMutation;
    const payload = staffMember ? { id: staffMember.id, data: cleanData } : { data: cleanData };
    mutation.mutate(payload as any, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() }); toast({ title: `Staff ${staffMember ? 'updated' : 'added'} successfully` }); onOpenChange(false); form.reset(); },
      onError: () => toast({ title: "Error saving staff", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger || <Button data-testid="button-add-staff"><Plus className="w-4 h-4 mr-2" /> Add Staff</Button>}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader><DialogTitle>{staffMember ? 'Edit' : 'Add'} Staff</DialogTitle></DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <FormField control={form.control} name="staffId" render={({ field }) => (<FormItem><FormLabel>Staff ID *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="departmentId" render={({ field }) => (<FormItem><FormLabel>Department *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{departments?.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="designation" render={({ field }) => (<FormItem><FormLabel>Designation *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Professor">Professor</SelectItem><SelectItem value="Associate Professor">Associate Professor</SelectItem><SelectItem value="Assistant Professor">Assistant Professor</SelectItem><SelectItem value="Lab Assistant">Lab Assistant</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="qualification" render={({ field }) => (<FormItem><FormLabel>Qualification</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="specialization" render={({ field }) => (<FormItem><FormLabel>Specialization</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="experience" render={({ field }) => (<FormItem><FormLabel>Experience (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="joiningDate" render={({ field }) => (<FormItem><FormLabel>Joining Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="employmentType" render={({ field }) => (<FormItem><FormLabel>Employment Type *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Regular">Regular</SelectItem><SelectItem value="Contract">Contract</SelectItem><SelectItem value="Guest">Guest Faculty</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="salary" render={({ field }) => (<FormItem><FormLabel>Salary</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="On Leave">On Leave</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="address" render={({ field }) => (<FormItem className="col-span-3"><FormLabel>Address</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save</Button></DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function DeleteStaffButton({ id, name }: { id: number; name: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteStaff();
  const handleDelete = () => {
    if (confirm(`Delete staff member ${name}?`)) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() }); toast({ title: "Staff deleted" }); },
        onError: () => toast({ title: "Error deleting staff", variant: "destructive" }),
      });
    }
  };
  return <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>;
}
