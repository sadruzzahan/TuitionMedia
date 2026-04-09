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
  { text: "Free trial period — no upfront cost", included: true },
  { text: "Approve after trial to confirm the match", included: true },
  { text: "No payment ever — students pay ৳0", included: true },
];

const TUTOR_FREE_FEATURES = [
  { text: "Browse all open tuition requests", included: true },
  { text: "Apply to unlimited requests", included: true },
  { text: "Write cover letters for free", included: true },
  { text: "Build a public tutor profile", included: true },
  { text: "Free trial — no payment until approval", included: true },
  { text: "Finder's fee: 50% of monthly rate (min ৳300)", included: true },
  { text: "Student contact info after fee payment", included: true },
  { text: "No monthly fee", included: true },
];

const TUTOR_PREMIUM_FEATURES = [
  { text: "Everything in Free", included: true },
  { text: "Reduced finder's fee: 30% of monthly rate", included: true },
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
    tuitionmedia: "Tutor pays finder's fee after trial",
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
    q: "Do students have to pay anything?",
    a: "No. Students pay absolutely nothing on TuitionMedia. Posting requests, reviewing applications, starting trials, and approving tutors are all free. The finder's fee is paid only by the tutor.",
  },
  {
    q: "How is the tutor finder's fee calculated?",
    a: "The finder's fee is 50% of the tutor's proposed monthly rate, with a minimum of ৳300. For example: if a tutor proposes ৳2,000/month, they pay ৳1,000 as a finder's fee after trial approval.",
  },
  {
    q: "When does the tutor pay the finder's fee?",
    a: "Only after the student/guardian explicitly approves the trial classes. The tutor conducts trial classes for free, and only pays once the guardian is satisfied and clicks 'Guardian Approved'. Zero upfront cost.",
  },
  {
    q: "Can I post multiple tuition requests as a student?",
    a: "Yes! Students can post unlimited tuition requests at no extra cost. You can have multiple open requests for different subjects running simultaneously.",
  },
  {
    q: "What's the difference between Free and Premium for tutors?",
    a: "With the Free plan, you pay a finder's fee (50% of monthly rate, min ৳300) per successful match. With Premium, the finder's fee is reduced to 30%. Premium also includes priority listing and a verified badge.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support bKash and Nagad. Only a mobile number and OTP are required — no card needed.",
  },
  {
    q: "Can I apply to many requests without paying?",
    a: "Absolutely. Applying is always free. You only pay the finder's fee after a student accepts you, you conduct trial classes, and the guardian approves — which means no financial risk during the trial.",
  },
  {
    q: "How do students know a tutor is verified?",
    a: "Tutors with a 'Verified' badge have had their academic qualifications reviewed by our team. Always check reviews and ratings before approving a tutor.",
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
                  Students pay <span className="text-cyan-400 font-medium">৳0</span> — always free
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
                  + <span className="text-teal-400 font-medium">50% of rate</span> finder&apos;s fee after trial
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
                <h2 className="text-xl font-bold mb-2">Why the finder&apos;s fee?</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A small finder&apos;s fee is charged to the tutor only after the student/guardian approves the trial.
                  This model is carefully designed to:
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Eliminate upfront risk — no payment until the fit is confirmed",
                    "Students pay ৳0, making it genuinely accessible for all families",
                    "Filter out spam tutors who aren't committed to quality",
                    "Fund platform development, support, and tutor verification",
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
