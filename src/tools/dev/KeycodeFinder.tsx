import { useState, useEffect } from 'react';
import { Keyboard, Shield, History } from 'lucide-react';

interface KeyLog {
  key: string;
  code: string;
  keyCode: number;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  time: string;
}

export const KeycodeFinderTool = () => {
  const [activeKey, setActiveKey] = useState<KeyLog | null>({
    key: 'Press Any Key',
    code: 'KeyReady',
    keyCode: 0,
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
    time: '--:--:--'
  });
  const [history, setHistory] = useState<KeyLog[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser shortcuts (like Ctrl+P, F11, etc.) only if focused inside our tool area context
      // to allow normal development
      const target = {
        key: e.key === ' ' ? 'Space' : e.key,
        code: e.code,
        keyCode: e.keyCode,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
        time: new Date().toLocaleTimeString()
      };
      
      setActiveKey(target);
      setHistory(prev => [target, ...prev.slice(0, 9)]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 items-center justify-center min-h-[350px] relative overflow-hidden text-center">
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <Keyboard size={12} className="text-[#4E8E5E]" />
            <span>Interactive Key Detector</span>
          </div>

          <div className="flex flex-col gap-2.5 my-6">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Detected KeyCode</span>
            <div className="text-7xl font-extrabold text-teal-400 font-mono tracking-tight animate-pulse">
              {activeKey?.keyCode || '0'}
            </div>
            <span className="text-lg font-bold text-slate-200 mt-1 font-mono">{activeKey?.key}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-xl">
            {[
              { label: 'Event Code', value: activeKey?.code },
              { label: 'event.which', value: activeKey?.keyCode },
              { label: 'Time', value: activeKey?.time },
              {
                label: 'Modifiers',
                value: [
                  activeKey?.ctrl ? 'Ctrl' : '',
                  activeKey?.shift ? 'Shift' : '',
                  activeKey?.alt ? 'Alt' : '',
                  activeKey?.meta ? 'Cmd/Win' : ''
                ].filter(Boolean).join(' + ') || 'None'
              }
            ].map((spec, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{spec.label}</span>
                <span className="text-xs font-mono font-bold text-slate-350">{spec.value || '-'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <History size={14} className="text-[#4E8E5E]" />
            <span>Last 10 Presses</span>
          </h3>

          <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="text-xs text-slate-500 py-10 text-center font-mono">No keys detected yet...</div>
            ) : (
              history.map((log, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-850/60 p-2.5 rounded-lg flex items-center justify-between text-xs font-mono">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-500 font-bold">{log.code}</span>
                    <span className="text-slate-300 font-bold">{log.key}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-emerald-400 font-bold">Code: {log.keyCode}</span>
                    <span className="text-[9px] text-slate-500">{log.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-[#151C2C]/50 border border-slate-800 rounded-xl p-3 flex gap-2 text-slate-400 mt-2">
            <Shield size={16} className="text-[#4E8E5E] shrink-0 mt-0.5" />
            <span className="text-[9px] leading-relaxed">
              Detects keyboard event data fully client-side inside this browser window. Modifiers and system shortcuts do not leave local layout context.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
