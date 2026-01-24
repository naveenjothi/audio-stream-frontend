"use client";

import { useEffect, useRef, useState } from "react";
import { Music, ChevronDown, ChevronUp } from "lucide-react";
import { PlaybackControls } from "./PlaybackControls";
import { DeviceStatus } from "./DeviceStatus";
import { usePlayerStore, useDeviceStore } from "@/store";
import {
  playSong,
  pausePlayback,
  seekPlayback,
  setPlaybackVolume,
  nextTrack as apiNextTrack,
  previousTrack as apiPreviousTrack,
} from "@/services/api";
import { createPlaybackClient, WebSocketClient } from "@/lib/ws";
import type { PlaybackEvent } from "@/types";
import clsx from "clsx";

interface AudioPlayerProps {
  audioStream?: MediaStream | null;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

export function AudioPlayer({
  audioStream,
  minimized = false,
  onToggleMinimize,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playbackClientRef = useRef<WebSocketClient | null>(null);

  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    setPosition,
    setIsPlaying,
    setBuffering,
  } = usePlayerStore();
  const { pairedDevice, connectionStatus } = useDeviceStore();

  const [wsConnected, setWsConnected] = useState(false);

  // Connect audio stream to audio element
  useEffect(() => {
    if (audioRef.current && audioStream) {
      audioRef.current.srcObject = audioStream;
    }
  }, [audioStream]);

  // Sync playback state with audio element
  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!audioRef.current || !audioStream) return;

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioStream]);

  // Initialize playback WebSocket
  useEffect(() => {
    const handlePlaybackEvent = (event: PlaybackEvent) => {
      switch (event.type) {
        case "PLAY":
          setIsPlaying(true);
          if (event.positionMs !== undefined) {
            setPosition(event.positionMs);
          }
          break;
        case "PAUSE":
          setIsPlaying(false);
          break;
        case "SEEK":
          if (event.positionMs !== undefined) {
            setPosition(event.positionMs);
          }
          break;
        case "STOP":
          setIsPlaying(false);
          setPosition(0);
          break;
      }
    };

    const client = createPlaybackClient(handlePlaybackEvent, setWsConnected);
    playbackClientRef.current = client;

    client.connect().catch(console.error);

    return () => {
      client.close();
    };
  }, [setIsPlaying, setPosition]);

  // Progress updater when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPosition(usePlayerStore.getState().positionMs + 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, setPosition]);

  // API handlers
  const handlePlay = async () => {
    if (currentSong) {
      await playSong(currentSong.id);
    }
  };

  const handlePause = async () => {
    await pausePlayback();
  };

  const handleSeek = async (positionMs: number) => {
    await seekPlayback(positionMs);
  };

  const handleVolumeChange = async (newVolume: number) => {
    await setPlaybackVolume(newVolume);
  };

  const handleNext = async () => {
    await apiNextTrack();
  };

  const handlePrevious = async () => {
    await apiPreviousTrack();
  };

  // Audio event handlers
  const handleAudioWaiting = () => setBuffering(true);
  const handleAudioCanPlay = () => setBuffering(false);

  if (minimized) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 h-20 bg-dark-900/95 backdrop-blur-xl border-t border-dark-800 z-50"
        onClick={onToggleMinimize}
      >
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center gap-4">
          {/* Current Song Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
              {currentSong?.albumArt ? (
                <img
                  src={currentSong.albumArt}
                  alt={currentSong.album || currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-dark-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-white truncate">
                {currentSong?.title || "No track selected"}
              </p>
              <p className="text-sm text-dark-400 truncate">
                {currentSong?.artist || "Select a song to play"}
              </p>
            </div>
          </div>

          {/* Mini Controls */}
          <div className="flex-shrink-0">
            <PlaybackControls
              onPlay={handlePlay}
              onPause={handlePause}
              onSeek={handleSeek}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onVolumeChange={handleVolumeChange}
            />
          </div>

          {/* Expand button */}
          <button className="btn-ghost p-2">
            <ChevronUp className="w-5 h-5 text-dark-400" />
          </button>
        </div>

        <audio
          ref={audioRef}
          onWaiting={handleAudioWaiting}
          onCanPlay={handleAudioCanPlay}
          autoPlay
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Album Art */}
      <div className="aspect-square w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-dark-800 shadow-2xl">
        {currentSong?.albumArt ? (
          <img
            src={currentSong.albumArt}
            alt={currentSong.album || currentSong.title}
            className={clsx(
              "w-full h-full object-cover transition-transform duration-500",
              isPlaying && "scale-105"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-800">
            <Music className="w-24 h-24 text-dark-500" />
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white truncate">
          {currentSong?.title || "No track selected"}
        </h2>
        <p className="text-lg text-dark-400 mt-1 truncate">
          {currentSong?.artist || "Select a song to play"}
        </p>
        {currentSong?.album && (
          <p className="text-sm text-dark-500 mt-1 truncate">
            {currentSong.album}
          </p>
        )}
      </div>

      {/* Device Status */}
      <div className="flex justify-center">
        <DeviceStatus
          device={pairedDevice}
          connectionStatus={connectionStatus}
          compact
        />
      </div>

      {/* Playback Controls */}
      <PlaybackControls
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onVolumeChange={handleVolumeChange}
      />

      <audio
        ref={audioRef}
        onWaiting={handleAudioWaiting}
        onCanPlay={handleAudioCanPlay}
        autoPlay
      />
    </div>
  );
}
