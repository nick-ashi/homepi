import type { WidgetInstance, WidgetsConfig, WidgetType } from "./types.js";

const KNOWN_TYPES: WidgetType[] = ["photos", "weather", "clock"];

function rectsOverlap(a: WidgetInstance, b: WidgetInstance): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function validateWidgetsConfig(input: unknown): { ok: true; config: WidgetsConfig } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  if (typeof input !== "object" || input === null) {
    return { ok: false, errors: ["Config must be an object"] };
  }

  const candidate = input as Partial<WidgetsConfig>;

  if (candidate.version !== 1) errors.push("version must be 1");

  const cols = candidate.grid?.cols;
  const rows = candidate.grid?.rows;
  if (!Number.isInteger(cols) || (cols as number) < 1) errors.push("grid.cols must be a positive integer");
  if (!Number.isInteger(rows) || (rows as number) < 1) errors.push("grid.rows must be a positive integer");

  if (typeof candidate.ambient !== "boolean") errors.push("ambient must be a boolean");

  if (!Array.isArray(candidate.widgets)) {
    errors.push("widgets must be an array");
    return { ok: false, errors };
  }

  const widgets = candidate.widgets as WidgetInstance[];
  const seenIds = new Set<string>();

  widgets.forEach((widget, i) => {
    if (!widget.id || seenIds.has(widget.id)) errors.push(`widgets[${i}]: id must be unique and non-empty`);
    seenIds.add(widget.id);

    if (!KNOWN_TYPES.includes(widget.type)) errors.push(`widgets[${i}]: unknown type "${widget.type}"`);

    for (const field of ["x", "y", "w", "h"] as const) {
      if (!Number.isInteger(widget[field])) errors.push(`widgets[${i}]: ${field} must be an integer`);
    }
    if (widget.w < 1 || widget.h < 1) errors.push(`widgets[${i}]: w and h must be at least 1`);
    if (widget.x < 0 || widget.y < 0) errors.push(`widgets[${i}]: x and y must be >= 0`);
    if (typeof cols === "number" && widget.x + widget.w > cols) {
      errors.push(`widgets[${i}]: extends past grid.cols`);
    }
    if (typeof rows === "number" && widget.y + widget.h > rows) {
      errors.push(`widgets[${i}]: extends past grid.rows`);
    }
    if (typeof widget.settings !== "object" || widget.settings === null) {
      errors.push(`widgets[${i}]: settings must be an object`);
    }
  });

  for (let i = 0; i < widgets.length; i++) {
    for (let j = i + 1; j < widgets.length; j++) {
      if (rectsOverlap(widgets[i], widgets[j])) {
        errors.push(`widgets[${i}] and widgets[${j}] overlap`);
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, config: candidate as WidgetsConfig };
}
