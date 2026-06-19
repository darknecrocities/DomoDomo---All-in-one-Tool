import { useState, useEffect } from 'react';
import { handleTextCopy, triggerTextDownload } from '../../utils/sharedHelpers';
import { FileText, Clipboard, Check, Download, Percent } from 'lucide-react';

export const HTMLMinifierTool = () => {
  const [inputCode, setInputCode] = useState('<!-- Sample Comment -->\n<div class="container" id="main-panel">\n  <h1 style="color: #4E8E5E; font-size: 24px;">\n    Welcome to DomoDomo\n  </h1>\n  <script>\n    // JavaScript comments\n    console.log("Minifying scripts offline...");\n  </script>\n</div>');
  const [outputCode, setOutputCode] = useState('');
  
  // Options
  const [removeComments, setRemoveComments] = useState(true);
  const [collapseWhitespace, setCollapseWhitespace] = useState(true);
  const [minifyInlineJS, setMinifyInlineJS] = useState(true);
  const [minifyInlineCSS, setMinifyInlineCSS] = useState(true);

  const [copied, setCopied] = useState(false);

  const performMinify = () => {
    if (!inputCode.trim()) {
      setOutputCode('');
      return;
    }
    
    let result = inputCode;

    // 1. Remove comments
    if (removeComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }

    // 2. Minify Script content
    if (minifyInlineJS) {
      result = result.replace(/<script>([\s\S]*?)<\/script>/gi, (_, jsCode) => {
        // Simple regex minifier for inline JS
        const minifiedJS = jsCode
          .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
          .replace(/\/\/.*/g, '')           // line comments
          .replace(/\s+/g, ' ')             // collapse whitespace
          .trim();
        return `<script>${minifiedJS}</script>`;
      });
    }

    // 3. Minify CSS style tag content
    if (minifyInlineCSS) {
      result = result.replace(/<style>([\s\S]*?)<\/style>/gi, (_, cssCode) => {
        const minifiedCSS = cssCode
          .replace(/\/\*[\s\S]*?\*\//g, '') // comments
          .replace(/\s+/g, ' ')             // collapse whitespace
          .trim();
        return `<style>${minifiedCSS}</style>`;
      });
    }

    // 4. Collapse general whitespace
    if (collapseWhitespace) {
      result = result
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><');
    }

    setOutputCode(result.trim());
  };

  useEffect(() => {
    performMinify();
  }, [inputCode, removeComments, collapseWhitespace, minifyInlineJS, minifyInlineCSS]);

  const originalSize = inputCode.length;
  const compressedSize = outputCode.length;
  const savingsPct = originalSize > 0 ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100)) : 0;

  return (
    <div className="max-w-4xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <FileText size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">HTML Code Minifier</h3>
          <p className="text-[10px] text-slate-500">Compress HTML payload sizes by stripping comments and white spaces offline</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Minification</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Input area */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Source HTML markup</span>
            <button onClick={() => setInputCode('')} className="text-[10px] text-rose-450 hover:underline">Clear</button>
          </div>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Paste HTML source code here..."
            className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs font-mono h-80 text-slate-200 resize-none w-full focus:outline-none focus:border-teal-500/50"
          />
        </div>

        {/* Output area */}
        <div className="flex flex-col gap-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Minified Results</span>
          {outputCode ? (
            <textarea
              readOnly
              value={outputCode}
              className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono h-80 text-emerald-400 resize-none w-full focus:outline-none"
            />
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl h-80 flex flex-col items-center justify-center text-slate-650 text-xs">
              Awaiting HTML input to minify
            </div>
          )}
        </div>
      </div>

      {/* Config Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Compression Options</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-950/20 p-2 rounded border border-slate-850">
              <input type="checkbox" checked={removeComments} onChange={(e) => setRemoveComments(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-350">Strip Comments</span>
                <span className="text-[8px] text-slate-500">Remove HTML comments</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-950/20 p-2 rounded border border-slate-850">
              <input type="checkbox" checked={collapseWhitespace} onChange={(e) => setCollapseWhitespace(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-350">Collapse Spacings</span>
                <span className="text-[8px] text-slate-500">Combine whitespaces</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-950/20 p-2 rounded border border-slate-850">
              <input type="checkbox" checked={minifyInlineJS} onChange={(e) => setMinifyInlineJS(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-350">Minify Script JS</span>
                <span className="text-[8px] text-slate-500">Compress inline JavaScript</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-950/20 p-2 rounded border border-slate-850">
              <input type="checkbox" checked={minifyInlineCSS} onChange={(e) => setMinifyInlineCSS(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-350">Minify Style CSS</span>
                <span className="text-[8px] text-slate-500">Compress inline CSS blocks</span>
              </div>
            </label>
          </div>
        </div>

        {/* Compression Statistics */}
        <div className="flex flex-col gap-3 justify-center border-l border-slate-800 pl-6">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1"><Percent size={11} /> Compression Statistics</span>
          {outputCode ? (
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850/80">
                <span className="text-[8px] text-slate-500 block">Original</span>
                <span className="text-slate-300 font-bold mt-0.5">{originalSize} B</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850/80">
                <span className="text-[8px] text-slate-500 block">Compressed</span>
                <span className="text-teal-400 font-bold mt-0.5">{compressedSize} B</span>
              </div>
              <div className="bg-teal-500/10 p-2.5 rounded-lg border border-teal-500/20 text-teal-400">
                <span className="text-[8px] text-teal-500 block">Savings</span>
                <span className="font-bold mt-0.5">{savingsPct}%</span>
              </div>
            </div>
          ) : (
            <div className="text-slate-600 text-xs italic">Awaiting input data values...</div>
          )}
        </div>
      </div>

      {outputCode && (
        <div className="flex gap-2">
          <button onClick={() => handleTextCopy(outputCode, setCopied)}
            className="flex-1 btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
            {copied ? <Check size={14} className="text-teal-400" /> : <Clipboard size={14} />}
            {copied ? 'Copied Output' : 'Copy Minified HTML'}
          </button>
          <button onClick={() => triggerTextDownload(outputCode, 'index.min.html')}
            className="flex-1 btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
            <Download size={14} /> Download Minified File
          </button>
        </div>
      )}
    </div>
  );
};
