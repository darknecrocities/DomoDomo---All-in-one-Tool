import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Sliders,
  X,
  Check,
  RotateCcw,
  Search,
  Sparkles,
  Play,
  Pause,
  CloudRain,
  Coffee,
  Server,
  Radio,
  Keyboard,
  Activity,
  Smartphone,
  Zap,
  Target,
} from 'lucide-react';
import { AcousticMatrixPad } from './AcousticMatrixPad';
import {
  SWITCH_PROFILES,
  previewSoundProfile,
  playClickSound,
  getAudioAnalyser,
  startAmbientSoundscape,
  stopAmbientSoundscape,
  setAmbientVolume,
  type SoundProfile,
} from '../utils/soundEffects';
import {
  getExperienceSettings,
  saveExperienceSettings,
  triggerHaptic,
  type ExperienceSettings,
  type AmbientType,
} from '../utils/experienceSettings';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = ['All', 'Linear', 'Tactile', 'Clicky', 'Silent', 'Vintage / Hall Effect', 'Special'];

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'switches' | 'playground' | 'ambient' | 'tuning'>('matrix');
  const [settings, setSettings] = useState<ExperienceSettings>(getExperienceSettings());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Typing Playground State
  const [testText, setTestText] = useState('');
  const [keystrokes, setKeystrokes] = useState(0);
  const [wpm, setWpm] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  // Audio Equalizer Canvas Ref
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(getExperienceSettings());
    }
    const handleSfxUpdate = (e: CustomEvent<ExperienceSettings>) => {
      if (e.detail) {
        setSettings(e.detail);
      }
    };
    window.addEventListener('domodomo_sfx_update' as any, handleSfxUpdate as any);
    return () => {
      window.removeEventListener('domodomo_sfx_update' as any, handleSfxUpdate as any);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const updateSettings = (partial: Partial<ExperienceSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveExperienceSettings(updated);
  };

  const handleSelectProfile = (profile: SoundProfile) => {
    updateSettings({ profile });
    if (profile !== 'mute') {
      previewSoundProfile(profile);
    }
  };

  // Ambient soundscape handling
  const handleToggleAmbient = (type: AmbientType) => {
    const nextType = settings.ambientType === type ? 'off' : type;
    updateSettings({ ambientType: nextType });
    if (nextType === 'off') {
      stopAmbientSoundscape();
    } else {
      startAmbientSoundscape(nextType, settings.ambientVolume);
    }
  };

  const handleAmbientVolumeChange = (vol: number) => {
    updateSettings({ ambientVolume: vol });
    setAmbientVolume(vol);
  };

  // Typing speed test keypress
  const handleTypingInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTestText(val);
    setKeystrokes((prev) => prev + 1);
    if (settings.typingEnabled) {
      playClickSound();
    }

    if (!startTimeRef.current && val.length > 0) {
      startTimeRef.current = Date.now();
    }

    if (startTimeRef.current) {
      const minutes = (Date.now() - startTimeRef.current) / 60000;
      if (minutes > 0.02) {
        const words = val.trim().split(/\s+/).filter(Boolean).length;
        setWpm(Math.round(words / minutes));
      }
    }
  };

  const resetPlayground = () => {
    setTestText('');
    setKeystrokes(0);
    setWpm(0);
    startTimeRef.current = null;
  };

  // Real-time Audio Visualizer animation loop
  useEffect(() => {
    if (!isOpen || (activeTab !== 'playground' && activeTab !== 'switches')) return;

    let animId: number;
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = getAudioAnalyser();

    const render = () => {
      animId = requestAnimationFrame(render);
      if (!canvas || !ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (!analyser) {
        // Draw subtle idle green wave
        ctx.strokeStyle = 'rgba(60, 107, 77, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        for (let x = 0; x < width; x += 4) {
          const y = height / 2 + Math.sin(x * 0.05 + Date.now() * 0.003) * 3;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (height * 0.88);

        // DomoDomo Emerald gradient audio bars
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(60, 107, 77, 0.25)');
        gradient.addColorStop(0.7, 'rgba(60, 107, 77, 0.9)');
        gradient.addColorStop(1, 'rgba(110, 196, 142, 1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1.2, barHeight);

        x += barWidth;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const filteredSwitches = SWITCH_PROFILES.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeSwitch = SWITCH_PROFILES.find((s) => s.id === settings.profile);

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] rounded-t-[28px] sm:rounded-3xl bg-[#141517] border border-[#2A2D30] p-4 sm:p-6 md:p-7 shadow-2xl z-10 text-[#ECEBE9] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#2A2D30] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 flex items-center justify-center text-[#3C6B4D]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-[#ECEBE9] flex items-center gap-2">
                Acoustic SFX & Switch Studio
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] border border-[#3C6B4D]/30 hidden sm:inline">
                  40 Profiles • 100% Client-Side
                </span>
              </h3>
              <p className="text-[11px] text-[#A3A09B]">
                Tactile mechanical switches, acoustic tuning, typing HUD & ambient focus soundscapes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022] transition-colors cursor-pointer border border-transparent hover:border-[#2A2D30]"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tab Bar */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar border-b border-[#2A2D30] flex-shrink-0">
          {[
            { id: 'matrix', label: '2D Acoustic Matrix', icon: Target },
            { id: 'switches', label: '40 Switch Presets', icon: Volume2 },
            { id: 'playground', label: 'Typing HUD & Spectrum', icon: Activity },
            { id: 'ambient', label: 'Ambient Focus', icon: CloudRain },
            { id: 'tuning', label: 'Audio Controls & Tuning', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-[#3C6B4D] text-white shadow-md shadow-[#3C6B4D]/20'
                    : 'text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#18191B] border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 1: 2D ACOUSTIC MATRIX (X-Y GRAPH ON DOT-DOT WALLS) */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'matrix' && (
          <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
            <div className="p-3 rounded-2xl bg-[#18191B] border border-[#2A2D30] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#ECEBE9] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#3C6B4D]" />
                  Interactive 2D Acoustic Matrix & Thock Spectrum
                </h4>
                <p className="text-[10px] text-[#A3A09B] mt-0.5">
                  Click or drag the crosshair puck across the dotted grid to morph acoustic frequencies between deep thocks and crisp clacks
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#3C6B4D] bg-[#3C6B4D]/10 border border-[#3C6B4D]/25 px-2 py-0.5 rounded-full uppercase hidden sm:inline">
                40 Switches Plotted
              </span>
            </div>

            <AcousticMatrixPad
              onSelectSwitch={handleSelectProfile}
              activeProfile={settings.profile}
            />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 2: 40 SWITCHES & SOUND PRESETS */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'switches' && (
          <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#72706C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 40 switch profiles by name, feel, or acoustic tag..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#18191B] border border-[#2A2D30] rounded-xl text-xs text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#72706C] hover:text-[#ECEBE9]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
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

            {/* Switch Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredSwitches.map((s) => {
                const isSelected = settings.profile === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectProfile(s.id)}
                    className={`text-left p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between group ${
                      isSelected
                        ? 'bg-[#3C6B4D]/15 text-[#ECEBE9] border-[#3C6B4D] shadow-lg shadow-[#3C6B4D]/10 ring-1 ring-[#3C6B4D]/50'
                        : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022] hover:border-[#3C6B4D]/40'
                    }`}
                  >
                    <div className="pr-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[8px] font-mono font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-[#3C6B4D] text-white'
                              : 'bg-[#2A2D30] text-[#ECEBE9]'
                          }`}
                        >
                          {s.tag}
                        </span>
                        <span
                          className={`text-[9px] font-bold ${
                            isSelected ? 'text-[#3C6B4D]' : 'text-[#72706C]'
                          }`}
                        >
                          {s.category}
                        </span>
                      </div>

                      <p className="text-xs font-extrabold tracking-tight truncate text-[#ECEBE9]">
                        {s.name}
                      </p>
                      <p className="text-[10px] mt-1 line-clamp-2 leading-snug text-[#A3A09B]">
                        {s.desc}
                      </p>
                    </div>

                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#3C6B4D] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[#2A2D30] group-hover:border-[#3C6B4D]/50 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#72706C] group-hover:text-[#3C6B4D] transition-colors">
                        <Sparkles className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 2: TYPING HUD & REAL-TIME SPECTRUM */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'playground' && (
          <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
            {/* Real-time Frequency Spectrum Oscilloscope */}
            <div className="p-4 rounded-2xl bg-[#18191B] border border-[#2A2D30]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#A3A09B] uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#3C6B4D]" />
                  Acoustic Frequency Spectrum
                </span>
                <span className="text-[9px] font-mono text-[#3C6B4D]">
                  {activeSwitch?.name || 'Gateron Oil King'} Active
                </span>
              </div>
              <canvas
                ref={visualizerCanvasRef}
                width={600}
                height={64}
                className="w-full h-16 rounded-xl bg-[#111213] border border-[#2A2D30]/60"
              />
            </div>

            {/* Mechanical Keyboard Typing Speed Sandbox */}
            <div className="p-4 rounded-2xl bg-[#18191B] border border-[#2A2D30] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5">
                    <Keyboard className="w-3.5 h-3.5 text-[#3C6B4D]" />
                    Typing Sound Test & Speed Arena
                  </h4>
                  <p className="text-[10px] text-[#A3A09B]">
                    Type below to feel mechanical switch thocks and clacks in real-time
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono font-black text-[#3C6B4D]">{wpm} WPM</div>
                    <div className="text-[9px] text-[#A3A09B]">{keystrokes} Keys</div>
                  </div>
                  <button
                    onClick={resetPlayground}
                    className="p-1.5 rounded-lg bg-[#1E2022] hover:bg-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] transition-colors"
                    title="Reset typing test"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={testText}
                onChange={handleTypingInput}
                placeholder="Start typing anything here (e.g. 'DomoDomo is an ultra-fast offline tool suite with 230+ utilities') to audition the active mechanical switch profile..."
                className="w-full p-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D] transition-colors resize-none font-mono"
              />
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 3: PROCEDURAL AMBIENT SOUNDSCAPES */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'ambient' && (
          <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
            <div className="p-3.5 rounded-2xl bg-[#18191B] border border-[#2A2D30]">
              <p className="text-xs text-[#ECEBE9] leading-relaxed">
                Procedural generative focus soundscapes synthesized directly in your browser. Designed for deep coding concentration and flow state.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'lofi_rain' as AmbientType,
                  name: 'Lo-Fi Rain & Thunder',
                  desc: 'Continuous multi-pole pink noise with soothing low-frequency rumble.',
                  icon: CloudRain,
                },
                {
                  id: 'cozy_coffee' as AmbientType,
                  name: 'Cozy Coffee House',
                  desc: 'Filtered cafe background murmurs and warm low-mid resonance.',
                  icon: Coffee,
                },
                {
                  id: 'server_drone' as AmbientType,
                  name: 'Deep Server Room',
                  desc: '60Hz & 120Hz tuned server cooling drone for hyper-focus.',
                  icon: Server,
                },
                {
                  id: 'binaural_alpha' as AmbientType,
                  name: 'Binaural Alpha Waves (432Hz)',
                  desc: '10Hz alpha differential beat for study and cognitive focus.',
                  icon: Radio,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isPlaying = settings.ambientType === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggleAmbient(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                      isPlaying
                        ? 'bg-[#3C6B4D]/15 text-[#ECEBE9] border-[#3C6B4D] shadow-lg shadow-[#3C6B4D]/10 ring-1 ring-[#3C6B4D]/50'
                        : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                    }`}
                  >
                    <div className="pr-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className={`w-4 h-4 ${isPlaying ? 'text-[#3C6B4D]' : 'text-[#ECEBE9]'}`} />
                        <span className="text-xs font-extrabold text-[#ECEBE9]">{item.name}</span>
                      </div>
                      <p className="text-[10px] leading-snug text-[#A3A09B]">
                        {item.desc}
                      </p>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isPlaying ? 'bg-[#3C6B4D] text-white' : 'bg-[#2A2D30] text-[#ECEBE9]'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {settings.ambientType !== 'off' && (
              <div className="p-4 rounded-2xl bg-[#18191B] border border-[#2A2D30] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#A3A09B] font-bold uppercase tracking-wider text-[10px]">
                    Ambient Layer Volume
                  </span>
                  <span className="font-mono font-bold text-[#3C6B4D]">
                    {Math.round(settings.ambientVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.ambientVolume}
                  onChange={(e) => handleAmbientVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#111213] rounded-lg appearance-none cursor-pointer accent-[#3C6B4D]"
                />
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 4: AUDIO CONTROLS & PREFERENCES */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'tuning' && (
          <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
            {/* Master Volume */}
            <div className="p-4 rounded-2xl bg-[#18191B] border border-[#2A2D30] space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#ECEBE9]">Switch Master Volume</span>
                <span className="text-xs font-mono font-bold text-[#3C6B4D]">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                className="w-full h-2 bg-[#111213] rounded-lg appearance-none cursor-pointer accent-[#3C6B4D]"
              />
            </div>

            {/* Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => updateSettings({ hoverEnabled: !settings.hoverEnabled })}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  settings.hoverEnabled
                    ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/40 text-[#ECEBE9]'
                    : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Hover Thocks</p>
                  <p className="text-[10px] text-[#A3A09B] mt-0.5">Play subtle acoustic tap on button hover</p>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${settings.hoverEnabled ? 'bg-[#3C6B4D] text-white' : 'bg-[#2A2D30] text-[#A3A09B]'}`}>
                  {settings.hoverEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => updateSettings({ clickEnabled: !settings.clickEnabled })}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  settings.clickEnabled
                    ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/40 text-[#ECEBE9]'
                    : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Click Thocks</p>
                  <p className="text-[10px] text-[#A3A09B] mt-0.5">Play bottom-out acoustic on clicks</p>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${settings.clickEnabled ? 'bg-[#3C6B4D] text-white' : 'bg-[#2A2D30] text-[#A3A09B]'}`}>
                  {settings.clickEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => updateSettings({ typingEnabled: !settings.typingEnabled })}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  settings.typingEnabled
                    ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/40 text-[#ECEBE9]'
                    : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Typing SFX</p>
                  <p className="text-[10px] text-[#A3A09B] mt-0.5">Play mechanical switch sound when typing</p>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${settings.typingEnabled ? 'bg-[#3C6B4D] text-white' : 'bg-[#2A2D30] text-[#A3A09B]'}`}>
                  {settings.typingEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => updateSettings({ pitchVariance: !settings.pitchVariance })}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  settings.pitchVariance
                    ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/40 text-[#ECEBE9]'
                    : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Micro-Pitch Variance</p>
                  <p className="text-[10px] text-[#A3A09B] mt-0.5">±4% acoustic shifts to prevent ear fatigue</p>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${settings.pitchVariance ? 'bg-[#3C6B4D] text-white' : 'bg-[#2A2D30] text-[#A3A09B]'}`}>
                  {settings.pitchVariance ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => {
                  updateSettings({ hapticsEnabled: !settings.hapticsEnabled });
                  triggerHaptic('medium');
                }}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  settings.hapticsEnabled
                    ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/40 text-[#ECEBE9]'
                    : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#3C6B4D]" />
                  <div>
                    <p className="text-xs font-bold">Mobile Haptic Feedback</p>
                    <p className="text-[10px] text-[#A3A09B] mt-0.5">Tactile screen vibration on touch</p>
                  </div>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${settings.hapticsEnabled ? 'bg-[#3C6B4D] text-white' : 'bg-[#2A2D30] text-[#A3A09B]'}`}>
                  {settings.hapticsEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* MODAL FOOTER */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="pt-3 sm:pt-4 border-t border-[#2A2D30] flex-shrink-0 space-y-3">
          {/* Volume quick bar visible on switches tab */}
          {activeTab === 'switches' && settings.profile !== 'mute' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#A3A09B]">
                  Switch Master Volume
                </span>
                <span className="text-xs font-mono font-bold text-[#3C6B4D]">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                className="w-full h-2 bg-[#111213] rounded-lg appearance-none cursor-pointer accent-[#3C6B4D]"
              />
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                updateSettings({
                  profile: 'oil_king',
                  volume: 0.75,
                  hoverEnabled: true,
                  clickEnabled: true,
                  typingEnabled: true,
                  pitchVariance: true,
                  ambientType: 'off',
                  ambientVolume: 0.35,
                  hapticsEnabled: true,
                });
                stopAmbientSoundscape();
                previewSoundProfile('oil_king');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#A3A09B] hover:text-[#ECEBE9] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-[#3C6B4D] hover:bg-[#477e5b] text-white text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-[#3C6B4D]/20"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
