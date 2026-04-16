import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Pencil, Trash2, Search, Mail, MessageSquare, Phone, Lock, RefreshCw, Copy } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const channelMeta: Record<string, { label: string; icon: any; cls: string }> = {
  whatsapp: { label: "WhatsApp", icon: WhatsAppIcon, cls: "bg-green-500/10 text-green-600 border-green-500/20" },
  email: { label: "Email", icon: Mail, cls: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  sms: { label: "SMS", icon: Phone, cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

const categoryColor: Record<string, string> = {
  Academic: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  Attendance: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  Fees: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Admission: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  Library: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  Hostel: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  Transport: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  Placement: "bg-pink-500/10 text-pink-700 border-pink-500/20",
  Event: "bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/20",
  Administrative: "bg-slate-500/10 text-slate-700 border-slate-500/20",
  Emergency: "bg-red-500/10 text-red-700 border-red-500/20",
  Staff: "bg-teal-500/10 text-teal-700 border-teal-500/20",
  Account: "bg-gray-500/10 text-gray-700 border-gray-500/20",
};

interface Template {
  id: number; code: string; name: string; category: string; channel: string;
  subject: string; body: string; variables: string[]; description: string | null;
  isSystem: boolean; isActive: boolean;
}

const blank = { code: "", name: "", category: "Academic", channel: "email", subject: "", body: "", description: "", isActive: true };

export default function NotificationTemplatesPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [search, setSearch] = useState("");
  const [filterChannel, setFilterChannel] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState<any>(blank);

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["notification-templates"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/api/notification-templates`, { headers }); return r.json(); },
  });

  const categories = useMemo(() => {
    const set = new Set<string>(templates.map(t => t.category));
    return Array.from(set).sort();
  }, [templates]);

  const filtered = useMemo(() => templates.filter(t => {
    if (filterChannel !== "all" && t.channel !== filterChannel) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.code.toLowerCase().includes(q) && !t.subject.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [templates, search, filterChannel, filterCategory]);

  const grouped = useMemo(() => {
    const map: Record<string, Template[]> = {};
    for (const t of filtered) (map[t.category] ||= []).push(t);
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const extractVars = (subject: string, body: string): string[] => {
    const re = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    const set = new Set<string>();
    let m;
    while ((m = re.exec(subject + "\n" + body))) set.add(m[1]);
    return Array.from(set);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const variables = extractVars(form.subject, form.body);
      const payload = { ...form, variables };
      const url = editing ? `${API_BASE}/api/notification-templates/${editing.id}` : `${API_BASE}/api/notification-templates`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error((await r.json()).error || "Save failed");
      return r.json();
    },
    onSuccess: () => {
      toast({ title: editing ? "Template updated" : "Template created" });
      qc.invalidateQueries({ queryKey: ["notification-templates"] });
      setDialogOpen(false); setEditing(null); setForm(blank);
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`${API_BASE}/api/notification-templates/${id}`, { method: "DELETE", headers });
      if (!r.ok) throw new Error((await r.json()).error || "Delete failed");
      return r.json();
    },
    onSuccess: () => { toast({ title: "Template deleted" }); qc.invalidateQueries({ queryKey: ["notification-templates"] }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (t: Template) => {
      const r = await fetch(`${API_BASE}/api/notification-templates/${t.id}`, {
        method: "PATCH", headers, body: JSON.stringify({ isActive: !t.isActive }),
      });
      if (!r.ok) throw new Error("Update failed");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-templates"] }),
  });

  const reseedMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`${API_BASE}/api/notification-templates/seed`, { method: "POST", headers });
      return r.json();
    },
    onSuccess: (d: any) => { toast({ title: `Seeded ${d.inserted} new templates (${d.total} system templates total)` }); qc.invalidateQueries({ queryKey: ["notification-templates"] }); },
  });

  const openCreate = () => { setEditing(null); setForm(blank); setDialogOpen(true); };
  const openEdit = (t: Template) => {
    setEditing(t);
    setForm({ code: t.code, name: t.name, category: t.category, channel: t.channel, subject: t.subject, body: t.body, description: t.description || "", isActive: t.isActive });
    setDialogOpen(true);
  };
  const duplicateTemplate = (t: Template) => {
    setEditing(null);
    setForm({ code: `${t.code}_copy`, name: `${t.name} (Copy)`, category: t.category, channel: t.channel, subject: t.subject, body: t.body, description: t.description || "", isActive: true });
    setDialogOpen(true);
  };

  const liveVars = extractVars(form.subject, form.body);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-5 sm:h-6 w-5 sm:w-6 text-teal-600" />
            Notification Templates
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Pre-built message templates for WhatsApp, Email, and SMS. Use <code className="text-xs bg-muted px-1 rounded">{`{{variable}}`}</code> placeholders.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => reseedMutation.mutate()} disabled={reseedMutation.isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${reseedMutation.isPending ? "animate-spin" : ""}`} />
            Refresh System Templates
          </Button>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New Template</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{templates.length}</p><p className="text-xs text-muted-foreground">Total Templates</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{templates.filter(t => t.channel === "whatsapp").length}</p><p className="text-xs text-muted-foreground">WhatsApp</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-blue-600">{templates.filter(t => t.channel === "email").length}</p><p className="text-xs text-muted-foreground">Email</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-amber-600">{templates.filter(t => t.channel === "sms").length}</p><p className="text-xs text-muted-foreground">SMS</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, code, or subject..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading templates...</div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No templates match your filters.</div>
          ) : (
            <div className="space-y-6">
              {grouped.map(([cat, items]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={categoryColor[cat] || ""}>{cat}</Badge>
                    <span className="text-xs text-muted-foreground">{items.length} template{items.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map(t => {
                      const cm = channelMeta[t.channel];
                      const Icon = cm?.icon || MessageSquare;
                      return (
                        <Card key={t.id} className={`hover:shadow-md transition-shadow ${!t.isActive ? "opacity-60" : ""}`}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h3 className="font-semibold text-sm truncate">{t.name}</h3>
                                  {t.isSystem && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 gap-0.5"><Lock className="w-2.5 h-2.5" />System</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{t.code}</p>
                              </div>
                              <Badge variant="outline" className={`shrink-0 ${cm?.cls || ""}`}>
                                <Icon className="w-3 h-3 mr-1" />{cm?.label || t.channel}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-0.5">Subject</p>
                              <p className="text-sm line-clamp-1">{t.subject}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-0.5">Body Preview</p>
                              <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-line">{t.body}</p>
                            </div>
                            {t.variables.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {t.variables.slice(0, 4).map(v => (
                                  <code key={v} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{`{{${v}}}`}</code>
                                ))}
                                {t.variables.length > 4 && <span className="text-[10px] text-muted-foreground">+{t.variables.length - 4} more</span>}
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <Switch checked={t.isActive} onCheckedChange={() => toggleActiveMutation.mutate(t)} />
                                <span className="text-xs text-muted-foreground">{t.isActive ? "Active" : "Disabled"}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => duplicateTemplate(t)} title="Duplicate"><Copy className="h-3.5 w-3.5" /></Button>
                                {!t.isSystem && (
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(t)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                                )}
                                {!t.isSystem && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:text-red-700" title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this template?</AlertDialogTitle>
                                        <AlertDialogDescription>"{t.name}" will be permanently deleted. This action cannot be undone.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteMutation.mutate(t.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? `Edit Template: ${editing.name}` : "New Notification Template"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Template Code *</Label>
                <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} placeholder="e.g. fee_due_email" disabled={!!editing} />
                <p className="text-[10px] text-muted-foreground">Unique identifier (lowercase, underscores)</p>
              </div>
              <div className="space-y-1.5">
                <Label>Display Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Fee Due Reminder" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Channel *</Label>
                <Select value={form.channel} onValueChange={v => setForm({ ...form, channel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Academic", "Attendance", "Fees", "Admission", "Library", "Hostel", "Transport", "Placement", "Event", "Administrative", "Emergency", "Staff", "Account", "General"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Fee Reminder — ₹{{amount}} due {{due_date}}" />
            </div>
            <div className="space-y-1.5">
              <Label>Message Body *</Label>
              <Textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={form.channel === "email" ? 10 : 6} placeholder={`Use {{variable}} placeholders.\n\nExample:\nDear {{student_name}}, your fee of ₹{{amount}} is due on {{due_date}}.`} className="font-mono text-sm" />
            </div>
            {liveVars.length > 0 && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium mb-1.5">Detected Variables ({liveVars.length})</p>
                <div className="flex flex-wrap gap-1">
                  {liveVars.map(v => <code key={v} className="text-[10px] bg-background border px-1.5 py-0.5 rounded">{`{{${v}}}`}</code>)}
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="When to use this template" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
              <Label className="cursor-pointer">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.code || !form.name || !form.subject || !form.body || saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
