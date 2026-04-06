import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/toaster";

export const metadata: Metadata = {
  title: "TuitionMedia — Connect Students & Tutors",
  description: "Find the perfect tutor or student. Post requests, apply, and learn together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
