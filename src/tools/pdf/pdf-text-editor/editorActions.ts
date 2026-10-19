import type { TextItem, DrawStroke } from './types';

export const applySearchReplace = (
  items: TextItem[],
  searchQuery: string,
  replaceQuery: string,
  replaceAll: boolean
): TextItem[] => {
  if (!searchQuery.trim()) return items;
  let replacedCount = 0;

  return items.map((item) => {
    if (item.text.includes(searchQuery)) {
      if (replaceAll || replacedCount === 0) {
        replacedCount++;
        return {
          ...item,
          text: replaceAll
            ? item.text.split(searchQuery).join(replaceQuery)
            : item.text.replace(searchQuery, replaceQuery),
        };
      }
    }
    return item;
  });
};

export const createCustomTextItem = (
  pageIndex: number,
  pdfX: number,
  pdfY: number,
  text: string,
  fontSize: number,
  fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier',
  fontStyle: 'regular' | 'bold' | 'italic' | 'bold-italic',
  rotation: number,
  textAlign: 'left' | 'center' | 'right' | 'justify'
): TextItem => {
  return {
    id: `custom-text-${Date.now()}`,
    pageIndex,
    text: text || 'New Text Block',
    originalText: '',
    x: pdfX,
    y: pdfY,
    fontSize,
    width: 160,
    height: fontSize * 1.5,
    fontName: fontFamily,
    fontFamily,
    fontStyle,
    rotation,
    textAlign,
    isNew: true,
  };
};

export const drawStrokesOnCanvas = (
  ctx: CanvasRenderingContext2D,
  strokes: DrawStroke[],
  viewport: any,
  scale: number
): void => {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue;
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size * scale;
    const [firstVx, firstVy] = viewport.convertToViewportPoint(stroke.points[0].x, stroke.points[0].y);
    ctx.moveTo(firstVx, firstVy);

    for (let i = 1; i < stroke.points.length; i++) {
      const [vx, vy] = viewport.convertToViewportPoint(stroke.points[i].x, stroke.points[i].y);
      ctx.lineTo(vx, vy);
    }
    ctx.stroke();
  }
};
