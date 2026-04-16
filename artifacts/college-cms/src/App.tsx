import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { InstitutionProvider } from "@/contexts/institution";
import { Layout } from "@/components/layout";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Departments from "@/pages/departments";
import Students from "@/pages/students";
import StaffPage from "@/pages/staff";
import Courses from "@/pages/courses";
import Subjects from "@/pages/subjects";
import AttendancePage from "@/pages/attendance";
import Fees from "@/pages/fees";
import Exams from "@/pages/exams";
import Hostels from "@/pages/hostels";
import Transport from "@/pages/transport";
import Library from "@/pages/library";
import Events from "@/pages/events";
import Communications from "@/pages/communications";
import Inventory from "@/pages/inventory";
import Timetable from "@/pages/timetable";
import Assignments from "@/pages/assignments";
import Certificates from "@/pages/certificates";
import Leaves from "@/pages/leaves";
import SettingsPage from "@/pages/settings";
import UsersPage from "@/pages/users";
import ReportsPage from "@/pages/reports";
import ActivityLogPage from "@/pages/activity-log";
import AcademicCalendarPage from "@/pages/academic-calendar";
import PayrollPage from "@/pages/payroll";
import CGPAPage from "@/pages/cgpa";
import BulkImportPage from "@/pages/bulk-import";
import HallTicketsPage from "@/pages/hall-tickets";
import StudentPortalPage from "@/pages/student-portal";
import BackupPage from "@/pages/backup";
import IDCardsPage from "@/pages/id-cards";
import NotificationsPage from "@/pages/notifications";
import DocumentsPage from "@/pages/documents";
import PrintTemplatesPage from "@/pages/print-templates";
import ParentPortalPage from "@/pages/parent-portal";
import DashboardSettingsPage from "@/pages/dashboard-settings";
import PlacementsPage from "@/pages/placements";
import FundraisingPage from "@/pages/fundraising";
import VisitorsPage from "@/pages/visitors";
import AccessManagementPage from "@/pages/access-management";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/departments" component={Departments} />
        <Route path="/students" component={Students} />
        <Route path="/staff" component={StaffPage} />
        <Route path="/courses" component={Courses} />
        <Route path="/subjects" component={Subjects} />
        <Route path="/attendance" component={AttendancePage} />
        <Route path="/fees" component={Fees} />
        <Route path="/exams" component={Exams} />
        <Route path="/hostels" component={Hostels} />
        <Route path="/transport" component={Transport} />
        <Route path="/library" component={Library} />
        <Route path="/events" component={Events} />
        <Route path="/communications" component={Communications} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/timetable" component={Timetable} />
        <Route path="/assignments" component={Assignments} />
        <Route path="/certificates" component={Certificates} />
        <Route path="/leaves" component={Leaves} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/users" component={UsersPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/activity-log" component={ActivityLogPage} />
        <Route path="/academic-calendar" component={AcademicCalendarPage} />
        <Route path="/payroll" component={PayrollPage} />
        <Route path="/cgpa" component={CGPAPage} />
        <Route path="/bulk-import" component={BulkImportPage} />
        <Route path="/hall-tickets" component={HallTicketsPage} />
        <Route path="/student-portal" component={StudentPortalPage} />
        <Route path="/backup" component={BackupPage} />
        <Route path="/id-cards" component={IDCardsPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/documents" component={DocumentsPage} />
        <Route path="/print-templates" component={PrintTemplatesPage} />
        <Route path="/parent-portal" component={ParentPortalPage} />
        <Route path="/dashboard-settings" component={DashboardSettingsPage} />
        <Route path="/placements" component={PlacementsPage} />
        <Route path="/fundraising" component={FundraisingPage} />
        <Route path="/visitors" component={VisitorsPage} />
        <Route path="/access-management" component={AccessManagementPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <InstitutionProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppRoutes />
            </WouterRouter>
            <Toaster />
          </InstitutionProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
