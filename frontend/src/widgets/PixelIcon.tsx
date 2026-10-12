type Rect = [x: number, y: number, w: number, h: number, fill: string];

// Base appendix shapes, reused as building blocks for the derived icons below.
const CLOUD: Rect[] = [
  [5, 5, 5, 2, "#ecdfc2"],
  [9, 6, 3, 1, "#ecdfc2"],
  [3, 7, 11, 1, "#ecdfc2"],
  [2, 8, 13, 3, "#ecdfc2"],
  [3, 11, 11, 1, "#c3a87d"],
];

const MOON: Rect[] = [
  [6, 2, 4, 1, "#e8ca8e"],
  [4, 3, 4, 1, "#e8ca8e"],
  [3, 4, 3, 8, "#e8ca8e"],
  [4, 12, 4, 1, "#e8ca8e"],
  [6, 13, 4, 1, "#e8ca8e"],
  [12, 3, 1, 1, "#cf9f55"],
  [11, 8, 1, 1, "#cf9f55"],
];

const MOON_SLIVER: Rect[] = [
  [5, 1, 3, 1, "#e8ca8e"],
  [4, 2, 2, 1, "#e8ca8e"],
  [4, 3, 1, 2, "#e8ca8e"],
];

const SUN_CLOUD: Rect[] = [
  [6, 1, 4, 1, "#ffb347"],
  [5, 2, 6, 1, "#ffb347"],
  [4, 3, 8, 4, "#ffb347"],
  [5, 7, 6, 1, "#ffb347"],
  [1, 4, 2, 1, "#cf9f55"],
  [13, 4, 2, 1, "#cf9f55"],
  [5, 7, 5, 2, "#ecdfc2"],
  [9, 8, 3, 1, "#ecdfc2"],
  [3, 9, 11, 1, "#ecdfc2"],
  [2, 10, 13, 2, "#ecdfc2"],
  [3, 12, 11, 1, "#ecdfc2"],
  [3, 13, 11, 1, "#8a6530"],
];

const SUN: Rect[] = [
  [5, 5, 6, 6, "#ffb347"],
  [7, 1, 2, 1, "#ffb347"],
  [7, 13, 2, 1, "#ffb347"],
  [1, 7, 1, 2, "#ffb347"],
  [14, 7, 1, 2, "#ffb347"],
  [2, 2, 1, 1, "#ffb347"],
  [13, 2, 1, 1, "#ffb347"],
  [2, 13, 1, 1, "#ffb347"],
  [13, 13, 1, 1, "#ffb347"],
];

const PICTURE: Rect[] = [
  [1, 2, 14, 1, "#8a6530"],
  [1, 13, 14, 1, "#8a6530"],
  [1, 2, 1, 12, "#8a6530"],
  [14, 2, 1, 12, "#8a6530"],
  [10, 4, 2, 2, "#e8ca8e"],
  [5, 7, 1, 1, "#cf9f55"],
  [4, 8, 3, 1, "#cf9f55"],
  [3, 9, 5, 1, "#cf9f55"],
  [9, 9, 1, 1, "#cf9f55"],
  [8, 10, 3, 1, "#cf9f55"],
  [2, 10, 7, 1, "#cf9f55"],
  [2, 11, 12, 2, "#cf9f55"],
];

const ICONS = {
  sun: SUN,
  moon: MOON,
  sunCloud: SUN_CLOUD,
  moonCloud: [...MOON_SLIVER, ...CLOUD],
  cloud: CLOUD,
  rain: [
    ...CLOUD,
    [4, 12, 1, 2, "#8fb4d9"],
    [7, 13, 1, 2, "#8fb4d9"],
    [10, 12, 1, 2, "#8fb4d9"],
  ],
  snow: [
    ...CLOUD,
    [4, 12, 1, 1, "#ffffff"],
    [7, 13, 1, 1, "#ffffff"],
    [10, 12, 1, 1, "#ffffff"],
    [6, 14, 1, 1, "#ffffff"],
    [9, 14, 1, 1, "#ffffff"],
  ],
  storm: [
    ...CLOUD,
    [8, 11, 2, 1, "#ffb347"],
    [7, 12, 2, 1, "#ffb347"],
    [8, 13, 2, 1, "#ffb347"],
    [6, 14, 2, 1, "#ffb347"],
  ],
  picture: PICTURE,
} satisfies Record<string, Rect[]>;

export type PixelIconName = keyof typeof ICONS;

export function PixelIcon({ name, size = 32, className }: { name: PixelIconName; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name].map(([x, y, w, h, fill], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />
      ))}
    </svg>
  );
}
