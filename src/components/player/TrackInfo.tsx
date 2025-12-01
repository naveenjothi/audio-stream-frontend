"use client";

import React from "react";
import { Heart, MoreHorizontal, Disc3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TrackInfoProps {
  title?: string;
  artist?: string;
  album?: string;
  coverUrl?: string | null;
  isPlaying?: boolean;
  isLiked?: boolean;
  onLikeToggle?: () => void;
  onMoreOptions?: () => void;
}

export function TrackInfo({
  title = "No track playing",
  artist = "Unknown artist",
  album = "",
  coverUrl = null,
  isPlaying = false,
  isLiked = false,
  onLikeToggle,
  onMoreOptions,
}: TrackInfoProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Album art */}
      <motion.div
        className={cn(
          "relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0",
          "bg-zinc-800 shadow-lg shadow-black/30"
        )}
        animate={{
          scale: isPlaying ? 1 : 0.95,
          opacity: isPlaying ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${album || title} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900">
            <Disc3
              className={cn(
                "w-8 h-8 text-zinc-500",
                isPlaying && "animate-spin-slow"
              )}
            />
          </div>
        )}

        {/* Playing indicator overlay */}
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex items-end gap-0.5 h-4">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-primary-500 rounded-full"
                  animate={{
                    height: ["40%", "100%", "60%", "80%", "40%"],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Track details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate text-sm hover:underline cursor-pointer">
          {title}
        </h3>
        <p className="text-xs text-zinc-400 truncate hover:text-white hover:underline cursor-pointer">
          {artist}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onLikeToggle}
          className={cn(
            "p-2 rounded-full transition-all duration-200",
            isLiked
              ? "text-primary-500 hover:text-primary-400"
              : "text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100"
          )}
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
        </button>

        <button
          onClick={onMoreOptions}
          className="p-2 rounded-full text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
