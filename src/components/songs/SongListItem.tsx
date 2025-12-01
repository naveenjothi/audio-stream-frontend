"use client";

import { Music, Play } from "lucide-react";
import type { Song } from "@/types";
import { formatDuration } from "@/lib/utils";
import clsx from "clsx";
import { motion } from "framer-motion";

interface SongListItemProps {
  song: Song;
  index: number;
  isPlaying?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function SongListItem({
  song,
  index,
  isPlaying = false,
  isActive = false,
  onClick,
}: SongListItemProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group text-left relative overflow-hidden",
        isActive 
          ? "bg-white/10 border border-white/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
          : "hover:bg-white/5 border border-transparent hover:border-white/5"
      )}
    >
      {/* Hover Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Index / Playing Indicator */}
      <div className="w-8 flex-shrink-0 text-center relative z-10">
        {isPlaying && isActive ? (
          <div className="flex items-center justify-center gap-0.5">
            <span
              className="w-1 h-4 bg-primary-500 rounded-full animate-[bounce_1s_infinite]"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-1 h-3 bg-primary-500 rounded-full animate-[bounce_1s_infinite]"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-1 h-5 bg-primary-500 rounded-full animate-[bounce_1s_infinite]"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <span
              className={clsx(
                "text-sm font-medium transition-all duration-200 absolute",
                isActive
                  ? "text-primary-500"
                  : "text-zinc-500 group-hover:opacity-0"
              )}
            >
              {index + 1}
            </span>
            <Play className={clsx(
              "w-4 h-4 text-white absolute transition-all duration-200 transform scale-0",
              !isActive && "group-hover:scale-100 group-hover:opacity-100"
            )} />
          </div>
        )}
      </div>

      {/* Album Art / Placeholder */}
      <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800 relative z-10 group-hover:shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-shadow">
        {song.albumArt ? (
          <img
            src={song.albumArt}
            alt={song.album || song.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-5 h-5 text-zinc-600" />
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0 relative z-10">
        <p
          className={clsx(
            "font-medium truncate transition-colors duration-200",
            isActive ? "text-primary-500 glow-text" : "text-white group-hover:text-primary-200"
          )}
        >
          {song.title}
        </p>
        <p className="text-sm text-zinc-400 truncate group-hover:text-zinc-300 transition-colors">
          {song.artist}
        </p>
      </div>

      {/* Duration */}
      <span className="text-sm text-zinc-500 flex-shrink-0 relative z-10 font-mono group-hover:text-zinc-300 transition-colors">
        {formatDuration(song.duration)}
      </span>
    </motion.button>
  );
}
