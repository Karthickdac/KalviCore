import { useState } from "react";
import { useListHostels, useCreateHostel, useListHostelRooms, useCreateHostelRoom, useListHostelAllocations, useCreateHostelAllocation, useListHostelComplaints, useCreateHostelComplaint, useUpdateHostelComplaint, getListHostelsQueryKey, getListHostelRoomsQueryKey, getListHostelAllocationsQueryKey, getListHostelComplaintsQueryKey, useListStudents, useDeleteHostel, useUpdateHostel } from "@workspace/api-client-react";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, BedDouble, Users, AlertTriangle, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Hostels() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Hostel Management</h2><p className="text-muted-foreground">Manage hostels, rooms, allocations, and complaints.</p></div>
      <Tabs defaultValue="hostels">
        <TabsList><TabsTrigger value="hostels"><Building2 className="w-4 h-4 mr-1" />Hostels</TabsTrigger><TabsTrigger value="rooms"><BedDouble className="w-4 h-4 mr-1" />Rooms</TabsTrigger><TabsTrigger value="allocations"><Users className="w-4 h-4 mr-1" />Allocations</TabsTrigger><TabsTrigger value="complaints"><AlertTriangle className="w-4 h-4 mr-1" />Complaints</TabsTrigger></TabsList>
        <TabsContent value="hostels"><HostelList /></TabsContent>
        <TabsContent value="rooms"><RoomList /></TabsContent>
        <TabsContent value="allocations"><AllocationList /></TabsContent>
        <TabsContent value="complaints"><ComplaintList /></TabsContent>
      </Tabs>
    </div>
  );
}

