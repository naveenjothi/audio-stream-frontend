"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase";
import clsx from "clsx";

function LoginFormContent({ redirect }: { redirect: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { user, error: authError } = await signInWithEmail(email, password);

    if (authError) {
      setError(getErrorMessage(authError.message));
      setIsLoading(false);
      return;
    }

    if (user) {
      router.push(redirect);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    const { user, error: authError } = await signInWithGoogle();

    if (authError) {
      setError(getErrorMessage(authError.message));
      setIsLoading(false);
      return;
    }

    if (user) {
      router.push(redirect);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-zinc-400">Sign in to your audio streaming account</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input pl-11"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pl-11 pr-11"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={clsx(
            "w-full btn-primary py-3 text-lg font-semibold",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-zinc-950 text-zinc-500">
            or continue with
          </span>
        </div>
      </div>

      {/* Google Login */}
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className={clsx(
          "w-full btn-secondary py-3 flex items-center justify-center gap-3",
          isLoading && "opacity-70 cursor-not-allowed"
        )}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
    </div>
  );
}

function LoginFormWithParams() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  return <LoginFormContent redirect={redirect} />;
}

export function LoginForm() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginFormWithParams />
    </Suspense>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800" />
        <div className="h-8 w-48 mx-auto bg-zinc-800 rounded mb-2" />
        <div className="h-4 w-64 mx-auto bg-zinc-800 rounded" />
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-zinc-800 rounded-lg" />
        <div className="h-12 bg-zinc-800 rounded-lg" />
        <div className="h-12 bg-zinc-800 rounded-lg" />
      </div>
    </div>
  );
}

function getErrorMessage(errorCode: string): string {
  if (errorCode.includes("user-not-found")) {
    return "No account found with this email address.";
  }
  if (errorCode.includes("wrong-password")) {
    return "Incorrect password. Please try again.";
  }
  if (errorCode.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (errorCode.includes("too-many-requests")) {
    return "Too many failed attempts. Please try again later.";
  }
  if (errorCode.includes("popup-closed-by-user")) {
    return "Sign-in popup was closed. Please try again.";
  }
  return "An error occurred. Please try again.";
}
