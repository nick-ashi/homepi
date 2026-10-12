import type { ClockSettings } from "../types";

// Built out properly in Phase 2 (edit mode). This stub exists so the
// registry's required SettingsForm field type-checks for now.
export function ClockSettingsForm(_props: { settings: ClockSettings; onChange: (s: ClockSettings) => void }) {
  return <p className="muted">Clock settings coming in edit mode.</p>;
}
