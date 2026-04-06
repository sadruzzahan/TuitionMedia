"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Search,
  MapPin,
  Star,
  BookOpen,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PublicNav } from "@/components/public-nav";
import { BANGLADESH_SUBJECTS, BANGLADESH_DIVISIONS } from "@/lib/bangladesh-data";

const SAMPLE_TUTORS = [
  {
    id: "1",
    name: "Dr. Rafiqul Islam",
    subjects: ["Mathematics", "Higher Math", "Physics"],
    location: "Dhanmondi, Dhaka",
    experience: 8,
    rating: 4.9,
    reviews: 47,
    rate: 800,
    level: "HSC / A-Level",
    verified: true,
    initials: "RI",
    color: "bg-cyan-500/20 text-cyan-400",
  },
  {
    id: "2",
    name: "Fatema Begum",
    subjects: ["English", "Bangla", "Literature"],
    location: "Mirpur, Dhaka",
    experience: 5,
    rating: 4.8,
    reviews: 32,
    rate: 500,
    level: "SSC / O-Level",
    verified: true,
    initials: "FB",
    color: "bg-emerald-500/20 text-emerald-400",
  },
  {
    id: "3",
    name: "Karim Hossain",
    subjects: ["Chemistry", "Biology"],
    location: "Sylhet Sadar",
    experience: 6,
    rating: 4.7,
    reviews: 28,
    rate: 600,
    level: "HSC Preparation",
    verified: false,
    initials: "KH",
    color: "bg-violet-500/20 text-violet-400",
  },
  {
    id: "4",
    name: "Nasrin Akhter",
    subjects: ["ICT", "Programming", "Mathematics"],
    location: "Chittagong City",
    experience: 4,
    rating: 4.9,
    reviews: 19,
    rate: 700,
    level: "University / HSC",
    verified: true,
    initials: "NA",
    color: "bg-teal-500/20 text-teal-400",
  },
  {
    id: "5",
    name: "Mizanur Rahman",
    subjects: ["Accounting", "Economics", "Business Studies"],
    location: "Gulshan, Dhaka",
    experience: 10,
    rating: 4.8,
    reviews: 63,
    rate: 1000,
    level: "SSC / HSC / University",
    verified: true,
    initials: "MR",
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    id: "6",
    name: "Shirin Sultana",
    subjects: ["Physics", "Mathematics"],
    location: "Rajshahi City",
    experience: 3,
    rating: 4.6,
    reviews: 14,
    rate: 450,
    level: "SSC / Junior",
    verified: false,
    initials: "SS",
    color: "bg-pink-500/20 text-pink-400",
  },
];

function TutorsContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get("subject") ?? "all";
  const initialDivision = searchParams.get("division") ?? "all";

  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState(initialSubject);
  const [division, setDivision] = useState(initialDivision);
  const [showFilters, setShowFilters] = useState(
    initialSubject !== "all" || initialDivision !== "all"
  );

  const filtered = SAMPLE_TUTORS.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchSubject =
      subject === "all" ||
      t.subjects.some((s) => s.toLowerCase().includes(subject.toLowerCase()));
    const matchDivision =
      division === "all" || t.location.toLowerCase().includes(division.toLowerCase());
    return matchSearch && matchSubject && matchDivision;
  });

  return (
    <main className="pt-28 pb-24 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Browse Tutors</span>
          <h1 className="mt-3 text-4xl font-bold">Find Your Perfect Tutor</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Discover qualified tutors across Bangladesh. Sign up to post a request and connect.
          </p>
        </motion.div>

        {/* Search + filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-3"
        >
          <div className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border-white/10 pl-9"
              />
            </div>
            <Button
              variant={showFilters ? "gradient" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="glass-card rounded-xl p-4 max-w-lg mx-auto"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Subject</label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="bg-white/5">
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subjects</SelectItem>
                      {BANGLADESH_SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Division</label>
                  <Select value={division} onValueChange={setDivision}>
                    <SelectTrigger className="bg-white/5">
                      <SelectValue placeholder="All divisions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All divisions</SelectItem>
                      {BANGLADESH_DIVISIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Showing {filtered.length} tutor{filtered.length !== 1 ? "s" : ""}
            {(search || subject !== "all" || division !== "all") && " matching your filters"}
          </p>
        </motion.div>

        {/* Tutor grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tutor, i) => (
            <motion.div
              key={tutor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card className="glass-card h-full hover:border-cyan-500/30 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold ${tutor.color}`}>
                      {tutor.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{tutor.name}</h3>
                        {tutor.verified && (
                          <span className="shrink-0 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{tutor.rating}</span>
                        <span className="text-xs text-muted-foreground">({tutor.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {tutor.subjects.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs text-cyan-400">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {tutor.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 shrink-0" />
                      {tutor.level}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{tutor.experience} years experience</span>
                      <span className="text-cyan-400 font-medium">৳{tutor.rate}/hr</span>
                    </div>
                  </div>
                  <Link href="/signup?role=STUDENT">
                    <Button variant="outline" size="sm" className="w-full mt-2 border-white/10 hover:border-cyan-500/30">
                      Request This Tutor
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No tutors match your criteria. Try adjusting your filters.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setSubject("all"); setDivision("all"); }}>
              Clear filters
            </Button>
          </div>
        )}

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass-card rounded-3xl p-10 text-center"
        >
          <h2 className="text-2xl font-bold">Don&apos;t see what you need?</h2>
          <p className="mt-2 text-muted-foreground">Post a tuition request and let tutors come to you!</p>
          <Link href="/signup?role=STUDENT" className="mt-6 inline-block">
            <Button variant="gradient" size="lg">Post a Free Request</Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

export default function TutorsPage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]" />
      <PublicNav />
      <Suspense fallback={<div className="pt-28 text-center text-muted-foreground">Loading...</div>}>
        <TutorsContent />
      </Suspense>
    </div>
  );
}
