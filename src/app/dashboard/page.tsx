"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Smartphone,
  Music,
  Settings,
  Play,
  ChevronRight,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Disc3,
  User,
} from "lucide-react";
import { AuthGuard, useAuth } from "@/components/auth";
import { SongList } from "@/components/songs";
import { Loading, useToast } from "@/components/shared";
import { useDeviceStore, usePlayerStore, useThemeStore } from "@/store";
import { getSongs, getPairedDevice, playSong } from "@/lib/api";
import { logOut } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Song } from "@/types";

// Demo songs
const demoSongs: Song[] = [
  {
    id: "demo-1",
    title: "Midnight Dreams",
    artist: "Luna Wave",
    album: "Nocturnal",
    duration: 234000,
    albumArt:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
    filePath: "",
  },
  {
    id: "demo-2",
    title: "Electric Pulse",
    artist: "Neon Circuits",
    album: "Digital Age",
    duration: 198000,
    albumArt:
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=100&h=100&fit=crop",
    filePath: "",
  },
  {
    id: "demo-3",
    title: "Ocean Waves",
    artist: "Coastal Vibes",
    album: "Serenity",
    duration: 267000,
    albumArt:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop",
    filePath: "",
  },
  {
    id: "demo-4",
    title: "Urban Jungle",
    artist: "Metro Beats",
    album: "City Lights",
    duration: 212000,
    albumArt:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop",
    filePath: "",
  },
];

