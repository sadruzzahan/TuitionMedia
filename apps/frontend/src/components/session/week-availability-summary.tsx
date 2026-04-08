"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { OpenSlot } from "@/components/session/session-types";
import { DAY_NAMES } from "@/components/session/session-types";

function hourLabel(h: number) {
  if (h === 0) return "12am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

export function WeekAvailabilitySummary({ tutorId }: { tutorId: string }) {
  const [slots, setSlots] = useState<OpenSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<OpenSlot[]>(`/sessions/availability/${tutorId}?days=7`)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [tutorId]);

  const now = new Date();
  const next7: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  function getSlotsForDate(date: Date): OpenSlot[] {
    const dateStr = date.toISOString().split("T")[0];
    return slots.filter((s) => s.date === dateStr);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-20 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
        <Calendar className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No availability set for the next 7 days.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Configure your weekly availability above.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {next7.map((day) => {
        const daySlots = getSlotsForDate(day);
        const isToday = day.toDateString() === now.toDateString();
        return (
          <div key={day.toISOString()} className="flex flex-col gap-1">
            <div className="text-center mb-1">
              <p className="text-[10px] text-muted-foreground">{DAY_NAMES[day.getDay()]}</p>
              <p className={`text-xs font-medium ${isToday ? "text-cyan-400" : ""}`}>{day.getDate()}</p>
            </div>
            {daySlots.length === 0 ? (
              <div className="h-10 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center">
                <span className="text-[9px] text-muted-foreground/40">—</span>
              </div>
            ) : (
              daySlots.slice(0, 3).map((slot) => (
                <div
                  key={`${slot.date}-${slot.startHour}`}
                  className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-1 py-1 text-center"
                >
                  <span className="text-[10px] text-cyan-400">{hourLabel(slot.startHour)}</span>
                </div>
              ))
            )}
            {daySlots.length > 3 && (
              <p className="text-[9px] text-center text-muted-foreground/60">+{daySlots.length - 3}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
