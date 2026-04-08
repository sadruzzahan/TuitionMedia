"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  GraduationCap,
  BookOpen,
  Users,
  ArrowRight,
  Sparkles,
  Star,
  MapPin,
  Shield,
  Zap,
  TrendingUp,
  ChevronRight,
  Phone,
  Search,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BANGLADESH_SUBJECTS, BANGLADESH_DIVISIONS } from "@/lib/bangladesh-data";

type TutorCard = {
  id: string;
  name: string | null;
  bio: string | null;
  subjects: string[];
  hourlyRate: number;
  division: string | null;
  areas: string[];
  experience: number;
  isVerified: boolean;
  isPremium: boolean;
  averageRating: number | null;
  totalReviews: number;
};

const AVATAR_COLORS = [
  "bg-cyan-500/20 text-cyan-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-violet-500/20 text-violet-400",
  "bg-teal-500/20 text-teal-400",
  "bg-blue-500/20 text-blue-400",
  "bg-pink-500/20 text-pink-400",
  "bg-amber-500/20 text-amber-400",
  "bg-rose-500/20 text-rose-400",
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string | null) {
  if (!name) return "T";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const STATS = [
  { value: "10,000+", label: "শিক্ষার্থী", sublabel: "Active Students" },
  { value: "5,000+", label: "টিউটর", sublabel: "Verified Tutors" },
  { value: "8", label: "বিভাগ", sublabel: "Divisions Covered" },
  { value: "৳500", label: "কানেকশন ফি", sublabel: "Flat Connection Fee" },
];

const STEPS_STUDENT = [
  {
    step: "01",
    title: "পোস্ট করুন",
    en: "Post Your Request",
    desc: "Subject, location, budget, and education level — set your requirements in minutes.",
  },
  {
    step: "02",
    title: "টিউটর খুঁজুন",
    en: "Receive Applications",
    desc: "Qualified tutors browse your request and apply with cover letters. You're in control.",
  },
  {
    step: "03",
    title: "কানেক্ট করুন",
    en: "Connect & Start",
    desc: "Accept the best tutor. Pay a one-time ৳500 fee. Get their contact instantly.",
  },
];

const STEPS_TUTOR = [
  {
    step: "01",
    title: "প্রোফাইল তৈরি করুন",
    en: "Create Your Profile",
    desc: "Add your qualifications, subjects, rates, and availability to stand out.",
  },
  {
    step: "02",
    title: "আবেদন করুন",
    en: "Browse & Apply",
    desc: "See open tuition requests in your area. Apply with a personalised cover letter.",
  },
  {
    step: "03",
    title: "আয় শুরু করুন",
    en: "Get Connected",
    desc: "Student accepts you. Both pay ৳500. Contact info unlocked — start teaching!",
  },
];

const TESTIMONIALS = [
  {
    name: "Rafiq Ahmed",
    role: "SSC Student, Dhaka",
    text: "Found an excellent math tutor within 2 days. My grades went from C to A in just 3 months. TuitionMedia is incredible!",
    rating: 5,
    avatar: "R",
  },
  {
    name: "Fatema Khatun",
    role: "Tutor, Chittagong",
    text: "As a tutor, this platform gives me a steady flow of quality students. The ৳500 fee is absolutely worth it for genuine connections.",
    rating: 5,
    avatar: "F",
  },
  {
    name: "Mizanur Rahman",
    role: "HSC Student, Sylhet",
    text: "I needed help with Physics and Chemistry for HSC. Got matched with a BUET graduate in my area. Couldn't be better!",
    rating: 5,
    avatar: "M",
  },
  {
    name: "Tahmina Akter",
    role: "Parent, Rajshahi",
    text: "My daughter's English improved dramatically after finding her tutor here. The verification system gives real peace of mind.",
    rating: 5,
    avatar: "T",
  },
  {
    name: "Jahangir Alam",
    role: "Tutor, Khulna",
    text: "I went from 0 to 8 regular students in just 2 months of using this platform. Best decision for my tutoring career.",
    rating: 5,
    avatar: "J",
  },
  {
    name: "Riya Das",
    role: "O-Level Student, Dhaka",
    text: "I was struggling with A-level Math until I found my tutor here. Now I'm confident going into my exams!",
    rating: 5,
    avatar: "R",
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Verified Tutors",
    desc: "Identity and qualification verification before connecting with students.",
  },
  {
    icon: MapPin,
    title: "Hyper-Local",
    desc: "Filter by your division and area. Find tutors in your neighbourhood.",
  },
  {
    icon: Zap,
    title: "Fast Matching",
    desc: "Post a request and receive tutor applications within hours.",
  },
  {
    icon: TrendingUp,
    title: "Transparent Pricing",
    desc: "Flat ৳500 connection fee. No hidden charges. No monthly subscriptions.",
  },
];

function TutorCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-11 w-11 rounded-xl bg-white/10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
        <div className="h-3.5 w-16 bg-white/10 rounded" />
      </div>
      <div className="flex gap-1.5 mb-2">
        <div className="h-5 w-20 rounded-full bg-white/10" />
        <div className="h-5 w-16 rounded-full bg-white/10" />
      </div>
      <div className="h-3 bg-white/10 rounded w-1/3" />
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [searchSubject, setSearchSubject] = useState("");
  const [searchDivision, setSearchDivision] = useState("");
  const [featuredTutors, setFeaturedTutors] = useState<TutorCard[]>([]);
  const [tutorsLoading, setTutorsLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedTutors() {
      try {
        const res = await fetch("/api/tutors?sort=rating&limit=6");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json() as { featured: TutorCard[]; tutors: TutorCard[] };
        const combined = [...data.featured, ...data.tutors]
          .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
          .slice(0, 6);
        setFeaturedTutors(combined);
      } catch {
        setFeaturedTutors([]);
      } finally {
        setTutorsLoading(false);
      }
    }
    loadFeaturedTutors();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchSubject) params.set("subject", searchSubject);
    if (searchDivision) params.set("division", searchDivision);
    router.push(`/tutors?${params.toString()}`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.15),transparent)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_80%_50%,rgba(20,184,166,0.08),transparent)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_20%_80%,rgba(16,185,129,0.08),transparent)]" />

      {/* Floating orbs */}
      <motion.div
        className="pointer-events-none absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ y: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl"
        animate={{ y: [0, -25, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <GraduationCap className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold tracking-tight">TuitionMedia</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <Link href="/tutors" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Browse Tutors</Link>
            <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">How It Works</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Pricing</Link>
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hidden sm:inline-flex">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="gradient" className="shadow-cyan-500/20">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </nav>
      </header>

      <main className="relative">
        {/* ── HERO ── */}
        <section className="pt-32 pb-16 px-6">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto max-w-4xl text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300"
              >
                <Sparkles className="h-4 w-4" />
                বাংলাদেশের #১ টিউশন প্ল্যাটফর্ম
              </motion.div>
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  সিঠিক টিউটর
                </span>
                <br />
                <span className="text-foreground">এখন আর দূরে নয়</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                Bangladesh&apos;s smartest tutoring marketplace. Students post requests,
                qualified tutors apply, and both connect — all for a simple flat fee of ৳500.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-10 flex flex-wrap items-center justify-center gap-4"
              >
                <Link href="/signup?role=STUDENT">
                  <Button variant="gradient" size="lg" className="group shadow-lg shadow-cyan-500/20 h-14 px-8 text-base">
                    I Need a Tutor
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/signup?role=TUTOR">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-base border-white/20 hover:border-cyan-500/40">
                    I&apos;m a Tutor
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
              <p className="mt-4 text-xs text-muted-foreground">
                No subscription. ৳500 flat fee per connection. Cancel anytime.
              </p>
            </motion.div>

            {/* ── HERO SEARCH BAR ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 mx-auto max-w-2xl"
            >
              <form onSubmit={handleSearch} className="glass-card rounded-2xl p-3 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select value={searchSubject} onValueChange={setSearchSubject}>
                    <SelectTrigger className="bg-white/5 border-white/10 pl-9 h-11">
                      <SelectValue placeholder="Subject (e.g. Mathematics)" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANGLADESH_SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative sm:w-44">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Select value={searchDivision} onValueChange={setSearchDivision}>
                    <SelectTrigger className="bg-white/5 border-white/10 pl-9 h-11">
                      <SelectValue placeholder="Division" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANGLADESH_DIVISIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" variant="gradient" className="h-11 px-6 shrink-0">
                  Find Tutors
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <section className="py-10 px-6 border-y border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-medium">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED TUTORS ── */}
        <section className="py-24 px-6">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-10"
            >
              <div>
                <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Top Rated Tutors</span>
                <h2 className="mt-1 text-3xl font-bold">সেরা টিউটরদের সাথে পরিচয় হন</h2>
              </div>
              <Link href="/tutors" className="hidden sm:flex items-center gap-1 text-sm text-cyan-400 hover:underline">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {tutorsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TutorCardSkeleton key={i} />
                ))}
              </div>
            ) : featuredTutors.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Tutors are joining every day. Be the first to browse!</p>
                <Link href="/tutors" className="mt-4 inline-block">
                  <Button variant="gradient">Browse Tutors</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredTutors.map((tutor, i) => {
                  const color = getAvatarColor(tutor.id);
                  const initials = getInitials(tutor.name);
                  const location = tutor.division ?? (tutor.areas[0] ?? null);
                  return (
                    <motion.div
                      key={tutor.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                    >
                      <Link href={`/tutors/${tutor.id}`}>
                        <div className={`glass-card rounded-2xl p-5 h-full transition-all ${tutor.isPremium ? "hover:border-amber-500/30" : "hover:border-cyan-500/30"}`}>
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${color}`}>
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-sm">{tutor.name ?? "Tutor"}</span>
                                {tutor.isVerified && (
                                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                )}
                                {tutor.isPremium && (
                                  <span className="flex items-center gap-0.5 shrink-0 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">
                                    <Sparkles className="h-2.5 w-2.5" />
                                    Featured
                                  </span>
                                )}
                              </div>
                              {tutor.averageRating ? (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium">{tutor.averageRating.toFixed(1)}</span>
                                  <span className="text-xs text-muted-foreground">({tutor.totalReviews})</span>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground mt-0.5">New tutor</p>
                              )}
                            </div>
                            <span className="shrink-0 text-sm font-medium text-cyan-400">৳{tutor.hourlyRate.toLocaleString()}/hr</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {tutor.subjects.slice(0, 3).map((s) => (
                              <span key={s} className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs text-cyan-400">{s}</span>
                            ))}
                            {tutor.subjects.length > 3 && (
                              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-muted-foreground">
                                +{tutor.subjects.length - 3}
                              </span>
                            )}
                          </div>
                          {location && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {location}
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 text-center sm:hidden">
              <Link href="/tutors">
                <Button variant="outline">View All Tutors</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 px-6 border-t border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">How It Works</span>
              <h2 className="mt-3 text-4xl font-bold">কীভাবে কাজ করে?</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Simple steps for students and tutors to find each other in minutes.
              </p>
              <Link href="/how-it-works" className="mt-4 inline-flex items-center gap-1 text-sm text-cyan-400 hover:underline">
                See full details <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <div className="grid gap-12 lg:grid-cols-2">
              {/* Students */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/20 p-2">
                    <BookOpen className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold">For Students</h3>
                </div>
                <div className="space-y-6">
                  {STEPS_STUDENT.map((s, i) => (
                    <motion.div
                      key={s.step}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
                        {s.step}
                      </div>
                      <div>
                        <div className="font-semibold">{s.en} <span className="text-sm text-muted-foreground">· {s.title}</span></div>
                        <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tutors */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/20 p-2">
                    <GraduationCap className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold">For Tutors</h3>
                </div>
                <div className="space-y-6">
                  {STEPS_TUTOR.map((s, i) => (
                    <motion.div
                      key={s.step}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">
                        {s.step}
                      </div>
                      <div>
                        <div className="font-semibold">{s.en} <span className="text-sm text-muted-foreground">· {s.title}</span></div>
                        <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-24 px-6">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Why TuitionMedia</span>
              <h2 className="mt-3 text-4xl font-bold">Built for Bangladesh</h2>
            </motion.div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="mb-4 rounded-xl bg-cyan-500/20 p-3 w-fit">
                    <f.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS CAROUSEL ── */}
        <section className="py-24 px-6 border-t border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Testimonials</span>
              <h2 className="mt-3 text-4xl font-bold">শিক্ষার্থী ও টিউটরদের কথা</h2>
            </motion.div>

            {/* Infinite scroll carousel */}
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              <div className="flex gap-4 animate-carousel">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <div
                    key={i}
                    className="flex-none w-80 glass-card rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING CTA ── */}
        <section className="py-24 px-6">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-12 text-center"
            >
              <div className="flex items-center justify-center gap-8 mb-8 flex-wrap">
                <div className="text-center">
                  <div className="text-4xl font-bold">৳0</div>
                  <div className="text-sm text-muted-foreground mt-1">to post / apply</div>
                </div>
                <div className="text-4xl text-muted-foreground/30 font-light">+</div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-400">৳500</div>
                  <div className="text-sm text-muted-foreground mt-1">one-time when matched</div>
                </div>
              </div>
              <h2 className="text-3xl font-bold">Simple, fair pricing</h2>
              <p className="mt-3 text-muted-foreground">
                No monthly subscriptions. Both parties pay ৳500 only when they match.
              </p>
              <Link href="/pricing" className="mt-2 inline-block text-sm text-cyan-400 hover:underline">
                See full pricing details →
              </Link>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup?role=STUDENT">
                  <Button variant="gradient" size="lg" className="group">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" size="lg">Learn How It Works</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-16 px-6 border-t border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-3xl text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-cyan-400 mb-4" />
            <h2 className="text-3xl font-bold">আজই শুরু করুন</h2>
            <p className="mt-3 text-muted-foreground">
              Join thousands of students and tutors already using TuitionMedia to transform education across Bangladesh.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button variant="gradient" size="lg" className="group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              Questions? WhatsApp us at 01700-000000
            </p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-10 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-6 w-6 text-cyan-400" />
                <span className="font-bold">TuitionMedia</span>
              </div>
              <p className="text-xs text-muted-foreground">Bangladesh&apos;s leading tutoring marketplace connecting students and tutors.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/tutors" className="hover:text-cyan-400 transition-colors">Browse Tutors</Link></li>
                <li><Link href="/how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Log in</Link></li>
                <li><Link href="/signup?role=STUDENT" className="hover:text-cyan-400 transition-colors">Sign up as Student</Link></li>
                <li><Link href="/signup?role=TUTOR" className="hover:text-cyan-400 transition-colors">Join as Tutor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Subjects</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {["Mathematics", "Physics", "English", "Chemistry", "Biology", "ICT"].map((s) => (
                  <li key={s}><Link href={`/tutors?subject=${s}`} className="hover:text-cyan-400 transition-colors">{s}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2026 TuitionMedia. Made with ❤️ for Bangladesh.</p>
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              <span>10,000+ students connected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
