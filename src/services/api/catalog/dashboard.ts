import { catalogClient, extractData } from "../client";
import { Song } from "@/types/api";

export interface ArtistStat {
  name: string;
  play_count: number;
  artist_id: string;
}

export interface DashboardStats {
  total_plays: number;
  total_hours: number;
  total_songs: number;
  storage_saved_mb: number;
  top_artists: ArtistStat[];
  recent_plays: Song[];
  recently_added: Song[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await catalogClient.get<{ data: DashboardStats }>("/api/v1/dashboard/stats");
  return extractData(response);
}

export async function recordHistory(payload: {
  song_id: string;
  duration_played_ms: number;
  is_completed: boolean;
}): Promise<void> {
  await catalogClient.post("/api/v1/history", payload);
}
