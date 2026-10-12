import type { PixelIconName } from "./PixelIcon";

// 0-1 clear, 2 partly cloudy, 3/45/48 overcast/fog, 51-67 & 80-82 rain, 71-77 snow, 95+ storm.
export function iconForWeatherCode(code: number, isDay: boolean): PixelIconName {
  if (code >= 95) return "storm";
  if (code >= 71 && code <= 77) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code === 3 || code === 45 || code === 48) return "cloud";
  if (code === 2) return isDay ? "sunCloud" : "moonCloud";
  return isDay ? "sun" : "moon";
}
