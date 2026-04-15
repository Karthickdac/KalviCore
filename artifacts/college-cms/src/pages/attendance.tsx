import { useState } from "react";
import { useListSubjects, useListStudents, useMarkAttendance, useGetStudentAttendanceSummary, getListAttendanceQueryKey, getGetStudentAttendanceSummaryQueryKey, getGetAttendanceOverviewQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Attendance() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Attendance</h2><p className="text-muted-foreground">Mark and track student attendance.</p></div>
      <Tabs defaultValue="mark">
        <TabsList><TabsTrigger value="mark">Mark Attendance</TabsTrigger><TabsTrigger value="summary">Student Summary</TabsTrigger></TabsList>
        <TabsContent value="mark"><MarkAttendance /></TabsContent>
        <TabsContent value="summary"><StudentAttendanceSummary /></TabsContent>
      </Tabs>
    </div>
  );
}

function MarkAttendance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<Record<number, string>>({});
  const { data: subjects } = useListSubjects();
  const { data: students } = useListStudents();
  const markMutation = useMarkAttendance();

  const toggleStatus = (studentId: number) => {
    setRecords(prev => ({ ...prev, [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present' }));
  };

  const markAll = (status: string) => {
    if (!students) return;
    const newRecords: Record<number, string> = {};
    students.forEach(s => { newRecords[s.id] = status; });
    setRecords(newRecords);
  };

  const handleSubmit = () => {
    if (!subjectId) { toast({ title: "Select a subject", variant: "destructive" }); return; }
    const attendanceRecords = Object.entries(records).map(([id, status]) => ({ studentId: Number(id), status }));
    if (attendanceRecords.length === 0) { toast({ title: "Mark attendance for at least one student", variant: "destructive" }); return; }
    markMutation.mutate({ data: { subjectId: Number(subjectId), date, records: attendanceRecords } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAttendanceQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAttendanceOverviewQueryKey() });
        toast({ title: "Attendance marked successfully" });
        setRecords({});
      },
      onError: () => toast({ title: "Error marking attendance", variant: "destructive" }),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="w-[280px]"><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>{subjects?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.code} - {s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-[180px]" />
          </div>
          <Button variant="outline" onClick={() => markAll('Present')}>All Present</Button>
          <Button variant="outline" onClick={() => markAll('Absent')}>All Absent</Button>
          <Button onClick={handleSubmit} disabled={markMutation.isPending}>Submit Attendance</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Roll No</TableHead><TableHead>Name</TableHead><TableHead className="text-center">Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {students?.map(s => (
              <TableRow key={s.id} className="cursor-pointer" onClick={() => toggleStatus(s.id)}>
                <TableCell className="font-medium">{s.rollNumber}</TableCell>
                <TableCell>{s.firstName} {s.lastName}</TableCell>
                <TableCell className="text-center">
                  {records[s.id] === 'Present' ? (
                    <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Present</Badge>
                  ) : records[s.id] === 'Absent' ? (
                    <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Absent</Badge>
                  ) : (
                    <Badge variant="outline">Not Marked</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StudentAttendanceSummary() {
  const [studentId, setStudentId] = useState("");
  const { data: students } = useListStudents();
  const { data: summary } = useGetStudentAttendanceSummary(Number(studentId), { query: { enabled: !!studentId, queryKey: getGetStudentAttendanceSummaryQueryKey(Number(studentId)) } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Attendance Summary</CardTitle>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger className="w-[350px]"><SelectValue placeholder="Select a student" /></SelectTrigger>
          <SelectContent>{students?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.rollNumber} - {s.firstName} {s.lastName}</SelectItem>)}</SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {studentId && summary ? (
          <Table>
            <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Total Classes</TableHead><TableHead>Present</TableHead><TableHead>Absent</TableHead><TableHead>Percentage</TableHead></TableRow></TableHeader>
            <TableBody>
              {summary.length === 0 ? (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No attendance records found.</TableCell></TableRow>) : (
                summary.map(s => (
                  <TableRow key={s.subjectId}>
                    <TableCell className="font-medium">{s.subjectName}</TableCell>
                    <TableCell>{s.totalClasses}</TableCell>
                    <TableCell className="text-green-600 font-medium">{s.present}</TableCell>
                    <TableCell className="text-red-600 font-medium">{s.absent}</TableCell>
                    <TableCell><Badge variant={s.percentage >= 75 ? 'default' : 'destructive'}>{s.percentage}%</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">Select a student to view attendance summary.</p>
        )}
      </CardContent>
    </Card>
  );
}
