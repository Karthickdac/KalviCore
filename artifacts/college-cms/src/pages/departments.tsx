import React, { useState } from "react";
import { useListDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment, getListDepartmentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  hodName: z.string().optional().nullable(),
  established: z.coerce.number().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
});

export default function Departments() {
  const { data: departments, isLoading } = useListDepartments();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredDepartments = departments?.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">Manage college departments and HODs.</p>
        </div>
        <DepartmentDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search departments..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>HOD</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
              ) : filteredDepartments?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No departments found.</TableCell></TableRow>
              ) : (
                filteredDepartments?.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.code}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept.hodName || '-'}</TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div>{dept.email}</div>
                        <div>{dept.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <DepartmentDialog 
                          department={dept} 
                          open={editingId === dept.id} 
                          onOpenChange={(open: boolean) => setEditingId(open ? dept.id : null)}
                          trigger={<Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button>}
                        />
                        <DeleteDepartmentButton id={dept.id} name={dept.name} />
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

function DepartmentDialog({ department, open, onOpenChange, trigger }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: department?.name || "",
      code: department?.code || "",
      hodName: department?.hodName || "",
      established: department?.established || new Date().getFullYear(),
      phone: department?.phone || "",
      email: department?.email || "",
    },
  });

  const onSubmit = (data: any) => {
    const mutation = department ? updateMutation : createMutation;
    const payload = department ? { id: department.id, data } : { data };
    mutation.mutate(payload as any, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
        toast({ title: `Department ${department ? 'updated' : 'created'} successfully` });
        onOpenChange(false);
        form.reset();
      },
      onError: () => {
        toast({ title: "Error saving department", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button><Plus className="w-4 h-4 mr-2" /> Add Department</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{department ? 'Edit' : 'Add'} Department</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Code *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="hodName" render={({ field }) => (
                <FormItem><FormLabel>HOD Name</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="established" render={({ field }) => (
                <FormItem><FormLabel>Established Year</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDepartmentButton({ id, name }: { id: number, name: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteDepartment();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
          toast({ title: "Department deleted" });
        },
        onError: () => toast({ title: "Error deleting department", variant: "destructive" })
      });
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:bg-destructive/10">
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
