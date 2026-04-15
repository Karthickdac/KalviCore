import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Departments from "@/pages/departments";
import Students from "@/pages/students";
import StaffPage from "@/pages/staff";
import Courses from "@/pages/courses";
import Subjects from "@/pages/subjects";
import AttendancePage from "@/pages/attendance";
import Fees from "@/pages/fees";
import Exams from "@/pages/exams";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
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
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
