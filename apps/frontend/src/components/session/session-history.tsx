"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { History, Calendar, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import type { Session, SessionStatus } from "./session-types";
import { ReviewModal } from "@/components/review/review-modal";

const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-amber-500/20 text-amber-400" },
  CONFIRMED: { label: "Confirmed", color: "bg-cyan-500/20 text-cyan-400" },
  COMPLETED: { label: "Completed", color: "bg-emerald-500/20 text-emerald-400" },
  CANCELLED: { label: "Cancelled", color: "bg-white/10 text-muted-foreground" },
};

type Props = {
  currentUserId: string;
  userRole?: "STUDENT" | "TUTOR";
};

type ReviewTarget = {
  sessionId: string;
  revieweeName: string;
  role: "STUDENT" | "TUTOR";
};

type CanReviewResult = {
  canReview: boolean;
  alreadyReviewed?: boolean;
};

export function SessionHistory({ currentUserId, userRole }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [reviewEligibility, setReviewEligibility] = useState<Record<string, CanReviewResult>>({});
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  async function loadSessionsAndEligibility() {
    try {
      const data = await apiGet<Session[]>("/sessions/history");
      setSessions(data);

      const completedSessions = data.filter((s) => s.status === "COMPLETED");
      if (completedSessions.length > 0) {
        setEligibilityLoading(true);
        const results = await Promise.allSettled(
          completedSessions.map(async (s) => {
            try {
              const result = await apiGet<CanReviewResult>(`/reviews/can-review/${s.id}`);
              return { sessionId: s.id, result };
            } catch {
              return { sessionId: s.id, result: { canReview: false } };
            }
          })
        );
        const eligibilityMap: Record<string, CanReviewResult> = {};
        for (const r of results) {
          if (r.status === "fulfilled") {
            eligibilityMap[r.value.sessionId] = r.value.result;
          }
        }
        setReviewEligibility(eligibilityMap);
        setEligibilityLoading(false);
      }
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessionsAndEligibility();
  }, []);

  function handleReviewSubmitted() {
    if (reviewTarget) {
      setReviewEligibility((prev) => ({
        ...prev,
        [reviewTarget.sessionId]: { canReview: false, alreadyReviewed: true },
      }));
    }
    setReviewTarget(null);
  }

  return (
    <>
      {reviewTarget && (
        <ReviewModal
          sessionId={reviewTarget.sessionId}
          revieweeName={reviewTarget.revieweeName}
          role={reviewTarget.role}
          onClose={() => setReviewTarget(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Session History
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="pt-8 pb-8 text-center">
              <History className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No past sessions yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {sessions.map((session, i) => {
                const isTutor = session.tutorId === currentUserId;
                const other = isTutor
                  ? (session.student.name ?? session.student.email)
                  : (session.tutor.name ?? session.tutor.email);
                const scheduled = new Date(session.scheduledAt);
                const cfg = STATUS_CONFIG[session.status];
                const isCompleted = session.status === "COMPLETED";
                const effectiveRole = userRole ?? (isTutor ? "TUTOR" : "STUDENT");
                const eligibility = reviewEligibility[session.id];
                const canReview = isCompleted && !eligibilityLoading && eligibility?.canReview === true;
                const alreadyReviewed = isCompleted && eligibility?.alreadyReviewed === true;

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="glass-card">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm">{session.subject}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {session.application.request.title}
                            </p>
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {scheduled.toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {scheduled.toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                · {session.durationMinutes} min
                              </span>
                              <span>with {other}</span>
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        {session.notes && (
                          <p className="text-xs text-muted-foreground mt-2 border-l-2 border-white/10 pl-3 italic">
                            {session.notes}
                          </p>
                        )}
                        {isCompleted && (
                          <div className="mt-3 pt-3 border-t border-white/5">
                            {canReview ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                                onClick={() =>
                                  setReviewTarget({
                                    sessionId: session.id,
                                    revieweeName: isTutor
                                      ? (session.student.name ?? "Student")
                                      : (session.tutor.name ?? "Tutor"),
                                    role: effectiveRole,
                                  })
                                }
                              >
                                <Star className="h-3.5 w-3.5" />
                                {isTutor ? "Rate this Student" : "Leave a Review"}
                              </Button>
                            ) : alreadyReviewed ? (
                              <p className="text-xs text-emerald-400 flex items-center gap-1">
                                <Star className="h-3 w-3 fill-emerald-400" />
                                Review submitted
                              </p>
                            ) : eligibilityLoading ? (
                              <p className="text-xs text-muted-foreground">Checking review status...</p>
                            ) : null}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}
