// Type definitions for the application

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in milliseconds
  albumArt?: string;
  filePath: string;
}

export interface Device {
  id: string;
  name: string;
  type: "mobile" | "desktop" | "tablet";
  status: "online" | "offline" | "connecting";
  lastSeen?: Date;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  userId: string;
  songs?: Song[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentSong: Song | null;
  positionMs: number;
  durationMs: number;
  volume: number;
  isBuffering: boolean;
  isMuted: boolean;
}

export interface SignalingMessage {
  type: "offer" | "answer" | "candidate";
  from: string;
  to: string;
  sdp?: string;
  candidate?: RTCIceCandidateInit;
}

export interface PlaybackEvent {
  type: "PLAY" | "PAUSE" | "SEEK" | "VOLUME" | "NEXT" | "PREVIOUS" | "STOP";
  songId?: string;
  positionMs?: number;
  level?: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PairRequest {
  pairCode: string;
}

export interface PairResponse {
  success: boolean;
  device?: Device;
  message?: string;
}
