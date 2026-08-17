/**
 * DomoDomo Mechanical Keyboard Switch Acoustic Synthesizer Engine (Web Audio API)
 * Features 40 distinct switch & sound profiles modeled after real-world enthusiast switches
 * and UI tactile acoustic soundscapes.
 * 100% Client-Side / Zero-Latency / Zero External Network Assets.
 */

import {
  getExperienceSettings,
  saveExperienceSettings,
  triggerHaptic,
  type ExperienceSettings,
  type AmbientType,
  type SoundProfile,
} from './experienceSettings';

export type { SoundProfile };

export interface SwitchMeta {
  id: SoundProfile;
  name: string;
  category: 'Linear' | 'Tactile' | 'Clicky' | 'Silent' | 'Vintage / Hall Effect' | 'Special';
  desc: string;
  tag: string;
}

export const SWITCH_PROFILES: SwitchMeta[] = [
  // ── Linear (8) ──
  {
    id: 'oil_king',
    name: 'Gateron Oil King',
    category: 'Linear',
    desc: 'Deep, heavy, factory-lubed ultra-thocky bottom-out acoustic.',
    tag: 'Deep Thock',
  },
  {
    id: 'gateron_ink_black',
    name: 'Gateron Ink Black V2',
    category: 'Linear',
    desc: 'Smoky transparent housing with deep resonant low-end bottom.',
    tag: 'Smoky Bass',
  },
  {
    id: 'creamsicle',
    name: 'NK Creamsicle',
    category: 'Linear',
    desc: 'POM Cream stem in Tangerine housing for sharp marbly clack.',
    tag: 'Marbly Clack',
  },
  {
    id: 'banana_split',
    name: 'C3 Banana Split (Macho)',
    category: 'Linear',
    desc: 'Buttery nylon/polycarbonate blend with distinctive creamy pop.',
    tag: 'Creamy Pop',
  },
  {
    id: 'tangerine',
    name: 'C3 Tangerine 67g',
    category: 'Linear',
    desc: 'High-pitched crisp UHMWPE housing clack with rapid rebound.',
    tag: 'Crisp UHMWPE',
  },
  {
    id: 'aqua_king',
    name: 'Everglide Aqua King',
    category: 'Linear',
    desc: 'Pure clear polycarbonate housing with solid glassy acoustic.',
    tag: 'Glassy Clack',
  },
  {
    id: 'gateron_cj',
    name: 'Gateron CJ (China Jam)',
    category: 'Linear',
    desc: 'Snappy smooth POM stem with bright distinctive clack.',
    tag: 'Snappy POM',
  },
  {
    id: 'milky_yellow',
    name: 'Gateron Milky Yellow',
    category: 'Linear',
    desc: 'Warm, buttery smooth nylon-housing gentle pop.',
    tag: 'Buttery Smooth',
  },

  // ── Tactile (7) ──
  {
    id: 'holy_panda',
    name: 'Holy Panda',
    category: 'Tactile',
    desc: 'Snappy tactile bump with explosive rounded bottom-out pop.',
    tag: 'Poppy Tactile',
  },
  {
    id: 'boba_u4t',
    name: 'Gazzew Boba U4T',
    category: 'Tactile',
    desc: 'Dense, creamy acoustic signature with distinct tactile D-bump.',
    tag: 'Creamy Thock',
  },
  {
    id: 'durock_t1',
    name: 'Durock T1 (Koala)',
    category: 'Tactile',
    desc: 'Aggressive smokey tactile bump with loud solid bottom landing.',
    tag: 'Sharp D-Bump',
  },
  {
    id: 'drop_halo_true',
    name: 'Drop Halo True',
    category: 'Tactile',
    desc: 'High tactile bump with progressive heavy spring bounce.',
    tag: 'Heavy Spring',
  },
  {
    id: 'zealios',
    name: 'Zealios V2 67g',
    category: 'Tactile',
    desc: 'Ultra-crisp elevated tactile snap with metallic leaf resonance.',
    tag: 'Sharp Tactile',
  },
  {
    id: 'mx_brown',
    name: 'Cherry MX Brown',
    category: 'Tactile',
    desc: 'Lightweight subtle bump with gentle tactile feel.',
    tag: 'Subtle Tactile',
  },
  {
    id: 'epomaker_wisteria',
    name: 'Epomaker Wisteria',
    category: 'Tactile',
    desc: 'Fast-actuation tactile switch with hollow wood-like thock.',
    tag: 'Woody Thock',
  },

  // ── Clicky (7) ──
  {
    id: 'box_jade',
    name: 'Kailh Box Jade',
    category: 'Clicky',
    desc: 'Thick click-bar with crisp, explosive gunshot-like snap.',
    tag: 'Gunshot Click',
  },
  {
    id: 'box_navy',
    name: 'Kailh Box Navy',
    category: 'Clicky',
    desc: 'Heavy thick click-bar explosive crack and deep heavy bottom.',
    tag: 'Thick Clickbar',
  },
  {
    id: 'box_white',
    name: 'Kailh Box White',
    category: 'Clicky',
    desc: 'Delicate, sharp click-bar chime with ultra-crisp pitch.',
    tag: 'Crisp Clickbar',
  },
  {
    id: 'mx_blue',
    name: 'Cherry MX Blue',
    category: 'Clicky',
    desc: 'Classic loud click-jacket snap with sharp metallic actuation.',
    tag: 'Click Jacket',
  },
  {
    id: 'matias_click',
    name: 'Matias / ALPS Click',
    category: 'Clicky',
    desc: 'Legendary Alps leaf click with hollow metallic chime.',
    tag: 'Alps Chime',
  },
  {
    id: 'akko_jelly_black',
    name: 'Akko CS Jelly Blue',
    category: 'Clicky',
    desc: 'Dustproof tactile stem with stiff crisp high-frequency snap.',
    tag: 'Stiff Clack',
  },
  {
    id: 'laser_clack',
    name: 'Sanwa Arcade Microswitch',
    category: 'Clicky',
    desc: 'Instant snappy Japanese arcade push-button slap.',
    tag: 'Arcade Snap',
  },

  // ── Silent (4) ──
  {
    id: 'boba_black_u4',
    name: 'Gazzew Boba U4 Silent',
    category: 'Silent',
    desc: 'Silicone cushioned tactile bump with ultra-deep stealth thud.',
    tag: 'Silent Tactile',
  },
  {
    id: 'outemu_silent_peach',
    name: 'Outemu Silent Peach V2',
    category: 'Silent',
    desc: 'Whisper-quiet silicone pad landing for silent work sessions.',
    tag: 'Whisper Peach',
  },
  {
    id: 'silent_alpaca',
    name: 'Durock Silent Linear',
    category: 'Silent',
    desc: 'Muted stealth dampener with soft cushioned landing.',
    tag: 'Stealth Mute',
  },
  {
    id: 'asmr_whisper',
    name: 'ASMR Velvet Whisper',
    category: 'Silent',
    desc: 'Ultra-soft feather-touch acoustic cushion with subtle breathiness.',
    tag: 'Velvet ASMR',
  },

  // ── Vintage & Hall Effect (7) ──
  {
    id: 'buckling_spring',
    name: 'IBM Model M Buckling Spring',
    category: 'Vintage / Hall Effect',
    desc: 'Resonant steel spring buckling ping and heavy barrel strike.',
    tag: 'Vintage Steel',
  },
  {
    id: 'beam_spring',
    name: 'IBM 5251 Beam Spring',
    category: 'Vintage / Hall Effect',
    desc: '1970s holy grail with magnetic solenoid punch and beam click.',
    tag: 'Solenoid Beam',
  },
  {
    id: 'topre',
    name: 'Topre 45g Electro-Capacitive',
    category: 'Vintage / Hall Effect',
    desc: 'Pillowy rubber-dome thock with deep hollow bottom-out pop.',
    tag: 'Capacitive Thock',
  },
  {
    id: 'space_cadet',
    name: 'Symbolics Space Cadet',
    category: 'Vintage / Hall Effect',
    desc: '1980s LISP machine inductive switch with heavy acoustic punch.',
    tag: 'LISP Inductive',
  },
  {
    id: 'wooting_lekker',
    name: 'Wooting Lekker Hall Effect',
    category: 'Vintage / Hall Effect',
    desc: 'Frictionless magnetic Hall-Effect linear with soft magnetic chime.',
    tag: 'Magnetic Hall',
  },
  {
    id: 'typewriter',
    name: 'Vintage Typewriter',
    category: 'Vintage / Hall Effect',
    desc: 'Mechanical steel lever strike on ribbon platen.',
    tag: 'Steel Hammer',
  },
  {
    id: 'mechanical_calculator',
    name: 'Curta Mechanical Gear',
    category: 'Vintage / Hall Effect',
    desc: 'Precision vintage gear ratchet click with brass ring chime.',
    tag: 'Brass Ratchet',
  },

  // ── Special & Sci-Fi (7) ──
  {
    id: 'bubble',
    name: 'Bubble Pebble',
    category: 'Special',
    desc: 'Organic wooden pebble / liquid water droplet pop.',
    tag: 'Organic Pop',
  },
  {
    id: 'scifi',
    name: 'Cyberpunk Pulse',
    category: 'Special',
    desc: 'Futuristic holographic laser blip with synth decay.',
    tag: 'Hologram',
  },
  {
    id: 'quantum_relay',
    name: 'Quantum Computing Relay',
    category: 'Special',
    desc: 'Plasma-charged subatomic acoustic tick with micro-reverb.',
    tag: 'Plasma Relay',
  },
  {
    id: 'neo_glass',
    name: 'Minimal Neo Glass',
    category: 'Special',
    desc: 'Crisp modern UI crystal ping with harmonic shimmer.',
    tag: 'Crystal Glass',
  },
  {
    id: 'cassette_click',
    name: 'Vintage Cassette Deck',
    category: 'Special',
    desc: 'Tactile plastic magnetic tape transport mechanism click.',
    tag: 'Cassette Deck',
  },
  {
    id: 'bamboo_tap',
    name: 'Zen Bamboo Tap',
    category: 'Special',
    desc: 'Natural resonant hollow bamboo node water garden tap.',
    tag: 'Zen Bamboo',
  },
  {
    id: 'haptic_sub',
    name: 'Sub-Bass Haptic Thump',
    category: 'Special',
    desc: 'Deep 45Hz sub-bass pressure punch for cinematic feedback.',
    tag: 'Sub-Bass Drop',
  },

  // ── Mute ──
  {
    id: 'mute',
    name: 'Mute / Silent',
    category: 'Special',
    desc: 'Disable all navigation acoustic sound effects.',
    tag: 'Off',
  },
];

