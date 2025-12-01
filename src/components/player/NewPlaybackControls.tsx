"use client";

import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PlaybackControlsProps {
  isPlaying?: boolean;
  isLoading?: boolean;
  isBuffering?: boolean;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  shuffle?: boolean;
  onShuffleToggle?: () => void;
  repeatMode?: "off" | "all" | "one";
  onRepeatToggle?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PlaybackControls({
  isPlaying = false,
  isLoading = false,
  isBuffering = false,
  onPlayPause,
  onNext,
  onPrevious,
  shuffle = false,
  onShuffleToggle,
  repeatMode = "off",
  onRepeatToggle,
  canGoNext = true,
  canGoPrevious = true,
  size = "md",
}: PlaybackControlsProps) {
  const getRepeatIcon = () => {
    if (repeatMode === "one") return <Repeat1 className="w-4 h-4" />;
    return <Repeat className="w-4 h-4" />;
  };

  const buttonSize = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-16 h-16",
  };

  const iconSize = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Shuffle */}
      {onShuffleToggle && (
        <button
          onClick={onShuffleToggle}
          className={cn(
            "p-2 rounded-full transition-all duration-200 relative",
            shuffle
              ? "text-primary-500 hover:text-primary-400"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Shuffle className="w-4 h-4" />
          {shuffle && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
          )}
        </button>
      )}

      {/* Previous */}
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={cn(
          "p-2 rounded-full transition-all duration-200",
          "text-zinc-400 hover:text-white hover:scale-105 active:scale-95",
          !canGoPrevious && "opacity-30 cursor-not-allowed hover:scale-100"
        )}
      >
        <SkipBack className="w-5 h-5 fill-current" />
      </button>

      {/* Play/Pause - Main button */}
      <motion.button
        onClick={onPlayPause}
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative rounded-full flex items-center justify-center",
          "bg-white text-black shadow-xl shadow-black/20",
          "hover:bg-zinc-100 transition-colors duration-200",
          isLoading && "cursor-wait",
          buttonSize[size]
        )}
      >
        <AnimatePresence mode="wait">
          {isLoading || isBuffering ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <Loader2 className={cn(iconSize[size], "animate-spin")} />
            </motion.div>
          ) : isPlaying ? (
            <motion.div
              key="pause"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <Pause className={cn(iconSize[size], "fill-current")} />
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <Play className={cn(iconSize[size], "fill-current ml-1")} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buffering ring */}
        {isBuffering && (
          <div className="absolute inset-0 rounded-full">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="163.36"
                strokeDashoffset="122.52"
                className="text-primary-500 animate-spin origin-center"
                style={{ animationDuration: "1s" }}
              />
            </svg>
          </div>
        )}
      </motion.button>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={cn(
          "p-2 rounded-full transition-all duration-200",
          "text-zinc-400 hover:text-white hover:scale-105 active:scale-95",
          !canGoNext && "opacity-30 cursor-not-allowed hover:scale-100"
        )}
      >
        <SkipForward className="w-5 h-5 fill-current" />
      </button>

      {/* Repeat */}
      {onRepeatToggle && (
        <button
          onClick={onRepeatToggle}
          className={cn(
            "p-2 rounded-full transition-all duration-200 relative",
            repeatMode !== "off"
              ? "text-primary-500 hover:text-primary-400"
              : "text-zinc-400 hover:text-white"
          )}
        >
          {getRepeatIcon()}
          {repeatMode !== "off" && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
          )}
        </button>
      )}
    </div>
  );
}
