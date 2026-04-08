"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ContactInfo = {
  email: string | null;
  phone: string | null;
} | null;

export function ContactSection({ tutorId }: { tutorId: string }) {
  const [contact, setContact] = useState<ContactInfo>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("tuitionmedia_token") : null;
    setIsLoggedIn(!!token);

    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`/api/tutors/${tutorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.contact) setContact(data.contact);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tutorId]);

  if (loading) {
    return (
      <div className="w-full h-12 rounded-lg bg-white/5 animate-pulse" />
    );
  }

  if (contact) {
    return (
      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 space-y-1.5">
        <p className="text-xs font-medium text-emerald-400 mb-2">Contact Info</p>
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
            <Mail className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            {contact.email}
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
            <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            {contact.phone}
          </a>
        )}
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
        <Lock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
        <p className="text-xs text-muted-foreground">Connect to reveal contact details</p>
      </div>
    );
  }

  return (
    <Link href="/login" className="w-full">
      <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
        <Lock className="h-3.5 w-3.5" />
        Log in to see contact info
      </Button>
    </Link>
  );
}
