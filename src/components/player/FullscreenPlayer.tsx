"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronDown,
  MoreHorizontal,
  Share2,
  Heart,
  Disc3,
  ListMusic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SeekBar } from "./SeekBar";
import { VolumeControl } from "./VolumeControl";
import { PlaybackControls } from "./NewPlaybackControls";
import type { Song } from "@/types";

interface FullscreenPlayerProps {
  track?: Song | null;
  audioUrl?: string | null;
  audioStream?: MediaStream | null;
  isOpen?: boolean;
  onClose?: () => void;
  onTrackEnd?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
}

export function FullscreenPlayer({
  track = null,
  audioUrl = null,
  audioStream = null,
  isOpen = false,
  onClose,
  onTrackEnd,
  onNext,
  onPrevious,
  canGoNext = true,
  canGoPrevious = true,
}: FullscreenPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
        onTrackEnd?.();
      }
    };
    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1));
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("progress", handleProgress);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("progress", handleProgress);
    };
  }, [repeatMode, onTrackEnd]);

  // Handle audio stream
  useEffect(() => {
    if (audioRef.current && audioStream) {
      audioRef.current.srcObject = audioStream;
    }
  }, [audioStream]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [audioUrl]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {});
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  }, []);

  const handleRepeatToggle = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const defaultTrack: Song = {
    id: "",
    title: "No track selected",
    artist: "Select a song to play",
    album: "",
    albumArt: undefined,
    duration: 0,
    filePath: "",
  };

  const displayTrack = track || defaultTrack;
  const trackDuration = duration || displayTrack.duration / 1000;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black"
        >
          {/* Dynamic background based on album art */}
          {displayTrack.albumArt && (
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={displayTrack.albumArt}
                alt=""
                className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/80 to-black" />
            </div>
          )}

          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6">
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronDown className="w-6 h-6" />
              </button>

              <div className="text-center">
                <p className="text-xs text-zinc-400 uppercase tracking-wider">
                  Playing from
                </p>
                <p className="text-sm text-white font-medium">
                  {displayTrack.album || "Unknown Album"}
                </p>
              </div>

              <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-8">
              {/* Album art */}
              <motion.div
                className="relative w-full max-w-sm md:max-w-md aspect-square mb-8"
                animate={{
                  scale: isPlaying ? 1 : 0.95,
                }}
                transition={{
                  scale: { duration: 0.3 },
                }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                  {displayTrack.albumArt ? (
                    <img
                      src={displayTrack.albumArt}
                      alt={displayTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900">
                      <Disc3
                        className={cn(
                          "w-32 h-32 text-zinc-600",
                          isPlaying && "animate-spin-slow"
                        )}
                      />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Track info */}
              <div className="w-full max-w-sm md:max-w-md text-center mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0 text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-white truncate">
                      {displayTrack.title}
                    </h2>
                    <p className="text-lg text-zinc-400 truncate">
                      {displayTrack.artist}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={cn(
                      "p-3 rounded-full transition-all",
                      isLiked
                        ? "text-primary-500"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <Heart
                      className={cn("w-6 h-6", isLiked && "fill-current")}
                    />
                  </button>
                </div>
              </div>

              {/* Seek bar */}
              <div className="w-full max-w-sm md:max-w-md mb-6">
                <SeekBar
                  currentTime={currentTime}
                  duration={trackDuration}
                  buffered={buffered}
                  onSeek={handleSeek}
                  isLoading={isLoading}
                />
              </div>

              {/* Playback controls */}
              <div className="mb-8">
                <PlaybackControls
                  isPlaying={isPlaying}
                  isLoading={isLoading}
                  isBuffering={isBuffering}
                  onPlayPause={handlePlayPause}
                  onNext={onNext}
                  onPrevious={onPrevious}
                  shuffle={shuffle}
                  onShuffleToggle={() => setShuffle(!shuffle)}
                  repeatMode={repeatMode}
                  onRepeatToggle={handleRepeatToggle}
                  canGoNext={canGoNext}
                  canGoPrevious={canGoPrevious}
                  size="lg"
                />
              </div>

              {/* Volume */}
              <div className="w-full max-w-sm flex items-center justify-center gap-4">
                <VolumeControl
                  volume={volume}
                  onVolumeChange={handleVolumeChange}
                  isMuted={isMuted}
                  onMuteToggle={setIsMuted}
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-around p-4 border-t border-zinc-800/50">
              <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-xs">Share</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
                <ListMusic className="w-5 h-5" />
                <span className="text-xs">Queue</span>
              </button>
            </div>
          </div>

          {/* Hidden audio element */}
          <audio ref={audioRef} preload="metadata" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
