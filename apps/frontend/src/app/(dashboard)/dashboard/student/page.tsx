"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/api";

type Request = {
  id: string;
  title: string;
  subjects: string[];
  status: string;
  _count: { applications: number };
  createdAt: string;
};

export default function StudentDashboardPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Request[]>("/tuition-requests/my")
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    OPEN: "bg-emerald-500/20 text-emerald-400",
    ASSIGNED: "bg-yellow-500/20 text-yellow-400",
    IN_PROGRESS: "bg-cyan-500/20 text-cyan-400",
    CLOSED: "bg-muted text-muted-foreground",
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">My Tuition Requests</h1>
          <p className="mt-1 text-muted-foreground">View and manage your posted requests.</p>
        </div>
        <Link href="/dashboard/student/new">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="h-32 rounded-xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-16 text-center"
        >
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-xl font-semibold">No requests yet</h3>
          <p className="mt-2 text-muted-foreground">Post your first tuition request to find tutors.</p>
          <Link href="/dashboard/student/new">
            <Button variant="gradient" className="mt-6">
              Post a Request
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {requests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/dashboard/student/${req.id}`}>
                  <Card className="glass-card cursor-pointer transition-all duration-300 hover:border-cyan-500/30 hover:shadow-cyan-500/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg">{req.title}</CardTitle>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[req.status] ?? "bg-muted"}`}
                      >
                        {req.status.replace("_", " ")}
                      </span>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{req.subjects?.join(", ") ?? "N/A"}</span>
                          <span>{req._count.applications} applications</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-cyan-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
