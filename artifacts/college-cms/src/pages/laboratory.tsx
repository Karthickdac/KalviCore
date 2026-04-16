import { useState } from "react";
import { useListLaboratories, useCreateLaboratory, useDeleteLaboratory, useListLabEquipment, useCreateLabEquipment, useDeleteLabEquipment, useListLabSchedules, useCreateLabSchedule, useDeleteLabSchedule, useListDepartments, getListLaboratoriesQueryKey, getListLabEquipmentQueryKey, getListLabSchedulesQueryKey } from "@workspace/api-client-react";
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
import { Plus, FlaskConical, Cpu, CalendarClock, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function LaboratoryPage() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Laboratory Management</h2><p className="text-muted-foreground">Manage labs, equipment, and schedules.</p></div>
      <Tabs defaultValue="labs">
        <TabsList><TabsTrigger value="labs"><FlaskConical className="w-4 h-4 mr-1" />Laboratories</TabsTrigger><TabsTrigger value="equipment"><Cpu className="w-4 h-4 mr-1" />Equipment</TabsTrigger><TabsTrigger value="schedules"><CalendarClock className="w-4 h-4 mr-1" />Schedules</TabsTrigger></TabsList>
        <TabsContent value="labs"><LabList /></TabsContent>
        <TabsContent value="equipment"><EquipmentList /></TabsContent>
        <TabsContent value="schedules"><ScheduleList /></TabsContent>
      </Tabs>
    </div>
  );
}

