import { useState, useEffect } from "react";
import { useListStudents, useCreateStudent, useUpdateStudent, useDeleteStudent, getListStudentsQueryKey, useListDepartments, useListCourses, useListDisciplinaryRecords, useCreateDisciplinaryRecord, getListDisciplinaryRecordsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Search, GraduationCap, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  rollNumber: z.string().min(1, "Roll number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().min(1, "Gender is required"),
  community: z.string().min(1, "Community is required"),
  religion: z.string().optional().nullable(),
  caste: z.string().optional().nullable(),
  nationality: z.string().default("Indian"),
  motherTongue: z.string().optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  aadharNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  state: z.string().default("Tamil Nadu"),
  pincode: z.string().optional().nullable(),
  fatherName: z.string().optional().nullable(),
  motherName: z.string().optional().nullable(),
  guardianPhone: z.string().optional().nullable(),
  guardianOccupation: z.string().optional().nullable(),
  annualIncome: z.coerce.number().optional().nullable(),
  departmentId: z.coerce.number().min(1, "Department is required"),
  courseId: z.coerce.number().min(1, "Course is required"),
  year: z.coerce.number().min(1).max(4),
  semester: z.coerce.number().min(1).max(8),
  batch: z.string().optional().nullable(),
  admissionDate: z.string().min(1, "Admission date is required"),
  admissionType: z.string().min(1, "Admission type is required"),
  scholarshipStatus: z.string().optional().nullable(),
  firstGraduate: z.boolean().default(false),
  admissionStatus: z.string().default("Confirmed"),
  applicationNumber: z.string().optional().nullable(),
  previousInstitution: z.string().optional().nullable(),
  previousCourse: z.string().optional().nullable(),
  entranceScore: z.string().optional().nullable(),
  isAlumni: z.boolean().default(false),
  graduationDate: z.string().optional().nullable(),
  alumniEmail: z.string().optional().nullable(),
  status: z.string().default("Active"),
});

export default function Students() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Students</h2><p className="text-muted-foreground">Manage student enrollment and records.</p></div>
      <Tabs defaultValue="all">
        <TabsList className="flex-wrap"><TabsTrigger value="all">All Students</TabsTrigger><TabsTrigger value="admissions">Admissions</TabsTrigger><TabsTrigger value="alumni">Alumni</TabsTrigger><TabsTrigger value="disciplinary">Disciplinary</TabsTrigger></TabsList>
        <TabsContent value="all"><StudentList /></TabsContent>
        <TabsContent value="admissions"><AdmissionsWorkflow /></TabsContent>
        <TabsContent value="alumni"><AlumniList /></TabsContent>
        <TabsContent value="disciplinary"><DisciplinaryRecords /></TabsContent>
      </Tabs>
    </div>
  );
}

