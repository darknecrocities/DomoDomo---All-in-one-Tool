import { useState, useEffect, useRef } from 'react';
import { Layout, RotateCw, Monitor, Download, ClipboardList, HelpCircle } from 'lucide-react';

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'desktop';
}

const DEVICE_PRESETS: DevicePreset[] = [
  { name: 'iPhone SE (Mobile)', width: 375, height: 667, type: 'mobile' },
  { name: 'iPhone 12 Pro (Mobile)', width: 390, height: 844, type: 'mobile' },
  { name: 'iPad Air (Tablet)', width: 820, height: 1180, type: 'tablet' },
  { name: 'Desktop 1080p (Large)', width: 1920, height: 1080, type: 'desktop' },
  { name: 'Desktop 4K (Ultra Large)', width: 3840, height: 2160, type: 'desktop' },
];

const USER_AGENT_PRESETS = [
  {
    name: 'Chrome on macOS (Desktop)',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
  },
  {
    name: 'Safari on iPhone (Mobile)',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  },
  {
    name: 'Chrome on Android (Mobile)',
    ua: 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
  },
  {
    name: 'Firefox on Windows (Desktop)',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'
  }
];

const NETWORK_PROFILES = [
  { name: 'GPRS (Slow)', speedKbps: 56 },
  { name: '3G (Moderate)', speedKbps: 768 },
  { name: '4G (Fast)', speedKbps: 15000 },
  { name: 'Wi-Fi / Broadband', speedKbps: 100000 },
];

