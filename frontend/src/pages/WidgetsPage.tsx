import { useEffect, useState } from "react";
import { api } from "../api";
import { Panel } from "../widgets/Panel";
import { widgetRegistry } from "../widgets/registry";
import type { WidgetsConfig } from "../widgets/types";

const MOTES = [
  { left: 12, top: 18, delay: 0 },
  { left: 30, top: 60, delay: 1.6 },
  { left: 55, top: 25, delay: 3.1 },
  { left: 75, top: 65, delay: 4.4 },
  { left: 90, top: 20, delay: 2.2 },
];

export function WidgetsPage() {
  const [config, setConfig] = useState<WidgetsConfig | null>(null);

  useEffect(() => {
    api.widgetsConfig().then(setConfig).catch(() => setConfig(null));
  }, []);

  if (!config) {
    return <div className="page widgets-page ambient-bg muted">Loading widgets…</div>;
  }

  return (
    <div className="page widgets-page ambient-bg">
      {config.ambient &&
        MOTES.map((mote, i) => (
          <div
            key={i}
            className="ambient-mote"
            style={{ left: `${mote.left}%`, top: `${mote.top}%`, animationDelay: `${mote.delay}s` }}
          />
        ))}

      <div
        className="widgets-grid"
        style={{
          gridTemplateColumns: `repeat(${config.grid.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${config.grid.rows}, minmax(0, 1fr))`,
        }}
      >
        {config.widgets.map((widget) => {
          const definition = widgetRegistry[widget.type];
          const Component = definition.Component;
          return (
            <Panel
              key={widget.id}
              className="widgets-grid-item"
              style={{
                gridColumn: `${widget.x + 1} / span ${widget.w}`,
                gridRow: `${widget.y + 1} / span ${widget.h}`,
              }}
            >
              <Component settings={widget.settings} size={{ w: widget.w, h: widget.h }} />
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
