
import { Upload } from 'lucide-react';

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
