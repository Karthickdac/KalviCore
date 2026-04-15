import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import {
  LayoutDashboard, Users, BookOpen, Briefcase, GraduationCap,
  CalendarCheck, IndianRupee, FileText, Menu, Bell, Building2, Bus,
  BookMarked, Calendar, Megaphone, Package, Clock, ClipboardList,
  Award, CalendarOff, Settings, ChevronDown, ChevronRight, LogOut,
  Shield, UserCog, Home, BarChart3, Activity, CalendarDays, Wallet, TrendingUp,
  Upload, Ticket, UserCircle, Database, CreditCard,
  BellRing, FolderOpen, Printer, LayoutGrid,
  Landmark, Heart, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permission: string;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    icon: Home,
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: "dashboard" },
      { name: "Reports", href: "/reports", icon: BarChart3, permission: "dashboard" },
      { name: "Academic Calendar", href: "/academic-calendar", icon: CalendarDays, permission: "dashboard" },
    ],
  },
  {
    label: "Academics",
    icon: GraduationCap,
    items: [
      { name: "Departments", href: "/departments", icon: BookOpen, permission: "departments" },
      { name: "Courses", href: "/courses", icon: GraduationCap, permission: "courses" },
      { name: "Subjects", href: "/subjects", icon: FileText, permission: "subjects" },
      { name: "Timetable", href: "/timetable", icon: Clock, permission: "timetable" },
      { name: "Assignments", href: "/assignments", icon: ClipboardList, permission: "assignments" },
      { name: "Exams", href: "/exams", icon: FileText, permission: "exams" },
      { name: "CGPA Tracker", href: "/cgpa", icon: TrendingUp, permission: "exams" },
      { name: "Hall Tickets", href: "/hall-tickets", icon: Ticket, permission: "exams" },
      { name: "ID Cards", href: "/id-cards", icon: CreditCard, permission: "students" },
      { name: "Training & Placement", href: "/placements", icon: Landmark, permission: "students" },
    ],
  },
  {
    label: "People",
    icon: Users,
    items: [
      { name: "Students", href: "/students", icon: Users, permission: "students" },
      { name: "Staff", href: "/staff", icon: Briefcase, permission: "staff" },
      { name: "Attendance", href: "/attendance", icon: CalendarCheck, permission: "attendance" },
      { name: "Staff Leaves", href: "/leaves", icon: CalendarOff, permission: "leaves" },
      { name: "Payroll", href: "/payroll", icon: Wallet, permission: "staff" },
    ],
  },
  {
    label: "Finance",
    icon: IndianRupee,
    items: [
      { name: "Fees", href: "/fees", icon: IndianRupee, permission: "fees" },
      { name: "Certificates", href: "/certificates", icon: Award, permission: "certificates" },
      { name: "Fundraising", href: "/fundraising", icon: Heart, permission: "fees" },
    ],
  },
  {
    label: "Campus",
    icon: Building2,
    items: [
      { name: "Hostels", href: "/hostels", icon: Building2, permission: "hostels" },
      { name: "Transport", href: "/transport", icon: Bus, permission: "transport" },
      { name: "Library", href: "/library", icon: BookMarked, permission: "library" },
      { name: "Inventory", href: "/inventory", icon: Package, permission: "inventory" },
      { name: "Visitors", href: "/visitors", icon: UserCheck, permission: "events" },
    ],
  },
  {
    label: "Engagement",
    icon: Calendar,
    items: [
      { name: "Events", href: "/events", icon: Calendar, permission: "events" },
      { name: "Communications", href: "/communications", icon: Megaphone, permission: "communications" },
      { name: "Notifications", href: "/notifications", icon: BellRing, permission: "communications" },
      { name: "Student Portal", href: "/student-portal", icon: UserCircle, permission: "students" },
      { name: "Parent Portal", href: "/parent-portal", icon: Home, permission: "students" },
    ],
  },
  {
    label: "Administration",
    icon: Settings,
    items: [
      { name: "User Management", href: "/users", icon: UserCog, permission: "users" },
      { name: "Bulk Import/Export", href: "/bulk-import", icon: Upload, permission: "settings" },
      { name: "Activity Log", href: "/activity-log", icon: Activity, permission: "settings" },
      { name: "Document Vault", href: "/documents", icon: FolderOpen, permission: "students" },
      { name: "Print Templates", href: "/print-templates", icon: Printer, permission: "fees" },
      { name: "Dashboard Settings", href: "/dashboard-settings", icon: LayoutGrid, permission: "dashboard" },
      { name: "Data Backup", href: "/backup", icon: Database, permission: "settings" },
      { name: "Settings", href: "/settings", icon: Settings, permission: "settings" },
    ],
  },
];

const ROLE_BADGE_COLORS: Record<string, string> = {
  SuperAdmin: "bg-red-500/20 text-red-300 border-red-500/30",
  Admin: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Principal: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  HOD: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Faculty: "bg-green-500/20 text-green-300 border-green-500/30",
  Staff: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Student: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => { initial[g.label] = true; });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  const roleBadge = ROLE_BADGE_COLORS[user?.role || ""] || "bg-gray-500/20 text-gray-300 border-gray-500/30";

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 shrink-0 items-center px-5 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-sidebar-foreground leading-tight">EduManage TN</h1>
            <p className="text-[10px] text-sidebar-foreground/40 leading-tight">College Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroups[group.label] !== false;
            const hasActiveChild = group.items.some(
              (item) => location === item.href || (item.href !== "/" && location.startsWith(item.href))
            );

            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors
                    ${hasActiveChild ? "text-sidebar-foreground bg-sidebar-accent/30" : "text-sidebar-foreground/50 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent/20"}`}
                >
                  <div className="flex items-center gap-2">
                    <group.icon className="w-3.5 h-3.5" />
                    {group.label}
                  </div>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {isExpanded && (
                  <ul className="mt-0.5 ml-2 space-y-0.5 border-l border-sidebar-border/30 pl-2">
                    {group.items.map((item) => {
                      const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all
                              ${isActive
                                ? "bg-primary/10 text-primary border-l-2 border-primary -ml-[calc(0.5rem+1px)] pl-[calc(0.625rem+1px)]"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                              }`}
                          >
                            <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-sidebar-foreground/50"}`} />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-sidebar-border/50 p-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm shadow">
            {user?.fullName?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.fullName || "User"}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${roleBadge}`}>
              <Shield className="w-2.5 h-2.5" />
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-r-sidebar-border">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="hidden md:fixed md:inset-y-0 md:z-50 md:flex md:w-64 md:flex-col border-r border-sidebar-border shadow-lg">
        <SidebarContent />
      </div>

      <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center justify-end gap-x-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card" />
            </Button>
            <div className="h-6 w-px bg-border" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                    {user?.fullName?.[0] || "U"}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user?.fullName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
