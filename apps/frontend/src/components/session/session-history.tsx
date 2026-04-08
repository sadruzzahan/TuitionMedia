"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { History, Calendar, Clock, Star } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import type { Session, SessionStatus } from "./session-types";

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

export function SessionHistory({ currentUserId }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Session[]>("/sessions/history")
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
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
              const other = isTutor ? (session.student.name ?? session.student.email) : (session.tutor.name ?? session.tutor.email);
              const scheduled = new Date(session.scheduledAt);
              const cfg = STATUS_CONFIG[session.status];

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
                          <p className="text-xs text-muted-foreground mt-0.5">{session.application.request.title}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {scheduled.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {scheduled.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · {session.durationMinutes} min
                            </span>
                            <span>with {other}</span>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground mt-2 border-l-2 border-white/10 pl-3 italic">{session.notes}</p>
                      )}
                      {session.status === "COMPLETED" && session.studentId === currentUserId && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <Link href={`/tutors/${session.tutor.id}`}>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-amber-500/20 text-amber-400 hover:bg-amber-500/10">
                              <Star className="h-3.5 w-3.5" />
                              Leave a Review
                            </Button>
                          </Link>
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
  );
}
