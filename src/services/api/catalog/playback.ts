import { recordHistory } from "./dashboard";

/**
 * Play a song and record history
 */
export async function playSong(songId: string) {
  try {
    await recordHistory({
      song_id: songId,
      duration_played_ms: 0,
      is_completed: false,
    });
  } catch (error) {
    console.error("Failed to record play history:", error);
  }
}

/**
 * Pause playback (placeholder for future WS event)
 */
export async function pausePlayback() {
  console.log("Playback paused");
}

/**
 * Seek playback (placeholder for future WS event)
 */
export async function seekPlayback(positionMs: number) {
  console.log(`Playback seeking to ${positionMs}ms`);
}

/**
 * Set playback volume (placeholder for future WS event)
 */
export async function setPlaybackVolume(level: number) {
  console.log(`Playback volume set to ${level}`);
}

/**
 * Skip to next track (placeholder for future WS event)
 */
export async function nextTrack() {
  console.log("Next track clicked");
}

/**
 * Go to previous track (placeholder for future WS event)
 */
export async function previousTrack() {
  console.log("Previous track clicked");
}
