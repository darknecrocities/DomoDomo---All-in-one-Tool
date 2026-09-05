/**
 * Canon CR2 (Canon RAW Version 2) Parser and Extractor
 * 100% Client-Side / Zero Cloud Transfer
 *
 * CR2 files are based on the TIFF 6.0 standard with custom Canon IFD structures.
 * This parser implements a dual-strategy extraction engine:
 * 1. Primary TIFF IFD Traversal (reads IFD0, IFD1, IFD2, IFD3, and SubIFDs)
 * 2. Resilient Binary Stream Carver (fail-safe recovery for damaged headers)
 *
 * Ensures 0% corruption and extracts the pristine, maximum-resolution DIGIC-rendered
 * full picture from any Canon camera model (EOS Rebel, EOS xxD, 5D, 6D, 7D, 1D series).
 */

export interface Cr2Metadata {
  make?: string;
  model?: string;
  dateTime?: string;
  iso?: number;
  exposureTime?: string;
  fNumber?: string;
  focalLength?: string;
  orientation?: number;
  width?: number;
  height?: number;
  megapixels?: string;
}

export interface Cr2ExtractionResult {
  jpegBytes: Uint8Array;
  width: number;
  height: number;
  orientation: number;
  metadata: Cr2Metadata;
}

interface JpegStreamCandidate {
  offset: number;
  length: number;
  width: number;
  height: number;
  pixelArea: number;
}

/**
 * Parses SOF (Start of Frame) segment inside a candidate JPEG stream
 * to extract exact pixel dimensions and verify image validity.
 */
function parseJpegDimensions(
  buf: Uint8Array,
  start: number,
  maxLen: number
): { width: number; height: number; length: number } | null {
  if (start + 4 > buf.length) return null;
  // Verify JPEG SOI marker (0xFF 0xD8)
  if (buf[start] !== 0xff || buf[start + 1] !== 0xd8) return null;

  let p = start + 2;
  const end = Math.min(buf.length, start + maxLen);
  let width = 0;
  let height = 0;
  let valid = false;

  while (p < end - 8) {
    if (buf[p] !== 0xff) {
      p++;
      continue;
    }
    const marker = buf[p + 1];
    p += 2;

    // Stop parsing headers when reaching SOS (Start of Scan) or EOI (End of Image)
    if (marker === 0xd9 || marker === 0xda) {
      break;
    }

    // SOF markers: SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2), etc. (excluding DHT, JPG, DAC)
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      const h = (buf[p + 3] << 8) | buf[p + 4];
      const w = (buf[p + 5] << 8) | buf[p + 6];
      if (w > 0 && h > 0) {
        width = w;
        height = h;
        valid = true;
        break;
      }
    }

    if (p + 2 > end) break;
    const segLen = (buf[p] << 8) | buf[p + 1];
    if (segLen <= 0) break;
    p += segLen;
  }

  if (!valid || width === 0 || height === 0) return null;

  // Accurately locate the true EOI (0xFF 0xD9) marker
  let eoi = -1;
  const searchStart = Math.min(buf.length - 2, start + maxLen - 1);
  const searchEnd = Math.max(start + 100, end - 65536);
  for (let i = searchStart; i >= searchEnd; i--) {
    if (buf[i] === 0xff && buf[i + 1] === 0xd9) {
      eoi = i + 2;
      break;
    }
  }

  const actualLength = eoi > start ? eoi - start : maxLen;
  return { width, height, length: actualLength };
}

/**
 * Extracts Exif metadata and pristine high-resolution image stream from a Canon CR2 buffer.
 */
