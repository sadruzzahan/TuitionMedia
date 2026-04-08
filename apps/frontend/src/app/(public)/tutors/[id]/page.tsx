import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Star,
  GraduationCap,
  Clock,
  Users,
  BadgeCheck,
  Sparkles,
  ChevronLeft,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicNav } from "@/components/public-nav";

type RatingBreakdown = {
  communication: number | null;
  knowledge: number | null;
  punctuality: number | null;
  patience: number | null;
  value: number | null;
  hasDetailedBreakdown: boolean;
} | null;

type TutorProfileData = {
  id: string;
  name: string | null;
  bio: string | null;
  subjects: string[];
  hourlyRate: number;
  division: string | null;
  areas: string[];
  education: string | null;
  experience: number;
  gender: string | null;
  qualifications: string[];
  ratingBreakdown: RatingBreakdown;
  isVerified: boolean;
  isPremium: boolean;
  isOnline: boolean;
  averageRating: number | null;
  totalReviews: number;
  totalStudents: number;
  memberSince: string;
  contact: { email: string; phone: string | null } | null;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    studentName: string;
    createdAt: string;
  }[];
};

async function getTutorProfile(id: string): Promise<TutorProfileData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"}/tutors/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<TutorProfileData>;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const tutor = await getTutorProfile(id);
  if (!tutor) return { title: "Tutor Not Found" };

  const name = tutor.name ?? "Tutor";
  const subjects = tutor.subjects.slice(0, 3).join(", ");
  const division = tutor.division ?? "Bangladesh";

  return {
    title: `${name} — ${subjects} Tutor in ${division} | TuitionMedia`,
    description: tutor.bio
      ? tutor.bio.slice(0, 160)
      : `${name} teaches ${subjects} in ${division}. ৳${tutor.hourlyRate}/hr. ${tutor.totalReviews} student reviews on TuitionMedia.`,
    openGraph: {
      title: `${name} — Tutor on TuitionMedia`,
      description: tutor.bio ?? `${subjects} tutor in ${division}`,
      type: "profile",
    },
  };
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5"} ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-white/10 text-white/20"
          }`}
        />
      ))}
    </div>
  );
}

function getInitials(name: string | null) {
  if (!name) return "T";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default async function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tutor = await getTutorProfile(id);
  if (!tutor) notFound();

  const memberYear = new Date(tutor.memberSince).getFullYear();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: tutor.name,
    description: tutor.bio,
    knowsAbout: tutor.subjects,
    address: {
      "@type": "PostalAddress",
      addressRegion: tutor.division,
      addressCountry: "BD",
    },
    ...(tutor.averageRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: tutor.averageRating,
        reviewCount: tutor.totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.08),transparent)]" />
      <PublicNav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="pt-28 pb-24 px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/tutors"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Browse
          </Link>

          {/* Hero section */}
          <Card className="glass-card mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-2xl font-bold text-cyan-400 mx-auto sm:mx-0">
                  {getInitials(tutor.name)}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                    <h1 className="text-2xl font-bold">{tutor.name ?? "Tutor"}</h1>
                    {tutor.isVerified && (
                      <BadgeCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                    )}
                    {tutor.isPremium && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                        <Sparkles className="h-3 w-3" />
                        Featured
                      </span>
                    )}
                  </div>
                  {tutor.averageRating ? (
                    <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                      <StarDisplay rating={tutor.averageRating} size="sm" />
                      <span className="font-semibold text-sm">{tutor.averageRating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">({tutor.totalReviews} reviews)</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">New tutor</p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground justify-center sm:justify-start">
                    {tutor.division && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {tutor.division}
                      </span>
                    )}
                    {tutor.experience > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {tutor.experience} yrs experience
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {tutor.totalStudents} students taught
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      Member since {memberYear}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    {tutor.subjects.map((s) => (
                      <span key={s} className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-400">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 items-center sm:items-end shrink-0">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-cyan-400">৳{tutor.hourlyRate.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">per hour</p>
                  </div>
                  <Link href="/signup?role=STUDENT" className="w-full sm:w-auto">
                    <Button variant="gradient" className="w-full gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Request This Tutor
                    </Button>
                  </Link>
                  {tutor.contact && (
                    <div className="text-xs text-muted-foreground text-center">
                      <p>Email: {tutor.contact.email}</p>
                      {tutor.contact.phone && <p>Phone: {tutor.contact.phone}</p>}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              {tutor.bio && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{tutor.bio}</p>
                  </CardContent>
                </Card>
              )}

              {tutor.education && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GraduationCap className="h-4 w-4 text-cyan-400" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{tutor.education}</p>
                    {tutor.qualifications.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {tutor.qualifications.map((q, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                            {q}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Rating Breakdown */}
              {tutor.ratingBreakdown && tutor.totalReviews > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base">Rating Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { label: "Communication", value: tutor.ratingBreakdown.communication },
                        { label: "Knowledge", value: tutor.ratingBreakdown.knowledge },
                        { label: "Punctuality", value: tutor.ratingBreakdown.punctuality },
                        { label: "Patience", value: tutor.ratingBreakdown.patience },
                        { label: "Value", value: tutor.ratingBreakdown.value },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
                          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                              style={{ width: `${value ? (value / 5) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">
                            {value !== null && value !== undefined ? value.toFixed(1) : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                    {!tutor.ratingBreakdown.hasDetailedBreakdown && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Estimated from overall rating. Detailed breakdown available once more reviews are submitted.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Reviews */}
              {tutor.reviews.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>Student Reviews</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {tutor.totalReviews} total
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tutor.reviews.map((review) => (
                      <div key={review.id} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                              {review.studentName[0]}
                            </div>
                            <span className="text-sm font-medium">{review.studentName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <StarDisplay rating={review.rating} size="sm" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString("en-BD", { month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground pl-9">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {/* Coverage Area */}
              {(tutor.division || tutor.areas.length > 0) && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4 text-cyan-400" />
                      Coverage Area
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {tutor.division && (
                      <p className="text-sm font-medium">{tutor.division} Division</p>
                    )}
                    {tutor.areas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tutor.areas.slice(0, 8).map((area) => (
                          <span key={area} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-muted-foreground">
                            {area}
                          </span>
                        ))}
                        {tutor.areas.length > 8 && (
                          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-muted-foreground">
                            +{tutor.areas.length - 8} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Rating Summary */}
              {tutor.averageRating && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base">Rating</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-5xl font-bold text-yellow-400">{tutor.averageRating.toFixed(1)}</p>
                    <StarDisplay rating={tutor.averageRating} size="lg" />
                    <p className="text-sm text-muted-foreground mt-2">Based on {tutor.totalReviews} review{tutor.totalReviews !== 1 ? "s" : ""}</p>
                  </CardContent>
                </Card>
              )}

              {/* CTA */}
              <Card className="glass-card border-cyan-500/20">
                <CardContent className="pt-6 text-center space-y-3">
                  <p className="text-sm font-medium">Ready to learn with {tutor.name?.split(" ")[0] ?? "this tutor"}?</p>
                  <p className="text-xs text-muted-foreground">Post a tuition request and connect directly.</p>
                  <Link href="/signup?role=STUDENT" className="block">
                    <Button variant="gradient" className="w-full gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Request This Tutor
                    </Button>
                  </Link>
                  <Link href="/tutors" className="block">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                      Browse more tutors
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
