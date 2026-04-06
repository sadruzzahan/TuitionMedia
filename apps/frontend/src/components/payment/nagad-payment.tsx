"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface NagadPaymentProps {
  amount: number;
  onInitiate: (phoneNumber: string, method: "NAGAD") => Promise<{ id: string }>;
  onVerify: (otp: string) => Promise<{ success: boolean; contactUnlocked?: boolean }>;
  onResendOtp: () => Promise<{}>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NagadPayment({
  amount,
  onInitiate,
  onVerify,
  onResendOtp,
  onSuccess,
  onCancel,
}: NagadPaymentProps) {
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInitiate = async () => {
    if (!phoneNumber || !/^01[3-9]\d{8}$/.test(phoneNumber)) {
      setError("Please enter a valid Nagad number (e.g., 01712345678)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onInitiate(phoneNumber, "NAGAD");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await onVerify(otp);
      if (result.success) {
        setStep("success");
        setTimeout(onSuccess, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await onResendOtp();
      setError("OTP resent successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-[380px]"
      >
        <Card className="overflow-hidden bg-[#AA1614] shadow-2xl rounded-sm border-0 text-white relative">
          {/* Header language toggle */}
          <div className="absolute top-4 right-4 flex text-xs font-bold bg-transparent border border-white/30 rounded-sm overflow-hidden">
            <div className="px-2 py-1 bg-[#AA1614] text-white">বাংলা</div>
            <div className="px-2 py-1 bg-white text-[#AA1614]">Eng</div>
          </div>

          <CardContent className="p-8 pt-12 text-center min-h-[600px] flex flex-col">
            {/* Merchant Info */}
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 mb-2">
                <img src="/cart-icon.png" alt="Cart" className="w-full h-full object-contain filter invert" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
              <h2 className="text-xl font-bold">TuitionMedia</h2>
            </div>

            {/* Invoice Details */}
            <div className="text-left space-y-3 mb-12 text-[15px]">
              <div className="flex gap-2">
                <span className="font-bold whitespace-nowrap">Invoice No:</span>
                <span className="break-all opacity-90">TM{Math.floor(Math.random() * 10000000000)}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">Total Amount:</span>
                <span>BDT {amount}.00</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">Charge:</span>
                <span>BDT 0</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === "phone" && (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col flex-grow justify-between"
                >
                  <div className="space-y-4">
                    <p className="font-bold text-[15px]">Your Nagad Account Number</p>
                    
                    <div className="flex justify-center items-center gap-1">
                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-10 text-center tracking-[0.5em] text-gray-800 bg-white border-0 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
                        maxLength={11}
                      />
                    </div>
                    
                    {error && <p className="text-sm text-red-200 mt-2">{error}</p>}
                  </div>

                  <div className="mt-8 space-y-6">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <input type="checkbox" id="terms" className="rounded-none border-white accent-white" />
                      <label htmlFor="terms">I agree to the <span className="font-bold underline">terms and</span><br/><span className="font-bold underline">conditions</span></label>
                    </div>

                    <div className="flex gap-4 px-2">
                      <button
                        onClick={handleInitiate}
                        disabled={loading}
                        className="flex-1 py-2 bg-white text-[#AA1614] font-bold rounded-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Proceed"}
                      </button>
                      <button
                        onClick={onCancel}
                        className="flex-1 py-2 bg-white text-[#AA1614] font-bold rounded-sm hover:bg-gray-100 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col flex-grow justify-between"
                >
                  <div className="space-y-4">
                    <p className="font-bold text-[15px]">Enter Verification Code</p>
                    <p className="text-sm opacity-90">Code sent to: {phoneNumber}</p>
                    
                    <div className="flex justify-center items-center">
                      <Input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="h-10 text-center tracking-[1em] text-gray-800 bg-white border-0 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-lg w-3/4"
                        maxLength={6}
                      />
                    </div>

                    {error && <p className="text-sm text-red-200 mt-2">{error}</p>}
                  </div>

                  <div className="mt-8 space-y-6">
                    <button onClick={handleResendOtp} disabled={loading} className="text-sm underline">
                      Resend Code
                    </button>

                    <div className="flex gap-4 px-2">
                      <button
                        onClick={handleVerify}
                        disabled={loading || otp.length !== 6}
                        className="flex-1 py-2 bg-white text-[#AA1614] font-bold rounded-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Proceed"}
                      </button>
                      <button
                        onClick={() => setStep("phone")}
                        className="flex-1 py-2 bg-white text-[#AA1614] font-bold rounded-sm hover:bg-gray-100 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col flex-grow items-center justify-center mt-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#AA1614]"
                  >
                    <CheckCircle className="h-12 w-12" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">
                    Success!
                  </h3>
                  <p className="mb-8 opacity-90">
                    Payment of BDT {amount} completed
                  </p>
                  <Button
                    onClick={onSuccess}
                    className="w-full h-12 bg-white hover:bg-gray-100 text-[#AA1614] font-bold rounded-sm"
                  >
                    Continue to Dashboard
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Logo */}
            <div className="mt-8 flex justify-center pb-4">
              <img 
                src="https://download.logo.wine/logo/nagad/nagad-logo.png" 
                alt="Nagad" 
                className="h-16 object-contain filter invert brightness-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="text-3xl font-bold tracking-wider">নগদ</div>';
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
