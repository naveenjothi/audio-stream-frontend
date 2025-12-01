import { getIdToken } from "./firebase";
import type { Song, Device, PairResponse, ApiResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Generic fetch wrapper with auth
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getIdToken();

  if (!token) {
    return { data: null as T, error: "Not authenticated" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null as T,
        error: errorData.message || `HTTP error ${response.status}`,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("API Error:", error);
    return {
      data: null as T,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Songs API
export async function getSongs(): Promise<ApiResponse<Song[]>> {
  return fetchWithAuth<Song[]>("/songs");
}

export async function getSongById(songId: string): Promise<ApiResponse<Song>> {
  return fetchWithAuth<Song>(`/songs/${songId}`);
}

// Device Pairing API
export async function verifyPairCode(
  pairCode: string
): Promise<ApiResponse<PairResponse>> {
  return fetchWithAuth<PairResponse>("/devices/pair/verify", {
    method: "POST",
    body: JSON.stringify({ pairCode }),
  });
}

export async function getPairedDevice(): Promise<ApiResponse<Device | null>> {
  return fetchWithAuth<Device | null>("/devices/paired");
}

export async function unpairDevice(): Promise<
  ApiResponse<{ success: boolean }>
> {
  return fetchWithAuth<{ success: boolean }>("/devices/unpair", {
    method: "POST",
  });
}

// Playback Control API
export async function playSong(
  songId: string
): Promise<ApiResponse<{ success: boolean }>> {
  return fetchWithAuth<{ success: boolean }>("/playback/play", {
    method: "POST",
    body: JSON.stringify({ songId }),
  });
}

export async function pausePlayback(): Promise<
  ApiResponse<{ success: boolean }>
> {
  return fetchWithAuth<{ success: boolean }>("/playback/pause", {
    method: "POST",
  });
}

export async function seekPlayback(
  positionMs: number
): Promise<ApiResponse<{ success: boolean }>> {
  return fetchWithAuth<{ success: boolean }>("/playback/seek", {
    method: "POST",
    body: JSON.stringify({ positionMs }),
  });
}

export async function setPlaybackVolume(
  level: number
): Promise<ApiResponse<{ success: boolean }>> {
  return fetchWithAuth<{ success: boolean }>("/playback/volume", {
    method: "POST",
    body: JSON.stringify({ level }),
  });
}

export async function nextTrack(): Promise<ApiResponse<{ success: boolean }>> {
  return fetchWithAuth<{ success: boolean }>("/playback/next", {
    method: "POST",
  });
}

export async function previousTrack(): Promise<
  ApiResponse<{ success: boolean }>
> {
  return fetchWithAuth<{ success: boolean }>("/playback/previous", {
    method: "POST",
  });
}
