"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import {
  Save,
  User,
  BookOpen,
  GraduationCap,
  Plus,
  X,
  CheckCircle2,
  Star,
  Users,
  Shield,
  Eye,
  EyeOff,
  Upload,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/auth-store";
import { apiGet, apiPut, apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  is_verified: boolean;
  created_at: string;
};

type TutorProfile = {
  bio: string | null;
  subjects: string[];
  hourly_rate: string;
  education: string | null;
  division: string | null;
  areas: string[];
  experience: number;
  gender: string | null;
  teaching_mode: string | null;
  is_verified: boolean;
  is_profile_public: boolean;
  average_rating: string | null;
  total_reviews: number;
  total_students: number;
};

type StudentProfile = {
  grade: string | null;
  school: string | null;
  subjects: string[];
  goals: string | null;
  division: string | null;
  areas: string[];
};

function SubjectTag({ subject, onRemove }: { subject: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-400">
      {subject}
      <button onClick={onRemove} className="ml-1 hover:text-red-400 transition-colors">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function ProfileProgress({
  role,
  name,
  phone,
  tutorProfile,
  studentProfile,
}: {
  role: string;
  name: string;
  phone: string;
  tutorProfile: TutorProfile | null;
  studentProfile: StudentProfile | null;
}) {
  const items: { label: string; done: boolean }[] = [
    { label: "Name set", done: !!name.trim() },
    { label: "Phone number", done: !!phone.trim() },
  ];

  if (role === "TUTOR") {
    items.push(
      { label: "Bio written", done: !!tutorProfile?.bio },
      { label: "Subjects added", done: (tutorProfile?.subjects?.length ?? 0) > 0 },
      { label: "Hourly rate set", done: !!tutorProfile?.hourly_rate },
      { label: "Education filled", done: !!tutorProfile?.education },
      { label: "Division / Area", done: !!(tutorProfile?.division || (tutorProfile?.areas?.length ?? 0) > 0) },
      { label: "Gender set", done: !!tutorProfile?.gender },
      { label: "Teaching mode", done: !!tutorProfile?.teaching_mode },
    );
  } else {
    items.push(
      { label: "Grade / Level", done: !!studentProfile?.grade },
      { label: "School / Institution", done: !!studentProfile?.school },
      { label: "Learning goals", done: !!studentProfile?.goals },
      { label: "Subjects added", done: (studentProfile?.subjects?.length ?? 0) > 0 },
    );
  }

  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="glass-card rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">Profile Completion</h3>
          <p className="text-xs text-muted-foreground">Complete your profile to attract more connections</p>
        </div>
        <div className="text-2xl font-bold text-cyan-400">{pct}%</div>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5",
              item.done
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-white/5 text-muted-foreground"
            )}
          >
            <CheckCircle2 className={cn("h-3 w-3 shrink-0", item.done ? "text-emerald-400" : "text-muted-foreground/40")} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

const TABS_TUTOR = [
  { id: "account", label: "Account Info", icon: User },
  { id: "tutor", label: "Tutor Profile", icon: GraduationCap },
  { id: "verification", label: "Verification", icon: Shield },
];

const TABS_STUDENT = [
  { id: "account", label: "Account Info", icon: User },
  { id: "student", label: "Student Profile", icon: BookOpen },
];

type DocumentRecord = {
  id: string;
  type: string;
  file_url: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string | null;
  created_at: string;
};

const DOC_TYPES = [
  { value: "NID", label: "National ID (NID)" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DEGREE_CERTIFICATE", label: "Degree Certificate" },
  { value: "TEACHING_CERTIFICATE", label: "Teaching Certificate" },
  { value: "STUDENT_ID", label: "Student ID Card" },
  { value: "OTHER", label: "Other Document" },
];

function VerificationTab({ isVerified }: { isVerified: boolean }) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState(DOC_TYPES[0].value);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadDocuments() {
    try {
      const docs = await apiGet<DocumentRecord[]>("/documents/my");
      setDocuments(docs);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  function processFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 5MB", variant: "destructive" });
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a JPG, PNG, WebP, or PDF", variant: "destructive" });
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setFileBase64(result);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  }

  async function handleUpload() {
    if (!fileBase64) {
      toast({ title: "Please select a file first", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      await apiPost("/documents", {
        type: docType,
        fileUrl: fileBase64,
      });
      toast({ title: "Document submitted!", description: "Our team will review it within 24-48 hours.", variant: "success" });
      setFileBase64(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadDocuments();
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  const statusConfig = {
    PENDING: { label: "Under Review", color: "bg-amber-500/20 text-amber-400", icon: Clock },
    APPROVED: { label: "Approved", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle },
    REJECTED: { label: "Rejected", color: "bg-red-500/20 text-red-400", icon: XCircle },
  };

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      {isVerified && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
          <BadgeCheck className="h-6 w-6 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-400">Profile Verified</p>
            <p className="text-xs text-muted-foreground">Your identity has been verified. Students can see your verified badge.</p>
          </div>
        </div>
      )}

      {!isVerified && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <p className="text-sm font-medium text-amber-400 mb-1">Get Verified</p>
          <p className="text-xs text-muted-foreground">
            Submit identity or qualification documents to receive a verified badge on your profile.
            Verified tutors get significantly more student inquiries.
          </p>
        </div>
      )}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-5 w-5 text-cyan-400" />
            Submit a Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Document Type</Label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {DOC_TYPES.map((dt) => (
                <option key={dt.value} value={dt.value} className="bg-background">
                  {dt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>File (JPG, PNG, WebP, or PDF — max 5MB)</Label>
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer",
                isDragging
                  ? "border-cyan-400/70 bg-cyan-500/10 scale-[1.01]"
                  : fileName
                    ? "border-cyan-500/40 bg-cyan-500/5"
                    : "border-white/10 bg-white/5 hover:border-white/20"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {fileName ? (
                <>
                  <FileText className="h-8 w-8 text-cyan-400" />
                  <p className="text-sm font-medium text-cyan-400">{fileName}</p>
                  <p className="text-xs text-muted-foreground">Click or drag to change file</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Click or drag and drop to upload</p>
                  <p className="text-xs text-muted-foreground/60">JPG, PNG, WebP, PDF</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <Button
            variant="gradient"
            onClick={handleUpload}
            disabled={uploading || !fileBase64}
            className="w-full gap-2"
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</>
            ) : (
              <><Upload className="h-4 w-4" />Submit Document</>
            )}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : documents.length > 0 ? (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-cyan-400" />
              Submitted Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.map((doc) => {
              const cfg = statusConfig[doc.status];
              const docLabel = DOC_TYPES.find((dt) => dt.value === doc.type)?.label ?? doc.type;
              return (
                <div key={doc.id} className="flex items-start justify-between gap-3 rounded-lg bg-white/5 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{docLabel}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(doc.created_at).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {doc.status === "REJECTED" && doc.reason && (
                      <p className="text-xs text-red-400 mt-1">{doc.reason}</p>
                    )}
                  </div>
                  <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0", cfg.color)}>
                    <cfg.icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card">
          <CardContent className="py-8 text-center">
            <Shield className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No documents submitted yet</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [education, setEducation] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [goals, setGoals] = useState("");
  const [studentLocation, setStudentLocation] = useState("");
  const [studentSubjects, setStudentSubjects] = useState<string[]>([]);
  const [studentSubjectInput, setStudentSubjectInput] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const me = await apiGet<UserProfile>("/auth/me");
        setProfile(me);
        setName(me.name ?? "");
        setPhone(me.phone ?? "");

        if (me.role === "TUTOR") {
          const tp = await apiGet<TutorProfile>("/auth/tutor-profile").catch(() => null);
          if (tp) {
            setTutorProfile(tp);
            setBio(tp.bio ?? "");
            setHourlyRate(tp.hourly_rate ? String(tp.hourly_rate) : "");
            setEducation(tp.education ?? "");
            setLocation(tp.division ?? "");
            setExperience(tp.experience ? String(tp.experience) : "");
            setSubjects(tp.subjects ?? []);
            setIsProfilePublic(tp.is_profile_public ?? true);
          }
        } else if (me.role === "STUDENT") {
          const sp = await apiGet<StudentProfile>("/auth/student-profile").catch(() => null);
          if (sp) {
            setStudentProfile(sp);
            setGrade(sp.grade ?? "");
            setSchool(sp.school ?? "");
            setGoals(sp.goals ?? "");
            setStudentLocation(sp.division ?? "");
            setStudentSubjects(sp.subjects ?? []);
          }
        }
      } catch {
        toast({ title: "Failed to load profile", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveBasicInfo() {
    setSaving(true);
    try {
      const updated = await apiPut<UserProfile>("/auth/profile", {
        ...(name.trim() && { name: name.trim() }),
        ...(phone.trim() && { phone: phone.trim() }),
      });
      setProfile(updated);
      if (user && token) setAuth({ ...user, name: updated.name }, token);
      toast({ title: "Profile updated!", variant: "success" });
    } catch (err) {
      toast({ title: "Failed to save", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function saveTutorProfile() {
    setSaving(true);
    try {
      const updated = await apiPut<TutorProfile>("/auth/tutor-profile", {
        bio: bio.trim() || undefined,
        subjects,
        hourly_rate: hourlyRate ? Number(hourlyRate) : undefined,
        education: education.trim() || undefined,
        division: location.trim() || undefined,
        experience: experience ? Number(experience) : undefined,
      });
      setTutorProfile(updated);
      toast({ title: "Tutor profile saved!", variant: "success" });
    } catch (err) {
      toast({ title: "Failed to save", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleProfileVisibility() {
    setTogglingVisibility(true);
    try {
      const updated = await apiPut<TutorProfile>("/auth/tutor-profile", {
        is_profile_public: !isProfilePublic,
      });
      setIsProfilePublic(updated.is_profile_public ?? !isProfilePublic);
      toast({
        title: updated.is_profile_public ? "Profile is now public" : "Profile is now hidden",
        description: updated.is_profile_public
          ? "Students can find you on the browse page."
          : "Your profile won't appear in search results.",
        variant: "success",
      });
    } catch (err) {
      toast({ title: "Failed to update visibility", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setTogglingVisibility(false);
    }
  }

  async function saveStudentProfile() {
    setSaving(true);
    try {
      const updated = await apiPut<StudentProfile>("/auth/student-profile", {
        grade: grade.trim() || undefined,
        school: school.trim() || undefined,
        subjects: studentSubjects,
        goals: goals.trim() || undefined,
        division: studentLocation.trim() || undefined,
      });
      setStudentProfile(updated);
      toast({ title: "Student profile saved!", variant: "success" });
    } catch (err) {
      toast({ title: "Failed to save", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  function addSubject(subj: string, list: string[], setList: (v: string[]) => void, setInput: (v: string) => void) {
    const trimmed = subj.trim();
    if (trimmed && !list.includes(trimmed)) setList([...list, trimmed]);
    setInput("");
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent"
        />
      </div>
    );
  }

  const tabs = profile?.role === "TUTOR" ? TABS_TUTOR : TABS_STUDENT;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account and profile details.</p>
      </div>

      {/* Progress bar */}
      <ProfileProgress
        role={profile?.role ?? ""}
        name={name}
        phone={phone}
        tutorProfile={tutorProfile}
        studentProfile={studentProfile}
      />

      {/* Tutor stats strip */}
      {profile?.role === "TUTOR" && tutorProfile && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Star, value: tutorProfile.average_rating ?? "—", label: "Avg Rating" },
            { icon: Users, value: tutorProfile.total_students, label: "Students" },
            { icon: Shield, value: tutorProfile.is_verified ? "Verified" : "Unverified", label: "Status" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
              <stat.icon className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-base font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 glass-card rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Account Info */}
      {activeTab === "account" && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5 text-cyan-400" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email ?? ""} disabled className="bg-white/5 border-white/10 opacity-60" />
                <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-400">{profile?.role}</span>
                  {profile?.is_verified && (
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-400">✓ Verified</span>
                  )}
                </div>
                <Button variant="gradient" onClick={saveBasicInfo} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tab: Tutor Profile */}
      {activeTab === "tutor" && profile?.role === "TUTOR" && (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-5 w-5 text-cyan-400" />
                Tutor Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell students about yourself, your teaching style, and experience..."
                  rows={4}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (BDT ৳)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min={0}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="e.g. 500"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min={0}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 3"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. BSc Mathematics, DU"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Dhanmondi, Dhaka"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subjects You Teach</Label>
                <div className="flex flex-wrap gap-2 min-h-[36px] rounded-lg bg-white/5 p-2">
                  {subjects.map((s) => (
                    <SubjectTag key={s} subject={s} onRemove={() => setSubjects(subjects.filter((x) => x !== s))} />
                  ))}
                  {subjects.length === 0 && <span className="text-xs text-muted-foreground self-center">No subjects added yet</span>}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(subjectInput, subjects, setSubjects, setSubjectInput); }}}
                    placeholder="Type a subject and press Enter"
                    className="bg-white/5 border-white/10"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => addSubject(subjectInput, subjects, setSubjects, setSubjectInput)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* Profile Visibility Toggle */}
              <div className="rounded-xl border border-white/10 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {isProfilePublic ? (
                        <Eye className="h-4 w-4 text-cyan-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <p className="text-sm font-medium">
                        {isProfilePublic ? "Profile is Public" : "Profile is Hidden"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isProfilePublic
                        ? "Students can find you on the browse page and view your profile."
                        : "Your profile is hidden from students. Enable to appear in search results."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleProfileVisibility}
                    disabled={togglingVisibility}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                      isProfilePublic ? "bg-cyan-500" : "bg-white/20"
                    )}
                    role="switch"
                    aria-checked={isProfilePublic}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200",
                        isProfilePublic ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="gradient" onClick={saveTutorProfile} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Tutor Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tab: Verification */}
      {activeTab === "verification" && profile?.role === "TUTOR" && (
        <VerificationTab isVerified={tutorProfile?.is_verified ?? false} />
      )}

      {/* Tab: Student Profile */}
      {activeTab === "student" && profile?.role === "STUDENT" && (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5 text-cyan-400" />
                Student Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade / Level</Label>
                  <Input
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. Class 10, SSC"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school">School / Institution</Label>
                  <Input
                    id="school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Dhaka Residential Model College"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="studentLocation">Location</Label>
                  <Input
                    id="studentLocation"
                    value={studentLocation}
                    onChange={(e) => setStudentLocation(e.target.value)}
                    placeholder="e.g. Mirpur, Dhaka"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goals">Learning Goals</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="What do you want to achieve? e.g. Score A+ in SSC Mathematics..."
                  rows={3}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Subjects I Need Help With</Label>
                <div className="flex flex-wrap gap-2 min-h-[36px] rounded-lg bg-white/5 p-2">
                  {studentSubjects.map((s) => (
                    <SubjectTag key={s} subject={s} onRemove={() => setStudentSubjects(studentSubjects.filter((x) => x !== s))} />
                  ))}
                  {studentSubjects.length === 0 && <span className="text-xs text-muted-foreground self-center">No subjects added yet</span>}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={studentSubjectInput}
                    onChange={(e) => setStudentSubjectInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(studentSubjectInput, studentSubjects, setStudentSubjects, setStudentSubjectInput); }}}
                    placeholder="Type a subject and press Enter"
                    className="bg-white/5 border-white/10"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => addSubject(studentSubjectInput, studentSubjects, setStudentSubjects, setStudentSubjectInput)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="gradient" onClick={saveStudentProfile} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Student Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
