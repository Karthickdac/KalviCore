import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { useListStudents, useListStaff } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Send, Bell, CheckCircle, XCircle, Clock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function NotificationsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [channel, setChannel] = useState("email");
  const [recipients, setRecipients] = useState("all_students");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("General");
  const [filterChannel, setFilterChannel] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["notification-stats"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/api/notifications/stats`, { headers }); return r.json(); },
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", filterChannel],
    queryFn: async () => {
      const params = filterChannel !== "all" ? `?channel=${filterChannel}` : "";
      const r = await fetch(`${API_BASE}/api/notifications${params}`, { headers });
      return r.json();
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`${API_BASE}/api/notifications/send`, {
        method: "POST", headers,
        body: JSON.stringify({ type, channel, recipients, subject, message }),
      });
      if (!r.ok) throw new Error("Failed to send");
      return r.json();
    },
    onSuccess: (data) => {
      toast({ title: `${data.sent} notifications sent successfully` });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notification-stats"] });
      setSubject(""); setMessage(""); setDialogOpen(false);
    },
    onError: () => toast({ title: "Failed to send notifications", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Send email and SMS notifications to students and staff.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Send className="mr-2 h-4 w-4" />Send Notification</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Send Notification</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select value={channel} onValueChange={setChannel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Fee Reminder">Fee Reminder</SelectItem>
                      <SelectItem value="Exam Notice">Exam Notice</SelectItem>
                      <SelectItem value="Attendance Alert">Attendance Alert</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Recipients</Label>
                <Select value={recipients} onValueChange={setRecipients}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_students">All Students</SelectItem>
                    <SelectItem value="all_staff">All Staff</SelectItem>
                    <SelectItem value="all">Everyone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Notification subject..." />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message here..." rows={4} />
              </div>
              <Button className="w-full" onClick={() => sendMutation.mutate()} disabled={!subject || !message || sendMutation.isPending}>
                {sendMutation.isPending ? "Sending..." : `Send ${channel === "email" ? "Email" : "SMS"} to ${recipients === "all" ? "Everyone" : recipients === "all_students" ? "All Students" : "All Staff"}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Bell className="w-6 h-6 mx-auto mb-1 text-blue-500" /><p className="text-2xl font-bold">{stats?.total || 0}</p><p className="text-xs text-muted-foreground">Total Sent</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Mail className="w-6 h-6 mx-auto mb-1 text-indigo-500" /><p className="text-2xl font-bold">{stats?.email || 0}</p><p className="text-xs text-muted-foreground">Emails</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><MessageSquare className="w-6 h-6 mx-auto mb-1 text-green-500" /><p className="text-2xl font-bold">{stats?.sms || 0}</p><p className="text-xs text-muted-foreground">SMS</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-500" /><p className="text-2xl font-bold">{stats?.sent || 0}</p><p className="text-xs text-muted-foreground">Delivered</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Notification History</CardTitle>
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Recipient</TableHead><TableHead>Channel</TableHead><TableHead>Subject</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Sent At</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {(notifications as any[]).length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No notifications sent yet</TableCell></TableRow>
              ) : (notifications as any[]).slice(0, 50).map((n: any) => (
                <TableRow key={n.id}>
                  <TableCell><div><p className="font-medium text-sm">{n.recipientName}</p><p className="text-xs text-muted-foreground">{n.recipientContact}</p></div></TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{n.channel === "email" ? <><Mail className="w-3 h-3 mr-1" />{n.channel}</> : <><MessageSquare className="w-3 h-3 mr-1" />{n.channel}</>}</Badge></TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">{n.subject}</TableCell>
                  <TableCell><Badge variant="secondary">{n.type}</Badge></TableCell>
                  <TableCell><Badge variant={n.status === "Sent" ? "default" : n.status === "Failed" ? "destructive" : "secondary"}>{n.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{n.sentAt ? new Date(n.sentAt).toLocaleString("en-IN") : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
