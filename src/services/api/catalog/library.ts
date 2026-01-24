import { catalogClient, extractData, handleAsyncEndpoint } from "../client";
import type { Song, SyncRequest, SyncResponse } from "@/types/api";

/**
 * Get songs for a specific device
 */
export async function getSongsForDevice(deviceId: string): Promise<Song[]> {
  const response = await catalogClient.get<{ data: Song[] }>(
    "/api/v1/library/songs",
    { params: { device_id: deviceId } }
  );
  return extractData(response);
}

/**
 * Sync library from device - ASYNC ENDPOINT
 * Returns 202 Accepted immediately. Show "Sync Started" toast, not a spinner.
 */
export async function syncLibrary(
  request: SyncRequest
): Promise<{ accepted: boolean; message?: string }> {
  const result = await handleAsyncEndpoint<SyncResponse>(
    catalogClient.post("/api/v1/library/sync", request)
  );
  return {
    accepted: result.accepted,
    message: result.data?.message,
  };
}
