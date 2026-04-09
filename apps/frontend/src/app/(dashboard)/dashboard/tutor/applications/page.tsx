"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  CreditCard,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Send,
  Sparkles,
  Unlock,
  MessageSquare,
  BadgeCheck,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { PaymentMethodSelector } from "@/components/payment/payment-method-selector";
import { ChatDrawer } from "@/components/chat/chat-drawer";
import { UpcomingSessionsWidget } from "@/components/session/upcoming-sessions-widget";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

type Application = {
  id: string;
  coverLetter: string;
  status: string;
  proposed_rate?: number | null;
  finder_fee?: number | null;
  trial_started_at?: string | null;
  trial_approved_at?: string | null;
  request: {
    id: string;
    title: string;
    subjects: string[];
    status: string;
    division: string | null;
    area: string | null;
    contact_unlocked: boolean;
    student: { email: string; name: string | null; phone: string | null };
  };
};

const STATUS_STEPS = [
  { key: "applied", label: "Applied", icon: Send, desc: "Your application was sent" },
  { key: "trial", label: "Trial", icon: Sparkles, desc: "Trial classes underway" },
  { key: "approved", label: "Approved", icon: CheckCircle, desc: "Guardian approved!" },
  { key: "paid", label: "Fee Paid", icon: CreditCard, desc: "Finder's fee confirmed" },
  { key: "connected", label: "Connected", icon: Unlock, desc: "Contact info unlocked" },
];

function getTimelineStep(status: string) {
  switch (status) {
    case "PENDING": return 1;
    case "ACCEPTED": return 2;
    case "TRIAL_APPROVED": return 3;
    case "BOTH_PAID":
    case "CONNECTED": return 5;
    case "REJECTED":
    case "WITHDRAWN":
    case "CANCELLED": return -1;
    default: return 0;
  }
}

