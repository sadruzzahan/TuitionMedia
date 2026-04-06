"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  X,
  ArrowRight,
  Shield,
  Zap,
  ChevronDown,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/public-nav";

const STUDENT_FEATURES = [
  { text: "Post unlimited tuition requests", included: true },
  { text: "Receive unlimited tutor applications", included: true },
  { text: "Browse and filter tutor profiles", included: true },
  { text: "Review cover letters for free", included: true },
  { text: "Accept or reject applications freely", included: true },
  { text: "৳500 one-time connection fee (per match)", included: true },
  { text: "Contact info revealed after payment", included: true },
  { text: "No monthly subscription required", included: true },
];

const TUTOR_FREE_FEATURES = [
  { text: "Browse all open tuition requests", included: true },
  { text: "Apply to unlimited requests", included: true },
  { text: "Write cover letters for free", included: true },
  { text: "Build a public tutor profile", included: true },
  { text: "৳500 per successful connection", included: true },
  { text: "Student contact info after payment", included: true },
  { text: "Standard visibility in search", included: true },
  { text: "No monthly fee", included: true },
];

const TUTOR_PREMIUM_FEATURES = [
  { text: "Everything in Free", included: true },
  { text: "Unlimited connections (no per-match fee)", included: true },
  { text: "Priority listing in search results", included: true },
  { text: "Verified badge on your profile", included: true },
  { text: "Advanced analytics on applications", included: true },
  { text: "Dedicated support channel", included: true },
  { text: "Early access to new features", included: true },
  { text: "৳500/month flat subscription", included: true },
];

const COMPARISON = [
  {
    feature: "Post requests",
    tuitionmedia: "Free & unlimited",
    hometutorbd: "Free",
    bdtutors: "Free",
  },
  {
    feature: "Browse tutors",
    tuitionmedia: "Free",
    hometutorbd: "Free",
    bdtutors: "Free",
  },
  {
    feature: "Contact info",
    tuitionmedia: "৳500 flat or ৳500/mo Premium",
    hometutorbd: "Monthly subscription",
    bdtutors: "Manual contact",
  },
  {
    feature: "Tutor verification",
    tuitionmedia: "✓ Full verification",
    hometutorbd: "Basic",
    bdtutors: "None",
  },
  {
    feature: "Mobile-friendly",
    tuitionmedia: "✓ Fully responsive",
    hometutorbd: "Partial",
    bdtutors: "Limited",
  },
  {
    feature: "bKash / Nagad",
    tuitionmedia: "✓ Supported",
    hometutorbd: "✗",
    bdtutors: "✗",
  },
  {
    feature: "Unlimited connections",
    tuitionmedia: "✓ Premium plan",
    hometutorbd: "✗",
    bdtutors: "✗",
  },
];

