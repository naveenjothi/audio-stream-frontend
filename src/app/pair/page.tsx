"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Smartphone,
  ArrowLeft,
  Loader2,
  Check,
  X,
  Wifi,
  RefreshCw,
  Monitor,
  Tablet,
  QrCode,
  Zap,
} from "lucide-react";
import { AuthGuard } from "@/components/auth";
import { useToast } from "@/components/shared";
import { useDeviceStore, useAuthStore } from "@/store";
import { connectWithPairCode, registerDevice } from "@/services/api/signaling";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function PairPage() {
  const [pairCode, setPairCode] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();
  const { addToast } = useToast();
  const {
    setPairedDevice,
    setIsPairing,
    setPairingError,
    setConnectionStatus,
  } = useDeviceStore();

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...pairCode];
    newCode[index] = value;
    setPairCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (
      newCode.every((digit) => digit !== "") &&
      newCode.join("").length === 6
    ) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pairCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setPairCode(newCode);
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (code: string) => {
    setStatus("verifying");
    setErrorMessage("");
    setIsPairing(true);

    try {
      // First register this browser as a device
      const browserDevice = await registerDevice({
        device_name: navigator.userAgent.substring(0, 50),
        device_type: "browser",
        is_source: false,
      });

      // Then connect using the pair code
      const pairing = await connectWithPairCode(browserDevice.id, code);

      if (pairing.status === "paired") {
        setStatus("success");
        setConnectionStatus("connected");
        addToast("Device paired successfully!", "success");

        // Redirect to dashboard after delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setStatus("error");
        setErrorMessage("Pairing failed - invalid or expired code");
        setPairingError("Pairing failed");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Failed to verify code");
      setPairingError("Failed to verify code");
    } finally {
      setIsPairing(false);
    }
  };

  const handleReset = () => {
    setPairCode(["", "", "", "", "", ""]);
    setStatus("idle");
    setErrorMessage("");
    inputRefs.current[0]?.focus();
  };

  const getStatusIcon = () => {
    switch (status) {
      case "verifying":
        return <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />;
      case "success":
        return <Check className="w-8 h-8 text-primary-500" />;
      case "error":
        return <X className="w-8 h-8 text-red-500" />;
      default:
        return <Wifi className="w-8 h-8 text-zinc-400" />;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-tps-charcoal text-white relative flex flex-col overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-tps-cyan/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-tps-lilac/5 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <header className="w-full p-6 z-20 flex-shrink-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-tps-muted hover:text-white transition-colors group"
          >
            <div className="p-2 rounded-full group-hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </header>

        {/* Main content */}
        <main className="relative z-10 w-full max-w-md px-6 mx-auto flex-grow flex flex-col justify-center pb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Title */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={cn(
                  "inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 transition-all shadow-xl",
                  status === "success" && "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20",
                  status === "error" && "bg-red-500/10 text-red-500 shadow-red-500/20",
                  status === "verifying" && "bg-tps-cyan/10 text-tps-cyan shadow-tps-cyan/20 animate-pulse",
                  status === "idle" && "bg-tps-surface border border-white/5 text-tps-muted"
                )}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={status}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    {getStatusIcon()}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                {status === "success" ? (
                    <span className="text-emerald-400">Device Connected</span>
                ) : (
                    <>
                        Pair Your <span className="text-gradient">Device</span>
                    </>
                )}
              </h1>
              <p className="text-tps-muted text-lg">
                {status === "success"
                  ? "Redirecting to dashboard..."
                  : status === "error"
                  ? errorMessage
                  : "Enter the 6-digit code shown on your mobile device"}
              </p>
            </div>

            {/* Pairing card */}
            <div className="bg-tps-surface backdrop-blur-xl border border-white/5 rounded-tps p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
               {/* Subtle border gradient on hover */}
               <div className="absolute inset-0 rounded-tps border border-white/0 group-hover:border-tps-cyan/20 transition-colors pointer-events-none" />

              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <div className="flex items-center justify-center gap-6 mb-8">
                      <div className="w-20 h-20 rounded-2xl bg-tps-charcoal border border-white/5 flex items-center justify-center shadow-inner">
                        <Monitor className="w-10 h-10 text-tps-muted" />
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 80 }}
                        transition={{ delay: 0.3, duration: 0.6, ease: "circOut" }}
                        className="h-1 bg-gradient-to-r from-tps-cyan to-tps-lilac rounded-full shadow-[0_0_10px_rgba(64,224,255,0.5)]"
                      />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-tps-cyan to-tps-lilac flex items-center justify-center shadow-lg shadow-tps-cyan/20 text-white"
                      >
                        <Smartphone className="w-10 h-10" />
                      </motion.div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-emerald-400 mb-2">
                      <Zap className="w-5 h-5 fill-current" />
                      <span className="text-lg font-bold">
                        Connection Established
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Code input */}
                    <div className="flex justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 scale-90 sm:scale-100 origin-center transition-transform">
                      {pairCode.map((digit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <input
                            ref={(el) => {
                              inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleCodeChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            disabled={status === "verifying"}
                            className={cn(
                              "w-10 h-14 sm:w-14 sm:h-20 text-center text-2xl sm:text-3xl font-bold rounded-xl outline-none transition-all duration-300",
                              "bg-tps-charcoal/50 border border-white/10 shadow-inner text-white",
                              status === "error"
                                ? "border-red-500/50 text-red-400 focus:ring-2 focus:ring-red-500/30"
                                : digit
                                ? "border-tps-cyan/50 shadow-[0_0_15px_-5px_rgba(64,224,255,0.3)]"
                                : "focus:border-tps-cyan focus:shadow-[0_0_15px_-5px_rgba(64,224,255,0.3)] focus:ring-1 focus:ring-tps-cyan/50"
                            )}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Error state */}
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-2 mb-8"
                      >
                        <button
                          onClick={handleReset}
                          className="px-6 py-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium transition-colors flex items-center gap-2 border border-red-500/20"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Try Again
                        </button>
                      </motion.div>
                    )}

                    {/* Verifying state */}
                    {status === "verifying" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3 mb-8"
                      >
                        <div className="flex items-center gap-3 text-tps-cyan">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="font-medium tracking-wide">Verifying code...</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Instructions */}
                    {status === "idle" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-12 h-12 rounded-xl bg-tps-charcoal flex items-center justify-center flex-shrink-0 border border-white/5">
                            <QrCode className="w-6 h-6 text-tps-muted" />
                          </div>
                          <div>
                            <p className="text-white font-semibold mb-0.5">
                              Step 1
                            </p>
                            <p className="text-sm text-tps-muted">
                              Open <span className="text-tps-cyan font-medium">TPS</span> on your phone
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-12 h-12 rounded-xl bg-tps-charcoal flex items-center justify-center flex-shrink-0 border border-white/5">
                            <Smartphone className="w-6 h-6 text-tps-muted" />
                          </div>
                          <div>
                            <p className="text-white font-semibold mb-0.5">
                              Step 2
                            </p>
                            <p className="text-sm text-tps-muted">
                              Tap &quot;Connect to Browser&quot; in settings
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-tps-cyan/10 border border-tps-cyan/20 hover:bg-tps-cyan/15 transition-colors">
                          <div className="w-12 h-12 rounded-xl bg-tps-cyan text-tps-charcoal flex items-center justify-center flex-shrink-0 shadow-lg shadow-tps-cyan/20">
                            <Wifi className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-white font-semibold mb-0.5">
                              Step 3
                            </p>
                            <p className="text-sm text-tps-cyan/80 font-medium">
                              Enter the 6-digit code shown
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Device types */}
            <div className="mt-12 text-center">
              <p className="text-tps-muted text-sm uppercase tracking-widest font-bold mb-6 opacity-60">Supported Devices</p>
              <div className="flex items-center justify-center gap-10">
                <div className="group flex flex-col items-center gap-3 text-tps-muted hover:text-white transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-tps-surface border border-white/5 flex items-center justify-center group-hover:border-tps-cyan/30 group-hover:shadow-[0_0_15px_-5px_rgba(64,224,255,0.3)] transition-all">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium">iOS / Android</span>
                </div>
                <div className="group flex flex-col items-center gap-3 text-tps-muted hover:text-white transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-tps-surface border border-white/5 flex items-center justify-center group-hover:border-tps-cyan/30 group-hover:shadow-[0_0_15px_-5px_rgba(64,224,255,0.3)] transition-all">
                    <Tablet className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium">Tablet</span>
                </div>
                <div className="group flex flex-col items-center gap-3 text-tps-muted hover:text-white transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-tps-surface border border-white/5 flex items-center justify-center group-hover:border-tps-cyan/30 group-hover:shadow-[0_0_15px_-5px_rgba(64,224,255,0.3)] transition-all">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium">Desktop</span>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </AuthGuard>
  );
}
