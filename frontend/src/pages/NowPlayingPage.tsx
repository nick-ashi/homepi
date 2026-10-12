import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { api, type NowPlaying } from "../api";
import { EqVisualizer } from "../components/EqVisualizer";
import { PlaybackControls } from "../components/PlaybackControls";

const POLL_INTERVAL_MS = 5000;

// Must match the rotate() values in the .tonearm / .tonearm.playing CSS rules.
// REST_ANGLE needs enough magnitude that the arm's tip actually clears the
// vinyl's radius from its pivot - -50 looked "off" but the tip math still put
// it inside the disc; -82 puts it ~17px outside the vinyl's edge.
const REST_ANGLE = -82;
const PLAY_ANGLE = -24;
const DRAG_THRESHOLD_PX = 4;

const MOTES = [
  { left: 10, top: 20, delay: 0 },
  { left: 22, top: 55, delay: 1.1 },
  { left: 35, top: 12, delay: 2.3 },
  { left: 48, top: 70, delay: 3.4 },
  { left: 60, top: 25, delay: 4.5 },
  { left: 72, top: 60, delay: 5.6 },
  { left: 85, top: 15, delay: 6.7 },
  { left: 15, top: 80, delay: 7.2 },
  { left: 90, top: 45, delay: 1.8 },
  { left: 55, top: 42, delay: 4.9 },
];

function angleFromPointer(clientX: number, clientY: number, pivotX: number, pivotY: number): number {
  const dx = clientX - pivotX;
  const dy = clientY - pivotY;
  let deg = (Math.atan2(dy, dx) * 180) / Math.PI - 180;
  if (deg < -180) deg += 360;
  if (deg > 180) deg -= 360;
  return Math.min(PLAY_ANGLE, Math.max(REST_ANGLE, deg));
}

export function NowPlayingPage() {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [optimisticPlaying, setOptimisticPlaying] = useState<boolean | null>(null);
  const [dragAngle, setDragAngle] = useState<number | null>(null);

  const tonearmRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ pivotX: number; pivotY: number; startX: number; startY: number; moved: boolean } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await api.nowPlaying();
        if (!cancelled) {
          setNowPlaying(data);
          setError(null);
          setOptimisticPlaying(null);
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

  const isPlaying = optimisticPlaying ?? nowPlaying?.isPlaying ?? false;

  function commitPlayPause(target: boolean) {
    setOptimisticPlaying(target);
    if (target) {
      api.playTrack();
    } else {
      api.pauseTrack();
    }
  }

  function handleTonearmPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    // Keep this gesture from also being read as an Embla carousel swipe.
    e.stopPropagation();
    const el = tonearmRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragStartRef.current = {
      pivotX: rect.right,
      pivotY: rect.top + rect.height / 2,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    el.setPointerCapture(e.pointerId);
  }

  function handleTonearmPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    const start = dragStartRef.current;
    if (!start) return;
    if (Math.hypot(e.clientX - start.startX, e.clientY - start.startY) > DRAG_THRESHOLD_PX) {
      start.moved = true;
    }
    setDragAngle(angleFromPointer(e.clientX, e.clientY, start.pivotX, start.pivotY));
  }

  function handleTonearmPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start) return;

    if (!start.moved) {
      commitPlayPause(!isPlaying);
    } else if (dragAngle !== null) {
      commitPlayPause(dragAngle > (REST_ANGLE + PLAY_ANGLE) / 2);
    }
    setDragAngle(null);
  }

  return (
    <div className="page now-playing-page">
      {MOTES.map((mote, i) => (
        <div
          key={i}
          className="ambient-mote"
          style={{ left: `${mote.left}%`, top: `${mote.top}%`, animationDelay: `${mote.delay}s` }}
        />
      ))}

      <div className="turntable">
        <div className="turntable-plaque" />
        <div className="turntable-switch switch-1" />
        <div className="turntable-switch switch-2" />
        <div className={`turntable-led ${isPlaying ? "on" : ""}`} />

        <div className={`vinyl ${isPlaying ? "spinning" : ""}`}>
          <div className="vinyl-label">
            {nowPlaying?.albumArtUrl && (
              <img src={nowPlaying.albumArtUrl} alt={nowPlaying.albumName} draggable={false} />
            )}
          </div>
        </div>
        <div
          ref={tonearmRef}
          className={`tonearm ${isPlaying ? "playing" : ""} ${dragAngle !== null ? "dragging" : ""}`}
          style={dragAngle !== null ? { transform: `rotate(${dragAngle}deg)` } : undefined}
          onPointerDown={handleTonearmPointerDown}
          onPointerMove={handleTonearmPointerMove}
          onPointerUp={handleTonearmPointerUp}
          onPointerCancel={handleTonearmPointerUp}
        />
      </div>

      {error ? (
        <p className="muted">Spotify unavailable: {error}</p>
      ) : nowPlaying?.isPlaying ? (
        <>
          <h1>{nowPlaying.trackName}</h1>
          <h2 className="muted">{nowPlaying.artistName}</h2>
        </>
      ) : (
        <p className="muted">
          \.....OFFLINE...../<br></br>
        </p>
      )}

      <EqVisualizer active={isPlaying} />
      <PlaybackControls
        isPlaying={isPlaying}
        onSkipBack={() => api.skipToPreviousTrack()}
        onPlayPause={() => commitPlayPause(!isPlaying)}
        onSkipNext={() => api.skipToNextTrack()}
      />
    </div>
  );
}
