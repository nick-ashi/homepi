import { useEffect, useState } from "react";
import { api, type NowPlaying } from "../api";

const POLL_INTERVAL_MS = 5000;

export function NowPlayingPage() {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await api.nowPlaying();
        if (!cancelled) {
          setNowPlaying(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (error) {
    return (
      <div className="page now-playing-page">
        <p className="muted">Spotify unavailable: {error}</p>
      </div>
    );
  }

  if (!nowPlaying || !nowPlaying.isPlaying) {
    return (
      <div className="page now-playing-page">
        <p className="muted">Nothing playing right now</p>
      </div>
    );
  }

  return (
    <div className="page now-playing-page">
      {nowPlaying.albumArtUrl && (
        <img className="album-art" src={nowPlaying.albumArtUrl} alt={nowPlaying.albumName} draggable={false} />
      )}
      <h1>{nowPlaying.trackName}</h1>
      <h2 className="muted">{nowPlaying.artistName}</h2>
    </div>
  );
}