function ApplicationTimeline({ status }: { status: string }) {
  if (["REJECTED", "WITHDRAWN", "CANCELLED"].includes(status)) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
        <XCircle className="h-4 w-4 shrink-0" />
        This application was not selected by the student.
      </div>
    );
  }

  const step = getTimelineStep(status);
  return (
    <div className="flex items-start gap-0">
      {STATUS_STEPS.map((s, i) => {
        const isDone = i < step;
        const isCurrent = i === step - 1 || (step === 0 && i === 0);
        const isUpcoming = i >= step;
        return (
          <div key={s.key} className="flex-1 flex flex-col items-center relative">
            {i < STATUS_STEPS.length - 1 && (
              <div className={`absolute top-3.5 left-1/2 right-0 h-0.5 w-full -translate-y-1/2 ${isDone ? "bg-cyan-500" : "bg-white/10"}`} />
            )}
            <div className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
              isDone ? "border-cyan-500 bg-cyan-500 text-background"
                : isCurrent ? "border-cyan-400 bg-cyan-500/20 text-cyan-400"
                : "border-white/20 bg-background text-muted-foreground"
            }`}>
              {isDone ? <CheckCircle className="h-3.5 w-3.5" /> : <s.icon className="h-3 w-3" />}
            </div>
            <div className="mt-2 text-center px-0.5">
              <p className={`text-[9px] font-medium leading-tight ${isDone ? "text-cyan-400" : isUpcoming ? "text-muted-foreground/50" : "text-foreground"}`}>
                {s.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TutorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentApplicationId, setPaymentApplicationId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(500);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [confirmingApp, setConfirmingApp] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatApplicationId, setChatApplicationId] = useState<string | null>(null);
  const [chatRecipientName, setChatRecipientName] = useState("");
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const fetchApplications = async () => {
    try {
      const data = await apiGet<Application[]>("/applications/my");
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const initiateTutorPayment = async (applicationId: string) => {
    setConfirmingApp(applicationId);
    try {
      const result = await apiPost<{
        requiresPayment?: boolean;
        amount?: number;
        alreadyPaid?: boolean;
      }>(`/applications/${applicationId}/tutor-confirm`, {});

      if (result.alreadyPaid) {
        toast({ title: "Already connected!", variant: "success" });
        await fetchApplications();
      } else if (result.requiresPayment) {
        setPaymentApplicationId(applicationId);
        setPaymentAmount(result.amount ?? 500);
        setShowPayment(true);
      }
    } catch (err) {
      toast({
        title: "Cannot pay yet",
        description: err instanceof Error ? err.message : "Could not proceed",
        variant: "destructive",
      });
    } finally {
      setConfirmingApp(null);
    }
  };

  const handleInitiatePayment = async (phoneNumber: string, method: "BKASH" | "NAGAD") => {
    if (!paymentApplicationId) throw new Error("No application selected");
    const result = await apiPost<{ id: string; demoOtp?: string }>(
      `/payments/tutor/${paymentApplicationId}`,
      { phoneNumber, method }
    );
    setCurrentPaymentId(result.id);
    return result;
  };

  const handleVerifyPayment = async (otp: string) => {
    if (!currentPaymentId) throw new Error("No payment in progress");
    return apiPost<{ success: boolean }>(`/payments/${currentPaymentId}/verify`, { otp });
  };

  const handleResendOtp = async () => {
    if (!currentPaymentId) throw new Error("No payment in progress");
    return apiPost<{ demoOtp?: string }>(`/payments/${currentPaymentId}/resend-otp`, {});
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setCurrentPaymentId(null);
    setPaymentApplicationId(null);
    toast({ title: "Finder's fee paid! Student's contact info is now unlocked.", variant: "success" });
    await fetchApplications();
  };

  const statusLabel: Record<string, string> = {
    PENDING: "Pending",
    ACCEPTED: "Trial Active",
    TRIAL_APPROVED: "Fee Due",
    BOTH_PAID: "Connected",
    CONNECTED: "Connected",
    REJECTED: "Not Selected",
    WITHDRAWN: "Withdrawn",
    CANCELLED: "Cancelled",
    STUDENT_PAID: "Legacy",
  };

  const statusStyle: Record<string, string> = {
    PENDING: "bg-amber-500/20 text-amber-400",
    ACCEPTED: "bg-cyan-500/20 text-cyan-400",
    TRIAL_APPROVED: "bg-orange-500/20 text-orange-400",
    BOTH_PAID: "bg-emerald-500/20 text-emerald-400",
    CONNECTED: "bg-emerald-500/20 text-emerald-400",
    REJECTED: "bg-white/10 text-muted-foreground",
    WITHDRAWN: "bg-white/10 text-muted-foreground",
    CANCELLED: "bg-white/10 text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      {chatOpen && chatApplicationId && (
        <ChatDrawer
          applicationId={chatApplicationId}
          recipientName={chatRecipientName}
          onClose={() => setChatOpen(false)}
        />
      )}
      {showPayment && (
        <PaymentMethodSelector
          amount={paymentAmount}
          label="Finder's Fee"
          sublabel="50% of one month's rate — one-time"
          onInitiate={handleInitiatePayment}
          onVerify={handleVerifyPayment}
          onResendOtp={handleResendOtp}
          onSuccess={handlePaymentSuccess}
          onCancel={() => { setShowPayment(false); setCurrentPaymentId(null); setPaymentApplicationId(null); }}
          userType="tutor"
        />
      )}

      {user && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <UpcomingSessionsWidget
            currentUserId={user.id}
            role="TUTOR"
            onViewAll={() => router.push("/dashboard/tutor/sessions")}
          />
        </motion.div>
      )}

      <div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="mt-1 text-muted-foreground">
            Track your applications. No payment until the student/guardian approves the trial.
          </p>
        </motion.div>

        {/* Explainer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-xl bg-cyan-500/5 border border-cyan-500/15 p-4"
        >
          <div className="flex items-start gap-2 text-xs text-cyan-300">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">New: Trial-first model.</span>{" "}
              Students accept you for a free trial period. Once the guardian approves your classes, you pay a finder&apos;s fee (50% of one month&apos;s rate) to unlock their contact info. No payment upfront.
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-16 text-center"
          >
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-xl font-semibold">No applications yet</h3>
            <p className="mt-2 text-muted-foreground">Apply to tuition requests from the Job Board.</p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {applications.map((app, i) => {
              const finderFee = app.finder_fee
                ? Math.round(Number(app.finder_fee))
                : app.proposed_rate
                ? Math.max(Math.round(Number(app.proposed_rate) * 0.5), 300)
                : null;

              const isConnected = ["BOTH_PAID", "CONNECTED"].includes(app.status);
              const isTrialActive = app.status === "ACCEPTED";
              const isTrialApproved = app.status === "TRIAL_APPROVED";
              const chatAllowed = ["ACCEPTED", "TRIAL_APPROVED", "BOTH_PAID", "CONNECTED"].includes(app.status);

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="glass-card overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">{app.request.title}</CardTitle>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {(app.request.subjects ?? []).map((s) => (
                              <span key={s} className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-400">{s}</span>
                            ))}
                          </div>
                          {app.request.division && (
                            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {app.request.division}{app.request.area ? `, ${app.request.area}` : ""}
                            </p>
                          )}
                          {app.proposed_rate && (
                            <p className="text-xs text-emerald-400 mt-1">৳{Number(app.proposed_rate).toLocaleString()}/month proposed</p>
                          )}
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusStyle[app.status] ?? "bg-muted"}`}>
                          {statusLabel[app.status] ?? app.status}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="glass rounded-xl p-4">
                        <ApplicationTimeline status={app.status} />
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 border-l-2 border-white/10 pl-3">
                        {app.coverLetter}
                      </p>

                      {/* Trial active */}
                      {isTrialActive && (
                        <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4 space-y-2">
                          <div className="flex items-center gap-2 text-cyan-400">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium">Trial Period Active</span>
                          </div>
                          <p className="text-xs text-cyan-300/70">
                            Conduct your trial classes. Once the student/guardian is satisfied they&apos;ll approve and you&apos;ll be asked to pay
                            {finderFee ? ` ৳${finderFee.toLocaleString()} finder's fee` : " a finder's fee"}.
                          </p>
                          {chatAllowed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 border-cyan-500/30 text-cyan-400 mt-1"
                              onClick={() => {
                                setChatApplicationId(app.id);
                                setChatRecipientName(app.request.student.name ?? app.request.student.email);
                                setChatOpen(true);
                              }}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              Message Student
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Trial approved — pay now */}
                      {isTrialApproved && (
                        <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4 space-y-3">
                          <div className="flex items-center gap-2 text-orange-400">
                            <BadgeCheck className="h-4 w-4" />
                            <span className="text-sm font-medium">Guardian Approved — Pay Now</span>
                          </div>
                          {finderFee && (
                            <p className="text-xs text-orange-300/70">
                              Pay ৳{finderFee.toLocaleString()} finder&apos;s fee (50% of ৳{Number(app.proposed_rate).toLocaleString()}/mo) to unlock the student&apos;s contact info.
                            </p>
                          )}
                          <Button
                            variant="gradient"
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => initiateTutorPayment(app.id)}
                            disabled={confirmingApp === app.id}
                          >
                            {confirmingApp === app.id ? "Processing..." : (
                              <><CreditCard className="h-3.5 w-3.5" />Pay ৳{finderFee?.toLocaleString() ?? "Fee"}</>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Connected */}
                      {isConnected && (
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-3">
                          <div className="flex items-center gap-2 text-emerald-400">
                            <Unlock className="h-4 w-4" />
                            <span className="text-sm font-medium">Contact Information Unlocked</span>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-3 py-2">
                              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="truncate">{app.request.student.email}</span>
                            </div>
                            {app.request.student.phone && (
                              <div className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-3 py-2">
                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{app.request.student.phone}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="gradient"
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => {
                              setChatApplicationId(app.id);
                              setChatRecipientName(app.request.student.name ?? app.request.student.email);
                              setChatOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                            Message Student
                          </Button>
                        </div>
                      )}

                      {app.status === "PENDING" && (
                        <p className="text-xs text-muted-foreground italic">
                          Waiting for the student to review your application. No fee required until they approve your trial.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
