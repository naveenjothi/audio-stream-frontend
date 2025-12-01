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
import { useDeviceStore } from "@/store";
import { verifyPairCode } from "@/lib/api";
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
      const { data, error } = await verifyPairCode(code);

      if (error || !data?.success) {
        setStatus("error");
        setErrorMessage(error || "Invalid pairing code");
        setPairingError(error || "Invalid pairing code");
        return;
      }

      setStatus("success");
      if (data.device) {
        setPairedDevice(data.device);
        setConnectionStatus("connected");
      }
      addToast("Device paired successfully!", "success");

      // Redirect to dashboard after delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMessage("Failed to verify code");
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
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 p-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </header>

        {/* Main content */}
        <main className="relative z-10 flex flex-col items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            {/* Title */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={cn(
                  "inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-colors",
                  status === "success" && "bg-primary-500/20",
                  status === "error" && "bg-red-500/20",
                  status === "verifying" && "bg-primary-500/10",
                  status === "idle" && "bg-zinc-800"
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

              <h1 className="text-3xl font-bold mb-2">
                {status === "success"
                  ? "Device Connected!"
                  : "Pair Your Device"}
              </h1>
              <p className="text-zinc-400">
                {status === "success"
                  ? "Redirecting to dashboard..."
                  : status === "error"
                  ? errorMessage
                  : "Enter the 6-digit code shown on your mobile device"}
              </p>
            </div>

            {/* Pairing card */}
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center">
                        <Monitor className="w-8 h-8 text-zinc-400" />
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 60 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="h-0.5 bg-gradient-to-r from-primary-500 to-primary-300 rounded-full"
                      />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="w-16 h-16 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center"
                      >
                        <Smartphone className="w-8 h-8 text-primary-500" />
                      </motion.div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-primary-500 mb-4">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Connection Established
                      </span>
                    </div>

                    <p className="text-zinc-400 text-sm">
                      Redirecting to dashboard...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Code input */}
                    <div className="flex justify-center gap-2 sm:gap-3 mb-8">
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
                              "w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-zinc-800/50 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all",
                              status === "error"
                                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                : digit
                                ? "border-primary-500/50 focus:border-primary-500 focus:ring-primary-500/20"
                                : "border-zinc-700 focus:border-primary-500 focus:ring-primary-500/20"
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
                        className="flex items-center justify-center gap-2 mb-6"
                      >
                        <button
                          onClick={handleReset}
                          className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2"
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
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying code...</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Instructions */}
                    {status === "idle" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                            <QrCode className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">
                              Step 1
                            </p>
                            <p className="text-xs text-zinc-400">
                              Open SoundStream on your phone
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                            <Smartphone className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">
                              Step 2
                            </p>
                            <p className="text-xs text-zinc-400">
                              Tap &quot;Connect to Browser&quot; in settings
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                            <Wifi className="w-5 h-5 text-primary-500" />
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">
                              Step 3
                            </p>
                            <p className="text-xs text-zinc-400">
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
            <div className="mt-8 text-center">
              <p className="text-zinc-500 text-sm mb-4">Supported devices</p>
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-1 text-zinc-400">
                  <Smartphone className="w-6 h-6" />
                  <span className="text-xs">Phone</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-zinc-400">
                  <Tablet className="w-6 h-6" />
                  <span className="text-xs">Tablet</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-zinc-400">
                  <Monitor className="w-6 h-6" />
                  <span className="text-xs">Desktop</span>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </AuthGuard>
  );
}
