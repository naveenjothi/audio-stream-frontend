import { catalogClient, extractData } from "../client";
import type { DashboardStats } from "@/types/api";

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await catalogClient.get<{ data: DashboardStats }>(
    "/api/v1/dashboard/stats",
  );
  return extractData(response);
}

export async function recordHistory(payload: {
  song_id: string;
  duration_played_ms: number;
  is_completed: boolean;
}): Promise<void> {
  await catalogClient.post("/api/v1/history", payload);
}
