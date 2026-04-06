"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  CreditCard,
  Lock,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Users,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { PaymentMethodSelector } from "@/components/payment/payment-method-selector";

type Application = {
  id: string;
  coverLetter: string;
  status: string;
  tutor: { email: string; name: string | null; phone: string | null };
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
  ASSIGNED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  IN_PROGRESS: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  CLOSED: "bg-white/10 text-muted-foreground border-white/10",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

function TutorInitials({ name, email }: { name: string | null; email: string }) {
  const str = name ?? email;
  const parts = str.split(/[\s@.]+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  const [request, setRequest] = useState<TuitionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentApplicationId, setPaymentApplicationId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(500);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  function refresh() {
    return apiGet<TuitionRequest>(`/tuition-requests/${requestId}`).then(setRequest);
  }

  useEffect(() => {
    apiGet<TuitionRequest>(`/tuition-requests/${requestId}`)
      .then(setRequest)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [requestId]);

  async function initiateAccept(applicationId: string) {
    setAccepting(applicationId);
    try {
      const result = await apiPost<{
        requiresPayment: boolean;
        amount: number;
        applicationId: string;
      }>(`/applications/${applicationId}/accept`, {});

      if (result.requiresPayment) {
        setPaymentApplicationId(applicationId);
        setPaymentAmount(result.amount);
        setShowPayment(true);
      } else {
        toast({ title: "Application accepted!", variant: "success" });
        await refresh();
      }
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

  const handleInitiatePayment = async (phoneNumber: string, method: "BKASH" | "NAGAD") => {
    if (!paymentApplicationId) throw new Error("No application selected");
    const result = await apiPost<{ id: string }>(
      `/payments/student/${paymentApplicationId}`,
      { phoneNumber, method }
    );
    setCurrentPaymentId(result.id);
    return result;
  };

  const handleVerifyPayment = async (otp: string) => {
    if (!currentPaymentId) throw new Error("No payment in progress");
    const result = await apiPost<{ success: boolean; contactUnlocked?: boolean }>(
      `/payments/${currentPaymentId}/verify`,
      { otp }
    );
    if (result.success) {
      await apiPost(`/applications/${paymentApplicationId}/confirm-acceptance`, {});
    }
    return result;
  };

  const handleResendOtp = async () => {
    if (!currentPaymentId) throw new Error("No payment in progress");
    return apiPost<{ demoOtp?: string }>(`/payments/${currentPaymentId}/resend-otp`, {});
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setCurrentPaymentId(null);
    setPaymentApplicationId(null);
    toast({ title: "Payment successful! Application accepted.", variant: "success" });
    await refresh();
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setCurrentPaymentId(null);
    setPaymentApplicationId(null);
  };

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
    request.applications.find((a) => a.status === "BOTH_PAID") ??
    request.applications.find((a) => a.status === "STUDENT_PAID");
  const isOpen = request.status === "OPEN";
  const selectedApp = request.applications.find((a) => a.id === selected) ?? pendingApps[0] ?? null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {showPayment && (
        <PaymentMethodSelector
          amount={paymentAmount}
          onInitiate={handleInitiatePayment}
          onVerify={handleVerifyPayment}
          onResendOtp={handleResendOtp}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          userType="student"
        />
      )}

      <Button variant="ghost" className="mb-6 -ml-2 gap-1" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* LEFT COLUMN — Request details + connected tutor */}
        <div className="space-y-5 lg:col-span-2">
          {/* Request details card */}
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
              {isOpen && (
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

          {/* Connected tutor card */}
          {activeApp && (
            <Card className={`border-emerald-500/30 ${activeApp.status === "BOTH_PAID" ? "bg-emerald-500/10" : "bg-emerald-500/5"}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    {activeApp.status === "BOTH_PAID" ? "Connected!" : "Awaiting Tutor Payment"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-sm font-bold text-emerald-400">
                    <TutorInitials name={activeApp.tutor.name} email={activeApp.tutor.email} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activeApp.tutor.name ?? activeApp.tutor.email}</p>
                    {activeApp.tutor.name && <p className="text-xs text-muted-foreground">{activeApp.tutor.email}</p>}
                  </div>
                </div>

                {request.contact_unlocked ? (
                  <div className="space-y-2">
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
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-yellow-400">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    <p className="text-xs">Waiting for tutor to complete payment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN — Applicant list + detail */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isOpen ? "Pending Applications" : "Applications"}
              <span className="ml-2 text-sm font-normal text-muted-foreground">({pendingApps.length})</span>
            </h2>
          </div>

          {pendingApps.length === 0 && !activeApp && (
            <Card className="glass-card p-10 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground text-sm">
                {isOpen ? "No applications yet. Share your request to attract tutors." : "This request is closed."}
              </p>
            </Card>
          )}

          {pendingApps.map((app) => {
            const isSelected = selectedApp?.id === app.id;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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
                        <p className="text-sm text-muted-foreground leading-relaxed mt-2 line-clamp-3">
                          {app.coverLetter}
                        </p>
                      </div>
                    </div>

                    {isSelected && isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 flex gap-2 justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                          onClick={() => initiateAccept(app.id)}
                          disabled={!!accepting || !!rejecting}
                        >
                          {accepting === app.id ? "Processing..." : (
                            <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" />Accept (৳500)</span>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
