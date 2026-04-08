"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CalendarClock, History } from "lucide-react";
import { SessionCard } from "@/components/session/session-card";
import { SessionHistory } from "@/components/session/session-history";
import { apiGet } from "@/lib/api";
import type { Session } from "@/components/session/session-types";
import { useAuthStore } from "@/store/auth-store";

export default function TutorSessionsPage() {
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    apiGet<Session[]>("/sessions/upcoming")
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: "upcoming" as const, label: "Upcoming", icon: CalendarClock },
    { key: "history" as const, label: "History", icon: History },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold">Sessions</h1>
        <p className="mt-1 text-muted-foreground">Manage and track your teaching sessions.</p>
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
        {tab === "upcoming" && (
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />)
            ) : sessions.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center">
                <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">No upcoming sessions</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Students will book sessions once you set your availability.
                </p>
              </div>
            ) : (
              sessions.map((s) =>
                user ? (
                  <SessionCard
                    key={s.id}
                    session={s}
                    currentUserId={user.id}
                    onUpdate={(updated) =>
                      setSessions((prev) =>
                        prev
                          .map((x) => (x.id === updated.id ? updated : x))
                          .filter((x) => x.status !== "CANCELLED" && x.status !== "COMPLETED"),
                      )
                    }
                  />
                ) : null
              )
            )}
          </div>
        )}
        {tab === "history" && user && <SessionHistory currentUserId={user.id} />}
      </motion.div>
    </div>
  );
}