export interface SwitchCoordinate {
  id: SoundProfile;
  name: string;
  category: 'Linear' | 'Tactile' | 'Clicky' | 'Silent' | 'Vintage / Hall Effect' | 'Special';
  tag: string;
  x: number; // 0 (Extreme Deep Thock) to 100 (Extreme High Clack)
  y: number; // 0 (Soft Light Cushion) to 100 (Heavy Thick Solid Thud)
  speedGrams: number; // Actuation force in grams (e.g. 35 - 90g)
  travelMm: number; // Key travel (e.g. 1.2 - 4.5mm)
  soundTone: string;
}

export const SWITCH_COORDINATES: SwitchCoordinate[] = [
  // Linear
  { id: 'oil_king', name: 'Gateron Oil King', category: 'Linear', tag: 'Deep Thock', x: 12, y: 92, speedGrams: 80, travelMm: 4.0, soundTone: 'Deep Lubed Bass' },
  { id: 'gateron_ink_black', name: 'Gateron Ink Black V2', category: 'Linear', tag: 'Smoky Bass', x: 18, y: 88, speedGrams: 70, travelMm: 4.0, soundTone: 'Smoky Resonant Low-End' },
  { id: 'creamsicle', name: 'NK Creamsicle', category: 'Linear', tag: 'Marbly Clack', x: 82, y: 75, speedGrams: 67, travelMm: 3.8, soundTone: 'High-Pitched Marbly Clack' },
  { id: 'banana_split', name: 'C3 Banana Split', category: 'Linear', tag: 'Creamy Pop', x: 45, y: 65, speedGrams: 62, travelMm: 4.0, soundTone: 'Balanced Creamy Pop' },
  { id: 'tangerine', name: 'C3 Tangerine 67g', category: 'Linear', tag: 'Crisp UHMWPE', x: 88, y: 60, speedGrams: 67, travelMm: 4.0, soundTone: 'Rapid Crisp UHMWPE Clack' },
  { id: 'aqua_king', name: 'Everglide Aqua King', category: 'Linear', tag: 'Glassy Clack', x: 78, y: 68, speedGrams: 62, travelMm: 4.0, soundTone: 'Glassy Polycarbonate Clack' },
  { id: 'gateron_cj', name: 'Gateron CJ', category: 'Linear', tag: 'Snappy POM', x: 74, y: 55, speedGrams: 50, travelMm: 4.0, soundTone: 'Bright Snappy POM Pop' },
  { id: 'milky_yellow', name: 'Gateron Milky Yellow', category: 'Linear', tag: 'Buttery Smooth', x: 35, y: 50, speedGrams: 50, travelMm: 4.0, soundTone: 'Nylon Warm Gentle Pop' },

  // Tactile
  { id: 'holy_panda', name: 'Holy Panda', category: 'Tactile', tag: 'Poppy Tactile', x: 52, y: 90, speedGrams: 67, travelMm: 3.8, soundTone: 'Explosive Rounded D-Bump' },
  { id: 'boba_u4t', name: 'Gazzew Boba U4T', category: 'Tactile', tag: 'Creamy Thock', x: 22, y: 85, speedGrams: 68, travelMm: 4.0, soundTone: 'Dense Creamy Low-Thock' },
  { id: 'durock_t1', name: 'Durock T1', category: 'Tactile', tag: 'Sharp D-Bump', x: 68, y: 78, speedGrams: 67, travelMm: 4.0, soundTone: 'Aggressive Smokey Tactile' },
  { id: 'drop_halo_true', name: 'Drop Halo True', category: 'Tactile', tag: 'Heavy Spring', x: 40, y: 85, speedGrams: 78, travelMm: 4.0, soundTone: 'Progressive Heavy Bounce' },
  { id: 'zealios', name: 'Zealios V2 67g', category: 'Tactile', tag: 'Sharp Tactile', x: 76, y: 80, speedGrams: 67, travelMm: 4.0, soundTone: 'Crisp Metallic Leaf Snap' },
  { id: 'mx_brown', name: 'Cherry MX Brown', category: 'Tactile', tag: 'Subtle Tactile', x: 48, y: 45, speedGrams: 45, travelMm: 4.0, soundTone: 'Light Subtle Tactile Bump' },
  { id: 'epomaker_wisteria', name: 'Epomaker Wisteria', category: 'Tactile', tag: 'Woody Thock', x: 30, y: 60, speedGrams: 45, travelMm: 3.6, soundTone: 'Hollow Woody Thock' },

  // Clicky
  { id: 'box_jade', name: 'Kailh Box Jade', category: 'Clicky', tag: 'Gunshot Click', x: 92, y: 82, speedGrams: 50, travelMm: 3.6, soundTone: 'Explosive Thick Clickbar' },
  { id: 'box_navy', name: 'Kailh Box Navy', category: 'Clicky', tag: 'Thick Clickbar', x: 85, y: 95, speedGrams: 90, travelMm: 3.6, soundTone: 'Heavy Steel Crack & Deep Thud' },
  { id: 'box_white', name: 'Kailh Box White', category: 'Clicky', tag: 'Crisp Clickbar', x: 95, y: 48, speedGrams: 45, travelMm: 3.6, soundTone: 'Delicate Sharp Clickbar Chime' },
  { id: 'mx_blue', name: 'Cherry MX Blue', category: 'Clicky', tag: 'Click Jacket', x: 80, y: 70, speedGrams: 50, travelMm: 4.0, soundTone: 'Loud Click-Jacket Snap' },
  { id: 'matias_click', name: 'Matias / ALPS Click', category: 'Clicky', tag: 'Alps Chime', x: 72, y: 65, speedGrams: 60, travelMm: 3.5, soundTone: 'Vintage ALPS Hollow Chime' },
  { id: 'akko_jelly_black', name: 'Akko CS Jelly Blue', category: 'Clicky', tag: 'Stiff Clack', x: 70, y: 58, speedGrams: 50, travelMm: 4.0, soundTone: 'Stiff High-Frequency Snap' },
  { id: 'laser_clack', name: 'Sanwa Arcade Microswitch', category: 'Clicky', tag: 'Arcade Snap', x: 86, y: 72, speedGrams: 60, travelMm: 1.5, soundTone: 'Japanese Arcade Slap' },

  // Silent
  { id: 'boba_black_u4', name: 'Gazzew Boba U4 Silent', category: 'Silent', tag: 'Silent Tactile', x: 15, y: 22, speedGrams: 62, travelMm: 4.0, soundTone: 'Silicone Cushioned Deep Stealth' },
  { id: 'outemu_silent_peach', name: 'Outemu Silent Peach V2', category: 'Silent', tag: 'Whisper Peach', x: 38, y: 15, speedGrams: 40, travelMm: 3.3, soundTone: 'Whisper Soft Pad Landing' },
  { id: 'silent_alpaca', name: 'Durock Silent Linear', category: 'Silent', tag: 'Stealth Mute', x: 28, y: 18, speedGrams: 62, travelMm: 4.0, soundTone: 'Muted Stealth Cushion' },
  { id: 'asmr_whisper', name: 'ASMR Velvet Whisper', category: 'Silent', tag: 'Velvet ASMR', x: 42, y: 10, speedGrams: 35, travelMm: 3.0, soundTone: 'Ultra-Soft Velvet Cushion' },

  // Vintage & Hall Effect
  { id: 'buckling_spring', name: 'IBM Model M Buckling Spring', category: 'Vintage / Hall Effect', tag: 'Vintage Steel', x: 65, y: 98, speedGrams: 75, travelMm: 3.7, soundTone: 'Steel Spring Ping & Heavy Barrel' },
  { id: 'beam_spring', name: 'IBM 5251 Beam Spring', category: 'Vintage / Hall Effect', tag: 'Solenoid Beam', x: 25, y: 96, speedGrams: 65, travelMm: 3.5, soundTone: '1970s Solenoid Punch & Beam Click' },
  { id: 'topre', name: 'Topre 45g Electro-Capacitive', category: 'Vintage / Hall Effect', tag: 'Capacitive Thock', x: 16, y: 72, speedGrams: 45, travelMm: 4.0, soundTone: 'Pillowy Rubber-Dome Pop' },
  { id: 'space_cadet', name: 'Symbolics Space Cadet', category: 'Vintage / Hall Effect', tag: 'LISP Inductive', x: 32, y: 90, speedGrams: 70, travelMm: 4.0, soundTone: '1980s LISP Inductive Heavy Punch' },
  { id: 'wooting_lekker', name: 'Wooting Lekker Hall Effect', category: 'Vintage / Hall Effect', tag: 'Magnetic Hall', x: 62, y: 42, speedGrams: 60, travelMm: 4.0, soundTone: 'Frictionless Magnetic Linear Chime' },
  { id: 'typewriter', name: 'Vintage Typewriter', category: 'Vintage / Hall Effect', tag: 'Steel Hammer', x: 84, y: 88, speedGrams: 85, travelMm: 4.5, soundTone: 'Mechanical Steel Lever Hammer' },
  { id: 'mechanical_calculator', name: 'Curta Mechanical Gear', category: 'Vintage / Hall Effect', tag: 'Brass Ratchet', x: 75, y: 62, speedGrams: 55, travelMm: 2.0, soundTone: 'Precision Brass Ratchet Click' },

  // Special & Sci-Fi
  { id: 'bubble', name: 'Bubble Pebble', category: 'Special', tag: 'Organic Pop', x: 50, y: 35, speedGrams: 45, travelMm: 2.5, soundTone: 'Organic Liquid Water Droplet Pop' },
  { id: 'scifi', name: 'Cyberpunk Pulse', category: 'Special', tag: 'Hologram', x: 80, y: 40, speedGrams: 40, travelMm: 2.0, soundTone: 'Futuristic Hologram Laser Pulse' },
  { id: 'quantum_relay', name: 'Quantum Computing Relay', category: 'Special', tag: 'Plasma Relay', x: 85, y: 52, speedGrams: 50, travelMm: 1.5, soundTone: 'Plasma-Charged Subatomic Micro-Tick' },
  { id: 'neo_glass', name: 'Minimal Neo Glass', category: 'Special', tag: 'Crystal Glass', x: 90, y: 38, speedGrams: 35, travelMm: 1.2, soundTone: 'Modern UI Crystal Glass Ping' },
  { id: 'cassette_click', name: 'Vintage Cassette Deck', category: 'Special', tag: 'Cassette Deck', x: 58, y: 64, speedGrams: 65, travelMm: 3.0, soundTone: 'Plastic Cassette Transport Click' },
  { id: 'bamboo_tap', name: 'Zen Bamboo Tap', category: 'Special', tag: 'Zen Bamboo', x: 44, y: 58, speedGrams: 50, travelMm: 3.5, soundTone: 'Hollow Bamboo Water Garden Tap' },
  { id: 'haptic_sub', name: 'Sub-Bass Haptic Thump', category: 'Special', tag: 'Sub-Bass Drop', x: 8, y: 85, speedGrams: 80, travelMm: 4.0, soundTone: 'Deep 45Hz Sub-Bass Pressure Pulse' },
];

