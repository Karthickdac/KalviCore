import React, { useState, useMemo } from "react";
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
  Landmark, Heart, UserCheck, Search, X, MessageSquare
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
  color: string;
  dotColor: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    icon: Home,
    color: "text-blue-400",
    dotColor: "bg-blue-500",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: "dashboard" },
      { name: "Reports & Analytics", href: "/reports", icon: BarChart3, permission: "reports" },
      { name: "Academic Calendar", href: "/academic-calendar", icon: CalendarDays, permission: "calendar" },
    ],
  },
  {
    label: "Academics",
    icon: GraduationCap,
    color: "text-violet-400",
    dotColor: "bg-violet-500",
    items: [
      { name: "Departments", href: "/departments", icon: BookOpen, permission: "departments" },
      { name: "Courses", href: "/courses", icon: GraduationCap, permission: "courses" },
      { name: "Subjects", href: "/subjects", icon: FileText, permission: "subjects" },
      { name: "Timetable", href: "/timetable", icon: Clock, permission: "timetable" },
      { name: "Assignments", href: "/assignments", icon: ClipboardList, permission: "assignments" },
      { name: "Exams", href: "/exams", icon: FileText, permission: "exams" },
      { name: "CGPA Tracker", href: "/cgpa", icon: TrendingUp, permission: "exams" },
      { name: "Hall Tickets", href: "/hall-tickets", icon: Ticket, permission: "exams" },
      { name: "ID Cards", href: "/id-cards", icon: CreditCard, permission: "id_cards" },
      { name: "Training & Placement", href: "/placements", icon: Landmark, permission: "placements" },
    ],
  },
  {
    label: "People",
    icon: Users,
    color: "text-emerald-400",
    dotColor: "bg-emerald-500",
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
    color: "text-amber-400",
    dotColor: "bg-amber-500",
    items: [
      { name: "Fees", href: "/fees", icon: IndianRupee, permission: "fees" },
      { name: "Certificates", href: "/certificates", icon: Award, permission: "certificates" },
      { name: "Fundraising", href: "/fundraising", icon: Heart, permission: "fundraising" },
    ],
  },
  {
    label: "Campus",
    icon: Building2,
    color: "text-cyan-400",
    dotColor: "bg-cyan-500",
    items: [
      { name: "Hostels", href: "/hostels", icon: Building2, permission: "hostels" },
      { name: "Transport", href: "/transport", icon: Bus, permission: "transport" },
      { name: "Library", href: "/library", icon: BookMarked, permission: "library" },
      { name: "Inventory", href: "/inventory", icon: Package, permission: "inventory" },
      { name: "Visitors", href: "/visitors", icon: UserCheck, permission: "visitors" },
    ],
  },
  {
    label: "Communication",
    icon: MessageSquare,
    color: "text-pink-400",
    dotColor: "bg-pink-500",
    items: [
      { name: "Events", href: "/events", icon: Calendar, permission: "events" },
      { name: "Communications", href: "/communications", icon: Megaphone, permission: "communications" },
      { name: "Notifications", href: "/notifications", icon: BellRing, permission: "notifications" },
      { name: "Student Portal", href: "/student-portal", icon: UserCircle, permission: "students" },
      { name: "Parent Portal", href: "/parent-portal", icon: Home, permission: "students" },
    ],
  },
  {
    label: "Administration",
    icon: Settings,
    color: "text-orange-400",
    dotColor: "bg-orange-500",
    items: [
      { name: "User Management", href: "/users", icon: UserCog, permission: "users" },
      { name: "Bulk Import/Export", href: "/bulk-import", icon: Upload, permission: "settings" },
      { name: "Activity Log", href: "/activity-log", icon: Activity, permission: "settings" },
      { name: "Document Vault", href: "/documents", icon: FolderOpen, permission: "students" },
      { name: "Print Templates", href: "/print-templates", icon: Printer, permission: "print_templates" },
      { name: "Dashboard Settings", href: "/dashboard-settings", icon: LayoutGrid, permission: "dashboard_settings" },
      { name: "Data Backup", href: "/backup", icon: Database, permission: "settings" },
      { name: "Settings", href: "/settings", icon: Settings, permission: "settings" },
    ],
  },
];

