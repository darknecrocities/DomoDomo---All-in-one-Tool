import { triggerTextDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const RichTextTool = () => {
  const [content, setContent] = useState('<h3>My Document</h3><p>Start writing rich content here...</p>');
  
  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-4 text-left h-[450px]">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Rich Text Editor</h3>
      <div className="flex gap-2 border-b border-slate-850 pb-2">
        <button onClick={() => document.execCommand('bold')} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-bold hover:bg-slate-800 text-slate-200">Bold</button>
        <button onClick={() => document.execCommand('italic')} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-bold hover:bg-slate-800 text-slate-200">Italic</button>
        <button onClick={() => document.execCommand('underline')} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-bold hover:bg-slate-800 text-slate-200">Underline</button>
      </div>
      <div
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
        onBlur={(e) => setContent(e.currentTarget.innerHTML)}
        className="flex-1 bg-slate-950/20 border border-slate-850 rounded-xl p-4 overflow-y-auto outline-none focus:border-[#4E8E5E] text-slate-200 text-sm"
      />
      <button onClick={() => triggerTextDownload(content, 'document.html')} className="btn-primary py-2 text-xs">Save HTML Document</button>
    </div>
  );
};
