import { promises as fs } from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import type { WidgetsConfig } from "./types.js";

// photos.folder defaults to the already-configured PHOTOS_DIR so existing
// setups keep working without having to edit widgets.json by hand.
// weather.location starts blank - the backend falls back to WEATHER_LAT/LON
// until a real location is set (see routes/weather.ts).
function buildDefaultConfig(): WidgetsConfig {
  return {
    version: 1,
    grid: { cols: 6, rows: 4 },
    ambient: true,
    widgets: [
      {
        id: "photos-1",
        type: "photos",
        x: 0,
        y: 0,
        w: 4,
        h: 4,
        settings: { folder: config.photosDir, intervalSec: 15, order: "shuffle", fit: "cover", showCaption: true },
      },
      {
        id: "clock-1",
        type: "clock",
        x: 4,
        y: 0,
        w: 2,
        h: 1,
        settings: { format: "12h", showDate: true, showSeconds: false },
      },
      {
        id: "weather-1",
        type: "weather",
        x: 4,
        y: 1,
        w: 2,
        h: 3,
        settings: { location: "", units: "F", refreshMin: 10, hourlyCount: 5 },
      },
    ],
  };
}

export async function loadWidgetsConfig(): Promise<WidgetsConfig> {
  try {
    const raw = await fs.readFile(config.widgetsConfigPath, "utf-8");
    return JSON.parse(raw) as WidgetsConfig;
  } catch {
    const defaults = buildDefaultConfig();
    await saveWidgetsConfig(defaults);
    return defaults;
  }
}

export async function saveWidgetsConfig(next: WidgetsConfig): Promise<void> {
  const dir = path.dirname(config.widgetsConfigPath);
  await fs.mkdir(dir, { recursive: true });
  const tmpPath = `${config.widgetsConfigPath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(next, null, 2), "utf-8");
  await fs.rename(tmpPath, config.widgetsConfigPath);
}
