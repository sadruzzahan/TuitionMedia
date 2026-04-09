"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  GraduationCap,
  BookOpen,
  FileText,
  Users,
  CheckCircle2,
  CreditCard,
  Phone,
  ArrowRight,
  MessageSquare,
  Star,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/public-nav";

const STUDENT_STEPS = [
  {
    icon: FileText,
    title: "Post Your Request",
    bangla: "রিকোয়েস্ট পোস্ট করুন",
    desc: "Fill in what subject you need help with, your education level, location (division & area), budget, and preferred class mode. It takes under 2 minutes.",
    tip: "The more detail you add, the better-matched tutors will apply.",
    color: "cyan",
  },
  {
    icon: Users,
    title: "Receive Applications",
    bangla: "আবেদন পাবেন",
    desc: "Qualified tutors browse your request and apply with a personalised cover letter and their proposed monthly rate. Review each application at your own pace.",
    tip: "No pressure — applications stay open until you close the request.",
    color: "teal",
  },
  {
    icon: CheckCircle2,
    title: "Accept & Start Trial — Free",
    bangla: "ট্রায়াল শুরু করুন — বিনামূল্যে",
    desc: "Click 'Accept (Free Trial)' on the tutor you like. The trial period starts immediately — no payment needed. Chat with the tutor and arrange a few trial classes to see if it's a good fit.",
    tip: "You can reject other applications to keep your inbox tidy.",
    color: "emerald",
  },
  {
    icon: Star,
    title: "Guardian Approves the Trial",
    bangla: "অভিভাবক অনুমোদন দিন",
    desc: "After trying a few classes, if the guardian/student is satisfied, click 'Guardian Approved'. This notifies the tutor that the match is confirmed and it's time to pay.",
    tip: "Only approve when you're genuinely happy — this step is final.",
    color: "blue",
  },
  {
    icon: Phone,
    title: "Tutor Pays — You Get Connected",
    bangla: "কানেক্ট হন",
    desc: "The tutor pays a small finder's fee (50% of the proposed monthly rate) after your approval. Once done, both your contact details are revealed and you can start proper sessions!",
    tip: "Students pay nothing. The finder's fee is on the tutor only.",
    color: "violet",
  },
];

const TUTOR_STEPS = [
  {
    icon: GraduationCap,
    title: "Complete Your Profile",
    bangla: "প্রোফাইল সম্পন্ন করুন",
    desc: "Add your qualifications, subjects, experience, and location. A complete profile gets significantly more applications accepted.",
    tip: "Upload your academic certificates to stand out.",
    color: "emerald",
  },
  {
    icon: BookOpen,
    title: "Browse Open Requests",
    bangla: "রিকোয়েস্ট দেখুন",
    desc: "Go to the Job Board to see all open tuition requests. Filter by subject or location. See the student's level, budget, and what they're looking for.",
    tip: "Check the Job Board daily — new requests are posted frequently.",
    color: "cyan",
  },
  {
    icon: MessageSquare,
    title: "Apply With a Cover Letter",
    bangla: "আবেদন করুন",
    desc: "Write a personalised cover letter and propose your monthly rate. No fee to apply — your application is completely free.",
    tip: "Personalised cover letters get accepted 3× more than generic ones.",
    color: "teal",
  },
  {
    icon: Star,
    title: "Student Accepts → Trial Starts",
    bangla: "ট্রায়াল শুরু",
    desc: "If a student accepts your application, the trial period begins immediately. You can chat with them and arrange a few trial classes. No money changes hands yet.",
    tip: "Respond promptly — students appreciate fast, professional tutors.",
    color: "yellow",
  },
  {
    icon: CreditCard,
    title: "Pay Finder's Fee After Approval",
    bangla: "অনুমোদনের পরে ফি দিন",
    desc: "Once the student/guardian approves the trial, you pay a finder's fee equal to 50% of your proposed monthly rate (minimum ৳300). This unlocks the student's contact info instantly.",
    tip: "You only pay after the guardian is satisfied — zero risk during the trial.",
    color: "violet",
  },
];

