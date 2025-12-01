"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SeekBarProps {
  currentTime?: number;
  duration?: number;
  buffered?: number;
  onSeek?: (time: number) => void;
  isLoading?: boolean;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function SeekBar({
  currentTime = 0,
  duration = 0,
  buffered = 0,
  onSeek,
  isLoading = false,
}: SeekBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const getPositionFromEvent = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!barRef.current) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      return Math.max(0, Math.min(1, x / rect.width));
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const position = getPositionFromEvent(e);
    setDragPosition(position);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      const position = getPositionFromEvent(e);
      setHoverPosition(position);

      if (isDragging) {
        setDragPosition(position);
      }
    },
    [isDragging, getPositionFromEvent]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (isDragging && onSeek) {
        const position = getPositionFromEvent(e);
        onSeek(position * duration);
      }
      setIsDragging(false);
      setDragPosition(null);
    },
    [isDragging, duration, onSeek, getPositionFromEvent]
  );

  const handleMouseLeave = () => {
    setHoverPosition(null);
    if (!isDragging) {
      setDragPosition(null);
    }
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalMouseUp = (e: MouseEvent) => handleMouseUp(e);

      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;
  const displayProgress = dragPosition !== null ? dragPosition * 100 : progress;
  const displayTime =
    dragPosition !== null ? dragPosition * duration : currentTime;

  return (
    <div className="flex items-center gap-3 w-full group">
      <span className="text-xs text-zinc-400 font-mono w-10 text-right tabular-nums">
        {formatTime(displayTime)}
      </span>

      <div
        ref={barRef}
        className="relative flex-1 h-8 flex items-center cursor-pointer group/bar"
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => handleMouseMove(e)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background track */}
        <div className="absolute inset-x-0 h-1 bg-zinc-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
          {/* Buffered indicator */}
          <div
            className="absolute inset-y-0 left-0 bg-white/10 rounded-full transition-all duration-150"
            style={{ width: `${bufferedProgress}%` }}
          />

          {/* Loading shimmer effect */}
          {isLoading && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent animate-shimmer" />
            </div>
          )}

          {/* Progress bar */}
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all bg-gradient-to-r from-primary-600 to-primary-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
              !isDragging && "duration-100"
            )}
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        {/* Hover preview time */}
        {hoverPosition !== null && !isDragging && (
          <div
            className="absolute -top-6 transform -translate-x-1/2 px-2 py-1 bg-zinc-900/90 backdrop-blur border border-white/10 rounded text-xs text-white font-mono pointer-events-none opacity-0 group-hover/bar:opacity-100 transition-opacity shadow-xl z-20"
            style={{ left: `${hoverPosition * 100}%` }}
          >
            {formatTime(hoverPosition * duration)}
          </div>
        )}

        {/* Scrubber handle */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transform -translate-x-1/2 transition-all z-10",
            "opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100",
            isDragging && "opacity-100 scale-125 ring-4 ring-primary-500/30 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
          )}
          style={{ left: `${displayProgress}%` }}
        >
            <div className="absolute inset-0 bg-primary-500 rounded-full opacity-20 animate-ping" />
        </div>
      </div>

      <span className="text-xs text-zinc-400 font-mono w-10 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  );
}
