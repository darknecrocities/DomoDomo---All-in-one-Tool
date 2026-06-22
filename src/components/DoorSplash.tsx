import { useState, useEffect } from 'react';
import { Logo } from './Logo';

export const DoorSplash = () => {
  const [stage, setStage] = useState<'visible' | 'logo-fade' | 'door-open' | 'gone'>('visible');

  useEffect(() => {
    // Timeline configuration
    // Stage 1: Logo fades out
    const logoFadeTimer = setTimeout(() => {
      setStage('logo-fade');
    }, 1500);

    // Stage 2: Doors begin to open
    const doorOpenTimer = setTimeout(() => {
      setStage('door-open');
    }, 1900);

    // Stage 3: Splash is fully removed from DOM
    const completeTimer = setTimeout(() => {
      setStage('gone');
    }, 3100);

    return () => {
      clearTimeout(logoFadeTimer);
      clearTimeout(doorOpenTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  if (stage === 'gone') return null;

  const isLogoVisible = stage === 'visible';
  const areDoorsOpen = stage === 'door-open';

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden select-none pointer-events-none">
      {/* Left Door */}
      <div
        className="absolute top-0 left-0 w-1/2 h-full border-r-2 transition-transform pointer-events-auto flex items-center justify-end"
        style={{
          transform: areDoorsOpen ? 'translateX(-100%)' : 'translateX(0)',
          transitionDuration: '1200ms',
          transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)',
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Door Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03]" />

        {/* Structural Panel */}
        <div 
          className="w-[calc(100%-3rem)] h-[calc(100%-4rem)] border rounded-2xl m-6 mr-3 p-8 flex flex-col justify-between relative overflow-hidden shadow-inner bg-transparent"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Rivets at corners */}
          <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
          <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }} />

          {/* Diagonal structural bracing lines (micro opacity) */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,var(--border)_50%,transparent_51%)] bg-[size:100%_100%] opacity-20 pointer-events-none" />

          {/* Top Label */}
          <div className="flex flex-col gap-1 text-left z-10">
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold" style={{ color: 'var(--text)' }}>Workshop Bay</span>
            <span className="text-xs font-mono font-bold" style={{ color: 'var(--primary)' }}>UNIT: 01 // CORE_MODULE</span>
          </div>

          {/* Bottom Decals / Warning */}
          <div className="flex flex-col gap-2 text-left z-10">
            <div className="h-[1px] w-24" style={{ backgroundColor: 'var(--border)' }} />
            <span className="text-[8px] font-mono leading-normal max-w-xs uppercase" style={{ color: 'var(--text-secondary)' }}>
              Notice: Sandbox execution environment active. No files cross the localhost threshold.
            </span>
          </div>
        </div>

        {/* Meeting Edge Lock Blocks (simulates locking bolts sliding in) */}
        <div className="absolute right-0 top-1/4 -translate-y-1/2 flex flex-col gap-16 z-20">
          <div className="w-4 h-12 border-y border-l rounded-l-md shadow-lg" style={{ backgroundColor: 'var(--surface-dim)', borderColor: 'var(--border)' }} />
          <div className="w-4 h-12 border-y border-l rounded-l-md shadow-lg" style={{ backgroundColor: 'var(--surface-dim)', borderColor: 'var(--border)' }} />
          <div className="w-4 h-12 border-y border-l rounded-l-md shadow-lg" style={{ backgroundColor: 'var(--surface-dim)', borderColor: 'var(--border)' }} />
        </div>
      </div>

      {/* Right Door */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full border-l-2 transition-transform pointer-events-auto flex items-center justify-start"
        style={{
          transform: areDoorsOpen ? 'translateX(100%)' : 'translateX(0)',
          transitionDuration: '1200ms',
          transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)',
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Door Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03]" />

        {/* Structural Panel */}
        <div 
          className="w-[calc(100%-3rem)] h-[calc(100%-4rem)] border rounded-2xl m-6 ml-3 p-8 flex flex-col justify-between relative overflow-hidden shadow-inner bg-transparent"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Rivets at corners */}
          <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
          <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }} />

          {/* Diagonal structural bracing lines (micro opacity) */}
          <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_49%,var(--border)_50%,transparent_51%)] bg-[size:100%_100%] opacity-20 pointer-events-none" />

          {/* Top Status */}
          <div className="flex flex-col gap-1 items-end text-right z-10">
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold" style={{ color: 'var(--text)' }}>Security State</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }} />
              <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text)' }}>LOCAL_SANDBOX_SECURE</span>
            </div>
          </div>

          {/* Bottom Decals / Specifications */}
          <div className="flex flex-col gap-2 items-end text-right z-10">
            <div className="h-[1px] w-24" style={{ backgroundColor: 'var(--border)' }} />
            <span className="text-[8px] font-mono leading-normal uppercase" style={{ color: 'var(--text-secondary)' }}>
              Engine Status: WASM_WEB_GPU_ENABLED
            </span>
          </div>
        </div>

        {/* Meeting Edge Lock Blocks (matching locking receivers) */}
        <div className="absolute left-0 top-1/4 -translate-y-1/2 flex flex-col gap-16 z-20">
          <div className="w-4 h-12 border-y border-r rounded-r-md shadow-lg" style={{ backgroundColor: 'var(--surface-dim)', borderColor: 'var(--border)' }} />
          <div className="w-4 h-12 border-y border-r rounded-r-md shadow-lg" style={{ backgroundColor: 'var(--surface-dim)', borderColor: 'var(--border)' }} />
          <div className="w-4 h-12 border-y border-r rounded-r-md shadow-lg" style={{ backgroundColor: 'var(--surface-dim)', borderColor: 'var(--border)' }} />
        </div>
      </div>

      {/* Center Mascot Emblem */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all"
        style={{
          opacity: isLogoVisible ? 1 : 0,
          transform: isLogoVisible ? 'scale(1)' : 'scale(0.92)',
          transitionDuration: '400ms',
          transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        <div 
          className="relative flex flex-col items-center gap-6 p-10 rounded-3xl border shadow-2xl backdrop-blur-md"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Logo container with pulse ring */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-4 rounded-3xl animate-ping opacity-60" style={{ animationDuration: '3s', backgroundColor: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid rgba(var(--primary-rgb), 0.15)' }} />
            <Logo size={140} showText={false} className="relative z-10 scale-105" />
          </div>

          <div className="flex flex-col items-center gap-2 mt-2">
            <span className="font-extrabold text-3xl tracking-tight leading-none font-heading" style={{ color: 'var(--text)' }}>
              Domo<span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Domo</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--text-tertiary)' }}>
              All-in-One Tool Hub
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }}></span>
            <span className="text-[10px] font-mono uppercase font-semibold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Unlocking Sandbox...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
