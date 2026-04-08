"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, History } from "lucide-react";
import { AvailabilityPicker } from "@/components/session/availability-picker";
import { SessionHistory } from "@/components/session/session-history";
import { WeekAvailabilitySummary } from "@/components/session/week-availability-summary";
import { useAuthStore } from "@/store/auth-store";

export default function TutorSchedulePage() {
  const [tab, setTab] = useState<"availability" | "history">("availability");
  const user = useAuthStore((s) => s.user);

  const tabs = [
    { key: "availability" as const, label: "Availability", icon: Calendar },
    { key: "history" as const, label: "Session History", icon: History },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold">Schedule</h1>
        <p className="mt-1 text-muted-foreground">Manage your availability and review past sessions.</p>
      </motion.div>

      <div className="flex gap-1 rounded-xl bg-white/5 p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-white/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === "availability" && (
          <div className="space-y-6">
            <AvailabilityPicker />
            {user && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  Your Next 7 Days
                </h2>
                <WeekAvailabilitySummary tutorId={user.id} />
              </div>
            )}
          </div>
        )}
        {tab === "history" && user && <SessionHistory currentUserId={user.id} />}
      </motion.div>
    </div>
  );
}
