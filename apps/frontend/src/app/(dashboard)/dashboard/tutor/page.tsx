"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, Users, SlidersHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { BANGLADESH_SUBJECTS } from "@/lib/bangladesh-data";

type TuitionRequest = {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  budget: string | null;
  division: string | null;
  area: string | null;
  level: string | null;
  mode: string | null;
  status: string;
  _count: { applications: number };
  student: { email: string; name: string | null };
};

const MODE_LABELS: Record<string, string> = {
  HOME: "Home Visit",
  ONLINE: "Online",
  CENTER: "Coaching Center",
};

export default function TutorJobBoardPage() {
  const [requests, setRequests] = useState<TuitionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TuitionRequest | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await apiGet<TuitionRequest[]>("/tuition-requests/open");
        setRequests(data);
      } catch (error) {
        console.error("Failed to fetch tuition requests:", error);
        if (error instanceof Error && error.message.includes("401")) {
          toast({
            title: "Authentication required",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
        }
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const subjectsText = (r.subjects ?? []).join(" ").toLowerCase();
      const matchSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        subjectsText.includes(search.toLowerCase());
      const matchSubject =
        !subjectFilter ||
        (r.subjects ?? []).some((s) =>
          s.toLowerCase().includes(subjectFilter.toLowerCase())
        );
      return matchSearch && matchSubject;
    });
  }, [requests, search, subjectFilter]);

  async function handleApply() {
    if (!selected) return;
    if (!coverLetter.trim()) {
      toast({ title: "Please write a cover letter", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/applications", { requestId: selected.id, coverLetter });
      toast({ title: "Application sent!", variant: "success" });
      setSelected(null);
      setCoverLetter("");
      setRequests((prev) => prev.filter((r) => r.id !== selected.id));
    } catch (err) {
      toast({
        title: "Failed to apply",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold">Job Board</h1>
        <p className="mt-1 text-muted-foreground">Browse open tuition requests and apply.</p>
      </motion.div>

      {/* Search & Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 space-y-3"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, subject, or description..."
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

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card rounded-xl p-4">
                <Label className="mb-2 block text-sm text-muted-foreground">Filter by subject</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSubjectFilter("")}
                    className={`rounded-full px-3 py-1 text-xs transition-all ${
                      !subjectFilter
                        ? "bg-cyan-500/30 text-cyan-300"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    All subjects
                  </button>
                  {BANGLADESH_SUBJECTS.slice(0, 18).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSubjectFilter(subjectFilter === s ? "" : s)}
                      className={`rounded-full px-3 py-1 text-xs transition-all ${
                        subjectFilter === s
                          ? "bg-cyan-500/30 text-cyan-300"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(search || subjectFilter) && (
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length} of {requests.length} requests
            {subjectFilter && (
              <span>
                {" "}
                in <span className="text-cyan-400">{subjectFilter}</span>
              </span>
            )}
          </p>
        )}
      </motion.div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="h-48 rounded-xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-16 text-center"
        >
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold">
            {requests.length === 0 ? "No open requests" : "No results found"}
          </h3>
          <p className="mt-2 text-muted-foreground">
            {requests.length === 0
              ? "Check back later for new tuition requests."
              : "Try adjusting your search or filters."}
          </p>
          {(search || subjectFilter) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setSubjectFilter("");
              }}
            >
              Clear filters
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Card
                  className="glass-card h-full cursor-pointer transition-all duration-300 hover:border-cyan-500/30 hover:shadow-cyan-500/10"
                  onClick={() => {
                    setSelected(req);
                    setCoverLetter("");
                  }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1 text-base">{req.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(req.subjects ?? []).slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-400"
                        >
                          {s}
                        </span>
                      ))}
                      {(req.subjects ?? []).length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{(req.subjects ?? []).length - 3} more
                        </span>
                      )}
                      {req.level && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted-foreground">
                          {req.level}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{req.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {req.budget != null && (
                        <span className="text-cyan-400 font-medium">
                          ৳{String(req.budget)}/hr
                        </span>
                      )}
                      {(req.division || req.area) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {req.area ?? req.division}
                        </span>
                      )}
                      {req.mode && (
                        <span>{MODE_LABELS[req.mode] ?? req.mode}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {req._count.applications} applied
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Apply dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass-card border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{selected?.title}</DialogTitle>
            <div className="flex flex-wrap gap-2 pt-1">
              {(selected?.subjects ?? []).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-400"
                >
                  {s}
                </span>
              ))}
              {selected?.level && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted-foreground">
                  {selected.level}
                </span>
              )}
              {selected?.mode && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted-foreground">
                  {MODE_LABELS[selected.mode] ?? selected.mode}
                </span>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-white/5 p-3 text-sm text-muted-foreground">
              {selected?.description}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {selected?.budget && (
                <span className="text-cyan-400 font-medium">
                  Budget: ৳{String(selected.budget)}/hr
                </span>
              )}
              {(selected?.division || selected?.area) && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {selected.area ? `${selected.area}, ${selected.division}` : selected.division}
                </span>
              )}
              <span className="text-muted-foreground">
                Posted by: {selected?.student.name ?? selected?.student.email}
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">
                Your cover letter <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="cover"
                placeholder="Introduce yourself, your experience, and why you're the right fit for this student..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                className="bg-white/5 border-white/10"
              />
              <p className="text-xs text-muted-foreground">{coverLetter.length}/2000 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleApply}
              disabled={!coverLetter.trim() || submitting}
            >
              {submitting ? "Sending..." : "Apply Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
