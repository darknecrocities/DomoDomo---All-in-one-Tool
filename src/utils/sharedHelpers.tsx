
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

export const parseZipFiles = (buffer: ArrayBuffer): string[] => {
  const arr = new Uint8Array(buffer);
  const files: string[] = [];
  let i = 0;
  while (i < arr.length - 30) {
    if (arr[i] === 0x50 && arr[i+1] === 0x4B && arr[i+2] === 0x03 && arr[i+3] === 0x04) {
      const filenameLen = arr[i + 26] + (arr[i + 27] << 8);
      const extraLen = arr[i + 28] + (arr[i + 29] << 8);
      const filenameStart = i + 30;
      if (filenameStart + filenameLen <= arr.length) {
        const filenameBytes = arr.slice(filenameStart, filenameStart + filenameLen);
        const filename = new TextDecoder().decode(filenameBytes);
        const uncompressedSize = arr[i + 22] + (arr[i + 23] << 8) + (arr[i + 24] << 16) + (arr[i + 25] << 24);
        if (filename && !filename.endsWith('/')) {
          files.push(`${filename} (${(uncompressedSize / 1024).toFixed(2)} KB)`);
        }
      }
      i += 30 + filenameLen + extraLen;
    } else {
      i++;
    }
  }
  return files.length > 0 ? files : ['No entries found or zip format unrecognized.'];
};
