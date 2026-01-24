// API Types - Generated from Swagger definitions
// Catalog Service (port 4000) & Signaling Service (port 4001)

// ============== Common ==============

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

// ============== Catalog Service Models ==============

export interface Song {
  id: string;
  name: string;
  url: string;
  image?: string;
  duration: number;
  track_number?: number;
  explicit?: boolean;
  file_format?: string;
  bitrate?: number;
  local_path?: string;
  device_id: string; // Required: identifies source device
  artist_id?: string;
  album_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  image?: string;
  followers?: number;
  verified?: boolean;
}

export interface Album {
  id: string;
  name: string;
  image?: string;
  release_date?: string;
  artist_id?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  image?: string;
  private?: boolean;
  is_collaborative?: boolean;
  user_id?: string;
  artist_id?: string;
  songs?: Song[];
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  user_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  firebase_id: string;
  mobile?: string;
  photo_url?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: string;
  language?: string;
  notifications_enabled?: boolean;
}

export interface SyncRequest {
  device_id: string;
  songs: Omit<Song, "id" | "created_at" | "updated_at">[];
}

export interface SyncResponse {
  message: string;
  synced_count?: number;
}

// ============== Signaling Service Models ==============

export interface Device {
  id: string;
  device_name: string;
  device_type: "mobile" | "browser";
  is_source: boolean; // true if device holds physical audio files
  user_id: string;
  last_online_at?: string;
}

export interface RegisterDeviceRequest {
  device_name: string;
  device_type: "mobile" | "browser";
  is_source: boolean;
}

export interface GeneratePairCodeRequest {
  mobile_device_id: string;
}

export interface ConnectPairCodeRequest {
  browser_device_id: string;
  pair_code: string;
}

export interface DevicePairing {
  id: string;
  mobile_device_id: string;
  browser_device_id?: string;
  pair_code: string;
  status: "pending" | "paired" | "expired";
  expires_at: string;
}

// ============== Request/Response Types ==============

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  private?: boolean;
}

export interface UpdatePlaylistRequest {
  name?: string;
  description?: string;
  private?: boolean;
}

export interface AddSongToPlaylistRequest {
  song_id: string;
}

export interface CreateUserRequest {
  email?: string;
  firebase_id: string;
  first_name?: string;
  last_name?: string;
  mobile?: string;
  user_name?: string;
  photo_url?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  mobile?: string;
  user_name?: string;
  photo_url?: string;
  preferences?: UserPreferences;
}
