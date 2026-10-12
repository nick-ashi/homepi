export type WidgetType = "photos" | "weather" | "clock";

export interface WidgetInstance<S = Record<string, unknown>> {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  w: number;
  h: number;
  settings: S;
}

export interface WidgetsConfig {
  version: 1;
  grid: { cols: number; rows: number };
  ambient: boolean;
  widgets: WidgetInstance[];
}

export interface PhotosSettings {
  folder: string;
  intervalSec: number;
  order: "shuffle" | "name" | "date";
  fit: "cover" | "contain";
  showCaption: boolean;
}

export interface WeatherSettings {
  location: string;
  units: "F" | "C";
  refreshMin: number;
  hourlyCount: number;
}

export interface ClockSettings {
  format: "12h" | "24h";
  showDate: boolean;
  showSeconds: boolean;
}

export function findWidgetSettings<S>(config: WidgetsConfig, type: WidgetType): S | undefined {
  const widget = config.widgets.find((w) => w.type === type);
  return widget?.settings as S | undefined;
}
