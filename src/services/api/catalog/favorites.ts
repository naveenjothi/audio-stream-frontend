import { catalogClient, extractData } from "../client";
import type { Song } from "@/types/api";

export async function getFavorites(): Promise<Song[]> {
  const response = await catalogClient.get<{ data: Song[] }>("/api/v1/favorites/");
  return extractData(response);
}

export async function likeSong(songId: string): Promise<void> {
  await catalogClient.post(`/api/v1/favorites/${songId}`);
}

export async function unlikeSong(songId: string): Promise<void> {
  await catalogClient.delete(`/api/v1/favorites/${songId}`);
}
