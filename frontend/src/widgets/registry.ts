import type { ComponentType } from "react";
import { PhotosWidget } from "./photos/Widget";
import { PhotosSettingsForm } from "./photos/Settings";
import { WeatherWidget } from "./weather/Widget";
import { WeatherSettingsForm } from "./weather/Settings";
import { ClockWidget } from "./clock/Widget";
import { ClockSettingsForm } from "./clock/Settings";
import type { ClockSettings, PhotosSettings, WeatherSettings, WidgetType } from "./types";

export interface WidgetDefinition<S> {
  type: WidgetType;
  label: string;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  defaultSettings: S;
  Component: ComponentType<{ settings: S; size: { w: number; h: number } }>;
  SettingsForm: ComponentType<{ settings: S; onChange: (s: S) => void }>;
}

export const widgetRegistry: { [T in WidgetType]: WidgetDefinition<unknown> } = {
  photos: {
    type: "photos",
    label: "Photos",
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 2, h: 2 },
    defaultSettings: {
      folder: "~/homepi/photos",
      intervalSec: 15,
      order: "shuffle",
      fit: "cover",
      showCaption: true,
    } satisfies PhotosSettings,
    Component: PhotosWidget,
    SettingsForm: PhotosSettingsForm,
  } as WidgetDefinition<unknown>,
  weather: {
    type: "weather",
    label: "Weather",
    defaultSize: { w: 2, h: 3 },
    minSize: { w: 2, h: 2 },
    defaultSettings: {
      location: "",
      units: "F",
      refreshMin: 10,
      hourlyCount: 5,
    } satisfies WeatherSettings,
    Component: WeatherWidget,
    SettingsForm: WeatherSettingsForm,
  } as WidgetDefinition<unknown>,
  clock: {
    type: "clock",
    label: "Clock",
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 2, h: 1 },
    defaultSettings: {
      format: "12h",
      showDate: true,
      showSeconds: false,
    } satisfies ClockSettings,
    Component: ClockWidget,
    SettingsForm: ClockSettingsForm,
  } as WidgetDefinition<unknown>,
};