const FAQS = [
  {
    q: "Is the ৳500 connection fee refundable?",
    a: "The connection fee is non-refundable once both parties have paid and contact details are exchanged. If a student pays but the tutor does not confirm within 48 hours, you can request a review from our support team.",
  },
  {
    q: "Can I post multiple tuition requests as a student?",
    a: "Yes! Students can post unlimited tuition requests at no extra cost. You can have multiple open requests for different subjects running simultaneously.",
  },
  {
    q: "What's the difference between Free and Premium for tutors?",
    a: "With the Free plan, you pay ৳500 per successful match. With Premium (৳500/month), all connection fees are waived — ideal for tutors who make 2+ matches per month. Premium also includes priority listing and a verified badge.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support bKash and Nagad for all payments — connection fees and Premium subscriptions. Only a mobile number and OTP are required; no card needed.",
  },
  {
    q: "Can I apply to many requests without paying?",
    a: "Absolutely. Applying to requests is always free. You only pay (either ৳500 per match or your monthly Premium fee) when a student accepts your application and you choose to unlock their contact info.",
  },
  {
    q: "How do students know a tutor is verified?",
    a: "Tutors with a 'Verified' badge have had their academic qualifications reviewed by our team. Premium tutors receive this badge automatically. Free tutors can apply for verification separately.",
  },
  {
    q: "Can I switch between Free and Premium?",
    a: "Yes. You can upgrade to Premium at any time and downgrade at the end of a billing cycle. Any remaining connections from the Premium period remain accessible.",
  },
  {
    q: "Is there a free trial for Premium?",
    a: "We occasionally offer trial periods for Premium. Watch for promotions in your dashboard. You can also use the Free plan indefinitely with no expiry.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-cyan-400 transition-colors"
      >
        <span className="text-sm font-medium">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]" />

      <PublicNav />

      <main className="pt-28 pb-24 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Pricing</span>
            <h1 className="mt-3 text-5xl font-bold">সহজ ও স্বচ্ছ মূল্য</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Students always get started free. Tutors choose between pay-per-match or an affordable monthly Premium.
            </p>
          </motion.div>

          {/* Pricing cards */}
          <div className="grid gap-6 lg:grid-cols-3 mb-20">
            {/* Student */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-3xl p-8"
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-cyan-500/20 p-2.5">
                    <BookOpen className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Student</h2>
                    <p className="text-xs text-muted-foreground">শিক্ষার্থী</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">৳0</span>
                  <span className="text-muted-foreground">to start</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  + <span className="text-cyan-400 font-medium">৳500 one-time</span> per accepted tutor
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {STUDENT_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm">
                    {f.included ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                    )}
                    <span className={f.included ? "" : "text-muted-foreground/50"}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup?role=STUDENT">
                <Button variant="outline" className="w-full border-white/10 hover:border-cyan-500/30" size="lg">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Tutor Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card rounded-3xl p-8"
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-teal-500/20 p-2.5">
                    <GraduationCap className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Tutor Free</h2>
                    <p className="text-xs text-muted-foreground">পে-পার-ম্যাচ</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">৳0</span>
                  <span className="text-muted-foreground">to browse</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  + <span className="text-teal-400 font-medium">৳500</span> per successful connection
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {TUTOR_FREE_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm">
                    {f.included ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                    )}
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup?role=TUTOR">
                <Button variant="outline" className="w-full border-white/10 hover:border-teal-500/30" size="lg">
                  Join Free
                </Button>
              </Link>
            </motion.div>

            {/* Tutor Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-3xl p-8 border-cyan-500/30 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 rounded-bl-2xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-1.5 text-xs font-bold text-background">
                BEST VALUE
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-emerald-500/20 p-2.5">
                    <Star className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Tutor Premium</h2>
                    <p className="text-xs text-muted-foreground">আনলিমিটেড</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">৳500</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="text-emerald-400 font-medium">No per-match fees.</span> Unlimited connections.
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {TUTOR_PREMIUM_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm">
                    {f.included ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                    )}
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup?role=TUTOR">
                <Button variant="gradient" className="w-full" size="lg">
                  Start Premium <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Why the fee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 mb-16"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-violet-500/20 p-3 shrink-0">
                <Shield className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Why the connection fee?</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A small fee is charged when a student and tutor successfully match.
                  This is carefully designed to:
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Filter out spam, time-wasters, and fake requests",
                    "Ensure both parties are serious about the tutoring arrangement",
                    "Fund platform development, support, and tutor verification",
                    "Keep the platform free of mandatory upfront fees for everyone",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Zap className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Competitor comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-8">How We Compare</h2>
            <div className="overflow-x-auto glass-card rounded-2xl p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-4 text-left text-sm font-medium text-muted-foreground">Feature</th>
                    <th className="pb-4 text-center text-sm font-semibold text-cyan-400">TuitionMedia</th>
                    <th className="pb-4 text-center text-sm text-muted-foreground">Hometutorbd</th>
                    <th className="pb-4 text-center text-sm text-muted-foreground">BDTutors</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="py-3 text-sm">{row.feature}</td>
                      <td className="py-3 text-center text-sm text-cyan-400 font-medium">{row.tuitionmedia}</td>
                      <td className="py-3 text-center text-sm text-muted-foreground">{row.hometutorbd}</td>
                      <td className="py-3 text-center text-sm text-muted-foreground">{row.bdtutors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-center mb-2">Frequently Asked Questions</h2>
            <p className="text-center text-muted-foreground mb-8">সাধারণ প্রশ্ন ও উত্তর</p>
            <div className="glass-card rounded-2xl px-6">
              {FAQS.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
