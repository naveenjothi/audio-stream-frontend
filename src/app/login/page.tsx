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
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary-600/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-sm mt-8">
          Stream your music from anywhere
        </p>
      </div>
    </main>
  );
}
