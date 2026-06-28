import React from 'react';
import type { Layer, TextLayer, QRLayer, BarcodeLayer, ImageLayer, ShapeLayer } from '../types';
import { Italic, Underline, AlignLeft, AlignCenter, AlignRight, Cpu, Wand2, Globe, Sparkles, Loader2 } from 'lucide-react';
import { aiService } from '../../../../utils/aiService';

interface PropertiesPanelProps {
  layer: Layer;
  onChange: (changes: Partial<Layer>) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Helvetica', 'Tahoma', 'Trebuchet MS', 'Impact'];
const WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold'];

const OllamaAssistant: React.FC<{ layer: TextLayer; onChange: (changes: Partial<Layer>) => void }> = ({ layer, onChange }) => {
  const [ollamaStatus, setOllamaStatus] = React.useState<'checking' | 'online' | 'offline'>('checking');
  const [availableModels, setAvailableModels] = React.useState<string[]>([]);
  const [selectedModel, setSelectedModel] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [translationLang, setTranslationLang] = React.useState('Spanish');
  const [selectedTone, setSelectedTone] = React.useState('Professional');

  React.useEffect(() => {
    const checkOllama = async () => {
      const info = await aiService.checkOllama();
      if (info.status) {
        setOllamaStatus('online');
        setAvailableModels(info.models);
        const saved = aiService.getSelectedOllamaModel();
        if (saved && info.models.includes(saved)) {
          setSelectedModel(saved);
        } else if (info.models.length > 0) {
          setSelectedModel(info.models[0]);
          aiService.setSelectedOllamaModel(info.models[0]);
        }
      } else {
        setOllamaStatus('offline');
      }
    };
    checkOllama();
  }, []);

  const handleAIAction = async (actionType: 'grammar' | 'translate' | 'tone') => {
    setIsLoading(true);
    try {
      let prompt = '';
      if (actionType === 'grammar') {
        prompt = `Fix spelling, grammar, and formatting errors in the following text. Do not rewrite, only clean it up. Return ONLY the corrected text, no extra talk:\n\nText: "${layer.text}"`;
      } else if (actionType === 'translate') {
        prompt = `Translate the following text into ${translationLang}. Keep it concise and return ONLY the translated text, no extra talk:\n\nText: "${layer.text}"`;
      } else if (actionType === 'tone') {
        prompt = `Rewrite the following text to sound extremely ${selectedTone}. Return ONLY the rewritten text, no extra talk:\n\nText: "${layer.text}"`;
      }

      const response = await aiService.generateText(prompt, 300, undefined, selectedModel || undefined);
      if (response && response.trim()) {
        onChange({ text: response.trim() } as any);
      }
    } catch (e: any) {
      alert(`AI Execution failed: ${e.message || e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 mt-4 border-t border-[#2A2D30] pt-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider flex items-center gap-1">
          <Cpu size={12} className="text-[#3C6B4D]" /> Ollama Assistant
        </span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${ollamaStatus === 'online' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : ollamaStatus === 'offline' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
          {ollamaStatus}
        </span>
      </div>

      {ollamaStatus === 'offline' && (
        <div className="bg-rose-950/15 border border-rose-900/30 text-rose-300 p-2.5 rounded-lg text-[10px] space-y-1">
          <p className="font-bold">Ollama Offline</p>
          <p className="text-[#72706C]">Start your local Ollama instance (port 11434) to unlock direct offline AI translation & correction.</p>
          <p className="text-teal-400 mt-1 font-semibold">💡 Recommended Model: <code className="bg-slate-900 px-1 rounded text-teal-400">llama3.2:1b</code> or <code className="bg-slate-900 px-1 rounded text-teal-400">phi3</code></p>
        </div>
      )}

      {ollamaStatus === 'online' && (
        <div className="space-y-2 text-left">
          {availableModels.length > 0 ? (
            <div>
              <label className="text-[9px] text-[#72706C] font-bold block mb-1">LOCAL MODEL</label>
              <select 
                value={selectedModel} 
                onChange={(e) => { setSelectedModel(e.target.value); aiService.setSelectedOllamaModel(e.target.value); }} 
                className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-1 text-[#ECEBE9] outline-none text-[11px]"
              >
                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          ) : (
            <p className="text-[10px] text-amber-400">⚠️ No Ollama models found. Pull a model (e.g. `llama3.2:3b`) first.</p>
          )}

          <div className="h-px bg-[#2A2D30] my-1" />

          {/* Grammar Check */}
          <button 
            disabled={isLoading || !layer.text}
            onClick={() => handleAIAction('grammar')}
            className="w-full py-1.5 bg-[#2A2D30] hover:bg-[#3A3D40] text-white rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} className="text-teal-400" />}
            <span>Fix OCR / Grammar</span>
          </button>

          {/* Translation */}
          <div className="flex gap-1.5 items-center mt-1">
            <select 
              value={translationLang} 
              onChange={e => setTranslationLang(e.target.value)} 
              className="bg-[#18191B] border border-[#2A2D30] rounded p-1 text-[#ECEBE9] text-[10px] flex-1 outline-none"
            >
              {['Spanish', 'French', 'German', 'Italian', 'Japanese', 'Chinese', 'Tagalog', 'Portuguese'].map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <button 
              disabled={isLoading || !layer.text}
              onClick={() => handleAIAction('translate')}
              className="px-2.5 py-1 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded text-[10px] font-bold flex items-center gap-0.5 transition-all"
            >
              <Globe size={10} /> Translate
            </button>
          </div>

          {/* Tone Rewrite */}
          <div className="flex gap-1.5 items-center mt-1">
            <select 
              value={selectedTone} 
              onChange={e => setSelectedTone(e.target.value)} 
              className="bg-[#18191B] border border-[#2A2D30] rounded p-1 text-[#ECEBE9] text-[10px] flex-1 outline-none"
            >
              {['Professional', 'Casual', 'Urgent / Important', 'Marketing Pitch', 'Short Slogan'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button 
              disabled={isLoading || !layer.text}
              onClick={() => handleAIAction('tone')}
              className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded text-[10px] font-bold flex items-center gap-0.5 transition-all"
            >
              <Wand2 size={10} /> Rewrite
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ layer, onChange, canvasWidth, canvasHeight }) => {
  const isText = layer.type === 'text';
  const isQR = layer.type === 'qr';
  const isBarcode = layer.type === 'barcode';
  const isImage = layer.type === 'image';
  const isShape = layer.type === 'shape';
  return (
    <div className="flex flex-col gap-4 text-xs text-left">
      
      {/* Canvas Alignments */}
      <div>
        <label className="text-[10px] text-[#72706C] font-bold block mb-1">Canvas Alignment</label>
        <div className="grid grid-cols-6 gap-1 bg-[#111213] border border-[#2A2D30] rounded p-1">
          <button
            onClick={() => onChange({ x: 0 })}
            className="p-1 hover:bg-[#2A2D30] rounded text-[9px] font-semibold text-[#A3A09B] hover:text-[#ECEBE9] text-center"
            title="Align Left"
          >
            Left
          </button>
          <button
            onClick={() => onChange({ x: Math.max(0, (canvasWidth - layer.width) / 2) })}
            className="p-1 hover:bg-[#2A2D30] rounded text-[9px] font-semibold text-[#A3A09B] hover:text-[#ECEBE9] text-center"
            title="Align Horizontal Center"
          >
            H-Ctr
          </button>
          <button
            onClick={() => onChange({ x: Math.max(0, canvasWidth - layer.width) })}
            className="p-1 hover:bg-[#2A2D30] rounded text-[9px] font-semibold text-[#A3A09B] hover:text-[#ECEBE9] text-center"
            title="Align Right"
          >
            Right
          </button>
          <button
            onClick={() => onChange({ y: 0 })}
            className="p-1 hover:bg-[#2A2D30] rounded text-[9px] font-semibold text-[#A3A09B] hover:text-[#ECEBE9] text-center"
            title="Align Top"
          >
            Top
          </button>
          <button
            onClick={() => onChange({ y: Math.max(0, (canvasHeight - layer.height) / 2) })}
            className="p-1 hover:bg-[#2A2D30] rounded text-[9px] font-semibold text-[#A3A09B] hover:text-[#ECEBE9] text-center"
            title="Align Vertical Center"
          >
            V-Ctr
          </button>
          <button
            onClick={() => onChange({ y: Math.max(0, canvasHeight - layer.height) })}
            className="p-1 hover:bg-[#2A2D30] rounded text-[9px] font-semibold text-[#A3A09B] hover:text-[#ECEBE9] text-center"
            title="Align Bottom"
          >
            Btm
          </button>
        </div>
      </div>

      {/* Basic Text Inputs */}
      <div className="space-y-2">
        <div>
          <label className="text-[10px] text-[#72706C] font-bold block mb-1">LAYER NAME</label>
          <input type="text" value={layer.name} onChange={e => onChange({ name: e.target.value })} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-2 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]" />
        </div>
        <div>
          <label className="text-[10px] text-[#72706C] font-bold block mb-1 text-[#E29E2D]">VARIABLE (e.g. {'{{name}}'})</label>
          <input type="text" value={(layer as any).variableName || ''} onChange={e => onChange({ variableName: e.target.value } as any)} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-2 text-[#ECEBE9] outline-none focus:border-[#E29E2D]" />
        </div>
        
        {isText && (
          <div>
            <label className="text-[10px] text-[#72706C] font-bold block mb-1">DEFAULT TEXT</label>
            <input type="text" value={(layer as TextLayer).text} onChange={e => onChange({ text: e.target.value } as any)} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-2 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]" />
          </div>
        )}

        {(isQR || isBarcode) && (
          <div>
            <label className="text-[10px] text-[#72706C] font-bold block mb-1">DEFAULT DATA</label>
            <input type="text" value={(layer as any).text} onChange={e => onChange({ text: e.target.value } as any)} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-2 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]" />
          </div>
        )}

        {isImage && (
          <div>
            <label className="text-[10px] text-[#72706C] font-bold block mb-1">DEFAULT IMAGE URL</label>
            <input type="text" value={(layer as ImageLayer).src || ''} onChange={e => onChange({ src: e.target.value } as any)} placeholder="https://..." className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-2 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]" />
          </div>
        )}
      </div>

      <div className="h-px bg-[#2A2D30] w-full" />

      {isText && (
        <>
          {/* Typography */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#72706C] font-bold block mb-1">FONT FAMILY</label>
              <select value={layer.fontFamily} onChange={e => onChange({ fontFamily: e.target.value })} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-1.5 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]">
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#72706C] font-bold block mb-1">SIZE</label>
              <input type="number" value={layer.fontSize} onChange={e => onChange({ fontSize: Number(e.target.value) })} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-1.5 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]" />
            </div>
          </div>

          {/* Font Styling Row */}
          <div className="flex gap-1 bg-[#18191B] border border-[#2A2D30] rounded p-1">
            <select value={layer.fontWeight} onChange={e => onChange({ fontWeight: e.target.value as any })} className="bg-transparent border-none text-[#ECEBE9] outline-none flex-1 text-xs px-1">
              {WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <div className="w-px bg-[#2A2D30] mx-1" />
            <button onClick={() => onChange({ fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic' })} className={`p-1.5 rounded ${layer.fontStyle === 'italic' ? 'bg-[#3C6B4D] text-white' : 'text-[#72706C] hover:text-[#ECEBE9]'}`}>
              <Italic size={14} />
            </button>
            <button onClick={() => onChange({ textDecoration: layer.textDecoration === 'underline' ? 'none' : 'underline' })} className={`p-1.5 rounded ${layer.textDecoration === 'underline' ? 'bg-[#3C6B4D] text-white' : 'text-[#72706C] hover:text-[#ECEBE9]'}`}>
              <Underline size={14} />
            </button>
            <button onClick={() => onChange({ textTransform: layer.textTransform === 'uppercase' ? 'none' : 'uppercase' })} className={`p-1.5 rounded font-bold text-[10px] ${layer.textTransform === 'uppercase' ? 'bg-[#3C6B4D] text-white' : 'text-[#72706C] hover:text-[#ECEBE9]'}`}>
              TT
            </button>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 bg-[#18191B] border border-[#2A2D30] rounded p-1 justify-between">
            {(['left', 'center', 'right'] as const).map(align => (
              <button
                key={align}
                onClick={() => onChange({ align })}
                className={`flex-1 flex justify-center p-1.5 rounded ${layer.align === align ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C] hover:text-[#ECEBE9]'}`}
              >
                {align === 'left' && <AlignLeft size={14} />}
                {align === 'center' && <AlignCenter size={14} />}
                {align === 'right' && <AlignRight size={14} />}
              </button>
            ))}
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#72706C] font-bold block mb-1">TEXT COLOR</label>
              <input type="color" value={layer.fill} onChange={e => onChange({ fill: e.target.value })} className="w-full h-8 bg-[#18191B] border border-[#2A2D30] rounded cursor-pointer" />
            </div>
            <div>
              <label className="text-[10px] text-[#72706C] font-bold block mb-1 flex justify-between">
                <span>BG COLOR</span>
                <button onClick={() => onChange({ backgroundColor: layer.backgroundColor ? null : '#ffffff' })} className="text-[8px] text-[#3C6B4D] hover:underline">
                  {layer.backgroundColor ? 'Clear' : 'Add'}
                </button>
              </label>
              {layer.backgroundColor !== null ? (
                <input type="color" value={layer.backgroundColor} onChange={e => onChange({ backgroundColor: e.target.value })} className="w-full h-8 bg-[#18191B] border border-[#2A2D30] rounded cursor-pointer" />
              ) : (
                <div className="w-full h-8 bg-[#18191B] border border-[#2A2D30] border-dashed rounded flex items-center justify-center text-[10px] text-[#72706C]">None</div>
              )}
            </div>
          </div>

          <div className="h-px bg-[#2A2D30] w-full" />

          {/* Spacing */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#72706C] font-bold block mb-1">LETTER SPACING</label>
              <input type="number" step="0.5" value={layer.letterSpacing || 0} onChange={e => onChange({ letterSpacing: Number(e.target.value) })} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-1.5 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]" />
            </div>
            <div>
              <label className="text-[10px] text-[#72706C] font-bold block mb-1">LINE HEIGHT</label>
              <input type="number" step="0.1" value={layer.lineHeight || 1} onChange={e => onChange({ lineHeight: Number(e.target.value) })} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-1.5 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]" />
            </div>
          </div>
        </>
      )}

      {isQR && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[#72706C] font-bold block mb-1">QR COLOR</label>
            <input type="color" value={(layer as QRLayer).fgColor} onChange={e => onChange({ fgColor: e.target.value } as any)} className="w-full h-8 bg-[#18191B] border border-[#2A2D30] rounded cursor-pointer" />
          </div>
          <div>
            <label className="text-[10px] text-[#72706C] font-bold block mb-1">BACKGROUND</label>
            <input type="color" value={(layer as QRLayer).bgColor} onChange={e => onChange({ bgColor: e.target.value } as any)} className="w-full h-8 bg-[#18191B] border border-[#2A2D30] rounded cursor-pointer" />
          </div>
        </div>
      )}

      {isBarcode && (
        <>
          <div>
            <label className="text-[10px] text-[#72706C] font-bold block mb-1">FORMAT</label>
            <select value={(layer as BarcodeLayer).format} onChange={e => onChange({ format: e.target.value } as any)} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-1.5 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]">
              {['CODE128', 'EAN13', 'UPC'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-[10px] text-[#72706C] font-bold block mb-1">LINE COLOR</label>
              <input type="color" value={(layer as BarcodeLayer).lineColor} onChange={e => onChange({ lineColor: e.target.value } as any)} className="w-full h-8 bg-[#18191B] border border-[#2A2D30] rounded cursor-pointer" />
            </div>
            <div>
              <label className="text-[10px] text-[#72706C] font-bold block mb-1">BACKGROUND</label>
              <input type="color" value={(layer as BarcodeLayer).bgColor} onChange={e => onChange({ bgColor: e.target.value } as any)} className="w-full h-8 bg-[#18191B] border border-[#2A2D30] rounded cursor-pointer" />
            </div>
          </div>
        </>
      )}

      {isShape && (
        <>
          <div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
              <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Use Shape Gradient</label>
              <input
                type="checkbox"
                checked={(layer as ShapeLayer).gradientEnabled || false}
                onChange={e => onChange({ gradientEnabled: e.target.checked } as any)}
                className="accent-[#3C6B4D]"
              />
            </div>

            {!(layer as ShapeLayer).gradientEnabled ? (
              <div>
                <label className="text-[10px] text-[#72706C] font-bold block mb-1">FILL COLOR</label>
                <input type="color" value={(layer as ShapeLayer).fill || '#3C6B4D'} onChange={e => onChange({ fill: e.target.value } as any)} className="w-full h-8 bg-[#18191B] border border-[#2A2D30] rounded cursor-pointer" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-[#72706C] font-bold block mb-1">GRADIENT COLOR 1</label>
                    <input type="color" value={(layer as ShapeLayer).gradientColor1 || '#3C6B4D'} onChange={e => onChange({ gradientColor1: e.target.value } as any)} className="w-full h-8 bg-[#18191B] border border-[#2A2D30] rounded cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-[9px] text-[#72706C] font-bold block mb-1">GRADIENT COLOR 2</label>
                    <input type="color" value={(layer as ShapeLayer).gradientColor2 || '#1e3825'} onChange={e => onChange({ gradientColor2: e.target.value } as any)} className="w-full h-8 bg-[#18191B] border border-[#2A2D30] rounded cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-[#72706C] font-bold block mb-1 flex justify-between">
                    <span>GRADIENT ANGLE (°)</span>
                    <span>{(layer as ShapeLayer).gradientAngle ?? 90}°</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={(layer as ShapeLayer).gradientAngle ?? 90}
                    onChange={e => onChange({ gradientAngle: Number(e.target.value) } as any)}
                    className="w-full accent-[#3C6B4D]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-[10px] text-[#72706C] font-bold block mb-1 flex justify-between">
                <span>BORDER COLOR</span>
                <button onClick={() => onChange({ stroke: (layer as ShapeLayer).stroke ? null : '#ffffff' } as any)} className="text-[8px] text-[#3C6B4D] hover:underline">
                  {(layer as ShapeLayer).stroke ? 'Clear' : 'Add'}
                </button>
              </label>
              {(layer as ShapeLayer).stroke !== null && (layer as ShapeLayer).stroke !== undefined ? (
                <input type="color" value={(layer as ShapeLayer).stroke || '#000000'} onChange={e => onChange({ stroke: e.target.value } as any)} className="w-full h-8 bg-[#18191B] border border-[#2A2D30] rounded cursor-pointer" />
              ) : (
                <div className="w-full h-8 bg-[#18191B] border border-[#2A2D30] border-dashed rounded flex items-center justify-center text-[10px] text-[#72706C]">None</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#72706C] font-bold block mb-1">BORDER WIDTH</label>
              <input type="number" min="0" value={(layer as ShapeLayer).strokeWidth || 0} onChange={e => onChange({ strokeWidth: Number(e.target.value) } as any)} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-1.5 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]" />
            </div>

            {(layer as ShapeLayer).shapeType === 'rect' && (
              <div>
                <label className="text-[10px] text-[#72706C] font-bold block mb-1">CORNER RADIUS</label>
                <input type="number" min="0" value={(layer as ShapeLayer).cornerRadius || 0} onChange={e => onChange({ cornerRadius: Number(e.target.value) } as any)} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-1.5 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]" />
              </div>
            )}

            {(layer as ShapeLayer).shapeType === 'star' && (
              <div>
                <label className="text-[10px] text-[#72706C] font-bold block mb-1">STAR POINTS</label>
                <input type="number" min="3" max="20" value={(layer as ShapeLayer).numPoints || 5} onChange={e => onChange({ numPoints: Number(e.target.value) } as any)} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-1.5 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]" />
              </div>
            )}
          </div>
        </>
      )}

      {/* Opacity & Rotation */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-[#72706C] font-bold block mb-1 flex justify-between">
            <span>OPACITY</span><span>{Math.round(layer.opacity * 100)}%</span>
          </label>
          <input type="range" min="0" max="1" step="0.05" value={layer.opacity} onChange={e => onChange({ opacity: Number(e.target.value) })} className="w-full accent-[#3C6B4D]" />
        </div>
        <div>
          <label className="text-[10px] text-[#72706C] font-bold block mb-1">ROTATION (°)</label>
          <input type="number" value={Math.round(layer.rotation)} onChange={e => onChange({ rotation: Number(e.target.value) })} className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-1.5 text-[#ECEBE9] outline-none focus:border-[#3C6B4D]" />
        </div>
      </div>
      
      {/* Advanced Effects (Stroke & Shadow) */}
      {isText && (
        <>
          <div className="h-px bg-[#2A2D30] w-full" />
          <div>
            <label className="text-[10px] text-[#72706C] font-bold block mb-2">STROKE & SHADOW</label>
            <div className="space-y-3 pl-2 border-l border-[#2A2D30]">
              <div className="flex items-center gap-2">
                <input type="color" value={(layer as TextLayer).stroke || '#000000'} onChange={e => onChange({ stroke: e.target.value } as any)} className="w-6 h-6 bg-transparent border border-[#2A2D30] rounded cursor-pointer" />
                <span className="text-[10px]">Stroke Size</span>
                <input type="number" min="0" value={(layer as TextLayer).strokeWidth || 0} onChange={e => onChange({ strokeWidth: Number(e.target.value), stroke: (layer as TextLayer).stroke || '#000000' } as any)} className="w-16 bg-[#18191B] border border-[#2A2D30] rounded p-1 text-[#ECEBE9] outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="color" value={(layer as TextLayer).shadowColor || '#000000'} onChange={e => onChange({ shadowColor: e.target.value } as any)} className="w-6 h-6 bg-transparent border border-[#2A2D30] rounded cursor-pointer" />
                <span className="text-[10px]">Shadow Blur</span>
                <input type="number" min="0" value={(layer as TextLayer).shadowBlur || 0} onChange={e => onChange({ shadowBlur: Number(e.target.value), shadowColor: (layer as TextLayer).shadowColor || '#000000', shadowOffsetX: 2, shadowOffsetY: 2 } as any)} className="w-16 bg-[#18191B] border border-[#2A2D30] rounded p-1 text-[#ECEBE9] outline-none" />
              </div>
            </div>
          </div>
        </>
      )}

      {isText && (
        <OllamaAssistant layer={layer as TextLayer} onChange={onChange} />
      )}
    </div>
  );
};
