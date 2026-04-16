import { useState } from "react";
import { useListSettings, useUpsertSetting, getListSettingsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Settings2, Building2, Calendar, GraduationCap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useInstitution } from "@/contexts/institution";

const DEFAULT_SETTINGS = [
  { key: "institution_name", value: "", category: "Institution", description: "Name of the institution" },
  { key: "institution_code", value: "", category: "Institution", description: "AICTE/University code" },
  { key: "affiliated_university", value: "Madurai Kamaraj University", category: "Institution", description: "Affiliated university name" },
  { key: "institution_location", value: "Tamil Nadu, India", category: "Institution", description: "City/State location" },
  { key: "institution_address", value: "", category: "Institution", description: "Full address" },
  { key: "institution_phone", value: "", category: "Institution", description: "Contact phone" },
  { key: "institution_email", value: "", category: "Institution", description: "Contact email" },
  { key: "institution_website", value: "", category: "Institution", description: "Website URL" },
  { key: "principal_name", value: "", category: "Institution", description: "Principal/Director name" },
  { key: "current_academic_year", value: "2024-2025", category: "Academic", description: "Current academic year" },
  { key: "current_semester", value: "Odd", category: "Academic", description: "Current semester (Odd/Even)" },
  { key: "semester_start_date", value: "", category: "Academic", description: "Semester start date" },
  { key: "semester_end_date", value: "", category: "Academic", description: "Semester end date" },
  { key: "attendance_threshold", value: "75", category: "Academic", description: "Minimum attendance percentage" },
  { key: "max_semesters", value: "8", category: "Academic", description: "Maximum semesters for UG" },
  { key: "grading_system", value: "CGPA", category: "Academic", description: "Grading system (CGPA/Percentage)" },
  { key: "pass_percentage", value: "40", category: "Academic", description: "Minimum pass percentage" },
  { key: "late_fee_per_day", value: "50", category: "Fees", description: "Late fee per day (INR)" },
  { key: "max_late_fee", value: "5000", category: "Fees", description: "Maximum late fee (INR)" },
  { key: "fee_due_reminder_days", value: "7", category: "Fees", description: "Days before due date to send reminder" },
  { key: "razorpay_enabled", value: "true", category: "Fees", description: "Enable Razorpay payments" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Settings & Configuration</h2><p className="text-muted-foreground">Configure institution details, academic settings, and system preferences.</p></div>
      <Tabs defaultValue="institution">
        <TabsList><TabsTrigger value="institution"><Building2 className="w-4 h-4 mr-1" />Institution</TabsTrigger><TabsTrigger value="academic"><GraduationCap className="w-4 h-4 mr-1" />Academic</TabsTrigger><TabsTrigger value="fees"><Calendar className="w-4 h-4 mr-1" />Fees</TabsTrigger><TabsTrigger value="all"><Settings2 className="w-4 h-4 mr-1" />All Settings</TabsTrigger></TabsList>
        <TabsContent value="institution"><SettingsCategory category="Institution" /></TabsContent>
        <TabsContent value="academic"><SettingsCategory category="Academic" /></TabsContent>
        <TabsContent value="fees"><SettingsCategory category="Fees" /></TabsContent>
        <TabsContent value="all"><AllSettings /></TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsCategory({ category }: { category: string }) {
  const { data: settings, isLoading } = useListSettings();
  const upsertMutation = useUpsertSetting();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { refresh: refreshInstitution } = useInstitution();
  const [values, setValues] = useState<Record<string, string>>({});

  const categoryDefaults = DEFAULT_SETTINGS.filter(d => d.category === category);
  const categorySettings = categoryDefaults.map(def => {
    const existing = settings?.find(s => s.key === def.key);
    return { ...def, value: values[def.key] ?? existing?.value ?? def.value, id: existing?.id };
  });

  const handleSave = (key: string) => {
    const val = values[key];
    if (val === undefined) return;
    upsertMutation.mutate({ key, data: { value: val, category, description: categoryDefaults.find(d => d.key === key)?.description } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSettingsQueryKey() });
        refreshInstitution();
        toast({ title: "Setting saved" });
      },
      onError: () => toast({ title: "Error saving setting", variant: "destructive" }),
    });
  };

  const handleSaveAll = () => {
    categorySettings.forEach(s => {
      const val = values[s.key];
      if (val !== undefined) {
        upsertMutation.mutate({ key: s.key, data: { value: val, category, description: s.description } });
      }
    });
    queryClient.invalidateQueries({ queryKey: getListSettingsQueryKey() });
    refreshInstitution();
    toast({ title: "All settings saved" });
    setValues({});
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>{category} Settings</CardTitle><CardDescription>Configure {category.toLowerCase()} parameters</CardDescription></div>
        <Button onClick={handleSaveAll} disabled={Object.keys(values).length === 0}><Save className="w-4 h-4 mr-2" />Save All</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <p>Loading...</p> : (
          <div className="space-y-4">
            {categorySettings.map(s => (
              <div key={s.key} className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <p className="font-medium text-sm">{s.description}</p>
                  <p className="text-xs text-muted-foreground">{s.key}</p>
                </div>
                <Input value={values[s.key] ?? s.value} onChange={(e) => setValues(prev => ({ ...prev, [s.key]: e.target.value }))} className="col-span-1" />
                <Button variant="outline" size="sm" onClick={() => handleSave(s.key)} disabled={values[s.key] === undefined}><Save className="w-3 h-3 mr-1" />Save</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional().nullable(),
});

function AllSettings() {
  const { data: settings, isLoading } = useListSettings();
  const [isOpen, setIsOpen] = useState(false);
  const upsertMutation = useUpsertSetting();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm({ resolver: zodResolver(settingSchema), defaultValues: { key: "", value: "", category: "General", description: "" } });

  const onSubmit = (values: any) => {
    upsertMutation.mutate({ key: values.key, data: { value: values.value, category: values.category, description: values.description } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSettingsQueryKey() });
        toast({ title: "Setting saved" });
        setIsOpen(false);
        form.reset();
      },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Settings</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Setting</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Add Custom Setting</DialogTitle></DialogHeader>
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="key" render={({ field }) => (<FormItem><FormLabel>Key</FormLabel><FormControl><Input {...field} placeholder="setting_key" /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="value" render={({ field }) => (<FormItem><FormLabel>Value</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="General">General</SelectItem><SelectItem value="Institution">Institution</SelectItem><SelectItem value="Academic">Academic</SelectItem><SelectItem value="Fees">Fees</SelectItem><SelectItem value="Notification">Notification</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={upsertMutation.isPending}>Save</Button></DialogFooter>
            </form></Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <p>Loading...</p> : settings?.length === 0 ? <p className="text-muted-foreground text-center py-8">No settings configured yet. Use the category tabs to set up defaults.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Key</TableHead><TableHead>Value</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
            <TableBody>{settings?.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-sm">{s.key}</TableCell>
                <TableCell>{s.value}</TableCell>
                <TableCell><Badge variant="outline">{s.category}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{s.description || '-'}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
