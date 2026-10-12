import { useEffect, useState } from "react";
import type { ClockSettings } from "../types";

const WEEKDAY_FORMAT = new Intl.DateTimeFormat(undefined, { weekday: "long" });
const DATE_FORMAT = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

export function ClockWidget({ settings }: { settings: ClockSettings }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const boundaryMs = settings.showSeconds ? 1000 : 60 * 1000;
    let intervalId: ReturnType<typeof setInterval>;

    // Align the first tick to the next second/minute boundary so the
    // displayed time doesn't lag by up to 59s between ticks.
    const alignTimeout = setTimeout(() => {
      setNow(new Date());
      intervalId = setInterval(() => setNow(new Date()), boundaryMs);
    }, boundaryMs - (Date.now() % boundaryMs));

    return () => {
      clearTimeout(alignTimeout);
      clearInterval(intervalId);
    };
  }, [settings.showSeconds]);

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  let suffix: "AM" | "PM" | null = null;

  if (settings.format === "12h") {
    suffix = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
  }

  const timeText = `${hours}:${minutes}${settings.showSeconds ? `:${seconds}` : ""}`;

  return (
    <div className="clock-widget">
      <div className="clock-time">
        {timeText}
        {suffix && <span className="clock-suffix">{suffix}</span>}
      </div>
      {settings.showDate && (
        <div className="clock-date muted">
          {WEEKDAY_FORMAT.format(now)} · {DATE_FORMAT.format(now)}
        </div>
      )}
    </div>
  );
}
