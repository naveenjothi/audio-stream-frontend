"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Disc3,
  Play,
  Clock,
  MoreHorizontal,
  ChevronLeft,
  Settings,
} from "lucide-react";
import { AuthGuard } from "@/components/auth";
import {
  NowPlayingBar,
  FullscreenPlayer,
  DeviceStatus,
} from "@/components/player";
import { usePlayerStore, useDeviceStore } from "@/store";
import { getWebRTCManager, destroyWebRTCManager } from "@/lib/webrtc";
import { generateBrowserDeviceId, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Song } from "@/types";

// Demo songs with real audio samples
const demoSongs: Song[] = [
  {
    id: "demo-1",
    title: "Midnight Dreams",
    artist: "Luna Wave",
    album: "Nocturnal",
    duration: 234000,
    albumArt:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    filePath: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "demo-2",
    title: "Electric Pulse",
    artist: "Neon Circuits",
    album: "Digital Age",
    duration: 198000,
    albumArt:
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop",
    filePath: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "demo-3",
    title: "Ocean Waves",
    artist: "Coastal Vibes",
    album: "Serenity",
    duration: 267000,
    albumArt:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop",
    filePath: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "demo-4",
    title: "Urban Jungle",
    artist: "Metro Beats",
    album: "City Lights",
    duration: 212000,
    albumArt:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
    filePath: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "demo-5",
    title: "Starlight Serenade",
    artist: "Cosmic Dreams",
    album: "Galaxy",
    duration: 289000,
    albumArt:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=300&fit=crop",
    filePath: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  {
    id: "demo-6",
    title: "Forest Rain",
    artist: "Nature Sounds",
    album: "Earth Tones",
    duration: 245000,
    albumArt:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
    filePath: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
];

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function PlayerPage() {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [, setRtcState] = useState<RTCPeerConnectionState>("new");
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(
    null,
  );
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [songs] = useState<Song[]>(demoSongs);

  const rtcManagerRef = useRef<ReturnType<typeof getWebRTCManager> | null>(
    null,
  );

  const { setQueue } = usePlayerStore();
  const { pairedDevice, connectionStatus, setConnectionStatus } =
    useDeviceStore();

  // Filter songs based on search
  const filteredSongs = songs.filter(
    (song) =>
      song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentTrack =
    currentTrackIndex !== null ? filteredSongs[currentTrackIndex] : null;

  // Initialize WebRTC
  useEffect(() => {
    const initWebRTC = async () => {
      if (!pairedDevice) return;

      const deviceId = generateBrowserDeviceId();

      const manager = getWebRTCManager(deviceId, {
        onTrack: (stream) => {
          console.log("Received audio stream");
          setAudioStream(stream);
        },
        onConnectionStateChange: (state) => {
          console.log("Connection state:", state);
          setRtcState(state);
          if (state === "connected") {
            setConnectionStatus("connected");
          } else if (state === "disconnected" || state === "failed") {
            setConnectionStatus("disconnected");
          }
        },
        onError: (error) => {
          console.error("WebRTC error:", error);
        },
      });

      rtcManagerRef.current = manager;

      try {
        setConnectionStatus("connecting");
        await manager.initialize();

        if (pairedDevice.id) {
          await manager.connectToDevice(pairedDevice.id);
        }
      } catch (error) {
        console.error("Failed to initialize WebRTC:", error);
        setConnectionStatus("disconnected");
      }
    };

    initWebRTC();

    return () => {
      destroyWebRTCManager();
    };
  }, [pairedDevice, setConnectionStatus]);

  const handleSongSelect = (index: number) => {
    setCurrentTrackIndex(index);
    setQueue(filteredSongs, index);
  };

  const handleNext = () => {
    if (
      currentTrackIndex !== null &&
      currentTrackIndex < filteredSongs.length - 1
    ) {
      const nextIndex = currentTrackIndex + 1;
      setCurrentTrackIndex(nextIndex);
      setQueue(filteredSongs, nextIndex);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex !== null && currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
      setQueue(filteredSongs, prevIndex);
    }
  };

  const handleTrackEnd = () => {
    handleNext();
  };

  return (
    <AuthGuard>
      <div className="min-h-screen pb-28 transition-colors duration-300 bg-tps-charcoal text-white">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 bg-tps-charcoal/80">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="p-2 -ml-2 transition-colors text-tps-muted hover:text-white group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tps-cyan to-tps-lilac flex items-center justify-center shadow-lg shadow-tps-cyan/20">
                  <Disc3 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold hidden sm:block tracking-tight">
                  TPS
                </h1>
              </div>

              {/* Search bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tps-muted" />
                  <input
                    type="text"
                    placeholder="Search songs, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-tps-cyan/50 transition-all bg-tps-surface border border-white/5 text-white placeholder-tps-muted focus:border-tps-cyan/50"
                  />
                </div>
              </div>

              {/* Device Status */}
              <div className="flex items-center gap-2">
                <div className="hidden md:block">
                  <DeviceStatus
                    device={pairedDevice}
                    connectionStatus={connectionStatus}
                    compact
                  />
                </div>
                <Link href="/settings">
                  <button
                    className="p-2 transition-colors text-tps-muted hover:text-white rounded-full hover:bg-white/5"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Hero section with current track */}
          {currentTrack && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 rounded-tps border border-white/5 cursor-pointer bg-gradient-to-r from-tps-surface to-tps-charcoal relative overflow-hidden group shadow-2xl"
              onClick={() => setIsFullscreenOpen(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-tps-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex items-center gap-6">
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border border-white/5 group-hover:scale-105 transition-transform duration-500">
                  {currentTrack.albumArt ? (
                    <img
                      src={currentTrack.albumArt}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-tps-surface">
                      <Disc3 className="w-12 h-12 text-tps-muted" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-tps-cyan font-bold uppercase tracking-widest mb-1">
                    Now Playing
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1 text-white tracking-tight group-hover:text-tps-cyan transition-colors">
                    {currentTrack.title}
                  </h2>
                  <p className="text-tps-muted font-medium">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {/* Song list */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">All Songs</h2>
              <span className="text-sm text-tps-muted font-mono">
                {filteredSongs.length} TRACKS
              </span>
            </div>

            {/* Table header */}
            <div className="hidden md:grid grid-cols-[16px_4fr_3fr_1fr_40px] gap-4 px-4 py-2 text-xs uppercase tracking-wider border-b border-white/5 mb-2 text-tps-muted font-semibold">
              <span>#</span>
              <span>Title</span>
              <span>Album</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
              </span>
              <span></span>
            </div>

            {/* Songs */}
            <div className="space-y-1">
              {filteredSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSongSelect(index)}
                  className={cn(
                    "group grid grid-cols-[4fr_1fr] md:grid-cols-[16px_4fr_3fr_1fr_40px] gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all border border-transparent",
                    currentTrackIndex === index
                      ? "bg-tps-surface border-tps-cyan/20 shadow-[0_0_15px_-5px_rgba(64,224,255,0.1)]"
                      : "hover:bg-white/5 hover:border-white/5",
                  )}
                >
                  {/* Number / Play icon */}
                  <div className="hidden md:flex items-center justify-center">
                    {currentTrackIndex === index ? (
                      <div className="flex items-end gap-0.5 h-3">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 bg-tps-cyan rounded-full"
                            animate={{
                              height: ["30%", "100%", "50%", "80%", "30%"],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        <span className="group-hover:hidden text-sm text-tps-muted">
                          {index + 1}
                        </span>
                        <Play className="w-4 h-4 hidden group-hover:block fill-current text-white" />
                      </>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-md bg-tps-surface border border-white/5">
                      {song.albumArt ? (
                        <img
                          src={song.albumArt}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Disc3 className="w-5 h-5 text-tps-muted" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "font-medium truncate",
                          currentTrackIndex === index
                            ? "text-tps-cyan"
                            : "text-white group-hover:text-tps-cyan transition-colors",
                        )}
                      >
                        {song.title}
                      </p>
                      <p className="text-sm truncate text-tps-muted">
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="hidden md:flex items-center">
                    <span className="text-sm truncate cursor-pointer text-tps-muted hover:text-white hover:underline transition-colors">
                      {song.album || "—"}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-end md:justify-start">
                    <span className="text-sm font-mono text-tps-muted">
                      {formatDuration(song.duration)}
                    </span>
                  </div>

                  {/* More options */}
                  <div className="hidden md:flex items-center justify-center">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 opacity-0 group-hover:opacity-100 transition-all text-tps-muted hover:text-white"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredSongs.length === 0 && (
              <div className="text-center py-16">
                <Disc3 className="w-16 h-16 mx-auto mb-4 text-tps-surface" />
                <p className="text-tps-muted">No songs found</p>
                {searchQuery && (
                  <p className="text-sm mt-1 text-tps-muted/80">
                    Try a different search term
                  </p>
                )}
              </div>
            )}
          </section>
        </main>

        {/* Bottom player bar */}
        <NowPlayingBar
          track={currentTrack}
          audioUrl={currentTrack?.filePath}
          audioStream={audioStream}
          onTrackEnd={handleTrackEnd}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onOpenFullscreen={() => setIsFullscreenOpen(true)}
          canGoNext={
            currentTrackIndex !== null &&
            currentTrackIndex < filteredSongs.length - 1
          }
          canGoPrevious={currentTrackIndex !== null && currentTrackIndex > 0}
        />

        {/* Fullscreen player */}
        <FullscreenPlayer
          track={currentTrack}
          audioUrl={currentTrack?.filePath}
          audioStream={audioStream}
          isOpen={isFullscreenOpen}
          onClose={() => setIsFullscreenOpen(false)}
          onTrackEnd={handleTrackEnd}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={
            currentTrackIndex !== null &&
            currentTrackIndex < filteredSongs.length - 1
          }
          canGoPrevious={currentTrackIndex !== null && currentTrackIndex > 0}
        />

        {/* Connection Status Indicator */}
        <div
          className={cn(
            "fixed top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 z-50 shadow-lg border border-white/5 backdrop-blur-md",
            connectionStatus === "connected"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : connectionStatus === "connecting"
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20",
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]",
              connectionStatus === "connected"
                ? "bg-emerald-500"
                : connectionStatus === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500",
            )}
          />
          {connectionStatus === "connected"
            ? "Connected"
            : connectionStatus === "connecting"
              ? "Connecting..."
              : "Disconnected"}
        </div>
      </div>
    </AuthGuard>
  );
}
