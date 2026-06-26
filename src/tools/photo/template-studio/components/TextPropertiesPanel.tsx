import React from 'react';
import type { Layer, TextLayer, QRLayer, BarcodeLayer, ImageLayer } from '../types';
import { Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface PropertiesPanelProps {
  layer: Layer;
  onChange: (changes: Partial<Layer>) => void;
}

const FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Helvetica', 'Tahoma', 'Trebuchet MS', 'Impact'];
const WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold'];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ layer, onChange }) => {
  const isText = layer.type === 'text';
  const isQR = layer.type === 'qr';
  const isBarcode = layer.type === 'barcode';
  const isImage = layer.type === 'image';
  return (
    <div className="flex flex-col gap-4 text-xs">
      
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
    </div>
  );
};
