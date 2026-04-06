"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Briefcase,
  LogOut,
  User,
  Menu,
  X,
  ChevronRight,
  Bell,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const studentNav = [
  { href: "/dashboard/student", label: "My Requests", icon: BookOpen },
  { href: "/dashboard/student/new", label: "Post Request", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
];

const tutorNav = [
  { href: "/dashboard/tutor", label: "Job Board", icon: Briefcase },
  { href: "/dashboard/tutor/applications", label: "My Applications", icon: BookOpen },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
];

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [
    { label: "Dashboard", href: "/dashboard" },
  ];

  if (pathname.includes("/dashboard/student/new")) {
    crumbs.push({ label: "My Requests", href: "/dashboard/student" });
    crumbs.push({ label: "New Request", href: "/dashboard/student/new" });
  } else if (pathname.match(/\/dashboard\/student\/[^/]+/)) {
    crumbs.push({ label: "My Requests", href: "/dashboard/student" });
    crumbs.push({ label: "Request Details", href: pathname });
  } else if (pathname === "/dashboard/student") {
    crumbs.push({ label: "My Requests", href: "/dashboard/student" });
  } else if (pathname === "/dashboard/tutor") {
    crumbs.push({ label: "Job Board", href: "/dashboard/tutor" });
  } else if (pathname === "/dashboard/tutor/applications") {
    crumbs.push({ label: "Job Board", href: "/dashboard/tutor" });
    crumbs.push({ label: "My Applications", href: "/dashboard/tutor/applications" });
  } else if (pathname === "/dashboard/profile") {
    crumbs.push({ label: "My Profile", href: "/dashboard/profile" });
  }

  return crumbs;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent"
        />
      </div>
    );
  }

  const nav = user.role === "STUDENT" ? studentNav : tutorNav;

  const isActive = (href: string) =>
    pathname === href ||
    (href === "/dashboard/student" &&
      pathname.startsWith("/dashboard/student/") &&
      pathname !== "/dashboard/student/new");

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={cn(
          "fixed left-0 top-0 z-40 hidden md:flex h-screen flex-col glass-card border-r border-white/10 transition-all duration-300 ease-in-out",
          isExpanded ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <GraduationCap className="h-8 w-8 shrink-0 text-cyan-400" />
            <span
              className={cn(
                "font-bold whitespace-nowrap transition-all duration-200 overflow-hidden",
                isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0"
              )}
            >
              TuitionMedia
            </span>
          </Link>
        </div>

        {/* Role badge */}
        <div
          className={cn(
            "mx-2 mt-2 overflow-hidden rounded-lg transition-all duration-200",
            isExpanded ? "opacity-100 max-h-16" : "opacity-0 max-h-0"
          )}
        >
          <div className="rounded-lg bg-cyan-500/10 px-3 py-2 text-xs">
            <span className="font-medium text-cyan-400">{user.role}</span>
            <p className="mt-0.5 truncate text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-2 mt-2">
          {nav.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  !isExpanded && "justify-center"
                )}
                title={!isExpanded ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-200 overflow-hidden",
                    isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 hidden"
                  )}
                >
                  {item.label}
                </span>
                {isExpanded && isActive(item.href) && (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-cyan-400/60" />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* User menu */}
        <div className="border-t border-white/10 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full transition-all duration-200",
                  isExpanded ? "justify-start gap-2" : "justify-center px-2"
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                  {(user.name ?? user.email).charAt(0).toUpperCase()}
                </div>
                <div
                  className={cn(
                    "flex min-w-0 flex-col items-start transition-all duration-200 overflow-hidden",
                    isExpanded ? "opacity-100 max-w-[120px]" : "opacity-0 max-w-0 hidden"
                  )}
                >
                  <span className="truncate text-sm font-medium">{user.name ?? user.email}</span>
                  {user.name && (
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                <User className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => { logout(); router.push("/"); }}
                className="text-red-400 focus:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-background/95 backdrop-blur-xl px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-cyan-400" />
          <span className="font-bold text-sm">TuitionMedia</span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Notification bell (placeholder) */}
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col glass-card border-l border-white/10 md:hidden"
            >
              <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
                <div className="rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs">
                  <span className="font-medium text-cyan-400">{user.role}</span>
                  <p className="truncate text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                      isActive(item.href)
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-white/10 p-4">
                <Button
                  variant="outline"
                  className="w-full gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                  onClick={() => { logout(); router.push("/"); }}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main
        className={cn(
          "relative flex-1 min-h-screen transition-all duration-300 ease-in-out",
          "md:ml-16",
          isExpanded && "md:ml-64"
        )}
      >
        {/* Desktop page header with breadcrumb + notification bell */}
        <div className="sticky top-0 z-30 hidden md:flex h-14 items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-xl px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          {/* Right side: notification bell + user */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 relative" title="Notifications (coming soon)">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {/* Placeholder badge */}
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                {(user.name ?? user.email).charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden lg:block">{user.name ?? user.email.split("@")[0]}</span>
            </div>
          </div>
        </div>

        <div className="p-4 pt-20 md:p-8 md:pt-6">{children}</div>
      </main>
    </div>
  );
}
