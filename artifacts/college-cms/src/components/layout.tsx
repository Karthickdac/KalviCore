import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  CalendarCheck, 
  IndianRupee, 
  FileText,
  Menu,
  Bell,
  Building2,
  Bus,
  BookMarked,
  Calendar,
  Megaphone,
  Package,
  Clock,
  ClipboardList,
  Award,
  CalendarOff,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Academics",
    items: [
      { name: "Departments", href: "/departments", icon: BookOpen },
      { name: "Courses", href: "/courses", icon: GraduationCap },
      { name: "Subjects", href: "/subjects", icon: FileText },
      { name: "Timetable", href: "/timetable", icon: Clock },
      { name: "Assignments", href: "/assignments", icon: ClipboardList },
      { name: "Exams", href: "/exams", icon: FileText },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Students", href: "/students", icon: Users },
      { name: "Staff", href: "/staff", icon: Briefcase },
      { name: "Attendance", href: "/attendance", icon: CalendarCheck },
      { name: "Staff Leaves", href: "/leaves", icon: CalendarOff },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Fees", href: "/fees", icon: IndianRupee },
      { name: "Certificates", href: "/certificates", icon: Award },
    ],
  },
  {
    label: "Campus",
    items: [
      { name: "Hostels", href: "/hostels", icon: Building2 },
      { name: "Transport", href: "/transport", icon: Bus },
      { name: "Library", href: "/library", icon: BookMarked },
      { name: "Inventory", href: "/inventory", icon: Package },
    ],
  },
  {
    label: "Engagement",
    items: [
      { name: "Events", href: "/events", icon: Calendar },
      { name: "Communications", href: "/communications", icon: Megaphone },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-y-3 bg-sidebar px-4 pb-4 overflow-y-auto">
      <div className="flex h-16 shrink-0 items-center px-2">
        <h1 className="text-lg font-bold text-sidebar-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-foreground" />
          <span>EduManage TN</span>
        </h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-4">
          {navGroups.map((group) => (
            <li key={group.label}>
              <div className="text-xs font-semibold leading-6 text-sidebar-foreground/50 uppercase tracking-wider px-2">
                {group.label}
              </div>
              <ul role="list" className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md px-2 py-1.5 text-sm leading-6 font-medium
                          ${isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          }
                        `}
                      >
                        <item.icon
                          className={`h-5 w-5 shrink-0 ${isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60"}`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
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

      <div className="hidden md:fixed md:inset-y-0 md:z-50 md:flex md:w-72 md:flex-col border-r border-sidebar-border">
        <SidebarContent />
      </div>

      <div className="md:pl-72 flex flex-col flex-1 min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 sm:gap-x-6 sm:px-6 lg:px-8 shadow-sm">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />
              <div className="flex items-center gap-x-4">
                <span className="hidden lg:flex lg:items-center">
                  <span className="text-sm font-semibold leading-6 text-foreground" aria-hidden="true">
                    Admin User
                  </span>
                </span>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
