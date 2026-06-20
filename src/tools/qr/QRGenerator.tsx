import { triggerDownload, generateDesignedQR } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import { QrCode, Download, Palette, Sparkles, Check } from 'lucide-react';
import type { QRDesignSettings } from '../../utils/sharedHelpers';
import QRCode from 'qrcode';

// W3C Contrast helper functions
const getLuminance = (hex: string) => {
  const c = hex.replace('#', '');
  if (c.length !== 6) return 0;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrastRatio = (color1: string, color2: string) => {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
};

// Social presets definition
const SOCIAL_PRESETS = [
  { id: 'youtube', name: 'YouTube', color: '#FF0000', bg: '#0F0506', payload: 'https://youtube.com/@' },
  { id: 'twitter', name: 'X / Twitter', color: '#1DA1F2', bg: '#050B10', payload: 'https://x.com/' },
  { id: 'instagram', name: 'Instagram', color: '#E1306C', bg: '#0D0509', payload: 'https://instagram.com/' },
  { id: 'tiktok', name: 'TikTok', color: '#00F2EA', bg: '#030303', payload: 'https://tiktok.com/@' },
  { id: 'github', name: 'GitHub', color: '#FFFFFF', bg: '#0D1117', payload: 'https://github.com/' }
];

export const QRGeneratorTool = () => {
  const [text, setText] = useState('https://github.com/arronkianparejas');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<QRDesignSettings>({
    fgColor: '#4E8E5E',
    bgColor: '#0B0F19',
    margin: 2,
    errorCorrection: 'Q',
    format: 'png',
    logoPreset: 'none',
    theme: 'emerald',
    // Gradients
    fgType: 'solid',
    fgColorEnd: '#A3E635',
    gradientAngle: 45,
    // Shapes
    moduleStyle: 'square',
    eyeFrameStyle: 'square',
    eyeBallStyle: 'square',
    // Eye colors
    customEyeColor: false,
    eyeFrameColor: '#4E8E5E',
    eyeBallColor: '#4E8E5E',
    // Custom logo
    customLogoUrl: '',
    logoScale: 0.22,
    logoMask: true,
    // Label text
    labelText: '',
    labelColor: '#4E8E5E',
    labelFontSize: 14
  });

  const generate = async () => {
    try {
      const url = await generateDesignedQR(text || 'DomoDomo', settings);
      setQrUrl(url);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    generate();
  }, [text, settings]);

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSettings(prev => ({
            ...prev,
            customLogoUrl: event.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // SVG Export function
  const handleSVGDownload = () => {
    try {
      const qr = QRCode.create(text || 'DomoDomo', { errorCorrectionLevel: settings.errorCorrection });
      const modules = qr.modules;
      const N = modules.size;
      const margin = settings.margin;
      const paddedSize = N + 2 * margin;
      
      let paths = '';
      paths += `<rect width="100%" height="100%" fill="${settings.bgColor}" />\n`;
      
      let fillStyle = settings.fgColor;
      let defs = '';
      if (settings.fgType === 'linear' && settings.fgColorEnd) {
        const rad = ((settings.gradientAngle || 45) * Math.PI) / 180;
        const x1 = Math.round(50 - Math.cos(rad) * 50);
        const y1 = Math.round(50 - Math.sin(rad) * 50);
        const x2 = Math.round(50 + Math.cos(rad) * 50);
        const y2 = Math.round(50 + Math.sin(rad) * 50);
        defs = `<defs>
  <linearGradient id="svgGrad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
    <stop offset="0%" stop-color="${settings.fgColor}" />
    <stop offset="100%" stop-color="${settings.fgColorEnd}" />
  </linearGradient>
</defs>\n`;
        fillStyle = 'url(#svgGrad)';
      } else if (settings.fgType === 'radial' && settings.fgColorEnd) {
        defs = `<defs>
  <radialGradient id="svgGrad" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${settings.fgColor}" />
    <stop offset="100%" stop-color="${settings.fgColorEnd}" />
  </radialGradient>
</defs>\n`;
        fillStyle = 'url(#svgGrad)';
      }

      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (modules.get(r, c)) {
            const x = c + margin;
            const y = r + margin;
            if (settings.moduleStyle === 'circle') {
              paths += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.4" fill="${fillStyle}" />\n`;
            } else if (settings.moduleStyle === 'rounded') {
              paths += `<rect x="${x}" y="${y}" width="1" height="1" rx="0.25" ry="0.25" fill="${fillStyle}" />\n`;
            } else {
              paths += `<rect x="${x}" y="${y}" width="1" height="1" fill="${fillStyle}" />\n`;
            }
          }
        }
      }

      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${paddedSize} ${paddedSize}" width="500" height="500">
${defs}${paths}</svg>`;
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, 'qrcode.svg');
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export SVG', err);
    }
  };

  // Contrast checking
  const contrastRatio = getContrastRatio(settings.fgColor, settings.bgColor);
  const contrastText = contrastRatio.toFixed(1);
  const contrastStatus = contrastRatio >= 4.5 ? 'Good (W3C Pass)' : contrastRatio >= 3.0 ? 'Acceptable' : 'Low Contrast (Scanning may fail)';
  const contrastColor = contrastRatio >= 4.5 ? 'text-emerald-400 border-emerald-950/40 bg-emerald-950/10' : contrastRatio >= 3.0 ? 'text-amber-400 border-amber-950/40 bg-amber-950/10' : 'text-rose-400 border-rose-950/40 bg-rose-950/10';

  // Error correction visual density capacity tracker
  const eccPercentage = settings.errorCorrection === 'L' ? '7%' : settings.errorCorrection === 'M' ? '15%' : settings.errorCorrection === 'Q' ? '25%' : '30%';
  const eccBarWidth = settings.errorCorrection === 'L' ? 'w-1/4' : settings.errorCorrection === 'M' ? 'w-1/2' : settings.errorCorrection === 'Q' ? 'w-3/4' : 'w-full';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Settings Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-lg">
              <QrCode className="text-[#4E8E5E]" size={20} />
              <span>Advanced QR Code Generator</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">With Rich Customization</span>
          </div>

          {/* Social Quick Presets */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles size={13} className="text-[#4E8E5E]" />
              <span>Social & Brand Presets</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setText(preset.payload);
                    setSettings(prev => ({
                      ...prev,
                      fgColor: preset.color,
                      bgColor: preset.bg,
                      theme: 'custom',
                      fgType: 'solid'
                    }));
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white hover:border-[#4E8E5E] transition-all bg-slate-950/40"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Core Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold">QR Code Payload Link / Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter URL or text payload..."
              className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] h-20 resize-none outline-none leading-relaxed"
            />
          </div>

          {/* Layout Controls Accordion (Colors, Shapes, Branding, Labels) */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-4 text-left w-full">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Palette className="text-[#4E8E5E]" size={15} />
              <span className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Style Controls & Branding</span>
            </div>

            {/* Colors Section */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">1. Color & Gradients</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Fill Type</label>
                  <select
                    value={settings.fgType}
                    onChange={(e) => setSettings(prev => ({ ...prev, fgType: e.target.value as any }))}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="solid">Solid Color</option>
                    <option value="linear">Linear Gradient</option>
                    <option value="radial">Radial Gradient</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Primary Foreground</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
                    <input
                      type="color"
                      value={settings.fgColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, fgColor: e.target.value, theme: 'custom' }))}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{settings.fgColor}</span>
                  </div>
                </div>

                {settings.fgType !== 'solid' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">Gradient End</label>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
                      <input
                        type="color"
                        value={settings.fgColorEnd}
                        onChange={(e) => setSettings(prev => ({ ...prev, fgColorEnd: e.target.value }))}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{settings.fgColorEnd}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Background</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
                    <input
                      type="color"
                      value={settings.bgColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, bgColor: e.target.value, theme: 'custom' }))}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{settings.bgColor}</span>
                  </div>
                </div>
              </div>

              {settings.fgType === 'linear' && (
                <div className="flex flex-col gap-1.5 justify-center mt-1">
                  <div className="flex justify-between text-[9px] text-slate-550 font-bold uppercase">
                    <span>Gradient Angle</span>
                    <span className="text-[#4E8E5E]">{settings.gradientAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={settings.gradientAngle}
                    onChange={(e) => setSettings(prev => ({ ...prev, gradientAngle: Number(e.target.value) }))}
                    className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
                  />
                </div>
              )}
            </div>

            {/* Shapes Section */}
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">2. Pixel & Corner Shapes</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Pixel style</label>
                  <select
                    value={settings.moduleStyle}
                    onChange={(e) => setSettings(prev => ({ ...prev, moduleStyle: e.target.value as any }))}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="square">Squares (Standard)</option>
                    <option value="circle">Circles (Rounded Dots)</option>
                    <option value="rounded">Rounded Squares</option>
                    <option value="star">★ Stars</option>
                    <option value="liquid">Liquid Blobs</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Eye Frame style</label>
                  <select
                    value={settings.eyeFrameStyle}
                    onChange={(e) => setSettings(prev => ({ ...prev, eyeFrameStyle: e.target.value as any }))}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="square">Square</option>
                    <option value="circle">Circle</option>
                    <option value="rounded">Rounded Rect</option>
                    <option value="leaf">Leaf Shape</option>
                    <option value="shield">Shield</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Eye Ball style</label>
                  <select
                    value={settings.eyeBallStyle}
                    onChange={(e) => setSettings(prev => ({ ...prev, eyeBallStyle: e.target.value as any }))}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="square">Square</option>
                    <option value="circle">Circle</option>
                    <option value="diamond">Diamond</option>
                    <option value="star">★ Star</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Logo & Masking Section */}
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">3. Center Logo & Masking</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] text-slate-550 font-bold uppercase">Upload Custom Logo File (PNG/JPG)</label>
                  <div className="flex items-center gap-2">
                    <label className="btn-secondary cursor-pointer py-1.5 px-3 text-[11px] rounded-lg">
                      <span>Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {settings.customLogoUrl ? (
                      <span className="text-[10px] text-emerald-400 font-medium">Custom logo uploaded</span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Or use center emoji presets below</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Preset Emoji Icons</label>
                  <select
                    value={settings.logoPreset}
                    onChange={(e) => setSettings(prev => ({ ...prev, logoPreset: e.target.value as any, customLogoUrl: '' }))}
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

              {(settings.customLogoUrl || settings.logoPreset !== 'none') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="flex flex-col gap-1.5 justify-center">
                    <div className="flex justify-between text-[9px] text-slate-550 font-bold uppercase">
                      <span>Logo Scale</span>
                      <span className="text-[#4E8E5E]">{Math.round((settings.logoScale || 0.22) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.3"
                      step="0.02"
                      value={settings.logoScale}
                      onChange={(e) => setSettings(prev => ({ ...prev, logoScale: Number(e.target.value) }))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
                    />
                  </div>

                  <div className="flex items-center gap-2 select-none cursor-pointer mt-3">
                    <input
                      type="checkbox"
                      id="maskQrModules"
                      checked={settings.logoMask}
                      onChange={(e) => setSettings(prev => ({ ...prev, logoMask: e.target.checked }))}
                      className="w-3.5 h-3.5 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="maskQrModules" className="text-xs text-slate-400 cursor-pointer select-none">
                      Enable Logo Mask (cutout pixels behind logo)
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Labels & Padding Section */}
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">4. Labels & Quiet Zone Padding</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-550 font-bold uppercase">Label Text Below QR</label>
                  <input
                    type="text"
                    placeholder="e.g. Scan Me!"
                    value={settings.labelText}
                    onChange={(e) => setSettings(prev => ({ ...prev, labelText: e.target.value }))}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Label Color</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
                    <input
                      type="color"
                      value={settings.labelColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, labelColor: e.target.value }))}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[10px] text-slate-450 font-mono uppercase">{settings.labelColor}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 justify-center">
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                    <span>Quiet Zone</span>
                    <span className="text-[#4E8E5E]">{settings.margin}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={settings.margin}
                    onChange={(e) => setSettings(prev => ({ ...prev, margin: Number(e.target.value) }))}
                    className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output Preview & Export Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 items-center justify-between text-center min-h-[350px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3 w-full">QR Preview</h3>

          {qrUrl && (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Main Image Container */}
              <div 
                className="p-3 border border-slate-850 rounded-2xl flex items-center justify-center max-w-full"
                style={{ backgroundColor: settings.bgColor }}
              >
                <img src={qrUrl} className="w-44 h-44 rounded-xl border border-slate-800/20" alt="QR Preview" />
              </div>

              {/* Contrast Checker Output */}
              <div className={`w-full p-2.5 border rounded-xl text-left ${contrastColor} flex flex-col gap-0.5`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Contrast Ratio Check</span>
                  <span className="text-xs font-mono font-bold">{contrastText}:1</span>
                </div>
                <span className="text-[9px] font-medium leading-relaxed">{contrastStatus}</span>
              </div>

              {/* Error Correction Indicator */}
              <div className="w-full bg-slate-950/40 p-2.5 border border-slate-850 rounded-xl text-left flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-450">
                  <span>Data Recovery Margin</span>
                  <span className="text-emerald-400">{eccPercentage}</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-emerald-500 to-lime-400 ${eccBarWidth} transition-all`} />
                </div>
              </div>

              {/* Actions Grid */}
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : null}
                  <span>{copied ? 'Payload Copied!' : 'Copy Raw Payload'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => triggerDownload(qrUrl, `qrcode.${settings.format}`)} 
                    className="btn-primary py-2.5 text-[11px] font-bold flex items-center justify-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>Download {settings.format.toUpperCase()}</span>
                  </button>
                  <button 
                    onClick={handleSVGDownload} 
                    className="btn-primary py-2.5 text-[11px] font-bold flex items-center justify-center gap-1.5 bg-sky-950/40 hover:bg-sky-950/80 border-sky-900/60"
                  >
                    <Download size={13} />
                    <span>Download SVG</span>
                  </button>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Format</span>
                  <select
                    value={settings.format}
                    onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as any }))}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none"
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
