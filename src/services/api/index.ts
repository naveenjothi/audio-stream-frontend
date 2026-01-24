// API Services
// Re-export clients
export { catalogClient, signalingClient, extractData, handleAsyncEndpoint } from "./client";

// Re-export Catalog Service
export * from "./catalog";

// Re-export Signaling Service
export * from "./signaling";

// ============== Legacy Compatibility Aliases ==============
// These maintain backward compatibility with code using old API names

import { connectWithPairCode } from "./signaling/pairing";
import { registerDevice } from "./signaling/devices";
import type { Device } from "@/types/api";

/**
 * @deprecated Use connectWithPairCode from signaling service instead
 */
export async function verifyPairCode(pairCode: string) {
  // This needs the browser device ID - placeholder for migration
  // The old API had different semantics
  console.warn("verifyPairCode is deprecated. Use connectWithPairCode instead.");
  throw new Error("verifyPairCode requires migration to new signaling API flow");
}

/**
 * @deprecated Use registerDevice and getPairing from signaling service
 */
export async function getPairedDevice(): Promise<Device | null> {
  console.warn("getPairedDevice is deprecated. Use signaling service instead.");
  return null;
}

// Legacy playback functions - these need to be implemented with latest API
export async function playSong(songId: string) {
  console.warn("playSong needs implementation with current backend API");
  return { data: null, error: "Not implemented" };
}

export async function pausePlayback() {
  console.warn("pausePlayback needs implementation with current backend API");
  return { data: null, error: "Not implemented" };
}

export async function seekPlayback(positionMs: number) {
  console.warn("seekPlayback needs implementation with current backend API");
  return { data: null, error: "Not implemented" };
}

export async function setPlaybackVolume(level: number) {
  console.warn("setPlaybackVolume needs implementation with current backend API");
  return { data: null, error: "Not implemented" };
}

export async function nextTrack() {
  console.warn("nextTrack needs implementation with current backend API");
  return { data: null, error: "Not implemented" };
}

export async function previousTrack() {
  console.warn("previousTrack needs implementation with current backend API");
  return { data: null, error: "Not implemented" };
}