export const ViewportTesterTool = () => {
  const [width, setWidth] = useState(390);
  const [height, setHeight] = useState(844);
  const [preset, setPreset] = useState('iPhone 12 Pro (Mobile)');
  const [scale, setScale] = useState(100);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // User-Agent states
  const [userAgent, setUserAgent] = useState(USER_AGENT_PRESETS[0].ua);
  const [selectedUaPreset, setSelectedUaPreset] = useState('Chrome on macOS (Desktop)');

  // Network speeds calculator
  const [fileSizeMB, setFileSizeMB] = useState(5);
  const [networkProfile, setNetworkProfile] = useState('4G (Fast)');
  const [downloadTimeSec, setDownloadTimeSec] = useState(0);

  // Mouse track
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Parse preset selection
  const handlePresetChange = (name: string) => {
    setPreset(name);
    const found = DEVICE_PRESETS.find(d => d.name === name);
    if (found) {
      if (orientation === 'portrait') {
        setWidth(found.width);
        setHeight(found.height);
      } else {
        setWidth(found.height);
        setHeight(found.width);
      }
    }
  };

  const handleOrientationToggle = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
    setWidth(height);
    setHeight(width);
  };

  const handleUaChange = (name: string) => {
    setSelectedUaPreset(name);
    const found = USER_AGENT_PRESETS.find(u => u.name === name);
    if (found) {
      setUserAgent(found.ua);
    }
  };

  // Calculate download times
  useEffect(() => {
    const profile = NETWORK_PROFILES.find(n => n.name === networkProfile) || NETWORK_PROFILES[2];
    const speedBytes = (profile.speedKbps * 1000) / 8; // convert kbps to bytes/sec
    const fileBytes = fileSizeMB * 1024 * 1024;
    setDownloadTimeSec(fileBytes / speedBytes);
  }, [fileSizeMB, networkProfile]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * width);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * height);
      setMousePos({ x, y });
    }
  };

  const handleCopyReport = () => {
    const report = `Viewport & User-Agent Specs\n===========================\nViewport Dimensions: ${width} x ${height} (${orientation})\nScale: ${scale}%\nSimulated User-Agent: ${userAgent}\nCalculated Download Time (size ${fileSizeMB}MB, net ${networkProfile}): ${downloadTimeSec.toFixed(2)} seconds\n`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Render Preview Board */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-[#3C6B4D] font-bold flex items-center gap-1.5"><Layout size={18} /> Viewport Layout Canvas</h3>
            <div className="flex gap-2">
              <button
                onClick={handleOrientationToggle}
                className="py-1 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-slate-350 transition-colors"
              >
                <RotateCw size={12} />
                <span className="capitalize">{orientation}</span>
              </button>
            </div>
          </div>

          {/* Device viewport frame simulation */}
          <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-6 relative overflow-hidden flex items-center justify-center min-h-[350px]">
            <div
              ref={previewRef}
              onMouseMove={handleMouseMove}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: `scale(${scale / 100})`,
                transformOrigin: 'center center',
                transition: 'all 0.15s ease-out'
              }}
              className="bg-slate-900 border border-slate-750 rounded-lg relative flex flex-col justify-center items-center font-sans text-center transition-all select-none p-4 max-w-full"
            >
              <Monitor size={42} className="text-[#3C6B4D]/60 mb-3" />
              <span className="text-sm font-bold text-slate-200">Device Simulator Screen</span>
              <span className="text-[10px] text-slate-500 font-mono mt-1">{width}px x {height}px</span>
              
              <div className="absolute bottom-3 left-3 font-mono text-[9px] text-slate-600">
                Cursor: X: {mousePos.x} | Y: {mousePos.y}
              </div>
            </div>
          </div>
        </div>

        {/* Media Queries breakpoint checker */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-850 pb-2">Active CSS Media Breakpoint matching</span>
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold font-mono">
            {[
              { name: 'sm (Mobile)', range: '>= 640px', active: width >= 640 },
              { name: 'md (Tablet)', range: '>= 768px', active: width >= 768 },
              { name: 'lg (Desktop)', range: '>= 1024px', active: width >= 1024 },
              { name: 'xl (Widescreen)', range: '>= 1280px', active: width >= 1280 }
            ].map((bp, idx) => (
              <div key={idx} className={`p-3 border rounded-xl flex flex-col gap-1 transition-all ${
                bp.active 
                  ? 'bg-emerald-950/15 border-emerald-900/60 text-emerald-400' 
                  : 'bg-slate-950/40 border-slate-850 text-slate-600'
              }`}>
                <span>{bp.name}</span>
                <span className="text-[8px] font-normal text-slate-500">{bp.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Options and Specs sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Device select options */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-350 uppercase tracking-wider border-b border-slate-850 pb-3">Simulate Device</span>
          
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Device Presets</label>
              <select
                value={preset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-slate-350 p-2 text-xs rounded-xl focus:outline-none"
              >
                {DEVICE_PRESETS.map(d => (
                  <option key={d.name} value={d.name}>{d.name} ({d.width}x{d.height})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value) || 0)}
                  className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-xs font-mono text-slate-200 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value) || 0)}
                  className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-xs font-mono text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Viewport Zoom Scale</span>
                <span className="font-mono text-[#3C6B4D] font-bold">{scale}%</span>
              </div>
              <input
                type="range"
                min="25"
                max="150"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-[#3C6B4D]"
              />
            </div>
          </div>
        </div>

        {/* User-Agent selection */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-850 pb-2">User-Agent Profile</span>
          
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Browser Presets</label>
              <select
                value={selectedUaPreset}
                onChange={(e) => handleUaChange(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-slate-350 p-2 text-xs rounded-xl focus:outline-none"
              >
                {USER_AGENT_PRESETS.map(u => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            <textarea
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              rows={3}
              className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-[10px] font-mono text-slate-350 focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>
        </div>

        {/* Download speeds calculator */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-850 pb-2 flex items-center gap-1.5"><Download size={14} className="text-[#3C6B4D]" /> Network Download Estimator</span>
          
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">File Size (MB)</label>
              <input
                type="number"
                value={fileSizeMB}
                onChange={(e) => setFileSizeMB(Number(e.target.value) || 1)}
                className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Network Profile Speed</label>
              <select
                value={networkProfile}
                onChange={(e) => setNetworkProfile(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-slate-350 p-2 text-xs rounded-xl focus:outline-none"
              >
                {NETWORK_PROFILES.map(n => (
                  <option key={n.name} value={n.name}>{n.name} ({n.speedKbps >= 1000 ? `${n.speedKbps/1000}Mbps` : `${n.speedKbps}Kbps`})</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-950 border border-slate-850/85 p-3 rounded-xl flex items-start gap-2">
              <HelpCircle size={14} className="text-[#3C6B4D] shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-350 leading-relaxed font-semibold">
                Est. download time: <span className="font-bold text-slate-200">{downloadTimeSec.toFixed(2)}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specs Report copy */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-800 pb-2">Specs Report</span>
          <button
            onClick={handleCopyReport}
            className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 text-xs font-semibold"
          >
            <ClipboardList size={14} />
            <span>{copied ? 'Copied Specs Report!' : 'Copy Device Specs'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