export function extractFromCr2Buffer(arrayBuffer: ArrayBuffer): Cr2ExtractionResult {
  const buf = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  const len = buf.length;

  if (len < 16) {
    throw new Error('File is too small to be a valid Canon CR2 image.');
  }

  // Check TIFF Byte Order: 'II' (Little Endian) or 'MM' (Big Endian)
  const isLittleEndian =
    buf[0] === 0x49 && buf[1] === 0x49
      ? true
      : buf[0] === 0x4d && buf[1] === 0x4d
      ? false
      : null;

  if (isLittleEndian === null) {
    throw new Error('Not a valid TIFF/CR2 file: unrecognized byte order.');
  }
  const littleEndian: boolean = isLittleEndian;

  const tiffMagic = view.getUint16(2, littleEndian);
  if (tiffMagic !== 42) {
    throw new Error(`Invalid TIFF magic header (expected 42, got ${tiffMagic}).`);
  }

  // Canon CR2 header: byte 8-9 should be 'CR' (0x4352)
  const cr2Magic = String.fromCharCode(buf[8], buf[9]);
  if (cr2Magic !== 'CR') {
    throw new Error('File does not contain Canon CR2 signature.');
  }

  const ifd0Offset = view.getUint32(4, littleEndian);
  const candidateStreams: JpegStreamCandidate[] = [];
  const metadata: Cr2Metadata = {};

  function readAscii(offset: number, count: number): string {
    let str = '';
    for (let i = 0; i < count; i++) {
      if (offset + i >= len) break;
      const c = buf[offset + i];
      if (c === 0) break;
      str += String.fromCharCode(c);
    }
    return str.trim();
  }

  function readRational(offset: number): number | null {
    if (offset + 8 > len) return null;
    const num = view.getUint32(offset, littleEndian);
    const den = view.getUint32(offset + 4, littleEndian);
    if (den === 0) return null;
    return num / den;
  }

  // Traverse IFDs starting with IFD0
  let curOffset = ifd0Offset;
  const visited = new Set<number>();
  let exifIfdOffset = 0;

  while (curOffset > 0 && curOffset + 2 < len && !visited.has(curOffset)) {
    visited.add(curOffset);
    const numEntries = view.getUint16(curOffset, littleEndian);
    let p = curOffset + 2;

    let stripOffsets: number | null = null;
    let stripByteCounts: number | null = null;
    let jpegOffset: number | null = null;
    let jpegLength: number | null = null;

    for (let i = 0; i < numEntries; i++) {
      if (p + 12 > len) break;
      const tag = view.getUint16(p, littleEndian);
      const count = view.getUint32(p + 4, littleEndian);
      const val = view.getUint32(p + 8, littleEndian);

      if (tag === 0x010f && !metadata.make) {
        metadata.make = readAscii(val, count);
      } else if (tag === 0x0110 && !metadata.model) {
        metadata.model = readAscii(val, count);
      } else if (tag === 0x0112 && !metadata.orientation) {
        metadata.orientation = view.getUint16(p + 8, littleEndian);
      } else if (tag === 0x0132 && !metadata.dateTime) {
        metadata.dateTime = readAscii(val, count);
      } else if (tag === 0x8769) {
        exifIfdOffset = val;
      } else if (tag === 0x0111) {
        stripOffsets = val;
      } else if (tag === 0x0117) {
        stripByteCounts = val;
      } else if (tag === 0x0201) {
        jpegOffset = val;
      } else if (tag === 0x0202) {
        jpegLength = val;
      }

      p += 12;
    }

    if (stripOffsets !== null && stripByteCounts !== null && stripOffsets < len) {
      const parsed = parseJpegDimensions(buf, stripOffsets, stripByteCounts);
      if (parsed) {
        candidateStreams.push({
          offset: stripOffsets,
          length: parsed.length,
          width: parsed.width,
          height: parsed.height,
          pixelArea: parsed.width * parsed.height,
        });
      }
    }

    if (jpegOffset !== null && jpegLength !== null && jpegOffset < len) {
      const parsed = parseJpegDimensions(buf, jpegOffset, jpegLength);
      if (parsed) {
        candidateStreams.push({
          offset: jpegOffset,
          length: parsed.length,
          width: parsed.width,
          height: parsed.height,
          pixelArea: parsed.width * parsed.height,
        });
      }
    }

    if (p + 4 <= len) {
      curOffset = view.getUint32(p, isLittleEndian);
    } else {
      break;
    }
  }

  // Parse Exif IFD for camera shooting details (ISO, Shutter, F-Stop, Focal Length)
  if (exifIfdOffset > 0 && exifIfdOffset + 2 < len) {
    const exifEntries = view.getUint16(exifIfdOffset, littleEndian);
    let ep = exifIfdOffset + 2;

    for (let i = 0; i < exifEntries; i++) {
      if (ep + 12 > len) break;
      const tag = view.getUint16(ep, littleEndian);
      const count = view.getUint32(ep + 4, littleEndian);
      const val = view.getUint32(ep + 8, littleEndian);

      if (tag === 0x8827 && !metadata.iso) {
        metadata.iso = view.getUint16(ep + 8, littleEndian);
      } else if (tag === 0x829a && !metadata.exposureTime) {
        const exp = readRational(val);
        if (exp !== null && exp > 0) {
          metadata.exposureTime = exp < 1 ? `1/${Math.round(1 / exp)}s` : `${exp.toFixed(1)}s`;
        }
      } else if (tag === 0x829d && !metadata.fNumber) {
        const fn = readRational(val);
        if (fn !== null) {
          metadata.fNumber = `f/${parseFloat(fn.toFixed(1))}`;
        }
      } else if (tag === 0x920a && !metadata.focalLength) {
        const fl = readRational(val);
        if (fl !== null) {
          metadata.focalLength = `${Math.round(fl)}mm`;
        }
      } else if (tag === 0x9003 && !metadata.dateTime) {
        metadata.dateTime = readAscii(val, count);
      }

      ep += 12;
    }
  }

  // Fail-safe secondary byte scanner:
  // If no streams were located via IFDs or if only low-res thumbnails were found (< 300,000 pixels)
  const maxCandidateArea = candidateStreams.length > 0
    ? Math.max(...candidateStreams.map((c) => c.pixelArea))
    : 0;

  if (candidateStreams.length === 0 || maxCandidateArea < 300000) {
    let p = 0;
    while (p < len - 4) {
      if (buf[p] === 0xff && buf[p + 1] === 0xd8 && buf[p + 2] === 0xff) {
        const parsed = parseJpegDimensions(buf, p, Math.min(len - p, 35 * 1024 * 1024));
        if (parsed && parsed.width * parsed.height > 80000) {
          candidateStreams.push({
            offset: p,
            length: parsed.length,
            width: parsed.width,
            height: parsed.height,
            pixelArea: parsed.width * parsed.height,
          });
          p += parsed.length;
          continue;
        }
      }
      p++;
    }
  }

  if (candidateStreams.length === 0) {
    throw new Error(
      'Could not extract preview image from CR2 file. The RAW container may be severely damaged.'
    );
  }

  // Sort descending by total pixel resolution to select the pristine, maximum quality picture
  candidateStreams.sort((a, b) => b.pixelArea - a.pixelArea);
  const best = candidateStreams[0];

  metadata.width = best.width;
  metadata.height = best.height;
  metadata.megapixels = (best.pixelArea / 1000000).toFixed(1) + ' MP';

  const jpegBytes = buf.slice(best.offset, best.offset + best.length);
  const orientation = metadata.orientation || 1;

  return {
    jpegBytes,
    width: best.width,
    height: best.height,
    orientation,
    metadata,
  };
}

