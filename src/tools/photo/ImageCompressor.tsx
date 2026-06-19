import { FileUploadWrapper, triggerDownload } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';

export const ImageCompressorTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [compressedUrl, setCompressedUrl] = useState('');
  const [quality, setQuality] = useState(0.7);
  const [compressedSize, setCompressedSize] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageUrl) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const img = new Image();
    img.onload = () => {
      c.width = img.width;
      c.height = img.height;
      ctx?.drawImage(img, 0, 0, img.width, img.height);
      const dataUrl = c.toDataURL('image/jpeg', quality);
      setCompressedUrl(dataUrl);

      // Estimate compressed size from the base64 string length
      const head = 'data:image/jpeg;base64,'.length;
      const sizeBytes = Math.round((dataUrl.length - head) * 3 / 4);
      setCompressedSize(sizeBytes);
    };
    img.src = imageUrl;
  }, [imageUrl, quality]);

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setImageUrl(URL.createObjectURL(uploadedFile));
  };

  const handleDownload = () => {
    if (compressedUrl) {
      triggerDownload(compressedUrl, 'compressed.jpg');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const originalSize = file ? file.size : 0;
  const ratio = originalSize > 0 ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-center min-h-[350px]">
        {!imageUrl ? (
          <FileUploadWrapper onUpload={handleUpload} />
        ) : (
          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col gap-2 bg-slate-950/20 p-3 rounded border border-slate-850/50">
                <span className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">Original Image ({formatSize(originalSize)})</span>
                <img src={imageUrl} className="max-h-[250px] md:max-h-[300px] w-auto mx-auto rounded border border-slate-800/80 object-contain" alt="Original preview" />
              </div>
              <div className="flex flex-col gap-2 bg-slate-950/20 p-3 rounded border border-slate-850/50">
                <span className="text-[10px] font-bold text-teal-400 text-center uppercase tracking-wider">Compressed Preview ({formatSize(compressedSize)})</span>
                {compressedUrl ? (
                  <img src={compressedUrl} className="max-h-[250px] md:max-h-[300px] w-auto mx-auto rounded border border-slate-800/80 object-contain" alt="Compressed preview" />
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-xs text-slate-500">Processing...</div>
                )}
              </div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2">Image Compressor</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Compression Quality</span>
              <span className="text-slate-350">{Math.round(quality * 100)}%</span>
            </div>
            <input type="range" min="0.05" max="1" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
          </div>
          {imageUrl && (
            <div className="flex flex-col gap-2 mt-2 border-t border-slate-850 pt-3">
              <div className="flex justify-between text-xs font-mono py-1.5 border-b border-slate-850/30">
                <span className="text-slate-400">Original Size:</span>
                <span className="text-slate-200">{formatSize(originalSize)}</span>
              </div>
              <div className="flex justify-between text-xs font-mono py-1.5 border-b border-slate-850/30">
                <span className="text-slate-400">Compressed Size:</span>
                <span className="text-[#4E8E5E] font-bold">{formatSize(compressedSize)}</span>
              </div>
              {ratio > 0 && (
                <div className="flex justify-between text-xs font-mono py-1.5">
                  <span className="text-slate-400">Space Saved:</span>
                  <span className="text-emerald-400 font-extrabold">{ratio}% saved</span>
                </div>
              )}
              <button onClick={handleDownload} className="btn-primary w-full text-xs mt-3 flex items-center justify-center gap-1.5">
                <Download size={14} /> Download Compressed JPG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
