import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth";
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
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
