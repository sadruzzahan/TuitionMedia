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
import { BANGLADESH_SUBJECTS, BANGLADESH_DIVISIONS, BANGLADESH_AREAS, BANGLADESH_EDUCATION_LEVELS, CLASS_MODES } from "@/lib/bangladesh-data";
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

  const [subjects, setSubjects] = useState<string[]>(() => {
    const s = searchParams.get("subjects");
    return s ? s.split(",").filter(Boolean) : [];
  });
  const [division, setDivision] = useState(searchParams.get("division") ?? "all");
  const [area, setArea] = useState(searchParams.get("area") ?? "all");
  const [gender, setGender] = useState(searchParams.get("gender") ?? "all");
  const [gradeLevel, setGradeLevel] = useState(searchParams.get("gradeLevel") ?? "all");
  const [teachingMode, setTeachingMode] = useState(searchParams.get("teachingMode") ?? "all");
  const [availableDay, setAvailableDay] = useState(searchParams.get("availableDay") ?? "all");
  const [minRate, setMinRate] = useState(searchParams.get("minRate") ?? "");
  const [maxRate, setMaxRate] = useState(searchParams.get("maxRate") ?? "");
  const [sort, setSort] = useState<string>(searchParams.get("sort") ?? "relevance");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"));
  const [showFilters, setShowFilters] = useState(false);

  const areaOptions = division !== "all" ? (BANGLADESH_AREAS as Record<string, readonly string[]>)[division] ?? [] : [];

  const [data, setData] = useState<TutorListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTutors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subjects.length > 0) params.set("subjects", subjects.join(","));
      if (division !== "all") params.set("division", division);
      if (area !== "all") params.set("area", area);
      if (gender !== "all") params.set("gender", gender);
      if (gradeLevel !== "all") params.set("gradeLevel", gradeLevel);
      if (teachingMode !== "all") params.set("teachingMode", teachingMode);
      if (availableDay !== "all") params.set("availableDay", availableDay);
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
  }, [subjects, division, area, gender, gradeLevel, teachingMode, availableDay, minRate, maxRate, sort, page]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const activeFilterCount = [
    subjects.length > 0,
    division !== "all",
    area !== "all",
    gender !== "all",
    gradeLevel !== "all",
    teachingMode !== "all",
    availableDay !== "all",
    !!minRate,
    !!maxRate,
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  const clearFilters = () => {
    setSubjects([]);
    setDivision("all");
    setArea("all");
    setGender("all");
    setGradeLevel("all");
    setTeachingMode("all");
    setAvailableDay("all");
    setMinRate("");
    setMaxRate("");
    setPage(1);
  };

  const toggleSubject = (s: string) => {
    setSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
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

        {/* Quick Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <div className="glass-card rounded-2xl p-4 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select value={subjects.length === 1 ? subjects[0] : subjects.length > 1 ? "__multi__" : "all"} onValueChange={(v) => { if (v !== "all" && v !== "__multi__") { setSubjects([v]); setPage(1); } else if (v === "all") { setSubjects([]); setPage(1); } }}>
                  <SelectTrigger className="bg-white/5 border-white/10 pl-9">
                    <SelectValue placeholder="What subject?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {BANGLADESH_SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {subjects.length > 1 && (
                  <span className="absolute right-9 top-1/2 -translate-y-1/2 text-xs text-cyan-400 pointer-events-none">{subjects.length} selected</span>
                )}
              </div>
              <div className="flex-1">
                <Select value={division} onValueChange={(v) => { setDivision(v); setArea("all"); setPage(1); }}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
                    <SelectValue placeholder="Which division?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {BANGLADESH_DIVISIONS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:w-52">
                <Select value={gradeLevel} onValueChange={(v) => { setGradeLevel(v); setPage(1); }}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Grade / Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any grade</SelectItem>
                    {BANGLADESH_EDUCATION_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="gradient"
                className="gap-2 sm:w-auto"
                onClick={fetchTutors}
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
                  {activeFilterCount}
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
              className="glass-card rounded-xl p-5 max-w-3xl mx-auto"
            >
              <div className="space-y-5">
                {/* Subjects Multi-Select */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    Subjects {subjects.length > 0 && <span className="text-cyan-400 ml-1">({subjects.length} selected)</span>}
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {BANGLADESH_SUBJECTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSubject(s)}
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-xs transition-all",
                          subjects.includes(s)
                            ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-400"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {subjects.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setSubjects([]); setPage(1); }}
                      className="mt-1.5 text-xs text-muted-foreground hover:text-white transition-colors"
                    >
                      Clear subjects
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Grade Level */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Grade / Level</label>
                    <Select value={gradeLevel} onValueChange={(v) => { setGradeLevel(v); setPage(1); }}>
                      <SelectTrigger className="bg-white/5">
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All levels</SelectItem>
                        {BANGLADESH_EDUCATION_LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Teaching Mode */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Teaching Mode</label>
                    <Select value={teachingMode} onValueChange={(v) => { setTeachingMode(v); setPage(1); }}>
                      <SelectTrigger className="bg-white/5">
                        <SelectValue placeholder="Any mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any mode</SelectItem>
                        {CLASS_MODES.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Division */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Division</label>
                    <Select value={division} onValueChange={(v) => { setDivision(v); setArea("all"); setPage(1); }}>
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

                  {/* Area */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Area / Neighbourhood</label>
                    <Select
                      value={area}
                      onValueChange={(v) => { setArea(v); setPage(1); }}
                      disabled={division === "all"}
                    >
                      <SelectTrigger className="bg-white/5">
                        <SelectValue placeholder={division === "all" ? "Select division first" : "All areas"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All areas</SelectItem>
                        {areaOptions.map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Budget Range */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1.5 block">
                      Hourly Rate (৳/hr)
                      {(minRate || maxRate) && (
                        <span className="text-cyan-400 ml-1">
                          {minRate && maxRate ? `৳${Number(minRate).toLocaleString()} – ৳${Number(maxRate).toLocaleString()}` : minRate ? `From ৳${Number(minRate).toLocaleString()}` : `Up to ৳${Number(maxRate).toLocaleString()}`}
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[
                        { label: "Any", min: "", max: "" },
                        { label: "Under ৳300", min: "", max: "300" },
                        { label: "৳300–600", min: "300", max: "600" },
                        { label: "৳600–1000", min: "600", max: "1000" },
                        { label: "৳1000–2000", min: "1000", max: "2000" },
                        { label: "৳2000+", min: "2000", max: "" },
                      ].map((r) => (
                        <button
                          key={r.label}
                          type="button"
                          onClick={() => { setMinRate(r.min); setMaxRate(r.max); setPage(1); }}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs transition-all",
                            minRate === r.min && maxRate === r.max
                              ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-400"
                              : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                          )}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={minRate}
                        onChange={(e) => { setMinRate(e.target.value); setPage(1); }}
                        placeholder="Min ৳"
                        className="bg-white/5 border-white/10 text-sm"
                      />
                      <span className="flex items-center text-muted-foreground text-xs">to</span>
                      <Input
                        type="number"
                        value={maxRate}
                        onChange={(e) => { setMaxRate(e.target.value); setPage(1); }}
                        placeholder="Max ৳"
                        className="bg-white/5 border-white/10 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Availability Day */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Available On
                    {availableDay !== "all" && <span className="text-cyan-400 ml-1">{availableDay}</span>}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: "all", label: "Any day" },
                      { value: "Saturday", label: "Sat" },
                      { value: "Sunday", label: "Sun" },
                      { value: "Monday", label: "Mon" },
                      { value: "Tuesday", label: "Tue" },
                      { value: "Wednesday", label: "Wed" },
                      { value: "Thursday", label: "Thu" },
                      { value: "Friday", label: "Fri" },
                    ].map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => { setAvailableDay(d.value); setPage(1); }}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs transition-all",
                          availableDay === d.value
                            ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-400"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender Preference */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Tutor Gender Preference</label>
                  <div className="flex gap-2">
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
