import type { WeatherSettings } from "../types";

// Built out properly in Phase 2 (edit mode). This stub exists so the
// registry's required SettingsForm field type-checks for now.
export function WeatherSettingsForm(_props: { settings: WeatherSettings; onChange: (s: WeatherSettings) => void }) {
  return <p className="muted">Weather settings coming in edit mode.</p>;
}
