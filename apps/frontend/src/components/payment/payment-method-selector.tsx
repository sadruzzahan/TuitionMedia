"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BkashPayment } from "./bkash-payment";
import { NagadPayment } from "./nagad-payment";
import { PLATFORM_FEE_BDT } from "@/lib/bangladesh-data";

type PaymentMethod = "BKASH" | "NAGAD";

interface PaymentMethodSelectorProps {
  amount?: number;
  onInitiate: (phoneNumber: string, method: PaymentMethod) => Promise<{ id: string }>;
  onVerify: (otp: string) => Promise<{ success: boolean; contactUnlocked?: boolean }>;
  onResendOtp: () => Promise<{}>;
  onSuccess: () => void;
  onCancel: () => void;
  userType: "student" | "tutor";
}

export function PaymentMethodSelector({
  amount = PLATFORM_FEE_BDT,
  onInitiate,
  onVerify,
  onResendOtp,
  onSuccess,
  onCancel,
  userType,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleInitiate = async (phoneNumber: string) => {
    if (!selectedMethod) throw new Error("No payment method selected");
    const result = await onInitiate(phoneNumber, selectedMethod);
    return result;
  };

  const handleVerify = async (otp: string) => {
    return onVerify(otp);
  };

  const handleResendOtp = async () => {
    const result = await onResendOtp();
    return result;
  };

  if (selectedMethod === "BKASH") {
    return (
      <BkashPayment
        amount={amount}
        onInitiate={handleInitiate}
        onVerify={handleVerify}
        onResendOtp={handleResendOtp}
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
        onVerify={handleVerify}
        onResendOtp={handleResendOtp}
        onSuccess={onSuccess}
        onCancel={() => setSelectedMethod(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 rounded-2xl shadow-2xl">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl font-bold">Select Payment Method</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pay ৳{amount} platform fee to unlock contact details
            </p>
          </div>

          {/* Amount Display */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-4 text-center border border-cyan-500/20">
            <p className="text-sm text-muted-foreground mb-1">Platform Fee</p>
            <p className="text-3xl font-bold text-cyan-400">৳ {amount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {userType === "student" 
                ? "Pay to accept tutor application" 
                : "Pay to confirm the tuition request"}
            </p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            {/* bKash */}
            <button
              onClick={() => setSelectedMethod("BKASH")}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#E2136E] hover:bg-[#E2136E]/5 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E2136E] text-white font-bold text-xl">
                b
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">bKash</p>
                <p className="text-sm text-muted-foreground">Mobile Financial Service</p>
              </div>
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-[#E2136E] flex items-center justify-center">
                {selectedMethod === "BKASH" && (
                  <Check className="h-3 w-3 text-[#E2136E]" />
                )}
              </div>
            </button>

            {/* Nagad */}
            <button
              onClick={() => setSelectedMethod("NAGAD")}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#F6921E] hover:bg-[#F6921E]/5 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F6921E] text-white font-bold text-xl">
                N
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Nagad</p>
                <p className="text-sm text-muted-foreground">Mobile Financial Service</p>
              </div>
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-[#F6921E] flex items-center justify-center">
                {selectedMethod === "NAGAD" && (
                  <Check className="h-3 w-3 text-[#F6921E]" />
                )}
              </div>
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Secure Payment</p>
            <p className="text-xs opacity-80">
              Your payment information is encrypted and secure. 
              Contact details will be unlocked after successful payment.
            </p>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
