const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

export interface NowPlaying {
  isPlaying: boolean;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  albumArtUrl?: string;
  progressMs?: number;
  durationMs?: number;
}

export interface WeatherCurrent {
  temperature_2m: number;
  weather_code: number;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request to ${path} failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  nowPlaying: () => getJson<NowPlaying>("/api/spotify/now-playing"),
  skipToNextTrack: () => fetch(`${BASE_URL}/api/spotify/skip-to-next`, { method: "POST" }).then((res) => {
    if (!res.ok) {
      throw new Error(`Request to skip to next track failed: ${res.status}`);
    }
  }),
  skipToPreviousTrack: () => fetch(`${BASE_URL}/api/spotify/skip-to-previous`, {method: "POST"}).then((res) => {
    if (!res.ok) {
      throw new Error(`Request to skip to next track failed: ${res.status}`);
    }
  }),
  playTrack: () => fetch(`${BASE_URL}/api/spotify/play-track`, {method: "PUT"}).then((res) => {
    if (!res.ok) {
      throw new Error(`Request to play track failed: ${res.status}`);
    }
  }),
  pauseTrack: () => fetch(`${BASE_URL}/api/spotify/pause-track`, {method: "PUT"}).then((res) => {
    if (!res.ok) {
      throw new Error(`Request to pause track failed: ${res.status}`);
    }
  }),
  weather: () => getJson<WeatherCurrent>("/api/weather"),
  photos: () => getJson<string[]>("/api/photos").then((paths) => paths.map((p) => `${BASE_URL}${p}`)),
};
