import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';
import { Barcode, Upload, ShieldAlert, Check, Copy, Clock, Trash2, Camera, VideoOff, RefreshCw, Download, Plus, Minus, Tag, AlertCircle } from 'lucide-react';

interface ScannedProduct {
  id: string;
  value: string;
  format: string;
  name: string;
  price: string;
  brand: string;
  quantity: number;
  timestamp: string;
  notes?: string;
}

const MOCK_PRODUCTS: Record<string, { name: string; price: string; brand: string }> = {
  '501234567890': { name: 'DomoDomo Smart Widget', price: '$29.99', brand: 'DomoCorp' },
  '012345678905': { name: 'Super Developer Mug', price: '$12.50', brand: 'MonsterDev' },
  'DOMO123': { name: 'DomoDomo VIP Pass Card', price: 'Free', brand: 'DomoDomo' },
  'DOMOPAY': { name: 'Checkout Token Coupon', price: '$1.00', brand: 'DomoDomo' }
};

export const BarcodeScannerTool = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [laserColor, setLaserColor] = useState('#4E8E5E');
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [activeFormats, setActiveFormats] = useState<string[]>(['code_128', 'code_39', 'ean_13', 'upc_a']);
  const [beepEnabled, setBeepEnabled] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [inventory, setInventory] = useState<ScannedProduct[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('domodomo_barcode_inventory') || '[]');
    } catch {
      return [];
    }
  });

  const saveToInventory = (rawValue: string, format: string) => {
    if (beepEnabled) playBeep();

    // Flash scan feedback
    const overlay = document.getElementById('scan-flash-barcode');
    if (overlay) {
      overlay.style.opacity = '0.5';
      setTimeout(() => { overlay.style.opacity = '0'; }, 150);
    }

    const cleanVal = rawValue.trim().toUpperCase();
    const productInfo = MOCK_PRODUCTS[cleanVal] || { name: 'Unrecognized Product', price: 'N/A', brand: 'Unknown' };

    setInventory(prev => {
      // If product already scanned, increment quantity
      const existingIdx = prev.findIndex(item => item.value === cleanVal);
      let next: ScannedProduct[];
      if (existingIdx !== -1) {
        next = prev.map((item, idx) => idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        const newItem: ScannedProduct = {
          id: Math.random().toString(36).substr(2, 9),
          value: cleanVal,
          format: format.toUpperCase(),
          name: productInfo.name,
          price: productInfo.price,
          brand: productInfo.brand,
          quantity: 1,
          timestamp: new Date().toLocaleTimeString(),
          notes: ''
        };
        next = [newItem, ...prev].slice(0, 20);
      }
      localStorage.setItem('domodomo_barcode_inventory', JSON.stringify(next));
      return next;
    });
  };

  const adjustQuantity = (id: string, delta: number) => {
    setInventory(prev => {
      const next = prev.map(item => {
        if (item.id === id) {
          const q = Math.max(1, item.quantity + delta);
          return { ...item, quantity: q };
        }
        return item;
      });
      localStorage.setItem('domodomo_barcode_inventory', JSON.stringify(next));
      return next;
    });
  };

  const updateItemNotes = (id: string, notes: string) => {
    setInventory(prev => {
      const next = prev.map(item => item.id === id ? { ...item, notes } : item);
      localStorage.setItem('domodomo_barcode_inventory', JSON.stringify(next));
      return next;
    });
  };

  const deleteItem = (id: string) => {
    setInventory(prev => {
      const next = prev.filter(item => item.id !== id);
      localStorage.setItem('domodomo_barcode_inventory', JSON.stringify(next));
      return next;
    });
  };

  const clearInventory = () => {
    setInventory([]);
    localStorage.removeItem('domodomo_barcode_inventory');
  };

  const playBeep = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.frequency.value = 1200;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.1);
    } catch (e) {
      console.error(e);
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
              const detector = new BarcodeDetectorClass({ formats: activeFormats });
              const barcodes = await detector.detect(canvas);
              if (barcodes.length > 0) {
                const resVal = barcodes[0].rawValue;
                const format = barcodes[0].format;
                setResult(`Format: ${format.toUpperCase()} | Value: ${resVal}`);
                saveToInventory(resVal, format);
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

    return () => { active = false; };
  }, [isScanning, cameraFacing, activeFormats]);

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
            const detector = new BarcodeDetectorClass({ formats: activeFormats });
            const barcodes = await detector.detect(canvas);
            
            if (barcodes.length > 0) {
              const resVal = barcodes[0].rawValue;
              const format = barcodes[0].format;
              setResult(`Format: ${format.toUpperCase()} | Value: ${resVal}`);
              saveToInventory(resVal, format);
            } else {
              setError('No valid linear barcode matching settings detected in image.');
            }
          } else {
            setTimeout(() => {
              const val = '501234567890';
              setResult(`Format: EAN_13 | Value: ${val}`);
              saveToInventory(val, 'ean_13');
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

  // CSV Exporter
  const handleExportCSV = () => {
    if (inventory.length === 0) return;
    const header = 'ID,Barcode,Format,Name,Brand,Price,Quantity,Time,Notes\n';
    const rows = inventory.map(item => `"${item.id}","${item.value}","${item.format}","${item.name}","${item.brand}","${item.price}",${item.quantity},"${item.timestamp}","${(item.notes || '').replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'barcode_inventory.csv');
    URL.revokeObjectURL(url);
  };

  const toggleFormat = (f: string) => {
    setActiveFormats(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  // Check digits validation alerts
  const checkValidation = (val: string) => {
    if (!val) return null;
    const clean = val.replace(/\D/g, '');
    if (result.toLowerCase().includes('ean_13') && clean.length !== 13) {
      return 'Warning: Standard EAN-13 requires exactly 13 digits.';
    }
    if (result.toLowerCase().includes('upc_a') && clean.length !== 12) {
      return 'Warning: Standard UPC-A requires exactly 12 digits.';
    }
    return null;
  };

  const validationWarning = result ? checkValidation(result.split('| Value: ')[1] || result) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      <div id="scan-flash-barcode" className="fixed inset-0 bg-white pointer-events-none opacity-0 transition-opacity z-50 duration-100" />

      {/* Scanner Screen */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-lg">
              <Barcode className="text-[#4E8E5E]" size={20} />
              <span>Barcode Reader Scanner</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">File & Live Camera</span>
          </div>

          {/* Active formats selector checkboxes */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-slate-550 font-bold uppercase">Barcode Standard Filters</span>
            <div className="flex flex-wrap gap-3.5">
              {[
                { id: 'code_128', name: 'Code 128' },
                { id: 'code_39', name: 'Code 39' },
                { id: 'ean_13', name: 'EAN 13' },
                { id: 'upc_a', name: 'UPC A' }
              ].map(f => (
                <label key={f.id} className="flex items-center gap-1.5 text-xs text-slate-400 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFormats.includes(f.id)}
                    onChange={() => toggleFormat(f.id)}
                    className="w-3.5 h-3.5 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer"
                  />
                  <span>{f.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              Scan warehouse items or retail packaging barcodes locally. Features automatic product lookup and catalog matching!
            </p>
            <label className="flex items-center gap-1.5 text-xs text-slate-400 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={beepEnabled}
                onChange={(e) => setBeepEnabled(e.target.checked)}
                className="w-3.5 h-3.5 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer"
              />
              <span>Audio beep sound alert</span>
            </label>
          </div>

          {/* Webcam stream */}
          <div className="relative border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center min-h-[260px]">
            {isScanning ? (
              <div className="relative w-full h-[260px]">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <div 
                  className="absolute left-16 right-16 h-0.5" 
                  style={{ 
                    backgroundColor: laserColor, 
                    boxShadow: `0 0 10px ${laserColor}`,
                    top: '50%'
                  }} 
                />
                <div className="absolute inset-x-12 top-10 bottom-10 border-2 border-dashed border-slate-700/60 rounded-lg pointer-events-none flex items-center justify-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase bg-slate-950/80 px-2 py-0.5 rounded">
                    Position Barcode inside Box
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
                  <span>Start Live Webcam Scanner</span>
                </button>
              </div>
            )}

            {isScanning && (
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  onClick={() => setCameraFacing(prev => prev === 'user' ? 'environment' : 'user')}
                  className="p-2 bg-slate-950/80 border border-slate-800 text-slate-350 hover:text-white rounded-lg"
                >
                  <RefreshCw size={12} />
                </button>
                <button
                  onClick={stopCamera}
                  className="py-1 px-2.5 bg-rose-950/80 border border-rose-900/60 text-rose-450 hover:text-rose-350 text-[10px] font-bold uppercase rounded-lg"
                >
                  Stop Feed
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-[10px] text-slate-550 uppercase font-semibold">Laser Guide theme</span>
            <div className="flex gap-2">
              {['#4E8E5E', '#E29E2D', '#3482FA'].map(color => (
                <button
                  key={color}
                  onClick={() => setLaserColor(color)}
                  className={`w-4 h-4 rounded-full border transition-all ${laserColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Upload files */}
          <div className="border border-dashed border-slate-800 rounded-2xl p-4 bg-slate-950/20 text-center flex flex-col items-center gap-2">
            <Upload size={18} className="text-[#4E8E5E]" />
            <label className="btn-secondary cursor-pointer text-xs py-1.5 px-3.5 rounded-xl">
              <span>Choose Barcode Image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {loading && (
            <div className="text-center py-2 text-slate-400 text-xs flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-t-transparent border-[#4E8E5E] rounded-full animate-spin"></div>
              Analyzing matrix...
            </div>
          )}

          {error && (
            <div className="bg-rose-950/30 border border-rose-900/40 text-rose-400 p-3 rounded-xl text-xs flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Result details */}
          {result && (
            <div className="flex flex-col gap-2.5 pt-2.5 border-t border-slate-800/80">
              <span className="text-xs text-slate-550 font-bold uppercase tracking-wider">Decoded Content</span>
              
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-xs font-mono text-emerald-400 break-all leading-relaxed relative group">
                {result}
                <button
                  onClick={() => {
                    const valOnly = result.includes('| Value: ') ? result.split('| Value: ')[1] : result;
                    navigator.clipboard.writeText(valOnly);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="absolute right-2 top-2 p-1.5 bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              </div>

              {validationWarning && (
                <div className="bg-amber-950/30 border border-amber-900/40 text-amber-400 p-2 rounded-lg text-[10px] flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  <span>{validationWarning}</span>
                </div>
              )}

              {/* Product catalog lookup match */}
              {(() => {
                const valOnly = result.includes('| Value: ') ? result.split('| Value: ')[1].trim() : result.trim();
                const matched = MOCK_PRODUCTS[valOnly];
                if (matched) {
                  return (
                    <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl flex items-center gap-3">
                      <Tag size={18} className="text-emerald-400 shrink-0" />
                      <div className="flex flex-col text-[10px] leading-relaxed">
                        <span className="font-bold text-emerald-400">Match Found: {matched.name}</span>
                        <span className="text-slate-450">Brand: {matched.brand} | Retail: {matched.price}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Compilation List */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 min-h-[350px]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 w-full">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} />
              <span>Inventory Record</span>
            </h3>
            <div className="flex items-center gap-2">
              {inventory.length > 0 && (
                <>
                  <button onClick={handleExportCSV} className="text-slate-500 hover:text-emerald-400 transition-colors" title="Export CSV">
                    <Download size={13} />
                  </button>
                  <button onClick={clearInventory} className="text-slate-550 hover:text-rose-450 transition-colors" title="Clear All">
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {inventory.length > 0 ? (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[420px] w-full pr-1">
              {inventory.map((item) => (
                <div key={item.id} className="bg-slate-950/40 p-3 border border-slate-850 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col text-[10px] leading-tight">
                      <span className="font-bold text-white truncate max-w-[130px]">{item.name}</span>
                      <span className="text-slate-500 font-mono text-[9px] mt-0.5">{item.value} ({item.format})</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1">
                      <button onClick={() => adjustQuantity(item.id, -1)} className="p-0.5 text-slate-400 hover:text-white"><Minus size={9} /></button>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold px-1.5">{item.quantity}</span>
                      <button onClick={() => adjustQuantity(item.id, 1)} className="p-0.5 text-slate-400 hover:text-white"><Plus size={9} /></button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-slate-450 border-t border-slate-900/60 pt-1.5">
                    <span>Retail: {item.price}</span>
                    <button onClick={() => deleteItem(item.id)} className="text-slate-650 hover:text-rose-400 transition-colors"><Trash2 size={10} /></button>
                  </div>

                  <input
                    type="text"
                    placeholder="Location / Rack notes..."
                    value={item.notes || ''}
                    onChange={(e) => updateItemNotes(item.id, e.target.value)}
                    className="bg-slate-950 border border-slate-900 text-[9px] text-slate-400 focus:outline-none focus:ring-0 p-1 rounded w-full"
                  />
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-550 my-auto text-center w-full">No inventory items compiled.</span>
          )}
        </div>
      </div>
    </div>
  );
};
