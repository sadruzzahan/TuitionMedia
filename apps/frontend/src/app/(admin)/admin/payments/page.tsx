"use client";

import { useEffect, useState, useCallback } from "react";
import { CreditCard, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

type PaymentRow = {
  id: string;
  userName: string;
  userEmail: string;
  requestTitle: string;
  applicationId: string;
  method: string;
  amount: number;
  status: string;
  createdAt: string;
  verifiedAt: string | null;
};

type PaymentsResponse = {
  payments: PaymentRow[];
  total: number;
  page: number;
  totalPages: number;
};

const STATUSES = ["ALL", "PENDING", "OTP_SENT", "VERIFIED", "FAILED", "EXPIRED"];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-400",
  OTP_SENT: "bg-blue-500/20 text-blue-400",
  VERIFIED: "bg-emerald-500/20 text-emerald-400",
  FAILED: "bg-red-500/20 text-red-400",
  EXPIRED: "bg-white/10 text-muted-foreground",
};

export default function AdminPaymentsPage() {
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status && status !== "ALL") params.set("status", status);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await apiGet<PaymentsResponse>(`/admin/payments?${params}`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, status, from, to]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-amber-400" />
          Payment Transactions
        </h1>
        <p className="text-muted-foreground text-sm mt-1">All payment records across the platform</p>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setPage(1); }}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    status === s ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center ml-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <span className="text-muted-foreground text-xs">to</span>
              <input
                type="date"
                value={to}
                onChange={(e) => { setTo(e.target.value); setPage(1); }}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">{data ? `${data.total} transactions` : "Loading..."}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !data || data.payments.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No payments found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground text-xs">
                    <th className="text-left pb-3 font-medium">User</th>
                    <th className="text-left pb-3 font-medium">Request</th>
                    <th className="text-left pb-3 font-medium">Method</th>
                    <th className="text-left pb-3 font-medium">Amount</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/3 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{p.userName}</p>
                        <p className="text-xs text-muted-foreground">{p.userEmail}</p>
                      </td>
                      <td className="py-3 pr-4 max-w-[160px]">
                        <p className="truncate text-xs text-muted-foreground">{p.requestTitle}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          p.method === "BKASH" ? "bg-pink-500/20 text-pink-400" : "bg-orange-500/20 text-orange-400"
                        )}>
                          {p.method}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-medium">৳{p.amount.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_COLORS[p.status] ?? "bg-white/10 text-muted-foreground")}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
