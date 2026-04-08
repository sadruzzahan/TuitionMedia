"use client";

import { motion } from "motion/react";
import { Calendar, Clock, CheckCircle2, XCircle, PlayCircle, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Session, SessionStatus } from "./session-types";
import { apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const HOUR_LABELS: Record<number, string> = {};
for (let h = 0; h < 24; h++) {
  HOUR_LABELS[h] = h === 0 ? "12:00 AM" : h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`;
}

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
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleHour, setRescheduleHour] = useState(9);

  const isTutor = session.tutorId === currentUserId;
  const isStudent = session.studentId === currentUserId;
  const statusCfg = STATUS_CONFIG[session.status];
  const StatusIcon = statusCfg.icon;

  const scheduled = new Date(session.scheduledAt);
  const isPast = scheduled < new Date();
  const msUntil = scheduled.getTime() - Date.now();
  const isWithin24h = msUntil > 0 && msUntil < 24 * 60 * 60 * 1000;

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

  async function doReschedule() {
    if (!rescheduleDate) {
      toast({ title: "Please select a date", variant: "destructive" });
      return;
    }
    setLoading("reschedule");
    try {
      const scheduledAt = new Date(`${rescheduleDate}T${String(rescheduleHour).padStart(2, "0")}:00:00`).toISOString();
      const updated = await apiPost<Session>(`/sessions/${session.id}/reschedule`, { scheduledAt });
      onUpdate(updated);
      setShowReschedule(false);
      toast({ title: "Reschedule suggested", description: "The other party has been notified.", variant: "success" });
    } catch (err) {
      toast({
        title: "Reschedule failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0] as string;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`glass-card overflow-hidden ${isWithin24h && session.status !== "CANCELLED" ? "ring-1 ring-amber-500/40" : ""}`}>
        <CardContent className="pt-4 pb-4 space-y-3">
          {isWithin24h && session.status === "CONFIRMED" && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-400 font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Session in less than 24 hours
            </div>
          )}
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

          {/* Reschedule suggestion form */}
          {showReschedule && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Suggest a new time</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">Date</label>
                  <input
                    type="date"
                    min={minDateStr}
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full rounded-lg bg-white/10 border border-white/10 px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">Time</label>
                  <select
                    value={rescheduleHour}
                    onChange={(e) => setRescheduleHour(Number(e.target.value))}
                    className="w-full rounded-lg bg-white/10 border border-white/10 px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    {Array.from({ length: 14 }, (_, i) => i + 7).map((h) => (
                      <option key={h} value={h} className="bg-background">{HOUR_LABELS[h]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowReschedule(false)} className="text-xs">
                  Cancel
                </Button>
                <Button variant="gradient" size="sm" onClick={doReschedule} disabled={loading === "reschedule"} className="text-xs">
                  {loading === "reschedule" ? "Sending..." : "Send Suggestion"}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end flex-wrap">
            {session.status === "PENDING" && isTutor && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReschedule((v) => !v)}
                  disabled={!!loading}
                  className="border-white/10 text-muted-foreground hover:bg-white/10"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Suggest Time
                </Button>
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
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReschedule((v) => !v)}
                  disabled={!!loading}
                  className="border-white/10 text-muted-foreground hover:bg-white/10"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Suggest Time
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => doAction("cancel")}
                  disabled={!!loading}
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  {loading === "cancel" ? "..." : <><XCircle className="h-3.5 w-3.5 mr-1" />Cancel</>}
                </Button>
              </>
            )}
            {session.status === "CONFIRMED" && (
              <>
                {(isTutor || isStudent) && !isPast && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReschedule((v) => !v)}
                    disabled={!!loading}
                    className="border-white/10 text-muted-foreground hover:bg-white/10"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Reschedule
                  </Button>
                )}
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
