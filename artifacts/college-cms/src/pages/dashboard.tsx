import React, { useEffect, useState } from "react";
import { useGetDashboardSummary, useGetDepartmentStats, useGetRecentActivity, useGetFeeOverview, useGetAttendanceOverview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, Briefcase, IndianRupee, UserCheck, TrendingUp, AlertCircle, CalendarCheck, Clock, FileText, BookCheck } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function Dashboard() {
  const { user, token } = useAuth();
  const isStudent = user?.role === "Student";

  if (isStudent) return <StudentDashboard />;
  return <AdminDashboard />;
}

function StudentDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/dashboard/student-summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <div className="text-center py-12 text-muted-foreground">Unable to load dashboard.</div>;

  const { student, attendance, fees } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Welcome, {student.firstName}!
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">Your personal academic overview.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Roll Number</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-foreground">{student.rollNumber}</div>
            <p className="text-xs text-muted-foreground mt-1">{student.departmentName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Semester</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-foreground">Sem {student.semester}</div>
            <p className="text-xs text-muted-foreground mt-1">{student.courseName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Attendance</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-2xl font-bold ${attendance.percentage >= 75 ? "text-emerald-600" : attendance.percentage >= 60 ? "text-amber-600" : "text-red-600"}`}>
              {attendance.percentage}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">{attendance.present}/{attendance.total} classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Fees Paid</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {"\u20B9"}{fees.totalPaid.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{fees.paymentCount} payment(s)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ProfileRow label="Full Name" value={`${student.firstName} ${student.lastName}`} />
              <ProfileRow label="Department" value={student.departmentName} />
              <ProfileRow label="Course" value={student.courseName} />
              <ProfileRow label="Semester" value={`Semester ${student.semester}`} />
              <ProfileRow label="Email" value={student.email || "-"} />
              <ProfileRow label="Phone" value={student.phone || "-"} />
              <ProfileRow label="Blood Group" value={student.bloodGroup || "-"} />
              <ProfileRow label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-IN") : "-"} />
              <ProfileRow label="Status" value={student.status} badge />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={attendance.percentage >= 75 ? "#059669" : attendance.percentage >= 60 ? "#d97706" : "#dc2626"}
                    strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${(attendance.percentage / 100) * 314} 314`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold">{attendance.percentage}%</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center w-full">
                <div>
                  <div className="text-lg font-bold text-emerald-600">{attendance.present}</div>
                  <div className="text-xs text-muted-foreground">Present</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">{attendance.total - attendance.present}</div>
                  <div className="text-xs text-muted-foreground">Absent</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileRow({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {badge ? (
        <Badge variant={value === "Active" ? "default" : "secondary"}>{value}</Badge>
      ) : (
        <span className="text-sm font-medium text-foreground">{value}</span>
      )}
    </div>
  );
}

function AdminDashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: deptStats, isLoading: isDeptStatsLoading } = useGetDepartmentStats();
  const { data: activity, isLoading: isActivityLoading } = useGetRecentActivity({ limit: 5 });
  const { data: feeOverview, isLoading: isFeeLoading } = useGetFeeOverview();
  const { data: attendance, isLoading: isAttendanceLoading } = useGetAttendanceOverview();

  const COLORS = ['#1e40af', '#eab308', '#059669', '#dc2626', '#9333ea'];

  if (isSummaryLoading || isDeptStatsLoading || isActivityLoading || isFeeLoading || isAttendanceLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Welcome to the College Management System portal.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Students"
          value={summary?.totalStudents || 0}
          description={`${summary?.activeStudents || 0} active`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <SummaryCard
          title="Total Staff"
          value={summary?.totalStaff || 0}
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
        />
        <SummaryCard
          title="Depts & Courses"
          value={`${summary?.totalDepartments || 0} / ${summary?.totalCourses || 0}`}
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
        />
        <SummaryCard
          title="Avg Attendance"
          value={`${summary?.averageAttendance?.toFixed(1) || 0}%`}
          icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Department Wise Strength</CardTitle>
            <CardDescription>Number of students per department</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptStats || []} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="departmentName"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted)/0.4)" }}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Bar dataKey="studentCount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Fee Collection</CardTitle>
            <CardDescription>Current academic year summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Collected', value: feeOverview?.totalCollected || 0 },
                      { name: 'Pending', value: feeOverview?.totalPending || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell key="cell-0" fill="hsl(var(--chart-3))" />
                    <Cell key="cell-1" fill="hsl(var(--chart-4))" />
                  </Pie>
                  <Tooltip formatter={(value) => `\u20B9${(value as number).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center px-4 py-2 bg-muted/50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-chart-3"></span> Collected</span>
                <span className="font-semibold text-sm sm:text-base">{"\u20B9"}{(feeOverview?.totalCollected || 0).toLocaleString()}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><span className="w-2 h-2 rounded-full bg-chart-4"></span> Pending</span>
                <span className="font-semibold text-sm sm:text-base">{"\u20B9"}{(feeOverview?.totalPending || 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Department Attendance</CardTitle>
            <CardDescription>Average attendance percentage by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendance?.departmentWise?.map((dept, i) => (
                <div key={dept.departmentName} className="flex items-center">
                  <div className="w-16 sm:w-24 text-xs sm:text-sm font-medium truncate" title={dept.departmentName}>
                    {dept.departmentName}
                  </div>
                  <div className="flex-1 ml-2 sm:ml-4">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${dept.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right text-xs sm:text-sm font-medium ml-2 sm:ml-4">
                    {dept.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
            <CardDescription>Latest system updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activity?.map((item) => (
                <div key={item.id} className="flex gap-3 sm:gap-4">
                  <div className="mt-0.5 flex-none rounded-full bg-muted p-1">
                    <ActivityIcon type={item.type} />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-none text-foreground truncate">
                      {item.entityName}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!activity || activity.length === 0) && (
                <div className="text-sm text-muted-foreground text-center py-4">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, description, icon }: { title: string, value: React.ReactNode, description?: string, icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-lg sm:text-2xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type.toLowerCase()) {
    case 'student': return <Users className="h-4 w-4 text-chart-1" />;
    case 'staff': return <Briefcase className="h-4 w-4 text-chart-2" />;
    case 'fee': return <IndianRupee className="h-4 w-4 text-chart-3" />;
    case 'attendance': return <CalendarCheck className="h-4 w-4 text-chart-4" />;
    default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 h-[400px]">
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
        <Card className="lg:col-span-3 h-[400px]">
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full rounded-full" /></CardContent>
        </Card>
      </div>
    </div>
  );
}
