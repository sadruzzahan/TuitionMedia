"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { GraduationCap, BookOpen, Star, Shield, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TUTOR_BENEFITS = [
  "Browse all open tuition requests for free",
  "Apply with a personalised cover letter",
  "৳500 one-time fee per successful connection",
  "Build your verified tutor profile",
];

const STUDENT_BENEFITS = [
  "Post unlimited tuition requests for free",
  "Receive applications from qualified tutors",
  "৳500 one-time fee per successful match",
  "Contact info exchanged securely",
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TUTOR">("STUDENT");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const paramRole = searchParams.get("role");
    if (paramRole === "TUTOR" || paramRole === "STUDENT") {
      setRole(paramRole);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      const path = user.role === "TUTOR" ? "/dashboard/tutor" : "/dashboard/student";
      router.replace(path);
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!/^01[3-9]\d{8}$/.test(phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 11-digit Bangladesh phone number (e.g. 017XXXXXXXX)",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await apiPost<{
        accessToken: string;
        user: { id: string; email: string; name?: string; role: string };
      }>("/auth/register", {
        email,
        phone,
        password,
        role,
        ...(name.trim() && { name: name.trim() }),
      });
      setAuth(
        {
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          role: res.user.role as "STUDENT" | "TUTOR" | "ADMIN",
        },
        res.accessToken,
      );
      toast({ title: "Account created!", variant: "success" });
      const redirect = res.user.role === "TUTOR" ? "/dashboard/tutor" : "/dashboard/student";
      router.push(redirect);
    } catch (err) {
      toast({
        title: "Signup failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const benefits = role === "TUTOR" ? TUTOR_BENEFITS : STUDENT_BENEFITS;

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL (branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 flex-col justify-between p-12">
        <motion.div
          className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none"
          animate={{ y: [0, 20, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div>
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-9 w-9 text-cyan-400" />
            <span className="text-xl font-bold text-white">TuitionMedia</span>
          </Link>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-cyan-400 text-sm font-medium uppercase tracking-wider mb-4">
              Join as {role === "TUTOR" ? "a Tutor" : "a Student"}
            </p>
            <h1 className="text-3xl font-bold text-white leading-tight mb-6">
              {role === "TUTOR" ? (
                <>টিউটর হিসেবে<br /><span className="text-gradient">যোগ দিন</span></>
              ) : (
                <>শিক্ষার্থী হিসেবে<br /><span className="text-gradient">যোগ দিন</span></>
              )}
            </h1>

            <div className="space-y-3 mb-8">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                    <svg className="h-3 w-3 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/80">{b}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-3 relative z-10">
          {[
            { icon: Shield, text: "Secure" },
            { icon: Zap, text: "Fast" },
            { icon: Star, text: "Quality" },
          ].map((item) => (
            <div key={item.text} className="glass rounded-xl p-3 text-center">
              <item.icon className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-xs text-white/70">{item.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.08),transparent)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-6 flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold">TuitionMedia</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold">Create account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Join TuitionMedia as a student or tutor.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="space-y-2">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("STUDENT")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    role === "STUDENT"
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                  )}
                >
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm font-medium">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("TUTOR")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    role === "TUTOR"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                  )}
                >
                  <GraduationCap className="h-6 w-6" />
                  <span className="text-sm font-medium">Tutor</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white/5 border-white/10 h-10"
                required
              />
              <p className="text-xs text-muted-foreground">Bangladesh mobile number (e.g. 017XXXXXXXX)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-white/5 border-white/10 h-10"
              />
            </div>
            <Button
              type="submit"
              variant="gradient"
              className="w-full h-11 text-base"
              disabled={loading}
            >
              {loading ? "Creating account..." : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
