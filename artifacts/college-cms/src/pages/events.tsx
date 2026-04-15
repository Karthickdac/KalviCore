import { useState } from "react";
import { useListEvents, useCreateEvent, useDeleteEvent, useListEventParticipants, useCreateEventParticipant, useDeleteEventParticipant, useUpdateEventParticipant, useListStudents, useListDepartments, getListEventsQueryKey, getListEventParticipantsQueryKey } from "@workspace/api-client-react";
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
import { Plus, Calendar, Trophy, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Events() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Events & Cultural</h2><p className="text-muted-foreground">Manage events, participation, and achievements.</p></div>
      <Tabs defaultValue="events">
        <TabsList><TabsTrigger value="events"><Calendar className="w-4 h-4 mr-1" />Events</TabsTrigger><TabsTrigger value="participants"><Trophy className="w-4 h-4 mr-1" />Participants</TabsTrigger></TabsList>
        <TabsContent value="events"><EventList /></TabsContent>
        <TabsContent value="participants"><ParticipantList /></TabsContent>
      </Tabs>
    </div>
  );
}

function EventList() {
  const { data: events, isLoading } = useListEvents();
  const { data: departments } = useListDepartments();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateEvent();
  const deleteM = useDeleteEvent();
  const form = useForm({ defaultValues: { title: "", type: "Cultural", description: "", departmentId: 0, venue: "", startDate: "", endDate: "", coordinatorName: "", coordinatorPhone: "", maxParticipants: 0, budget: "", status: "Upcoming" } });
  const onSubmit = (data: any) => { const clean = { ...data, departmentId: data.departmentId || undefined, maxParticipants: data.maxParticipants || undefined }; createM.mutate({ data: clean }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListEventsQueryKey() }); toast({ title: "Event created" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getDeptName = (id: number | null | undefined) => id ? departments?.find(d => d.id === id)?.name || '-' : 'All';
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Events</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Event</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Cultural">Cultural</SelectItem><SelectItem value="Sports">Sports</SelectItem><SelectItem value="Technical">Technical</SelectItem><SelectItem value="Academic">Academic</SelectItem><SelectItem value="Workshop">Workshop</SelectItem><SelectItem value="Guest Lecture">Guest Lecture</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="venue" render={({ field }) => (<FormItem><FormLabel>Venue</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="coordinatorName" render={({ field }) => (<FormItem><FormLabel>Coordinator</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="maxParticipants" render={({ field }) => (<FormItem><FormLabel>Max Participants</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead>Venue</TableHead><TableHead>Coordinator</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow> : events?.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No events.</TableCell></TableRow> : events?.map(e => (
            <TableRow key={e.id}><TableCell className="font-medium">{e.title}</TableCell><TableCell><Badge variant="secondary">{e.type}</Badge></TableCell><TableCell>{e.startDate}{e.endDate ? ` - ${e.endDate}` : ''}</TableCell><TableCell>{e.venue || '-'}</TableCell><TableCell>{e.coordinatorName || '-'}</TableCell><TableCell><Badge variant={e.status === 'Upcoming' ? 'default' : e.status === 'Ongoing' ? 'secondary' : 'outline'}>{e.status}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: e.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListEventsQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}

function ParticipantList() {
  const { data: events } = useListEvents();
  const [eventFilter, setEventFilter] = useState("");
  const { data: participants, isLoading } = useListEventParticipants(eventFilter && eventFilter !== "all" ? { eventId: Number(eventFilter) } : undefined);
  const { data: students } = useListStudents();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateEventParticipant();
  const updateM = useUpdateEventParticipant();
  const form = useForm({ defaultValues: { eventId: 0, studentId: 0, role: "Participant", registrationDate: new Date().toISOString().split('T')[0], achievement: "" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListEventParticipantsQueryKey() }); toast({ title: "Registered" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.rollNumber} - ${s.firstName}` : '-'; };
  const getEventName = (id: number) => events?.find(e => e.id === id)?.title || '-';
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3"><CardTitle>Participants</CardTitle>
          <Select value={eventFilter} onValueChange={setEventFilter}><SelectTrigger className="w-[200px]"><SelectValue placeholder="All Events" /></SelectTrigger><SelectContent><SelectItem value="all">All Events</SelectItem>{events?.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.title}</SelectItem>)}</SelectContent></Select>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Register</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Register Participant</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="eventId" render={({ field }) => (<FormItem><FormLabel>Event *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{events?.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.title}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Participant">Participant</SelectItem><SelectItem value="Organizer">Organizer</SelectItem><SelectItem value="Volunteer">Volunteer</SelectItem><SelectItem value="Judge">Judge</SelectItem></SelectContent></Select></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Register</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Student</TableHead><TableHead>Role</TableHead><TableHead>Date</TableHead><TableHead>Achievement</TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow> : participants?.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No participants.</TableCell></TableRow> : participants?.map(p => (
            <TableRow key={p.id}><TableCell className="font-medium">{getEventName(p.eventId)}</TableCell><TableCell>{getStudentName(p.studentId)}</TableCell><TableCell><Badge variant="secondary">{p.role}</Badge></TableCell><TableCell>{p.registrationDate}</TableCell><TableCell>{p.achievement || <Button variant="outline" size="sm" onClick={() => { const a = prompt('Enter achievement (e.g., 1st Place)'); if (a) updateM.mutate({ id: p.id, data: { achievement: a } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListEventParticipantsQueryKey() }) }); }}>Add</Button>}</TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}
