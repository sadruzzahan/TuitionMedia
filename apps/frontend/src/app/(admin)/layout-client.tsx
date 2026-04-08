"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Shield,
  Star,
  BookOpen,
  LogOut,
  ChevronRight,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/requests", label: "Requests", icon: BookOpen },
  { href: "/admin/documents", label: "Documents", icon: FileText },
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
        <div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed left-0 top-0 z-40 hidden md:flex h-screen w-60 flex-col glass-card border-r border-white/10">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-7 w-7 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold text-sm">TuitionMedia</span>
              <p className="text-xs text-amber-400">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3 mt-2">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive(item.href, item.exact)
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0 h-5 w-5" />
              {item.label}
              {isActive(item.href, item.exact) && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-amber-400/60" />
              )}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3 space-y-2">
          <div className="rounded-lg bg-white/5 px-3 py-2 text-xs">
            <p className="font-medium text-amber-400">{user.name ?? "Admin"}</p>
            <p className="text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-red-400 text-xs"
            onClick={() => { logout(); router.push("/"); }}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen md:ml-60">
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-xl px-8">
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
            {pathname !== "/admin" && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="font-medium text-foreground capitalize">
                  {pathname.split("/").pop()}
                </span>
              </>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
              A
            </div>
          </div>
        </div>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
