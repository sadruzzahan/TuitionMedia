"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Search,
  MapPin,
  Star,
  BookOpen,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  BadgeCheck,
  Sparkles,
  X,
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
import { cn } from "@/lib/utils";

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

type TutorListResponse = {
  featured: TutorCard[];
  tutors: TutorCard[];
  total: number;
  page: number;
  totalPages: number;
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

function TutorCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="h-12 w-12 rounded-xl bg-white/10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-6 w-16 rounded-full bg-white/10" />)}
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/10 rounded w-full" />
        <div className="h-3 bg-white/10 rounded w-2/3" />
      </div>
    </div>
  );
}

function TutorCardUI({ tutor, index, featured = false }: { tutor: TutorCard; index: number; featured?: boolean }) {
  const color = getAvatarColor(tutor.id);
  const initials = getInitials(tutor.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/tutors/${tutor.id}`}>
        <Card className={cn(
          "glass-card h-full transition-all cursor-pointer group",
          featured
            ? "border-amber-500/30 hover:border-amber-500/50"
            : "hover:border-cyan-500/30"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${color}`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-semibold text-sm group-hover:text-cyan-400 transition-colors">
                    {tutor.name ?? "Tutor"}
                  </h3>
                  {tutor.isVerified && (
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  )}
                  {featured && (
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
                    <span className="text-xs text-muted-foreground">({tutor.totalReviews} reviews)</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">New tutor</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tutor.bio && (
              <p className="text-xs text-muted-foreground line-clamp-2">{tutor.bio}</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {tutor.subjects.slice(0, 3).map((s) => (
                <span key={s} className="rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs text-cyan-400">
                  {s}
                </span>
              ))}
              {tutor.subjects.length > 3 && (
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-muted-foreground">
                  +{tutor.subjects.length - 3} more
                </span>
              )}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              {tutor.division && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {tutor.division}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3 w-3 shrink-0" />
                {tutor.experience > 0 ? `${tutor.experience} yrs experience` : "New tutor"}
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 shrink-0" />
                  {tutor.totalReviews} student{tutor.totalReviews !== 1 ? "s" : ""}
                </div>
                <span className="text-cyan-400 font-semibold">৳{tutor.hourlyRate.toLocaleString()}/hr</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className={cn(
              "w-full mt-1 text-xs",
              featured
                ? "border-amber-500/30 hover:border-amber-500/50 hover:text-amber-400"
                : "border-white/10 hover:border-cyan-500/30 hover:text-cyan-400"
            )}>
              View Profile
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function TutorsContent() {
  const searchParams = useSearchParams();

  const [subject, setSubject] = useState(searchParams.get("subject") ?? "all");
  const [division, setDivision] = useState(searchParams.get("division") ?? "all");
  const [gender, setGender] = useState(searchParams.get("gender") ?? "all");
  const [minRate, setMinRate] = useState(searchParams.get("minRate") ?? "");
  const [maxRate, setMaxRate] = useState(searchParams.get("maxRate") ?? "");
  const [sort, setSort] = useState<string>(searchParams.get("sort") ?? "relevance");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"));
  const [showFilters, setShowFilters] = useState(false);

  const [data, setData] = useState<TutorListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTutors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subject !== "all") params.set("subject", subject);
      if (division !== "all") params.set("division", division);
      if (gender !== "all") params.set("gender", gender);
      if (minRate) params.set("minRate", minRate);
      if (maxRate) params.set("maxRate", maxRate);
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", "12");

      const res = await fetch(`/api/tutors?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json() as TutorListResponse;
      setData(json);
    } catch {
      setData({ featured: [], tutors: [], total: 0, page: 1, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [subject, division, gender, minRate, maxRate, sort, page]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const hasFilters = subject !== "all" || division !== "all" || gender !== "all" || minRate || maxRate;

  const clearFilters = () => {
    setSubject("all");
    setDivision("all");
    setGender("all");
    setMinRate("");
    setMaxRate("");
    setPage(1);
  };

  return (
    <main className="pt-28 pb-24 px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Browse Tutors</span>
          <h1 className="mt-3 text-4xl font-bold">Find Your Perfect Tutor</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Discover qualified tutors across Bangladesh. Browse profiles, check ratings, and connect directly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-3"
        >
          <div className="flex gap-2 max-w-2xl mx-auto flex-wrap">
            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
              <SelectTrigger className="bg-white/5 border-white/10 w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="rate_asc">Rate: Low → High</SelectItem>
                <SelectItem value="rate_desc">Rate: High → Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showFilters ? "gradient" : "outline"}
              className="gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasFilters && (
                <span className="ml-1 rounded-full bg-cyan-500 px-1.5 py-0.5 text-[10px] text-black font-bold">
                  {[subject !== "all", division !== "all", !!minRate, !!maxRate].filter(Boolean).length}
                </span>
              )}
            </Button>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="glass-card rounded-xl p-4 max-w-2xl mx-auto"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Subject</label>
                  <Select value={subject} onValueChange={(v) => { setSubject(v); setPage(1); }}>
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
                  <Select value={division} onValueChange={(v) => { setDivision(v); setPage(1); }}>
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
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Min Rate (৳/hr)</label>
                  <Input
                    type="number"
                    value={minRate}
                    onChange={(e) => { setMinRate(e.target.value); setPage(1); }}
                    placeholder="e.g. 200"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Max Rate (৳/hr)</label>
                  <Input
                    type="number"
                    value={maxRate}
                    onChange={(e) => { setMaxRate(e.target.value); setPage(1); }}
                    placeholder="e.g. 1000"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1.5 block">Tutor Gender Preference</label>
                  <div className="flex gap-3">
                    {[
                      { value: "all", label: "Any" },
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setGender(opt.value); setPage(1); }}
                        className={cn(
                          "flex-1 rounded-lg border py-2 text-sm transition-all",
                          gender === opt.value
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            {loading ? (
              <span className="flex items-center justify-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading tutors...
              </span>
            ) : (
              `Showing ${data?.total ?? 0} tutor${(data?.total ?? 0) !== 1 ? "s" : ""}${hasFilters ? " matching your filters" : ""}`
            )}
          </p>
        </motion.div>

        {/* Featured Tutors */}
        {!loading && data && data.featured.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Featured Tutors</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {data.featured.map((tutor, i) => (
                <TutorCardUI key={tutor.id} tutor={tutor} index={i} featured />
              ))}
            </div>
            <div className="mt-8 border-t border-white/10" />
          </motion.div>
        )}

        {/* Regular Tutors */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <TutorCardSkeleton key={i} />)}
          </div>
        ) : data && data.tutors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.tutors.map((tutor, i) => (
              <TutorCardUI key={tutor.id} tutor={tutor} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            {hasFilters ? (
              <>
                <p className="text-muted-foreground text-lg mb-2">No tutors match your filters</p>
                <p className="text-sm text-muted-foreground/70 mb-6">Try adjusting your search criteria or browse all tutors.</p>
                <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-lg mb-2">No tutors have joined yet</p>
                <p className="text-sm text-muted-foreground/70 mb-6">Be the first to join TuitionMedia as a tutor!</p>
                <Link href="/signup?role=TUTOR">
                  <Button variant="gradient">Join as a Tutor</Button>
                </Link>
              </>
            )}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass-card rounded-3xl p-10 text-center"
        >
          <h2 className="text-2xl font-bold">Are you a tutor?</h2>
          <p className="mt-2 text-muted-foreground">Join TuitionMedia and connect with students across Bangladesh.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/signup?role=TUTOR">
              <Button variant="gradient" size="lg">Join as Tutor</Button>
            </Link>
            <Link href="/signup?role=STUDENT">
              <Button variant="outline" size="lg">Post a Request</Button>
            </Link>
          </div>
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
      <Suspense fallback={
        <main className="pt-28 pb-24 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-10">
              <div className="h-6 w-32 bg-white/10 rounded mx-auto mb-3 animate-pulse" />
              <div className="h-10 w-64 bg-white/10 rounded mx-auto mb-3 animate-pulse" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <TutorCardSkeleton key={i} />)}
            </div>
          </div>
        </main>
      }>
        <TutorsContent />
      </Suspense>
    </div>
  );
}
