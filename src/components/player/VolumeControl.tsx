"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VolumeControlProps {
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  isMuted?: boolean;
  onMuteToggle?: (muted: boolean) => void;
}

export function VolumeControl({
  volume = 1,
  onVolumeChange,
  isMuted = false,
  onMuteToggle,
}: VolumeControlProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const previousVolume = useRef(volume);

  const getVolumeFromEvent = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!sliderRef.current) return volume;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      return Math.max(0, Math.min(1, x / rect.width));
    },
    [volume]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const newVolume = getVolumeFromEvent(e);
    onVolumeChange?.(newVolume);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newVolume = getVolumeFromEvent(e);
        onVolumeChange?.(newVolume);
      }
    },
    [isDragging, getVolumeFromEvent, onVolumeChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleMuteClick = () => {
    if (isMuted || volume === 0) {
      onVolumeChange?.(previousVolume.current || 0.5);
      onMuteToggle?.(false);
    } else {
      previousVolume.current = volume;
      onMuteToggle?.(true);
    }
  };

  const displayVolume = isMuted ? 0 : volume;

  const VolumeIcon = () => {
    if (isMuted || displayVolume === 0) return <VolumeX className="w-5 h-5" />;
    if (displayVolume < 0.33) return <Volume className="w-5 h-5" />;
    if (displayVolume < 0.66) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  return (
    <div
      className="flex items-center gap-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={handleMuteClick}
        className={cn(
          "p-1.5 rounded-full transition-all duration-200",
          "text-zinc-400 hover:text-white",
          "hover:bg-zinc-800/50",
          (isMuted || volume === 0) && "text-zinc-500"
        )}
      >
        <VolumeIcon />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isHovered || isDragging ? "w-24 opacity-100" : "w-0 opacity-0"
        )}
      >
        <div
          ref={sliderRef}
          className="relative h-1.5 w-24 cursor-pointer"
          onMouseDown={handleMouseDown}
        >
          {/* Background track */}
          <div className="absolute inset-0 bg-zinc-700/50 rounded-full overflow-hidden">
            {/* Volume level */}
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-colors",
                isDragging ? "bg-primary-400" : "bg-white"
              )}
              style={{ width: `${displayVolume * 100}%` }}
            />
          </div>

          {/* Handle */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transform -translate-x-1/2 transition-all",
              "opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100",
              isDragging && "opacity-100 scale-110"
            )}
            style={{ left: `${displayVolume * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
