"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Save, Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGet, apiPut } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { AvailabilitySlot } from "./session-types";
import { DAY_NAMES_FULL } from "./session-types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function hourLabel(h: number) {
  if (h === 0) return "12:00 AM";
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}

export function AvailabilityPicker() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<AvailabilitySlot[]>("/sessions/availability/my")
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, []);

  function addSlot() {
    setSlots((prev) => [...prev, { dayOfWeek: 1, startHour: 9, endHour: 12 }]);
  }

  function removeSlot(idx: number) {
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateSlot(idx: number, field: keyof AvailabilitySlot, value: number) {
    setSlots((prev) => {
      const next = [...prev];
      const slot = { ...next[idx]! };
      (slot as unknown as Record<string, number>)[field] = value;
      if (field === "startHour" && slot.endHour <= value) {
        slot.endHour = Math.min(value + 2, 24);
      }
      if (field === "endHour" && slot.startHour >= value) {
        slot.startHour = Math.max(value - 2, 0);
      }
      next[idx] = slot;
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      await apiPut("/sessions/availability", { slots });
      toast({ title: "Availability saved!", variant: "success" });
    } catch (err) {
      toast({
        title: "Failed to save",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Set your weekly availability so students can book sessions.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addSlot} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Slot
          </Button>
          <Button variant="gradient" size="sm" onClick={save} disabled={saving} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {slots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-dashed border-white/10 p-10 text-center"
        >
          <Clock className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No availability slots yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Add your first slot to let students know when you can teach.</p>
          <Button variant="outline" size="sm" onClick={addSlot} className="mt-4 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add First Slot
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3"
            >
              <select
                value={slot.dayOfWeek}
                onChange={(e) => updateSlot(idx, "dayOfWeek", Number(e.target.value))}
                className="rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {DAY_NAMES_FULL.map((d, i) => (
                  <option key={d} value={i} className="bg-background">
                    {d}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <select
                  value={slot.startHour}
                  onChange={(e) => updateSlot(idx, "startHour", Number(e.target.value))}
                  className="rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {HOURS.slice(0, 23).map((h) => (
                    <option key={h} value={h} className="bg-background">
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
                <span className="text-muted-foreground text-sm">to</span>
                <select
                  value={slot.endHour}
                  onChange={(e) => updateSlot(idx, "endHour", Number(e.target.value))}
                  className="rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {HOURS.slice(1).map((h) => (
                    <option key={h} value={h} className="bg-background" disabled={h <= slot.startHour}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => removeSlot(idx)}
                className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {slots.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {slots.length} slot{slots.length !== 1 ? "s" : ""} configured
        </p>
      )}
    </div>
  );
}
