"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { GraduationCap, Star, Shield, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const TRUST_POINTS = [
  { icon: Shield, text: "Verified tutors across Bangladesh" },
  { icon: Zap, text: "Connect in minutes, not days" },
  { icon: Star, text: "Free trial first — pay only on approval" },
];

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const path = user.role === "TUTOR" ? "/dashboard/tutor" : "/dashboard/student";
      router.replace(path);
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiPost<{
        accessToken: string;
        user: { id: string; email: string; name?: string | null; role: string };
      }>("/auth/login", { email, password });
      setAuth(
        { id: res.user.id, email: res.user.email, name: res.user.name, role: res.user.role as "STUDENT" | "TUTOR" | "ADMIN" },
        res.accessToken,
      );
      toast({ title: "Welcome back!", variant: "success" });
      const redirect = res.user.role === "TUTOR" ? "/dashboard/tutor" : "/dashboard/student";
      router.push(redirect);
    } catch (err) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL (branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 flex-col justify-between p-12">
        {/* Background orbs */}
        <motion.div
          className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none"
          animate={{ y: [0, 20, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-teal-500/20 blur-3xl pointer-events-none"
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Logo */}
        <div>
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-9 w-9 text-cyan-400" />
            <span className="text-xl font-bold text-white">TuitionMedia</span>
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-cyan-400 text-sm font-medium uppercase tracking-wider mb-4">Welcome back</p>
            <h1 className="text-4xl font-bold text-white leading-tight mb-6">
              বাংলাদেশের সেরা<br />
              <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                টিউশন প্ল্যাটফর্ম
              </span>
            </h1>
            <div className="space-y-4">
              {TRUST_POINTS.map((tp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
                    <tp.icon className="h-4 w-4 text-cyan-400" />
                  </div>
                  <span className="text-sm text-white/80">{tp.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 relative z-10">
          {[
            { value: "10k+", label: "Students" },
            { value: "5k+", label: "Tutors" },
            { value: "Free", label: "Trial first" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/60">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.10),transparent)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold">TuitionMedia</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold">Sign in</h2>
            <p className="mt-2 text-muted-foreground">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 h-11"
              />
            </div>
            <Button
              type="submit"
              variant="gradient"
              className="w-full h-11 text-base"
              disabled={loading}
            >
              {loading ? "Signing in..." : (
                <span className="flex items-center gap-2">
                  Sign in <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-cyan-400 hover:underline font-medium">
              Create one free
            </Link>
          </p>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-xs text-center text-muted-foreground mb-3">Or join as</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/signup?role=STUDENT">
                <Button variant="outline" className="w-full border-white/10 text-sm">
                  Student
                </Button>
              </Link>
              <Link href="/signup?role=TUTOR">
                <Button variant="outline" className="w-full border-white/10 text-sm">
                  Tutor
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
