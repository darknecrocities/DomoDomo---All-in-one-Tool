import React, { useState, useRef, useCallback } from 'react';
import { QrCode, ShieldAlert, ShieldCheck, AlertTriangle, RefreshCcw, Link as LinkIcon, Search, FileText } from 'lucide-react';
import jsQR from 'jsqr';

export const QRSecurityTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanQR = async (selectedFile: File) => {
    setIsScanning(true);
    setError(null);
    setResult(null);
    setPreviewUrl(URL.createObjectURL(selectedFile));

    try {
      const img = new Image();
      img.src = URL.createObjectURL(selectedFile);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image.'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported.');

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (!code) {
        throw new Error('No QR code found in this image. Make sure it is clear and well-lit.');
      }

      analyzeQRContent(code.data);
    } catch (err: any) {
      setError(err.message || 'Error scanning QR code.');
    } finally {
      setIsScanning(false);
    }
  };

  const analyzeQRContent = (content: string) => {
    const isUrl = content.startsWith('http://') || content.startsWith('https://');
    let riskScore = 0;
    const findings = [];

    if (isUrl) {
      const url = new URL(content);
      const domain = url.hostname.toLowerCase();

      if (url.protocol === 'http:') {
        riskScore += 3;
        findings.push('Uses insecure HTTP protocol instead of HTTPS.');
      }

      // Check for common link shorteners (often used to hide malicious URLs in QR codes)
      const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly', 'ow.ly'];
      if (shorteners.includes(domain)) {
        riskScore += 4;
        findings.push('Uses a URL shortener. This is a common tactic to hide the true destination of a malicious QR code.');
      }

      const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (ipRegex.test(domain)) {
        riskScore += 6;
        findings.push('The destination is an IP address instead of a domain. Highly suspicious.');
      }
    } else {
      findings.push('The QR code contains plain text, not a web link.');
    }

    setResult({
      content,
      isUrl,
      riskScore,
      findings
    });
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
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      scanQR(droppedFile);
    } else {
      setError('Please drop a valid image file.');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      scanQR(selectedFile);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const getRiskColor = (score: number) => {
    if (score >= 7) return 'text-rose-450';
    if (score >= 4) return 'text-amber-500';
    return 'text-[#3C6B4D]';
  };

  const getRiskBg = (score: number) => {
    if (score >= 7) return 'bg-rose-500/10 border-rose-500/30';
    if (score >= 4) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-[#3C6B4D]/10 border-[#3C6B4D]/30';
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
          <QrCode size={20} className="text-[#3C6B4D]" />
          QR Security Scanner
        </h3>
        <p className="text-[#A3A09B] text-xs leading-relaxed">
          Upload a photo of a QR code to securely analyze its destination before you scan it with your phone. 
          Detects hidden URLs, link shorteners, and suspicious redirect structures locally.
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
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 rounded-2xl bg-[#18191B] border border-[#2A2D30] flex items-center justify-center mb-4 text-[#3C6B4D] shadow-lg">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#ECEBE9] tracking-tight">Drop QR Image Here</h3>
          <p className="text-[#72706C] text-sm mt-2 max-w-sm text-center">
            Upload any JPG, PNG, or WebP containing a QR code.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-16 h-16 rounded-xl bg-[#18191B] border border-[#2A2D30] shrink-0 overflow-hidden">
                {previewUrl && <img src={previewUrl} alt="QR Preview" className="w-full h-full object-cover" />}
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <h4 className="font-bold text-[#ECEBE9] text-base truncate">{file.name}</h4>
                <span className="text-[11px] text-[#72706C] font-mono">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            
            <button onClick={reset} className="btn-secondary py-2 px-4 text-xs shrink-0 flex items-center gap-2">
              <RefreshCcw size={14} />
              <span>Scan Another</span>
            </button>
          </div>

          {error && (
            <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-xl text-xs text-amber-500 font-semibold flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {isScanning ? (
            <div className="glass-card p-12 border-[#2A2D30] bg-[#18191B] flex flex-col items-center justify-center gap-4">
              <div className="animate-spin w-8 h-8 border-4 border-[#3C6B4D] border-t-transparent rounded-full"></div>
              <p className="text-[#ECEBE9] font-bold text-sm">Decoding QR...</p>
            </div>
          ) : result && (
            <div className="flex flex-col gap-4">
              <div className={`glass-card p-6 border flex flex-col md:flex-row items-center justify-between gap-6 ${getRiskBg(result.riskScore)}`}>
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#72706C]">QR Code Contents</span>
                  <div className="w-full bg-[#111213] rounded-lg border border-[#2A2D30] p-4 flex items-center gap-3">
                    {result.isUrl ? <LinkIcon size={18} className="text-[#72706C]" /> : <FileText size={18} className="text-[#72706C]" />}
                    <span className="text-sm text-[#ECEBE9] font-mono break-all font-bold">{result.content}</span>
                  </div>
                </div>

                {result.isUrl && (
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#72706C]">Threat Level</span>
                    <div className="flex items-center gap-2">
                      {result.riskScore >= 7 ? (
                        <ShieldAlert size={32} className="text-rose-450" />
                      ) : result.riskScore >= 4 ? (
                        <AlertTriangle size={32} className="text-amber-500" />
                      ) : (
                        <ShieldCheck size={32} className="text-[#3C6B4D]" />
                      )}
                      <span className={`text-2xl font-bold ${getRiskColor(result.riskScore)}`}>{result.riskScore}/10</span>
                    </div>
                  </div>
                )}
              </div>

              {result.findings.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="font-bold text-[#ECEBE9] text-sm uppercase tracking-wider text-[#72706C] mt-2 mb-1">
                    Analysis Findings
                  </h4>
                  {result.findings.map((finding: string, i: number) => (
                    <div key={i} className="glass-card p-4 border-[#2A2D30] bg-[#18191B] flex items-center gap-3">
                      <AlertTriangle size={16} className={result.isUrl && result.riskScore > 3 ? 'text-amber-500' : 'text-[#3C6B4D]'} />
                      <span className="text-xs text-[#ECEBE9]">{finding}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
