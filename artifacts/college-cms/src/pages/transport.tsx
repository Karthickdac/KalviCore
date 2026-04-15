import { useState } from "react";
import { useListTransportRoutes, useCreateTransportRoute, useDeleteTransportRoute, useListTransportVehicles, useCreateTransportVehicle, useDeleteTransportVehicle, useListTransportStops, useCreateTransportStop, useListTransportAllocations, useCreateTransportAllocation, useListStudents, getListTransportRoutesQueryKey, getListTransportVehiclesQueryKey, getListTransportStopsQueryKey, getListTransportAllocationsQueryKey } from "@workspace/api-client-react";
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
import { Plus, Route, Bus, MapPin, Users, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Transport() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Transport Management</h2><p className="text-muted-foreground">Manage routes, vehicles, stops, and student allocations.</p></div>
      <Tabs defaultValue="routes">
        <TabsList><TabsTrigger value="routes"><Route className="w-4 h-4 mr-1" />Routes</TabsTrigger><TabsTrigger value="vehicles"><Bus className="w-4 h-4 mr-1" />Vehicles</TabsTrigger><TabsTrigger value="stops"><MapPin className="w-4 h-4 mr-1" />Stops</TabsTrigger><TabsTrigger value="allocations"><Users className="w-4 h-4 mr-1" />Allocations</TabsTrigger></TabsList>
        <TabsContent value="routes"><RouteList /></TabsContent>
        <TabsContent value="vehicles"><VehicleList /></TabsContent>
        <TabsContent value="stops"><StopList /></TabsContent>
        <TabsContent value="allocations"><TransportAllocations /></TabsContent>
      </Tabs>
    </div>
  );
}

