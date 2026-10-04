import { useEffect, useState } from "react";
import { api, type WeatherCurrent } from "../api";
import { describeWeatherCode } from "../weatherCodes";

const WEATHER_POLL_MS = 10 * 60 * 1000;
const PHOTO_ROTATE_MS = 15000;

function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const data = await api.weather();
        if (!cancelled) setWeather(data);
      } catch {
        // leave last known value on screen rather than erroring out
      }
    }
    poll();
    const id = setInterval(poll, WEATHER_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!weather) return <div className="widget weather-widget muted">Loading weather…</div>;

  return (
    <div className="widget weather-widget">
      <div className="weather-temp">{Math.round(weather.temperature_2m)}°F</div>
      <div className="muted">{describeWeatherCode(weather.weather_code)}</div>
    </div>
  );
}

function PhotoWidget() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    api.photos().then(setPhotos).catch(() => setPhotos([]));
  }, []);

  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), PHOTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [photos.length]);

  if (photos.length === 0) {
    return <div className="widget photo-widget muted">No photos found</div>;
  }

  return (
    <div className="widget photo-widget">
      <img src={photos[index]} alt="" draggable={false} />
    </div>
  );
}

export function WidgetsPage() {
  return (
    <div className="page widgets-page">
      <WeatherWidget />
      <PhotoWidget />
    </div>
  );
}