function StudentList() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [communityFilter, setCommunityFilter] = useState<string>("");
  const [batchFilter, setBatchFilter] = useState<string>("");
  const { data: students, isLoading } = useListStudents({
    search: search || undefined,
    departmentId: deptFilter && deptFilter !== "all" ? Number(deptFilter) : undefined,
    community: communityFilter && communityFilter !== "all" ? communityFilter : undefined,
  });
  const { data: departments } = useListDepartments();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredStudents = batchFilter && batchFilter !== "all"
    ? students?.filter(s => s.batch === batchFilter)
    : students;

  const statusColor = (s: string) => {
    switch (s) {
      case "Active": return "default";
      case "Graduated": return "secondary";
      case "Dropped": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <StudentDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" data-testid="input-search-students" />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[200px]" data-testid="select-department-filter"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={communityFilter} onValueChange={setCommunityFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-community-filter"><SelectValue placeholder="Community" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="OC">OC</SelectItem>
                <SelectItem value="BC">BC</SelectItem>
                <SelectItem value="MBC">MBC</SelectItem>
                <SelectItem value="SC">SC</SelectItem>
                <SelectItem value="ST">ST</SelectItem>
              </SelectContent>
            </Select>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-batch-filter"><SelectValue placeholder="All Batches" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {(() => {
                  const batches = [...new Set(students?.map(s => s.batch).filter(Boolean) || [])].sort().reverse();
                  return batches.map(b => <SelectItem key={b!} value={b!}>{b}</SelectItem>);
                })()}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Community</TableHead>
                <TableHead>Year/Sem</TableHead>
                <TableHead>Admission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
              ) : filteredStudents?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No students found.</TableCell></TableRow>
              ) : (
                filteredStudents?.map((s) => (
                  <TableRow key={s.id} data-testid={`row-student-${s.id}`}>
                    <TableCell className="font-medium">{s.rollNumber}</TableCell>
                    <TableCell>{s.firstName} {s.lastName}</TableCell>
                    <TableCell>{s.batch ? <Badge variant="outline" className="font-mono text-xs">{s.batch}</Badge> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                    <TableCell><Badge variant="outline">{s.community}</Badge></TableCell>
                    <TableCell>{s.year} / {s.semester}</TableCell>
                    <TableCell>{s.admissionType}</TableCell>
                    <TableCell><Badge variant={statusColor(s.status) as any}>{s.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <StudentDialog student={s} open={editingId === s.id} onOpenChange={(open: boolean) => setEditingId(open ? s.id : null)} trigger={<Button variant="ghost" size="icon" data-testid={`button-edit-student-${s.id}`}><Edit2 className="w-4 h-4" /></Button>} />
                        <DeleteStudentButton id={s.id} name={`${s.firstName} ${s.lastName}`} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentDialog({ student, open, onOpenChange, trigger }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const { data: departments } = useListDepartments();
  const { data: courses } = useListCourses();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rollNumber: student?.rollNumber || "",
      firstName: student?.firstName || "",
      lastName: student?.lastName || "",
      email: student?.email || "",
      phone: student?.phone || "",
      dateOfBirth: student?.dateOfBirth || "",
      gender: student?.gender || "Male",
      community: student?.community || "OC",
      religion: student?.religion || "",
      caste: student?.caste || "",
      nationality: student?.nationality || "Indian",
      motherTongue: student?.motherTongue || "Tamil",
      bloodGroup: student?.bloodGroup || "",
      aadharNumber: student?.aadharNumber || "",
      address: student?.address || "",
      city: student?.city || "",
      district: student?.district || "",
      state: student?.state || "Tamil Nadu",
      pincode: student?.pincode || "",
      fatherName: student?.fatherName || "",
      motherName: student?.motherName || "",
      guardianPhone: student?.guardianPhone || "",
      guardianOccupation: student?.guardianOccupation || "",
      annualIncome: student?.annualIncome || null,
      departmentId: student?.departmentId || 0,
      courseId: student?.courseId || 0,
      year: student?.year || 1,
      semester: student?.semester || 1,
      batch: student?.batch || "",
      admissionDate: student?.admissionDate || new Date().toISOString().split('T')[0],
      admissionType: student?.admissionType || "Government",
      scholarshipStatus: student?.scholarshipStatus || "",
      firstGraduate: student?.firstGraduate || false,
      admissionStatus: student?.admissionStatus || "Confirmed",
      applicationNumber: student?.applicationNumber || "",
      previousInstitution: student?.previousInstitution || "",
      previousCourse: student?.previousCourse || "",
      entranceScore: student?.entranceScore || "",
      isAlumni: student?.isAlumni || false,
      graduationDate: student?.graduationDate || "",
      alumniEmail: student?.alumniEmail || "",
      status: student?.status || "Active",
    },
  });

  const watchedCourseId = form.watch("courseId");
  const watchedAdmissionDate = form.watch("admissionDate");

  useEffect(() => {
    if (watchedCourseId && watchedAdmissionDate && courses) {
      const selectedCourse = courses.find((c: any) => c.id === watchedCourseId);
      if (selectedCourse) {
        const admYear = new Date(watchedAdmissionDate).getFullYear();
        const duration = selectedCourse.duration || 3;
        const endYear = admYear + duration;
        form.setValue("batch", `${admYear}-${endYear}`);
      }
    }
  }, [watchedCourseId, watchedAdmissionDate, courses]);

  const onSubmit = (data: any) => {
    const cleanData = {
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      dateOfBirth: data.dateOfBirth || null,
      religion: data.religion || null,
      caste: data.caste || null,
      motherTongue: data.motherTongue || null,
      bloodGroup: data.bloodGroup || null,
      aadharNumber: data.aadharNumber || null,
      address: data.address || null,
      city: data.city || null,
      district: data.district || null,
      pincode: data.pincode || null,
      fatherName: data.fatherName || null,
      motherName: data.motherName || null,
      guardianPhone: data.guardianPhone || null,
      guardianOccupation: data.guardianOccupation || null,
      annualIncome: data.annualIncome || null,
      batch: data.batch || null,
      scholarshipStatus: data.scholarshipStatus || null,
    };
    const mutation = student ? updateMutation : createMutation;
    const payload = student ? { id: student.id, data: cleanData } : { data: cleanData };
    mutation.mutate(payload as any, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        toast({ title: `Student ${student ? 'updated' : 'enrolled'} successfully` });
        onOpenChange(false);
        form.reset();
      },
      onError: () => toast({ title: "Error saving student", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button data-testid="button-add-student"><Plus className="w-4 h-4 mr-2" /> Add Student</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit' : 'Enroll'} Student</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Personal Information</h4>
                <div className="grid grid-cols-3 gap-3">
                  <FormField control={form.control} name="rollNumber" render={({ field }) => (
                    <FormItem><FormLabel>Roll Number *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem><FormLabel>Gender *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                    <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                    <FormItem><FormLabel>Blood Group</FormLabel><Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem><SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem><SelectItem value="O+">O+</SelectItem><SelectItem value="O-">O-</SelectItem><SelectItem value="AB+">AB+</SelectItem><SelectItem value="AB-">AB-</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="aadharNumber" render={({ field }) => (
                    <FormItem><FormLabel>Aadhar Number</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Community & Social Details</h4>
                <div className="grid grid-cols-3 gap-3">
                  <FormField control={form.control} name="community" render={({ field }) => (
                    <FormItem><FormLabel>Community *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="OC">OC</SelectItem><SelectItem value="BC">BC</SelectItem><SelectItem value="MBC">MBC</SelectItem><SelectItem value="SC">SC</SelectItem><SelectItem value="ST">ST</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="religion" render={({ field }) => (
                    <FormItem><FormLabel>Religion</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="caste" render={({ field }) => (
                    <FormItem><FormLabel>Caste</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="nationality" render={({ field }) => (
                    <FormItem><FormLabel>Nationality</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="motherTongue" render={({ field }) => (
                    <FormItem><FormLabel>Mother Tongue</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Address</h4>
                <div className="grid grid-cols-3 gap-3">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem className="col-span-3"><FormLabel>Address</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="district" render={({ field }) => (
                    <FormItem><FormLabel>District</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="pincode" render={({ field }) => (
                    <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Guardian Details</h4>
                <div className="grid grid-cols-3 gap-3">
                  <FormField control={form.control} name="fatherName" render={({ field }) => (
                    <FormItem><FormLabel>Father's Name</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="motherName" render={({ field }) => (
                    <FormItem><FormLabel>Mother's Name</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="guardianPhone" render={({ field }) => (
                    <FormItem><FormLabel>Guardian Phone</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="guardianOccupation" render={({ field }) => (
                    <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="annualIncome" render={({ field }) => (
                    <FormItem><FormLabel>Annual Income</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Academic Details</h4>
                <div className="grid grid-cols-3 gap-3">
                  <FormField control={form.control} name="departmentId" render={({ field }) => (
                    <FormItem><FormLabel>Department *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{departments?.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="courseId" render={({ field }) => (
                    <FormItem><FormLabel>Course *</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{courses?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="year" render={({ field }) => (
                    <FormItem><FormLabel>Year *</FormLabel><FormControl><Input type="number" min={1} max={4} {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="semester" render={({ field }) => (
                    <FormItem><FormLabel>Semester *</FormLabel><FormControl><Input type="number" min={1} max={8} {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="batch" render={({ field }) => (
                    <FormItem><FormLabel>Batch</FormLabel><FormControl><Input {...field} value={field.value || ""} placeholder="2024-2027" readOnly={true} tabIndex={-1} className="bg-muted cursor-not-allowed" /></FormControl><FormMessage /><p className="text-[10px] text-muted-foreground">Auto-calculated from admission date + course duration</p></FormItem>
                  )} />
                  <FormField control={form.control} name="admissionDate" render={({ field }) => (
                    <FormItem><FormLabel>Admission Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="admissionType" render={({ field }) => (
                    <FormItem><FormLabel>Admission Type *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Government">Government</SelectItem><SelectItem value="Management">Management</SelectItem><SelectItem value="Lateral">Lateral Entry</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="scholarshipStatus" render={({ field }) => (
                    <FormItem><FormLabel>Scholarship</FormLabel><Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="BC Scholarship">BC Scholarship</SelectItem><SelectItem value="MBC Scholarship">MBC Scholarship</SelectItem><SelectItem value="SC Scholarship">SC/ST Scholarship</SelectItem><SelectItem value="Merit Scholarship">Merit Scholarship</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Graduated">Graduated</SelectItem><SelectItem value="Dropped">Dropped</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="firstGraduate" render={({ field }) => (
                    <FormItem className="flex items-end gap-2 space-y-0 pb-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>First Graduate</FormLabel></FormItem>
                  )} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Admission Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="admissionStatus" render={({ field }) => (
                    <FormItem><FormLabel>Admission Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Applied">Applied</SelectItem><SelectItem value="Provisional">Provisional</SelectItem><SelectItem value="Confirmed">Confirmed</SelectItem><SelectItem value="Rejected">Rejected</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="applicationNumber" render={({ field }) => (
                    <FormItem><FormLabel>Application Number</FormLabel><FormControl><Input {...field} value={field.value || ""} placeholder="APP-2024-001" /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="previousInstitution" render={({ field }) => (
                    <FormItem><FormLabel>Previous Institution</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="previousCourse" render={({ field }) => (
                    <FormItem><FormLabel>Previous Course</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="entranceScore" render={({ field }) => (
                    <FormItem><FormLabel>Entrance Score</FormLabel><FormControl><Input {...field} value={field.value || ""} placeholder="185.5" /></FormControl></FormItem>
                  )} />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-student">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function DeleteStudentButton({ id, name }: { id: number; name: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteStudent();
  const handleDelete = () => {
    if (confirm(`Delete student ${name}?`)) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() }); toast({ title: "Student deleted" }); },
        onError: () => toast({ title: "Error deleting student", variant: "destructive" }),
      });
    }
  };
  return <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:bg-destructive/10" data-testid={`button-delete-student-${id}`}><Trash2 className="w-4 h-4" /></Button>;
}

function AdmissionsWorkflow() {
  const { data: students } = useListStudents();
  const updateMutation = useUpdateStudent();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const admissionStudents = students?.filter(s => s.admissionStatus && s.admissionStatus !== "Confirmed") || [];
  const provisionalStudents = students?.filter(s => s.admissionStatus === "Provisional") || [];
  const appliedStudents = students?.filter(s => s.admissionStatus === "Applied") || [];
  const confirmedCount = students?.filter(s => s.admissionStatus === "Confirmed").length || 0;

  const changeStatus = (id: number, status: string) => {
    updateMutation.mutate({ id, data: { admissionStatus: status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        toast({ title: `Admission status updated to ${status}` });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{appliedStudents.length}</div><p className="text-muted-foreground text-sm">Applied</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{provisionalStudents.length}</div><p className="text-muted-foreground text-sm">Provisional</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{confirmedCount}</div><p className="text-muted-foreground text-sm">Confirmed</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{students?.length || 0}</div><p className="text-muted-foreground text-sm">Total</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Pending Admissions</CardTitle></CardHeader>
        <CardContent>
          {[...appliedStudents, ...provisionalStudents].length === 0 ? <p className="text-muted-foreground text-center py-8">No pending admissions.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Roll No</TableHead><TableHead>Name</TableHead><TableHead>App No</TableHead><TableHead>Previous Institution</TableHead><TableHead>Entrance Score</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>{[...appliedStudents, ...provisionalStudents].map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.rollNumber}</TableCell>
                  <TableCell>{s.firstName} {s.lastName}</TableCell>
                  <TableCell>{s.applicationNumber || '-'}</TableCell>
                  <TableCell>{s.previousInstitution || '-'}</TableCell>
                  <TableCell>{s.entranceScore || '-'}</TableCell>
                  <TableCell><Badge variant={s.admissionStatus === 'Applied' ? 'secondary' : 'outline'}>{s.admissionStatus}</Badge></TableCell>
                  <TableCell className="space-x-1">
                    {s.admissionStatus === "Applied" && <Button size="sm" variant="outline" onClick={() => changeStatus(s.id, "Provisional")}>Provisional</Button>}
                    {(s.admissionStatus === "Applied" || s.admissionStatus === "Provisional") && <Button size="sm" onClick={() => changeStatus(s.id, "Confirmed")}>Confirm</Button>}
                    <Button size="sm" variant="destructive" onClick={() => changeStatus(s.id, "Rejected")}>Reject</Button>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AlumniList() {
  const { data: students } = useListStudents();
  const updateMutation = useUpdateStudent();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const alumni = students?.filter(s => s.isAlumni) || [];
  const active = students?.filter(s => !s.isAlumni && s.status === "Active") || [];

  const markAlumni = (id: number) => {
    updateMutation.mutate({ id, data: { isAlumni: true, status: "Graduated", graduationDate: new Date().toISOString().split('T')[0] } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        toast({ title: "Student marked as alumni" });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="pt-4"><GraduationCap className="w-6 h-6 mb-2 text-primary" /><div className="text-2xl font-bold">{alumni.length}</div><p className="text-muted-foreground text-sm">Alumni</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{active.length}</div><p className="text-muted-foreground text-sm">Active Students</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Alumni Directory</CardTitle></CardHeader>
        <CardContent>
          {alumni.length === 0 ? <p className="text-muted-foreground text-center py-8">No alumni records found.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Roll No</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Graduation Date</TableHead><TableHead>Alumni Email</TableHead></TableRow></TableHeader>
              <TableBody>{alumni.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.rollNumber}</TableCell>
                  <TableCell>{s.firstName} {s.lastName}</TableCell>
                  <TableCell>{s.email || '-'}</TableCell>
                  <TableCell>{s.graduationDate || '-'}</TableCell>
                  <TableCell>{s.alumniEmail || '-'}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {active.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Mark as Alumni</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Roll No</TableHead><TableHead>Name</TableHead><TableHead>Year/Sem</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
              <TableBody>{active.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.rollNumber}</TableCell>
                  <TableCell>{s.firstName} {s.lastName}</TableCell>
                  <TableCell>{s.year} / {s.semester}</TableCell>
                  <TableCell><Badge>{s.status}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => markAlumni(s.id)}><GraduationCap className="w-3 h-3 mr-1" />Mark Alumni</Button></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const disciplinarySchema = z.object({
  studentId: z.coerce.number().min(1),
  incidentDate: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  severity: z.string().default("Minor"),
  actionTaken: z.string().optional().nullable(),
  actionDate: z.string().optional().nullable(),
  reportedBy: z.string().optional().nullable(),
  status: z.string().default("Open"),
  remarks: z.string().optional().nullable(),
});

function DisciplinaryRecords() {
  const { data: records, isLoading } = useListDisciplinaryRecords();
  const { data: students } = useListStudents();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateDisciplinaryRecord();

  const getStudentName = (id: number) => { const s = students?.find(st => st.id === id); return s ? `${s.firstName} ${s.lastName}` : '-'; };

  const form = useForm({ resolver: zodResolver(disciplinarySchema), defaultValues: { studentId: 0, incidentDate: new Date().toISOString().split('T')[0], category: "", description: "", severity: "Minor", actionTaken: "", actionDate: "", reportedBy: "", status: "Open", remarks: "" } });

  const onSubmit = (values: any) => {
    createMutation.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDisciplinaryRecordsQueryKey() });
        toast({ title: "Record created" });
        setIsOpen(false);
        form.reset();
      },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />Disciplinary Records</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Record</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Create Disciplinary Record</DialogTitle></DialogHeader>
            <ScrollArea className="max-h-[60vh]">
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 p-1">
              <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>Student</FormLabel><Select onValueChange={field.onChange} value={String(field.value || "")}><FormControl><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => (<SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName} ({s.rollNumber})</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="incidentDate" render={({ field }) => (<FormItem><FormLabel>Incident Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Academic Misconduct">Academic Misconduct</SelectItem><SelectItem value="Behavioral Issue">Behavioral Issue</SelectItem><SelectItem value="Attendance Issue">Attendance Issue</SelectItem><SelectItem value="Property Damage">Property Damage</SelectItem><SelectItem value="Ragging">Ragging</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="severity" render={({ field }) => (<FormItem><FormLabel>Severity</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Minor">Minor</SelectItem><SelectItem value="Moderate">Moderate</SelectItem><SelectItem value="Major">Major</SelectItem><SelectItem value="Critical">Critical</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reportedBy" render={({ field }) => (<FormItem><FormLabel>Reported By</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="actionTaken" render={({ field }) => (<FormItem><FormLabel>Action Taken</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>)} />
              <DialogFooter><Button type="submit" disabled={createMutation.isPending}>Create</Button></DialogFooter>
            </form></Form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <p>Loading...</p> : records?.length === 0 ? <p className="text-muted-foreground text-center py-8">No disciplinary records.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Severity</TableHead><TableHead>Action</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{records?.map(r => (
              <TableRow key={r.id}>
                <TableCell>{getStudentName(r.studentId)}</TableCell>
                <TableCell>{r.incidentDate}</TableCell>
                <TableCell>{r.category}</TableCell>
                <TableCell><Badge variant={r.severity === 'Critical' || r.severity === 'Major' ? 'destructive' : 'secondary'}>{r.severity}</Badge></TableCell>
                <TableCell>{r.actionTaken || '-'}</TableCell>
                <TableCell><Badge variant={r.status === 'Resolved' ? 'default' : 'outline'}>{r.status}</Badge></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
