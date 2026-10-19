import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { triggerBlobDownload } from '../../../utils/sharedHelpers';
import type { TextItem, DrawStroke } from './types';

export interface ExportPDFParams {
  file: File;
  allTextItems: { [pageIndex: number]: TextItem[] };
  allStrokes: { [pageIndex: number]: DrawStroke[] };
}

export const exportEditedPDF = async ({
  file,
  allTextItems,
  allStrokes,
}: ExportPDFParams): Promise<void> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

  const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const timesBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

  const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);
  const courierOblique = await pdfDoc.embedFont(StandardFonts.CourierOblique);
  const courierBoldOblique = await pdfDoc.embedFont(StandardFonts.CourierBoldOblique);

  const pages = pdfDoc.getPages();

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    const items = allTextItems[pageIndex] || [];
    const strokes = allStrokes[pageIndex] || [];

    // 1. Process text edits and additions
    for (const item of items) {
      const isModified =
        item.isNew ||
        item.text !== item.originalText ||
        item.x !== item.originalX ||
        item.y !== item.originalY ||
        item.rotation !== item.originalRotation ||
        item.fontSize !== item.originalFontSize ||
        item.fontFamily !== item.originalFontFamily ||
        item.fontStyle !== item.originalFontStyle ||
        item.textAlign !== item.originalTextAlign;

      if (!isModified) continue;

      const angleRad = ((item.rotation || 0) * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);

      // Hide original text with opaque background rectangle unless it's a new item
      if (!item.isNew && item.originalX !== undefined && item.originalY !== undefined) {
        const origFontSize = item.originalFontSize || item.fontSize;
        const lines = (item.originalText || '').split('\n');
        const origHeight = Math.max(item.height, lines.length * origFontSize * 1.2);

        page.drawRectangle({
          x: item.originalX - 2,
          y: item.originalY - 2,
          width: item.width + 6,
          height: origHeight + 4,
          color: rgb(1, 1, 1),
          rotate: degrees(-(item.originalRotation || 0)),
        });
      }

      // Draw replacement or new text
      if (item.text.trim().length > 0) {
        let selectedFont = helveticaFont;
        const style = item.fontStyle || 'regular';

        if (item.fontFamily === 'Times-Roman') {
          if (style === 'bold-italic') selectedFont = timesBoldItalic;
          else if (style === 'bold') selectedFont = timesBold;
          else if (style === 'italic') selectedFont = timesItalic;
          else selectedFont = timesFont;
        } else if (item.fontFamily === 'Courier') {
          if (style === 'bold-italic') selectedFont = courierBoldOblique;
          else if (style === 'bold') selectedFont = courierBold;
          else if (style === 'italic') selectedFont = courierOblique;
          else selectedFont = courierFont;
        } else {
          if (style === 'bold-italic') selectedFont = helveticaBoldOblique;
          else if (style === 'bold') selectedFont = helveticaBold;
          else if (style === 'italic') selectedFont = helveticaOblique;
          else selectedFont = helveticaFont;
        }

        const lines = item.text.split('\n');
        const lineHeight = item.fontSize * 1.25;
        const blockWidth = item.width || 100;
        const align = item.textAlign || 'left';

        for (let i = 0; i < lines.length; i++) {
          const lineText = lines[i];
          const offY = i * lineHeight;

          const lineWidth = selectedFont.widthOfTextAtSize(lineText, item.fontSize);
          let offX = 0;
          if (align === 'center') {
            offX = Math.max(0, (blockWidth - lineWidth) / 2);
          } else if (align === 'right') {
            offX = Math.max(0, blockWidth - lineWidth);
          }

          const lx = item.x + offX * cos - offY * sin;
          const ly = item.y + offX * sin + offY * cos;

          page.drawText(lineText, {
            x: lx,
            y: ly,
            size: item.fontSize,
            font: selectedFont,
            color: rgb(0, 0, 0),
            rotate: degrees(-(item.rotation || 0)),
          });
        }
      }
    }

    // 2. Draw paint brush vectors
    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;

      for (let i = 0; i < stroke.points.length - 1; i++) {
        const p1 = stroke.points[i];
        const p2 = stroke.points[i + 1];

        const r = parseInt(stroke.color.slice(1, 3), 16) / 255;
        const g = parseInt(stroke.color.slice(3, 5), 16) / 255;
        const b = parseInt(stroke.color.slice(5, 7), 16) / 255;

        page.drawLine({
          start: { x: p1.x, y: p1.y },
          end: { x: p2.x, y: p2.y },
          thickness: stroke.size,
          color: rgb(r, g, b),
        });
      }
    }
  }

  const modifiedBytes = await pdfDoc.save();
  triggerBlobDownload(
    new Blob([new Uint8Array(modifiedBytes)], { type: 'application/pdf' }),
    `${file.name.replace(/\.[^/.]+$/, '')}_edited.pdf`
  );
};
