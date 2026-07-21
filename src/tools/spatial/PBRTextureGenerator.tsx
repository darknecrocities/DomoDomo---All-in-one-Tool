import { useState, useRef, useEffect } from 'react';
import { triggerDownload } from '../../utils/sharedHelpers';
import { ZoomIn, ZoomOut, Sparkles, Package } from 'lucide-react';
import JSZip from 'jszip';

export const PBRTextureGeneratorTool = () => {
  const [diffuseUrl, setDiffuseUrl] = useState<string>('');
  const [normalIntensity, setNormalIntensity] = useState(2.5);
  const [roughnessContrast, setRoughnessContrast] = useState(1.2);
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState<'3d' | 'normal' | 'roughness' | 'ao' | 'height'>('3d');

  const canvas3dRef = useRef<HTMLCanvasElement>(null);
  const normalCanvasRef = useRef<HTMLCanvasElement>(null);
  const roughnessCanvasRef = useRef<HTMLCanvasElement>(null);
  const aoCanvasRef = useRef<HTMLCanvasElement>(null);
  const heightCanvasRef = useRef<HTMLCanvasElement>(null);

  // Default sample texture generator
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw sci-fi metallic stone pattern
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#2D3748');
    grad.addColorStop(0.5, '#1A202C');
    grad.addColorStop(1, '#4A5568');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#4E8E5E';
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = Math.random() * 15 + 5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    setDiffuseUrl(canvas.toDataURL('image/png'));
  }, []);

  // Process PBR Maps using Sobel Filter
  useEffect(() => {
    if (!diffuseUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = 256, h = 256;

      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = w; sourceCanvas.height = h;
      const sCtx = sourceCanvas.getContext('2d');
      if (!sCtx) return;
      sCtx.drawImage(img, 0, 0, w, h);
      const imgData = sCtx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // 1. Height / Displacement Map (Grayscale)
      const heightImgData = new ImageData(w, h);
      const hData = heightImgData.data;
      const grayscale: number[] = new Array(w * h);

      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        grayscale[i / 4] = avg;
        hData[i] = avg; hData[i + 1] = avg; hData[i + 2] = avg; hData[i + 3] = 255;
      }
      if (heightCanvasRef.current) {
        heightCanvasRef.current.width = w; heightCanvasRef.current.height = h;
        heightCanvasRef.current.getContext('2d')?.putImageData(heightImgData, 0, 0);
      }

      // 2. Normal Map (Sobel Gradients)
      const normImgData = new ImageData(w, h);
      const nData = normImgData.data;

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          const dzdx = ((grayscale[idx + 1] - grayscale[idx - 1]) / 255.0) * normalIntensity;
          const dzdy = ((grayscale[idx + w] - grayscale[idx - w]) / 255.0) * normalIntensity;
          
          let nx = -dzdx, ny = -dzdy, nz = 1.0;
          const len = Math.hypot(nx, ny, nz);
          nx /= len; ny /= len; nz /= len;

          const px = (idx) * 4;
          nData[px] = Math.floor((nx + 1) * 127.5);
          nData[px + 1] = Math.floor((ny + 1) * 127.5);
          nData[px + 2] = Math.floor((nz + 1) * 127.5);
          nData[px + 3] = 255;
        }
      }
      if (normalCanvasRef.current) {
        normalCanvasRef.current.width = w; normalCanvasRef.current.height = h;
        normalCanvasRef.current.getContext('2d')?.putImageData(normImgData, 0, 0);
      }

      // 3. Roughness Map
      const roughImgData = new ImageData(w, h);
      const rData = roughImgData.data;
      for (let i = 0; i < grayscale.length; i++) {
        const val = Math.min(255, Math.max(0, (255 - grayscale[i]) * roughnessContrast));
        const px = i * 4;
        rData[px] = val; rData[px + 1] = val; rData[px + 2] = val; rData[px + 3] = 255;
      }
      if (roughnessCanvasRef.current) {
        roughnessCanvasRef.current.width = w; roughnessCanvasRef.current.height = h;
        roughnessCanvasRef.current.getContext('2d')?.putImageData(roughImgData, 0, 0);
      }

      // 4. Ambient Occlusion (AO)
      const aoImgData = new ImageData(w, h);
      const aData = aoImgData.data;
      for (let i = 0; i < grayscale.length; i++) {
        const val = Math.min(255, grayscale[i] + 40);
        const px = i * 4;
        aData[px] = val; aData[px + 1] = val; aData[px + 2] = val; aData[px + 3] = 255;
      }
      if (aoCanvasRef.current) {
        aoCanvasRef.current.width = w; aoCanvasRef.current.height = h;
        aoCanvasRef.current.getContext('2d')?.putImageData(aoImgData, 0, 0);
      }
    };
    img.src = diffuseUrl;
  }, [diffuseUrl, normalIntensity, roughnessContrast]);

  // Render 3D Sphere Preview
  useEffect(() => {
    const canvas = canvas3dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111213';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render 3D Shaded Sphere
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = (zoom / 100) * 110;

    const grad = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1, centerX, centerY, radius);
    grad.addColorStop(0, '#718096');
    grad.addColorStop(0.4, '#3C6B4D');
    grad.addColorStop(1, '#111213');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#2A2D30';
    ctx.stroke();

  }, [zoom]);

  const handleDownloadZIP = async () => {
    const zip = new JSZip();
    if (normalCanvasRef.current) {
      const b64 = normalCanvasRef.current.toDataURL('image/png').split(',')[1];
      zip.file('normal_map.png', b64, { base64: true });
    }
    if (roughnessCanvasRef.current) {
      const b64 = roughnessCanvasRef.current.toDataURL('image/png').split(',')[1];
      zip.file('roughness_map.png', b64, { base64: true });
    }
    if (aoCanvasRef.current) {
      const b64 = aoCanvasRef.current.toDataURL('image/png').split(',')[1];
      zip.file('ao_map.png', b64, { base64: true });
    }
    if (heightCanvasRef.current) {
      const b64 = heightCanvasRef.current.toDataURL('image/png').split(',')[1];
      zip.file('height_map.png', b64, { base64: true });
    }
    const content = await zip.generateAsync({ type: 'blob' });
    triggerDownload(URL.createObjectURL(content), 'pbr_maps_package.zip');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between rounded-2xl border border-[#2A2D30]">
        
        {/* Tab Header */}
        <div className="flex justify-between items-center bg-[#18191B] p-2 rounded-xl border border-[#2A2D30] mb-4">
          <div className="flex gap-1">
            {(['3d', 'normal', 'roughness', 'ao', 'height'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${activeTab === tab ? 'bg-[#3C6B4D] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {tab === '3d' ? '3D Viewport' : `${tab} Map`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#111213] p-1 rounded-lg border border-[#2A2D30]">
            <button onClick={() => setZoom(z => Math.max(50, z - 15))} className="p-1 text-slate-400 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="text-[11px] font-mono font-semibold px-2 text-emerald-400">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 15))} className="p-1 text-slate-400 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Viewport Display */}
        <div className="w-full flex-1 flex items-center justify-center min-h-[360px]">
          <canvas ref={canvas3dRef} width={500} height={350} className={`rounded-xl border border-[#2A2D30] ${activeTab === '3d' ? 'block' : 'hidden'}`} />
          <canvas ref={normalCanvasRef} width={256} height={256} className={`rounded-xl border border-[#2A2D30] max-w-[320px] ${activeTab === 'normal' ? 'block' : 'hidden'}`} />
          <canvas ref={roughnessCanvasRef} width={256} height={256} className={`rounded-xl border border-[#2A2D30] max-w-[320px] ${activeTab === 'roughness' ? 'block' : 'hidden'}`} />
          <canvas ref={aoCanvasRef} width={256} height={256} className={`rounded-xl border border-[#2A2D30] max-w-[320px] ${activeTab === 'ao' ? 'block' : 'hidden'}`} />
          <canvas ref={heightCanvasRef} width={256} height={256} className={`rounded-xl border border-[#2A2D30] max-w-[320px] ${activeTab === 'height' ? 'block' : 'hidden'}`} />
        </div>
      </div>

      {/* Control Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 rounded-2xl border border-[#2A2D30]">
          <h3 className="text-emerald-400 font-bold border-b border-[#2A2D30] pb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> PBR Map Generator
          </h3>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">Normal Map Depth</span>
            <input type="range" min="0.5" max="5.0" step="0.1" value={normalIntensity} onChange={e => setNormalIntensity(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">Roughness Contrast</span>
            <input type="range" min="0.5" max="3.0" step="0.1" value={roughnessContrast} onChange={e => setRoughnessContrast(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-[#2A2D30]">
            <span className="text-xs text-slate-300 font-semibold uppercase">Upload 2D Texture</span>
            <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setDiffuseUrl(URL.createObjectURL(e.target.files[0]))} className="text-xs text-slate-400" />
          </div>

          <button onClick={handleDownloadZIP} className="w-full py-3 bg-[#3C6B4D] hover:bg-[#4E8E5E] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg">
            <Package className="w-4 h-4" /> Download PBR ZIP Package
          </button>
        </div>
      </div>
    </div>
  );
};
