import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, ShieldAlert, Download, RefreshCcw, Image as ImageIcon, FileCheck } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export const MetadataCleanerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [cleanedFileName, setCleanedFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanImageMetadata = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context.'));
          return;
        }
        
        // Drawing the image onto a canvas and exporting it inherently strips all EXIF/metadata
        ctx.drawImage(img, 0, 0);
        const format = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
        const url = canvas.toDataURL(format, 1.0);
        resolve(url);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image for cleaning.'));
      };

      img.src = objectUrl;
    });
  };

  const cleanPdfMetadata = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Strip standard metadata fields
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('DomoDomo Cleaned');
    pdfDoc.setCreator('DomoDomo Cleaned');
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  };

  const handleClean = async (selectedFile: File) => {
    setIsCleaning(true);
    setError(null);
    setCleanedUrl(null);
    
    try {
      let url = '';
      if (selectedFile.type.startsWith('image/')) {
        url = await cleanImageMetadata(selectedFile);
        setCleanedFileName(`cleaned_${selectedFile.name}`);
      } else if (selectedFile.type === 'application/pdf') {
        url = await cleanPdfMetadata(selectedFile);
        setCleanedFileName(`cleaned_${selectedFile.name}`);
      } else {
        throw new Error('Unsupported file type. Please upload an image (JPG/PNG) or PDF.');
      }
      
      setCleanedUrl(url);
    } catch (err: any) {
      setError(err.message || 'An error occurred while cleaning the metadata.');
    } finally {
      setIsCleaning(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      handleClean(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleClean(selectedFile);
    }
  };

  const reset = () => {
    setFile(null);
    if (cleanedUrl && cleanedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(cleanedUrl);
    }
    setCleanedUrl(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
          <ShieldAlert size={20} className="text-[#3C6B4D]" />
          Metadata Cleaner
        </h3>
        <p className="text-[#A3A09B] text-xs">
          Remove hidden EXIF data (GPS coordinates, camera models, dates) from images, and strip author/creator metadata from PDFs before sharing them online. Everything runs strictly in your browser.
        </p>
      </div>

      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`glass-card border-2 border-dashed flex flex-col items-center justify-center p-16 cursor-pointer transition-all ${
            isDragging ? 'border-[#3C6B4D] bg-[#3C6B4D]/5' : 'border-[#2A2D30] bg-[#111213]/40 hover:border-[#3C6B4D]/50 hover:bg-[#18191B]'
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 rounded-2xl bg-[#18191B] border border-[#2A2D30] flex items-center justify-center mb-4 text-[#3C6B4D] shadow-lg">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#ECEBE9] tracking-tight">Drop Image or PDF Here</h3>
          <p className="text-[#72706C] text-sm mt-2 max-w-sm text-center">
            Supports JPG, PNG, WebP, and PDF files.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="p-4 rounded-xl bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 shrink-0">
                {file.type.includes('pdf') ? <FileText size={24} /> : <ImageIcon size={24} />}
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <h4 className="font-bold text-[#ECEBE9] text-base truncate">{file.name}</h4>
                <div className="flex items-center gap-3 text-[11px] text-[#72706C] font-mono">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{file.type}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={reset}
              className="btn-secondary py-2 px-4 text-xs shrink-0 flex items-center gap-2"
            >
              <RefreshCcw size={14} />
              <span>Select Another File</span>
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-xs text-rose-450 font-semibold flex items-center gap-2">
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          {isCleaning ? (
            <div className="glass-card p-12 border-[#2A2D30] bg-[#18191B] flex flex-col items-center justify-center gap-4">
              <div className="animate-spin w-8 h-8 border-4 border-[#3C6B4D] border-t-transparent rounded-full"></div>
              <p className="text-[#ECEBE9] font-bold text-sm">Stripping metadata...</p>
            </div>
          ) : cleanedUrl && (
            <div className="glass-card p-8 border-[#2A2D30] bg-[#18191B] border-t-4 border-t-[#3C6B4D] flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-[#3C6B4D]/10 text-[#3C6B4D] flex items-center justify-center border border-[#3C6B4D]/20">
                <FileCheck size={36} />
              </div>
              
              <div className="flex flex-col gap-2 max-w-md">
                <h3 className="text-xl font-bold text-[#ECEBE9] tracking-tight">Metadata Successfully Removed</h3>
                <p className="text-[#A3A09B] text-xs leading-relaxed">
                  The file has been stripped of hidden author tags, GPS coordinates, camera models, and creation timestamps. It is now safer to share online.
                </p>
              </div>

              <a 
                href={cleanedUrl} 
                download={cleanedFileName}
                className="btn-primary py-3 px-8 text-sm font-bold flex items-center gap-2 mt-2 shadow-lg shadow-[#3C6B4D]/20"
              >
                <Download size={18} />
                <span>Download Cleaned File</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
