import { Router } from "express";
import { config } from "../config.js";
import { loadWidgetsConfig } from "../widgets/store.js";
import { findWidgetSettings, type WeatherSettings } from "../widgets/types.js";

export const weatherRouter = Router();

interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

// Cached by the exact location string - a new string is automatically a cache miss.
let geocodeCache: { location: string; result: GeocodeResult } | null = null;

async function geocodeLocation(location: string): Promise<GeocodeResult> {
  if (geocodeCache && geocodeCache.location === location) {
    return geocodeCache.result;
  }

  const params = new URLSearchParams({ name: location, count: "1", language: "en", format: "json" });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Geocoding request failed: ${response.status}`);
  }

  const data = await response.json();
  const match = data.results?.[0];
  if (!match) {
    throw new Error(`Could not find a location matching "${location}"`);
  }

  const result: GeocodeResult = {
    latitude: match.latitude,
    longitude: match.longitude,
    displayName: [match.name, match.admin1, match.country].filter(Boolean).join(", "),
  };
  geocodeCache = { location, result };
  return result;
}

// Cached by rounded lat/lon - only re-fetched if the coordinates actually move.
let reverseGeocodeCache: { key: string; displayName: string } | null = null;

async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  if (reverseGeocodeCache && reverseGeocodeCache.key === key) {
    return reverseGeocodeCache.displayName;
  }

  const params = new URLSearchParams({
    format: "json",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "10",
  });

  // Nominatim's usage policy just asks for an identifying User-Agent and no
  // more than ~1 req/sec, which the cache above already guarantees.
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: { "User-Agent": "homepi (personal picture-frame weather widget)" },
  });
  if (!response.ok) {
    throw new Error(`Reverse geocoding request failed: ${response.status}`);
  }

  const data = await response.json();
  const address = data.address ?? {};
  const place = address.city ?? address.town ?? address.village ?? address.county;
  const displayName = [place, address.state ?? address.country].filter(Boolean).join(", ") || "Local";

  reverseGeocodeCache = { key, displayName };
  return displayName;
}

interface ForecastCache {
  key: string;
  fetchedAt: number;
  refreshMin: number;
  data: unknown;
}

let forecastCache: ForecastCache | null = null;

async function getForecast(latitude: number, longitude: number, units: "F" | "C", hourlyCount: number, refreshMin: number) {
  const key = `${latitude},${longitude},${units},${hourlyCount}`;
  const now = Date.now();

  if (forecastCache && forecastCache.key === key && now - forecastCache.fetchedAt < refreshMin * 60 * 1000) {
    return forecastCache.data;
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,weather_code,is_day",
    daily: "temperature_2m_max,temperature_2m_min",
    hourly: "temperature_2m,weather_code,is_day",
    temperature_unit: units === "F" ? "fahrenheit" : "celsius",
    timezone: "auto",
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed: ${response.status}`);
  }

  const data = await response.json();
  forecastCache = { key, fetchedAt: now, refreshMin, data };
  return data;
}

weatherRouter.get("/", async (_req, res) => {
  try {
    const widgetsConfig = await loadWidgetsConfig();
    const settings = findWidgetSettings<WeatherSettings>(widgetsConfig, "weather") ?? {
      location: "",
      units: "F" as const,
      refreshMin: 10,
      hourlyCount: 5,
    };

    let latitude = config.weather.latitude;
    let longitude = config.weather.longitude;
    let displayLocation: string;

    if (settings.location.trim().length > 0) {
      const geocoded = await geocodeLocation(settings.location.trim());
      latitude = geocoded.latitude;
      longitude = geocoded.longitude;
      displayLocation = geocoded.displayName;
    } else {
      // No location text configured - derive a display name from
      // WEATHER_LAT/WEATHER_LON instead of just labeling it "Local".
      displayLocation = await reverseGeocode(latitude, longitude).catch(() => "Local");
    }

    const data = (await getForecast(latitude, longitude, settings.units, settings.hourlyCount, settings.refreshMin)) as {
      current: { time: string; temperature_2m: number; weather_code: number; is_day: number };
      daily: { temperature_2m_max: number[]; temperature_2m_min: number[] };
      hourly: { time: string[]; temperature_2m: number[]; weather_code: number[]; is_day: number[] };
    };

    const startIdx = Math.max(0, data.hourly.time.findIndex((t) => t >= data.current.time));

    res.json({
      location: displayLocation,
      units: settings.units,
      current: {
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day === 1,
      },
      today: {
        high: data.daily.temperature_2m_max[0],
        low: data.daily.temperature_2m_min[0],
      },
      hourly: data.hourly.time.slice(startIdx, startIdx + settings.hourlyCount).map((time, i) => ({
        time,
        temperature: data.hourly.temperature_2m[startIdx + i],
        weatherCode: data.hourly.weather_code[startIdx + i],
        isDay: data.hourly.is_day[startIdx + i] === 1,
      })),
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
