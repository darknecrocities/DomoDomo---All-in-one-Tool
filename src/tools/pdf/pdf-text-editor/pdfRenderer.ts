import { type TextItem, estimateWidth } from './types';

// Load PDF.js engine safely with cross-origin worker support
export const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        // Use a lightweight blob worker wrapper to prevent CORS worker security exceptions
        const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        try {
          const blobCode = `importScripts("${workerUrl}");`;
          const blob = new Blob([blobCode], { type: 'application/javascript' });
          pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
        } catch {
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        }
        resolve(pdfjsLib);
      } else {
        reject(new Error('PDF.js library was not found on window.'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js engine'));
    document.body.appendChild(script);
  });
};

export interface RenderPageOptions {
  pdfjsDoc: any;
  pageNumber: number;
  scale: number;
  canvas: HTMLCanvasElement;
  activeRenderTaskRef: { current: any };
  onViewportReady?: (viewport: any) => void;
}

export const renderPageToCanvas = async (options: RenderPageOptions): Promise<any> => {
  const { pdfjsDoc, pageNumber, scale, canvas, activeRenderTaskRef, onViewportReady } = options;
  if (!pdfjsDoc || !canvas) return null;

  // Cancel any running rendering task to avoid "An operation is already in progress" collision
  if (activeRenderTaskRef.current) {
    try {
      activeRenderTaskRef.current.cancel();
    } catch {
      // Ignore cancellation exception
    }
    activeRenderTaskRef.current = null;
  }

  const page = await pdfjsDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  if (onViewportReady) {
    onViewportReady(viewport);
  }

  const context = canvas.getContext('2d');
  if (!context) return viewport;

  const renderTask = page.render({ canvasContext: context, viewport });
  activeRenderTaskRef.current = renderTask;

  try {
    await renderTask.promise;
  } catch (err: any) {
    if (err?.name !== 'RenderingCancelledException') {
      throw err;
    }
  } finally {
    if (activeRenderTaskRef.current === renderTask) {
      activeRenderTaskRef.current = null;
    }
  }

  return viewport;
};

export const extractPageTextItems = async (
  pdfjsDoc: any,
  pageNumber: number
): Promise<TextItem[]> => {
  if (!pdfjsDoc) return [];
  const pageIndex = pageNumber - 1;
  const page = await pdfjsDoc.getPage(pageNumber);
  const textContent = await page.getTextContent();

  return textContent.items.map((item: any, idx: number) => {
    const transform = item.transform;
    const fontSize = Math.abs(transform[3]);

    let fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier' = 'Helvetica';
    const fontLower = (item.fontName || '').toLowerCase();
    if (
      fontLower.includes('times') ||
      fontLower.includes('serif') ||
      fontLower.includes('roman') ||
      fontLower.includes('georgia')
    ) {
      fontFamily = 'Times-Roman';
    } else if (
      fontLower.includes('courier') ||
      fontLower.includes('mono') ||
      fontLower.includes('consolas') ||
      fontLower.includes('code')
    ) {
      fontFamily = 'Courier';
    }

    let fontStyle: 'regular' | 'bold' | 'italic' | 'bold-italic' = 'regular';
    const nameLower = (item.fontName || '').toLowerCase();
    const hasBold = nameLower.includes('bold') || nameLower.includes('bd') || nameLower.includes('w7');
    const hasItalic = nameLower.includes('italic') || nameLower.includes('oblique') || nameLower.includes('it');
    if (hasBold && hasItalic) {
      fontStyle = 'bold-italic';
    } else if (hasBold) {
      fontStyle = 'bold';
    } else if (hasItalic) {
      fontStyle = 'italic';
    }

    let rotation = 0;
    if (transform[0] !== 0 || transform[1] !== 0) {
      rotation = Math.round(Math.atan2(transform[1], transform[0]) * (180 / Math.PI));
    }

    return {
      id: `text-${pageIndex}-${idx}`,
      pageIndex,
      text: item.str,
      originalText: item.str,
      x: transform[4],
      y: transform[5],
      fontSize: fontSize || 11,
      width: Math.max(item.width || 0, estimateWidth(item.str, fontSize || 11, fontFamily, fontStyle)),
      height: item.height || fontSize || 12,
      fontName: item.fontName || 'Helvetica',
      fontFamily,
      fontStyle,
      rotation,
      textAlign: 'left',
      originalX: transform[4],
      originalY: transform[5],
      originalRotation: rotation,
      originalFontSize: fontSize || 11,
      originalFontFamily: fontFamily,
      originalFontStyle: fontStyle,
      originalTextAlign: 'left',
    };
  });
};