function RouteList() {
  const { data: routes, isLoading } = useListTransportRoutes();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateTransportRoute();
  const deleteM = useDeleteTransportRoute();
  const form = useForm({ defaultValues: { routeName: "", routeNumber: "", startPoint: "", endPoint: "", distance: "", estimatedTime: "", fare: 0, status: "Active" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListTransportRoutesQueryKey() }); toast({ title: "Route created" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Routes</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Route</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Add Route</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="routeName" render={({ field }) => (<FormItem><FormLabel>Route Name *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="routeNumber" render={({ field }) => (<FormItem><FormLabel>Route No *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="startPoint" render={({ field }) => (<FormItem><FormLabel>Start Point *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="endPoint" render={({ field }) => (<FormItem><FormLabel>End Point *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="distance" render={({ field }) => (<FormItem><FormLabel>Distance</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="estimatedTime" render={({ field }) => (<FormItem><FormLabel>Est. Time</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="fare" render={({ field }) => (<FormItem><FormLabel>Fare (Rs)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>No</TableHead><TableHead>Name</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Distance</TableHead><TableHead>Fare</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow> : routes?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No routes.</TableCell></TableRow> : routes?.map(r => (
            <TableRow key={r.id}><TableCell className="font-medium">{r.routeNumber}</TableCell><TableCell>{r.routeName}</TableCell><TableCell>{r.startPoint}</TableCell><TableCell>{r.endPoint}</TableCell><TableCell>{r.distance || '-'}</TableCell><TableCell>{Number(r.fare).toLocaleString('en-IN')}</TableCell><TableCell><Badge>{r.status}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => deleteM.mutate({ id: r.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListTransportRoutesQueryKey() }) })}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}

function VehicleList() {
  const { data: vehicles, isLoading } = useListTransportVehicles();
  const { data: routes } = useListTransportRoutes();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateTransportVehicle();
  const form = useForm({ defaultValues: { vehicleNumber: "", vehicleType: "Bus", capacity: 40, driverName: "", driverPhone: "", driverLicense: "", routeId: 0, insuranceExpiry: "", fitnessExpiry: "", status: "Active" } });
  const onSubmit = (data: any) => { const clean = { ...data, routeId: data.routeId || undefined }; createM.mutate({ data: clean }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListTransportVehiclesQueryKey() }); toast({ title: "Vehicle added" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getRouteName = (id: number | null | undefined) => id ? routes?.find(r => r.id === id)?.routeName || '-' : '-';
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Vehicles</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Vehicle</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="vehicleNumber" render={({ field }) => (<FormItem><FormLabel>Vehicle No *</FormLabel><FormControl><Input {...field} placeholder="TN-01-AB-1234" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="vehicleType" render={({ field }) => (<FormItem><FormLabel>Type *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Bus">Bus</SelectItem><SelectItem value="Mini Bus">Mini Bus</SelectItem><SelectItem value="Van">Van</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="capacity" render={({ field }) => (<FormItem><FormLabel>Capacity</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="routeId" render={({ field }) => (<FormItem><FormLabel>Route</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{routes?.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.routeNumber} - {r.routeName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="driverName" render={({ field }) => (<FormItem><FormLabel>Driver *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="driverPhone" render={({ field }) => (<FormItem><FormLabel>Phone *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Vehicle No</TableHead><TableHead>Type</TableHead><TableHead>Capacity</TableHead><TableHead>Driver</TableHead><TableHead>Route</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow> : vehicles?.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No vehicles.</TableCell></TableRow> : vehicles?.map(v => (
            <TableRow key={v.id}><TableCell className="font-medium">{v.vehicleNumber}</TableCell><TableCell>{v.vehicleType}</TableCell><TableCell>{v.capacity}</TableCell><TableCell>{v.driverName}<br/><span className="text-xs text-muted-foreground">{v.driverPhone}</span></TableCell><TableCell>{getRouteName(v.routeId)}</TableCell><TableCell><Badge>{v.status}</Badge></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}

function StopList() {
  const { data: routes } = useListTransportRoutes();
  const [routeFilter, setRouteFilter] = useState("");
  const { data: stops, isLoading } = useListTransportStops(routeFilter && routeFilter !== "all" ? { routeId: Number(routeFilter) } : undefined);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateTransportStop();
  const form = useForm({ defaultValues: { routeId: 0, stopName: "", stopOrder: 1, pickupTime: "", dropTime: "", landmark: "" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListTransportStopsQueryKey() }); toast({ title: "Stop added" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3"><CardTitle>Stops</CardTitle>
          <Select value={routeFilter} onValueChange={setRouteFilter}><SelectTrigger className="w-[200px]"><SelectValue placeholder="All Routes" /></SelectTrigger><SelectContent><SelectItem value="all">All Routes</SelectItem>{routes?.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.routeNumber}</SelectItem>)}</SelectContent></Select>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Stop</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Add Stop</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="routeId" render={({ field }) => (<FormItem><FormLabel>Route *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{routes?.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.routeNumber} - {r.routeName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="stopName" render={({ field }) => (<FormItem><FormLabel>Stop Name *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="stopOrder" render={({ field }) => (<FormItem><FormLabel>Order *</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="pickupTime" render={({ field }) => (<FormItem><FormLabel>Pickup Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="dropTime" render={({ field }) => (<FormItem><FormLabel>Drop Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Save</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>#</TableHead><TableHead>Stop Name</TableHead><TableHead>Pickup</TableHead><TableHead>Drop</TableHead><TableHead>Landmark</TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow> : stops?.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No stops.</TableCell></TableRow> : stops?.map(s => (
            <TableRow key={s.id}><TableCell>{s.stopOrder}</TableCell><TableCell className="font-medium">{s.stopName}</TableCell><TableCell>{s.pickupTime || '-'}</TableCell><TableCell>{s.dropTime || '-'}</TableCell><TableCell>{s.landmark || '-'}</TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}

function TransportAllocations() {
  const { data: allocations, isLoading } = useListTransportAllocations();
  const { data: students } = useListStudents();
  const { data: routes } = useListTransportRoutes();
  const { data: stops } = useListTransportStops();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const createM = useCreateTransportAllocation();
  const form = useForm({ defaultValues: { studentId: 0, routeId: 0, stopId: 0, academicYear: "2024-2025" } });
  const onSubmit = (data: any) => { createM.mutate({ data }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListTransportAllocationsQueryKey() }); toast({ title: "Allocated" }); setIsOpen(false); form.reset(); }, onError: () => toast({ title: "Error", variant: "destructive" }) }); };
  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.rollNumber} - ${s.firstName}` : '-'; };
  const getRouteName = (id: number) => routes?.find(r => r.id === id)?.routeName || '-';
  const getStopName = (id: number) => stops?.find(s => s.id === id)?.stopName || '-';
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Student Allocations</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Allocate</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Allocate Transport</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="routeId" render={({ field }) => (<FormItem><FormLabel>Route *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{routes?.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.routeNumber} - {r.routeName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <FormField control={form.control} name="stopId" render={({ field }) => (<FormItem><FormLabel>Stop *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{stops?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.stopName}</SelectItem>)}</SelectContent></Select></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={createM.isPending}>Allocate</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Route</TableHead><TableHead>Stop</TableHead><TableHead>Year</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{isLoading ? <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow> : allocations?.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No allocations.</TableCell></TableRow> : allocations?.map(a => (
            <TableRow key={a.id}><TableCell>{getStudentName(a.studentId)}</TableCell><TableCell>{getRouteName(a.routeId)}</TableCell><TableCell>{getStopName(a.stopId)}</TableCell><TableCell>{a.academicYear}</TableCell><TableCell><Badge>{a.status}</Badge></TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent>
    </Card>
  );
}
