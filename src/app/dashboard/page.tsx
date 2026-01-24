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
  Heart,
  Database,
} from "lucide-react";
import { AuthGuard, useAuth } from "@/components/auth";
import { SongList } from "@/components/songs";
import { Loading, useToast } from "@/components/shared";
import { useDeviceStore, usePlayerStore, useThemeStore } from "@/store";
import {
  getSongs,
  getPairedDevice,
  getDashboardStats,
  getFavorites,
  likeSong,
  unlikeSong,
  recordHistory,
} from "@/services/api";
import type { Song as ApiSong } from "@/types/api";
import { logOut } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Logo } from "@/components/landing/Logo";

// Local Song type for UI (maps from API)
interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  albumArt?: string;
  filePath: string;
}

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
  const [stats, setStats] = useState<any>(null);
  const [favorites, setFavorites] = useState<Song[]>([]);

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
      // Fetch stats
      const dashboardStats = await getDashboardStats();
      if (dashboardStats) {
        setStats(dashboardStats);
      }

      // Fetch favorites
      const favSongs = await getFavorites();
      if (favSongs) {
        setFavorites(favSongs.map(s => ({
          id: s.id || "",
          title: s.name,
          artist: s.artists?.[0]?.name || "Unknown Artist",
          album: undefined,
          duration: (s.duration || 0) * 1000,
          albumArt: s.image,
          filePath: s.url || "",
        })));
      }

      // Fetch paired device
      const device = await getPairedDevice();
      if (device) {
        setPairedDevice(device);
        setConnectionStatus("connected");
      }

      // Fetch songs from new API
      const apiSongs = await getSongs();
      if (apiSongs && apiSongs.length > 0) {
        // Map API songs to UI Song format
        const mappedSongs: Song[] = apiSongs.map((s: ApiSong) => ({
          id: s.id,
          title: s.name,
          artist: s.artists?.[0]?.name || "Unknown Artist",
          album: undefined,
          duration: s.duration * 1000, // convert to ms if needed
          albumArt: s.image,
          filePath: s.url,
        }));
        setSongs([...mappedSongs]);
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
    
    // Record history (async, don't block navigation)
    if (song.id) {
        recordHistory({
            song_id: song.id,
            duration_played_ms: 0, // Should be updated during playback
            is_completed: false
        }).catch(err => console.error("Failed to record history:", err));
    }

    router.push("/player");
  };

  const handleLikeSong = async (songId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeSong(songId);
        addToast("Removed from favorites", "info");
      } else {
        await likeSong(songId);
        addToast("Added to favorites", "success");
      }
      fetchData(); // Refresh to update list and stats
    } catch (error) {
      addToast("Failed to update favorite", "error");
    }
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
      <div className="min-h-screen bg-tps-charcoal text-white transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 bg-tps-charcoal/80">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Logo/>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 hover:bg-white/5 rounded-full text-tps-muted hover:text-white transition-colors"
                  title="Refresh"
                >
                  <RefreshCw
                    className={cn("w-5 h-5", isRefreshing && "animate-spin")}
                  />
                </button>
                <Link href="/settings">
                  <button className="p-2 hover:bg-white/5 rounded-full text-tps-muted hover:text-white transition-colors" title="Settings">
                    <Settings className="w-5 h-5" />
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-white/5 rounded-full text-red-400 hover:text-red-300 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full flex items-center justify-center ml-2 bg-tps-surface border border-white/5">
                  <User className="w-4 h-4 text-tps-muted" />
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              {greeting()}
              {user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
            </h1>
            <p className="text-tps-muted">
              Ready to stream in high fidelity?
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Device Status - Large Card (2 columns on Desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 p-8 rounded-tps bg-tps-surface border border-white/5 relative overflow-hidden group"
            >
                {/* Background Decor */}
                <div className={cn(
                    "absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 transition-colors duration-700",
                    connectedDevice ? "bg-tps-cyan/10" : "bg-white/5"
                )} />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                      connectedDevice ? "bg-tps-cyan/20 text-tps-cyan" : "bg-white/5 text-tps-muted"
                  )}>
                    <Smartphone className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {connectedDevice ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_currentColor]" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                            Connected
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-tps-muted" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-tps-muted">
                            Offline
                          </span>
                        </>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {connectedDevice ? pairedDevice.device_name : "No Device Paired"}
                    </h3>
                    <p className="text-tps-muted text-sm max-w-xs">
                      {connectedDevice
                        ? "Ready to stream bit-perfect audio."
                        : "Pair your mobile device to enable peer-to-peer streaming."}
                    </p>
                  </div>
                </div>

                <Link href="/pair">
                  <button className={cn(
                      "px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all shadow-lg",
                      connectedDevice
                        ? "bg-white/10 hover:bg-white/15 text-white ring-1 ring-white/10"
                        : "bg-gradient-to-r from-tps-cyan to-blue-500 hover:shadow-tps-cyan/25 text-black border-none"
                    )}>
                    {connectedDevice ? "Manage Device" : "Connect Now"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 lg:col-span-1">
                 {[
                    { icon: Music, label: "Songs", value: stats?.total_songs || songs.length, color: "text-tps-cyan" },
                    { icon: Play, label: "Plays", value: stats?.total_plays || 0, color: "text-tps-lilac" },
                    { icon: Clock, label: "Hours", value: stats?.total_hours ? `${stats.total_hours.toFixed(1)}h` : "0h", color: "text-emerald-400" },
                    { icon: Database, label: "Cloud Impact", value: stats?.storage_saved_mb ? `${(stats.storage_saved_mb / 1024).toFixed(1)}GB` : "0GB", color: "text-orange-400" },
                 ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + (i * 0.05) }}
                        className="p-5 rounded-3xl bg-tps-surface border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors"
                    >
                         <stat.icon className={cn("w-6 h-6 mb-4", stat.color)} />
                         <div>
                             <p className="text-2xl font-bold text-white">{stat.value}</p>
                             <p className="text-xs text-tps-muted uppercase font-bold tracking-wider">{stat.label}</p>
                         </div>
                    </motion.div>
                 ))}
            </div>

            {/* Top Artists */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-tps bg-tps-surface border border-white/5 lg:col-span-1"
            >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-tps-lilac" />
                    Top Artists
                </h3>
                <div className="space-y-4">
                    {stats?.top_artists?.length > 0 ? (
                        stats.top_artists.map((artist: any, i: number) => (
                            <div key={artist.artist_id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-tps-muted">
                                        {i + 1}
                                    </div>
                                    <span className="text-sm font-medium truncate max-w-[100px]">{artist.name}</span>
                                </div>
                                <span className="text-xs text-tps-muted font-mono">{artist.play_count} plays</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-tps-muted italic text-center py-4">Start listening to see stats</p>
                    )}
                </div>
            </motion.div>
          </div>

          {/* Favorites */}
          {favorites.length > 0 && (
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-12"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                        Your Favorites
                    </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {favorites.map((song, index) => (
                        <SongCard 
                            key={`fav-${song.id}`} 
                            song={song} 
                            index={index} 
                            isLiked={true}
                            onSelect={() => handleSongSelect(song, songs.findIndex(s => s.id === song.id))}
                            onLike={() => handleLikeSong(song.id, true)}
                        />
                    ))}
                </div>
            </motion.section>
          )}

          {/* Recently Added */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">Recently Synced</h2>
              <Link
                href="/player"
                className="flex items-center gap-1 text-sm text-tps-cyan hover:text-tps-lilac transition-colors font-medium"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {isLoadingSongs ? (
              <Loading text="Loading your library..." />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {(stats?.recently_added?.length > 0 ? stats.recently_added : songs.slice(0, 6)).map((apiSong: any, index: number) => {
                  const song = stats?.recently_added?.length > 0 ? {
                    id: apiSong.id,
                    title: apiSong.name,
                    artist: apiSong.artists?.[0]?.name || "Unknown Artist",
                    album: undefined,
                    duration: apiSong.duration * 1000,
                    albumArt: apiSong.image,
                    filePath: apiSong.url,
                  } : apiSong;
                  
                  return (
                    <SongCard 
                      key={song.id} 
                      song={song} 
                      index={index} 
                      isLiked={favorites.some(f => f.id === song.id)}
                      onSelect={() => handleSongSelect(song, index)}
                      onLike={() => handleLikeSong(song.id, favorites.some(f => f.id === song.id))}
                      showSyncedBadge={stats?.recently_added?.length > 0}
                    />
                  );
                })}
              </div>
            )}
          </motion.section>
        </main>
      </div>
    </AuthGuard>
  );
}

// Sub-component for Song Card
function SongCard({ song, index, isLiked, onSelect, onLike, showSyncedBadge }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
        >
            <div className="group block p-3 rounded-2xl bg-transparent hover:bg-tps-surface transition-all cursor-pointer relative">
                <div 
                    onClick={onSelect}
                    className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-tps-surface shadow-md group-hover:shadow-tps-cyan/10 transition-shadow"
                >
                    {song.albumArt ? (
                        <img
                            src={song.albumArt}
                            alt={song.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-tps-surface to-black border border-white/5">
                            <Disc3 className="w-10 h-10 text-tps-muted" />
                        </div>
                    )}
                    
                    {showSyncedBadge && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-tps-cyan/90 text-[10px] font-bold text-black backdrop-blur-sm z-20 flex items-center gap-1 shadow-lg border border-white/10">
                            <Wifi className="w-2.5 h-2.5" />
                            SYNCED
                        </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                        <div className="w-12 h-12 rounded-full bg-tps-cyan flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                        </div>
                    </div>
                </div>

                <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 overflow-hidden">
                        <h3 className="font-bold text-white truncate text-sm mb-1 group-hover:text-tps-cyan transition-colors">
                            {song.title}
                        </h3>
                        <p className="text-xs text-tps-muted truncate">
                            {song.artist}
                        </p>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onLike();
                        }}
                        className={cn(
                            "p-1.5 rounded-full hover:bg-white/10 transition-colors",
                            isLiked ? "text-red-400" : "text-tps-muted"
                        )}
                    >
                        <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
