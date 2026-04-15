import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { GripVertical, Save, RotateCcw, LayoutDashboard, BarChart3, Users, IndianRupee, CalendarCheck, Calendar, BookMarked, Clock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const WIDGET_ICONS: Record<string, any> = {
  total_students: Users, total_staff: Users, total_departments: LayoutDashboard, total_courses: BookMarked,
  fee_collection: IndianRupee, attendance_overview: CalendarCheck, recent_events: Calendar,
  department_chart: BarChart3, fee_trend_chart: BarChart3, gender_distribution: BarChart3,
  pending_leaves: Clock, library_stats: BookMarked,
};

const CATEGORY_COLORS: Record<string, string> = {
  stats: "bg-blue-100 text-blue-800", finance: "bg-green-100 text-green-800",
  academic: "bg-purple-100 text-purple-800", engagement: "bg-amber-100 text-amber-800",
  charts: "bg-indigo-100 text-indigo-800", hr: "bg-red-100 text-red-800",
  campus: "bg-teal-100 text-teal-800",
};

interface Widget {
  key: string;
  label: string;
  category: string;
  visible: boolean;
  position: number;
}

export default function DashboardSettingsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [widgets, setWidgets] = useState<Widget[]>([]);

  const { data: savedWidgets } = useQuery({
    queryKey: ["dashboard-widgets"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/dashboard-widgets`, { headers });
      return r.json();
    },
  });

  useEffect(() => {
    if (savedWidgets) setWidgets(savedWidgets);
  }, [savedWidgets]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`${API_BASE}/api/dashboard-widgets`, {
        method: "POST", headers,
        body: JSON.stringify({ widgets: widgets.map((w, i) => ({ key: w.key, visible: w.visible, position: i })) }),
      });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Dashboard layout saved" });
      qc.invalidateQueries({ queryKey: ["dashboard-widgets"] });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const toggleWidget = (key: string) => {
    setWidgets(prev => prev.map(w => w.key === key ? { ...w, visible: !w.visible } : w));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setWidgets(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === widgets.length - 1) return;
    setWidgets(prev => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const resetDefaults = () => {
    if (savedWidgets) {
      setWidgets(savedWidgets.map((w: Widget) => ({ ...w, visible: true })));
    }
  };

  const visibleCount = widgets.filter(w => w.visible).length;
  const hiddenCount = widgets.filter(w => !w.visible).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Customization</h1>
          <p className="text-muted-foreground">Choose which widgets appear on your dashboard and arrange their order.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetDefaults}><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />{saveMutation.isPending ? "Saving..." : "Save Layout"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{widgets.length}</p><p className="text-xs text-muted-foreground">Total Widgets</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{visibleCount}</p><p className="text-xs text-muted-foreground">Visible</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-muted-foreground">{hiddenCount}</p><p className="text-xs text-muted-foreground">Hidden</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Widget Configuration</CardTitle>
          <CardDescription>Toggle visibility and reorder widgets. Changes are saved when you click "Save Layout".</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {widgets.map((widget, index) => {
              const Icon = WIDGET_ICONS[widget.key] || LayoutDashboard;
              const catColor = CATEGORY_COLORS[widget.category] || "bg-gray-100 text-gray-800";
              return (
                <div key={widget.key} className={`flex items-center gap-3 p-3 rounded-lg border ${widget.visible ? "bg-card" : "bg-muted/50 opacity-60"} transition-all`}>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveUp(index)} disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▲</button>
                    <button onClick={() => moveDown(index)} disabled={index === widgets.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▼</button>
                  </div>
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${widget.visible ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`w-4 h-4 ${widget.visible ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${widget.visible ? "" : "text-muted-foreground"}`}>{widget.label}</p>
                    <Badge variant="secondary" className={`text-[10px] ${catColor}`}>{widget.category}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">#{index + 1}</span>
                  <Switch checked={widget.visible} onCheckedChange={() => toggleWidget(widget.key)} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
