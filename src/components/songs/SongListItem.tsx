"use client";

import { Music } from "lucide-react";
import type { Song } from "@/types";
import { formatDuration } from "@/lib/utils";
import clsx from "clsx";

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
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group text-left",
        isActive ? "bg-white/10" : "hover:bg-white/5"
      )}
    >
      {/* Index / Playing Indicator */}
      <div className="w-8 flex-shrink-0 text-center">
        {isPlaying && isActive ? (
          <div className="flex items-center justify-center gap-0.5">
            <span
              className="w-1 h-4 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-1 h-3 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-1 h-5 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        ) : (
          <span
            className={clsx(
              "text-sm font-medium",
              isActive
                ? "text-primary-500"
                : "text-dark-500 group-hover:text-white"
            )}
          >
            {index + 1}
          </span>
        )}
      </div>

      {/* Album Art / Placeholder */}
      <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-dark-700">
        {song.albumArt ? (
          <img
            src={song.albumArt}
            alt={song.album || song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-5 h-5 text-dark-400" />
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            "font-medium truncate",
            isActive ? "text-primary-500" : "text-white"
          )}
        >
          {song.title}
        </p>
        <p className="text-sm text-dark-400 truncate">{song.artist}</p>
      </div>

      {/* Duration */}
      <span className="text-sm text-dark-400 flex-shrink-0">
        {formatDuration(song.duration)}
      </span>
    </button>
  );
}
