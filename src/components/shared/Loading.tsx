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
  circle?: boolean;
}

export function Skeleton({ className, circle }: SkeletonProps) {
  return (
    <div 
      className={clsx(
        "relative overflow-hidden bg-white/5 animate-pulse",
        circle ? "rounded-full" : "rounded-lg",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export function SongSkeleton() {
  return (
    <div className="w-full flex items-center gap-4 p-3 rounded-xl">
      <div className="w-8 flex justify-center">
        <Skeleton className="w-4 h-4" />
      </div>
      <Skeleton className="w-12 h-12 flex-shrink-0 rounded-lg" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="w-12 flex justify-end">
        <Skeleton className="w-10 h-4" />
      </div>
    </div>
  );
}

export function SongCardSkeleton() {
    return (
        <div className="p-3 rounded-2xl bg-transparent space-y-4">
            <div className="relative aspect-square mb-4 rounded-xl overflow-hidden">
                <Skeleton className="w-full h-full" />
            </div>
            <div className="flex items-start justify-between gap-1">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
            </div>
        </div>
    );
}

export function ArtistListItemSkeleton() {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-12" />
        </div>
    );
}

export function TopArtistsSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <ArtistListItemSkeleton key={i} />
            ))}
        </div>
    );
}

export function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-3xl bg-tps-surface border border-white/5 h-32 flex flex-col justify-between">
                    <Skeleton className="w-6 h-6 rounded-lg mb-4" />
                    <div className="space-y-1">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}
