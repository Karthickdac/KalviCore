import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Trash2, Pencil } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const EVENT_TYPES = ["General", "Holiday", "Exam", "Semester Start", "Semester End", "Workshop", "Cultural", "Sports", "Meeting"];
const EVENT_COLORS: Record<string, string> = {
  General: "bg-blue-100 text-blue-800", Holiday: "bg-red-100 text-red-800", Exam: "bg-purple-100 text-purple-800",
  "Semester Start": "bg-green-100 text-green-800", "Semester End": "bg-orange-100 text-orange-800",
  Workshop: "bg-cyan-100 text-cyan-800", Cultural: "bg-pink-100 text-pink-800", Sports: "bg-yellow-100 text-yellow-800",
  Meeting: "bg-gray-100 text-gray-800",
};
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function AcademicCalendarPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: events = [] } = useQuery<any[]>({
    queryKey: ["academic-calendar", selectedYear, selectedMonth],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/academic-calendar?year=${selectedYear}&month=${selectedMonth}`, { headers });
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/api/academic-calendar`, { method: "POST", headers, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["academic-calendar"] }); toast({ title: "Event added" }); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`${API_BASE}/api/academic-calendar/${id}`, { method: "DELETE", headers }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["academic-calendar"] }); toast({ title: "Event deleted" }); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      title: fd.get("title"), description: fd.get("description"),
      startDate: fd.get("startDate"), endDate: fd.get("endDate") || null,
      eventType: fd.get("eventType"), isHoliday: fd.get("isHoliday") || "No",
    });
  };

  const daysInMonth = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();
  const firstDay = new Date(Number(selectedYear), Number(selectedMonth) - 1, 1).getDay();

  const filteredEvents = typeFilter === "all" ? events : events.filter((e: any) => e.eventType === typeFilter);
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const eventsByDay: Record<number, any[]> = {};
  filteredEvents.forEach((e: any) => {
    const d = new Date(e.startDate).getDate();
    if (!eventsByDay[d]) eventsByDay[d] = [];
    eventsByDay[d].push(e);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Calendar</h1>
          <p className="text-muted-foreground">Manage academic year events and holidays.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Calendar Event</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input name="title" required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea name="description" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date</Label><Input name="startDate" type="date" required /></div>
                <div className="space-y-2"><Label>End Date</Label><Input name="endDate" type="date" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Type</Label>
                  <select name="eventType" className="w-full rounded-md border px-3 py-2 text-sm">
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label>Is Holiday?</Label>
                  <select name="isHoliday" className="w-full rounded-md border px-3 py-2 text-sm">
                    <option value="No">No</option><option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
              <DialogFooter><Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Adding..." : "Add Event"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 items-center">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>{[2024, 2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle>{MONTHS[Number(selectedMonth) - 1]} {selectedYear}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="bg-muted px-2 py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="bg-card p-2 min-h-[80px]" />)}
            {calendarDays.map(day => {
              const dayEvents = eventsByDay[day] || [];
              const isToday = day === now.getDate() && Number(selectedMonth) === now.getMonth() + 1 && Number(selectedYear) === now.getFullYear();
              return (
                <div key={day} className={`bg-card p-1.5 min-h-[80px] ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}>
                  <span className={`text-xs font-medium ${isToday ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : ""}`}>{day}</span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.map((e: any) => (
                      <div key={e.id} className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer ${EVENT_COLORS[e.eventType] || "bg-gray-100 text-gray-800"}`} title={e.title} onClick={() => deleteMutation.mutate(e.id)}>
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Events This Month ({filteredEvents.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No events this month</p>
            ) : filteredEvents.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{new Date(e.startDate).getDate()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(e.startDate).toLocaleDateString("en-IN", { weekday: "short" })}</p>
                  </div>
                  <div>
                    <p className="font-medium">{e.title}</p>
                    {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={EVENT_COLORS[e.eventType]}>{e.eventType}</Badge>
                  {e.isHoliday === "Yes" && <Badge variant="destructive">Holiday</Badge>}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(e.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