export function findClosestSwitch(x: number, y: number): SwitchCoordinate {
  let closest = SWITCH_COORDINATES[0];
  let minDistance = Infinity;

  for (const sw of SWITCH_COORDINATES) {
    const dx = sw.x - x;
    const dy = sw.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDistance) {
      minDistance = dist;
      closest = sw;
    }
  }

  return closest;
}

/**
 * Parametric dynamic synthesis based on (x, y) coordinates
 * x: 0 (Deep Thock / low pitch) -> 100 (Crisp Clack / high pitch)
 * y: 0 (Light cushion) -> 100 (Thick heavy solid bottom)
 */
export function synthParametricXY(ctx: AudioContext, now: number, vol: number, x: number, y: number, isClick = false) {
  const normX = Math.max(0, Math.min(100, x)) / 100;
  const normY = Math.max(0, Math.min(100, y)) / 100;

  // Base frequency: from 120Hz (deep bass) to 2200Hz (high clack)
  const baseFreq = 120 + Math.pow(normX, 1.8) * 2000;
  const endFreq = 20 + normX * 250;

  // Duration & Decay: heavier (high Y) has longer solid resonance; lighter (low Y) is fast/soft
  const duration = 0.03 + normY * 0.045;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Waveform blends from sine/triangle (low x/thock) to sawtooth/square (high x/clack)
  if (normX < 0.35) {
    osc.type = 'sine';
  } else if (normX < 0.7) {
    osc.type = 'triangle';
  } else if (normX < 0.85) {
    osc.type = 'sawtooth';
  } else {
    osc.type = 'square';
  }

  osc.frequency.setValueAtTime(baseFreq * (isClick ? 1 : 1.15), now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), now + duration * 0.8);

  const peakVol = (isClick ? 0.35 : 0.22) * vol * (0.4 + normY * 0.6);
  gain.gain.setValueAtTime(peakVol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const filter = ctx.createBiquadFilter();
  if (normX < 0.4) {
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350 + normY * 600, now);
    filter.Q.setValueAtTime(1 + normY * 3.5, now);
  } else if (normX < 0.75) {
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700 + normX * 800, now);
    filter.Q.setValueAtTime(1.5 + normY * 2, now);
  } else {
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(300 + normX * 400, now);
  }

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);

  osc.start(now);
  osc.stop(now + duration + 0.01);
}

