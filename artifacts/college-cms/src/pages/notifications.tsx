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
import { Mail, MessageSquare, Send, Bell, CheckCircle, XCircle, Clock, Phone } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function NotificationsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [channel, setChannel] = useState("whatsapp");
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
      toast({ title: `${data.sent} notifications sent via ${channel === "whatsapp" ? "WhatsApp" : channel === "email" ? "Email" : "SMS"}` });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notification-stats"] });
      setSubject(""); setMessage(""); setDialogOpen(false);
    },
    onError: () => toast({ title: "Failed to send notifications", variant: "destructive" }),
  });

  const getChannelLabel = () => {
    if (channel === "whatsapp") return "WhatsApp";
    if (channel === "email") return "Email";
    return "SMS";
  };

  const getChannelIcon = (ch: string) => {
    if (ch === "whatsapp") return <WhatsAppIcon className="w-3 h-3 mr-1" />;
    if (ch === "email") return <Mail className="w-3 h-3 mr-1" />;
    return <MessageSquare className="w-3 h-3 mr-1" />;
  };

  const getChannelBadgeClass = (ch: string) => {
    if (ch === "whatsapp") return "bg-green-500/10 text-green-600 border-green-500/20";
    if (ch === "email") return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Send WhatsApp, email, and SMS notifications to students and staff.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Send className="mr-2 h-4 w-4" />Send Notification</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Send Notification</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setChannel("whatsapp")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 text-sm font-medium transition-all ${channel === "whatsapp" ? "border-green-500 bg-green-500/10 text-green-700" : "border-border hover:border-green-500/50"}`}
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setChannel("email")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 text-sm font-medium transition-all ${channel === "email" ? "border-blue-500 bg-blue-500/10 text-blue-700" : "border-border hover:border-blue-500/50"}`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    onClick={() => setChannel("sms")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 text-sm font-medium transition-all ${channel === "sms" ? "border-amber-500 bg-amber-500/10 text-amber-700" : "border-border hover:border-amber-500/50"}`}
                  >
                    <Phone className="w-4 h-4" />
                    SMS
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Notification subject..." />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={channel === "whatsapp" ? "Type your WhatsApp message..." : "Write your message here..."} rows={4} />
                {channel === "whatsapp" && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <WhatsAppIcon className="w-3 h-3 text-green-500" />
                    WhatsApp messages will be queued for delivery to registered phone numbers
                  </p>
                )}
              </div>
              <Button className="w-full" onClick={() => sendMutation.mutate()} disabled={!subject || !message || sendMutation.isPending}>
                {sendMutation.isPending ? "Sending..." : (
                  <span className="flex items-center gap-2">
                    {channel === "whatsapp" && <WhatsAppIcon className="w-4 h-4" />}
                    {channel === "email" && <Mail className="w-4 h-4" />}
                    {channel === "sms" && <Phone className="w-4 h-4" />}
                    Send {getChannelLabel()} to {recipients === "all" ? "Everyone" : recipients === "all_students" ? "All Students" : "All Staff"}
                  </span>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center"><Bell className="w-6 h-6 mx-auto mb-1 text-blue-500" /><p className="text-2xl font-bold">{stats?.total || 0}</p><p className="text-xs text-muted-foreground">Total Sent</p></CardContent></Card>
        <Card className="border-green-500/20"><CardContent className="p-4 text-center"><WhatsAppIcon className="w-6 h-6 mx-auto mb-1 text-green-500" /><p className="text-2xl font-bold">{stats?.whatsapp || 0}</p><p className="text-xs text-muted-foreground">WhatsApp</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Mail className="w-6 h-6 mx-auto mb-1 text-indigo-500" /><p className="text-2xl font-bold">{stats?.email || 0}</p><p className="text-xs text-muted-foreground">Emails</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><MessageSquare className="w-6 h-6 mx-auto mb-1 text-amber-500" /><p className="text-2xl font-bold">{stats?.sms || 0}</p><p className="text-xs text-muted-foreground">SMS</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-500" /><p className="text-2xl font-bold">{stats?.sent || 0}</p><p className="text-xs text-muted-foreground">Delivered</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Notification History</CardTitle>
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
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
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${getChannelBadgeClass(n.channel)}`}>
                      {getChannelIcon(n.channel)}
                      {n.channel === "whatsapp" ? "WhatsApp" : n.channel}
                    </Badge>
                  </TableCell>
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
