"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, Trash2, Loader2, EyeOff, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, apiDelete, apiPut } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ReviewRow = {
  id: string;
  studentName: string;
  tutorName: string;
  overallRating: number;
  comment: string | null;
  isHidden: boolean;
  createdAt: string;
  dimensions: Record<string, number>;
};

type ReviewsResponse = {
  reviews: ReviewRow[];
  total: number;
  page: number;
  totalPages: number;
};

const FILTERS = ["ALL", "VISIBLE", "HIDDEN"];

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.round(value) ? "text-amber-400 fill-amber-400" : "text-white/20"}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{value.toFixed(1)}</span>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      const res = await apiGet<ReviewsResponse>(`/admin/reviews?${params}`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleToggleHide(review: ReviewRow) {
    setActionLoading(review.id + "-hide");
    try {
      await apiPut(`/admin/reviews/${review.id}/hide`, {});
      toast({
        title: review.isHidden ? "Review made visible" : "Review hidden",
        variant: "success",
      });
      load();
    } catch {
      toast({ title: "Failed to update review", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(review: ReviewRow) {
    if (!confirm("Permanently remove this review? This cannot be undone.")) return;
    setActionLoading(review.id + "-delete");
    try {
      await apiDelete(`/admin/reviews/${review.id}`);
      toast({ title: "Review permanently removed", variant: "success" });
      load();
    } catch {
      toast({ title: "Failed to remove review", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  const filteredReviews = data?.reviews.filter((r) => {
    if (filter === "VISIBLE") return !r.isHidden;
    if (filter === "HIDDEN") return r.isHidden;
    return true;
  }) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
          Review Moderation
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Hide reviews from public view or permanently remove them
        </p>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-5">
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  filter === f ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">
            {data ? `${data.total} total · ${filteredReviews.length} shown` : "Loading..."}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No reviews found</p>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className={cn(
                    "rounded-xl border p-4 transition-colors",
                    review.isHidden
                      ? "border-white/5 bg-white/2 opacity-70"
                      : "border-white/5 bg-white/3"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-medium">{review.studentName}</p>
                        <span className="text-xs text-muted-foreground">→</span>
                        <p className="text-sm font-medium text-cyan-400">{review.tutorName}</p>
                        {review.isHidden && (
                          <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 rounded-full px-2 py-0.5">
                            <EyeOff className="h-3 w-3" /> Hidden
                          </span>
                        )}
                      </div>
                      <StarRating value={review.overallRating} />
                      {review.comment && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{review.comment}</p>
                      )}
                      {review.dimensions && Object.keys(review.dimensions).length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                          {Object.entries(review.dimensions).map(([dim, val]) => (
                            <span key={dim} className="text-xs text-muted-foreground">
                              {dim}: <span className="text-foreground font-medium">{val}/5</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 px-2 text-xs gap-1",
                          review.isHidden
                            ? "text-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                            : "text-amber-400 hover:text-amber-400 hover:bg-amber-500/10"
                        )}
                        onClick={() => handleToggleHide(review)}
                        disabled={actionLoading === review.id + "-hide"}
                      >
                        {actionLoading === review.id + "-hide" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : review.isHidden ? (
                          <><Eye className="h-3.5 w-3.5" />Unhide</>
                        ) : (
                          <><EyeOff className="h-3.5 w-3.5" />Hide</>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-red-400 hover:text-red-400 hover:bg-red-500/10 gap-1"
                        onClick={() => handleDelete(review)}
                        disabled={actionLoading === review.id + "-delete"}
                      >
                        {actionLoading === review.id + "-delete" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <><Trash2 className="h-3.5 w-3.5" />Delete</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages} · {data.total} total</p>
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
