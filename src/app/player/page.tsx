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
import { usePlayerStore, useDeviceStore, useThemeStore } from "@/store";
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
  const [rtcState, setRtcState] = useState<RTCPeerConnectionState>("new");
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(
    null
  );
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [songs] = useState<Song[]>(demoSongs);

  const rtcManagerRef = useRef<ReturnType<typeof getWebRTCManager> | null>(
    null
  );

  const { queue, setQueue } = usePlayerStore();
  const { pairedDevice, connectionStatus, setConnectionStatus } =
    useDeviceStore();

  // Filter songs based on search
  const filteredSongs = songs.filter(
    (song) =>
      song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  return (
    <AuthGuard>
      <div
        className={cn(
          "min-h-screen pb-28 transition-colors duration-300",
          isDark
            ? "bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white"
            : "bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 text-zinc-900"
        )}
      >
        {/* Header */}
        <header
          className={cn(
            "sticky top-0 z-40 backdrop-blur-xl border-b",
            isDark
              ? "bg-zinc-900/80 border-zinc-800/50"
              : "bg-gray-50/90 border-gray-200"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className={cn(
                    "p-2 -ml-2 transition-colors",
                    isDark
                      ? "text-zinc-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <Disc3 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold hidden sm:block">
                  SoundStream
                </h1>
              </div>

              {/* Search bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search
                    className={cn(
                      "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                      isDark ? "text-zinc-400" : "text-gray-400"
                    )}
                  />
                  <input
                    type="text"
                    placeholder="Search songs, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all",
                      isDark
                        ? "bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:border-primary-500/50"
                        : "bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500/50"
                    )}
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
                    className={cn(
                      "p-2 transition-colors",
                      isDark
                        ? "text-zinc-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-900"
                    )}
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
              className={cn(
                "mb-8 p-6 rounded-2xl border cursor-pointer",
                isDark
                  ? "bg-gradient-to-r from-primary-900/30 via-zinc-800/50 to-zinc-800/30 border-zinc-700/30"
                  : "bg-gradient-to-r from-primary-100 via-white to-gray-50 border-gray-200"
              )}
              onClick={() => setIsFullscreenOpen(true)}
            >
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-2xl shadow-black/50 flex-shrink-0">
                  {currentTrack.albumArt ? (
                    <img
                      src={currentTrack.albumArt}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-full h-full flex items-center justify-center",
                        isDark ? "bg-zinc-800" : "bg-gray-200"
                      )}
                    >
                      <Disc3
                        className={cn(
                          "w-12 h-12",
                          isDark ? "text-zinc-600" : "text-gray-400"
                        )}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-primary-500 font-medium uppercase tracking-wider mb-1">
                    Now Playing
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">
                    {currentTrack.title}
                  </h2>
                  <p className={isDark ? "text-zinc-400" : "text-gray-500"}>
                    {currentTrack.artist}
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {/* Song list */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">All Songs</h2>
              <span
                className={
                  isDark ? "text-sm text-zinc-500" : "text-sm text-gray-500"
                }
              >
                {filteredSongs.length} tracks
              </span>
            </div>

            {/* Table header */}
            <div
              className={cn(
                "hidden md:grid grid-cols-[16px_4fr_3fr_1fr_40px] gap-4 px-4 py-2 text-xs uppercase tracking-wider border-b mb-2",
                isDark
                  ? "text-zinc-500 border-zinc-800/50"
                  : "text-gray-500 border-gray-200"
              )}
            >
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
                    "group grid grid-cols-[4fr_1fr] md:grid-cols-[16px_4fr_3fr_1fr_40px] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all",
                    currentTrackIndex === index
                      ? isDark
                        ? "bg-zinc-800/80 border border-zinc-700/50"
                        : "bg-primary-50 border border-primary-200"
                      : isDark
                      ? "hover:bg-zinc-800/50"
                      : "hover:bg-gray-100"
                  )}
                >
                  {/* Number / Play icon */}
                  <div className="hidden md:flex items-center justify-center">
                    {currentTrackIndex === index ? (
                      <div className="flex items-end gap-0.5 h-3">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 bg-primary-500 rounded-full"
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
                        <span
                          className={cn(
                            "group-hover:hidden text-sm",
                            isDark ? "text-zinc-500" : "text-gray-500"
                          )}
                        >
                          {index + 1}
                        </span>
                        <Play
                          className={cn(
                            "w-4 h-4 hidden group-hover:block fill-current",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        />
                      </>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "relative w-10 h-10 rounded overflow-hidden flex-shrink-0 shadow-md",
                        isDark ? "bg-zinc-800" : "bg-gray-200"
                      )}
                    >
                      {song.albumArt ? (
                        <img
                          src={song.albumArt}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Disc3
                            className={cn(
                              "w-5 h-5",
                              isDark ? "text-zinc-600" : "text-gray-400"
                            )}
                          />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "font-medium truncate",
                          currentTrackIndex === index ? "text-primary-500" : ""
                        )}
                      >
                        {song.title}
                      </p>
                      <p
                        className={cn(
                          "text-sm truncate",
                          isDark ? "text-zinc-400" : "text-gray-500"
                        )}
                      >
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="hidden md:flex items-center">
                    <span
                      className={cn(
                        "text-sm truncate cursor-pointer",
                        isDark
                          ? "text-zinc-400 hover:text-white hover:underline"
                          : "text-gray-500 hover:text-gray-900 hover:underline"
                      )}
                    >
                      {song.album || "—"}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-end md:justify-start">
                    <span
                      className={cn(
                        "text-sm font-mono",
                        isDark ? "text-zinc-500" : "text-gray-500"
                      )}
                    >
                      {formatDuration(song.duration)}
                    </span>
                  </div>

                  {/* More options */}
                  <div className="hidden md:flex items-center justify-center">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "p-1 opacity-0 group-hover:opacity-100 transition-all",
                        isDark
                          ? "text-zinc-500 hover:text-white"
                          : "text-gray-400 hover:text-gray-900"
                      )}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredSongs.length === 0 && (
              <div className="text-center py-16">
                <Disc3
                  className={cn(
                    "w-16 h-16 mx-auto mb-4",
                    isDark ? "text-zinc-700" : "text-gray-300"
                  )}
                />
                <p className={isDark ? "text-zinc-500" : "text-gray-500"}>
                  No songs found
                </p>
                {searchQuery && (
                  <p
                    className={cn(
                      "text-sm mt-1",
                      isDark ? "text-zinc-600" : "text-gray-400"
                    )}
                  >
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
            "fixed top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 z-50",
            connectionStatus === "connected"
              ? isDark
                ? "bg-green-500/20 text-green-400"
                : "bg-green-100 text-green-700"
              : connectionStatus === "connecting"
              ? isDark
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-yellow-100 text-yellow-700"
              : isDark
              ? "bg-red-500/20 text-red-400"
              : "bg-red-100 text-red-700"
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "connecting"
                ? "bg-yellow-500 animate-pulse"
                : "bg-red-500"
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
