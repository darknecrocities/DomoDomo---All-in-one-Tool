/**
 * DomoDomo Experience & Sound Effects (SFX) Settings Store
 * Unified client-side state management for mechanical keyboard switches,
 * procedural ambient focus soundscapes, and mobile tactile haptics.
 */

export type SoundProfile =
  // Linear (8)
  | 'oil_king'
  | 'gateron_ink_black'
  | 'creamsicle'
  | 'banana_split'
  | 'tangerine'
  | 'aqua_king'
  | 'gateron_cj'
  | 'milky_yellow'
  // Tactile (7)
  | 'holy_panda'
  | 'boba_u4t'
  | 'durock_t1'
  | 'drop_halo_true'
  | 'zealios'
  | 'mx_brown'
  | 'epomaker_wisteria'
  // Clicky (7)
  | 'box_jade'
  | 'box_navy'
  | 'box_white'
  | 'mx_blue'
  | 'matias_click'
  | 'akko_jelly_black'
  | 'laser_clack'
  // Silent (4)
  | 'boba_black_u4'
  | 'outemu_silent_peach'
  | 'silent_alpaca'
  | 'asmr_whisper'
  // Vintage & Hall Effect (7)
  | 'buckling_spring'
  | 'beam_spring'
  | 'topre'
  | 'space_cadet'
  | 'wooting_lekker'
  | 'typewriter'
  | 'mechanical_calculator'
  // Special & Sci-Fi (7)
  | 'bubble'
  | 'scifi'
  | 'quantum_relay'
  | 'neo_glass'
  | 'cassette_click'
  | 'bamboo_tap'
  | 'haptic_sub'
  // Mute
  | 'mute';

export type AmbientType = 'off' | 'lofi_rain' | 'cozy_coffee' | 'server_drone' | 'binaural_alpha';

export interface ExperienceSettings {
  // Mechanical Switch SFX
  profile: SoundProfile;
  volume: number; // 0.0 to 1.0
  gainBoost: number; // 1.0 to 2.5 (Volume level amplifier if sound is too weak)
  hoverEnabled: boolean;
  clickEnabled: boolean;
  typingEnabled: boolean;
  pitchVariance: boolean;
  spatialAudioEnabled: boolean; // 3D Spatial Audio Stereo Panning based on screen/key coordinates

  // 2D Custom Acoustic Matrix Coordinates Persistence
  customMatrixEnabled: boolean;
  matrixCoords: { x: number; y: number };

  // Ambient Focus Soundscapes
  ambientType: AmbientType;
  ambientVolume: number; // 0.0 to 1.0

  // Mobile Tactile Haptics
  hapticsEnabled: boolean;
}

export const DEFAULT_EXPERIENCE_SETTINGS: ExperienceSettings = {
  profile: 'oil_king',
  volume: 0.85,
  gainBoost: 1.25,
  hoverEnabled: true,
  clickEnabled: true,
  typingEnabled: true,
  pitchVariance: true,
  spatialAudioEnabled: true,

  customMatrixEnabled: false,
  matrixCoords: { x: 12, y: 92 },

  ambientType: 'off',
  ambientVolume: 0.35,

  hapticsEnabled: true,
};

const STORAGE_KEY = 'domodomo_sfx_experience_settings_v1';
let currentSettings: ExperienceSettings = loadExperienceSettings();

export function loadExperienceSettings(): ExperienceSettings {
  if (typeof window === 'undefined') return DEFAULT_EXPERIENCE_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_EXPERIENCE_SETTINGS, ...parsed };
    }
  } catch {}
  return DEFAULT_EXPERIENCE_SETTINGS;
}

export function saveExperienceSettings(settings: Partial<ExperienceSettings>) {
  currentSettings = { ...currentSettings, ...settings };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
      window.dispatchEvent(
        new CustomEvent('domodomo_sfx_update', { detail: currentSettings })
      );
    } catch {}
  }
}

export function getExperienceSettings(): ExperienceSettings {
  return { ...currentSettings };
}

/** Trigger mobile web haptic feedback vibration if supported by device */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') {
  if (typeof window === 'undefined' || !currentSettings.hapticsEnabled) return;
  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      if (type === 'selection') navigator.vibrate(6);
      else if (type === 'light') navigator.vibrate(10);
      else if (type === 'medium') navigator.vibrate(18);
      else if (type === 'heavy') navigator.vibrate([24, 14, 24]);
    }
  } catch {}
}
