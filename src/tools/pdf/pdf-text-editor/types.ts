export interface TextItem {
  id: string;
  pageIndex: number;
  text: string;
  originalText: string;
  x: number;
  y: number;
  fontSize: number;
  width: number;
  height: number;
  fontName: string;
  fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
  fontStyle?: 'regular' | 'bold' | 'italic' | 'bold-italic';
  rotation?: number; // angle in degrees
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  isNew?: boolean;

  // Track original values to detect modifications on export
  originalX?: number;
  originalY?: number;
  originalRotation?: number;
  originalFontSize?: number;
  originalFontFamily?: 'Helvetica' | 'Times-Roman' | 'Courier';
  originalFontStyle?: 'regular' | 'bold' | 'italic' | 'bold-italic';
  originalTextAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface DrawStroke {
  points: { x: number; y: number }[];
  color: string;
  size: number;
}

export interface ViewportDim {
  width: number;
  height: number;
}

export const estimateWidth = (
  text: string,
  fontSize: number,
  fontFamily: string,
  fontStyle?: string
): number => {
  const isCourier = fontFamily === 'Courier';
  const isBold = fontStyle === 'bold' || fontStyle === 'bold-italic';
  const isItalic = fontStyle === 'italic' || fontStyle === 'bold-italic';

  let charRatio = isCourier ? 0.6 : 0.53;
  if (isBold) charRatio += 0.05;
  if (isItalic) charRatio += 0.02;

  const lines = (text || '').split('\n');
  const maxLineLength = Math.max(...lines.map((l) => l.length), 0);

  return maxLineLength * fontSize * charRatio + 24;
};
