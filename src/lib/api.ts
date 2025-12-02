import { getIdToken } from "./firebase";
import type { Song, Device, PairResponse, ApiResponse, User } from "@/types";

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
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
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

    const result = await response.json();
    return { data: result.data };
  } catch (error) {
    console.error("API Error:", error);
    return {
      data: null as T,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createUser(userData: {
  email: string | null;
  firebase_id: string;
  first_name?: string;
  last_name?: string;
  mobile?: string;
  user_name?: string;
  photo_url?: string;
}): Promise<ApiResponse<User>> {
  const formData = new FormData();
  if (userData.email) formData.append("email", userData.email);
  formData.append("firebase_id", userData.firebase_id);
  if (userData.first_name) formData.append("first_name", userData.first_name);
  if (userData.last_name) formData.append("last_name", userData.last_name);
  if (userData.mobile) formData.append("mobile", userData.mobile);
  if (userData.user_name) formData.append("user_name", userData.user_name);

  if (userData.photo_url) formData.append("photo_url", userData.photo_url);

  return fetchWithAuth<User>("/users", {
    method: "POST",
    body: formData,
  });
}

export async function getUserById(id: string): Promise<ApiResponse<User>> {
  return fetchWithAuth<User>(`/users/${id}`);
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
