import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, LogOut, ArrowLeft, LayoutDashboard, BookMarked, BookCheck,
  ChevronLeft, ChevronRight, Menu, Library, Search, AlertTriangle, Plus, Pencil, Trash2, RotateCcw,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

type Section = "dashboard" | "catalog" | "issued";

const sidebarItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "catalog", label: "Book Catalog", icon: <BookOpen className="w-4 h-4" /> },
  { id: "issued", label: "Issued Books", icon: <BookCheck className="w-4 h-4" /> },
];

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export default function LibrarianPortalPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/portal/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Invalid credentials"); setLoading(false); return; }
      const data = await res.json();
      setStaff({ id: data.user.staffRecordId, staffId: data.user.staffId || data.user.username, name: data.user.fullName, email: data.user.email });
      setActiveSection("dashboard");
    } catch { setError("Connection failed"); }
    setLoading(false);
  };

  const { data: stats } = useQuery({
    queryKey: ["librarian-stats"], queryFn: () => apiFetch(`/api/librarian-portal/stats`), enabled: !!staff,
  });
  const { data: books = [] } = useQuery<any[]>({
    queryKey: ["librarian-books"], queryFn: () => apiFetch(`/api/library-books`), enabled: !!staff,
  });
  const { data: issued = [] } = useQuery<any[]>({
    queryKey: ["librarian-issued"], queryFn: () => apiFetch(`/api/librarian-portal/issued`), enabled: !!staff,
  });

  if (!staff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-amber-950/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Login
          </Link>
          <Card className="shadow-xl border-amber-200/50">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                <Library className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Librarian Portal</CardTitle>
              <CardDescription>Enter your username and password to access.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">{error}</div>}
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
                </div>
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loading}>
                  {loading ? "Verifying..." : "Access Portal"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground">KalviCore — Complete Campus. One Intelligent System</p>
        </div>
      </div>
    );
  }

  const filteredBooks = books.filter((b: any) =>
    !searchQuery || b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || b.author?.toLowerCase().includes(searchQuery.toLowerCase()) || b.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-background">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-card border-r flex flex-col transition-all duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${sidebarCollapsed ? "w-[68px]" : "w-64"}`}>
        <div className={`flex items-center gap-3 p-4 border-b ${sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
            <Library className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && <div className="min-w-0"><h2 className="font-bold text-sm truncate">Librarian Portal</h2><p className="text-xs text-muted-foreground truncate">KalviCore</p></div>}
        </div>
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-b">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{staff.name?.[0]}</div>
              <div className="min-w-0"><p className="text-sm font-medium truncate">{staff.name}</p><p className="text-xs text-muted-foreground truncate">{staff.staffId}</p></div>
            </div>
          </div>
        )}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 rounded-lg text-sm transition-colors ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"} ${activeSection === item.id ? "bg-amber-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                title={sidebarCollapsed ? item.label : undefined}
              >{item.icon}{!sidebarCollapsed && <span>{item.label}</span>}</button>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-2 space-y-1">
          <button onClick={() => { setStaff(null); setUsername(""); setPassword(""); }} className={`w-full flex items-center gap-3 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}`} title={sidebarCollapsed ? "Exit Portal" : undefined}>
            <LogOut className="w-4 h-4" />{!sidebarCollapsed && <span>Exit Portal</span>}
          </button>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex w-full items-center gap-3 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors justify-center px-2 py-2">
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b px-4 lg:px-6 h-14 flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-1.5 rounded-md hover:bg-muted"><Menu className="w-5 h-5" /></button>
          <h1 className="font-semibold text-lg">{sidebarItems.find(i => i.id === activeSection)?.label || "Dashboard"}</h1>
        </header>
        <div className="p-4 lg:p-6 max-w-6xl">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card><CardContent className="p-4 text-center"><BookOpen className="w-6 h-6 mx-auto mb-1 text-amber-500" /><p className="font-bold text-lg">{stats?.totalTitles || 0}</p><p className="text-xs text-muted-foreground">Total Titles</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><BookMarked className="w-6 h-6 mx-auto mb-1 text-blue-500" /><p className="font-bold text-lg">{stats?.totalBooks || 0}</p><p className="text-xs text-muted-foreground">Total Copies</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><BookOpen className="w-6 h-6 mx-auto mb-1 text-green-500" /><p className="font-bold text-lg">{stats?.availableBooks || 0}</p><p className="text-xs text-muted-foreground">Available</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><BookCheck className="w-6 h-6 mx-auto mb-1 text-violet-500" /><p className="font-bold text-lg">{stats?.activeIssued || 0}</p><p className="text-xs text-muted-foreground">Currently Issued</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><AlertTriangle className="w-6 h-6 mx-auto mb-1 text-red-500" /><p className="font-bold text-lg">{stats?.overdueCount || 0}</p><p className="text-xs text-muted-foreground">Overdue</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Recently Issued</CardTitle></CardHeader>
                <CardContent>
                  {issued.length === 0 ? <p className="text-center py-6 text-muted-foreground text-sm">No issued books.</p> : (
                    <Table>
                      <TableHeader><TableRow><TableHead>Book</TableHead><TableHead>Member</TableHead><TableHead>Issue Date</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {issued.slice(0, 5).map((i: any) => (
                          <TableRow key={i.id}>
                            <TableCell className="text-sm font-medium">{i.bookTitle}</TableCell>
                            <TableCell className="text-sm">{i.memberName}<span className="text-xs text-muted-foreground ml-1">({i.memberRoll})</span></TableCell>
                            <TableCell className="text-sm">{i.issueDate ? new Date(i.issueDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                            <TableCell className="text-sm">{i.dueDate ? new Date(i.dueDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                            <TableCell><Badge variant={i.status === "Returned" ? "outline" : i.dueDate && new Date(i.dueDate) < new Date() ? "destructive" : "default"}>{i.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "catalog" && <CatalogSection books={filteredBooks} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
          {activeSection === "issued" && <IssuedSection issued={issued} books={books} />}
        </div>
      </main>
    </div>
  );
}

function DeleteButton({ onConfirm, title }: { onConfirm: () => void; title: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {title}?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CatalogSection({ books, searchQuery, setSearchQuery }: { books: any[]; searchQuery: string; setSearchQuery: (s: string) => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["librarian-books"] });
    qc.invalidateQueries({ queryKey: ["librarian-stats"] });
  };

  const save = useMutation({
    mutationFn: () => {
      const total = form.totalCopies ? Number(form.totalCopies) : 1;
      const body = {
        title: form.title,
        author: form.author,
        isbn: form.isbn || null,
        category: form.category || "General",
        publisher: form.publisher || null,
        publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
        totalCopies: total,
        availableCopies: editing ? (form.availableCopies !== undefined ? Number(form.availableCopies) : total) : total,
        shelfLocation: form.shelfLocation || null,
        price: form.price ? Number(form.price) : null,
      };
      return editing
        ? apiFetch(`/api/library-books/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch(`/api/library-books`, { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: () => { toast({ title: editing ? "Book updated" : "Book added" }); invalidate(); setOpen(false); setEditing(null); setForm({}); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/library-books/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Book deleted" }); invalidate(); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const openAdd = () => { setEditing(null); setForm({ category: "General", totalCopies: 1 }); setOpen(true); };
  const openEdit = (b: any) => { setEditing(b); setForm({ ...b }); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by title, author, ISBN..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openAdd} className="bg-amber-600 hover:bg-amber-700"><Plus className="w-4 h-4 mr-2" />Add Book</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Book" : "Add Book"}</DialogTitle><DialogDescription>Manage library catalog.</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2"><Label>Title *</Label><Input value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Author *</Label><Input value={form.author || ""} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>ISBN</Label><Input value={form.isbn || ""} onChange={e => setForm({ ...form, isbn: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Category</Label>
                <Select value={form.category || "General"} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Literature">Literature</SelectItem>
                    <SelectItem value="Reference">Reference</SelectItem>
                    <SelectItem value="Fiction">Fiction</SelectItem>
                    <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                    <SelectItem value="Textbook">Textbook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Publisher</Label><Input value={form.publisher || ""} onChange={e => setForm({ ...form, publisher: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Published Year</Label><Input type="number" value={form.publishedYear ?? ""} onChange={e => setForm({ ...form, publishedYear: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Total Copies *</Label><Input type="number" value={form.totalCopies ?? ""} onChange={e => setForm({ ...form, totalCopies: e.target.value })} /></div>
              {editing && <div className="space-y-1.5"><Label>Available Copies</Label><Input type="number" value={form.availableCopies ?? ""} onChange={e => setForm({ ...form, availableCopies: e.target.value })} /></div>}
              <div className="space-y-1.5"><Label>Shelf Location</Label><Input value={form.shelfLocation || ""} onChange={e => setForm({ ...form, shelfLocation: e.target.value })} placeholder="e.g., A-12" /></div>
              <div className="space-y-1.5"><Label>Price (₹)</Label><Input type="number" value={form.price ?? ""} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title || !form.author} className="bg-amber-600 hover:bg-amber-700">{save.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          {books.length === 0 ? <p className="text-center py-8 text-muted-foreground">No books found.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Author</TableHead><TableHead>ISBN</TableHead><TableHead>Category</TableHead><TableHead>Total</TableHead><TableHead>Available</TableHead><TableHead>Shelf</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {books.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium text-sm">{b.title}</TableCell>
                    <TableCell className="text-sm">{b.author}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.isbn || "-"}</TableCell>
                    <TableCell><Badge variant="outline">{b.category}</Badge></TableCell>
                    <TableCell className="text-sm">{b.totalCopies}</TableCell>
                    <TableCell className="text-sm"><span className={b.availableCopies === 0 ? "text-red-500 font-medium" : "text-green-600 font-medium"}>{b.availableCopies}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.shelfLocation || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                      <DeleteButton title="book" onConfirm={() => del.mutate(b.id)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function IssuedSection({ issued, books }: { issued: any[]; books: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["all-students-library"], queryFn: () => apiFetch(`/api/portal/students`),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["librarian-issued"] });
    qc.invalidateQueries({ queryKey: ["librarian-books"] });
    qc.invalidateQueries({ queryKey: ["librarian-stats"] });
  };

  const issue = useMutation({
    mutationFn: () => {
      const issueDate = form.issueDate || new Date().toISOString().slice(0, 10);
      const dueDate = form.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      return apiFetch(`/api/library-issued`, {
        method: "POST",
        body: JSON.stringify({
          bookId: Number(form.bookId),
          memberId: Number(form.memberId),
          memberType: "Student",
          issueDate,
          dueDate,
          status: "Issued",
        }),
      });
    },
    onSuccess: () => { toast({ title: "Book issued" }); invalidate(); setOpen(false); setForm({}); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const markReturned = useMutation({
    mutationFn: (record: any) => apiFetch(`/api/library-issued/${record.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Returned", returnDate: new Date().toISOString().slice(0, 10) }),
    }),
    onSuccess: () => { toast({ title: "Book marked returned" }); invalidate(); },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const studentLabel = (s: any) => `${s.firstName || ""} ${s.lastName || ""} (${s.rollNumber || s.id})`.trim();
  const availableBooks = books.filter((b: any) => b.availableCopies > 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Issued Books</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={() => setForm({})} className="bg-amber-600 hover:bg-amber-700"><Plus className="w-4 h-4 mr-2" />Issue Book</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Issue a Book</DialogTitle><DialogDescription>Issue a book to a student.</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Book *</Label>
                <Select value={form.bookId ? String(form.bookId) : ""} onValueChange={v => setForm({ ...form, bookId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select an available book" /></SelectTrigger>
                  <SelectContent className="max-h-72">{availableBooks.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.title} — {b.author} ({b.availableCopies} left)</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Student *</Label>
                <Select value={form.memberId ? String(form.memberId) : ""} onValueChange={v => setForm({ ...form, memberId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent className="max-h-72">{students.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{studentLabel(s)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Issue Date</Label><Input type="date" value={form.issueDate || ""} onChange={e => setForm({ ...form, issueDate: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={form.dueDate || ""} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => issue.mutate()} disabled={issue.isPending || !form.bookId || !form.memberId} className="bg-amber-600 hover:bg-amber-700">{issue.isPending ? "Issuing..." : "Issue Book"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {issued.length === 0 ? <p className="text-center py-8 text-muted-foreground">No issued records.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Book</TableHead><TableHead>Author</TableHead><TableHead>Member</TableHead><TableHead>Roll No.</TableHead><TableHead>Issue Date</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead>Fine</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {issued.map((i: any) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium text-sm">{i.bookTitle}</TableCell>
                  <TableCell className="text-sm">{i.bookAuthor}</TableCell>
                  <TableCell className="text-sm">{i.memberName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{i.memberRoll}</TableCell>
                  <TableCell className="text-sm">{i.issueDate ? new Date(i.issueDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                  <TableCell className="text-sm">{i.dueDate ? new Date(i.dueDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                  <TableCell><Badge variant={i.status === "Returned" ? "outline" : i.dueDate && new Date(i.dueDate) < new Date() ? "destructive" : "default"}>{i.status}</Badge></TableCell>
                  <TableCell className="text-sm">{Number(i.fineAmount || 0) > 0 ? `₹${i.fineAmount}` : "-"}</TableCell>
                  <TableCell className="text-right">
                    {i.status !== "Returned" && (
                      <Button variant="ghost" size="sm" className="h-8 text-green-600 hover:text-green-700" onClick={() => markReturned.mutate(i)} title="Mark as returned">
                        <RotateCcw className="w-4 h-4 mr-1" />Return
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
