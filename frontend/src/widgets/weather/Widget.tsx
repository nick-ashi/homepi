import { useEffect, useState } from "react";
import { api, type WeatherResponse } from "../../api";
import { describeWeatherCode } from "../../weatherCodes";
import { PixelIcon } from "../PixelIcon";
import { iconForWeatherCode } from "../weatherIcon";
import type { WeatherSettings } from "../types";

function formatHourLabel(timeStr: string): string {
  const hour24 = Number(timeStr.slice(11, 13));
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}${suffix}`;
}

export function WeatherWidget({ settings }: { settings: WeatherSettings }) {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await api.weather();
        if (!cancelled) {
          setWeather(data);
          setIsStale(false);
        }
      } catch {
        // leave the last known value on screen rather than erroring out
      }
    }

    poll();
    const id = setInterval(poll, Math.max(1, settings.refreshMin) * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [settings.refreshMin]);

  // Recompute staleness on a timer rather than inline during render, which
  // would call Date.now() as part of render output.
  useEffect(() => {
    if (!weather) return;
    const staleAfterMs = settings.refreshMin * 2 * 60 * 1000;
    const fetchedAtMs = new Date(weather.fetchedAt).getTime();

    const check = () => setIsStale(Date.now() - fetchedAtMs > staleAfterMs);
    check();
    const id = setInterval(check, 30 * 1000);
    return () => clearInterval(id);
  }, [weather, settings.refreshMin]);

  if (!weather) {
    return <div className="weather-widget muted">Loading weather…</div>;
  }

  const unitLabel = weather.units === "F" ? "°F" : "°C";
  const hourly = weather.hourly.slice(0, settings.hourlyCount);

  return (
    <div className="weather-widget">
      <div className="weather-header">
        <span className="muted">{weather.location}</span>
        <span className="weather-status">
          <span className={`weather-led ${isStale ? "stale" : "live"}`} />
          <span className="muted">{isStale ? "stale" : "live"}</span>
        </span>
      </div>

      <div className="weather-now">
        <div>
          <div className="weather-temp">
            {Math.round(weather.current.temperature)}
            {unitLabel}
          </div>
          <div className="weather-condition">{describeWeatherCode(weather.current.weatherCode)}</div>
        </div>
        <PixelIcon name={iconForWeatherCode(weather.current.weatherCode, weather.current.isDay)} size={104} />
      </div>

      <div className="weather-hilo">
        <span>
          <span className="muted">H</span> {Math.round(weather.today.high)}°
        </span>
        <span>
          <span className="muted">L</span> {Math.round(weather.today.low)}°
        </span>
      </div>

      {settings.hourlyCount > 0 && (
        <>
          <div className="divider-dashed" />
          <div className="weather-hourly">
            {hourly.map((hour) => (
              <div key={hour.time} className="weather-hour">
                <span className="muted">{formatHourLabel(hour.time)}</span>
                <PixelIcon name={iconForWeatherCode(hour.weatherCode, hour.isDay)} size={32} />
                <span>{Math.round(hour.temperature)}°</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
