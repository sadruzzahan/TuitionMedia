"use client";

import { motion } from "motion/react";
import { Calendar, Clock, CheckCircle2, XCircle, PlayCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Session, SessionStatus } from "./session-types";
import { apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "Pending", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: HelpCircle },
  CONFIRMED: { label: "Confirmed", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", icon: CheckCircle2 },
  COMPLETED: { label: "Completed", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-white/10 text-muted-foreground border-white/10", icon: XCircle },
};

type Props = {
  session: Session;
  currentUserId: string;
  onUpdate: (updated: Session) => void;
};

export function SessionCard({ session, currentUserId, onUpdate }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const isTutor = session.tutorId === currentUserId;
  const isStudent = session.studentId === currentUserId;
  const statusCfg = STATUS_CONFIG[session.status];
  const StatusIcon = statusCfg.icon;

  const scheduled = new Date(session.scheduledAt);
  const isPast = scheduled < new Date();

  async function doAction(action: "confirm" | "cancel" | "complete") {
    setLoading(action);
    try {
      const updated = await apiPost<Session>(`/sessions/${session.id}/${action}`, {});
      onUpdate(updated);
      toast({
        title: action === "confirm" ? "Session confirmed!" : action === "cancel" ? "Session cancelled" : "Session completed!",
        variant: action === "cancel" ? "default" : "success",
      });
    } catch (err) {
      toast({
        title: "Action failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-card overflow-hidden">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-sm">{session.subject}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {session.application.request.title}
              </p>
            </div>
            <span className={`shrink-0 flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusCfg.color}`}>
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {scheduled.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {scheduled.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · {session.durationMinutes} min
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground rounded-lg bg-white/5 px-3 py-2">
            {isTutor ? (
              <span>Student: <span className="text-foreground">{session.student.name ?? session.student.email}</span></span>
            ) : (
              <span>Tutor: <span className="text-foreground">{session.tutor.name ?? session.tutor.email}</span></span>
            )}
          </div>

          {session.notes && (
            <p className="text-xs text-muted-foreground border-l-2 border-white/10 pl-3 italic">
              {session.notes}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end flex-wrap">
            {session.status === "PENDING" && isTutor && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => doAction("cancel")}
                  disabled={!!loading}
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  {loading === "cancel" ? "..." : <><XCircle className="h-3.5 w-3.5 mr-1" />Decline</>}
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => doAction("confirm")}
                  disabled={!!loading}
                >
                  {loading === "confirm" ? "..." : <><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Confirm</>}
                </Button>
              </>
            )}
            {session.status === "PENDING" && isStudent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => doAction("cancel")}
                disabled={!!loading}
                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                {loading === "cancel" ? "..." : <><XCircle className="h-3.5 w-3.5 mr-1" />Cancel</>}
              </Button>
            )}
            {session.status === "CONFIRMED" && (
              <>
                {(isTutor || isStudent) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => doAction("cancel")}
                    disabled={!!loading}
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    {loading === "cancel" ? "..." : <><XCircle className="h-3.5 w-3.5 mr-1" />Cancel</>}
                  </Button>
                )}
                {isPast && (
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => doAction("complete")}
                    disabled={!!loading}
                  >
                    {loading === "complete" ? "..." : <><PlayCircle className="h-3.5 w-3.5 mr-1" />Mark Complete</>}
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