const ROLE_BADGE_COLORS: Record<string, string> = {
  SuperAdmin: "bg-red-500/15 text-red-400 border-red-500/20",
  Admin: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Principal: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  HOD: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Faculty: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Staff: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Student: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => { initial[g.label] = true; });
    return initial;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!hasPermission(item.permission)) return false;
          if (q && !item.name.toLowerCase().includes(q)) return false;
          return true;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchQuery, hasPermission]);

  const roleBadge = ROLE_BADGE_COLORS[user?.role || ""] || "bg-gray-500/15 text-gray-400 border-gray-500/20";

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col bg-gradient-to-b from-[hsl(200,50%,10%)] to-[hsl(200,55%,5%)]">
      <div className="flex h-16 shrink-0 items-center px-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25 ring-1 ring-white/10">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white leading-tight tracking-tight">KalviCore</h1>
            <p className="text-[10px] text-teal-300/60 leading-tight font-medium">Complete Campus. One Intelligent System</p>
          </div>
        </div>
      </div>

      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-8 text-xs bg-white/[0.06] border border-white/[0.08] rounded-lg text-white/90 placeholder:text-white/25 focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/40 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="space-y-0.5">
          {filteredGroups.map((group) => {
            const isExpanded = searchQuery ? true : expandedGroups[group.label] !== false;
            const hasActiveChild = group.items.some(
              (item) => location === item.href || (item.href !== "/" && location.startsWith(item.href))
            );

            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => !searchQuery && toggleGroup(group.label)}
                  className={`w-full flex items-center justify-between px-2.5 py-[7px] text-[11px] font-semibold uppercase tracking-[0.08em] rounded-lg transition-all duration-200
                    ${hasActiveChild
                      ? "bg-white/[0.06] text-white/90"
                      : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${group.dotColor} ${hasActiveChild ? 'shadow-sm' : 'opacity-60'}`} style={hasActiveChild ? { boxShadow: `0 0 6px currentColor` } : {}} />
                    <group.icon className={`w-3.5 h-3.5 ${group.color} ${hasActiveChild ? '' : 'opacity-60'}`} />
                    <span>{group.label}</span>
                  </div>
                  {!searchQuery && (
                    isExpanded
                      ? <ChevronDown className="w-3 h-3 opacity-50" />
                      : <ChevronRight className="w-3 h-3 opacity-50" />
                  )}
                </button>
                {isExpanded && (
                  <ul className="mt-0.5 space-y-px pl-4">
                    {group.items.map((item) => {
                      const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={onNavigate}
                            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-[6px] text-[13px] font-medium transition-all duration-200 group relative
                              ${isActive
                                ? "bg-gradient-to-r from-teal-500/15 to-teal-500/5 text-teal-300 shadow-sm"
                                : "text-white/55 hover:bg-white/[0.04] hover:text-white/80"
                              }`}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-teal-500 rounded-r-full shadow-sm shadow-teal-500/50" />
                            )}
                            <item.icon className={`h-[15px] w-[15px] shrink-0 transition-colors ${isActive ? "text-teal-400" : "text-white/35 group-hover:text-white/55"}`} />
                            <span className="truncate">{item.name}</span>
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

      <div className="shrink-0 border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-teal-500/20 ring-1 ring-white/10">
            {user?.fullName?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/90 truncate">{user?.fullName || "User"}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${roleBadge}`}>
              <Shield className="w-2.5 h-2.5" />
              {user?.role}
            </span>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-3 z-50 bg-card/80 backdrop-blur-sm shadow-md border border-border">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 border-r-0">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="hidden md:fixed md:inset-y-0 md:z-50 md:flex md:w-[260px] md:flex-col shadow-2xl shadow-black/20">
        <SidebarContent />
      </div>

      <div className="md:pl-[260px] flex flex-col flex-1 min-h-screen">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-border/60 bg-card/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center justify-end gap-x-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative h-9 w-9 rounded-xl">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-card" />
            </Button>
            <div className="h-5 w-px bg-border/60" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2.5 px-2 h-9 rounded-xl hover:bg-accent/50">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow">
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
