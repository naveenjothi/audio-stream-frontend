import { catalogClient, extractData } from "../client";
import type {
  Playlist,
  CreatePlaylistRequest,
  UpdatePlaylistRequest,
  AddSongToPlaylistRequest,
} from "@/types/api";

/**
 * Get all playlists
 */
export async function getPlaylists(): Promise<Playlist[]> {
  const response = await catalogClient.get<{ data: Playlist[] }>(
    "/api/v1/playlists/"
  );
  return extractData(response);
}

/**
 * Create a new playlist
 */
export async function createPlaylist(
  request: CreatePlaylistRequest
): Promise<Playlist> {
  const response = await catalogClient.post<{ data: Playlist }>(
    "/api/v1/playlists/",
    request
  );
  return extractData(response);
}

/**
 * Get playlist by ID
 */
export async function getPlaylistById(id: string): Promise<Playlist | null> {
  const response = await catalogClient.get<{ data: Playlist | null }>(
    `/api/v1/playlists/${id}`
  );
  return extractData(response);
}

/**
 * Update a playlist
 */
export async function updatePlaylist(
  id: string,
  request: UpdatePlaylistRequest
): Promise<Playlist> {
  const response = await catalogClient.put<{ data: Playlist }>(
    `/api/v1/playlists/${id}`,
    request
  );
  return extractData(response);
}

/**
 * Delete a playlist
 */
export async function deletePlaylist(id: string): Promise<void> {
  await catalogClient.delete(`/api/v1/playlists/${id}`);
}

/**
 * Add a song to a playlist
 */
export async function addSongToPlaylist(
  playlistId: string,
  request: AddSongToPlaylistRequest
): Promise<Playlist> {
  const response = await catalogClient.post<{ data: Playlist }>(
    `/api/v1/playlists/${playlistId}/songs`,
    request
  );
  return extractData(response);
}

/**
 * Remove a song from a playlist
 */
export async function removeSongFromPlaylist(
  playlistId: string,
  songId: string
): Promise<void> {
  await catalogClient.delete(`/api/v1/playlists/${playlistId}/songs/${songId}`);
}