export default function DashboardPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const {
    pairedDevice,
    connectionStatus,
    setPairedDevice,
    setConnectionStatus,
  } = useDeviceStore();
  const { setQueue, setIsPlaying } = usePlayerStore();

  // Fetch paired device and songs on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch paired device
      const deviceResponse = await getPairedDevice();
      if (deviceResponse.data) {
        setPairedDevice(deviceResponse.data);
        setConnectionStatus(
          deviceResponse.data.status === "online" ? "connected" : "disconnected"
        );
      }

      // Fetch songs
      const songsResponse = await getSongs();
      if (songsResponse.data) {
        setSongs([...songsResponse.data, ...demoSongs]);
      } else {
        setSongs(demoSongs);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setSongs(demoSongs);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    addToast("Data refreshed", "success");
  };

  const handleSongSelect = async (song: Song, index: number) => {
    setQueue(songs, index);
    setIsPlaying(true);
    router.push("/player");
  };

  const handleLogout = async () => {
    await logOut();
    router.push("/login");
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const connectedDevice = pairedDevice && connectionStatus === "connected";
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  return (
    <AuthGuard>
      <div
        className={cn(
          "min-h-screen transition-colors duration-300",
          isDark
            ? "bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white"
            : "bg-gradient-to-b from-gray-50 via-white to-gray-100 text-zinc-900"
        )}
      >
        {/* Header */}
        <header
          className={cn(
            "sticky top-0 z-40 backdrop-blur-xl border-b",
            isDark
              ? "bg-zinc-900/80 border-zinc-800/50"
              : "bg-white/80 border-gray-200"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <Disc3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold hidden sm:block">
                  SoundStream
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="btn-ghost p-2"
                  title="Refresh"
                >
                  <RefreshCw
                    className={cn("w-5 h-5", isRefreshing && "animate-spin")}
                  />
                </button>
                <Link href="/settings">
                  <button className="btn-ghost p-2" title="Settings">
                    <Settings className="w-5 h-5" />
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-ghost p-2 text-red-400 hover:text-red-300"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center ml-2",
                    isDark ? "bg-zinc-700" : "bg-gray-200"
                  )}
                >
                  <User
                    className={cn(
                      "w-4 h-4",
                      isDark ? "text-zinc-300" : "text-gray-600"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {greeting()}
              {user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
            </h1>
            <p className={isDark ? "text-zinc-400" : "text-gray-500"}>
              Ready to stream your music?
            </p>
          </motion.div>

          {/* Device status card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div
              className={cn(
                "p-6 rounded-2xl border transition-all",
                connectedDevice
                  ? isDark
                    ? "bg-gradient-to-r from-primary-900/30 to-zinc-900/50 border-primary-500/30"
                    : "bg-gradient-to-r from-primary-100 to-white border-primary-300"
                  : isDark
                  ? "bg-zinc-900/50 border-zinc-800"
                  : "bg-white border-gray-200 shadow-sm"
              )}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      connectedDevice
                        ? "bg-primary-500/20"
                        : isDark
                        ? "bg-zinc-800"
                        : "bg-gray-100"
                    )}
                  >
                    <Smartphone
                      className={cn(
                        "w-7 h-7",
                        connectedDevice
                          ? "text-primary-500"
                          : isDark
                          ? "text-zinc-500"
                          : "text-gray-400"
                      )}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {connectedDevice ? (
                        <>
                          <Wifi className="w-4 h-4 text-primary-500" />
                          <span className="text-sm font-medium text-primary-500">
                            Connected
                          </span>
                        </>
                      ) : (
                        <>
                          <WifiOff
                            className={cn(
                              "w-4 h-4",
                              isDark ? "text-zinc-500" : "text-gray-400"
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isDark ? "text-zinc-500" : "text-gray-500"
                            )}
                          >
                            No device connected
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">
                      {connectedDevice
                        ? pairedDevice.name
                        : "Connect your phone"}
                    </h3>
                    <p
                      className={
                        isDark
                          ? "text-sm text-zinc-400"
                          : "text-sm text-gray-500"
                      }
                    >
                      {connectedDevice
                        ? "Ready to stream audio to your browser"
                        : "Pair your mobile device to start streaming"}
                    </p>
                  </div>
                </div>

                <Link href="/pair">
                  <button
                    className={cn(
                      "px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-all",
                      connectedDevice
                        ? isDark
                          ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        : "bg-primary-600 hover:bg-primary-500 text-white"
                    )}
                  >
                    {connectedDevice ? (
                      <>
                        <Settings className="w-4 h-4" />
                        Manage
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4" />
                        Connect Device
                      </>
                    )}
                  </button>
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Quick stats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div
              className={cn(
                "p-4 rounded-xl border",
                isDark
                  ? "bg-zinc-900/50 border-zinc-800"
                  : "bg-white border-gray-200 shadow-sm"
              )}
            >
              <Music className="w-5 h-5 text-primary-500 mb-2" />
              <p className="text-2xl font-bold">{songs.length}</p>
              <p
                className={
                  isDark ? "text-sm text-zinc-400" : "text-sm text-gray-500"
                }
              >
                Total songs
              </p>
            </div>
            <div
              className={cn(
                "p-4 rounded-xl border",
                isDark
                  ? "bg-zinc-900/50 border-zinc-800"
                  : "bg-white border-gray-200 shadow-sm"
              )}
            >
              <Smartphone className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{pairedDevice ? 1 : 0}</p>
              <p
                className={
                  isDark ? "text-sm text-zinc-400" : "text-sm text-gray-500"
                }
              >
                Devices
              </p>
            </div>
            <div
              className={cn(
                "p-4 rounded-xl border",
                isDark
                  ? "bg-zinc-900/50 border-zinc-800"
                  : "bg-white border-gray-200 shadow-sm"
              )}
            >
              <Clock className="w-5 h-5 text-purple-500 mb-2" />
              <p className="text-2xl font-bold">2.5h</p>
              <p
                className={
                  isDark ? "text-sm text-zinc-400" : "text-sm text-gray-500"
                }
              >
                Streamed today
              </p>
            </div>
            <div
              className={cn(
                "p-4 rounded-xl border",
                isDark
                  ? "bg-zinc-900/50 border-zinc-800"
                  : "bg-white border-gray-200 shadow-sm"
              )}
            >
              <Play className="w-5 h-5 text-orange-500 mb-2" />
              <p className="text-2xl font-bold">128</p>
              <p
                className={
                  isDark ? "text-sm text-zinc-400" : "text-sm text-gray-500"
                }
              >
                Plays this week
              </p>
            </div>
          </motion.section>

          {/* Recent songs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Library</h2>
              <Link
                href="/player"
                className={cn(
                  "flex items-center gap-1 text-sm transition-colors",
                  isDark
                    ? "text-zinc-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {isLoadingSongs ? (
              <Loading text="Loading your library..." />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {songs.slice(0, 5).map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div
                      onClick={() => handleSongSelect(song, index)}
                      className={cn(
                        "group block p-3 rounded-xl border transition-all cursor-pointer",
                        isDark
                          ? "bg-zinc-900/50 hover:bg-zinc-800/50 border-zinc-800"
                          : "bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
                      )}
                    >
                      <div
                        className={cn(
                          "relative aspect-square mb-3 rounded-lg overflow-hidden",
                          isDark ? "bg-zinc-800" : "bg-gray-100"
                        )}
                      >
                        {song.albumArt ? (
                          <img
                            src={song.albumArt}
                            alt={song.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Disc3
                              className={cn(
                                "w-12 h-12",
                                isDark ? "text-zinc-600" : "text-gray-400"
                              )}
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <h3 className="font-medium truncate text-sm">
                        {song.title}
                      </h3>
                      <p
                        className={cn(
                          "text-xs truncate",
                          isDark ? "text-zinc-400" : "text-gray-500"
                        )}
                      >
                        {song.artist}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </main>
      </div>
    </AuthGuard>
  );
}
