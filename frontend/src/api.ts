import type { WidgetsConfig } from "./widgets/types";

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

export interface WeatherHourEntry {
  time: string;
  temperature: number;
  weatherCode: number;
  isDay: boolean;
}

export interface WeatherResponse {
  location: string;
  units: "F" | "C";
  current: { temperature: number; weatherCode: number; isDay: boolean };
  today: { high: number; low: number };
  hourly: WeatherHourEntry[];
  fetchedAt: string;
}

export interface PhotoEntry {
  url: string;
  name: string;
  takenAt?: string;
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
  weather: () => getJson<WeatherResponse>("/api/weather"),
  photos: () =>
    getJson<PhotoEntry[]>("/api/photos").then((entries) =>
      entries.map((entry) => ({ ...entry, url: `${BASE_URL}${entry.url}` })),
    ),
  widgetsConfig: () => getJson<WidgetsConfig>("/api/widgets"),
  saveWidgetsConfig: (next: WidgetsConfig) =>
    fetch(`${BASE_URL}/api/widgets`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.errors?.join(", ") ?? `Request to save widgets config failed: ${res.status}`);
      }
      return res.json() as Promise<WidgetsConfig>;
    }),
};
