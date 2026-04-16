import { useState } from "react";
import { useListLibraryBooks, useCreateLibraryBook, useDeleteLibraryBook, useListLibraryIssued, useIssueLibraryBook, useUpdateLibraryIssued, useListStudents, getListLibraryBooksQueryKey, getListLibraryIssuedQueryKey } from "@workspace/api-client-react";
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
import { Plus, BookOpen, BookCheck, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";

export default function Library() {
  const { user } = useAuth();
  const isStudent = user?.role === "Student";
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">{isStudent ? "Library" : "Library Management"}</h2><p className="text-muted-foreground">{isStudent ? "Browse the catalog and view your borrowed books." : "Manage book catalog, issue/return, and fines."}</p></div>
      <Tabs defaultValue={isStudent ? "issued" : "catalog"}>
        <TabsList>
          <TabsTrigger value="catalog"><BookOpen className="w-4 h-4 mr-1" />Catalog</TabsTrigger>
          <TabsTrigger value="issued"><BookCheck className="w-4 h-4 mr-1" />{isStudent ? "My Books" : "Issue / Return"}</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog"><BookCatalog /></TabsContent>
        <TabsContent value="issued"><IssuedBooks /></TabsContent>
      </Tabs>
    </div>
  );
}

function BookCatalog() {
  const { user } = useAuth();
  const isStudent = user?.role === "Student";
  const { data: books, isLoading } = useListLibraryBooks();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateLibraryBook();
  const deleteM = useDeleteLibraryBook();
  const form = useForm({ defaultValues: { isbn: "", title: "", author: "", publisher: "", edition: "", category: "Textbook", subject: "", shelfLocation: "", totalCopies: 1, availableCopies: 1, price: 0, yearOfPublication: "" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListLibraryBooksQueryKey() }); toast({ title: "Book added" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Book Catalog</CardTitle>
        {!isStudent && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Book</Button></DialogTrigger>
            <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Book</DialogTitle></DialogHeader>
              <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="author" render={({ field }) => (<FormItem><FormLabel>Author *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="isbn" render={({ field }) => (<FormItem><FormLabel>ISBN</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Textbook">Textbook</SelectItem><SelectItem value="Reference">Reference</SelectItem><SelectItem value="Journal">Journal</SelectItem><SelectItem value="Magazine">Magazine</SelectItem><SelectItem value="Fiction">Fiction</SelectItem><SelectItem value="Non-Fiction">Non-Fiction</SelectItem></SelectContent></Select></FormItem>)} />
                  <FormField control={form.control} name="publisher" render={({ field }) => (<FormItem><FormLabel>Publisher</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="edition" render={({ field }) => (<FormItem><FormLabel>Edition</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="subject" render={({ field }) => (<FormItem><FormLabel>Subject</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="shelfLocation" render={({ field }) => (<FormItem><FormLabel>Shelf Location</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="totalCopies" render={({ field }) => (<FormItem><FormLabel>Total Copies</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="availableCopies" render={({ field }) => (<FormItem><FormLabel>Available</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                </div>
                <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
              </form></Form></DialogContent></Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Author</TableHead><TableHead>ISBN</TableHead><TableHead>Category</TableHead><TableHead>Shelf</TableHead><TableHead>Available</TableHead><TableHead>Status</TableHead>{!isStudent && <TableHead></TableHead>}</TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={isStudent ? 7 : 8} className="text-center">Loading...</TableCell></TableRow> : books?.length === 0 ? <TableRow><TableCell colSpan={isStudent ? 7 : 8} className="text-center text-muted-foreground">No books.</TableCell></TableRow> : books?.map(b => (
            <TableRow key={b.id}><TableCell className="font-medium">{b.title}</TableCell><TableCell>{b.author}</TableCell><TableCell>{b.isbn || '-'}</TableCell><TableCell><Badge variant="secondary">{b.category}</Badge></TableCell><TableCell>{b.shelfLocation || '-'}</TableCell><TableCell>{b.availableCopies}/{b.totalCopies}</TableCell><TableCell><Badge variant={b.availableCopies > 0 ? 'default' : 'destructive'}>{b.availableCopies > 0 ? 'Available' : 'All Issued'}</Badge></TableCell>{!isStudent && <TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: b.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListLibraryBooksQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell>}</TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}

function IssuedBooks() {
  const { user } = useAuth();
  const isStudent = user?.role === "Student";
  const { data: issued, isLoading } = useListLibraryIssued();
  const { data: books } = useListLibraryBooks();
  const { data: students } = useListStudents();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const issueM = useIssueLibraryBook();
  const updateM = useUpdateLibraryIssued();
  const form = useForm({ defaultValues: { bookId: 0, memberId: 0, memberType: "Student", issueDate: new Date().toISOString().split('T')[0], dueDate: "", remarks: "" } });
  const onSubmit = (data: any) => { issueM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListLibraryIssuedQueryKey() }); qc.invalidateQueries({ queryKey: getListLibraryBooksQueryKey() }); toast({ title: "Book issued" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getBookTitle = (id: number) => books?.find(b => b.id === id)?.title || '-';
  const getMemberName = (id: number, type: string) => { if (type === 'Student') { const s = students?.find(st => st.id === id); return s ? `${s.rollNumber} - ${s.firstName}` : '-'; } return `Staff #${id}`; };
  const handleReturn = (id: number) => {
    const today = new Date().toISOString().split('T')[0];
    updateM.mutate({ id, data: { status: 'Returned', returnDate: today } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListLibraryIssuedQueryKey() }); qc.invalidateQueries({ queryKey: getListLibraryBooksQueryKey() }); toast({ title: "Book returned" }); } });
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isStudent ? "My Borrowed Books" : "Issue / Return"}</CardTitle>
        {!isStudent && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Issue Book</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Issue Book</DialogTitle></DialogHeader>
              <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="bookId" render={({ field }) => (<FormItem><FormLabel>Book *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{books?.filter(b => b.availableCopies > 0).map(b => <SelectItem key={b.id} value={String(b.id)}>{b.title} ({b.availableCopies} avail)</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="memberId" render={({ field }) => (<FormItem><FormLabel>Student *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="issueDate" render={({ field }) => (<FormItem><FormLabel>Issue Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="dueDate" render={({ field }) => (<FormItem><FormLabel>Due Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                </div>
                <DialogFooter><Button type="submit" disabled={issueM.isPending}>Issue</Button></DialogFooter>
              </form></Form></DialogContent></Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isStudent && issued?.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-muted-foreground">You have no borrowed books.</div>
        ) : (
          <Table><TableHeader><TableRow><TableHead>Book</TableHead>{!isStudent && <TableHead>Member</TableHead>}<TableHead>Issue Date</TableHead><TableHead>Due Date</TableHead><TableHead>Return Date</TableHead><TableHead>Fine</TableHead><TableHead>Status</TableHead>{!isStudent && <TableHead>Action</TableHead>}</TableRow></TableHeader>
            <TableBody>{isLoading ? <TableRow><TableCell colSpan={isStudent ? 6 : 8} className="text-center">Loading...</TableCell></TableRow> : issued?.length === 0 ? <TableRow><TableCell colSpan={isStudent ? 6 : 8} className="text-center text-muted-foreground">No records.</TableCell></TableRow> : issued?.map(i => (
              <TableRow key={i.id}><TableCell className="font-medium">{getBookTitle(i.bookId)}</TableCell>{!isStudent && <TableCell>{getMemberName(i.memberId, i.memberType)}</TableCell>}<TableCell>{i.issueDate}</TableCell><TableCell>{i.dueDate}</TableCell><TableCell>{i.returnDate || '-'}</TableCell><TableCell>{i.fineAmount ? `Rs.${i.fineAmount}` : '-'}</TableCell><TableCell><Badge variant={i.status === 'Issued' ? 'destructive' : 'default'}>{i.status}</Badge></TableCell>{!isStudent && <TableCell>{i.status === 'Issued' && <Button variant="outline" size="sm" onClick={() => handleReturn(i.id)}>Return</Button>}</TableCell>}</TableRow>
            ))}</TableBody></Table>
        )}
      </CardContent>
    </Card>
  );
}
