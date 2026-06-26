import React, { useState, useRef, useCallback } from 'react';
import { Upload, Search, Image as ImageIcon, RefreshCcw, MapPin, Camera, Calendar, HardDrive, ShieldAlert } from 'lucide-react';
import exifr from 'exifr';

export const ExifViewerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [exifData, setExifData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseExif = async (selectedFile: File) => {
    setIsParsing(true);
    setError(null);
    setExifData(null);

    try {
      if (!selectedFile.type.startsWith('image/')) {
        throw new Error('Please upload an image file (JPG, TIFF, HEIC).');
      }

      // Generate a quick preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      // Parse full EXIF including GPS
      const data = await exifr.parse(selectedFile, {
        tiff: true,
        exif: true,
        gps: true,
        iptc: true,
        xmp: true
      });

      if (!data || Object.keys(data).length === 0) {
        throw new Error('No EXIF metadata found in this image. It may have been stripped previously.');
      }

      setExifData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while reading the metadata.');
    } finally {
      setIsParsing(false);
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
      parseExif(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExif(selectedFile);
    }
  };

  const reset = () => {
    setFile(null);
    setExifData(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const renderDataSection = (title: string, icon: React.ReactNode, keys: string[]) => {
    if (!exifData) return null;
    const availableKeys = keys.filter(k => exifData[k] !== undefined);
    if (availableKeys.length === 0) return null;

    return (
      <div className="glass-card p-5 border-[#2A2D30] bg-[#111213] flex flex-col gap-4">
        <h4 className="font-bold text-[#ECEBE9] text-sm flex items-center gap-2 uppercase tracking-wider text-[#72706C]">
          {icon}
          {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableKeys.map(k => (
            <div key={k} className="flex flex-col gap-1 border-l-2 border-[#3C6B4D]/30 pl-3">
              <span className="text-[10px] text-[#A3A09B] font-mono">{k}</span>
              <span className="text-xs text-[#ECEBE9] font-bold break-all">
                {typeof exifData[k] === 'object' ? JSON.stringify(exifData[k]) : String(exifData[k])}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
          <Search size={20} className="text-[#3C6B4D]" />
          EXIF Metadata Viewer
        </h3>
        <p className="text-[#A3A09B] text-xs">
          Inspect hidden metadata embedded in your photos, such as GPS locations, camera models, and timestamps.
          Useful for privacy auditing before sharing files. Processing runs 100% offline.
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
            accept="image/jpeg,image/tiff,image/heic,image/png"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 rounded-2xl bg-[#18191B] border border-[#2A2D30] flex items-center justify-center mb-4 text-[#3C6B4D] shadow-lg">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#ECEBE9] tracking-tight">Drop Photo Here</h3>
          <p className="text-[#72706C] text-sm mt-2 max-w-sm text-center">
            Supports JPG, TIFF, and HEIC files which commonly contain EXIF tags.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="p-2 rounded-xl bg-[#18191B] border border-[#2A2D30] shrink-0 w-16 h-16 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <ImageIcon size={24} className="text-[#72706C]" />
                )}
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
              <span>Inspect Another</span>
            </button>
          </div>

          {error && (
            <div className="bg-amber-500/10 border border-amber-500/25 p-5 rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                <ShieldAlert size={16} />
                No EXIF Found
              </div>
              <p className="text-xs text-[#ECEBE9] leading-relaxed">
                {error} 
              </p>
            </div>
          )}

          {isParsing ? (
            <div className="glass-card p-12 border-[#2A2D30] bg-[#18191B] flex flex-col items-center justify-center gap-4">
              <div className="animate-spin w-8 h-8 border-4 border-[#3C6B4D] border-t-transparent rounded-full"></div>
              <p className="text-[#ECEBE9] font-bold text-sm">Parsing metadata...</p>
            </div>
          ) : exifData && (
            <div className="flex flex-col gap-4">
              
              {/* Categorized Displays */}
              {renderDataSection('Hardware & Camera', <Camera size={14} />, [
                'Make', 'Model', 'Software', 'LensModel', 'LensMake', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO'
              ])}

              {renderDataSection('Location Data', <MapPin size={14} className="text-rose-450" />, [
                'latitude', 'longitude', 'GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSImgDirection'
              ])}

              {renderDataSection('Dates & Timestamps', <Calendar size={14} />, [
                'DateTimeOriginal', 'CreateDate', 'ModifyDate', 'OffsetTime'
              ])}

              {renderDataSection('Image Dimensions & Specs', <HardDrive size={14} />, [
                'ImageWidth', 'ImageHeight', 'Megapixels', 'Orientation', 'ColorSpace', 'Compression'
              ])}

              {/* Raw JSON Dump for everything else */}
              <div className="glass-card p-5 border-[#2A2D30] bg-[#111213] flex flex-col gap-4">
                <h4 className="font-bold text-[#ECEBE9] text-sm uppercase tracking-wider text-[#72706C]">
                  Raw EXIF JSON
                </h4>
                <div className="w-full bg-[#18191B] rounded-xl border border-[#2A2D30] p-4 overflow-x-auto max-h-96 overflow-y-auto">
                  <pre className="text-[10px] text-[#A3A09B] font-mono leading-relaxed">
                    {JSON.stringify(exifData, null, 2)}
                  </pre>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};
