import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Tutors in Bangladesh | TuitionMedia",
  description:
    "Browse qualified tutors across Bangladesh. Filter by subject, location, grade level, and teaching mode. Connect with verified tutors for home tuition or online lessons.",
  keywords: [
    "tutors Bangladesh",
    "home tuition Dhaka",
    "online tutor Bangladesh",
    "SSC HSC tutor",
    "private tutor Chittagong",
    "tutor Sylhet",
  ],
  openGraph: {
    title: "Find Your Perfect Tutor | TuitionMedia",
    description:
      "Discover qualified tutors across Bangladesh. Browse profiles, check ratings, and connect directly. Subject, location, grade, and mode filters.",
    type: "website",
    siteName: "TuitionMedia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Your Perfect Tutor | TuitionMedia",
    description:
      "Browse verified tutors across Bangladesh. Filter by subject, division, and grade level.",
  },
};

export default function TutorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
