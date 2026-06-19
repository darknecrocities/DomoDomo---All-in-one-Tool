import { triggerTextDownload } from '../../utils/sharedHelpers';
import { useState, useRef } from 'react';
import { FileText, Bold, Italic, Underline, List, ListOrdered, Download, Eraser, AlignLeft, AlignCenter, AlignRight, ShieldAlert } from 'lucide-react';

export const RichTextTool = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('3');

  const execCmd = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '<p>Start typing your rich notes here...</p>';
    }
  };

  const downloadText = () => {
    if (editorRef.current) {
      triggerTextDownload(editorRef.current.innerText, 'document_notes.txt');
    }
  };

  const downloadHtml = () => {
    if (editorRef.current) {
      const template = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DomoDomo Rich Document</title>
  <style>
    body { font-family: sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
  </style>
</head>
<body>
  ${editorRef.current.innerHTML}
</body>
</html>`;
      triggerTextDownload(template, 'document_notes.html');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Editor Space */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4 h-[550px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-[#4E8E5E]" size={22} />
              <span>Rich Document Editor</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Draft files fully offline</span>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900/60 rounded-xl border border-slate-850">
            <button onClick={() => execCmd('bold')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Bold"><Bold size={15} /></button>
            <button onClick={() => execCmd('italic')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Italic"><Italic size={15} /></button>
            <button onClick={() => execCmd('underline')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Underline"><Underline size={15} /></button>
            
            <div className="w-[1px] h-5 bg-slate-800 mx-1" />
            
            <button onClick={() => execCmd('justifyLeft')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Align Left"><AlignLeft size={15} /></button>
            <button onClick={() => execCmd('justifyCenter')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Align Center"><AlignCenter size={15} /></button>
            <button onClick={() => execCmd('justifyRight')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Align Right"><AlignRight size={15} /></button>

            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

            <button onClick={() => execCmd('insertUnorderedList')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Bullet List"><List size={15} /></button>
            <button onClick={() => execCmd('insertOrderedList')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Numbered List"><ListOrdered size={15} /></button>

            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

            {/* Color picker */}
            <div className="flex items-center gap-1.5 px-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  execCmd('foreColor', e.target.value);
                }}
                className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                title="Text Color"
              />
            </div>

            {/* Font size */}
            <select
              value={fontSize}
              onChange={(e) => {
                setFontSize(e.target.value);
                execCmd('fontSize', e.target.value);
              }}
              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-slate-350 focus:outline-none"
              title="Font Size"
            >
              <option value="1">Small</option>
              <option value="3">Normal</option>
              <option value="5">Large</option>
              <option value="7">Heading</option>
            </select>

            <div className="flex-1" />

            <button onClick={handleClear} className="p-2 hover:bg-rose-950/20 rounded text-rose-400" title="Clear Pad"><Eraser size={15} /></button>
          </div>

          {/* Editable Canvas */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="flex-1 bg-slate-950/20 border border-slate-850 rounded-2xl p-5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] overflow-y-auto leading-relaxed outline-none"
          >
            <p>Start typing your rich notes here...</p>
          </div>
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Save Files</h3>
          <p className="text-xs text-slate-550 leading-relaxed">
            Download your written notes or HTML content layouts directly. Files compile to plain format arrays locally.
          </p>

          <div className="flex flex-col gap-2.5 pt-2">
            <button onClick={downloadHtml} className="btn-primary w-full py-3">
              <Download size={18} />
              <span>Download HTML Layout</span>
            </button>
            <button onClick={downloadText} className="btn-secondary w-full py-2.5 text-xs text-center">
              <span>Save raw TXT</span>
            </button>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Secure offline editor</span>
            <span className="text-[10px] leading-relaxed">Document buffers are stored fully in active browser memory and rendered locally.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
