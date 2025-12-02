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
  const { toast } = useShadcnToast();

  const addToast = (message: string, type: "success" | "error" | "info" | "warning" = "info", duration = 5000) => {
    const variant = type === "error" ? "destructive" : "default";
    // Map types to variants or styles if needed. Shadcn default toast is simple.
    // We can use 'className' to style based on type if we want to keep colors.
    
    let className = "";
    if (type === "success") className = "bg-green-500/10 border-green-500/20 text-white";
    if (type === "warning") className = "bg-yellow-500/10 border-yellow-500/20 text-white";
    if (type === "info") className = "bg-blue-500/10 border-blue-500/20 text-white";
    
    toast({
      description: message,
      variant: variant,
      duration: duration,
      className: className,
    });
  };

  const removeToast = (id: string) => {
    // Shadcn toast returns an object with dismiss(), but here we don't have the ID easily mapped 
    // unless we store the return value of toast(). 
    // For now, we might ignore removeToast or implement a more complex wrapper if needed.
    // Most usages probably just fire and forget.
    const { dismiss } = useShadcnToast();
    dismiss(id);
  };

  return { addToast, removeToast, toasts: [] }; // toasts array is not easily accessible in the same way, returning empty for now
}