function LabList() {
  const { data: labs, isLoading } = useListLaboratories();
  const { data: departments } = useListDepartments();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateLaboratory();
  const deleteM = useDeleteLaboratory();
  const form = useForm({ defaultValues: { name: "", code: "", departmentId: 0, location: "", capacity: 0, labType: "General", inchargeName: "", inchargePhone: "", status: "Active", remarks: "" } });
  const onSubmit = (data: any) => { const clean = { ...data, departmentId: data.departmentId || undefined, capacity: data.capacity || undefined }; createM.mutate({ data: clean }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListLaboratoriesQueryKey() }); toast({ title: "Laboratory added" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getDeptName = (id: number | null) => id ? departments?.find(d => d.id === id)?.name || '-' : '-';
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Laboratories</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Lab</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Laboratory</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Lab Name *</FormLabel><FormControl><Input {...field} placeholder="Physics Lab" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>Lab Code *</FormLabel><FormControl><Input {...field} placeholder="PHY-LAB-01" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="labType" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="General">General</SelectItem><SelectItem value="Computer">Computer</SelectItem><SelectItem value="Physics">Physics</SelectItem><SelectItem value="Chemistry">Chemistry</SelectItem><SelectItem value="Biology">Biology</SelectItem><SelectItem value="Electronics">Electronics</SelectItem><SelectItem value="Language">Language</SelectItem><SelectItem value="Research">Research</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="departmentId" render={({ field }) => (<FormItem><FormLabel>Department</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{departments?.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} placeholder="Block A, Room 101" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="capacity" render={({ field }) => (<FormItem><FormLabel>Capacity</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="inchargeName" render={({ field }) => (<FormItem><FormLabel>In-charge</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="inchargePhone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Department</TableHead><TableHead>Location</TableHead><TableHead>Capacity</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow> : labs?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No laboratories.</TableCell></TableRow> : labs?.map(l => (
            <TableRow key={l.id}><TableCell className="font-medium">{l.code}</TableCell><TableCell>{l.name}</TableCell><TableCell><Badge variant="secondary">{l.labType}</Badge></TableCell><TableCell>{getDeptName(l.departmentId ?? null)}</TableCell><TableCell>{l.location || '-'}</TableCell><TableCell>{l.capacity || '-'}</TableCell><TableCell><Badge>{l.status}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: l.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListLaboratoriesQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}

function EquipmentList() {
  const { data: equipment, isLoading } = useListLabEquipment();
  const { data: labs } = useListLaboratories();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateLabEquipment();
  const deleteM = useDeleteLabEquipment();
  const form = useForm({ defaultValues: { labId: 0, name: "", model: "", serialNumber: "", quantity: 1, condition: "Working", purchaseDate: "", vendor: "", cost: "", status: "Available" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListLabEquipmentQueryKey() }); toast({ title: "Equipment added" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getLabName = (id: number) => labs?.find(l => l.id === id)?.name || '-';
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Lab Equipment</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Equipment</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Equipment</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="labId" render={({ field }) => (<FormItem><FormLabel>Laboratory *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select lab" /></SelectTrigger></FormControl><SelectContent>{labs?.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="model" render={({ field }) => (<FormItem><FormLabel>Model</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="serialNumber" render={({ field }) => (<FormItem><FormLabel>Serial No</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Qty</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="condition" render={({ field }) => (<FormItem><FormLabel>Condition</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Working">Working</SelectItem><SelectItem value="Under Repair">Under Repair</SelectItem><SelectItem value="Damaged">Damaged</SelectItem><SelectItem value="Disposed">Disposed</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="vendor" render={({ field }) => (<FormItem><FormLabel>Vendor</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="cost" render={({ field }) => (<FormItem><FormLabel>Cost (Rs)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Lab</TableHead><TableHead>Name</TableHead><TableHead>Model</TableHead><TableHead>Serial No</TableHead><TableHead>Qty</TableHead><TableHead>Condition</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow> : equipment?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No equipment.</TableCell></TableRow> : equipment?.map(e => (
            <TableRow key={e.id}><TableCell>{getLabName(e.labId)}</TableCell><TableCell className="font-medium">{e.name}</TableCell><TableCell>{e.model || '-'}</TableCell><TableCell>{e.serialNumber || '-'}</TableCell><TableCell>{e.quantity}</TableCell><TableCell><Badge variant={e.condition === 'Working' ? 'default' : e.condition === 'Damaged' ? 'destructive' : 'secondary'}>{e.condition}</Badge></TableCell><TableCell><Badge>{e.status}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: e.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListLabEquipmentQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}

function ScheduleList() {
  const { data: schedules, isLoading } = useListLabSchedules();
  const { data: labs } = useListLaboratories();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateLabSchedule();
  const deleteM = useDeleteLabSchedule();
  const form = useForm({ defaultValues: { labId: 0, day: "Monday", startTime: "09:00", endTime: "10:00", subject: "", faculty: "", batch: "", semester: "" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListLabSchedulesQueryKey() }); toast({ title: "Schedule added" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getLabName = (id: number) => labs?.find(l => l.id === id)?.name || '-';
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Lab Schedules</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Schedule</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Lab Schedule</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="labId" render={({ field }) => (<FormItem><FormLabel>Laboratory *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select lab" /></SelectTrigger></FormControl><SelectContent>{labs?.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="day" render={({ field }) => (<FormItem><FormLabel>Day *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel>Start *</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="endTime" render={({ field }) => (<FormItem><FormLabel>End *</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="subject" render={({ field }) => (<FormItem><FormLabel>Subject</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="faculty" render={({ field }) => (<FormItem><FormLabel>Faculty</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="batch" render={({ field }) => (<FormItem><FormLabel>Batch</FormLabel><FormControl><Input {...field} placeholder="2024-A" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="semester" render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Lab</TableHead><TableHead>Day</TableHead><TableHead>Time</TableHead><TableHead>Subject</TableHead><TableHead>Faculty</TableHead><TableHead>Batch</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow> : schedules?.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No schedules.</TableCell></TableRow> : schedules?.map(s => (
            <TableRow key={s.id}><TableCell>{getLabName(s.labId)}</TableCell><TableCell className="font-medium">{s.day}</TableCell><TableCell>{s.startTime} - {s.endTime}</TableCell><TableCell>{s.subject || '-'}</TableCell><TableCell>{s.faculty || '-'}</TableCell><TableCell>{s.batch || '-'}</TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: s.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListLabSchedulesQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}
