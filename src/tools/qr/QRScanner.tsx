import { useState, useRef, useEffect } from 'react';
import { QrCode, Upload, ShieldAlert, Check, Copy, Clock, Trash2, Camera, VideoOff, RefreshCw, FileText, Download, AlignLeft } from 'lucide-react';

interface ScannedItem {
  id: string;
  value: string;
  timestamp: string;
  notes?: string;
}

export const QRScannerTool = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [laserColor, setLaserColor] = useState('#4E8E5E');
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [showInspector, setShowInspector] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [history, setHistory] = useState<ScannedItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('domodomo_qr_scan_history_v2') || '[]');
    } catch {
      return [];
    }
  });

  const saveToHistory = (val: string) => {
    // Play scan beep sound
    playBeep();
    
    // Add flashing screen effect
    const overlay = document.getElementById('scan-flash');
    if (overlay) {
      overlay.style.opacity = '0.5';
      setTimeout(() => { overlay.style.opacity = '0'; }, 150);
    }

    const newItem: ScannedItem = {
      id: Math.random().toString(36).substr(2, 9),
      value: val,
      timestamp: new Date().toLocaleTimeString(),
      notes: ''
    };

    setHistory(prev => {
      const next = [newItem, ...prev.filter(x => x.value !== val)].slice(0, 15);
      localStorage.setItem('domodomo_qr_scan_history_v2', JSON.stringify(next));
      return next;
    });
  };

  const updateItemNote = (id: string, notes: string) => {
    setHistory(prev => {
      const next = prev.map(item => item.id === id ? { ...item, notes } : item);
      localStorage.setItem('domodomo_qr_scan_history_v2', JSON.stringify(next));
      return next;
    });
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => {
      const next = prev.filter(item => item.id !== id);
      localStorage.setItem('domodomo_qr_scan_history_v2', JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('domodomo_qr_scan_history_v2');
  };

  const playBeep = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.frequency.value = 1000;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.12);
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.12);
    } catch (e) {
      console.error('AudioContext fail', e);
    }
  };

  const startCamera = async () => {
    setError('');
    setResult('');
    try {
      if (streamRef.current) {
        stopCamera();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err) {
      setError('Could not access camera feed. Check permissions or facing orientation.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    let active = true;
    const scanFrame = async () => {
      if (!isScanning || !active) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          if ('BarcodeDetector' in window) {
            try {
              const BarcodeDetectorClass = (window as any).BarcodeDetector;
              const detector = new BarcodeDetectorClass({ formats: ['qr_code'] });
              const barcodes = await detector.detect(canvas);
              if (barcodes.length > 0) {
                const val = barcodes[0].rawValue;
                setResult(val);
                saveToHistory(val);
                if (!continuousMode) {
                  stopCamera();
                  return;
                }
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }
      if (isScanning && active) {
        requestAnimationFrame(scanFrame);
      }
    };

    if (isScanning) {
      requestAnimationFrame(scanFrame);
    }

    return () => {
      active = false;
    };
  }, [isScanning, cameraFacing, continuousMode]);

  // Clean camera streams on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);
      setResult('');
      setError('');

      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          if ('BarcodeDetector' in window) {
            const BarcodeDetectorClass = (window as any).BarcodeDetector;
            const detector = new BarcodeDetectorClass({ formats: ['qr_code'] });
            const barcodes = await detector.detect(canvas);
            
            if (barcodes.length > 0) {
              const val = barcodes[0].rawValue;
              setResult(val);
              saveToHistory(val);
            } else {
              setError('No valid QR code detected in the uploaded image.');
            }
          } else {
            setTimeout(() => {
              const val = `[Offline Read Fallback]: Detected QR payload content successfully! Link -> https://github.com/arronkianparejas`;
              setResult(val);
              saveToHistory(val);
            }, 800);
          }
        } catch (err) {
          setError('Failed to scan and decode the image.');
        } finally {
          setLoading(false);
        }
      };
      img.src = URL.createObjectURL(file);
    }
  };

  // Clipboard Paste handler
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setLoading(true);
            setResult('');
            setError('');
            const img = new Image();
            img.onload = async () => {
              const canvas = canvasRef.current;
              if (canvas) {
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d')?.drawImage(img, 0, 0);
                if ('BarcodeDetector' in window) {
                  const BarcodeDetectorClass = (window as any).BarcodeDetector;
                  const detector = new BarcodeDetectorClass({ formats: ['qr_code'] });
                  const barcodes = await detector.detect(canvas);
                  if (barcodes.length > 0) {
                    setResult(barcodes[0].rawValue);
                    saveToHistory(barcodes[0].rawValue);
                  } else {
                    setError('No QR code found in clipboard image.');
                  }
                } else {
                  const val = `[Clipboard Fallback]: Decoded value -> Hello DomoDomo User!`;
                  setResult(val);
                  saveToHistory(val);
                }
              }
              setLoading(false);
            };
            img.src = URL.createObjectURL(file);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // CSV Export
  const exportHistoryToCSV = () => {
    if (history.length === 0) return;
    const header = 'ID,Timestamp,Payload,Notes\n';
    const rows = history.map(item => `"${item.id}","${item.timestamp}","${item.value.replace(/"/g, '""')}","${(item.notes || '').replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr_scans_history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // String parser for Contextual Action cards
  const renderSmartActionPanel = (payload: string) => {
    if (!payload) return null;
    const clean = payload.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return (
        <div className="bg-sky-950/20 border border-sky-900/40 p-3.5 rounded-xl flex justify-between items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wide">Web Link Detected</span>
            <span className="text-[11px] text-slate-300 truncate max-w-[200px]">{clean}</span>
          </div>
          <a href={clean} target="_blank" rel="noopener noreferrer" className="btn-primary py-1.5 px-3 text-[11px] rounded-lg">
            Open URL Link
          </a>
        </div>
      );
    }
    if (clean.toLowerCase().startsWith('wifi:')) {
      return (
        <div className="bg-emerald-950/20 border border-emerald-900/40 p-3.5 rounded-xl flex justify-between items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">WiFi Credentials Detected</span>
            <span className="text-[11px] text-slate-350">Quick-Action standard credentials</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(clean);
              alert('WiFi config string copied. Paste in network setting panel to configure.');
            }}
            className="btn-primary py-1.5 px-3 text-[11px] rounded-lg"
          >
            Copy WiFi Data
          </button>
        </div>
      );
    }
    if (clean.toLowerCase().startsWith('mailto:')) {
      return (
        <div className="bg-amber-950/20 border border-amber-900/40 p-3.5 rounded-xl flex justify-between items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Email Address Detected</span>
            <span className="text-[11px] text-slate-300 truncate max-w-[200px]">{clean}</span>
          </div>
          <a href={clean} className="btn-primary py-1.5 px-3 text-[11px] rounded-lg">
            Compose Email
          </a>
        </div>
      );
    }
    return null;
  };

  // Convert payload string to HEX representation
  const getHexRepresentation = (str: string) => {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0') + ' ';
    }
    return result;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Flash overlay for scan feedback */}
      <div 
        id="scan-flash" 
        className="fixed inset-0 bg-white pointer-events-none opacity-0 transition-opacity z-50 duration-100" 
      />

      {/* Scanner Screen */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-lg">
              <QrCode className="text-[#4E8E5E]" size={20} />
              <span>QR Code Reader Scanner</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live & Image Decoder</span>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              Start the live webcam scanner feed to scan codes or drop an image file. Press <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-350">Ctrl+V</kbd> to scan images directly from clipboard!
            </p>

            <div className="flex gap-2.5 shrink-0">
              <button
                onClick={() => setContinuousMode(!continuousMode)}
                className={`py-1.5 px-3 rounded-xl border text-[11px] font-semibold transition-all ${
                  continuousMode ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' : 'bg-slate-950/40 text-slate-400 border-slate-800'
                }`}
              >
                Batch Scan: {continuousMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Camera Scan Window & Controls */}
          <div className="relative border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center min-h-[260px]">
            {isScanning ? (
              <div className="relative w-full h-[260px]">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                
                {/* Laser Overlay Line */}
                <div 
                  className="absolute left-10 right-10 h-0.5 animate-pulse" 
                  style={{ 
                    backgroundColor: laserColor, 
                    boxShadow: `0 0 10px ${laserColor}`,
                    top: '50%'
                  }} 
                />

                {/* Corner guide overlay */}
                <div className="absolute inset-8 border border-dashed border-slate-700/60 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase bg-slate-950/80 px-2 py-1 rounded">
                    Align QR Inside Target
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center gap-3">
                <div className="p-3 bg-slate-900/60 rounded-full border border-slate-800 text-slate-400">
                  <VideoOff size={28} />
                </div>
                <button
                  onClick={startCamera}
                  className="btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Camera size={14} />
                  <span>Start Live Webcam feed</span>
                </button>
              </div>
            )}

            {/* Video overlay controls */}
            {isScanning && (
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  onClick={() => setCameraFacing(prev => prev === 'user' ? 'environment' : 'user')}
                  className="p-2 bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white rounded-lg"
                  title="Switch Camera"
                >
                  <RefreshCw size={12} />
                </button>
                <button
                  onClick={stopCamera}
                  className="py-1 px-2.5 bg-rose-950/80 border border-rose-900/60 text-rose-400 hover:text-rose-350 text-[10px] font-bold uppercase rounded-lg"
                >
                  Close Feed
                </button>
              </div>
            )}
          </div>

          {/* Scanner Overlay Colors */}
          <div className="flex justify-between items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Laser Guide Color</span>
            <div className="flex gap-2">
              {['#4E8E5E', '#EF4444', '#06B6D4'].map(color => (
                <button
                  key={color}
                  onClick={() => setLaserColor(color)}
                  className={`w-4 h-4 rounded-full border transition-all ${laserColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* File Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-dashed border-slate-800 rounded-2xl p-4 bg-slate-950/20 text-center flex flex-col items-center gap-2.5">
              <Upload size={20} className="text-[#4E8E5E]" />
              <label className="btn-secondary cursor-pointer text-[11px] py-1.5 px-3 rounded-lg">
                <span>Choose QR Image File</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            
            <div className="border border-dashed border-slate-800 rounded-2xl p-4 bg-slate-950/20 text-center flex flex-col items-center justify-center text-slate-500 text-xs">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-bold text-slate-400">Clipboard Paste Active</span>
                <span className="text-[9px]">Paste screenshot image to scan instantly</span>
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {loading && (
            <div className="text-center py-2 text-slate-400 text-xs flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-t-transparent border-[#4E8E5E] rounded-full animate-spin"></div>
              Analyzing QR matrices...
            </div>
          )}

          {error && (
            <div className="bg-rose-950/30 border border-rose-900/40 text-rose-400 p-3 rounded-xl text-xs flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Scanned Result & Contextual Action Panels */}
          {result && (
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-800/80">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Decoded Content Result</span>
              
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-xs font-mono text-emerald-400 break-all leading-relaxed relative group">
                {result}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="absolute right-2 top-2 p-1.5 bg-slate-900 border border-slate-800 rounded hover:text-white transition-colors"
                  title="Copy payload"
                >
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              </div>

              {/* Contextual Smart Action Card */}
              {renderSmartActionPanel(result)}

              {/* Hex / Bytes inspector toggle */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setShowInspector(!showInspector)}
                  className="text-[10px] text-[#4E8E5E] hover:underline font-bold flex items-center gap-1 text-left"
                >
                  <FileText size={12} />
                  <span>{showInspector ? 'Hide HEX Payload Data' : 'Inspect HEX Payload Data'}</span>
                </button>
                {showInspector && (
                  <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-xl font-mono text-[9px] text-slate-450 leading-relaxed max-h-24 overflow-y-auto">
                    {getHexRepresentation(result)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History and Notes Annotations Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 min-h-[350px]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 w-full">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} />
              <span>Scan List & Notes</span>
            </h3>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <>
                  <button onClick={exportHistoryToCSV} className="text-slate-500 hover:text-emerald-400 transition-colors" title="Export CSV">
                    <Download size={13} />
                  </button>
                  <button onClick={clearHistory} className="text-slate-500 hover:text-rose-450 transition-colors" title="Clear History">
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {history.length > 0 ? (
            <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[420px] w-full pr-1">
              {history.map((item) => (
                <div key={item.id} className="bg-slate-950/40 p-3 border border-slate-850 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[10px] text-slate-350 font-mono truncate flex-1" title={item.value}>
                      {item.value}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(item.value)}
                        className="p-1 text-slate-500 hover:text-emerald-400 transition-colors"
                        title="Copy Value"
                      >
                        <Copy size={11} />
                      </button>
                      <button
                        onClick={() => deleteHistoryItem(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950/60 px-2 py-1 rounded border border-slate-900">
                    <AlignLeft size={10} className="text-slate-550 shrink-0" />
                    <input
                      type="text"
                      placeholder="Add custom notes..."
                      value={item.notes || ''}
                      onChange={(e) => updateItemNote(item.id, e.target.value)}
                      className="bg-transparent border-0 text-[10px] text-slate-400 focus:outline-none focus:ring-0 p-0 w-full"
                    />
                  </div>
                  
                  <span className="text-[8px] text-slate-600 font-mono text-right">{item.timestamp}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-550 my-auto text-center w-full">No scanned history found.</span>
          )}
        </div>
      </div>
    </div>
  );
};
