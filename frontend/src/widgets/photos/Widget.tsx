import { useEffect, useRef, useState } from "react";
import { api, type PhotoEntry } from "../../api";
import { PixelIcon } from "../PixelIcon";
import type { PhotosSettings } from "../types";

const FADE_MS = 600;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildOrder(photos: PhotoEntry[], order: PhotosSettings["order"], avoidFirst?: PhotoEntry): PhotoEntry[] {
  if (order === "name") return [...photos].sort((a, b) => a.name.localeCompare(b.name));
  if (order === "date") return [...photos].sort((a, b) => (a.takenAt ?? "").localeCompare(b.takenAt ?? ""));

  const shuffled = shuffle(photos);
  if (avoidFirst && shuffled.length > 1 && shuffled[0].url === avoidFirst.url) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

export function PhotosWidget({ settings }: { settings: PhotosSettings }) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [playOrder, setPlayOrder] = useState<PhotoEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [prevPhoto, setPrevPhoto] = useState<PhotoEntry | null>(null);
  const [progressKey, setProgressKey] = useState(0);

  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api
      .photos()
      .then((entries) => {
        setPhotos(entries);
        setPlayOrder(buildOrder(entries, settings.order));
        setIndex(0);
      })
      .catch(() => setPhotos([]));
    // Only re-fetch the photo list on mount; order changes just reorder what we already have.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;
    setPlayOrder(buildOrder(photos, settings.order));
    setIndex(0);
  }, [settings.order, photos]);

  useEffect(() => {
    if (playOrder.length < 2) return;

    const id = setInterval(() => {
      setIndex((current) => {
        const next = current + 1;
        if (next >= playOrder.length) {
          if (settings.order === "shuffle") {
            setPlayOrder(buildOrder(photos, "shuffle", playOrder[current]));
          }
          setPrevPhoto(playOrder[current]);
          return 0;
        }
        setPrevPhoto(playOrder[current]);
        return next;
      });
      setProgressKey((k) => k + 1);

      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = setTimeout(() => setPrevPhoto(null), FADE_MS);
    }, settings.intervalSec * 1000);

    return () => {
      clearInterval(id);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, [playOrder, settings.intervalSec, settings.order, photos]);

  if (photos.length === 0) {
    return (
      <div className="photos-widget photos-widget-empty">
        <PixelIcon name="picture" size={96} />
        <p className="muted">No photos in {settings.folder}</p>
      </div>
    );
  }

  const current = playOrder[index];
  const caption = current?.takenAt ? new Date(current.takenAt).toLocaleDateString() : current?.name;

  return (
    <div className="photos-widget">
      <div className="felt-inset">
        {prevPhoto && (
          <img
            key={prevPhoto.url}
            src={prevPhoto.url}
            alt=""
            draggable={false}
            className="photo-layer photo-layer-out"
            style={{ objectFit: settings.fit }}
          />
        )}
        {current && (
          <img
            key={current.url}
            src={current.url}
            alt=""
            draggable={false}
            className="photo-layer photo-layer-in"
            style={{ objectFit: settings.fit }}
          />
        )}

        {settings.showCaption && current && (
          <div className="photo-caption">
            <span className="photo-caption-name">{caption}</span>
            <span className="photo-caption-count muted">
              {index + 1} / {playOrder.length}
            </span>
          </div>
        )}
      </div>

      <div className="photo-progress-track">
        <div key={progressKey} className="photo-progress-fill" style={{ animationDuration: `${settings.intervalSec}s` }} />
      </div>
    </div>
  );
}
