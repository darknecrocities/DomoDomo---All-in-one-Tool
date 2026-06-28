import React from 'react';
import type { Layer } from '../types';
import { Eye, EyeOff, Lock, Unlock, Trash2, ArrowUp, ArrowDown, Type, Image as ImageIcon, QrCode, Barcode, Copy } from 'lucide-react';

interface LayerPanelProps {
  layers: Layer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Layer>) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onDuplicate?: (id: string) => void;
}

const getLayerIcon = (type: Layer['type']) => {
  switch (type) {
    case 'text': return <Type size={14} />;
    case 'image': return <ImageIcon size={14} />;
    case 'qr': return <QrCode size={14} />;
    case 'barcode': return <Barcode size={14} />;
    case 'shape':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        </svg>
      );
  }
};

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onReorder,
  onDuplicate
}) => {
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex); // visually show top layers first

  return (
    <div className="flex flex-col gap-2 h-full">
      <h3 className="text-xs font-bold text-[#A3A09B] uppercase tracking-wider mb-2">Layers</h3>
      
      {sortedLayers.length === 0 ? (
        <div className="text-center p-4 border border-dashed border-[#2A2D30] rounded-xl text-[#72706C] text-xs">
          No layers added
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
          {sortedLayers.map((layer, index) => (
            <div
              key={layer.id}
              onClick={() => onSelect(layer.id)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border ${
                selectedId === layer.id
                  ? 'bg-[#3C6B4D]/20 border-[#3C6B4D] text-[#ECEBE9]'
                  : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:bg-[#1E2022]'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[#72706C]">{getLayerIcon(layer.type)}</span>
                <span className="text-xs font-semibold truncate">{layer.name || 'Unnamed Layer'}</span>
              </div>
              
              <div className="flex items-center gap-1 opacity-60 hover:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdate(layer.id, { visible: !layer.visible }); }}
                  className="p-1 hover:text-[#ECEBE9]"
                >
                  {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdate(layer.id, { locked: !layer.locked }); }}
                  className="p-1 hover:text-[#ECEBE9]"
                >
                  {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
                {onDuplicate && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(layer.id); }}
                    className="p-1 hover:text-[#ECEBE9]"
                    title="Duplicate Layer"
                  >
                    <Copy size={12} />
                  </button>
                )}
                <div className="flex flex-col mx-1">
                  <button
                    disabled={index === 0}
                    onClick={(e) => { e.stopPropagation(); onReorder(layer.id, 'up'); }}
                    className="hover:text-[#ECEBE9] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp size={10} />
                  </button>
                  <button
                    disabled={index === sortedLayers.length - 1}
                    onClick={(e) => { e.stopPropagation(); onReorder(layer.id, 'down'); }}
                    className="hover:text-[#ECEBE9] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown size={10} />
                  </button>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(layer.id); }}
                  className="p-1 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
