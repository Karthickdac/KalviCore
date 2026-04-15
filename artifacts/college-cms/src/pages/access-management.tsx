import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const API_BASE = import.meta.env.VITE_API_URL || "";

interface PermDef {
  key: string;
  label: string;
  group: string;
}

interface AccessData {
  permissions: PermDef[];
  roles: string[];
  matrix: Record<string, Record<string, boolean>>;
}

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Principal: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  HOD: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Faculty: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Staff: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Student: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

export default function AccessManagementPage() {
  const { token } = useAuth();
  const [data, setData] = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [resetDialog, setResetDialog] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/access-management/permissions`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
    } catch {
      setToast({ type: "error", msg: "Failed to load permissions" });
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const togglePermission = async (role: string, permission: string, enabled: boolean) => {
    const key = `${role}-${permission}`;
    setUpdating(key);
    try {
      const res = await fetch(`${API_BASE}/api/access-management/permissions`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ role, permission, enabled }),
      });
      if (!res.ok) throw new Error("Update failed");
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          matrix: {
            ...prev.matrix,
            [role]: { ...prev.matrix[role], [permission]: enabled },
          },
        };
      });
      setToast({ type: "success", msg: `${permission} ${enabled ? "enabled" : "disabled"} for ${role}` });
    } catch {
      setToast({ type: "error", msg: "Failed to update permission" });
    } finally {
      setUpdating(null);
    }
  };

  const resetRole = async (role: string) => {
    setResetting(true);
    try {
      const res = await fetch(`${API_BASE}/api/access-management/reset`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Reset failed");
      setResetDialog(null);
      setToast({ type: "success", msg: `${role} permissions reset to defaults` });
      await fetchData();
    } catch {
      setToast({ type: "error", msg: "Failed to reset permissions" });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-muted-foreground">Failed to load access management data.</div>;

  const groups = [...new Set(data.permissions.map(p => p.group))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-teal-500" />
            Access Management
          </h1>
          <p className="text-muted-foreground mt-1">Control which modules and features each role can access. Changes take effect immediately.</p>
        </div>
      </div>

      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${
          toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-red-500/10 border-red-500/20 text-red-600"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground mr-2">Roles:</span>
        {data.roles.map(role => {
          const enabledCount = Object.values(data.matrix[role] || {}).filter(Boolean).length;
          return (
            <Badge key={role} variant="outline" className={`${ROLE_COLORS[role] || ""} text-xs`}>
              {role} ({enabledCount}/{data.permissions.length})
            </Badge>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="sticky top-0 z-10 bg-background border-b">
            <div className="grid gap-0" style={{ gridTemplateColumns: `220px repeat(${data.roles.length}, 1fr)` }}>
              <div className="p-3 font-semibold text-sm text-muted-foreground">Module / Feature</div>
              {data.roles.map(role => (
                <div key={role} className="p-3 text-center">
                  <Badge variant="outline" className={`${ROLE_COLORS[role] || ""} text-xs font-semibold`}>{role}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] text-muted-foreground hover:text-foreground mt-1 h-5 px-1.5"
                    onClick={() => setResetDialog(role)}
                  >
                    <RotateCcw className="h-2.5 w-2.5 mr-0.5" /> Reset
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {groups.map(group => {
            const groupPerms = data.permissions.filter(p => p.group === group);
            return (
              <div key={group}>
                <div className="px-3 py-2 bg-muted/50 border-y">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</span>
                </div>
                {groupPerms.map((perm, idx) => (
                  <div
                    key={perm.key}
                    className={`grid gap-0 items-center hover:bg-muted/30 transition-colors ${idx < groupPerms.length - 1 ? "border-b border-border/50" : ""}`}
                    style={{ gridTemplateColumns: `220px repeat(${data.roles.length}, 1fr)` }}
                  >
                    <div className="p-3">
                      <span className="text-sm font-medium">{perm.label}</span>
                      <span className="text-[10px] text-muted-foreground ml-2 font-mono">{perm.key}</span>
                    </div>
                    {data.roles.map(role => {
                      const enabled = data.matrix[role]?.[perm.key] ?? false;
                      const isUpdating = updating === `${role}-${perm.key}`;
                      return (
                        <div key={role} className="flex justify-center p-3">
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Switch
                              checked={enabled}
                              onCheckedChange={(val) => togglePermission(role, perm.key, val)}
                              className="data-[state=checked]:bg-teal-500"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!resetDialog} onOpenChange={() => setResetDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Permissions</DialogTitle>
            <DialogDescription>
              Reset all permissions for <strong>{resetDialog}</strong> back to system defaults? Any custom changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => resetDialog && resetRole(resetDialog)} disabled={resetting}>
              {resetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reset to Defaults
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
