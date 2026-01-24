"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth";
import { useAuthStore } from "@/store";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-tps-charcoal text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tps-cyan/5 rounded-full blur-[120px]" />
      </div>

      {/* Header with Logo */}
      <div className="relative z-10 mb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tps-cyan to-tps-lilac flex items-center justify-center shadow-lg shadow-tps-cyan/25 mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h3l2-6 4 12 3-8h4" />
            </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to TPS</h1>
        <p className="text-tps-muted text-center max-w-xs">
            Your personal high-fidelity streaming server on the edge.
        </p>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-tps-surface backdrop-blur-xl border border-white/5 rounded-tps p-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tps-cyan to-tps-lilac opacity-50" />
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-tps-muted text-sm mt-8 opacity-60">
          Stream your music from anywhere, securely.
        </p>
      </div>
    </main>
  );
}
