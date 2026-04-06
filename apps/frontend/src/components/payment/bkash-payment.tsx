"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface BkashPaymentProps {
  amount: number;
  onInitiate: (phoneNumber: string, method: "BKASH") => Promise<{ id: string }>;
  onVerify: (otp: string) => Promise<{ success: boolean; contactUnlocked?: boolean }>;
  onResendOtp: () => Promise<{}>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BkashPayment({
  amount,
  onInitiate,
  onVerify,
  onResendOtp,
  onSuccess,
  onCancel,
}: BkashPaymentProps) {
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInitiate = async () => {
    if (!phoneNumber || !/^01[3-9]\d{8}$/.test(phoneNumber)) {
      setError("Please enter a valid bKash number (e.g., 01712345678)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onInitiate(phoneNumber, "BKASH");
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
        className="w-full max-w-[400px]"
      >
        {/* bKash styled modal */}
        <Card className="overflow-hidden bg-white shadow-2xl rounded-none border-0">
          {/* Header */}
          <div className="bg-white px-0 py-4 border-b border-gray-200">
            <div className="flex justify-center items-center">
              <img 
                src="https://scripts.sandbox.bka.sh/resources/img/bkash_payment_logo.png" 
                alt="bKash Payment" 
                className="h-12 object-contain"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center gap-2"><div class="text-[#E2136E] text-4xl font-bold">bKash</div><div class="text-[#E2136E] text-xl mt-2 font-light">Payment</div></div>';
                }}
              />
            </div>
          </div>

          <CardContent className="p-0">
            {/* Merchant Info */}
            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center p-1">
                  <img src="/cart-icon.png" alt="Cart" className="w-full h-full object-contain opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">TuitionMedia</p>
                  <p className="text-xs text-gray-400">Invoice: TM-{Math.floor(Math.random() * 10000)}</p>
                </div>
              </div>
              <div className="text-xl font-medium text-gray-700">
                ৳{amount}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === "phone" && (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-[#E2136E] p-6 text-center text-white relative" style={{ backgroundImage: 'url("https://scripts.sandbox.bka.sh/resources/img/bg.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="absolute inset-0 bg-[#E2136E]/90 mix-blend-multiply" />
                    
                    <div className="relative z-10 space-y-6">
                      <p className="text-[15px] font-medium">Your bKash Account number</p>
                      
                      <div>
                        <Input
                          type="tel"
                          placeholder="e.g 01XXXXXXXXX"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="h-12 text-center text-gray-800 bg-white border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg placeholder:text-gray-400"
                        />
                      </div>

                      <p className="text-xs">
                        By clicking on <span className="font-bold">Confirm</span>, you are agreeing to the <span className="underline cursor-pointer">terms & conditions</span>
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 text-sm text-center py-2 border-b border-red-100">
                      {error}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex grid-cols-2 text-sm font-bold text-gray-600 bg-[#EFEFEF]">
                    <button
                      onClick={onCancel}
                      className="w-1/2 py-4 hover:bg-gray-200 transition-colors"
                    >
                      CLOSE
                    </button>
                    <button
                      onClick={handleInitiate}
                      disabled={loading}
                      className="w-1/2 py-4 bg-[#D1D1D1] hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-500" /> : "CONFIRM"}
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="py-3 flex justify-center items-center gap-2 text-[#E2136E] font-bold bg-white">
                    <Phone className="h-4 w-4" fill="currentColor" />
                    <span className="text-lg">16247</span>
                  </div>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-[#E2136E] p-6 text-center text-white relative" style={{ backgroundImage: 'url("https://scripts.sandbox.bka.sh/resources/img/bg.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="absolute inset-0 bg-[#E2136E]/90 mix-blend-multiply" />
                    
                    <div className="relative z-10 space-y-6">
                      <div className="space-y-1">
                        <p className="text-sm">bKash Verification Code</p>
                        <p className="text-xs opacity-90">A 6-digit verification code has been sent to</p>
                        <p className="text-sm font-medium">{phoneNumber}</p>
                      </div>
                      
                      <div>
                        <Input
                          type="text"
                          placeholder="bKash Verification Code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className="h-12 text-center text-gray-800 bg-white border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg placeholder:text-gray-400"
                        />
                      </div>

                      <div className="flex justify-between text-xs px-2">
                        <button onClick={() => setStep("phone")} className="underline hover:text-white/80">Change Method</button>
                        <button onClick={handleResendOtp} disabled={loading} className="underline hover:text-white/80">Resend Code</button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 text-sm text-center py-2 border-b border-red-100">
                      {error}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex grid-cols-2 text-sm font-bold text-gray-600 bg-[#EFEFEF]">
                    <button
                      onClick={onCancel}
                      className="w-1/2 py-4 hover:bg-gray-200 transition-colors"
                    >
                      CLOSE
                    </button>
                    <button
                      onClick={handleVerify}
                      disabled={loading || otp.length !== 6}
                      className="w-1/2 py-4 bg-[#D1D1D1] hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-500" /> : "CONFIRM"}
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="py-3 flex justify-center items-center gap-2 text-[#E2136E] font-bold bg-white">
                    <Phone className="h-4 w-4" fill="currentColor" />
                    <span className="text-lg">16247</span>
                  </div>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center bg-white"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
                  >
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Payment Successful
                  </h3>
                  <p className="text-gray-600 mb-6">
                    ৳{amount} has been paid successfully
                  </p>
                  <Button
                    onClick={onSuccess}
                    className="w-full h-12 bg-[#E2136E] hover:bg-[#C0105E] text-white rounded-none"
                  >
                    Continue to Dashboard
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
