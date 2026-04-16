import { useState } from "react";
import { useListSportsActivities, useCreateSportsActivity, useDeleteSportsActivity, useListSportsEnrollments, useCreateSportsEnrollment, useDeleteSportsEnrollment, useListSportsAchievements, useCreateSportsAchievement, useDeleteSportsAchievement, useListStudents, getListSportsActivitiesQueryKey, getListSportsEnrollmentsQueryKey, getListSportsAchievementsQueryKey } from "@workspace/api-client-react";
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
import { Plus, Trophy, Users, Medal, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = ["Sports", "NCC", "NSS", "YRC", "Cultural"];

export default function SportsNccPage() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Sports, NCC & NSS</h2><p className="text-muted-foreground">Manage sports activities, NCC/NSS programs, enrollments, and achievements.</p></div>
      <Tabs defaultValue="activities">
        <TabsList><TabsTrigger value="activities"><Trophy className="w-4 h-4 mr-1" />Activities</TabsTrigger><TabsTrigger value="enrollments"><Users className="w-4 h-4 mr-1" />Enrollments</TabsTrigger><TabsTrigger value="achievements"><Medal className="w-4 h-4 mr-1" />Achievements</TabsTrigger></TabsList>
        <TabsContent value="activities"><ActivityList /></TabsContent>
        <TabsContent value="enrollments"><EnrollmentList /></TabsContent>
        <TabsContent value="achievements"><AchievementList /></TabsContent>
      </Tabs>
    </div>
  );
}

