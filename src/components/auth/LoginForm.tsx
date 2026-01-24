"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { logOut, signInWithGoogle } from "@/lib/firebase";
import { createUser, getUserByFirebaseId } from "@/services/api/catalog";
import { FuturisticCard, GlowButton, useToast } from "@/components/shared";
import {  User } from "firebase/auth";

function LoginFormContent({ redirect }: { redirect: string }) { 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const router = useRouter();

  const createDbUserIfNotExists = async (user: User): Promise<boolean> => {
    try {
      const dbUser = await getUserByFirebaseId(user.uid);
      if (!dbUser) {
        const nameParts = user.displayName?.split(" ") || [];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
  
        await createUser({
          email: user.email ?? undefined,
          firebase_id: user.uid,
          first_name: firstName,
          last_name: lastName,
          mobile: user.phoneNumber ?? undefined,
          photo_url: user.photoURL ?? undefined,
        });
      }
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      addToast("Error creating user", "error");
      await logOut();
      return false;
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
      const success = await createDbUserIfNotExists(user);
      if (success) {
        addToast("Signed In successfully", "success");
        router.push(redirect);
      } else {
        setIsLoading(false);
      }
    }
  };

  return (
    <FuturisticCard variant="glass" className="w-full max-w-md p-8 animate-float">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-pulse-slow">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {/* Google Login */}
      <GlowButton
        onClick={handleGoogleLogin}
        disabled={isLoading}
        variant="secondary"
        className="w-full flex items-center justify-center gap-3"
        size="lg"
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
      </GlowButton>
    </FuturisticCard>
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
    <div className="w-full max-w-md animate-pulse p-8 rounded-2xl bg-zinc-900/40 border border-white/5">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-800" />
        <div className="h-8 w-48 mx-auto bg-zinc-800 rounded mb-2" />
        <div className="h-4 w-64 mx-auto bg-zinc-800 rounded" />
      </div>
      <div className="space-y-6">
        <div className="h-14 bg-zinc-800 rounded-xl" />
        <div className="h-14 bg-zinc-800 rounded-xl" />
        <div className="h-14 bg-zinc-800 rounded-xl" />
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
