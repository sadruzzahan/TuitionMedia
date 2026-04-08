"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  sessionId: string;
  revieweeName: string;
  role: "STUDENT" | "TUTOR";
  onClose: () => void;
  onSubmitted?: () => void;
};

const STUDENT_DIMENSIONS = [
  { key: "ratingCommunication", label: "Communication" },
  { key: "ratingKnowledge", label: "Knowledge" },
  { key: "ratingPunctuality", label: "Punctuality" },
  { key: "ratingPatience", label: "Patience" },
  { key: "ratingValue", label: "Value for Money" },
] as const;

const TUTOR_DIMENSIONS = [
  { key: "ratingCommunication", label: "Communication" },
  { key: "ratingPunctuality", label: "Punctuality" },
  { key: "ratingPatience", label: "Engagement" },
  { key: "ratingValue", label: "Preparedness" },
] as const;

function StarPicker({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              sz,
              "transition-colors",
              star <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-white/10 text-white/20"
            )}
          />
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Below Average",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

export function ReviewModal({ sessionId, revieweeName, role, onClose, onSubmitted }: Props) {
  const [overallRating, setOverallRating] = useState(0);
  const [dimensions, setDimensions] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dimensionList = role === "STUDENT" ? STUDENT_DIMENSIONS : TUTOR_DIMENSIONS;

  function setDimension(key: string, value: number) {
    setDimensions((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (overallRating === 0) {
      toast({ title: "Please select an overall rating", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await apiPost("/reviews", {
        sessionId,
        rating: overallRating,
        comment: comment.trim() || undefined,
        ratingCommunication: dimensions.ratingCommunication,
        ratingKnowledge: dimensions.ratingKnowledge,
        ratingPunctuality: dimensions.ratingPunctuality,
        ratingPatience: dimensions.ratingPatience,
        ratingValue: dimensions.ratingValue,
      });
      setSubmitted(true);
      toast({ title: "Review submitted!", variant: "success" });
      onSubmitted?.();
    } catch (err) {
      toast({
        title: "Failed to submit review",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-bold">Review Submitted!</h2>
              <p className="text-muted-foreground text-sm">
                Thank you for your feedback on {revieweeName}.
              </p>
              <Button variant="gradient" className="mt-2" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-lg font-bold">Leave a Review</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Rate your experience with {revieweeName}
                </p>
              </div>

              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">Overall Rating</p>
                  <div className="flex flex-col items-center gap-1.5">
                    <StarPicker value={overallRating} onChange={setOverallRating} size="lg" />
                    {overallRating > 0 && (
                      <span className="text-sm text-yellow-400 font-medium">
                        {RATING_LABELS[overallRating]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm font-medium mb-3 text-muted-foreground">Detailed Ratings <span className="text-xs">(optional)</span></p>
                  <div className="space-y-3">
                    {dimensionList.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-muted-foreground w-32 shrink-0">{label}</span>
                        <StarPicker
                          value={dimensions[key] ?? 0}
                          onChange={(v) => setDimension(key, v)}
                          size="sm"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {dimensions[key] ? `${dimensions[key]}/5` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    Comment{" "}
                    <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 500))}
                    placeholder="Share your experience..."
                    rows={3}
                    className="bg-white/5 border-white/10 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {comment.length}/500
                  </p>
                </div>

                <div className="flex gap-3 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/10"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1 gap-2"
                    onClick={handleSubmit}
                    disabled={submitting || overallRating === 0}
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</>
                    ) : (
                      <><Star className="h-4 w-4" />Submit Review</>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
