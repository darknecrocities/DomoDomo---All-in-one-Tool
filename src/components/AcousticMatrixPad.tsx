import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Check,
  Target,
  RotateCcw,
} from 'lucide-react';
import {
  SWITCH_COORDINATES,
  findClosestSwitch,
  playCoordinateSound,
  previewSoundProfile,
  type SwitchCoordinate,
  type SoundProfile,
} from '../utils/soundEffects';
import {
  getExperienceSettings,
  saveExperienceSettings,
} from '../utils/experienceSettings';

interface AcousticMatrixPadProps {
  onSelectSwitch?: (profile: SoundProfile) => void;
  activeProfile?: SoundProfile;
}

const CATEGORY_COLORS: Record<string, { dot: string; glow: string; text: string; bg: string }> = {
  Linear: { dot: '#3C6B4D', glow: 'rgba(60, 107, 77, 0.6)', text: '#6EC48E', bg: 'rgba(60, 107, 77, 0.15)' },
  Tactile: { dot: '#E29E2D', glow: 'rgba(226, 158, 45, 0.6)', text: '#F59E0B', bg: 'rgba(226, 158, 45, 0.15)' },
  Clicky: { dot: '#38BDF8', glow: 'rgba(56, 189, 248, 0.6)', text: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' },
  Silent: { dot: '#A855F7', glow: 'rgba(168, 85, 247, 0.6)', text: '#C084FC', bg: 'rgba(168, 85, 247, 0.15)' },
  'Vintage / Hall Effect': { dot: '#F43F5E', glow: 'rgba(244, 63, 94, 0.6)', text: '#FB7185', bg: 'rgba(244, 63, 94, 0.15)' },
  Special: { dot: '#06B6D4', glow: 'rgba(6, 182, 212, 0.6)', text: '#22D3EE', bg: 'rgba(6, 182, 212, 0.15)' },
};

const CATEGORIES = ['All', 'Linear', 'Tactile', 'Clicky', 'Silent', 'Vintage / Hall Effect', 'Special'];

export const AcousticMatrixPad: React.FC<AcousticMatrixPadProps> = ({ onSelectSwitch, activeProfile }) => {
  const settings = getExperienceSettings();
  const currentSwitch = SWITCH_COORDINATES.find((s) => s.id === (activeProfile || settings.profile)) || SWITCH_COORDINATES[0];

  const [coords, setCoords] = useState<{ x: number; y: number }>({
    x: currentSwitch.x,
    y: currentSwitch.y,
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hoveredSwitch, setHoveredSwitch] = useState<SwitchCoordinate | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const padRef = useRef<HTMLDivElement | null>(null);
  const lastSoundTimeRef = useRef(0);

  // Sync coords if activeProfile changes externally
  useEffect(() => {
    const sw = SWITCH_COORDINATES.find((s) => s.id === (activeProfile || settings.profile));
    if (sw) {
      setCoords({ x: sw.x, y: sw.y });
    }
  }, [activeProfile, settings.profile]);

  const nearestSwitch = findClosestSwitch(coords.x, coords.y);

  const handlePointerUpdate = useCallback(
    (clientX: number, clientY: number, isFinal = false) => {
      const pad = padRef.current;
      if (!pad) return;

      const rect = pad.getBoundingClientRect();
      const rawX = ((clientX - rect.left) / rect.width) * 100;
      // Invert Y so that top is 100 (Thick / Heavy) and bottom is 0 (Light / Soft)
      const rawY = (1 - (clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(0, Math.min(100, Math.round(rawX)));
      const clampedY = Math.max(0, Math.min(100, Math.round(rawY)));

      setCoords({ x: clampedX, y: clampedY });

      const now = performance.now();
      if (now - lastSoundTimeRef.current > 40 || isFinal) {
        lastSoundTimeRef.current = now;
        playCoordinateSound(clampedX, clampedY, isFinal);
      }
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    handlePointerUpdate(e.clientX, e.clientY, false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handlePointerUpdate(e.clientX, e.clientY, false);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    handlePointerUpdate(e.clientX, e.clientY, true);
  };

  const applySwitch = (sw: SwitchCoordinate) => {
    setCoords({ x: sw.x, y: sw.y });
    previewSoundProfile(sw.id);
    saveExperienceSettings({ profile: sw.id });
    if (onSelectSwitch) {
      onSelectSwitch(sw.id);
    }
  };

  const filteredSwitches = SWITCH_COORDINATES.filter(
    (s) => selectedCategory === 'All' || s.category === selectedCategory
  );

  // Approximate metrics calculation from coords
  const toneLabel = coords.x < 30 ? 'Deep Thock' : coords.x < 70 ? 'Creamy Pop' : 'Crisp Clack';
  const densityLabel = coords.y < 30 ? 'Ultra Light' : coords.y < 70 ? 'Medium Solid' : 'Thick Heavy';
  const estimatedForce = Math.round(35 + (coords.y / 100) * 45); // 35g to 80g
  const estimatedPitchHz = Math.round(120 + Math.pow(coords.x / 100, 1.8) * 2000);

  return (
    <div className="flex flex-col space-y-4">
      {/* Category Filter Chips */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#3C6B4D] text-white shadow-sm'
                  : 'bg-[#18191B] text-[#A3A09B] hover:text-[#ECEBE9] border border-[#2A2D30]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            const def = SWITCH_COORDINATES.find((s) => s.id === 'oil_king') || SWITCH_COORDINATES[0];
            applySwitch(def);
          }}
          className="text-[10px] text-[#A3A09B] hover:text-[#ECEBE9] flex items-center gap-1 transition-colors ml-auto"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Grid</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 2D ACOUSTIC MATRIX PAD WITH DOT-DOT WALLS BACKGROUND */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl border border-[#2A2D30] bg-[#111213] p-4 sm:p-6 overflow-hidden shadow-2xl select-none">
        {/* Dotted Grid Wallpaper Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-65"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(60, 107, 77, 0.4) 1.5px, transparent 1.5px),
              radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px, 12px 12px',
            backgroundPosition: '0 0, 6px 6px',
          }}
        />

        {/* Quadrant Axis Lines */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#2A2D30]/80 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-[#2A2D30]/80 pointer-events-none" />

        {/* Quadrant Watermark Labels */}
        <div className="absolute top-3 left-4 text-[9px] font-mono font-bold tracking-widest text-[#3C6B4D]/60 uppercase pointer-events-none">
          Deep Thock • Thick Heavy (80g)
        </div>
        <div className="absolute top-3 right-4 text-[9px] font-mono font-bold tracking-widest text-[#38BDF8]/60 uppercase pointer-events-none text-right">
          Crisp Clack • High Force
        </div>
        <div className="absolute bottom-3 left-4 text-[9px] font-mono font-bold tracking-widest text-[#A855F7]/60 uppercase pointer-events-none">
          Muted Stealth • Soft Cushion (35g)
        </div>
        <div className="absolute bottom-3 right-4 text-[9px] font-mono font-bold tracking-widest text-[#06B6D4]/60 uppercase pointer-events-none text-right">
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
          className="relative w-full h-[280px] sm:h-[340px] cursor-crosshair touch-none"
        >
          {/* Laser Crosshairs Tracking Active Puck */}
          <div
            className="absolute inset-y-0 w-[1px] bg-[#3C6B4D]/40 pointer-events-none transition-all duration-75"
            style={{ left: `${coords.x}%` }}
          />
          <div
            className="absolute inset-x-0 h-[1px] bg-[#3C6B4D]/40 pointer-events-none transition-all duration-75"
            style={{ top: `${100 - coords.y}%` }}
          />

          {/* 40 Plotted Switch Pins */}
          {filteredSwitches.map((sw) => {
            const isCurrent = (activeProfile || settings.profile) === sw.id;
            const isNearest = nearestSwitch.id === sw.id;
            const color = CATEGORY_COLORS[sw.category] || CATEGORY_COLORS.Linear;

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
                {/* Node Dot */}
                <div
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isCurrent
                      ? 'scale-125 ring-4 ring-[#3C6B4D]/60 shadow-[0_0_15px_#3C6B4D]'
                      : isNearest
                      ? 'scale-110 ring-2 ring-white/50'
                      : 'hover:scale-125'
                  }`}
                  style={{
                    backgroundColor: isCurrent ? '#3C6B4D' : color.dot,
                    boxShadow: isCurrent ? '0 0 12px #3C6B4D' : `0 0 6px ${color.glow}`,
                  }}
                >
                  {isCurrent && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                </div>

                {/* Subtle Mini Label on Node */}
                <span
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold whitespace-nowrap pointer-events-none transition-opacity duration-150 ${
                    isCurrent || isNearest
                      ? 'opacity-100 bg-[#18191B] border border-[#2A2D30] text-[#ECEBE9] shadow-md z-20'
                      : 'opacity-0 group-hover:opacity-100 bg-[#18191B]/95 text-[#A3A09B] border border-[#2A2D30] z-20'
                  }`}
                >
                  {sw.name.replace('Gateron ', '').replace('Cherry MX ', 'MX ')}
                </span>
              </div>
            );
          })}

          {/* Active Draggable Crosshair Puck */}
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
              {/* Outer pulsing radar ring */}
              <div className="absolute w-8 h-8 rounded-full border border-[#3C6B4D] animate-ping opacity-75" />
              {/* Inner control puck */}
              <div className="w-6 h-6 rounded-full bg-[#3C6B4D] border-2 border-white text-white flex items-center justify-center shadow-[0_0_20px_#3C6B4D]">
                <Target className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* REAL-TIME TELEMETRY & NEAREST MATCH BAR */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="p-4 rounded-2xl bg-[#18191B] border border-[#2A2D30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            className="text-[10px] font-bold text-[#3C6B4D] hover:underline"
          >
            Select
          </button>
        </div>
      )}
    </div>
  );
};