export function playCoordinateSound(x: number, y: number, isClick = false) {
  const settings = getExperienceSettings();
  const ctx = getAudioContext();
  if (!ctx || settings.profile === 'mute') return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  const vol = settings.volume;
  if (vol <= 0) return;
  synthParametricXY(ctx, ctx.currentTime, vol, x, y, isClick);
}

let audioCtx: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let lastHoverSoundTime = 0;
let lastHoveredElement: Element | null = null;

export function getAudioSettings(): ExperienceSettings {
  return getExperienceSettings();
}

export function saveSettings(settings: Partial<ExperienceSettings>) {
  saveExperienceSettings(settings);
}

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function getAudioAnalyser(): AnalyserNode | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (!analyserNode) {
    analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.75;
  }
  return analyserNode;
}

/** Direct connect to destination + analyser node for reliable visualizer feedback */
function connectToBus(ctx: AudioContext, node: AudioNode) {
  try {
    node.connect(ctx.destination);
    const analyser = getAudioAnalyser();
    if (analyser) {
      node.connect(analyser);
    }
  } catch {}
}

function getPitchRandomizer(): number {
  const settings = getExperienceSettings();
  if (!settings.pitchVariance) return 1;
  return 1 + (Math.random() - 0.5) * 0.06;
}

// ══════════════════════════════════════════════════════════════════════
// 40 MECHANICAL SWITCH & SOUND SYNTHESIS ENGINES
// ══════════════════════════════════════════════════════════════════════

/** 1. Gateron Oil King */
function synthOilKing(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const baseFreq = (isClick ? 165 : 200) * rand;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = isClick ? 'sine' : 'triangle';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(28, now + 0.045);

  gain.gain.setValueAtTime((isClick ? 0.34 : 0.22) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (isClick ? 0.065 : 0.05));

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(isClick ? 580 : 700, now);
  filter.Q.setValueAtTime(3.2, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.07);
}

/** 2. Gateron Ink Black V2 */
function synthInkBlack(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 145 : 180) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(22, now + 0.05);

  gain.gain.setValueAtTime((isClick ? 0.36 : 0.24) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(420, now);
  filter.Q.setValueAtTime(4.2, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.07);
}

