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
  UserCheck,
  Unlock,
  MessageSquare,
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
  { key: "reviewed", label: "Reviewed", icon: Clock, desc: "Student reviewing applications" },
  { key: "accepted", label: "Accepted", icon: UserCheck, desc: "Student chose you" },
  { key: "tutor_paid", label: "You Paid", icon: CreditCard, desc: "Your ৳500 fee confirmed" },
  { key: "connected", label: "Connected", icon: Unlock, desc: "Contact info unlocked" },
];

function getTimelineStep(status: string) {
  switch (status) {
    case "PENDING": return 1;
    case "ACCEPTED": return 2;
    case "STUDENT_PAID": return 3;
    case "BOTH_PAID": return 4;
    case "REJECTED": return -1;
    default: return 0;
  }
}

function ApplicationTimeline({ status }: { status: string }) {
  if (status === "REJECTED") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
        <XCircle className="h-4 w-4 shrink-0" />
        This application was not selected by the student.
      </div>
    );
  }

  const step = getTimelineStep(status);
  return (
    <div className="relative">
      <div className="flex items-start gap-0">
        {STATUS_STEPS.map((s, i) => {
          const isDone = i < step;
          const isCurrent = i === step - 1 || (step === 0 && i === 0);
          const isUpcoming = i >= step;

          return (
            <div key={s.key} className="flex-1 flex flex-col items-center relative">
              {i < STATUS_STEPS.length - 1 && (
                <div
                  className={`absolute top-3.5 left-1/2 right-0 h-0.5 w-full -translate-y-1/2 transition-colors ${
                    isDone ? "bg-cyan-500" : "bg-white/10"
                  }`}
                />
              )}
              <div
                className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                  isDone
                    ? "border-cyan-500 bg-cyan-500 text-background"
                    : isCurrent
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-400"
                    : "border-white/20 bg-background text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <s.icon className="h-3 w-3" />
                )}
              </div>
              <div className="mt-2 text-center px-1">
                <p className={`text-[10px] font-medium leading-tight ${isDone ? "text-cyan-400" : isUpcoming ? "text-muted-foreground/60" : "text-foreground"}`}>
                  {s.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TutorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentApplicationId, setPaymentApplicationId] = useState<string | null>(null);
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
      if (error instanceof Error && error.message.includes("401")) {
        toast({
          title: "Authentication required",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
      }
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const initiateTutorConfirm = async (applicationId: string) => {
    setConfirmingApp(applicationId);
    try {
      const result = await apiPost<{
        requiresPayment?: boolean;
        amount?: number;
        applicationId?: string;
        alreadyPaid?: boolean;
        message?: string;
      }>(`/applications/${applicationId}/tutor-confirm`, {});

      if (result.alreadyPaid) {
        toast({ title: "Contact information unlocked!", variant: "success" });
        await fetchApplications();
      } else if (result.requiresPayment) {
        setPaymentApplicationId(applicationId);
        setShowPayment(true);
      }
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Could not proceed",
        variant: "destructive",
      });
    } finally {
      setConfirmingApp(null);
    }
  };

  const handleInitiatePayment = async (phoneNumber: string, method: "BKASH" | "NAGAD") => {
    if (!paymentApplicationId) throw new Error("No application selected");
    const result = await apiPost<{ id: string }>(
      `/payments/tutor/${paymentApplicationId}`,
      { phoneNumber, method }
    );
    setCurrentPaymentId(result.id);
    return result;
  };

  const handleVerifyPayment = async (otp: string) => {
    if (!currentPaymentId) throw new Error("No payment in progress");
    return apiPost<{ success: boolean; contactUnlocked?: boolean }>(
      `/payments/${currentPaymentId}/verify`,
      { otp }
    );
  };

  const handleResendOtp = async () => {
    if (!currentPaymentId) throw new Error("No payment in progress");
    return apiPost<{ demoOtp?: string }>(`/payments/${currentPaymentId}/resend-otp`, {});
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setCurrentPaymentId(null);
    setPaymentApplicationId(null);
    toast({ title: "Payment successful! Contact information unlocked.", variant: "success" });
    await fetchApplications();
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setCurrentPaymentId(null);
    setPaymentApplicationId(null);
  };

  const statusLabel: Record<string, string> = {
    PENDING: "Pending Review",
    ACCEPTED: "Accepted",
    STUDENT_PAID: "Student Paid",
    BOTH_PAID: "Connected",
    REJECTED: "Not Selected",
  };

  const statusStyle: Record<string, string> = {
    PENDING: "bg-amber-500/20 text-amber-400",
    STUDENT_PAID: "bg-blue-500/20 text-blue-400",
    BOTH_PAID: "bg-emerald-500/20 text-emerald-400",
    ACCEPTED: "bg-cyan-500/20 text-cyan-400",
    REJECTED: "bg-white/10 text-muted-foreground",
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
          amount={500}
          onInitiate={handleInitiatePayment}
          onVerify={handleVerifyPayment}
          onResendOtp={handleResendOtp}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="mt-1 text-muted-foreground">
          Track your application status and connect with accepted students.
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
          ))}
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
          {applications.map((app, i) => (
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
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusStyle[app.status] ?? "bg-muted"}`}>
                      {statusLabel[app.status] ?? app.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Timeline */}
                  <div className="glass rounded-xl p-4">
                    <ApplicationTimeline status={app.status} />
                  </div>

                  {/* Cover letter */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 border-l-2 border-white/10 pl-3">
                    {app.coverLetter}
                  </p>

                  {/* Action areas by status */}
                  {app.status === "STUDENT_PAID" && (
                    <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-blue-400 mb-0.5">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Student has paid their fee</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Pay ৳500 to unlock student&apos;s contact details
                        </p>
                      </div>
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => initiateTutorConfirm(app.id)}
                        disabled={confirmingApp === app.id}
                        className="shrink-0"
                      >
                        {confirmingApp === app.id ? "Processing..." : <><CreditCard className="h-3.5 w-3.5 mr-1" />Pay ৳500</>}
                      </Button>
                    </div>
                  )}

                  {(app.status === "BOTH_PAID" || app.status === "CONNECTED" || (app.status === "ACCEPTED" && app.request.contact_unlocked)) && (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
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
                      {(app.status === "BOTH_PAID" || app.status === "CONNECTED") && (
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
                      )}
                    </div>
                  )}

                  {app.status === "ACCEPTED" && !app.request.contact_unlocked && (
                    <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-yellow-400">Pay to unlock contact</p>
                        <p className="text-xs text-muted-foreground mt-0.5">৳500 one-time fee to see student&apos;s contact info</p>
                      </div>
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => initiateTutorConfirm(app.id)}
                        disabled={confirmingApp === app.id}
                        className="shrink-0"
                      >
                        {confirmingApp === app.id ? "Processing..." : <><CreditCard className="h-3.5 w-3.5 mr-1" />Pay ৳500</>}
                      </Button>
                    </div>
                  )}

                  {app.status === "PENDING" && (
                    <p className="text-xs text-muted-foreground italic">
                      Waiting for the student to review your application.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
