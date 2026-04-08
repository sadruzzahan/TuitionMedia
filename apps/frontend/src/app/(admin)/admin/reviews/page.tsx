"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, Trash2, Loader2, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, apiDelete } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleDelete(id: string) {
    if (!confirm("Remove this review? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await apiDelete(`/admin/reviews/${id}`);
      toast({ title: "Review removed", variant: "success" });
      load();
    } catch {
      toast({ title: "Failed to remove review", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
          Review Moderation
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor and remove inappropriate reviews</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">{data ? `${data.total} reviews` : "Loading..."}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !data || data.reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No reviews found</p>
          ) : (
            <div className="space-y-3">
              {data.reviews.map((review) => (
                <div
                  key={review.id}
                  className={`rounded-xl border p-4 transition-colors ${review.isHidden ? "border-white/5 bg-white/2 opacity-60" : "border-white/5 bg-white/3"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-medium">{review.studentName}</p>
                        <span className="text-xs text-muted-foreground">→</span>
                        <p className="text-sm font-medium text-cyan-400">{review.tutorName}</p>
                        {review.isHidden && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-white/10 rounded-full px-2 py-0.5">
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
                    <div className="shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-red-400 hover:text-red-400 hover:bg-red-500/10 gap-1"
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                      >
                        {deletingId === review.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <><Trash2 className="h-3.5 w-3.5" />Remove</>
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
