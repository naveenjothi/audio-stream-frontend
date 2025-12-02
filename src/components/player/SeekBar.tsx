"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

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
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleValueChange = (value: number[]) => {
    if (onSeek) {
      onSeek(value[0]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current || !duration) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    setHoverPosition(percentage * 100);
    setHoverTime(percentage * duration);
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
    setHoverTime(null);
  };

  const bufferedPercentage = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 w-full group">
      <span className="text-xs text-zinc-400 font-mono w-10 text-right tabular-nums">
        {formatTime(currentTime)}
      </span>

      <div 
        className="relative flex-1 flex items-center h-8"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        ref={sliderRef}
      >
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleValueChange}
          buffered={bufferedPercentage}
          className="cursor-pointer"
        />

        {/* Hover tooltip */}
        {hoverPosition !== null && hoverTime !== null && (
          <div
            className="absolute -top-8 transform -translate-x-1/2 px-2 py-1 bg-zinc-900/90 backdrop-blur border border-white/10 rounded text-xs text-white font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-20"
            style={{ left: `${hoverPosition}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      <span className="text-xs text-zinc-400 font-mono w-10 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  );
}
