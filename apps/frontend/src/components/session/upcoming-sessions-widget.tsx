"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import type { Session, SessionStatus } from "./session-types";
import { apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<SessionStatus, string> = {
  PENDING: "bg-amber-500/20 text-amber-400",
  CONFIRMED: "bg-cyan-500/20 text-cyan-400",
  COMPLETED: "bg-emerald-500/20 text-emerald-400",
  CANCELLED: "bg-white/10 text-muted-foreground",
};

type Props = {
  currentUserId: string;
  role: "STUDENT" | "TUTOR";
  onViewAll?: () => void;
};

export function UpcomingSessionsWidget({ currentUserId, role, onViewAll }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Session[]>("/sessions/upcoming")
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  async function doAction(sessionId: string, action: "confirm" | "cancel" | "complete") {
    setActionLoading(sessionId + action);
    try {
      const updated = await apiPost<Session>(`/sessions/${sessionId}/${action}`, {});
      setSessions((prev) =>
        prev
          .map((s) => (s.id === sessionId ? updated : s))
          .filter((s) => s.status !== "CANCELLED" && s.status !== "COMPLETED"),
      );
      toast({ title: action === "confirm" ? "Session confirmed!" : action === "cancel" ? "Session cancelled" : "Marked complete!", variant: action === "cancel" ? "default" : "success" });
    } catch (err) {
      toast({ title: "Action failed", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  const displaySessions = sessions.slice(0, 3);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-400" />
            Upcoming Sessions
          </CardTitle>
          {sessions.length > 3 && onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1 text-xs">
              View All <ChevronRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : displaySessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming sessions</p>
            {role === "STUDENT" && (
              <p className="text-xs text-muted-foreground/60 mt-1">Book a session with your connected tutor</p>
            )}
            {role === "TUTOR" && (
              <p className="text-xs text-muted-foreground/60 mt-1">Set your availability so students can book sessions</p>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {displaySessions.map((session, i) => {
              const scheduled = new Date(session.scheduledAt);
              const isPast = scheduled < new Date();
              const isTutor = session.tutorId === currentUserId;
              const other = isTutor ? (session.student.name ?? session.student.email) : (session.tutor.name ?? session.tutor.email);

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg bg-white/5 border border-white/10 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{session.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        with {other}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[session.status]}`}>
                      {session.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {scheduled.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}{" "}
                    at {scheduled.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · {session.durationMinutes} min
                  </p>

                  {session.status === "PENDING" && isTutor && (
                    <div className="flex gap-1.5 justify-end">
                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => doAction(session.id, "cancel")} disabled={!!actionLoading}>
                        Decline
                      </Button>
                      <Button variant="gradient" size="sm" className="h-6 px-2 text-xs" onClick={() => doAction(session.id, "confirm")} disabled={!!actionLoading}>
                        Confirm
                      </Button>
                    </div>
                  )}
                  {session.status === "CONFIRMED" && isPast && (
                    <Button variant="gradient" size="sm" className="h-6 px-2 text-xs w-full" onClick={() => doAction(session.id, "complete")} disabled={!!actionLoading}>
                      Mark Complete
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
