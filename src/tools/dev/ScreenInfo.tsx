import { useState, useEffect } from 'react';
import { Monitor, RefreshCw, Smartphone, Network, Shield } from 'lucide-react';

export const ScreenInfoTool = () => {
  const [info, setInfo] = useState({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio,
    colorDepth: window.screen.colorDepth,
    orientation: window.screen.orientation?.type || 'unknown',
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown',
    downlink: (navigator as any).connection?.downlink || 'unknown',
    storageEstimate: 'calculating...'
  });

  const updateInfo = () => {
    setInfo(prev => ({
      ...prev,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      orientation: window.screen.orientation?.type || 'unknown'
    }));
  };

  useEffect(() => {
    window.addEventListener('resize', updateInfo);
    if (window.screen.orientation) {
      window.screen.orientation.addEventListener('change', updateInfo);
    }

    // Storage Quote estimate
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        const quotaMb = ((estimate.quota || 0) / (1024 * 1024)).toFixed(0);
        const usageMb = ((estimate.usage || 0) / (1024 * 1024)).toFixed(1);
        setInfo(prev => ({
          ...prev,
          storageEstimate: `${usageMb} MB used of ${quotaMb} MB allowed`
        }));
      });
    }

    return () => {
      window.removeEventListener('resize', updateInfo);
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', updateInfo);
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="text-teal-400 font-bold">Device Viewport Specs</h3>
            <button onClick={updateInfo} className="btn-secondary py-1 px-3 text-xs flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Viewport Dimensions', val: `${info.viewportWidth} x ${info.viewportHeight} px`, icon: Monitor },
              { label: 'Screen Hardware Bounds', val: `${info.screenWidth} x ${info.screenHeight} px`, icon: Smartphone },
              { label: 'Device Pixel Ratio', val: `${info.devicePixelRatio}x (DPR)`, icon: Monitor },
              { label: 'Screen Color Depth', val: `${info.colorDepth}-bit`, icon: Monitor },
              { label: 'Layout Orientation', val: info.orientation, icon: Monitor },
              { label: 'Network Connection Type', val: `${info.connectionType} (${info.downlink} Mbps estimated)`, icon: Network },
              { label: 'Local Timezone / Lang', val: `${info.timezone} (${info.language})`, icon: Shield },
              { label: 'Sandboxed Storage Quota', val: info.storageEstimate, icon: Shield }
            ].map((spec) => {
              const Icon = spec.icon;
              return (
                <div key={spec.label} className="bg-slate-900/40 border border-slate-850 p-4.5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-slate-950 border border-slate-850 text-teal-400 rounded-xl">
                    <Icon size={18} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{spec.label}</span>
                    <span className="text-sm font-semibold font-mono text-slate-200">{spec.val}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">User Agent</h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-[10px] text-[#A3A09B] leading-relaxed break-all select-all">
            {info.userAgent}
          </div>
        </div>
      </div>
    </div>
  );
};
