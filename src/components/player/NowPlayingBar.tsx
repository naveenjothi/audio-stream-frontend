"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ListMusic, Maximize2, MonitorSpeaker } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeekBar } from "./SeekBar";
import { VolumeControl } from "./VolumeControl";
import { PlaybackControls } from "./NewPlaybackControls";
import { TrackInfo } from "./TrackInfo";
import type { Song } from "@/types";

interface NowPlayingBarProps {
  track?: Song | null;
  audioUrl?: string | null;
  audioStream?: MediaStream | null;
  onTrackEnd?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onOpenFullscreen?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
}

export function NowPlayingBar({
  track = null,
  audioUrl = null,
  audioStream = null,
  onTrackEnd,
  onNext,
  onPrevious,
  onOpenFullscreen,
  canGoNext = true,
  canGoPrevious = true,
}: NowPlayingBarProps) {
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

  // Audio element event handlers
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

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Load new track
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

  const defaultTrack = {
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
    <div className="fixed bottom-4 left-4 right-4 z-50">
      {/* Floating Glass Bar */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10">
        {/* Progress Bar Glow */}
        <div 
          className="absolute top-0 left-0 h-[2px] bg-primary-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-100 ease-linear z-10"
          style={{ width: `${(currentTime / trackDuration) * 100}%` }}
        />

        <div className="relative px-4 py-3">
          <div className="max-w-screen-2xl mx-auto">
            {/* Mobile Progress */}
            <div className="md:hidden mb-3">
              <SeekBar
                currentTime={currentTime}
                duration={trackDuration}
                buffered={buffered}
                onSeek={handleSeek}
                isLoading={isLoading}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Left: Track info */}
              <div
                className="flex-1 min-w-0 max-w-xs group cursor-pointer"
                onClick={onOpenFullscreen}
              >
                <TrackInfo
                  title={displayTrack.title}
                  artist={displayTrack.artist}
                  album={displayTrack.album}
                  coverUrl={displayTrack.albumArt}
                  isPlaying={isPlaying && !isBuffering}
                  isLiked={isLiked}
                  onLikeToggle={() => setIsLiked(!isLiked)}
                />
              </div>

              {/* Center: Controls + Seek */}
              <div className="flex-1 max-w-2xl hidden md:flex flex-col items-center gap-2">
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
                />

                <div className="w-full max-w-lg">
                  <SeekBar
                    currentTime={currentTime}
                    duration={trackDuration}
                    buffered={buffered}
                    onSeek={handleSeek}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              {/* Mobile controls */}
              <div className="md:hidden">
                <PlaybackControls
                  isPlaying={isPlaying}
                  isLoading={isLoading}
                  isBuffering={isBuffering}
                  onPlayPause={handlePlayPause}
                  onNext={onNext}
                  onPrevious={onPrevious}
                  canGoNext={canGoNext}
                  canGoPrevious={canGoPrevious}
                  size="sm"
                />
              </div>

              {/* Right: Volume + extras */}
              <div className="flex-1 max-w-xs hidden md:flex items-center justify-end gap-3">
                <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                  <ListMusic className="w-4 h-4" />
                </button>

                <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all group relative">
                  <MonitorSpeaker className="w-4 h-4" />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-900/90 backdrop-blur border border-white/10 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                    Connect to device
                  </span>
                </button>

                <VolumeControl
                  volume={volume}
                  onVolumeChange={handleVolumeChange}
                  isMuted={isMuted}
                  onMuteToggle={setIsMuted}
                />

                <button
                  onClick={onOpenFullscreen}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}
