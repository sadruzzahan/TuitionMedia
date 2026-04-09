"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Briefcase,
  LogOut,
  User,
  CalendarClock,
  Calendar,
  Bell,
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
import { NotificationBell } from "@/components/notifications/notification-bell";

const studentNav = [
  { href: "/dashboard/student", label: "Requests", icon: BookOpen },
  { href: "/dashboard/student/new", label: "Post", icon: LayoutDashboard },
  { href: "/dashboard/student/sessions", label: "Sessions", icon: CalendarClock },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const tutorNav = [
  { href: "/dashboard/tutor", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/tutor/applications", label: "Applied", icon: BookOpen },
  { href: "/dashboard/tutor/sessions", label: "Sessions", icon: CalendarClock },
  { href: "/dashboard/tutor/schedule", label: "Schedule", icon: Calendar },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

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
      pathname !== "/dashboard/student/new" &&
      pathname !== "/dashboard/student/sessions");

  const initials = (user.name ?? user.email).charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* ── TOP BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 group">
          <GraduationCap className="h-7 w-7 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm hidden sm:block">TuitionMedia</span>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationBell compact />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full pl-2 pr-1 py-1 hover:bg-white/5 transition-colors group">
                <span className="text-sm font-medium text-muted-foreground hidden sm:block group-hover:text-foreground transition-colors">
                  {user.name?.split(" ")[0] ?? user.email.split("@")[0]}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 text-xs font-bold text-white shadow-lg shadow-cyan-500/20">
                  {initials}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-sm font-medium">{user.name ?? user.email}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
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
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="pt-14 pb-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>

      {/* ── BOTTOM FLOATING NAVBAR ── */}
      <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
          className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-white/[0.12] bg-[#0d1117]/90 backdrop-blur-2xl px-2 py-2 shadow-2xl shadow-black/50"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)" }}
        >
          {nav.map((item, i) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 + 0.2 }}
                  className={cn(
                    "relative flex flex-col items-center gap-1 rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-200 min-w-[60px]",
                    active
                      ? "bg-cyan-500/15 text-cyan-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <item.icon className={cn("relative h-5 w-5 shrink-0", active && "drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]")} />
                  <span className="relative">{item.label}</span>
                  {active && (
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </motion.nav>
      </div>
    </div>
  );
}
