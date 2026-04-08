"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, apiPut } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type DocumentRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  status: string;
  reason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

type DocumentsResponse = {
  documents: DocumentRow[];
  total: number;
  page: number;
  totalPages: number;
};

const STATUSES = ["ALL", "PENDING", "APPROVED", "REJECTED"];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-400",
  APPROVED: "bg-emerald-500/20 text-emerald-400",
  REJECTED: "bg-red-500/20 text-red-400",
};

const DOC_TYPE_LABELS: Record<string, string> = {
  NID: "National ID",
  PASSPORT: "Passport",
  DEGREE_CERTIFICATE: "Degree Certificate",
  TEACHING_CERTIFICATE: "Teaching Certificate",
  STUDENT_ID: "Student ID",
  OTHER: "Other",
};

export default function AdminDocumentsPage() {
  const [data, setData] = useState<DocumentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ id: string; reason: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status && status !== "ALL") params.set("status", status);
      const res = await apiGet<DocumentsResponse>(`/admin/documents?${params}`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(id: string) {
    setActionLoading(id + "-approve");
    try {
      await apiPut(`/admin/documents/${id}/approve`, {});
      toast({ title: "Document approved — tutor is now verified", variant: "success" });
      load();
    } catch {
      toast({ title: "Failed to approve document", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string, reason: string) {
    setActionLoading(id + "-reject");
    try {
      await apiPut(`/admin/documents/${id}/reject`, { reason });
      toast({ title: "Document rejected", variant: "success" });
      setRejectReason(null);
      load();
    } catch {
      toast({ title: "Failed to reject document", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-emerald-400" />
          Document Verification
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Review and verify tutor identity documents</p>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-5">
          <div className="flex gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  status === s ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-muted-foreground hover:bg-white/10"
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
          <CardTitle className="text-base">{data ? `${data.total} documents` : "Loading..."}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !data || data.documents.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No documents found</p>
          ) : (
            <div className="space-y-3">
              {data.documents.map((doc) => (
                <div key={doc.id} className="rounded-xl border border-white/5 bg-white/3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-medium text-sm">{doc.userName}</p>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_COLORS[doc.status])}>
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{doc.userEmail}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                        <span>Type: <span className="text-foreground font-medium">{DOC_TYPE_LABELS[doc.type] ?? doc.type}</span></span>
                        <span>Submitted: {new Date(doc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        {doc.reviewedBy && <span>Reviewed by: {doc.reviewedBy}</span>}
                        {doc.reason && <span className="text-red-400">Reason: {doc.reason}</span>}
                      </div>
                    </div>
                    {doc.status === "PENDING" && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs text-emerald-400 hover:bg-emerald-500/10 gap-1"
                          onClick={() => handleApprove(doc.id)}
                          disabled={actionLoading === doc.id + "-approve"}
                        >
                          {actionLoading === doc.id + "-approve" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <><CheckCircle className="h-3.5 w-3.5" />Approve</>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs text-red-400 hover:bg-red-500/10 gap-1"
                          onClick={() => setRejectReason({ id: doc.id, reason: "" })}
                          disabled={actionLoading === doc.id + "-reject"}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    )}
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

      {rejectReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setRejectReason(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-3">Reject Document</h3>
            <p className="text-sm text-muted-foreground mb-4">Provide an optional reason for rejection.</p>
            <textarea
              value={rejectReason.reason}
              onChange={(e) => setRejectReason({ ...rejectReason, reason: e.target.value })}
              placeholder="Reason (optional)..."
              rows={3}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none mb-4"
            />
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex-1 border-white/10" onClick={() => setRejectReason(null)}>Cancel</Button>
              <Button
                size="sm"
                className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
                onClick={() => handleReject(rejectReason.id, rejectReason.reason)}
                disabled={!!actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Reject"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
