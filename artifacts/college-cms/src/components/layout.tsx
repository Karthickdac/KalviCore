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
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Staff", href: "/staff", icon: Briefcase },
  { name: "Departments", href: "/departments", icon: BookOpen },
  { name: "Courses", href: "/courses", icon: GraduationCap },
  { name: "Subjects", href: "/subjects", icon: FileText },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Fees", href: "/fees", icon: IndianRupee },
  { name: "Exams", href: "/exams", icon: FileText },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-y-5 bg-sidebar px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-foreground" />
          <span>EduManage TN</span>
        </h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium
                        ${isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        }
                      `}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0 ${isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60"}`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
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

      {/* Desktop sidebar */}
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
