export type CvdType =
  | 'protanopia'
  | 'protanomaly'
  | 'deuteranopia'
  | 'deuteranomaly'
  | 'tritanopia'
  | 'tritanomaly'
  | 'achromatopsia'
  | 'achromatomaly';

export interface CvdInfo {
  label: string;
  category: 'Red-Blind' | 'Green-Blind' | 'Blue-Blind' | 'Monochrome';
  population: string;
  matrix: number[]; // 3x3 matrix row-major
}

export const CVD_DATA: Record<CvdType, CvdInfo> = {
  protanopia: {
    label: 'Protanopia',
    category: 'Red-Blind',
    population: '1.0% of males',
    matrix: [0.567, 0.433, 0.0, 0.558, 0.442, 0.0, 0.0, 0.242, 0.758],
  },
  protanomaly: {
    label: 'Protanomaly',
    category: 'Red-Blind',
    population: '1.0% of males',
    matrix: [0.817, 0.183, 0.0, 0.333, 0.667, 0.0, 0.0, 0.125, 0.875],
  },
  deuteranopia: {
    label: 'Deuteranopia',
    category: 'Green-Blind',
    population: '1.1% of males',
    matrix: [0.625, 0.375, 0.0, 0.7, 0.3, 0.0, 0.0, 0.3, 0.7],
  },
  deuteranomaly: {
    label: 'Deuteranomaly',
    category: 'Green-Blind',
    population: '4.9% of males',
    matrix: [0.8, 0.2, 0.0, 0.258, 0.742, 0.0, 0.0, 0.142, 0.858],
  },
  tritanopia: {
    label: 'Tritanopia',
    category: 'Blue-Blind',
    population: '0.003% of people',
    matrix: [0.95, 0.05, 0.0, 0.0, 0.433, 0.567, 0.0, 0.475, 0.525],
  },
  tritanomaly: {
    label: 'Tritanomaly',
    category: 'Blue-Blind',
    population: '0.0001% of people',
    matrix: [0.967, 0.033, 0.0, 0.0, 0.733, 0.267, 0.0, 0.183, 0.817],
  },
  achromatopsia: {
    label: 'Achromatopsia',
    category: 'Monochrome',
    population: '0.003% of people',
    matrix: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
  },
  achromatomaly: {
    label: 'Achromatomaly',
    category: 'Monochrome',
    population: '0.001% of people',
    matrix: [0.618, 0.32, 0.062, 0.163, 0.775, 0.062, 0.163, 0.32, 0.516],
  },
};

export const applyCvdToRgb = (r: number, g: number, b: number, matrix: number[]) => {
  const nr = Math.min(255, Math.max(0, Math.round(r * matrix[0] + g * matrix[1] + b * matrix[2])));
  const ng = Math.min(255, Math.max(0, Math.round(r * matrix[3] + g * matrix[4] + b * matrix[5])));
  const nb = Math.min(255, Math.max(0, Math.round(r * matrix[6] + g * matrix[7] + b * matrix[8])));
  return { r: nr, g: ng, b: nb };
};

export const simulateHexColor = (hex: string, matrix: number[]): string => {
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  const sim = applyCvdToRgb(r, g, b, matrix);
  return `#${sim.r.toString(16).padStart(2, '0')}${sim.g.toString(16).padStart(2, '0')}${sim.b
    .toString(16)
    .padStart(2, '0')}`;
};