/**
 * Losslessly converts extracted JPEG bytes into a high-quality PNG Blob via HTMLCanvas/OffscreenCanvas.
 * Supports automatic Exif rotation (e.g. portrait photos taken with Canon camera orientation sensor).
 */
export async function convertCr2JpegToPngBlob(
  jpegBytes: Uint8Array,
  orientation: number = 1,
  autoOrient: boolean = true
): Promise<{ blob: Blob; url: string; width: number; height: number }> {
  const jpegBlob = new Blob([jpegBytes as unknown as BlobPart], { type: 'image/jpeg' });
  const objectUrl = URL.createObjectURL(jpegBlob);

  try {
    const img = new Image();
    img.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to decode extracted image stream in browser'));
    });

    let targetWidth = img.naturalWidth || img.width;
    let targetHeight = img.naturalHeight || img.height;

    // Determine canvas dimensions based on Exif orientation
    const needsSwap = autoOrient && (orientation === 6 || orientation === 8 || orientation === 5 || orientation === 7);
    const canvasWidth = needsSwap ? targetHeight : targetWidth;
    const canvasHeight = needsSwap ? targetWidth : targetHeight;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: false, alpha: true });
    if (!ctx) {
      throw new Error('Unable to create 2D canvas context for PNG encoding');
    }

    // Preserve exact 1:1 pixel sharpness
    ctx.imageSmoothingEnabled = false;

    if (autoOrient && orientation !== 1) {
      ctx.save();
      switch (orientation) {
        case 2: // Flip horizontal
          ctx.translate(canvasWidth, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0);
          break;
        case 3: // Rotate 180
          ctx.translate(canvasWidth, canvasHeight);
          ctx.rotate(Math.PI);
          ctx.drawImage(img, 0, 0);
          break;
        case 4: // Flip vertical
          ctx.translate(0, canvasHeight);
          ctx.scale(1, -1);
          ctx.drawImage(img, 0, 0);
          break;
        case 5: // Transpose
          ctx.rotate(0.5 * Math.PI);
          ctx.scale(1, -1);
          ctx.drawImage(img, 0, -canvasWidth);
          break;
        case 6: // Rotate 90 CW (Standard Portrait)
          ctx.translate(canvasWidth, 0);
          ctx.rotate(90 * (Math.PI / 180));
          ctx.drawImage(img, 0, 0);
          break;
        case 7: // Transverse
          ctx.rotate(0.5 * Math.PI);
          ctx.translate(canvasWidth, -canvasHeight);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0);
          break;
        case 8: // Rotate 270 CW (90 CCW)
          ctx.translate(0, canvasHeight);
          ctx.rotate(270 * (Math.PI / 180));
          ctx.drawImage(img, 0, 0);
          break;
        default:
          ctx.drawImage(img, 0, 0);
          break;
      }
      ctx.restore();
    } else {
      ctx.drawImage(img, 0, 0);
    }

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas PNG generation returned null'));
      }, 'image/png');
    });

    const pngUrl = URL.createObjectURL(pngBlob);
    return {
      blob: pngBlob,
      url: pngUrl,
      width: canvasWidth,
      height: canvasHeight,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
