"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Shield,
  Star,
  BookOpen,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/requests", label: "Requests", icon: BookOpen },
  { href: "/admin/documents", label: "Docs", icon: FileText },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const currentPage = adminNav.find((n) => isActive(n.href, n.exact));

  return (
    <div className="min-h-screen bg-background">
      {/* ── TOP BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/20">
            <Shield className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-sm">TuitionMedia</span>
            <span className="ml-2 text-xs text-amber-400 font-medium">Admin</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {currentPage && (
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
              <currentPage.icon className="h-4 w-4" />
              <span>{currentPage.label}</span>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform">
                A
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-sm font-medium">{user.name ?? "Admin"}</p>
                <p className="text-xs text-amber-400">Administrator</p>
              </div>
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>

      {/* ── BOTTOM FLOATING NAVBAR ── */}
      <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
          className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-white/[0.12] bg-[#0d1117]/90 backdrop-blur-2xl px-2 py-2 shadow-2xl"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)" }}
        >
          {adminNav.map((item, i) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.2 }}
                  className={cn(
                    "relative flex flex-col items-center gap-1 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200 min-w-[52px]",
                    active
                      ? "bg-amber-500/15 text-amber-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="admin-nav-active"
                      className="absolute inset-0 rounded-xl bg-amber-500/10 border border-amber-500/20"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <item.icon className={cn("relative h-5 w-5 shrink-0", active && "drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]")} />
                  <span className="relative">{item.label}</span>
                  {active && (
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
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
