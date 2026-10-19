export interface ClipPoint {
  id: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
}

export const PRESET_SHAPES: { [name: string]: { label: string; points: { x: number; y: number }[] } } = {
  triangle: {
    label: 'Triangle',
    points: [{ x: 50, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }],
  },
  hexagon: {
    label: 'Hexagon',
    points: [
      { x: 25, y: 0 }, { x: 75, y: 0 }, { x: 100, y: 50 },
      { x: 75, y: 100 }, { x: 25, y: 100 }, { x: 0, y: 50 },
    ],
  },
  star: {
    label: '5-Point Star',
    points: [
      { x: 50, y: 0 }, { x: 61, y: 35 }, { x: 98, y: 35 }, { x: 68, y: 57 },
      { x: 79, y: 91 }, { x: 50, y: 70 }, { x: 21, y: 91 }, { x: 32, y: 57 },
      { x: 2, y: 35 }, { x: 39, y: 35 },
    ],
  },
  chevron: {
    label: 'Chevron Right',
    points: [{ x: 75, y: 0 }, { x: 100, y: 50 }, { x: 75, y: 100 }, { x: 0, y: 100 }, { x: 25, y: 50 }, { x: 0, y: 0 }],
  },
  cross: {
    label: 'Plus / Cross',
    points: [
      { x: 35, y: 0 }, { x: 65, y: 0 }, { x: 65, y: 35 }, { x: 100, y: 35 },
      { x: 100, y: 65 }, { x: 65, y: 65 }, { x: 65, y: 100 }, { x: 35, y: 100 },
      { x: 35, y: 65 }, { x: 0, y: 65 }, { x: 0, y: 35 }, { x: 35, y: 35 },
    ],
  },
  message: {
    label: 'Message Bubble',
    points: [
      { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 75 }, { x: 75, y: 75 },
      { x: 75, y: 100 }, { x: 50, y: 75 }, { x: 0, y: 75 },
    ],
  },
};

export const formatClipPathCss = (points: { x: number; y: number }[]): string => {
  return `clip-path: polygon(${points.map((p) => `${p.x}% ${p.y}%`).join(', ')});`;
};

export const formatTailwindClipPath = (points: { x: number; y: number }[]): string => {
  return `[clip-path:polygon(${points.map((p) => `${p.x}%_${p.y}%`).join(',')})]`;
};

export const formatSvgClipPath = (points: { x: number; y: number }[], id: string = 'custom-clip'): string => {
  return `<clipPath id="${id}" clipPathUnits="objectBoundingBox">\n  <polygon points="${points
    .map((p) => `${(p.x / 100).toFixed(2)} ${(p.y / 100).toFixed(2)}`)
    .join(', ')}" />\n</clipPath>`;
};
