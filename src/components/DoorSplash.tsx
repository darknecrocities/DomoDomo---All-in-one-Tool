import { useState, useEffect } from 'react';
import { Logo } from './Logo';

export const DoorSplash = () => {
  const [stage, setStage] = useState<'visible' | 'logo-fade' | 'door-open' | 'gone'>('visible');

  useEffect(() => {
    // Check if splash has already been shown in this browser session
    const hasShown = sessionStorage.getItem('domodomo_splash_shown');
    if (hasShown === 'true') {
      setStage('gone');
      return;
    }

    // Timeline configuration
    // Stage 1: Logo fades out
    const logoFadeTimer = setTimeout(() => {
      setStage('logo-fade');
    }, 1300);

    // Stage 2: Doors begin to open
    const doorOpenTimer = setTimeout(() => {
      setStage('door-open');
    }, 1700);

    // Stage 3: Splash is fully removed from DOM
    const completeTimer = setTimeout(() => {
      setStage('gone');
      sessionStorage.setItem('domodomo_splash_shown', 'true');
    }, 2800);

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
        className="absolute top-0 left-0 w-1/2 h-full bg-[#18191B] border-r border-[#2A2D30] transition-transform pointer-events-auto flex items-center justify-end"
        style={{
          transform: areDoorsOpen ? 'translateX(-100%)' : 'translateX(0)',
          transitionDuration: '1100ms',
          transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)',
        }}
      >
        {/* Subtle inner industrial door panels */}
        <div className="w-full h-full p-8 flex flex-col justify-between opacity-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d30_1px,transparent_1px),linear-gradient(to_bottom,#2a2d30_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        </div>
      </div>

      {/* Right Door */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-[#18191B] border-l border-[#2A2D30] transition-transform pointer-events-auto flex items-center justify-start"
        style={{
          transform: areDoorsOpen ? 'translateX(100%)' : 'translateX(0)',
          transitionDuration: '1100ms',
          transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)',
        }}
      >
        {/* Subtle inner industrial door panels */}
        <div className="w-full h-full p-8 flex flex-col justify-between opacity-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d30_1px,transparent_1px),linear-gradient(to_bottom,#2a2d30_1px,transparent_1px)] bg-[size:3rem_3rem]" />
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
        <div className="relative flex flex-col items-center gap-6 p-10 rounded-3xl bg-[#111213]/90 border border-[#2A2D30] shadow-2xl backdrop-blur-md">
          {/* Logo container with pulse ring */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-4 rounded-3xl bg-[#3C6B4D]/10 border border-[#3C6B4D]/25 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
            <Logo size={140} showText={false} className="relative z-10 scale-105" />
          </div>

          <div className="flex flex-col items-center gap-2 mt-2">
            <span className="font-extrabold text-3xl tracking-tight leading-none bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent font-heading">
              Domo<span className="text-[#ECEBE9] font-normal">Domo</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#72706C] font-bold">
              Local Workshop
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3C6B4D] animate-pulse"></span>
            <span className="text-[10px] font-mono text-[#72706C] uppercase font-semibold tracking-wider">
              Unlocking Sandbox...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
