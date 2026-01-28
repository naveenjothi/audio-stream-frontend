"use client";

import { useToast as useShadcnToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

export function useToast() {
  const { toast, dismiss } = useShadcnToast();

  const addToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
    duration = 5000,
  ) => {
    const variant = type === "error" ? "destructive" : "default";
    // Map types to variants or styles if needed. Shadcn default toast is simple.
    // We can use 'className' to style based on type if we want to keep colors.

    let className = "";
    if (type === "success")
      className =
        "bg-green-500/10 border-green-500/20 text-green-900 dark:text-green-100";
    if (type === "warning")
      className =
        "bg-yellow-500/10 border-yellow-500/20 text-yellow-900 dark:text-yellow-100";
    if (type === "info")
      className =
        "bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-100";

    toast({
      description: message,
      variant: variant,
      duration: duration,
      className: className,
    });
  };

  const removeToast = (id: string) => {
    dismiss(id);
  };

  return { addToast, removeToast, toasts: [] }; // toasts array is not easily accessible in the same way, returning empty for now
}
