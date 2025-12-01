"use client";

import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export function Loading({
  size = "md",
  text,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const content = (
    <div className="flex flex-col items-center gap-3">
      <Loader2
        className={clsx(sizeClasses[size], "text-primary-500 animate-spin")}
      />
      {text && <p className="text-dark-400 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-950 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={clsx("bg-dark-700 rounded animate-pulse", className)} />
  );
}

export function SongSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3">
      <Skeleton className="w-8 h-4" />
      <Skeleton className="w-12 h-12 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-12 h-4" />
    </div>
  );
}
