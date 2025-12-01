"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Repeat,
  Shuffle,
  Loader2,
} from "lucide-react";
import { usePlayerStore } from "@/store";
import { formatDuration, clamp } from "@/lib/utils";
import clsx from "clsx";

interface PlaybackControlsProps {
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (positionMs: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onVolumeChange?: (volume: number) => void;
}

export function PlaybackControls({
  onPlay,
  onPause,
  onSeek,
  onNext,
  onPrevious,
  onVolumeChange,
}: PlaybackControlsProps) {
  const {
    isPlaying,
    currentSong,
    positionMs,
    durationMs,
    volume,
    isMuted,
    isBuffering,
    setPosition,
    setVolume,
    setMuted,
    togglePlay,
    nextTrack,
    previousTrack,
  } = usePlayerStore();

  const [isDraggingSeek, setIsDraggingSeek] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [localSeekPosition, setLocalSeekPosition] = useState(positionMs);
  const [localVolume, setLocalVolume] = useState(volume);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const seekBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  // Sync local state with store when not dragging
  useEffect(() => {
    if (!isDraggingSeek) {
      setLocalSeekPosition(positionMs);
    }
  }, [positionMs, isDraggingSeek]);

  useEffect(() => {
    if (!isDraggingVolume) {
      setLocalVolume(volume);
    }
  }, [volume, isDraggingVolume]);

  // Handle seek bar interaction
  const handleSeekBarInteraction = useCallback(
    (clientX: number) => {
      if (!seekBarRef.current || !durationMs) return;

      const rect = seekBarRef.current.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      const newPosition = Math.floor(ratio * durationMs);
      setLocalSeekPosition(newPosition);
      return newPosition;
    },
    [durationMs]
  );

  const handleSeekMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSeek(true);
    handleSeekBarInteraction(e.clientX);
  };

  useEffect(() => {
    if (!isDraggingSeek) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleSeekBarInteraction(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDraggingSeek(false);
      setPosition(localSeekPosition);
      onSeek?.(localSeekPosition);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDraggingSeek,
    localSeekPosition,
    handleSeekBarInteraction,
    setPosition,
    onSeek,
  ]);

  // Handle volume bar interaction
  const handleVolumeBarInteraction = useCallback((clientX: number) => {
    if (!volumeBarRef.current) return;

    const rect = volumeBarRef.current.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    setLocalVolume(ratio);
    return ratio;
  }, []);

  const handleVolumeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingVolume(true);
    handleVolumeBarInteraction(e.clientX);
  };

  useEffect(() => {
    if (!isDraggingVolume) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleVolumeBarInteraction(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDraggingVolume(false);
      setVolume(localVolume);
      onVolumeChange?.(localVolume);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDraggingVolume,
    localVolume,
    handleVolumeBarInteraction,
    setVolume,
    onVolumeChange,
  ]);

  const handlePlayPause = () => {
    togglePlay();
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const handleNextTrack = () => {
    nextTrack();
    onNext?.();
  };

  const handlePreviousTrack = () => {
    previousTrack();
    onPrevious?.();
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setMuted(false);
      setVolume(localVolume || 0.5);
    } else {
      setMuted(true);
      setVolume(0);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || localVolume === 0) {
      return <VolumeX className="w-5 h-5" />;
    }
    if (localVolume < 0.5) {
      return <Volume1 className="w-5 h-5" />;
    }
    return <Volume2 className="w-5 h-5" />;
  };

  const progress = durationMs > 0 ? (localSeekPosition / durationMs) * 100 : 0;

  return (
    <div className="w-full space-y-4">
      {/* Progress / Seek Bar */}
      <div className="space-y-2">
        <div
          ref={seekBarRef}
          className="relative h-2 bg-dark-700 rounded-full cursor-pointer group"
          onMouseDown={handleSeekMouseDown}
        >
          {/* Buffering indicator */}
          {isBuffering && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="w-1/3 h-full bg-dark-600 animate-pulse" />
            </div>
          )}

          {/* Progress fill */}
          <div
            className="absolute h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />

          {/* Seek handle */}
          <div
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-opacity",
              isDraggingSeek
                ? "opacity-100 scale-110"
                : "opacity-0 group-hover:opacity-100"
            )}
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between text-xs text-dark-400">
          <span>{formatDuration(localSeekPosition)}</span>
          <span>{formatDuration(durationMs)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-6">
        {/* Shuffle */}
        <button
          className="btn-ghost p-2 text-dark-400 hover:text-white"
          aria-label="Shuffle"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        {/* Previous */}
        <button
          onClick={handlePreviousTrack}
          className="btn-ghost p-2 text-white hover:scale-105"
          aria-label="Previous track"
          disabled={!currentSong}
        >
          <SkipBack className="w-6 h-6 fill-current" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          disabled={!currentSong || isBuffering}
          className={clsx(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all",
            currentSong
              ? "bg-white text-dark-950 hover:scale-105 hover:bg-white/90"
              : "bg-dark-700 text-dark-500 cursor-not-allowed"
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isBuffering ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-1" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={handleNextTrack}
          className="btn-ghost p-2 text-white hover:scale-105"
          aria-label="Next track"
          disabled={!currentSong}
        >
          <SkipForward className="w-6 h-6 fill-current" />
        </button>

        {/* Repeat */}
        <button
          className="btn-ghost p-2 text-dark-400 hover:text-white"
          aria-label="Repeat"
        >
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      {/* Volume Control */}
      <div
        className="flex items-center justify-center gap-3"
        onMouseEnter={() => setShowVolumeSlider(true)}
        onMouseLeave={() => !isDraggingVolume && setShowVolumeSlider(false)}
      >
        <button
          onClick={handleToggleMute}
          className="btn-ghost p-2 text-dark-400 hover:text-white"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {getVolumeIcon()}
        </button>

        <div
          className={clsx(
            "w-24 transition-all duration-200",
            showVolumeSlider || isDraggingVolume
              ? "opacity-100"
              : "opacity-0 w-0"
          )}
        >
          <div
            ref={volumeBarRef}
            className="relative h-1.5 bg-dark-700 rounded-full cursor-pointer group"
            onMouseDown={handleVolumeMouseDown}
          >
            <div
              className="absolute h-full bg-white rounded-full"
              style={{ width: `${localVolume * 100}%` }}
            />
            <div
              className={clsx(
                "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow transition-opacity",
                isDraggingVolume
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              )}
              style={{ left: `calc(${localVolume * 100}% - 6px)` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
