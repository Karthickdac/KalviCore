import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Shield, UserCog, Users, Search } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const ROLES = ["SuperAdmin", "Admin", "Principal", "HOD", "Faculty", "Staff", "Student"];

const ROLE_COLORS: Record<string, string> = {
  SuperAdmin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Admin: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Principal: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  HOD: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Faculty: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Staff: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Student: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
};

interface UserData {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  departmentId: number | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const { token, hasRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const { data: users = [], isLoading } = useQuery<UserData[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/users`, { headers });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingUser ? `${API_BASE}/api/users/${editingUser.id}` : `${API_BASE}/api/users`;
      const method = editingUser ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: editingUser ? "User updated" : "User created" });
      setDialogOpen(false);
      setEditingUser(null);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/api/users/${id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User deleted" });
    },
  });

  const filtered = users.filter((u) => {
    const matchesSearch = !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = ROLES.reduce((acc, role) => {
    acc[role] = users.filter((u) => u.role === role).length;
    return acc;
  }, {} as Record<string, number>);

  const [formRole, setFormRole] = useState("Staff");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: any = {
      username: fd.get("username"),
      email: fd.get("email"),
      fullName: fd.get("fullName"),
      role: formRole,
    };
    const pw = fd.get("password") as string;
    if (pw) data.password = pw;
    if (!editingUser && !pw) {
      toast({ title: "Password is required", variant: "destructive" });
      return;
    }
    createMutation.mutate(data);
  };

  if (!hasRole("SuperAdmin", "Admin")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage system users and role assignments.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingUser(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
              <DialogDescription>{editingUser ? "Update user details and role." : "Add a new system user."}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" defaultValue={editingUser?.fullName || ""} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" defaultValue={editingUser?.username || ""} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingUser?.email || ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password {editingUser && "(leave blank to keep current)"}</Label>
                <Input id="password" name="password" type="password" required={!editingUser} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formRole} onValueChange={setFormRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : editingUser ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {ROLES.map((role) => (
          <Card key={role} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{roleCounts[role] || 0}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <CardTitle className="text-base">All Users ({filtered.length})</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 w-48" />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="All Roles" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
              ) : filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.fullName}</TableCell>
                  <TableCell className="font-mono text-sm">{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ROLE_COLORS[u.role]}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "default" : "secondary"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingUser(u); setFormRole(u.role); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {u.role !== "SuperAdmin" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(u.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
