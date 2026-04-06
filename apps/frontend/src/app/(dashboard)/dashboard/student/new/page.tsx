"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  BANGLADESH_SUBJECTS,
  BANGLADESH_DIVISIONS,
  BANGLADESH_AREAS,
  BANGLADESH_EDUCATION_LEVELS,
  CLASS_MODES,
  BUDGET_RANGES_BDT,
} from "@/lib/bangladesh-data";

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subjects: [] as string[],
    level: "",
    mode: "",
    budget: "",
    division: "",
    area: "",
  });
  const [subjectInput, setSubjectInput] = useState("");
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  // Handle division change to update available areas
  const handleDivisionChange = (division: string) => {
    setForm((f) => ({ ...f, division, area: "" }));
    const areas = BANGLADESH_AREAS[division];
    setAvailableAreas(areas ? [...areas] : []);
  };

  // Add subject to list
  const addSubject = (subject: string) => {
    if (subject && !form.subjects.includes(subject)) {
      setForm((f) => ({ ...f, subjects: [...f.subjects, subject] }));
    }
    setSubjectInput("");
  };

  // Remove subject from list
  const removeSubject = (subject: string) => {
    setForm((f) => ({ ...f, subjects: f.subjects.filter((s) => s !== subject) }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (form.subjects.length === 0) {
      toast({
        title: "Please select at least one subject",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await apiPost<{ id: string }>("/tuition-requests", {
        title: form.title,
        description: form.description,
        subjects: form.subjects,
        level: form.level || undefined,
        mode: form.mode || undefined,
        budget: form.budget && form.budget !== "negotiable" ? Number(form.budget) : undefined,
        division: form.division || undefined,
        area: form.area || undefined,
      });
      toast({ title: "Request posted!", variant: "success" });
      router.push(`/dashboard/student/${res.id}`);
    } catch (err) {
      toast({
        title: "Failed to post",
        description: err instanceof Error ? err.message : "Invalid data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl"
    >
      <h1 className="text-3xl font-bold">Post a Tuition Request</h1>
      <p className="mt-1 text-muted-foreground">Describe what you need and tutors will apply.</p>

      <Card className="mt-8 glass-card">
        <CardHeader>
          <CardTitle>New Request</CardTitle>
          <CardDescription>Fill in the details below. All amounts are in BDT (৳).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Need Math tutor for SSC preparation"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="bg-white/5"
              />
            </div>
            
            {/* Multi-select Subjects */}
            <div className="space-y-2">
              <Label>Subjects * (Select multiple)</Label>
              <div className="flex gap-2">
                <Select value={subjectInput} onValueChange={(v) => {
                  addSubject(v);
                  setSubjectInput("");
                }}>
                  <SelectTrigger className="bg-white/5 flex-1">
                    <SelectValue placeholder="Add a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANGLADESH_SUBJECTS.filter((s) => !form.subjects.includes(s)).map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-400"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => removeSubject(subject)}
                        className="hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level">Education Level</Label>
                <Select value={form.level} onValueChange={(v: string) => setForm((f) => ({ ...f, level: v }))}>
                  <SelectTrigger className="bg-white/5">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANGLADESH_EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mode">Class Mode</Label>
                <Select value={form.mode} onValueChange={(v: string) => setForm((f) => ({ ...f, mode: v }))}>
                  <SelectTrigger className="bg-white/5">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location: Division and Area */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="division" className="text-sm text-muted-foreground">Division</Label>
                  <Select value={form.division} onValueChange={handleDivisionChange}>
                    <SelectTrigger className="bg-white/5">
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANGLADESH_DIVISIONS.map((division) => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="area" className="text-sm text-muted-foreground">Area</Label>
                  <Select 
                    value={form.area} 
                    onValueChange={(v: string) => setForm((f) => ({ ...f, area: v }))}
                    disabled={!form.division}
                  >
                    <SelectTrigger className="bg-white/5">
                      <SelectValue placeholder={form.division ? "Select area" : "Select division first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget Range (BDT)</Label>
              <Select value={form.budget} onValueChange={(v: string) => setForm((f) => ({ ...f, budget: v }))}>
                <SelectTrigger className="bg-white/5">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES_BDT.map((budget) => (
                    <SelectItem key={budget.value} value={budget.value}>
                      {budget.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your learning goals, preferred schedule, any specific requirements..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
                rows={4}
                className="bg-white/5"
              />
            </div>
            
            <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
              {loading ? "Posting..." : "Post Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
