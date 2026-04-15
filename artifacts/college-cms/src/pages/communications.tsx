import { useState } from "react";
import { useListAnnouncements, useCreateAnnouncement, useDeleteAnnouncement, useUpdateAnnouncement, useListGrievances, useCreateGrievance, useUpdateGrievance, useListDepartments, getListAnnouncementsQueryKey, getListGrievancesQueryKey } from "@workspace/api-client-react";
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
import { Plus, Megaphone, MessageSquare, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Communications() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Communications</h2><p className="text-muted-foreground">Announcements, notices, and grievance management.</p></div>
      <Tabs defaultValue="announcements">
        <TabsList><TabsTrigger value="announcements"><Megaphone className="w-4 h-4 mr-1" />Announcements</TabsTrigger><TabsTrigger value="grievances"><MessageSquare className="w-4 h-4 mr-1" />Grievances</TabsTrigger></TabsList>
        <TabsContent value="announcements"><AnnouncementList /></TabsContent>
        <TabsContent value="grievances"><GrievanceList /></TabsContent>
      </Tabs>
    </div>
  );
}

function AnnouncementList() {
  const { data: announcements, isLoading } = useListAnnouncements();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateAnnouncement();
  const deleteM = useDeleteAnnouncement();
  const form = useForm({ defaultValues: { title: "", content: "", type: "General", priority: "Normal", targetAudience: "All", publishDate: new Date().toISOString().split('T')[0], expiryDate: "", postedBy: "Admin", status: "Active" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() }); toast({ title: "Announcement created" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Announcements</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Announcement</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="content" render={({ field }) => (<FormItem><FormLabel>Content *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="General">General</SelectItem><SelectItem value="Academic">Academic</SelectItem><SelectItem value="Exam">Exam</SelectItem><SelectItem value="Holiday">Holiday</SelectItem><SelectItem value="Fee">Fee</SelectItem><SelectItem value="Event">Event</SelectItem><SelectItem value="Urgent">Urgent</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel>Priority</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Normal">Normal</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Urgent">Urgent</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="targetAudience" render={({ field }) => (<FormItem><FormLabel>Audience</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="All">All</SelectItem><SelectItem value="Students">Students</SelectItem><SelectItem value="Staff">Staff</SelectItem><SelectItem value="Parents">Parents</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="publishDate" render={({ field }) => (<FormItem><FormLabel>Publish Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="expiryDate" render={({ field }) => (<FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="postedBy" render={({ field }) => (<FormItem><FormLabel>Posted By *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Publish</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Priority</TableHead><TableHead>Audience</TableHead><TableHead>Published</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow> : announcements?.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No announcements.</TableCell></TableRow> : announcements?.map(a => (
            <TableRow key={a.id}><TableCell className="font-medium">{a.title}</TableCell><TableCell><Badge variant="secondary">{a.type}</Badge></TableCell><TableCell><Badge variant={a.priority === 'Urgent' ? 'destructive' : a.priority === 'High' ? 'destructive' : 'outline'}>{a.priority}</Badge></TableCell><TableCell>{a.targetAudience}</TableCell><TableCell>{a.publishDate}</TableCell><TableCell><Badge variant={a.status === 'Active' ? 'default' : 'secondary'}>{a.status}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: a.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}

function GrievanceList() {
  const { data: grievances, isLoading } = useListGrievances();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateGrievance();
  const updateM = useUpdateGrievance();
  const form = useForm({ defaultValues: { submittedBy: "", submitterType: "Student", category: "Academic", subject: "", description: "", priority: "Medium", isAnonymous: "No" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListGrievancesQueryKey() }); toast({ title: "Grievance submitted" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Grievances</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Submit Grievance</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Submit Grievance</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="submittedBy" render={({ field }) => (<FormItem><FormLabel>Submitted By *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="submitterType" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Student">Student</SelectItem><SelectItem value="Staff">Staff</SelectItem><SelectItem value="Parent">Parent</SelectItem></SelectContent></Select></FormItem>)} />
              </div>
              <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Academic">Academic</SelectItem><SelectItem value="Infrastructure">Infrastructure</SelectItem><SelectItem value="Hostel">Hostel</SelectItem><SelectItem value="Transport">Transport</SelectItem><SelectItem value="Ragging">Ragging</SelectItem><SelectItem value="Staff">Staff</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="subject" render={({ field }) => (<FormItem><FormLabel>Subject *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel>Priority</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Critical">Critical</SelectItem></SelectContent></Select></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Submit</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Category</TableHead><TableHead>Submitted By</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow> : grievances?.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No grievances.</TableCell></TableRow> : grievances?.map(g => (
            <TableRow key={g.id}><TableCell className="font-medium">{g.subject}</TableCell><TableCell><Badge variant="secondary">{g.category}</Badge></TableCell><TableCell>{g.isAnonymous === 'Yes' ? 'Anonymous' : g.submittedBy} <span className="text-xs text-muted-foreground">({g.submitterType})</span></TableCell><TableCell><Badge variant={g.priority === 'Critical' || g.priority === 'High' ? 'destructive' : 'outline'}>{g.priority}</Badge></TableCell><TableCell><Badge variant={g.status === 'Resolved' ? 'default' : g.status === 'Open' ? 'destructive' : 'secondary'}>{g.status}</Badge></TableCell><TableCell>{g.status !== 'Resolved' && <Button variant="outline" size="sm" onClick={() => { const res = prompt('Resolution note:'); if (res) updateM.mutate({ id: g.id, data: { status: 'Resolved', resolution: res, resolvedDate: new Date().toISOString().split('T')[0] } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListGrievancesQueryKey() }) }); }}>Resolve</Button>}</TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}
