import { useState } from 'react';



export const ColorConverterTool = () => {
  const [color, setColor] = useState('#4E8E5E');

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Color Converter</h3>
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-16 bg-transparent border border-slate-800 cursor-pointer rounded" />
      <div className="flex flex-col gap-1 text-xs text-slate-400 font-mono mt-2">
        <div className="flex justify-between border-b border-slate-850 py-1.5"><span>Hex Code:</span><span className="text-slate-200 font-semibold">{color}</span></div>
        <div className="flex justify-between py-1.5"><span>Color Space:</span><span className="text-slate-200 font-semibold">sRGB</span></div>
      </div>
    </div>
  );
};