function ActivityList() {
  const { data: activities, isLoading } = useListSportsActivities();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateSportsActivity();
  const deleteM = useDeleteSportsActivity();
  const form = useForm({ defaultValues: { name: "", category: "Sports", type: "Team", coach: "", venue: "", schedule: "", season: "", maxMembers: 0, description: "", status: "Active" } });
  const onSubmit = (data: any) => { const clean = { ...data, maxMembers: data.maxMembers || undefined }; createM.mutate({ data: clean }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListSportsActivitiesQueryKey() }); toast({ title: "Activity added" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const catColors: Record<string, string> = { Sports: "default", NCC: "secondary", NSS: "outline", YRC: "secondary", Cultural: "default" };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Activities & Programs</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Activity</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Activity</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} placeholder="Cricket, NCC Wing, NSS Unit" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Team">Team</SelectItem><SelectItem value="Individual">Individual</SelectItem><SelectItem value="Program">Program</SelectItem><SelectItem value="Unit">Unit</SelectItem><SelectItem value="Wing">Wing</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="coach" render={({ field }) => (<FormItem><FormLabel>Coach / Officer</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="venue" render={({ field }) => (<FormItem><FormLabel>Venue</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="schedule" render={({ field }) => (<FormItem><FormLabel>Schedule</FormLabel><FormControl><Input {...field} placeholder="Mon, Wed, Fri 4-6 PM" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="season" render={({ field }) => (<FormItem><FormLabel>Season</FormLabel><FormControl><Input {...field} placeholder="2024-25" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="maxMembers" render={({ field }) => (<FormItem><FormLabel>Max Members</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Type</TableHead><TableHead>Coach/Officer</TableHead><TableHead>Venue</TableHead><TableHead>Schedule</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow> : activities?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No activities.</TableCell></TableRow> : activities?.map(a => (
            <TableRow key={a.id}><TableCell className="font-medium">{a.name}</TableCell><TableCell><Badge variant={catColors[a.category] as any || "default"}>{a.category}</Badge></TableCell><TableCell>{a.type}</TableCell><TableCell>{a.coach || '-'}</TableCell><TableCell>{a.venue || '-'}</TableCell><TableCell>{a.schedule || '-'}</TableCell><TableCell><Badge>{a.status}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: a.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListSportsActivitiesQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}

function EnrollmentList() {
  const { data: enrollments, isLoading } = useListSportsEnrollments();
  const { data: activities } = useListSportsActivities();
  const { data: students } = useListStudents();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateSportsEnrollment();
  const deleteM = useDeleteSportsEnrollment();
  const form = useForm({ defaultValues: { activityId: 0, studentId: 0, role: "Member", joinDate: new Date().toISOString().split('T')[0], bloodGroup: "", medicalFitness: "Fit", status: "Active", remarks: "" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListSportsEnrollmentsQueryKey() }); toast({ title: "Student enrolled" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getActivityName = (id: number) => activities?.find(a => a.id === id)?.name || '-';
  const getStudentName = (id: number) => { const s = students?.find(s => s.id === id); return s ? `${s.firstName} ${s.lastName} (${s.rollNumber})` : '-'; };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Enrollments</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Enroll Student</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Enroll Student</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="activityId" render={({ field }) => (<FormItem><FormLabel>Activity *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{activities?.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.name} ({a.category})</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{students?.slice(0, 50).map(s => <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName} ({s.rollNumber})</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Member">Member</SelectItem><SelectItem value="Captain">Captain</SelectItem><SelectItem value="Vice Captain">Vice Captain</SelectItem><SelectItem value="Cadet">Cadet (NCC)</SelectItem><SelectItem value="Volunteer">Volunteer (NSS)</SelectItem><SelectItem value="Secretary">Secretary</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="joinDate" render={({ field }) => (<FormItem><FormLabel>Join Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="bloodGroup" render={({ field }) => (<FormItem><FormLabel>Blood Group</FormLabel><FormControl><Input {...field} placeholder="A+, B-, O+" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="medicalFitness" render={({ field }) => (<FormItem><FormLabel>Medical Fitness</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Fit">Fit</SelectItem><SelectItem value="Partially Fit">Partially Fit</SelectItem><SelectItem value="Unfit">Unfit</SelectItem></SelectContent></Select></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Activity</TableHead><TableHead>Student</TableHead><TableHead>Role</TableHead><TableHead>Join Date</TableHead><TableHead>Blood Group</TableHead><TableHead>Fitness</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow> : enrollments?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No enrollments.</TableCell></TableRow> : enrollments?.map(e => (
            <TableRow key={e.id}><TableCell>{getActivityName(e.activityId)}</TableCell><TableCell className="font-medium">{getStudentName(e.studentId)}</TableCell><TableCell>{e.role}</TableCell><TableCell>{e.joinDate}</TableCell><TableCell>{e.bloodGroup || '-'}</TableCell><TableCell><Badge variant={e.medicalFitness === 'Fit' ? 'default' : 'secondary'}>{e.medicalFitness || '-'}</Badge></TableCell><TableCell><Badge>{e.status}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: e.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListSportsEnrollmentsQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}

function AchievementList() {
  const { data: achievements, isLoading } = useListSportsAchievements();
  const { data: activities } = useListSportsActivities();
  const { data: students } = useListStudents();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateSportsAchievement();
  const deleteM = useDeleteSportsAchievement();
  const form = useForm({ defaultValues: { activityId: 0, studentId: 0, title: "", level: "College", position: "", eventName: "", eventDate: "", venue: "", description: "", certificateNumber: "" } });
  const onSubmit = (data: any) => { const clean = { ...data, activityId: data.activityId || undefined, studentId: data.studentId || undefined }; createM.mutate({ data: clean }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListSportsAchievementsQueryKey() }); toast({ title: "Achievement added" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getActivityName = (id: number | null | undefined) => id ? activities?.find(a => a.id === id)?.name || '-' : '-';
  const getStudentName = (id: number | null | undefined) => { if (!id) return '-'; const s = students?.find(s => s.id === id); return s ? `${s.firstName} ${s.lastName}` : '-'; };
  const levelColors: Record<string, string> = { College: "secondary", District: "default", State: "default", National: "destructive", International: "destructive" };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Achievements & Awards</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Achievement</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Achievement</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} placeholder="District Cricket Champion" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="level" render={({ field }) => (<FormItem><FormLabel>Level *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="College">College</SelectItem><SelectItem value="Inter-College">Inter-College</SelectItem><SelectItem value="District">District</SelectItem><SelectItem value="State">State</SelectItem><SelectItem value="National">National</SelectItem><SelectItem value="International">International</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="activityId" render={({ field }) => (<FormItem><FormLabel>Activity</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{activities?.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{students?.slice(0, 50).map(s => <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="position" render={({ field }) => (<FormItem><FormLabel>Position</FormLabel><FormControl><Input {...field} placeholder="1st, 2nd, Runner-up" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="eventName" render={({ field }) => (<FormItem><FormLabel>Event</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="eventDate" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="venue" render={({ field }) => (<FormItem><FormLabel>Venue</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Level</TableHead><TableHead>Activity</TableHead><TableHead>Student</TableHead><TableHead>Position</TableHead><TableHead>Event</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow> : achievements?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No achievements.</TableCell></TableRow> : achievements?.map(a => (
            <TableRow key={a.id}><TableCell className="font-medium">{a.title}</TableCell><TableCell><Badge variant={levelColors[a.level] as any || "secondary"}>{a.level}</Badge></TableCell><TableCell>{getActivityName(a.activityId)}</TableCell><TableCell>{getStudentName(a.studentId)}</TableCell><TableCell>{a.position || '-'}</TableCell><TableCell>{a.eventName || '-'}</TableCell><TableCell>{a.eventDate || '-'}</TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: a.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListSportsAchievementsQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}
