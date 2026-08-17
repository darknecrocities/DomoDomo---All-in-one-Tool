import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Check,
  Target,
  RotateCcw,
  VolumeX,
  Gauge,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import {
  SWITCH_COORDINATES,
  findClosestSwitch,
  playCoordinateSound,
  previewSoundProfile,
  getAudioAnalyser,
  type SwitchCoordinate,
  type SoundProfile,
} from '../utils/soundEffects';
import {
  getExperienceSettings,
  saveExperienceSettings,
  type ExperienceSettings,
} from '../utils/experienceSettings';

interface AcousticMatrixPadProps {
  onSelectSwitch?: (profile: SoundProfile) => void;
  activeProfile?: SoundProfile;
}

const CATEGORIES = ['All', 'Linear', 'Tactile', 'Clicky', 'Silent', 'Vintage / Hall Effect', 'Special'];

export const AcousticMatrixPad: React.FC<AcousticMatrixPadProps> = ({ onSelectSwitch, activeProfile }) => {
  const [settings, setSettings] = useState<ExperienceSettings>(getExperienceSettings());

  // Initialize coords from saved matrixCoords if available, otherwise match current switch profile
  const initialSwitch = SWITCH_COORDINATES.find((s) => s.id === (activeProfile || settings.profile)) || SWITCH_COORDINATES[0];
  const [coords, setCoords] = useState<{ x: number; y: number }>(() => {
    return settings.matrixCoords ? { ...settings.matrixCoords } : { x: initialSwitch.x, y: initialSwitch.y };
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hoveredSwitch, setHoveredSwitch] = useState<SwitchCoordinate | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const padRef = useRef<HTMLDivElement | null>(null);
  const lastSoundTimeRef = useRef(0);

  // Real-time VU Meter Peak Level State
  const [peakLevel, setPeakLevel] = useState<number>(0);

  // Listen to external settings changes
  useEffect(() => {
    const handleUpdate = (e: CustomEvent<ExperienceSettings>) => {
      const updated = e.detail || getExperienceSettings();
      setSettings(updated);
      if (updated.matrixCoords && !isDragging) {
        setCoords({ ...updated.matrixCoords });
      }
    };
    window.addEventListener('domodomo_sfx_update' as any, handleUpdate as any);
    return () => {
      window.removeEventListener('domodomo_sfx_update' as any, handleUpdate as any);
    };
  }, [isDragging]);

  // Real-time Audio Level & VU Meter Animation Frame
  useEffect(() => {
    let animId: number;
    const analyser = getAudioAnalyser();

    const checkLevel = () => {
      animId = requestAnimationFrame(checkLevel);
      if (!analyser) {
        setPeakLevel(0);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      let maxVal = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i];
        if (v > maxVal) maxVal = v;
      }

      const normalizedPeak = Math.min(100, Math.round((maxVal / 255) * 100));
      setPeakLevel((prev) => Math.max(normalizedPeak, Math.round(prev * 0.92)));
    };

    animId = requestAnimationFrame(checkLevel);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const nearestSwitch = findClosestSwitch(coords.x, coords.y);

  const notifySaved = useCallback(() => {
    setJustSaved(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setJustSaved(false);
    }, 1800);
  }, []);

  const [padTilt, setPadTilt] = useState<{ rotateX: number; rotateY: number }>({ rotateX: 0, rotateY: 0 });

  const handlePointerUpdate = useCallback(
    (clientX: number, clientY: number, persist = false) => {
      if (!padRef.current) return;
      const rect = padRef.current.getBoundingClientRect();
      const xPx = clientX - rect.left;
      const yPx = clientY - rect.top;

      const rawX = (xPx / rect.width) * 100;
      const rawY = 100 - (yPx / rect.height) * 100;

      const clampedX = Math.max(0, Math.min(100, Math.round(rawX)));
      const clampedY = Math.max(0, Math.min(100, Math.round(rawY)));

      setCoords({ x: clampedX, y: clampedY });

      // Spatial 3D Parallax Tilt calculation (-6deg to +6deg)
      const tiltY = ((rawX - 50) / 50) * 5;
      const tiltX = -((rawY - 50) / 50) * 5;
      setPadTilt({ rotateX: Math.round(tiltX * 10) / 10, rotateY: Math.round(tiltY * 10) / 10 });

      // Audition sound on continuous drag or touch
      const now = performance.now();
      if (now - lastSoundTimeRef.current > 65) {
        lastSoundTimeRef.current = now;
        playCoordinateSound(clampedX, clampedY, false);
      }

      // Auto-save and persist custom matrix coordinates to localStorage
      if (persist) {
        const closest = findClosestSwitch(clampedX, clampedY);
        saveExperienceSettings({
          matrixCoords: { x: clampedX, y: clampedY },
          customMatrixEnabled: true,
          profile: closest.id,
        });
        notifySaved();
      }
    },
    [notifySaved]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    handlePointerUpdate(e.clientX, e.clientY, false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!padRef.current) return;
    if (isDragging) {
      handlePointerUpdate(e.clientX, e.clientY, false);
    } else {
      const rect = padRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 100;
      const rawY = 100 - ((e.clientY - rect.top) / rect.height) * 100;
      const tiltY = ((rawX - 50) / 50) * 4;
      const tiltX = -((rawY - 50) / 50) * 4;
      setPadTilt({ rotateX: Math.round(tiltX * 10) / 10, rotateY: Math.round(tiltY * 10) / 10 });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    handlePointerUpdate(e.clientX, e.clientY, true);
  };

  const handlePadLeave = () => {
    if (!isDragging) {
      setPadTilt({ rotateX: 0, rotateY: 0 });
    }
  };

  const applySwitch = (sw: SwitchCoordinate) => {
    setCoords({ x: sw.x, y: sw.y });
    previewSoundProfile(sw.id);
    saveExperienceSettings({
      profile: sw.id,
      matrixCoords: { x: sw.x, y: sw.y },
      customMatrixEnabled: false,
    });
    notifySaved();
    if (onSelectSwitch) {
      onSelectSwitch(sw.id);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    const val = Math.max(0, Math.min(1, newVol));
    saveExperienceSettings({ volume: val });
  };

  const handleGainBoostChange = (newBoost: number) => {
    saveExperienceSettings({ gainBoost: newBoost });
    playCoordinateSound(coords.x, coords.y, true);
    notifySaved();
  };

  const filteredSwitches = SWITCH_COORDINATES.filter(
    (s) => selectedCategory === 'All' || s.category === selectedCategory
  );

  // Approximate metrics calculation from coords
  const toneLabel = coords.x < 30 ? 'Deep Thock' : coords.x < 70 ? 'Creamy Pop' : 'Crisp Clack';
  const densityLabel = coords.y < 30 ? 'Ultra Light' : coords.y < 70 ? 'Medium Solid' : 'Thick Heavy';
  const estimatedForce = Math.round(35 + (coords.y / 100) * 45); // 35g to 80g
  const estimatedPitchHz = Math.round(120 + Math.pow(coords.x / 100, 1.8) * 2000);

  // Spatial Stereo Pan Value (-100 to +100)
  const spatialPanPercent = Math.round((coords.x - 50) * 2);
  const spatialPanLabel =
    spatialPanPercent < -8
      ? `◀ Left ${Math.abs(spatialPanPercent)}%`
      : spatialPanPercent > 8
      ? `Right ${spatialPanPercent}% ▶`
      : `● Center (0%)`;

  // VU Meter segment count (18 total: 10 green, 5 yellow, 3 red)
  const totalBars = 18;
  const activeBars = Math.round((peakLevel / 100) * totalBars);

  return (
    <div className="flex flex-col space-y-4">
      {/* Category Filter Chips & Persistence Status */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#3C6B4D] text-white shadow-md shadow-[#3C6B4D]/30 border border-[#3C6B4D]'
                  : 'bg-[#18191B] text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D]/40 border border-[#2A2D30]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Live Auto-Saved Indicator */}
          {justSaved && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#6EC48E] bg-[#3C6B4D]/20 px-3 py-0.5 rounded-full border border-[#3C6B4D]/40 animate-in fade-in zoom-in-95 duration-150 shadow-[0_0_12px_rgba(60,107,77,0.3)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6EC48E]" />
              <span>Location Saved & Active</span>
            </span>
          )}

          <button
            onClick={() => {
              const def = SWITCH_COORDINATES.find((s) => s.id === 'oil_king') || SWITCH_COORDINATES[0];
              applySwitch(def);
            }}
            className="text-[10px] text-[#A3A09B] hover:text-[#ECEBE9] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Grid</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 2D ACOUSTIC MATRIX PAD WITH 3D SPATIAL PARALLAX & GLOW */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl border border-[#2A2D30] bg-[#111213] p-4 sm:p-6 overflow-hidden shadow-2xl select-none transition-transform duration-300 ease-out"
        style={{
          perspective: '1000px',
          transform: `perspective(1000px) rotateX(${padTilt.rotateX}deg) rotateY(${padTilt.rotateY}deg)`,
        }}
      >
        {/* Dotted Grid Wallpaper Background with Ambient Vignette */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(255, 255, 255, 0.25) 1.2px, transparent 1.2px),
              radial-gradient(circle, rgba(60, 107, 77, 0.45) 1.8px, transparent 1.8px)
            `,
            backgroundSize: '20px 20px, 40px 40px',
            backgroundPosition: '0 0, 10px 10px',
          }}
        />

        {/* Ambient Radial Center Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(60,107,77,0.18)_0%,transparent_70%)]" />

        {/* Quadrant Axis Lines */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#2A2D30] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-[#2A2D30] to-transparent pointer-events-none" />

        {/* Quadrant Watermark Labels */}
        <div className="absolute top-3 left-4 text-[9px] font-mono font-bold tracking-widest text-white/40 uppercase pointer-events-none">
          Deep Thock • Thick Heavy (80g)
        </div>
        <div className="absolute top-3 right-4 text-[9px] font-mono font-bold tracking-widest text-white/40 uppercase pointer-events-none text-right">
          Crisp Clack • High Force
        </div>
        <div className="absolute bottom-3 left-4 text-[9px] font-mono font-bold tracking-widest text-white/40 uppercase pointer-events-none">
          Muted Stealth • Soft Cushion (35g)
        </div>
        <div className="absolute bottom-3 right-4 text-[9px] font-mono font-bold tracking-widest text-white/40 uppercase pointer-events-none text-right">
          Rapid Chime • Ultra Light
        </div>

        {/* Axis Labels */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-mono font-black uppercase tracking-[0.25em] text-[#72706C] pointer-events-none origin-center hidden sm:block">
          Density & Weight (Y)
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono font-black uppercase tracking-[0.25em] text-[#72706C] pointer-events-none hidden sm:block">
          Pitch & Tone Spectrum (X)
        </div>

        {/* Interactive Surface Plane */}
        <div
          ref={padRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePadLeave}
          className="relative w-full h-[280px] sm:h-[340px] cursor-crosshair touch-none"
        >
          {/* Laser Crosshairs Tracking Active Puck */}
          <div
            className="absolute inset-y-0 w-[1px] bg-gradient-to-b from-transparent via-[#6EC48E]/70 to-transparent pointer-events-none transition-all duration-75 shadow-[0_0_8px_#3C6B4D]"
            style={{ left: `${coords.x}%` }}
          />
          <div
            className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#6EC48E]/70 to-transparent pointer-events-none transition-all duration-75 shadow-[0_0_8px_#3C6B4D]"
            style={{ top: `${100 - coords.y}%` }}
          />

          {/* 40 Plotted Switch Pins with Unified Premium White Glow */}
          {filteredSwitches.map((sw) => {
            const isCurrent = (activeProfile || settings.profile) === sw.id;
            const isNearest = nearestSwitch.id === sw.id;
            
            // Calculate Euclidean distance to puck for proximity lighting
            const dx = sw.x - coords.x;
            const dy = sw.y - coords.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const isClose = dist < 14;

            return (
              <div
                key={sw.id}
                onClick={(e) => {
                  e.stopPropagation();
                  applySwitch(sw);
                }}
                onMouseEnter={() => setHoveredSwitch(sw)}
                onMouseLeave={() => setHoveredSwitch(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                style={{
                  left: `${sw.x}%`,
                  top: `${100 - sw.y}%`,
                }}
              >
                {/* Unified Luminous Node Dot */}
                <div
                  className={`relative rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCurrent
                      ? 'w-4 h-4 sm:w-5 sm:h-5 bg-[#3C6B4D] ring-4 ring-white/40 shadow-[0_0_18px_#ffffff,0_0_30px_#3C6B4D]'
                      : isNearest || isClose
                      ? 'w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white ring-2 ring-[#3C6B4D]/80 shadow-[0_0_14px_#ffffff,0_0_24px_rgba(60,107,77,0.7)] scale-110'
                      : 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white/80 border border-white/60 hover:bg-white hover:scale-125 shadow-[0_0_8px_rgba(255,255,255,0.7),0_0_16px_rgba(60,107,77,0.35)]'
                  }`}
                >
                  {isCurrent ? (
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-white/90" />
                  )}
                </div>

                {/* Subtle Mini Label on Node */}
                <span
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 rounded-md text-[8px] font-mono font-bold whitespace-nowrap pointer-events-none transition-all duration-150 backdrop-blur-md ${
                    isCurrent || isNearest
                      ? 'opacity-100 bg-[#18191B]/95 border border-[#3C6B4D]/60 text-[#ECEBE9] shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-20 scale-105'
                      : 'opacity-0 group-hover:opacity-100 bg-[#18191B]/90 text-[#ECEBE9] border border-[#2A2D30] z-20'
                  }`}
                >
                  {sw.name.replace('Gateron ', '').replace('Cherry MX ', 'MX ')}
                </span>
              </div>
            );
          })}

          {/* Active Draggable 3D Spatial Crosshair Puck */}
          <div
            className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none transition-transform duration-75 ${
              isDragging ? 'scale-125' : 'scale-100'
            }`}
            style={{
              left: `${coords.x}%`,
              top: `${100 - coords.y}%`,
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing spatial radar wave rings */}
              <div className="absolute w-12 h-12 rounded-full border border-white/40 animate-ping opacity-60" />
              <div className="absolute w-8 h-8 rounded-full border-2 border-[#6EC48E] animate-pulse opacity-80" />
              
              {/* Center Holographic Target Puck */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#3C6B4D] to-[#56976d] border-2 border-white text-white flex items-center justify-center shadow-[0_0_24px_#ffffff,0_0_30px_#3C6B4D]">
                <Target className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* REAL-TIME AUDIO VOLUME METER & GAIN BOOSTER BAR */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="p-4 rounded-2xl bg-[#18191B] border border-[#2A2D30] space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#3C6B4D]" />
            <h4 className="text-xs font-bold text-[#ECEBE9]">Real-Time Audio Output Level (VU Meter)</h4>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono">
            {settings.volume === 0 ? (
              <span className="text-red-400 font-bold flex items-center gap-1">
                <VolumeX className="w-3 h-3" /> Muted
              </span>
            ) : peakLevel < 15 ? (
              <span className="text-amber-400 font-semibold">
                ⚠️ Low Level (Weak) — Increase Booster Below
              </span>
            ) : (
              <span className="text-[#6EC48E] font-semibold flex items-center gap-1">
                <Check className="w-3 h-3 text-[#3C6B4D]" /> Optimal Resonance ({peakLevel}%)
              </span>
            )}
          </div>
        </div>

        {/* 18-Segment High-Precision Stereo LED VU Meter */}
        <div className="flex items-center gap-1 p-2 rounded-xl bg-[#111213] border border-[#2A2D30]">
          {Array.from({ length: totalBars }).map((_, i) => {
            const isLit = i < activeBars;
            // First 10 bars: Green, Next 5 bars: Yellow/Amber, Last 3 bars: Red
            let color = '#3C6B4D';
            let glow = 'rgba(60, 107, 77, 0.8)';
            if (i >= 15) {
              color = '#EF4444';
              glow = 'rgba(239, 68, 68, 0.8)';
            } else if (i >= 10) {
              color = '#F59E0B';
              glow = 'rgba(245, 158, 11, 0.8)';
            }

            return (
              <div
                key={i}
                className="flex-1 h-3 rounded-sm transition-all duration-75"
                style={{
                  backgroundColor: isLit ? color : 'rgba(255, 255, 255, 0.05)',
                  boxShadow: isLit ? `0 0 6px ${glow}` : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Volume & Audio Gain Multiplier Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Master Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#ECEBE9] flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#3C6B4D]" />
                Master Volume Level
              </span>
              <span className="font-mono text-[11px] text-[#A3A09B]">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#111213] rounded-lg appearance-none cursor-pointer accent-[#3C6B4D] border border-[#2A2D30]"
            />
          </div>

          {/* Audio Output Booster Multiplier */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#ECEBE9] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Audio Gain Booster (If Weak)
              </span>
              <span className="font-mono text-[11px] text-amber-400 font-bold">
                {settings.gainBoost || 1.25}x Boost
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { label: '1.0x (Normal)', val: 1.0 },
                { label: '1.25x (Crisp)', val: 1.25 },
                { label: '1.5x (Loud)', val: 1.5 },
                { label: '2.0x (Max)', val: 2.0 },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => handleGainBoostChange(btn.val)}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                    (settings.gainBoost || 1.25) === btn.val
                      ? 'bg-[#3C6B4D] text-white border-[#3C6B4D] shadow-sm'
                      : 'bg-[#111213] text-[#A3A09B] hover:text-[#ECEBE9] border-[#2A2D30]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* REAL-TIME TELEMETRY & 3D SPATIAL AUDIO HUD */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="p-4 rounded-2xl bg-[#18191B] border border-[#2A2D30] flex flex-col space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
            <div>
              <span className="text-[9px] font-mono font-bold text-[#72706C] uppercase block">Tone / Pitch (X)</span>
              <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1">
                <span className="text-[#3C6B4D] font-mono">{coords.x}%</span>
                <span>{toneLabel}</span>
              </span>
            </div>

            <div>
              <span className="text-[9px] font-mono font-bold text-[#72706C] uppercase block">Density / Weight (Y)</span>
              <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1">
                <span className="text-[#3C6B4D] font-mono">{coords.y}%</span>
                <span>{densityLabel}</span>
              </span>
            </div>

            <div>
              <span className="text-[9px] font-mono font-bold text-[#72706C] uppercase block">Actuation Force</span>
              <span className="text-xs font-bold text-[#ECEBE9] font-mono">
                ~{estimatedForce}g
              </span>
            </div>

            <div>
              <span className="text-[9px] font-mono font-bold text-[#72706C] uppercase block">Center Freq</span>
              <span className="text-xs font-bold text-[#ECEBE9] font-mono">
                {estimatedPitchHz} Hz
              </span>
            </div>
          </div>

          {/* Nearest Switch Match & Action */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2A2D30]">
            <div className="text-left sm:text-right">
              <span className="text-[9px] font-mono font-bold text-[#72706C] uppercase block">Closest Switch</span>
              <span className="text-xs font-black text-[#3C6B4D] flex items-center sm:justify-end gap-1">
                <Sparkles className="w-3 h-3 text-[#3C6B4D]" />
                {nearestSwitch.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => playCoordinateSound(coords.x, coords.y, true)}
                className="p-2 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 text-[#ECEBE9] hover:text-[#3C6B4D] transition-colors cursor-pointer"
                title="Audition synthesized acoustic tone at current (X, Y)"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => applySwitch(nearestSwitch)}
                className="px-3.5 py-2 rounded-xl bg-[#3C6B4D] hover:bg-[#477e5b] text-white text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-[#3C6B4D]/20 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Switch</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3D Spatial Stereo Soundstage Field HUD */}
        <div className="pt-2 border-t border-[#2A2D30]/60 flex items-center justify-between gap-4 text-[10px] font-mono">
          <span className="text-[#72706C] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#3C6B4D] animate-pulse" />
            3D Spatial Audio Pan
          </span>

          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <span className="text-[#72706C] font-bold">L</span>
            <div className="relative flex-1 h-1.5 bg-[#111213] rounded-full border border-[#2A2D30] overflow-hidden">
              {/* Center divider notch */}
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#2A2D30]" />
              {/* Spatial Balance Dot */}
              <div
                className="absolute top-0 bottom-0 w-2.5 rounded-full bg-gradient-to-r from-[#6EC48E] to-white shadow-[0_0_8px_#ffffff] -translate-x-1/2 transition-all duration-75"
                style={{ left: `${coords.x}%` }}
              />
            </div>
            <span className="text-[#72706C] font-bold">R</span>
          </div>

          <span className="font-bold text-[#6EC48E] shrink-0 text-right min-w-[95px]">
            {spatialPanLabel}
          </span>
        </div>
      </div>

      {/* Hovered Switch Detail Card (when user hovers any plotted node) */}
      {hoveredSwitch && (
        <div className="p-3 rounded-xl bg-[#141517] border border-[#3C6B4D]/40 text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3C6B4D]" />
            <div>
              <span className="font-extrabold text-[#ECEBE9]">{hoveredSwitch.name}</span>
              <span className="text-[10px] text-[#A3A09B] ml-2 font-mono">
                {hoveredSwitch.category} • {hoveredSwitch.tag} • {hoveredSwitch.speedGrams}g force • {hoveredSwitch.travelMm}mm travel
              </span>
            </div>
          </div>
          <button
            onClick={() => applySwitch(hoveredSwitch)}
            className="text-[10px] font-bold text-[#3C6B4D] hover:underline cursor-pointer"
          >
            Select
          </button>
        </div>
      )}
    </div>
  );
};
