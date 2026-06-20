import { triggerDownload, generateDesignedQR } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import { Palette, Download, Sparkles, Layers } from 'lucide-react';
import type { QRDesignSettings } from '../../utils/sharedHelpers';
import QRCode from 'qrcode';

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

export const QRDesignerTool = () => {
  const [text, setText] = useState('https://github.com/arronkianparejas');
  const [qrUrl, setQrUrl] = useState('');
  
  // 10 Advanced Customization States
  const [settings, setSettings] = useState<QRDesignSettings>({
    fgColor: '#BC34FA', // Cyberpunk start
    bgColor: '#09090E',
    margin: 2,
    errorCorrection: 'Q',
    format: 'png',
    logoPreset: 'none',
    theme: 'custom',
    
    // Gradient Foreground
    fgType: 'linear',
    fgColorEnd: '#3482FA',
    gradientAngle: 135,

    // Gradient Background
    bgType: 'solid',
    bgColorEnd: '#050A14',
    
    // Pixel/Dot Styling
    moduleStyle: 'rounded',
    eyeFrameStyle: 'leaf',
    eyeBallStyle: 'diamond',

    // Eye custom colors
    customEyeColor: true,
    eyeFrameColor: '#BC34FA',
    eyeBallColor: '#3482FA',

    // Logo & Masking
    customLogoUrl: '',
    logoScale: 0.22,
    logoMask: true,

    // Text Label CTA
    labelText: 'SCAN ME',
    labelColor: '#3482FA',
    labelFontSize: 14,

    // Neon Glow FX
    glowEffect: true
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setSettings(prev => ({ ...prev, customLogoUrl: ev.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // SVG Export generator
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
  <linearGradient id="designerGrad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
    <stop offset="0%" stop-color="${settings.fgColor}" />
    <stop offset="100%" stop-color="${settings.fgColorEnd}" />
  </linearGradient>
</defs>\n`;
        fillStyle = 'url(#designerGrad)';
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
      triggerDownload(url, 'custom_designed.svg');
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const contrastRatio = getContrastRatio(settings.fgColor, settings.bgColor);
  const contrastStatus = contrastRatio >= 4.5 ? 'Good (W3C Pass)' : contrastRatio >= 3.0 ? 'Acceptable' : 'Low Contrast Warning';
  const contrastColor = contrastRatio >= 4.5 ? 'text-emerald-400 border-emerald-950/40 bg-emerald-950/10' : contrastRatio >= 3.0 ? 'text-amber-400 border-amber-950/40 bg-amber-950/10' : 'text-rose-400 border-rose-950/40 bg-rose-950/10';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Settings Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Palette className="text-[#4E8E5E]" size={22} />
              <span>Artistic QR Code Designer</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Advanced customizer</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold">QR Code Link / Text Payload</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter link or text..."
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
            />
          </div>

          {/* Designer Controls */}
          <div className="bg-slate-900/50 border border-slate-800/85 rounded-2xl p-4 flex flex-col gap-4 text-left w-full">
            
            {/* 1. Foreground Gradients */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-350 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#4E8E5E]" />
                <span>1. Foreground Paint & Angle</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Foreground style</label>
                  <select
                    value={settings.fgType}
                    onChange={(e) => setSettings(prev => ({ ...prev, fgType: e.target.value as any }))}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="solid">Solid Fill</option>
                    <option value="linear">Linear Gradient</option>
                    <option value="radial">Radial Gradient</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Start color</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
                    <input
                      type="color"
                      value={settings.fgColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, fgColor: e.target.value }))}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{settings.fgColor}</span>
                  </div>
                </div>

                {settings.fgType !== 'solid' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">End color</label>
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
              </div>

              {settings.fgType === 'linear' && (
                <div className="flex flex-col gap-1.5 justify-center mt-1">
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                    <span>Gradient Angle</span>
                    <span className="text-[#4E8E5E]">{settings.gradientAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={settings.gradientAngle}
                    onChange={(e) => setSettings(prev => ({ ...prev, gradientAngle: Number(e.target.value) }))}
                    className="w-full h-1 bg-slate-850 rounded accent-[#4E8E5E]"
                  />
                </div>
              )}
            </div>

            {/* 2. Background Gradients */}
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-350 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Layers size={12} className="text-[#4E8E5E]" />
                <span>2. Background Style & Gradients</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Background type</label>
                  <select
                    value={settings.bgType}
                    onChange={(e) => setSettings(prev => ({ ...prev, bgType: e.target.value as any }))}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="solid">Solid Color</option>
                    <option value="linear">Linear Gradient</option>
                    <option value="radial">Radial Gradient</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Primary Background</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
                    <input
                      type="color"
                      value={settings.bgColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, bgColor: e.target.value }))}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{settings.bgColor}</span>
                  </div>
                </div>

                {settings.bgType !== 'solid' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">Gradient End</label>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
                      <input
                        type="color"
                        value={settings.bgColorEnd}
                        onChange={(e) => setSettings(prev => ({ ...prev, bgColorEnd: e.target.value }))}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{settings.bgColorEnd}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Pixel & Eye Shapes */}
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-350 uppercase tracking-wider text-[10px]">3. Custom Corner & Module Shapes</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Pixel module style</label>
                  <select
                    value={settings.moduleStyle}
                    onChange={(e) => setSettings(prev => ({ ...prev, moduleStyle: e.target.value as any }))}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="square">Squares (Standard)</option>
                    <option value="circle">Circles (Rounded Dots)</option>
                    <option value="rounded">Rounded Squares</option>
                    <option value="star">★ Stars</option>
                    <option value="liquid">Liquid Connectors</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Eye Outer Frame style</label>
                  <select
                    value={settings.eyeFrameStyle}
                    onChange={(e) => setSettings(prev => ({ ...prev, eyeFrameStyle: e.target.value as any }))}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="square">Square</option>
                    <option value="circle">Circle</option>
                    <option value="rounded">Rounded Rect</option>
                    <option value="leaf">Leaf Frame</option>
                    <option value="shield">Shield</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Eye Inner Ball style</label>
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

            {/* 4. Eye Colors */}
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-350 uppercase tracking-wider text-[10px]">4. Eye Custom Colors</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5 justify-center">
                  <div className="flex items-center gap-2 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      id="customEyeColorToggle"
                      checked={settings.customEyeColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, customEyeColor: e.target.checked }))}
                      className="w-4 h-4 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="customEyeColorToggle" className="text-xs text-slate-450 cursor-pointer select-none">
                      Enable separate Eye colors
                    </label>
                  </div>
                </div>

                {settings.customEyeColor && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-500 font-bold uppercase">Eye Frame color</label>
                      <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
                        <input
                          type="color"
                          value={settings.eyeFrameColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, eyeFrameColor: e.target.value }))}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{settings.eyeFrameColor}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-500 font-bold uppercase">Eye Ball color</label>
                      <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
                        <input
                          type="color"
                          value={settings.eyeBallColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, eyeBallColor: e.target.value }))}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{settings.eyeBallColor}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 5. Custom Brand logo */}
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-350 uppercase tracking-wider text-[10px]">5. Brand Logo Overlay</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-550 font-bold uppercase">Upload Custom Logo File (PNG/JPG)</label>
                  <label className="btn-secondary cursor-pointer py-1.5 px-3 text-[11px] rounded-lg text-center w-full">
                    <span>Choose Image File</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex flex-col gap-1.5 justify-center">
                  {settings.customLogoUrl && (
                    <div className="flex items-center gap-2 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        id="maskLogoDesign"
                        checked={settings.logoMask}
                        onChange={(e) => setSettings(prev => ({ ...prev, logoMask: e.target.checked }))}
                        className="w-3.5 h-3.5 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="maskLogoDesign" className="text-xs text-slate-450 cursor-pointer select-none">
                        Mask modules behind logo
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 6. Outline CTA label & Glow */}
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-350 uppercase tracking-wider text-[10px]">6. Text CTA & Neon Glow Filter</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-550 font-bold uppercase">CTA label text</label>
                  <input
                    type="text"
                    value={settings.labelText}
                    onChange={(e) => setSettings(prev => ({ ...prev, labelText: e.target.value }))}
                    placeholder="e.g. SCAN ME"
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1 text-xs text-slate-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-550 font-bold uppercase">CTA Label Color</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
                    <input
                      type="color"
                      value={settings.labelColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, labelColor: e.target.value }))}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[9px] text-slate-400 font-mono uppercase">{settings.labelColor}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 justify-center pt-2">
                  <div className="flex items-center gap-2 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      id="glowEffectToggle"
                      checked={settings.glowEffect}
                      onChange={(e) => setSettings(prev => ({ ...prev, glowEffect: e.target.checked }))}
                      className="w-4 h-4 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="glowEffectToggle" className="text-xs text-slate-450 cursor-pointer select-none">
                      Enable Neon Glow Shadow
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 items-center justify-between text-center min-h-[350px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3 w-full">Artistic Preview</h3>

          {qrUrl && (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Contrast Checker Output */}
              <div className={`w-full p-2.5 border rounded-xl text-left ${contrastColor} flex flex-col gap-0.5`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Contrast Ratio Check</span>
                  <span className="text-xs font-mono font-bold">{contrastRatio.toFixed(1)}:1</span>
                </div>
                <span className="text-[9px] font-medium leading-relaxed">{contrastStatus}</span>
              </div>

              <div 
                className="p-3 border border-slate-850 rounded-2xl flex items-center justify-center max-w-full"
                style={{ backgroundColor: settings.bgColor }}
              >
                <img src={qrUrl} className="w-44 h-44 rounded-xl border border-slate-800/20" alt="Designed QR" />
              </div>

              {/* Download actions */}
              <div className="flex flex-col gap-2 w-full">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => triggerDownload(qrUrl, `custom_designer_qr.${settings.format}`)}
                    className="btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Download size={15} />
                    <span>Download {settings.format.toUpperCase()}</span>
                  </button>
                  <button
                    onClick={handleSVGDownload}
                    className="btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 bg-sky-950/40 hover:bg-sky-950/80 border-sky-900/60"
                  >
                    <Download size={15} />
                    <span>Download SVG</span>
                  </button>
                </div>

                <div className="flex justify-between items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Format</span>
                  <select
                    value={settings.format}
                    onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as any }))}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1 text-[11px] text-slate-350 focus:outline-none"
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