/** 3. NK Creamsicle */
function synthCreamsicle(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 420 : 490) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(95, now + 0.035);

  gain.gain.setValueAtTime((isClick ? 0.32 : 0.2) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1450, now);
  filter.Q.setValueAtTime(2.5, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 4. C3 Banana Split (Macho) */
function synthBananaSplit(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 240 : 290) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.3 : 0.18) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(780, now);
  filter.Q.setValueAtTime(2.8, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 5. C3 Tangerine 67g */
function synthTangerine(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime((isClick ? 480 : 540) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.03);

  gain.gain.setValueAtTime((isClick ? 0.28 : 0.18) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(320, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.045);
}

/** 6. Everglide Aqua King */
function synthAquaKing(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime((isClick ? 520 : 580) * rand, now);
  osc1.frequency.exponentialRampToValueAtTime(110, now + 0.03);
  gain1.gain.setValueAtTime(0.25 * vol, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const oscGlass = ctx.createOscillator();
  const gainGlass = ctx.createGain();
  oscGlass.type = 'sine';
  oscGlass.frequency.setValueAtTime(2100, now);
  oscGlass.frequency.exponentialRampToValueAtTime(700, now + 0.015);
  gainGlass.gain.setValueAtTime(0.12 * vol, now);
  gainGlass.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  osc1.connect(gain1);
  oscGlass.connect(gainGlass);
  connectToBus(ctx, gain1);
  connectToBus(ctx, gainGlass);
  osc1.start(now);
  osc1.stop(now + 0.045);
  oscGlass.start(now);
  oscGlass.stop(now + 0.025);
}

/** 7. Gateron CJ */
function synthGateronCJ(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 440 : 500) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(85, now + 0.035);

  gain.gain.setValueAtTime((isClick ? 0.3 : 0.19) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.Q.setValueAtTime(1.8, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 8. Gateron Milky Yellow */
function synthMilkyYellow(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 220 : 270) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.32 : 0.2) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(650, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 9. Holy Panda */
function synthHolyPanda(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const bumpFreq = (isClick ? 320 : 380) * rand;

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(bumpFreq, now);
  osc1.frequency.exponentialRampToValueAtTime(140, now + 0.015);
  gain1.gain.setValueAtTime(0.24 * vol, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime((isClick ? 190 : 230) * rand, now + 0.01);
  osc2.frequency.exponentialRampToValueAtTime(45, now + 0.05);
  gain2.gain.setValueAtTime(0.28 * vol, now + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + (isClick ? 0.06 : 0.045));

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(isClick ? 950 : 1100, now);
  filter.Q.setValueAtTime(2.2, now);

  osc1.connect(gain1);
  osc2.connect(filter);
  filter.connect(gain2);

  connectToBus(ctx, gain1);
  connectToBus(ctx, gain2);

  osc1.start(now);
  osc1.stop(now + 0.03);
  osc2.start(now + 0.008);
  osc2.stop(now + 0.065);
}

/** 10. Gazzew Boba U4T */
function synthBobaU4T(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 210 : 260) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(32, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.32 : 0.2) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(isClick ? 460 : 540, now);
  filter.Q.setValueAtTime(4.0, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);

  osc.start(now);
  osc.stop(now + 0.06);
}

/** 11. Durock T1 */
function synthDurockT1(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime((isClick ? 360 : 420) * rand, now);
  osc1.frequency.exponentialRampToValueAtTime(150, now + 0.02);
  gain1.gain.setValueAtTime(0.22 * vol, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(175, now + 0.01);
  osc2.frequency.exponentialRampToValueAtTime(38, now + 0.045);
  gain2.gain.setValueAtTime(0.28 * vol, now + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  osc1.connect(gain1);
  osc2.connect(gain2);
  connectToBus(ctx, gain1);
  connectToBus(ctx, gain2);
  osc1.start(now);
  osc1.stop(now + 0.035);
  osc2.start(now + 0.01);
  osc2.stop(now + 0.06);
}

/** 12. Drop Halo True */
function synthHaloTrue(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 340 : 390) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.3 : 0.19) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 13. Zealios V2 67g */
function synthZealios(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime((isClick ? 460 : 520) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.03);

  gain.gain.setValueAtTime((isClick ? 0.25 : 0.16) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1300, now);
  filter.Q.setValueAtTime(3.5, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.045);
}

/** 14. Cherry MX Brown */
function synthMXBrown(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 260 : 310) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.035);

  gain.gain.setValueAtTime((isClick ? 0.28 : 0.17) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 15. Epomaker Wisteria */
function synthWisteria(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 270 : 320) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.32 : 0.2) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(640, now);
  filter.Q.setValueAtTime(3.5, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 16. Kailh Box Jade */
function synthBoxJade(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const oscClick = ctx.createOscillator();
  const gainClick = ctx.createGain();
  oscClick.type = 'triangle';
  oscClick.frequency.setValueAtTime((isClick ? 2200 : 2500) * rand, now);
  oscClick.frequency.exponentialRampToValueAtTime(450, now + 0.014);
  gainClick.gain.setValueAtTime(0.35 * vol, now);
  gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

  const oscThud = ctx.createOscillator();
  const gainThud = ctx.createGain();
  oscThud.type = 'sine';
  oscThud.frequency.setValueAtTime(210, now + 0.003);
  oscThud.frequency.exponentialRampToValueAtTime(35, now + 0.045);
  gainThud.gain.setValueAtTime(0.26 * vol, now + 0.003);
  gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  oscClick.connect(gainClick);
  oscThud.connect(gainThud);
  connectToBus(ctx, gainClick);
  connectToBus(ctx, gainThud);
  oscClick.start(now);
  oscClick.stop(now + 0.028);
  oscThud.start(now + 0.003);
  oscThud.stop(now + 0.06);
}

/** 17. Kailh Box Navy */
function synthBoxNavy(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const oscClick = ctx.createOscillator();
  const gainClick = ctx.createGain();
  oscClick.type = 'sawtooth';
  oscClick.frequency.setValueAtTime((isClick ? 1850 : 2100) * rand, now);
  oscClick.frequency.exponentialRampToValueAtTime(380, now + 0.018);
  gainClick.gain.setValueAtTime(0.34 * vol, now);
  gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.026);

  const oscThud = ctx.createOscillator();
  const gainThud = ctx.createGain();
  oscThud.type = 'triangle';
  oscThud.frequency.setValueAtTime(160, now + 0.004);
  oscThud.frequency.exponentialRampToValueAtTime(25, now + 0.055);
  gainThud.gain.setValueAtTime(0.32 * vol, now + 0.004);
  gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

  oscClick.connect(gainClick);
  oscThud.connect(gainThud);
  connectToBus(ctx, gainClick);
  connectToBus(ctx, gainThud);
  oscClick.start(now);
  oscClick.stop(now + 0.03);
  oscThud.start(now + 0.004);
  oscThud.stop(now + 0.07);
}

/** 18. Kailh Box White */
function synthBoxWhite(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 2800 : 3200) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(700, now + 0.015);

  gain.gain.setValueAtTime((isClick ? 0.28 : 0.18) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.03);
}

/** 19. Cherry MX Blue */
function synthMXBlue(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const oscClick = ctx.createOscillator();
  const gainClick = ctx.createGain();
  oscClick.type = 'square';
  oscClick.frequency.setValueAtTime((isClick ? 1600 : 1850) * rand, now);
  oscClick.frequency.exponentialRampToValueAtTime(500, now + 0.016);
  gainClick.gain.setValueAtTime(0.25 * vol, now);
  gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  const oscBottom = ctx.createOscillator();
  const gainBottom = ctx.createGain();
  oscBottom.type = 'triangle';
  oscBottom.frequency.setValueAtTime(240, now + 0.005);
  oscBottom.frequency.exponentialRampToValueAtTime(55, now + 0.045);
  gainBottom.gain.setValueAtTime(0.24 * vol, now + 0.005);
  gainBottom.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  oscClick.connect(gainClick);
  oscBottom.connect(gainBottom);
  connectToBus(ctx, gainClick);
  connectToBus(ctx, gainBottom);
  oscClick.start(now);
  oscClick.stop(now + 0.03);
  oscBottom.start(now + 0.005);
  oscBottom.stop(now + 0.06);
}

/** 20. Matias / ALPS Click */
function synthMatiasClick(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const oscChime = ctx.createOscillator();
  const gainChime = ctx.createGain();
  oscChime.type = 'square';
  oscChime.frequency.setValueAtTime((isClick ? 1750 : 1950) * rand, now);
  oscChime.frequency.exponentialRampToValueAtTime(600, now + 0.02);
  gainChime.gain.setValueAtTime(0.22 * vol, now);
  gainChime.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  const oscBody = ctx.createOscillator();
  const gainBody = ctx.createGain();
  oscBody.type = 'triangle';
  oscBody.frequency.setValueAtTime(270, now + 0.005);
  oscBody.frequency.exponentialRampToValueAtTime(45, now + 0.05);
  gainBody.gain.setValueAtTime(0.25 * vol, now + 0.005);
  gainBody.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1300, now);
  filter.Q.setValueAtTime(3.0, now);

  oscChime.connect(filter);
  filter.connect(gainChime);
  oscBody.connect(gainBody);
  connectToBus(ctx, gainChime);
  connectToBus(ctx, gainBody);

  oscChime.start(now);
  oscChime.stop(now + 0.04);
  oscBody.start(now + 0.005);
  oscBody.stop(now + 0.065);
}

/** 21. Akko CS Jelly Blue */
function synthJellyBlue(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 380 : 440) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(75, now + 0.035);

  gain.gain.setValueAtTime((isClick ? 0.3 : 0.18) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 22. Sanwa Arcade Microswitch */
function synthArcadeSanwa(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 850 : 980) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.022);

  gain.gain.setValueAtTime((isClick ? 0.38 : 0.24) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.035);
}

/** 23. Boba U4 Silent */
function synthBobaBlackU4(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 135 : 165) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(25, now + 0.03);

  gain.gain.setValueAtTime((isClick ? 0.18 : 0.12) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(320, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.04);
}

/** 24. Outemu Silent Peach */
function synthSilentPeach(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 190 : 230) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.025);

  gain.gain.setValueAtTime((isClick ? 0.16 : 0.1) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(450, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.038);
}

/** 25. Durock Silent Linear */
function synthSilentLinear(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 120 : 150) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(20, now + 0.025);

  gain.gain.setValueAtTime((isClick ? 0.15 : 0.09) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(280, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.035);
}

/** 26. ASMR Velvet Whisper */
function synthASMRWhisper(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 220 : 280) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.03);

  gain.gain.setValueAtTime((isClick ? 0.12 : 0.08) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(520, now);
  filter.Q.setValueAtTime(1.2, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 27. IBM Model M Buckling Spring */
function synthBucklingSpring(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const oscSpring = ctx.createOscillator();
  const gainSpring = ctx.createGain();
  oscSpring.type = 'sawtooth';
  oscSpring.frequency.setValueAtTime((isClick ? 2600 : 2900) * rand, now);
  oscSpring.frequency.exponentialRampToValueAtTime(950, now + 0.025);
  gainSpring.gain.setValueAtTime(0.28 * vol, now);
  gainSpring.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const oscBarrel = ctx.createOscillator();
  const gainBarrel = ctx.createGain();
  oscBarrel.type = 'triangle';
  oscBarrel.frequency.setValueAtTime(290, now + 0.004);
  oscBarrel.frequency.exponentialRampToValueAtTime(45, now + 0.06);
  gainBarrel.gain.setValueAtTime(0.32 * vol, now + 0.004);
  gainBarrel.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  oscSpring.connect(gainSpring);
  oscBarrel.connect(gainBarrel);
  connectToBus(ctx, gainSpring);
  connectToBus(ctx, gainBarrel);
  oscSpring.start(now);
  oscSpring.stop(now + 0.045);
  oscBarrel.start(now + 0.004);
  oscBarrel.stop(now + 0.075);
}

/** 28. IBM 5251 Beam Spring */
function synthBeamSpring(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const oscSolenoid = ctx.createOscillator();
  const gainSolenoid = ctx.createGain();
  oscSolenoid.type = 'sine';
  oscSolenoid.frequency.setValueAtTime((isClick ? 110 : 130) * rand, now);
  oscSolenoid.frequency.exponentialRampToValueAtTime(22, now + 0.05);
  gainSolenoid.gain.setValueAtTime(0.42 * vol, now);
  gainSolenoid.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

  const oscBeam = ctx.createOscillator();
  const gainBeam = ctx.createGain();
  oscBeam.type = 'triangle';
  oscBeam.frequency.setValueAtTime(2100, now);
  oscBeam.frequency.exponentialRampToValueAtTime(600, now + 0.015);
  gainBeam.gain.setValueAtTime(0.24 * vol, now);
  gainBeam.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

  oscSolenoid.connect(gainSolenoid);
  oscBeam.connect(gainBeam);
  connectToBus(ctx, gainSolenoid);
  connectToBus(ctx, gainBeam);
  oscSolenoid.start(now);
  oscSolenoid.stop(now + 0.07);
  oscBeam.start(now);
  oscBeam.stop(now + 0.03);
}

/** 29. Topre 45g */
function synthTopre(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 180 : 220) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(32, now + 0.045);

  gain.gain.setValueAtTime((isClick ? 0.35 : 0.24) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(550, now);
  filter.Q.setValueAtTime(3.8, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.06);
}

/** 30. Symbolics Space Cadet */
function synthSpaceCadet(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 290 : 350) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(38, now + 0.045);

  gain.gain.setValueAtTime((isClick ? 0.34 : 0.22) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(880, now);
  filter.Q.setValueAtTime(2.0, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.06);
}

/** 31. Wooting Lekker */
function synthWootingLekker(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 390 : 460) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

  gain.gain.setValueAtTime((isClick ? 0.28 : 0.17) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(190, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.045);
}

/** 32. Vintage Typewriter */
function synthTypewriter(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const oscMetal = ctx.createOscillator();
  const gainMetal = ctx.createGain();
  oscMetal.type = 'square';
  oscMetal.frequency.setValueAtTime((isClick ? 2200 : 2500) * rand, now);
  oscMetal.frequency.exponentialRampToValueAtTime(400, now + 0.015);
  gainMetal.gain.setValueAtTime(0.22 * vol, now);
  gainMetal.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

  const oscPlaten = ctx.createOscillator();
  const gainPlaten = ctx.createGain();
  oscPlaten.type = 'triangle';
  oscPlaten.frequency.setValueAtTime(320 * rand, now + 0.005);
  oscPlaten.frequency.exponentialRampToValueAtTime(60, now + 0.045);
  gainPlaten.gain.setValueAtTime(0.3 * vol, now + 0.005);
  gainPlaten.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  oscMetal.connect(gainMetal);
  oscPlaten.connect(gainPlaten);
  connectToBus(ctx, gainMetal);
  connectToBus(ctx, gainPlaten);
  oscMetal.start(now);
  oscMetal.stop(now + 0.025);
  oscPlaten.start(now + 0.005);
  oscPlaten.stop(now + 0.06);
}

/** 33. Curta Mechanical Gear */
function synthMechanicalCalculator(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 1400 : 1650) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.018);

  gain.gain.setValueAtTime((isClick ? 0.3 : 0.19) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2200, now);
  filter.Q.setValueAtTime(4.0, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.035);
}

