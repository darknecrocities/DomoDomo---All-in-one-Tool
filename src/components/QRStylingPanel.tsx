import { Palette } from 'lucide-react';

export type QRErrorCorrection = 'L' | 'M' | 'Q' | 'H';
export type QRFormat = 'png' | 'jpeg' | 'webp';
export type QRLogoPreset = 'none' | 'star' | 'wifi' | 'mail' | 'phone' | 'link' | 'github';

export interface QRStyleSettings {
  fgColor: string;
  bgColor: string;
  margin: number;
  errorCorrection: QRErrorCorrection;
  size: number;
  format: QRFormat;
  logoPreset: QRLogoPreset;
  theme: string;
}

export const QR_THEMES = [
  { id: 'custom', name: 'Custom (Manual Colors)', fg: '#4E8E5E', bg: '#0B0F19' },
  { id: 'emerald', name: 'Emerald Mint', fg: '#4E8E5E', bg: '#0B0F19' },
  { id: 'amber', name: 'Amber Gold', fg: '#E29E2D', bg: '#111213' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', fg: '#BC34FA', bg: '#09090E' },
  { id: 'ocean', name: 'Ocean Breeze', fg: '#3482FA', bg: '#050A14' },
  { id: 'crimson', name: 'Crimson Fire', fg: '#FA344B', bg: '#0F0506' },
  { id: 'classic', name: 'Classic Monochrome', fg: '#000000', bg: '#ffffff' }
];

export const QRStylingPanel = ({
  settings,
  onChange
}: {
  settings: QRStyleSettings;
  onChange: (s: QRStyleSettings) => void;
}) => {
  const updateSetting = <K extends keyof QRStyleSettings>(key: K, val: QRStyleSettings[K]) => {
    const next = { ...settings, [key]: val };
    if (key === 'theme' && val !== 'custom') {
      const themeDef = QR_THEMES.find(t => t.id === val);
      if (themeDef) {
        next.fgColor = themeDef.fg;
        next.bgColor = themeDef.bg;
      }
    } else if (key === 'fgColor' || key === 'bgColor') {
      next.theme = 'custom';
    }
    onChange(next);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-4 text-left w-full">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 flex-row">
        <Palette className="text-[#4E8E5E]" size={15} />
        <span className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Style Controls & Branding</span>
      </div>

      {/* Theme selector */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Theme Presets</label>
        <select
          value={settings.theme}
          onChange={(e) => updateSetting('theme', e.target.value)}
          className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          {QR_THEMES.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Manual Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Foreground</label>
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
            <input
              type="color"
              value={settings.fgColor}
              onChange={(e) => updateSetting('fgColor', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
            <span className="text-[10px] text-slate-400 font-mono uppercase">{settings.fgColor}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Background</label>
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
            <input
              type="color"
              value={settings.bgColor}
              onChange={(e) => updateSetting('bgColor', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
            <span className="text-[10px] text-slate-400 font-mono uppercase">{settings.bgColor}</span>
          </div>
        </div>
      </div>

      {/* Margin and ECC */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5 justify-center">
          <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            <span>Quiet Zone</span>
            <span className="text-[#4E8E5E]">{settings.margin}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="8"
            value={settings.margin}
            onChange={(e) => updateSetting('margin', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E] mt-1"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Error Correction</label>
          <select
            value={settings.errorCorrection}
            onChange={(e) => updateSetting('errorCorrection', e.target.value as any)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
        </div>
      </div>

      {/* Export Format and Logo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Export Format</label>
          <select
            value={settings.format}
            onChange={(e) => updateSetting('format', e.target.value as any)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Center Logo</label>
          <select
            value={settings.logoPreset}
            onChange={(e) => updateSetting('logoPreset', e.target.value as any)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="none">None (Clean)</option>
            <option value="star">★ Star</option>
            <option value="wifi">📶 WiFi</option>
            <option value="mail">✉ Email</option>
            <option value="phone">📞 Phone</option>
            <option value="link">🔗 Link</option>
            <option value="github">🐙 GitHub</option>
          </select>
        </div>
      </div>
    </div>
  );
};
