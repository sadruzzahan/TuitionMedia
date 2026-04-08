"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, Trash2, Loader2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, apiDelete, apiPut } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type RequestRow = {
  id: string;
  title: string;
  studentName: string;
  studentEmail: string;
  status: string;
  subjects: string[];
  budget: number | null;
  applicationCount: number;
  createdAt: string;
};

type RequestsResponse = {
  requests: RequestRow[];
  total: number;
  page: number;
  totalPages: number;
};

const STATUSES = ["ALL", "OPEN", "IN_PROGRESS", "ASSIGNED", "CLOSED", "CANCELLED"];

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-emerald-500/20 text-emerald-400",
  IN_PROGRESS: "bg-cyan-500/20 text-cyan-400",
  ASSIGNED: "bg-blue-500/20 text-blue-400",
  CLOSED: "bg-white/10 text-muted-foreground",
  CANCELLED: "bg-red-500/20 text-red-400",
};

export default function AdminRequestsPage() {
  const [data, setData] = useState<RequestsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status && status !== "ALL") params.set("status", status);
      const res = await apiGet<RequestsResponse>(`/admin/requests?${params}`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  async function handleClose(id: string, title: string) {
    if (!confirm(`Close request "${title}"? It will no longer be visible to tutors.`)) return;
    setClosingId(id);
    try {
      await apiPut(`/admin/requests/${id}/close`, {});
      toast({ title: "Request closed", variant: "success" });
      load();
    } catch {
      toast({ title: "Failed to close request", variant: "destructive" });
    } finally {
      setClosingId(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete request "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await apiDelete(`/admin/requests/${id}`);
      toast({ title: "Request deleted", variant: "success" });
      load();
    } catch {
      toast({ title: "Failed to delete request", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-orange-400" />
          Tuition Requests
        </h1>
        <p className="text-muted-foreground text-sm mt-1">All requests posted on the platform</p>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-5">
          <div className="flex gap-1.5 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  status === s ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">{data ? `${data.total} requests` : "Loading..."}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !data || data.requests.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No requests found</p>
          ) : (
            <div className="space-y-3">
              {data.requests.map((r) => (
                <div key={r.id} className="rounded-xl border border-white/5 bg-white/3 p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{r.title}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_COLORS[r.status] ?? "bg-white/10 text-muted-foreground")}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {r.studentName} · {r.applicationCount} applications
                      {r.budget ? ` · ৳${r.budget.toLocaleString()}/hr` : ""}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.subjects.slice(0, 4).map((s) => (
                        <span key={s} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                    <div className="flex gap-1">
                      {r.status === "OPEN" || r.status === "IN_PROGRESS" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-amber-400 hover:text-amber-400 hover:bg-amber-500/10 gap-1"
                          onClick={() => handleClose(r.id, r.title)}
                          disabled={closingId === r.id}
                        >
                          {closingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                          Close
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-red-400 hover:text-red-400 hover:bg-red-500/10 gap-1"
                        onClick={() => handleDelete(r.id, r.title)}
                        disabled={deletingId === r.id}
                      >
                        {deletingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs border-white/10" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" className="text-xs border-white/10" onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