/** 34. Organic Bubble Pebble */
function synthBubble(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 320 : 400) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(isClick ? 850 : 1050, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.34 : 0.22) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 35. Cyberpunk SciFi Pulse */
function synthSciFi(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime((isClick ? 1400 : 1700) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);

  gain.gain.setValueAtTime((isClick ? 0.22 : 0.14) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2400, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 36. Quantum Relay */
function synthQuantumRelay(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime((isClick ? 1600 : 1900) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(240, now + 0.025);

  gain.gain.setValueAtTime((isClick ? 0.25 : 0.15) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2800, now);
  filter.Q.setValueAtTime(3.5, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.04);
}

/** 37. Minimal Neo Glass */
function synthNeoGlass(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime((isClick ? 1800 : 2100) * rand, now);
  osc1.frequency.exponentialRampToValueAtTime(600, now + 0.03);
  gain1.gain.setValueAtTime(0.22 * vol, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(3200 * rand, now);
  osc2.frequency.exponentialRampToValueAtTime(1100, now + 0.02);
  gain2.gain.setValueAtTime(0.12 * vol, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  osc1.connect(gain1);
  osc2.connect(gain2);
  connectToBus(ctx, gain1);
  connectToBus(ctx, gain2);
  osc1.start(now);
  osc1.stop(now + 0.045);
  osc2.start(now);
  osc2.stop(now + 0.03);
}

/** 38. Vintage Cassette Deck */
function synthCassetteClick(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime((isClick ? 650 : 750) * rand, now);
  osc1.frequency.exponentialRampToValueAtTime(120, now + 0.018);
  gain1.gain.setValueAtTime(0.28 * vol, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(320 * rand, now + 0.006);
  osc2.frequency.exponentialRampToValueAtTime(60, now + 0.04);
  gain2.gain.setValueAtTime(0.24 * vol, now + 0.006);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  osc1.connect(gain1);
  osc2.connect(gain2);
  connectToBus(ctx, gain1);
  connectToBus(ctx, gain2);
  osc1.start(now);
  osc1.stop(now + 0.03);
  osc2.start(now + 0.006);
  osc2.stop(now + 0.05);
}

/** 39. Zen Bamboo Tap */
function synthBambooTap(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 420 : 490) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.035);

  gain.gain.setValueAtTime((isClick ? 0.35 : 0.22) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(850, now);
  filter.Q.setValueAtTime(5.0, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 40. Sub-Bass Haptic Thump */
function synthHapticSub(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = getPitchRandomizer();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 95 : 115) * rand, now);
  osc.frequency.exponentialRampToValueAtTime(25, now + 0.06);

  gain.gain.setValueAtTime((isClick ? 0.45 : 0.28) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.085);
}

// ══════════════════════════════════════════════════════════════════════
// PROCEDURAL AMBIENT SOUNDSCAPES
// ══════════════════════════════════════════════════════════════════════

let ambientNodes: {
  sources: AudioNode[];
  gain: GainNode;
  cleanup: () => void;
} | null = null;

export function stopAmbientSoundscape() {
  if (ambientNodes) {
    try {
      ambientNodes.cleanup();
    } catch {}
    ambientNodes = null;
  }
}

export function setAmbientVolume(vol: number) {
  if (ambientNodes && ambientNodes.gain) {
    ambientNodes.gain.gain.setTargetAtTime(vol * 0.18, (getAudioContext()?.currentTime || 0) + 0.01, 0.1);
  }
}

export function startAmbientSoundscape(type: AmbientType, volume: number = 0.35) {
  stopAmbientSoundscape();
  if (type === 'off') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume * 0.18, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const sources: AudioNode[] = [];

  if (type === 'lofi_rain') {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();
    sources.push(whiteNoise);
  } else if (type === 'server_drone') {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(60, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(120, ctx.currentTime);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.5, ctx.currentTime);

    osc1.connect(droneGain);
    osc2.connect(droneGain);
    droneGain.connect(masterGain);

    osc1.start();
    osc2.start();
    sources.push(osc1, osc2);
  } else if (type === 'binaural_alpha') {
    const merger = ctx.createChannelMerger(2);

    const oscL = ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(432, ctx.currentTime);

    const oscR = ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(442, ctx.currentTime);

    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(masterGain);

    oscL.start();
    oscR.start();
    sources.push(oscL, oscR);
  } else if (type === 'cozy_coffee') {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.05;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    noise.connect(filter);
    filter.connect(masterGain);
    noise.start();
    sources.push(noise);
  }

  ambientNodes = {
    sources,
    gain: masterGain,
    cleanup: () => {
      sources.forEach((s) => {
        try {
          if ('stop' in s && typeof (s as AudioScheduledSourceNode).stop === 'function') {
            (s as AudioScheduledSourceNode).stop();
          }
          s.disconnect();
        } catch {}
      });
      masterGain.disconnect();
    },
  };
}

// ══════════════════════════════════════════════════════════════════════
// PLAYBACK DISPATCHER (All 40 Switch Profiles)
// ══════════════════════════════════════════════════════════════════════

function executeSwitchSynth(
  ctx: AudioContext,
  profile: SoundProfile,
  isClick: boolean,
  isPreview: boolean,
  settings: ReturnType<typeof getExperienceSettings>
) {
  const now = ctx.currentTime;
  const vol = isPreview ? Math.max(settings.volume, 0.85) : settings.volume;
  if (vol <= 0) return;

  if (isClick) {
    triggerHaptic('light');
  }

  switch (profile) {
    case 'oil_king':
      synthOilKing(ctx, now, vol, isClick);
      break;
    case 'gateron_ink_black':
      synthInkBlack(ctx, now, vol, isClick);
      break;
    case 'creamsicle':
      synthCreamsicle(ctx, now, vol, isClick);
      break;
    case 'banana_split':
      synthBananaSplit(ctx, now, vol, isClick);
      break;
    case 'tangerine':
      synthTangerine(ctx, now, vol, isClick);
      break;
    case 'aqua_king':
      synthAquaKing(ctx, now, vol, isClick);
      break;
    case 'gateron_cj':
      synthGateronCJ(ctx, now, vol, isClick);
      break;
    case 'milky_yellow':
      synthMilkyYellow(ctx, now, vol, isClick);
      break;
    case 'holy_panda':
      synthHolyPanda(ctx, now, vol, isClick);
      break;
    case 'boba_u4t':
      synthBobaU4T(ctx, now, vol, isClick);
      break;
    case 'durock_t1':
      synthDurockT1(ctx, now, vol, isClick);
      break;
    case 'drop_halo_true':
      synthHaloTrue(ctx, now, vol, isClick);
      break;
    case 'zealios':
      synthZealios(ctx, now, vol, isClick);
      break;
    case 'mx_brown':
      synthMXBrown(ctx, now, vol, isClick);
      break;
    case 'epomaker_wisteria':
      synthWisteria(ctx, now, vol, isClick);
      break;
    case 'box_jade':
      synthBoxJade(ctx, now, vol, isClick);
      break;
    case 'box_navy':
      synthBoxNavy(ctx, now, vol, isClick);
      break;
    case 'box_white':
      synthBoxWhite(ctx, now, vol, isClick);
      break;
    case 'mx_blue':
      synthMXBlue(ctx, now, vol, isClick);
      break;
    case 'matias_click':
      synthMatiasClick(ctx, now, vol, isClick);
      break;
    case 'akko_jelly_black':
      synthJellyBlue(ctx, now, vol, isClick);
      break;
    case 'laser_clack':
      synthArcadeSanwa(ctx, now, vol, isClick);
      break;
    case 'boba_black_u4':
      synthBobaBlackU4(ctx, now, vol, isClick);
      break;
    case 'outemu_silent_peach':
      synthSilentPeach(ctx, now, vol, isClick);
      break;
    case 'silent_alpaca':
      synthSilentLinear(ctx, now, vol, isClick);
      break;
    case 'asmr_whisper':
      synthASMRWhisper(ctx, now, vol, isClick);
      break;
    case 'buckling_spring':
      synthBucklingSpring(ctx, now, vol, isClick);
      break;
    case 'beam_spring':
      synthBeamSpring(ctx, now, vol, isClick);
      break;
    case 'topre':
      synthTopre(ctx, now, vol, isClick);
      break;
    case 'space_cadet':
      synthSpaceCadet(ctx, now, vol, isClick);
      break;
    case 'wooting_lekker':
      synthWootingLekker(ctx, now, vol, isClick);
      break;
    case 'typewriter':
      synthTypewriter(ctx, now, vol, isClick);
      break;
    case 'mechanical_calculator':
      synthMechanicalCalculator(ctx, now, vol, isClick);
      break;
    case 'bubble':
      synthBubble(ctx, now, vol, isClick);
      break;
    case 'scifi':
      synthSciFi(ctx, now, vol, isClick);
      break;
    case 'quantum_relay':
      synthQuantumRelay(ctx, now, vol, isClick);
      break;
    case 'neo_glass':
      synthNeoGlass(ctx, now, vol, isClick);
      break;
    case 'cassette_click':
      synthCassetteClick(ctx, now, vol, isClick);
      break;
    case 'bamboo_tap':
      synthBambooTap(ctx, now, vol, isClick);
      break;
    case 'haptic_sub':
      synthHapticSub(ctx, now, vol, isClick);
      break;
  }
}

export function playSwitchSound(profile: SoundProfile, isClick = false, isPreview = false) {
  if (profile === 'mute') return;

  const settings = getExperienceSettings();
  if (!isPreview) {
    if (isClick && !settings.clickEnabled) return;
    if (!isClick && !settings.hoverEnabled) return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      executeSwitchSynth(ctx, profile, isClick, isPreview, settings);
    }).catch(() => {});
    return;
  }

  executeSwitchSynth(ctx, profile, isClick, isPreview, settings);
}

export function playHoverSound(overrideProfile?: SoundProfile) {
  const settings = getExperienceSettings();
  playSwitchSound(overrideProfile || settings.profile, false, false);
}

export function playClickSound(overrideProfile?: SoundProfile) {
  const settings = getExperienceSettings();
  playSwitchSound(overrideProfile || settings.profile, true, false);
}

export function previewSoundProfile(profile: SoundProfile) {
  playSwitchSound(profile, true, true);
}

const INTERACTIVE_SELECTOR = [
  'button',
  'a',
  'input',
  'textarea',
  'select',
  '.cursor-pointer',
  '[role="button"]',
  '[role="tab"]',
  '[role="link"]',
  '[data-thock="true"]',
  '.tool-card',
  '.glass-card',
  '.category-pill',
  'nav a',
  'header button',
  'header a',
  '.btn-primary',
  '.btn-secondary',
  'label',
  'summary',
  '[tabindex]',
  '.interactive',
].join(', ');

/** Attach global listener to trigger sound effects across all DOM interactions */
export function setupThockAudioListener(): () => void {
  if (typeof window === 'undefined') return () => {};

  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  const handlePointerOver = (e: MouseEvent) => {
    unlock();
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactive = target.closest(INTERACTIVE_SELECTOR);

    if (interactive && interactive !== lastHoveredElement) {
      lastHoveredElement = interactive;
      const now = performance.now();
      if (now - lastHoverSoundTime > 35) {
        lastHoverSoundTime = now;
        playHoverSound();
      }
    }
  };

  const handlePointerDown = (e: MouseEvent | TouchEvent) => {
    unlock();
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (interactive) {
      playClickSound();
    }
  };

  // Eager global unlockers across all potential user events
  const unlockEvents = [
    'pointerdown',
    'mousedown',
    'touchstart',
    'touchend',
    'keydown',
    'wheel',
    'scroll',
    'focus',
    'click',
    'mousemove',
    'pointermove',
  ];

  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, unlock, { passive: true, capture: true, once: true });
  });

  // Continuous hover & click interaction listeners
  window.addEventListener('mouseover', handlePointerOver, { passive: true });
  window.addEventListener('pointerover', handlePointerOver as any, { passive: true });
  window.addEventListener('mousedown', handlePointerDown, { passive: true });
  window.addEventListener('touchstart', handlePointerDown, { passive: true });

  return () => {
    unlockEvents.forEach((evt) => {
      window.removeEventListener(evt, unlock, { capture: true } as any);
    });
    window.removeEventListener('mouseover', handlePointerOver);
    window.removeEventListener('pointerover', handlePointerOver as any);
    window.removeEventListener('mousedown', handlePointerDown);
    window.removeEventListener('touchstart', handlePointerDown);
  };
}

// Eager auto-initialization at module load time
if (typeof window !== 'undefined') {
  setupThockAudioListener();
}
