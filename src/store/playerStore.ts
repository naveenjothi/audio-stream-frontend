import { create } from "zustand";
import type { Song, PlaybackState } from "@/types";

interface PlayerState extends PlaybackState {
  queue: Song[];
  queueIndex: number;
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPosition: (positionMs: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  setBuffering: (isBuffering: boolean) => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (positionMs: number) => void;
  reset: () => void;
}

const initialState: PlaybackState = {
  isPlaying: false,
  currentSong: null,
  positionMs: 0,
  durationMs: 0,
  volume: 0.8,
  isBuffering: false,
  isMuted: false,
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  ...initialState,
  queue: [],
  queueIndex: 0,

  setCurrentSong: (song) =>
    set({
      currentSong: song,
      positionMs: 0,
      durationMs: song?.duration || 0,
      isBuffering: true,
    }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setPosition: (positionMs) => set({ positionMs }),

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),

  setMuted: (isMuted) => set({ isMuted }),

  setBuffering: (isBuffering) => set({ isBuffering }),

  setQueue: (songs, startIndex = 0) =>
    set({
      queue: songs,
      queueIndex: startIndex,
      currentSong: songs[startIndex] || null,
      durationMs: songs[startIndex]?.duration || 0,
      positionMs: 0,
    }),

  nextTrack: () => {
    const { queue, queueIndex } = get();
    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      set({
        queueIndex: nextIndex,
        currentSong: queue[nextIndex],
        positionMs: 0,
        durationMs: queue[nextIndex]?.duration || 0,
        isBuffering: true,
      });
    }
  },

  previousTrack: () => {
    const { queue, queueIndex, positionMs } = get();
    // If we're more than 3 seconds into the song, restart it
    if (positionMs > 3000) {
      set({ positionMs: 0 });
    } else if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      set({
        queueIndex: prevIndex,
        currentSong: queue[prevIndex],
        positionMs: 0,
        durationMs: queue[prevIndex]?.duration || 0,
        isBuffering: true,
      });
    } else {
      set({ positionMs: 0 });
    }
  },

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  seek: (positionMs) => set({ positionMs }),

  reset: () => set({ ...initialState, queue: [], queueIndex: 0 }),
}));
