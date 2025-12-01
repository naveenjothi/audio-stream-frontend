"use client";

import { useState } from "react";
import { Music, Search, Loader2 } from "lucide-react";
import { SongListItem } from "./SongListItem";
import { usePlayerStore } from "@/store";
import type { Song } from "@/types";
import clsx from "clsx";

interface SongListProps {
  songs: Song[];
  isLoading?: boolean;
  onSongSelect?: (song: Song, index: number) => void;
}

export function SongList({
  songs,
  isLoading = false,
  onSongSelect,
}: SongListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentSong, isPlaying, setQueue } = usePlayerStore();

  const filteredSongs = songs.filter((song) => {
    const query = searchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.album?.toLowerCase().includes(query)
    );
  });

  const handleSongClick = (song: Song, index: number) => {
    setQueue(filteredSongs, index);
    onSongSelect?.(song, index);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="mt-4 text-dark-400">Loading songs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
        <input
          type="text"
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-11 bg-dark-800/50"
        />
      </div>

      {/* Song Count */}
      <div className="flex items-center justify-between px-3">
        <p className="text-sm text-dark-400">
          {filteredSongs.length} {filteredSongs.length === 1 ? "song" : "songs"}
        </p>
      </div>

      {/* Song List */}
      {filteredSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-dark-500" />
          </div>
          <p className="text-dark-400">
            {searchQuery ? "No songs match your search" : "No songs synced yet"}
          </p>
          {!searchQuery && (
            <p className="text-dark-500 text-sm mt-1">
              Connect your mobile device to sync songs
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredSongs.map((song, index) => (
            <SongListItem
              key={song.id}
              song={song}
              index={index}
              isActive={currentSong?.id === song.id}
              isPlaying={isPlaying && currentSong?.id === song.id}
              onClick={() => handleSongClick(song, index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
