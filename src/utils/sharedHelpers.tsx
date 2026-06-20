import { Upload } from 'lucide-react';
import QRCode from 'qrcode';

export const FileUploadWrapper = ({ onUpload, accept = "image/*" }: { onUpload: (file: File) => void, accept?: string }) => (
  <div className="flex flex-col items-center gap-3 py-10">
    <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
      <Upload size={32} />
    </div>
    <label className="btn-primary cursor-pointer mt-2">
      <span>Choose File</span>
      <input type="file" accept={accept} onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} className="hidden" />
    </label>
    <p className="text-slate-500 text-xs">Processes fully on your device</p>
  </div>
);

export const triggerDownload = (url: string, name: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const triggerBlobDownload = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const triggerTextDownload = (content: string, name: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const triggerFileDownload = (content: Blob, name: string) => {
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const handleTextCopy = (text: string, setCopied: (c: boolean) => void) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

export const extractPrintableStrings = (buffer: ArrayBuffer, minLength: number = 4): string => {
  const arr = new Uint8Array(buffer);
  let result = '';
  let current: string[] = [];
  let totalCount = 0;
  for (let i = 0; i < arr.length; i++) {
    const char = arr[i];
    if ((char >= 32 && char <= 126) || char === 9 || char === 10 || char === 13) {
      current.push(String.fromCharCode(char));
    } else {
      if (current.length >= minLength) {
        const str = current.join('').trim();
        if (str.length >= minLength) {
          result += str + '\n';
          totalCount += str.length;
          if (totalCount > 5000) {
            result += '\n... [Truncated due to size]';
            break;
          }
        }
      }
      current = [];
    }
  }
  if (current.length >= minLength) {
    result += current.join('').trim() + '\n';
  }
  return result || 'No readable text content found in binary streams.';
};

export interface ZipEntry {
  filename: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  dataOffset: number;
}

export const parseZipEntries = (buffer: ArrayBuffer): ZipEntry[] => {
  const arr = new Uint8Array(buffer);
  const entries: ZipEntry[] = [];
  
  // Try Central Directory first
  let eocdOffset = -1;
  for (let i = arr.length - 22; i >= 0; i--) {
    if (arr[i] === 0x50 && arr[i+1] === 0x4B && arr[i+2] === 0x05 && arr[i+3] === 0x06) {
      eocdOffset = i;
      break;
    }
  }
  
  if (eocdOffset !== -1) {
    const cdSize = arr[eocdOffset + 12] + (arr[eocdOffset + 13] << 8) + (arr[eocdOffset + 14] << 16) + (arr[eocdOffset + 15] << 24);
    const cdOffset = arr[eocdOffset + 16] + (arr[eocdOffset + 17] << 8) + (arr[eocdOffset + 18] << 16) + (arr[eocdOffset + 19] << 24);
    
    let i = cdOffset;
    const cdEnd = cdOffset + cdSize;
    while (i < cdEnd - 46 && i < arr.length - 46) {
      if (arr[i] === 0x50 && arr[i+1] === 0x4B && arr[i+2] === 0x01 && arr[i+3] === 0x02) {
        const method = arr[i + 10] + (arr[i + 11] << 8);
        const compSize = arr[i + 20] + (arr[i + 21] << 8) + (arr[i + 22] << 16) + (arr[i + 23] << 24);
        const uncompSize = arr[i + 24] + (arr[i + 25] << 8) + (arr[i + 26] << 16) + (arr[i + 27] << 24);
        const nameLen = arr[i + 28] + (arr[i + 29] << 8);
        const extraLen = arr[i + 30] + (arr[i + 31] << 8);
        const commentLen = arr[i + 32] + (arr[i + 33] << 8);
        const localHeaderOffset = arr[i + 42] + (arr[i + 43] << 8) + (arr[i + 44] << 16) + (arr[i + 45] << 24);
        
        if (localHeaderOffset + 30 <= arr.length) {
          const filenameBytes = arr.slice(i + 46, i + 46 + nameLen);
          const filename = new TextDecoder().decode(filenameBytes);
          
          const lhFilenameLen = arr[localHeaderOffset + 26] + (arr[localHeaderOffset + 27] << 8);
          const lhExtraLen = arr[localHeaderOffset + 28] + (arr[localHeaderOffset + 29] << 8);
          const dataOffset = localHeaderOffset + 30 + lhFilenameLen + lhExtraLen;
          
          entries.push({
            filename,
            compressedSize: compSize,
            uncompressedSize: uncompSize,
            compressionMethod: method,
            dataOffset
          });
        }
        i += 46 + nameLen + extraLen + commentLen;
      } else {
        break;
      }
    }
  }
  
  if (entries.length === 0) {
    let i = 0;
    while (i < arr.length - 30) {
      if (arr[i] === 0x50 && arr[i+1] === 0x4B && arr[i+2] === 0x03 && arr[i+3] === 0x04) {
        const method = arr[i + 8] + (arr[i + 9] << 8);
        const compSize = arr[i + 18] + (arr[i + 19] << 8) + (arr[i + 20] << 16) + (arr[i + 21] << 24);
        const uncompSize = arr[i + 22] + (arr[i + 23] << 8) + (arr[i + 24] << 16) + (arr[i + 25] << 24);
        const filenameLen = arr[i + 26] + (arr[i + 27] << 8);
        const extraLen = arr[i + 28] + (arr[i + 29] << 8);
        
        const filenameStart = i + 30;
        if (filenameStart + filenameLen <= arr.length) {
          const filenameBytes = arr.slice(filenameStart, filenameStart + filenameLen);
          const filename = new TextDecoder().decode(filenameBytes);
          const dataOffset = i + 30 + filenameLen + extraLen;
          
          entries.push({
            filename,
            compressedSize: compSize,
            uncompressedSize: uncompSize,
            compressionMethod: method,
            dataOffset
          });
        }
        i += 30 + filenameLen + extraLen + compSize;
      } else {
        i++;
      }
    }
  }
  
  return entries;
};

export const decompressZipEntry = async (buffer: ArrayBuffer, entry: ZipEntry): Promise<Uint8Array> => {
  const arr = new Uint8Array(buffer);
  if (entry.dataOffset + entry.compressedSize > arr.length) {
    throw new Error('Compressed data out of bounds');
  }
  const data = arr.slice(entry.dataOffset, entry.dataOffset + entry.compressedSize);
  
  if (entry.compressionMethod === 0) {
    return data;
  } else if (entry.compressionMethod === 8) {
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(data);
    writer.close();
    
    const response = new Response(ds.readable);
    const decompressed = await response.arrayBuffer();
    return new Uint8Array(decompressed);
  } else {
    throw new Error(`Unsupported compression method: ${entry.compressionMethod}`);
  }
};

export const parseZipFiles = (buffer: ArrayBuffer): string[] => {
  const entries = parseZipEntries(buffer);
  return entries
    .filter(e => !e.filename.endsWith('/'))
    .map(e => `${e.filename} (${(e.uncompressedSize / 1024).toFixed(2)} KB)`);
};

export interface QRDesignSettings {
  fgColor: string;
  bgColor: string;
  margin: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  logoPreset: string;
  format: string;
  theme?: string;
  // Gradients
  fgType?: 'solid' | 'linear' | 'radial';
  fgColorEnd?: string;
  gradientAngle?: number;
  // Shapes
  moduleStyle?: 'square' | 'circle' | 'rounded' | 'star' | 'liquid';
  eyeFrameStyle?: 'square' | 'circle' | 'rounded' | 'leaf' | 'shield';
  eyeBallStyle?: 'square' | 'circle' | 'diamond' | 'star';
  // Eye Colors
  customEyeColor?: boolean;
  eyeFrameColor?: string;
  eyeBallColor?: string;
  // Background type
  bgType?: 'solid' | 'linear' | 'radial';
  bgColorEnd?: string;
  // Custom logo
  customLogoUrl?: string;
  logoScale?: number;
  logoMask?: boolean;
  // Text label
  labelText?: string;
  labelColor?: string;
  labelFontSize?: number;
  glowEffect?: boolean;
}

export const generateDesignedQR = async (
  payload: string,
  settings: QRDesignSettings
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const size = 400;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Generate QR matrix using qrcode library
  const qr = QRCode.create(payload, {
    errorCorrectionLevel: settings.errorCorrection || 'Q'
  });
  const modules = qr.modules;
  const N = modules.size;
  const margin = typeof settings.margin === 'number' ? settings.margin : 2;
  const paddedSize = N + 2 * margin;
  const mSize = size / paddedSize;

  // 1. Draw Background (Solid / Gradient)
  let bgStyle: string | CanvasGradient = settings.bgColor;
  if (settings.bgType === 'linear' && settings.bgColorEnd) {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, settings.bgColor);
    grad.addColorStop(1, settings.bgColorEnd);
    bgStyle = grad;
  } else if (settings.bgType === 'radial' && settings.bgColorEnd) {
    const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
    grad.addColorStop(0, settings.bgColor);
    grad.addColorStop(1, settings.bgColorEnd);
    bgStyle = grad;
  }

  ctx.fillStyle = bgStyle;
  ctx.fillRect(0, 0, size, size);

  // 2. Prepare Foreground Paint (Gradient / Solid)
  let fgStyle: string | CanvasGradient = settings.fgColor;
  if (settings.fgType === 'linear' && settings.fgColorEnd) {
    const angle = ((settings.gradientAngle || 45) * Math.PI) / 180;
    // Calculate endpoints of the gradient line matching angle inside size x size
    const x1 = size / 2 - Math.cos(angle) * (size / 2);
    const y1 = size / 2 - Math.sin(angle) * (size / 2);
    const x2 = size / 2 + Math.cos(angle) * (size / 2);
    const y2 = size / 2 + Math.sin(angle) * (size / 2);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, settings.fgColor);
    grad.addColorStop(1, settings.fgColorEnd);
    fgStyle = grad;
  } else if (settings.fgType === 'radial' && settings.fgColorEnd) {
    const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
    grad.addColorStop(0, settings.fgColor);
    grad.addColorStop(1, settings.fgColorEnd);
    fgStyle = grad;
  }

  // Bounding box for center logo to mask modules (if enabled)
  const cx = size / 2;
  const cy = size / 2;
  const logoScale = settings.logoScale || 0.22;
  const logoBoxSize = size * logoScale;
  const logoMin = cx - logoBoxSize / 2 - 2;
  const logoMax = cx + logoBoxSize / 2 + 2;

  // Helper check for eye cells
  const isEyeCell = (r: number, c: number) => {
    if (r >= 0 && r < 7 && c >= 0 && c < 7) return true; // Top-Left
    if (r >= 0 && r < 7 && c >= N - 7 && c < N) return true; // Top-Right
    if (r >= N - 7 && r < N && c >= 0 && c < 7) return true; // Bottom-Left
    return false;
  };

  // Helper to check if a cell overlaps the logo mask
  const isLogoCell = (r: number, c: number) => {
    if (!settings.logoMask) return false;
    const cellX = (c + margin) * mSize + mSize / 2;
    const cellY = (r + margin) * mSize + mSize / 2;
    return cellX >= logoMin && cellX <= logoMax && cellY >= logoMin && cellY <= logoMax;
  };

  // Apply Glow / Neon shadow
  if (settings.glowEffect) {
    ctx.shadowColor = settings.fgColor;
    ctx.shadowBlur = 8;
  }

  // 3. Draw QR modules (excluding eyes and masked center logo)
  ctx.fillStyle = fgStyle;
  const style = settings.moduleStyle || 'square';

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (modules.get(r, c) && !isEyeCell(r, c) && !isLogoCell(r, c)) {
        const x = (c + margin) * mSize;
        const y = (r + margin) * mSize;

        ctx.beginPath();
        if (style === 'circle') {
          ctx.arc(x + mSize / 2, y + mSize / 2, (mSize / 2) * 0.85, 0, 2 * Math.PI);
          ctx.fill();
        } else if (style === 'rounded') {
          ctx.roundRect(x, y, mSize, mSize, mSize * 0.25);
          ctx.fill();
        } else if (style === 'star') {
          drawStarPath(ctx, x + mSize / 2, y + mSize / 2, 5, mSize / 2, mSize / 4);
          ctx.fill();
        } else if (style === 'liquid') {
          // Liquid connectors
          ctx.roundRect(x + mSize * 0.05, y + mSize * 0.05, mSize * 0.9, mSize * 0.9, mSize * 0.4);
          ctx.fill();
        } else {
          ctx.rect(x, y, mSize, mSize);
          ctx.fill();
        }
      }
    }
  }

  // Clear shadow blur for eyes and logo
  ctx.shadowBlur = 0;

  // 4. Draw Custom Corners/Eyes
  const fStyle = settings.eyeFrameStyle || 'square';
  const bStyle = settings.eyeBallStyle || 'square';
  const fColor = settings.customEyeColor && settings.eyeFrameColor ? settings.eyeFrameColor : settings.fgColor;
  const bColor = settings.customEyeColor && settings.eyeBallColor ? settings.eyeBallColor : settings.fgColor;

  const drawEye = (colOffset: number, rowOffset: number) => {
    const x = (colOffset + margin) * mSize;
    const y = (rowOffset + margin) * mSize;
    const outerSize = 7 * mSize;
    const innerSize = 5 * mSize;
    const ballSize = 3 * mSize;

    // Outer Frame
    ctx.fillStyle = fColor;
    ctx.beginPath();
    if (fStyle === 'circle') {
      ctx.arc(x + outerSize / 2, y + outerSize / 2, outerSize / 2, 0, 2 * Math.PI);
    } else if (fStyle === 'rounded') {
      ctx.roundRect(x, y, outerSize, outerSize, outerSize * 0.25);
    } else if (fStyle === 'leaf') {
      // Leaf shape: top-left and bottom-right are rounded, others are sharp
      ctx.roundRect(x, y, outerSize, outerSize, [outerSize * 0.5, 0, outerSize * 0.5, 0]);
    } else if (fStyle === 'shield') {
      // Shield shape: round bottom corners
      ctx.roundRect(x, y, outerSize, outerSize, [0, 0, outerSize * 0.5, outerSize * 0.5]);
    } else {
      ctx.rect(x, y, outerSize, outerSize);
    }
    ctx.fill();

    // Clear Inner Cutout with background color
    ctx.fillStyle = settings.bgColor;
    ctx.beginPath();
    const innerX = x + mSize;
    const innerY = y + mSize;
    if (fStyle === 'circle') {
      ctx.arc(innerX + innerSize / 2, innerY + innerSize / 2, innerSize / 2, 0, 2 * Math.PI);
    } else if (fStyle === 'rounded' || fStyle === 'leaf' || fStyle === 'shield') {
      ctx.roundRect(innerX, innerY, innerSize, innerSize, innerSize * 0.25);
    } else {
      ctx.rect(innerX, innerY, innerSize, innerSize);
    }
    ctx.fill();

    // Eye Ball
    ctx.fillStyle = bColor;
    ctx.beginPath();
    const ballX = x + 2 * mSize;
    const ballY = y + 2 * mSize;
    if (bStyle === 'circle') {
      ctx.arc(ballX + ballSize / 2, ballY + ballSize / 2, ballSize / 2, 0, 2 * Math.PI);
    } else if (bStyle === 'diamond') {
      ctx.moveTo(ballX + ballSize / 2, ballY);
      ctx.lineTo(ballX + ballSize, ballY + ballSize / 2);
      ctx.lineTo(ballX + ballSize / 2, ballY + ballSize);
      ctx.lineTo(ballX, ballY + ballSize / 2);
      ctx.closePath();
    } else if (bStyle === 'star') {
      drawStarPath(ctx, ballX + ballSize / 2, ballY + ballSize / 2, 5, ballSize / 2, ballSize / 4);
    } else {
      ctx.rect(ballX, ballY, ballSize, ballSize);
    }
    ctx.fill();
  };

  // Top-Left Eye
  drawEye(0, 0);
  // Top-Right Eye
  drawEye(N - 7, 0);
  // Bottom-Left Eye
  drawEye(0, N - 7);

  // 5. Draw Custom Uploaded Image Logo or Preset Emoji Logo
  if (settings.customLogoUrl) {
    const img = new Image();
    img.src = settings.customLogoUrl;
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
    if (img.complete && img.naturalWidth > 0) {
      if (settings.logoMask) {
        ctx.fillStyle = settings.bgColor;
        ctx.beginPath();
        ctx.arc(cx, cy, logoBoxSize / 2 + 3, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.drawImage(img, cx - logoBoxSize / 2, cy - logoBoxSize / 2, logoBoxSize, logoBoxSize);
    }
  } else if (settings.logoPreset && settings.logoPreset !== 'none') {
    if (settings.logoMask) {
      ctx.fillStyle = settings.bgColor;
      ctx.beginPath();
      ctx.arc(cx, cy, logoBoxSize / 2 + 3, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.fillStyle = bColor;
    ctx.font = `bold ${logoBoxSize * 0.65}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let iconText = '★';
    if (settings.logoPreset === 'wifi') iconText = '📶';
    else if (settings.logoPreset === 'mail') iconText = '✉';
    else if (settings.logoPreset === 'phone') iconText = '📞';
    else if (settings.logoPreset === 'link') iconText = '🔗';
    else if (settings.logoPreset === 'github') iconText = '🐙';

    ctx.fillText(iconText, cx, cy);
  }

  // 6. Draw Text Label Overlay
  if (settings.labelText && settings.labelText.trim()) {
    ctx.fillStyle = settings.labelColor || fColor;
    const fontSize = settings.labelFontSize || 14;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    // Draw background block for label text readability
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, size - fontSize - 12, size, fontSize + 12);

    ctx.fillStyle = settings.labelColor || fColor;
    ctx.fillText(settings.labelText, size / 2, size - 6);
  }

  return canvas.toDataURL(`image/${settings.format || 'png'}`);
};

const drawStarPath = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) => {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
};

export const generateCustomQR = async (
  payload: string,
  settings: {
    fgColor: string;
    bgColor: string;
    margin: number;
    errorCorrection: 'L' | 'M' | 'Q' | 'H';
    logoPreset: string;
    format: string;
  }
): Promise<string> => {
  return generateDesignedQR(payload, {
    ...settings,
    fgType: 'solid',
    moduleStyle: 'square',
    eyeFrameStyle: 'square',
    eyeBallStyle: 'square',
    customEyeColor: false,
    logoMask: true,
    logoScale: 0.22
  });
};
