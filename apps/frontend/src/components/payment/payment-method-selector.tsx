"use client";

import { useState } from "react";
import { Check, Info, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BkashPayment } from "./bkash-payment";
import { NagadPayment } from "./nagad-payment";

type PaymentMethod = "BKASH" | "NAGAD";

interface PaymentMethodSelectorProps {
  amount: number;
  label?: string;
  sublabel?: string;
  onInitiate: (phoneNumber: string, method: PaymentMethod) => Promise<{ id: string }>;
  onVerify: (otp: string) => Promise<{ success: boolean }>;
  onResendOtp: () => Promise<{}>;
  onSuccess: () => void;
  onCancel: () => void;
  userType?: "student" | "tutor";
}

export function PaymentMethodSelector({
  amount,
  label,
  sublabel,
  onInitiate,
  onVerify,
  onResendOtp,
  onSuccess,
  onCancel,
  userType = "tutor",
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleInitiate = async (phoneNumber: string) => {
    if (!selectedMethod) throw new Error("No payment method selected");
    return onInitiate(phoneNumber, selectedMethod);
  };

  if (selectedMethod === "BKASH") {
    return (
      <BkashPayment
        amount={amount}
        onInitiate={handleInitiate}
        onVerify={onVerify}
        onResendOtp={onResendOtp}
        onSuccess={onSuccess}
        onCancel={() => setSelectedMethod(null)}
      />
    );
  }

  if (selectedMethod === "NAGAD") {
    return (
      <NagadPayment
        amount={amount}
        onInitiate={handleInitiate}
        onVerify={onVerify}
        onResendOtp={onResendOtp}
        onSuccess={onSuccess}
        onCancel={() => setSelectedMethod(null)}
      />
    );
  }

  const displayLabel = label ?? (userType === "tutor" ? "Finder's Fee" : "Platform Fee");
  const displaySublabel = sublabel ?? (userType === "tutor"
    ? "50% of one month's rate — paid only after trial approval"
    : "One-time connection fee");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="glass-card w-full max-w-md rounded-2xl shadow-2xl border-white/10">
        <CardContent className="p-6 space-y-5">
          <div className="text-center">
            <h2 className="text-xl font-bold">Pay Finder&apos;s Fee</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Unlock the student&apos;s contact info after trial approval
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{displayLabel}</p>
            <p className="text-4xl font-bold text-emerald-400">৳{amount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{displaySublabel}</p>
          </div>

          <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-3 flex gap-2 text-xs text-cyan-300">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>This fee is only charged after the student/guardian approves the trial classes. No upfront cost to apply.</span>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Choose payment method</p>
            <button
              onClick={() => setSelectedMethod("BKASH")}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-[#E2136E]/50 hover:bg-[#E2136E]/5 transition-all group"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E2136E] text-white font-bold text-lg shadow-lg shadow-[#E2136E]/20">
                b
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">bKash</p>
                <p className="text-xs text-muted-foreground">Bangladesh&apos;s #1 mobile money</p>
              </div>
              <div className="h-5 w-5 rounded-full border border-white/20 group-hover:border-[#E2136E] flex items-center justify-center transition-colors">
                <span className="h-2.5 w-2.5 rounded-full group-hover:bg-[#E2136E] transition-colors" />
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod("NAGAD")}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-[#F6921E]/50 hover:bg-[#F6921E]/5 transition-all group"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F6921E] text-white font-bold text-lg shadow-lg shadow-[#F6921E]/20">
                N
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">Nagad</p>
                <p className="text-xs text-muted-foreground">Post Office digital wallet</p>
              </div>
              <div className="h-5 w-5 rounded-full border border-white/20 group-hover:border-[#F6921E] flex items-center justify-center transition-colors">
                <span className="h-2.5 w-2.5 rounded-full group-hover:bg-[#F6921E] transition-colors" />
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
            <Shield className="h-3 w-3" />
            <span>OTP-secured payment simulation</span>
          </div>

          <button
            onClick={onCancel}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
