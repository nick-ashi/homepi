import { config } from "../config.js";
import { loadRefreshToken, saveRefreshToken } from "./tokenStore.js";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";

const SCOPES = ["user-read-currently-playing", "user-read-playback-state", "user-modify-playback-state"].join(" ");

function basicAuthHeader(): string {
  const raw = `${config.spotify.clientId}:${config.spotify.clientSecret}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.spotify.clientId,
    scope: SCOPES,
    redirect_uri: config.spotify.redirectUri,
    state,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<void> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.spotify.redirectUri,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Spotify token exchange failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { refresh_token: string };
  await saveRefreshToken(data.refresh_token);
}

async function getAccessToken(): Promise<string> {
  const refreshToken = await loadRefreshToken();
  if (!refreshToken) {
    throw new Error("No Spotify refresh token stored yet. Visit /api/spotify/login first.");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Spotify token refresh failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
  };

  if (data.refresh_token) {
    await saveRefreshToken(data.refresh_token);
  }

  return data.access_token;
}

export interface NowPlaying {
  isPlaying: boolean;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  albumArtUrl?: string;
  progressMs?: number;
  durationMs?: number;
}

export async function getNowPlaying(): Promise<NowPlaying> {
  const accessToken = await getAccessToken();

  const response = await fetch(NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 204) {
    return { isPlaying: false };
  }

  if (!response.ok) {
    throw new Error(`Spotify now-playing request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();

  return {
    isPlaying: data.is_playing ?? false,
    trackName: data.item?.name,
    artistName: data.item?.artists?.map((a: { name: string }) => a.name).join(", "),
    albumName: data.item?.album?.name,
    albumArtUrl: data.item?.album?.images?.[0]?.url,
    progressMs: data.progress_ms,
    durationMs: data.item?.duration_ms,
  };
}

export async function playTrack(): Promise<void> {
  const access_token = await getAccessToken();

  const response = await fetch("https://api.spotify.com/v1/me/player/play", {
    method: "PUT",
    headers: { Authorization: `Bearer ${access_token}`},
  });

  if (!response.ok) {
    throw new Error(`Spotify play request failed: ${response.status} ${await response.text()}`);
  }
}

export async function pauseTrack(): Promise<void> {
  const access_token = await getAccessToken();

  const response = await fetch("https://api.spotify.com/v1/me/player/pause", {
    method: "PUT",
    headers: { Authorization: `Bearer ${access_token}`},
  });

  if (!response.ok) {
    throw new Error(`Spotify pause request failed: ${response.status} ${await response.text()}`);
  }
}

export async function skipToNextTrack(): Promise<void> {
  const accessToken = await getAccessToken();

  const response = await fetch("https://api.spotify.com/v1/me/player/next", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Spotify skip-to-next request failed: ${response.status} ${await response.text()}`);
  }
}

export async function skipToPreviousTrack(): Promise<void> {
  const accessToken = await getAccessToken();

  const response = await fetch("https://api.spotify.com/v1/me/player/previous", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Spotify skip-to-prev request failed: ${response.status} ${await response.text()}`)
  }
}
