import { useState } from "react";
import { useListAssets, useCreateAsset, useDeleteAsset, useUpdateAsset, useListStoreItems, useCreateStoreItem, useDeleteStoreItem, useUpdateStoreItem, useListDepartments, getListAssetsQueryKey, getListStoreItemsQueryKey } from "@workspace/api-client-react";
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
import { Plus, Package, ShoppingCart, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Inventory() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Inventory & Assets</h2><p className="text-muted-foreground">Manage assets, equipment, and store items.</p></div>
      <Tabs defaultValue="assets">
        <TabsList><TabsTrigger value="assets"><Package className="w-4 h-4 mr-1" />Assets</TabsTrigger><TabsTrigger value="store"><ShoppingCart className="w-4 h-4 mr-1" />Store Items</TabsTrigger></TabsList>
        <TabsContent value="assets"><AssetList /></TabsContent>
        <TabsContent value="store"><StoreItemList /></TabsContent>
      </Tabs>
    </div>
  );
}

function AssetList() {
  const { data: assets, isLoading } = useListAssets();
  const { data: departments } = useListDepartments();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateAsset();
  const deleteM = useDeleteAsset();
  const form = useForm({ defaultValues: { assetTag: "", name: "", category: "Furniture", departmentId: 0, location: "", purchaseDate: "", purchasePrice: 0, vendor: "", warrantyExpiry: "", condition: "Good", assignedTo: "", serialNumber: "", status: "Active", remarks: "" } });
  const onSubmit = (data: any) => { const clean = { ...data, departmentId: data.departmentId || undefined, purchasePrice: data.purchasePrice || undefined }; createM.mutate({ data: clean }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListAssetsQueryKey() }); toast({ title: "Asset added" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getDeptName = (id: number | null) => id ? departments?.find(d => d.id === id)?.name || '-' : '-';
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Assets</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Asset</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Asset</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="assetTag" render={({ field }) => (<FormItem><FormLabel>Asset Tag *</FormLabel><FormControl><Input {...field} placeholder="AST-001" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Furniture">Furniture</SelectItem><SelectItem value="Electronics">Electronics</SelectItem><SelectItem value="Computer">Computer</SelectItem><SelectItem value="Lab Equipment">Lab Equipment</SelectItem><SelectItem value="Sports">Sports</SelectItem><SelectItem value="Library">Library</SelectItem><SelectItem value="Vehicle">Vehicle</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="departmentId" render={({ field }) => (<FormItem><FormLabel>Department</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{departments?.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="condition" render={({ field }) => (<FormItem><FormLabel>Condition</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="New">New</SelectItem><SelectItem value="Good">Good</SelectItem><SelectItem value="Fair">Fair</SelectItem><SelectItem value="Poor">Poor</SelectItem><SelectItem value="Damaged">Damaged</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="purchaseDate" render={({ field }) => (<FormItem><FormLabel>Purchase Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="purchasePrice" render={({ field }) => (<FormItem><FormLabel>Price (Rs)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="vendor" render={({ field }) => (<FormItem><FormLabel>Vendor</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="serialNumber" render={({ field }) => (<FormItem><FormLabel>Serial No</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Tag</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Location</TableHead><TableHead>Condition</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow> : assets?.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No assets.</TableCell></TableRow> : assets?.map(a => (
            <TableRow key={a.id}><TableCell className="font-medium">{a.assetTag}</TableCell><TableCell>{a.name}</TableCell><TableCell><Badge variant="secondary">{a.category}</Badge></TableCell><TableCell>{a.location || '-'}</TableCell><TableCell><Badge variant={a.condition === 'Good' || a.condition === 'New' ? 'default' : a.condition === 'Damaged' ? 'destructive' : 'secondary'}>{a.condition}</Badge></TableCell><TableCell><Badge>{a.status}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: a.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListAssetsQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}

function StoreItemList() {
  const { data: items, isLoading } = useListStoreItems();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateStoreItem();
  const deleteM = useDeleteStoreItem();
  const form = useForm({ defaultValues: { itemCode: "", name: "", category: "Stationery", unit: "Nos", currentStock: 0, minimumStock: 0, unitPrice: 0, supplier: "" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListStoreItemsQueryKey() }); toast({ title: "Item added" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Store Items</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Item</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Add Store Item</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="itemCode" render={({ field }) => (<FormItem><FormLabel>Item Code *</FormLabel><FormControl><Input {...field} placeholder="STR-001" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Stationery">Stationery</SelectItem><SelectItem value="Cleaning">Cleaning</SelectItem><SelectItem value="Electrical">Electrical</SelectItem><SelectItem value="Lab Supplies">Lab Supplies</SelectItem><SelectItem value="Sports">Sports</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="unit" render={({ field }) => (<FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Nos">Nos</SelectItem><SelectItem value="Kg">Kg</SelectItem><SelectItem value="Litres">Litres</SelectItem><SelectItem value="Box">Box</SelectItem><SelectItem value="Ream">Ream</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="currentStock" render={({ field }) => (<FormItem><FormLabel>Current Stock</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="minimumStock" render={({ field }) => (<FormItem><FormLabel>Min Stock</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="unitPrice" render={({ field }) => (<FormItem><FormLabel>Unit Price</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="supplier" render={({ field }) => (<FormItem><FormLabel>Supplier</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Stock</TableHead><TableHead>Min</TableHead><TableHead>Unit</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow> : items?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No items.</TableCell></TableRow> : items?.map(i => (
            <TableRow key={i.id}><TableCell className="font-medium">{i.itemCode}</TableCell><TableCell>{i.name}</TableCell><TableCell><Badge variant="secondary">{i.category}</Badge></TableCell><TableCell className={i.currentStock <= i.minimumStock ? 'text-red-600 font-bold' : ''}>{i.currentStock}</TableCell><TableCell>{i.minimumStock}</TableCell><TableCell>{i.unit}</TableCell><TableCell><Badge variant={i.currentStock <= i.minimumStock ? 'destructive' : 'default'}>{i.currentStock <= i.minimumStock ? 'Low Stock' : 'In Stock'}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: i.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListStoreItemsQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}