function HostelList() {
  const { data: hostels, isLoading } = useListHostels();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateHostel();
  const deleteM = useDeleteHostel();
  const form = useForm({ defaultValues: { name: "", type: "Boys", totalBlocks: 1, totalRooms: 0, wardenName: "", wardenPhone: "", address: "", facilities: "", status: "Active" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListHostelsQueryKey() }); toast({ title: "Hostel created" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hostels</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Hostel</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Hostel</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Boys">Boys</SelectItem><SelectItem value="Girls">Girls</SelectItem><SelectItem value="Co-Ed">Co-Ed</SelectItem></SelectContent></Select></FormItem>)} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="totalBlocks" render={({ field }) => (<FormItem><FormLabel>Blocks</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="totalRooms" render={({ field }) => (<FormItem><FormLabel>Rooms</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
              </div>
              <FormField control={form.control} name="wardenName" render={({ field }) => (<FormItem><FormLabel>Warden Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="wardenPhone" render={({ field }) => (<FormItem><FormLabel>Warden Phone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Blocks</TableHead><TableHead>Rooms</TableHead><TableHead>Warden</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow> : hostels?.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No hostels found.</TableCell></TableRow> : hostels?.map(h => (
            <TableRow key={h.id}><TableCell className="font-medium">{h.name}</TableCell><TableCell><Badge variant={h.type === 'Boys' ? 'default' : 'secondary'}>{h.type}</Badge></TableCell><TableCell>{h.totalBlocks}</TableCell><TableCell>{h.totalRooms}</TableCell><TableCell>{h.wardenName || '-'}</TableCell><TableCell><Badge variant={h.status === 'Active' ? 'default' : 'destructive'}>{h.status}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: h.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListHostelsQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RoomList() {
  const { data: hostels } = useListHostels();
  const [hostelFilter, setHostelFilter] = useState("");
  const { data: rooms, isLoading } = useListHostelRooms(hostelFilter && hostelFilter !== "all" ? { hostelId: Number(hostelFilter) } : undefined);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateHostelRoom();
  const form = useForm({ defaultValues: { hostelId: 0, roomNumber: "", floor: 0, block: "", roomType: "Single", capacity: 1, amenities: "", status: "Available" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListHostelRoomsQueryKey() }); toast({ title: "Room created" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3"><CardTitle>Rooms</CardTitle>
          <Select value={hostelFilter} onValueChange={setHostelFilter}><SelectTrigger className="w-[200px]"><SelectValue placeholder="All Hostels" /></SelectTrigger><SelectContent><SelectItem value="all">All Hostels</SelectItem>{hostels?.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Room</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="hostelId" render={({ field }) => (<FormItem><FormLabel>Hostel *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{hostels?.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="roomNumber" render={({ field }) => (<FormItem><FormLabel>Room No *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="roomType" render={({ field }) => (<FormItem><FormLabel>Type *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Double">Double</SelectItem><SelectItem value="Triple">Triple</SelectItem><SelectItem value="Dormitory">Dormitory</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="floor" render={({ field }) => (<FormItem><FormLabel>Floor</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="capacity" render={({ field }) => (<FormItem><FormLabel>Capacity</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="block" render={({ field }) => (<FormItem><FormLabel>Block</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Room No</TableHead><TableHead>Type</TableHead><TableHead>Floor</TableHead><TableHead>Block</TableHead><TableHead>Capacity</TableHead><TableHead>Occupancy</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow> : rooms?.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No rooms found.</TableCell></TableRow> : rooms?.map(r => (
            <TableRow key={r.id}><TableCell className="font-medium">{r.roomNumber}</TableCell><TableCell>{r.roomType}</TableCell><TableCell>{r.floor}</TableCell><TableCell>{r.block || '-'}</TableCell><TableCell>{r.capacity}</TableCell><TableCell>{r.occupancy}/{r.capacity}</TableCell><TableCell><Badge variant={r.status === 'Available' ? 'default' : r.status === 'Occupied' ? 'secondary' : 'destructive'}>{r.status}</Badge></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AllocationList() {
  const { data: allocations, isLoading } = useListHostelAllocations();
  const { data: students } = useListStudents();
  const { data: hostels } = useListHostels();
  const { data: rooms } = useListHostelRooms();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateHostelAllocation();
  const form = useForm({ defaultValues: { studentId: 0, hostelId: 0, roomId: 0, academicYear: "2024-2025", allocationDate: new Date().toISOString().split('T')[0], messType: "Veg", status: "Active" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListHostelAllocationsQueryKey() }); toast({ title: "Allocation created" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.rollNumber} - ${s.firstName}` : '-'; };
  const getHostelName = (id: number) => hostels?.find(h => h.id === id)?.name || '-';
  const getRoomNumber = (id: number) => rooms?.find(r => r.id === id)?.roomNumber || '-';
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Allocations</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Allocate</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Allocate Room</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="hostelId" render={({ field }) => (<FormItem><FormLabel>Hostel *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{hostels?.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="roomId" render={({ field }) => (<FormItem><FormLabel>Room *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{rooms?.filter(r => r.status === 'Available').map(r => <SelectItem key={r.id} value={String(r.id)}>{r.roomNumber} ({r.roomType})</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="messType" render={({ field }) => (<FormItem><FormLabel>Mess Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Veg">Veg</SelectItem><SelectItem value="Non-Veg">Non-Veg</SelectItem><SelectItem value="Special">Special</SelectItem></SelectContent></Select></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Allocate</Button></DialogFooter>
            </form></Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Hostel</TableHead><TableHead>Room</TableHead><TableHead>Year</TableHead><TableHead>Mess</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow> : allocations?.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No allocations.</TableCell></TableRow> : allocations?.map(a => (
            <TableRow key={a.id}><TableCell>{getStudentName(a.studentId)}</TableCell><TableCell>{getHostelName(a.hostelId)}</TableCell><TableCell>{getRoomNumber(a.roomId)}</TableCell><TableCell>{a.academicYear}</TableCell><TableCell>{a.messType || '-'}</TableCell><TableCell><Badge variant={a.status === 'Active' ? 'default' : 'secondary'}>{a.status}</Badge></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ComplaintList() {
  const { data: complaints, isLoading } = useListHostelComplaints();
  const { data: students } = useListStudents();
  const { data: hostels } = useListHostels();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateHostelComplaint();
  const updateM = useUpdateHostelComplaint();
  const form = useForm({ defaultValues: { studentId: 0, hostelId: 0, category: "Maintenance", subject: "", description: "", priority: "Medium" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListHostelComplaintsQueryKey() }); toast({ title: "Complaint filed" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.firstName} ${s.lastName}` : '-'; };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Complaints</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />File Complaint</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>File Complaint</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="hostelId" render={({ field }) => (<FormItem><FormLabel>Hostel *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{hostels?.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Electrical">Electrical</SelectItem><SelectItem value="Plumbing">Plumbing</SelectItem><SelectItem value="Mess">Mess</SelectItem><SelectItem value="Security">Security</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="subject" render={({ field }) => (<FormItem><FormLabel>Subject *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel>Priority</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Critical">Critical</SelectItem></SelectContent></Select></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Submit</Button></DialogFooter>
            </form></Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Category</TableHead><TableHead>Subject</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow> : complaints?.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No complaints.</TableCell></TableRow> : complaints?.map(c => (
            <TableRow key={c.id}><TableCell>{getStudentName(c.studentId)}</TableCell><TableCell>{c.category}</TableCell><TableCell>{c.subject}</TableCell><TableCell><Badge variant={c.priority === 'Critical' ? 'destructive' : c.priority === 'High' ? 'destructive' : 'secondary'}>{c.priority}</Badge></TableCell><TableCell><Badge variant={c.status === 'Resolved' ? 'default' : c.status === 'Open' ? 'destructive' : 'secondary'}>{c.status}</Badge></TableCell><TableCell>{c.status !== 'Resolved' && <Button variant="outline" size="sm" onClick={() => updateM.mutate({ id: c.id, data: { status: 'Resolved', resolvedDate: new Date().toISOString().split('T')[0] } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListHostelComplaintsQueryKey() }) })}>Resolve</Button>}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
