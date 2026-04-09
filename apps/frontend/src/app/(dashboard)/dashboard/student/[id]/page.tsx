"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Users,
  Clock,
  ArrowLeft,
  MessageSquare,
  CalendarPlus,
  ThumbsUp,
  Sparkles,
  Info,
  CreditCard,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { ChatDrawer } from "@/components/chat/chat-drawer";
import { BookSessionDialog } from "@/components/session/book-session-dialog";

type Application = {
  id: string;
  coverLetter: string;
  status: string;
  tutorId: string;
  proposed_rate?: number | null;
  finder_fee?: number | null;
  trial_started_at?: string | null;
  trial_approved_at?: string | null;
  tutor: { id: string; email: string; name: string | null; phone: string | null };
};

type TuitionRequest = {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  status: string;
  budget: string | null;
  division: string | null;
  area: string | null;
  contact_unlocked: boolean;
  createdAt: string;
  applications: Application[];
  student: { email: string; name: string | null; phone: string | null };
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  IN_PROGRESS: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  ASSIGNED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  CLOSED: "bg-white/10 text-muted-foreground border-white/10",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

function TutorInitials({ name, email }: { name: string | null; email: string }) {
  const str = name ?? email;
  const parts = str.split(/[\s@.]+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => (p[0] ?? "").toUpperCase()).join("");
}

function TrialStatusBanner({ app }: { app: Application }) {
  if (app.status === "BOTH_PAID" || app.status === "CONNECTED") {
    return (
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <BadgeCheck className="h-4 w-4" />
          <span className="text-sm font-semibold">Fully Connected</span>
        </div>
        <p className="text-xs text-emerald-300/70">The tutor has paid their finder&apos;s fee. Contact info is unlocked.</p>
      </div>
    );
  }

  if (app.status === "TRIAL_APPROVED") {
    const fee = app.finder_fee ? Math.round(Number(app.finder_fee)) : null;
    return (
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-2">
        <div className="flex items-center gap-2 text-amber-400">
          <CreditCard className="h-4 w-4" />
          <span className="text-sm font-semibold">Awaiting Tutor Payment</span>
        </div>
        <p className="text-xs text-amber-300/70">
          You approved the trial. The tutor has been notified to pay
          {fee ? ` ৳${fee.toLocaleString()}` : " their"} finder&apos;s fee to unlock contact info.
        </p>
      </div>
    );
  }

  if (app.status === "ACCEPTED") {
    return (
      <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 p-4 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-semibold">Trial Period Active</span>
        </div>
        <p className="text-xs text-cyan-300/70">
          Chat with your tutor to arrange trial classes. Once satisfied, click &quot;Guardian Approved&quot; to proceed.
        </p>
        <div className="flex items-start gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs text-muted-foreground">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          <span>No payment needed during trial. The tutor pays a finder&apos;s fee only after you approve.</span>
        </div>
      </div>
    );
  }

  return null;
}

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  const [request, setRequest] = useState<TuitionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatApplicationId, setChatApplicationId] = useState<string | null>(null);
  const [chatRecipientName, setChatRecipientName] = useState("");
  const [bookSessionOpen, setBookSessionOpen] = useState(false);
  const [bookSessionApplicationId, setBookSessionApplicationId] = useState<string | null>(null);

  function refresh() {
    return apiGet<TuitionRequest>(`/tuition-requests/${requestId}`).then(setRequest);
  }

  useEffect(() => {
    apiGet<TuitionRequest>(`/tuition-requests/${requestId}`)
      .then(setRequest)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [requestId]);

  async function acceptApp(applicationId: string) {
    setAccepting(applicationId);
    try {
      await apiPost(`/applications/${applicationId}/accept`, {});
      toast({ title: "Trial period started!", description: "Chat with your tutor to arrange trial classes.", variant: "success" });
      await refresh();
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Could not accept",
        variant: "destructive",
      });
    } finally {
      setAccepting(null);
    }
  }

  async function approveTrial(applicationId: string) {
    setApproving(applicationId);
    try {
      const res = await apiPost<{ finderFee: number }>(`/applications/${applicationId}/approve-trial`, {});
      toast({
        title: "Guardian approved!",
        description: `The tutor has been notified to pay the ৳${res.finderFee?.toLocaleString() ?? ""} finder's fee.`,
        variant: "success",
      });
      await refresh();
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Could not approve",
        variant: "destructive",
      });
    } finally {
      setApproving(null);
    }
  }

  async function rejectApp(applicationId: string) {
    setRejecting(applicationId);
    try {
      await apiPost(`/applications/${applicationId}/reject`, {});
      toast({ title: "Application rejected" });
      if (selected === applicationId) setSelected(null);
      await refresh();
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Could not reject",
        variant: "destructive",
      });
    } finally {
      setRejecting(null);
    }
  }

  async function closeRequest() {
    setClosing(true);
    try {
      await apiDelete(`/tuition-requests/${requestId}/close`);
      toast({ title: "Request closed" });
      await refresh();
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Could not close request",
        variant: "destructive",
      });
    } finally {
      setClosing(false);
    }
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

  if (notFound || !request) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center"
      >
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Request not found</h2>
        <p className="text-muted-foreground">This request may have been removed or doesn&apos;t exist.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/student")}>
          Back to My Requests
        </Button>
      </motion.div>
    );
  }

  const pendingApps = request.applications.filter((a) => a.status === "PENDING");
  const activeApp =
    request.applications.find((a) => ["BOTH_PAID", "CONNECTED"].includes(a.status)) ??
    request.applications.find((a) => ["TRIAL_APPROVED", "ACCEPTED"].includes(a.status));
  const isOpen = request.status === "OPEN" || request.status === "IN_PROGRESS";
  const selectedApp = request.applications.find((a) => a.id === selected) ?? pendingApps[0] ?? null;

  const chatAllowed = (status: string) => ["ACCEPTED", "TRIAL_APPROVED", "BOTH_PAID", "CONNECTED"].includes(status);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {chatOpen && chatApplicationId && (
        <ChatDrawer
          applicationId={chatApplicationId}
          recipientName={chatRecipientName}
          onClose={() => setChatOpen(false)}
        />
      )}
      {bookSessionOpen && bookSessionApplicationId && activeApp && (
        <BookSessionDialog
          applicationId={bookSessionApplicationId}
          tutorId={activeApp.tutor.id}
          subjects={request?.subjects ?? []}
          open={bookSessionOpen}
          onClose={() => setBookSessionOpen(false)}
          onBooked={() => setBookSessionOpen(false)}
        />
      )}

      <Button variant="ghost" className="mb-6 -ml-2 gap-1" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* LEFT COLUMN */}
        <div className="space-y-5 lg:col-span-2">
          {/* Request details */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg leading-tight">{request.title}</CardTitle>
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[request.status] ?? "bg-white/10 text-muted-foreground"}`}>
                  {request.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {request.subjects?.map((s) => (
                  <span key={s} className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs text-cyan-400">{s}</span>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground leading-relaxed">{request.description}</p>
              <div className="space-y-2 pt-1">
                {request.division && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {request.division}{request.area ? `, ${request.area}` : ""}
                  </div>
                )}
                {request.budget && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    Budget: ৳{request.budget}/hr
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  {request.applications.length} applicant{request.applications.length !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  Posted {new Date(request.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
              {request.status === "OPEN" && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeRequest}
                    disabled={closing}
                    className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    {closing ? "Closing..." : "Close Request"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active application / trial status */}
          {activeApp && (
            <Card className="glass-card border-cyan-500/20">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-sm font-bold text-cyan-400">
                    <TutorInitials name={activeApp.tutor.name} email={activeApp.tutor.email} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activeApp.tutor.name ?? activeApp.tutor.email}</p>
                    {activeApp.tutor.name && <p className="text-xs text-muted-foreground">{activeApp.tutor.email}</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <TrialStatusBanner app={activeApp} />

                {/* Contact info (unlocked after tutor pays) */}
                {request.contact_unlocked ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-emerald-400 flex items-center gap-1"><Unlock className="h-3 w-3" />Contact Unlocked</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm rounded-lg bg-white/5 px-3 py-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {activeApp.tutor.email}
                      </div>
                      {activeApp.tutor.phone && (
                        <div className="flex items-center gap-2 text-sm rounded-lg bg-white/5 px-3 py-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {activeApp.tutor.phone}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    Contact info visible after tutor pays finder&apos;s fee
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {/* Guardian Approve button — only during ACCEPTED (trial) */}
                  {activeApp.status === "ACCEPTED" && (
                    <Button
                      variant="gradient"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => approveTrial(activeApp.id)}
                      disabled={!!approving}
                    >
                      {approving === activeApp.id ? "Approving..." : (
                        <>
                          <ThumbsUp className="h-4 w-4" />
                          Guardian Approved ✓
                        </>
                      )}
                    </Button>
                  )}

                  {/* Chat — available from trial onwards */}
                  {chatAllowed(activeApp.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                      onClick={() => {
                        setChatApplicationId(activeApp.id);
                        setChatRecipientName(activeApp.tutor.name ?? activeApp.tutor.email);
                        setChatOpen(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message Tutor
                    </Button>
                  )}

                  {/* Book session — only when fully connected */}
                  {(activeApp.status === "BOTH_PAID" || activeApp.status === "CONNECTED") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 border-white/20"
                      onClick={() => {
                        setBookSessionApplicationId(activeApp.id);
                        setBookSessionOpen(true);
                      }}
                    >
                      <CalendarPlus className="h-4 w-4" />
                      Book a Session
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* How it works — shown when no active application */}
          {!activeApp && (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 space-y-3">
              <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">How It Works</p>
              {[
                { step: "1", text: "Accept a tutor → Trial starts for free" },
                { step: "2", text: "Try a few classes, gauge fit" },
                { step: "3", text: "Click \"Guardian Approved\" when satisfied" },
                { step: "4", text: "Tutor pays finder's fee → Contact unlocked" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-400">{item.step}</span>
                  {item.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Applicant list */}
        <div className="lg:col-span-3 space-y-4">
          {!activeApp && (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Pending Applications
                <span className="ml-2 text-sm font-normal text-muted-foreground">({pendingApps.length})</span>
              </h2>
            </div>
          )}

          {pendingApps.length === 0 && !activeApp && (
            <Card className="glass-card p-10 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground text-sm">
                {isOpen ? "No applications yet. Share your request to attract tutors." : "This request is closed."}
              </p>
            </Card>
          )}

          <AnimatePresence>
            {pendingApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.005 }}
                >
                  <Card
                    onClick={() => setSelected(app.id)}
                    className={`glass-card cursor-pointer transition-all ${isSelected ? "border-cyan-500/50 bg-cyan-500/5" : "hover:border-white/20"}`}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-sm font-bold text-cyan-400">
                          <TutorInitials name={app.tutor.name} email={app.tutor.email} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{app.tutor.name ?? app.tutor.email}</p>
                          {app.tutor.name && <p className="text-xs text-muted-foreground">{app.tutor.email}</p>}
                          {app.proposed_rate && (
                            <p className="text-xs text-emerald-400 mt-0.5">৳{Number(app.proposed_rate).toLocaleString()}/month proposed</p>
                          )}
                          <p className="text-sm text-muted-foreground leading-relaxed mt-2 line-clamp-3">
                            {app.coverLetter}
                          </p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="mt-4 space-y-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Finder fee preview */}
                            {app.proposed_rate && (
                              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs">
                                <p className="text-emerald-400 font-medium">Free to accept — no upfront cost</p>
                                <p className="text-emerald-300/70 mt-0.5">
                                  If you approve after trial, tutor pays ৳{Math.max(Math.round(Number(app.proposed_rate) * 0.5), 300).toLocaleString()} finder&apos;s fee.
                                </p>
                              </div>
                            )}
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => rejectApp(app.id)}
                                disabled={!!accepting || !!rejecting}
                                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                              >
                                {rejecting === app.id ? "Rejecting..." : (
                                  <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />Reject</span>
                                )}
                              </Button>
                              <Button
                                variant="gradient"
                                size="sm"
                                onClick={() => acceptApp(app.id)}
                                disabled={!!accepting || !!rejecting}
                              >
                                {accepting === app.id ? "Starting trial..." : (
                                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Accept (Free Trial)</span>
                                )}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
