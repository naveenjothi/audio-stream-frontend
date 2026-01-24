import { catalogClient, extractData } from "../client";
import type { Song } from "@/types/api";

/**
 * Get all songs
 */
export async function getSongs(): Promise<Song[]> {
  const response = await catalogClient.get<{ data: Song[] }>("/api/v1/songs/");
  return extractData(response);
}

/**
 * Get song by ID
 */
export async function getSongById(id: string): Promise<Song | null> {
  const response = await catalogClient.get<{ data: Song | null }>(
    `/api/v1/songs/${id}`
  );
  return extractData(response);
}

/**
 * Create a new song
 */
export async function createSong(
  song: Omit<Song, "id" | "created_at" | "updated_at">
): Promise<Song> {
  const response = await catalogClient.post<{ data: Song }>(
    "/api/v1/songs/",
    song
  );
  return extractData(response);
}

/**
 * Update a song
 */
export async function updateSong(
  id: string,
  song: Partial<Song>
): Promise<Song> {
  const response = await catalogClient.put<{ data: Song }>(
    `/api/v1/songs/${id}`,
    song
  );
  return extractData(response);
}

/**
 * Delete a song
 */
export async function deleteSong(id: string): Promise<void> {
  await catalogClient.delete(`/api/v1/songs/${id}`);
}