const FAQS = [
  {
    q: "Do students have to pay anything?",
    a: "No. Students post requests, review applications, start trials, and approve tutors — all for free. The finder's fee is paid by the tutor only, after the trial is approved.",
  },
  {
    q: "How is the finder's fee calculated?",
    a: "It's 50% of the tutor's proposed monthly rate, with a minimum of ৳300. For example, if a tutor proposes ৳2,000/month, the finder's fee is ৳1,000.",
  },
  {
    q: "Can I post multiple tuition requests?",
    a: "Yes! Students can post unlimited tuition requests. You can have multiple open requests for different subjects at the same time.",
  },
  {
    q: "Is the finder's fee refundable?",
    a: "The finder's fee is non-refundable once paid and contact details are exchanged. However, you only pay after the student/guardian has explicitly approved the trial, so it's low-risk.",
  },
  {
    q: "How do I know a tutor is qualified?",
    a: "Tutors add their education, experience, and subjects to their profile. Our team verifies documents for the 'Verified' badge. Always check reviews and ratings before accepting.",
  },
  {
    q: "What payment methods are supported?",
    a: "We currently support bKash and Nagad. Both require only a mobile number and OTP confirmation — no card needed.",
  },
  {
    q: "Can I close my request after posting?",
    a: "Yes. You can close your request at any time from the request detail page. Closing a request prevents new applications but doesn't affect existing ones.",
  },
];

type ColorEntry = { bg: string; text: string; border: string };
const DEFAULT_COLOR: ColorEntry = { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" };
const colorMap: Record<string, ColorEntry> = {
  cyan: DEFAULT_COLOR,
  teal: { bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500/30" },
  emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  blue: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  violet: { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30" },
  yellow: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
};
function getColor(key: string): ColorEntry { return colorMap[key] ?? DEFAULT_COLOR; }

export default function HowItWorksPage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]" />

      <PublicNav />

      <main className="pt-28 pb-24 px-6">
        <div className="mx-auto max-w-5xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">How It Works</span>
            <h1 className="mt-3 text-5xl font-bold">কীভাবে কাজ করে?</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, transparent process designed so that only serious students and tutors connect.
              Students pay nothing. Tutors pay a finder&apos;s fee only after the guardian approves the trial.
            </p>
          </motion.div>

          {/* For Students */}
          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-10 flex items-center gap-3"
            >
              <div className="rounded-xl bg-cyan-500/20 p-2.5">
                <BookOpen className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">For Students</h2>
                <p className="text-sm text-muted-foreground">শিক্ষার্থীদের জন্য</p>
              </div>
            </motion.div>

            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-cyan-500/40 via-teal-500/40 to-violet-500/40 hidden md:block" />

              <div className="space-y-6">
                {STUDENT_STEPS.map((step, i) => {
                  const c = getColor(step.color);
                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-6 md:ml-4"
                    >
                      <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.bg} z-10`}>
                        <step.icon className={`h-5 w-5 ${c.text}`} />
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs font-bold border border-white/20">
                          {i + 1}
                        </div>
                      </div>
                      <div className={`flex-1 glass-card rounded-2xl p-5 border ${c.border}`}>
                        <h3 className="font-semibold">{step.title} <span className="text-sm text-muted-foreground font-normal">· {step.bangla}</span></h3>
                        <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${c.bg} ${c.text}`}>
                          <Shield className="h-3 w-3" />
                          {step.tip}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* For Tutors */}
          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-10 flex items-center gap-3"
            >
              <div className="rounded-xl bg-emerald-500/20 p-2.5">
                <GraduationCap className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">For Tutors</h2>
                <p className="text-sm text-muted-foreground">টিউটরদের জন্য</p>
              </div>
            </motion.div>

            <div className="relative">
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-500/40 via-teal-500/40 to-violet-500/40 hidden md:block" />

              <div className="space-y-6">
                {TUTOR_STEPS.map((step, i) => {
                  const c = getColor(step.color);
                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-6 md:ml-4"
                    >
                      <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.bg} z-10`}>
                        <step.icon className={`h-5 w-5 ${c.text}`} />
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs font-bold border border-white/20">
                          {i + 1}
                        </div>
                      </div>
                      <div className={`flex-1 glass-card rounded-2xl p-5 border ${c.border}`}>
                        <h3 className="font-semibold">{step.title} <span className="text-sm text-muted-foreground font-normal">· {step.bangla}</span></h3>
                        <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${c.bg} ${c.text}`}>
                          <Shield className="h-3 w-3" />
                          {step.tip}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="mt-2 text-muted-foreground">সাধারণ প্রশ্ন ও উত্তর</p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              {FAQS.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <h3 className="font-semibold text-sm text-cyan-400">{faq.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center glass-card rounded-3xl p-12"
          >
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="mt-3 text-muted-foreground">Join thousands of students and tutors across Bangladesh.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup?role=STUDENT">
                <Button variant="gradient" size="lg" className="group">
                  Find a Tutor <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/signup?role=TUTOR">
                <Button variant="outline" size="lg">Become a Tutor</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
