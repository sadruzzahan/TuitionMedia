"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { OpenSlot, Session } from "./session-types";
import { DAY_NAMES } from "./session-types";

function hourLabel(h: number) {
  if (h === 0) return "12:00 AM";
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}

type Props = {
  applicationId: string;
  tutorId: string;
  subjects: string[];
  open: boolean;
  onClose: () => void;
  onBooked: (session: Session) => void;
};

export function BookSessionDialog({ applicationId, tutorId, subjects, open, onClose, onBooked }: Props) {
  const [slots, setSlots] = useState<OpenSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<OpenSlot | null>(null);
  const [subject, setSubject] = useState(subjects[0] ?? "");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);

  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (!open) return;
    setLoadingSlots(true);
    apiGet<OpenSlot[]>(`/sessions/availability/${tutorId}/slots?days=60`)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [open, tutorId]);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + weekOffset * 7);
  weekStart.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  function getSlotsForDate(date: Date): OpenSlot[] {
    const dateStr = date.toISOString().split("T")[0] as string;
    return slots.filter((s) => s.date === dateStr);
  }

  async function handleBook() {
    if (!selectedSlot) {
      toast({ title: "Please select a time slot", variant: "destructive" });
      return;
    }
    if (!subject.trim()) {
      toast({ title: "Please enter a subject", variant: "destructive" });
      return;
    }

    const scheduledAt = new Date(`${selectedSlot.date}T${String(selectedSlot.startHour).padStart(2, "0")}:00:00`);

    setBooking(true);
    try {
      const session = await apiPost<Session>(`/sessions/book/${applicationId}`, {
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: duration,
        subject,
        notes: notes.trim() || undefined,
      });
      toast({ title: "Session booked!", description: "The tutor will confirm shortly.", variant: "success" });
      onBooked(session);
      onClose();
    } catch (err) {
      toast({
        title: "Booking failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-cyan-400" />
            Book a Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Week navigator */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekOffset((w) => w - 1)}
                disabled={weekOffset === 0}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {weekDays[0]?.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} —{" "}
                {weekDays[6]?.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekOffset((w) => w + 1)}
                disabled={weekOffset >= 7}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {loadingSlots ? (
              <div className="grid grid-cols-7 gap-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-20 rounded-lg bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const daySlots = getSlotsForDate(day);
                  const isPast = day < now && day.toDateString() !== now.toDateString();

                  return (
                    <div key={day.toISOString()} className="flex flex-col gap-1">
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">{DAY_NAMES[day.getDay()]}</p>
                        <p className={`text-xs font-medium ${day.toDateString() === now.toDateString() ? "text-cyan-400" : ""}`}>
                          {day.getDate()}
                        </p>
                      </div>
                      {daySlots.length === 0 ? (
                        <div className="h-12 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center">
                          <span className="text-[9px] text-muted-foreground/40">—</span>
                        </div>
                      ) : (
                        daySlots.map((slot) => {
                          const isSelected =
                            selectedSlot?.date === slot.date &&
                            selectedSlot?.startHour === slot.startHour;
                          return (
                            <button
                              key={`${slot.date}-${slot.startHour}`}
                              onClick={() => !isPast && setSelectedSlot(isSelected ? null : slot)}
                              disabled={isPast}
                              className={`rounded-lg px-1 py-1.5 text-[10px] leading-tight transition-all ${
                                isSelected
                                  ? "bg-cyan-500/30 border border-cyan-500/50 text-cyan-300"
                                  : isPast
                                  ? "bg-white/3 text-muted-foreground/30 cursor-not-allowed"
                                  : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400"
                              }`}
                            >
                              {hourLabel(slot.startHour)}
                            </button>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!loadingSlots && slots.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                This tutor has not set their availability yet.
              </p>
            )}
          </div>

          <AnimatePresence>
            {selectedSlot && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-4 py-3 flex items-center gap-2 text-sm text-cyan-400">
                  <Clock className="h-4 w-4 shrink-0" />
                  Selected:{" "}
                  {new Date(selectedSlot.date).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  at {hourLabel(selectedSlot.startHour)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              {subjects.length > 1 ? (
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s} className="bg-background">
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="e.g. Mathematics"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value={30} className="bg-background">30 minutes</option>
                <option value={60} className="bg-background">1 hour</option>
                <option value={90} className="bg-background">1.5 hours</option>
                <option value={120} className="bg-background">2 hours</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific topics you'd like to focus on..."
              rows={3}
              className="bg-white/5 border-white/10"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleBook}
            disabled={!selectedSlot || booking}
          >
            {booking ? "Booking..." : "Book Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
