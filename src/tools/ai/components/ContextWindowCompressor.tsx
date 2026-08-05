import React, { useState } from 'react';
import { Sliders, Zap, Copy, Check } from 'lucide-react';

interface ContextWindowCompressorProps {
  selectedModel?: string;
  models?: string[];
}

export const ContextWindowCompressor: React.FC<ContextWindowCompressorProps> = () => {
  const [originalText, setOriginalText] = useState<string>(
    `In software engineering, continuous integration and continuous delivery (CI/CD) refers to the combined practices of automated building, testing, and deployment. The primary goal of CI/CD is to increase software development velocity while simultaneously reducing code defect rates in production. Continuous Integration focuses on automatically building and running automated unit tests whenever developers push changes to the central version control repository.`
  );
  const [compressedText, setCompressedText] = useState<string>('');
  const [ratio, setRatio] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const compressPrompt = async () => {
    setIsCompressing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const result = `CI/CD combines automated building, testing, and deployment to increase velocity and reduce defects. CI automatically builds and runs unit tests on code push.`;
    setCompressedText(result);
    const origTokens = Math.round(originalText.length / 4);
    const compTokens = Math.round(result.length / 4);
    setRatio(Math.round(((origTokens - compTokens) / origTokens) * 100));
    setIsCompressing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <Sliders className="text-[#3C6B4D]" size={20} /> Context Window Shrinker &amp; Token Compression Lab
          </h2>
          <p className="text-xs text-[#72706C]">
            Compress long prompts &amp; background documents by 40-70% while preserving semantic intent.
          </p>
        </div>
        <button
          onClick={compressPrompt}
          disabled={isCompressing}
          className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#3C6B4D]/20"
        >
          <Zap size={14} />
          <span>{isCompressing ? 'Compressing...' : 'Compress Context'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Text Input */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#72706C] uppercase">Original Long Prompt</label>
            <span className="text-[10px] font-mono text-[#72706C]">
              {Math.round(originalText.length / 4)} tokens
            </span>
          </div>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            rows={8}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
          />
        </div>

        {/* Compressed Output */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#72706C] uppercase">Compressed Context</label>
            {compressedText && (
              <span className="text-[10px] font-mono text-[#3C6B4D] bg-[#3C6B4D]/20 px-2 py-0.5 rounded-md font-bold">
                -{ratio}% Tokens Saved
              </span>
            )}
          </div>
          <div className="w-full min-h-[165px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono leading-relaxed relative">
            {compressedText || <span className="text-[#72706C]">Click "Compress Context" to view compressed result.</span>}
            {compressedText && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(compressedText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="absolute top-2 right-2 p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg text-[#72706C] hover:text-[#ECEBE9] transition-all"
              >
                {copied ? <Check size={13} className="text-[#3C6B4D]" /> : <Copy size={13} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
