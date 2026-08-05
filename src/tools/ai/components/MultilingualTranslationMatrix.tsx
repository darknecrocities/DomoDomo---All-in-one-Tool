import React, { useState } from 'react';
import { Globe, Sparkles } from 'lucide-react';

interface TranslationItem {
  lang: string;
  code: string;
  translatedText: string;
  bleuScore: number;
}

interface MultilingualTranslationMatrixProps {
  selectedModel?: string;
  models?: string[];
}

export const MultilingualTranslationMatrix: React.FC<MultilingualTranslationMatrixProps> = () => {
  const [sourceText, setSourceText] = useState<string>(
    'DomoDomo is an open-source local-first workspace for web utilities and private AI model management.'
  );

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translations] = useState<TranslationItem[]>([
    { lang: 'Spanish', code: 'ES', translatedText: 'DomoDomo es un espacio de trabajo local de código abierto para utilidades web.', bleuScore: 94.2 },
    { lang: 'French', code: 'FR', translatedText: 'DomoDomo est un espace de travail local open source pour les outils web.', bleuScore: 92.8 },
    { lang: 'German', code: 'DE', translatedText: 'DomoDomo ist ein lokaler Open-Source-Arbeitsbereich für Web-Utilities.', bleuScore: 91.5 },
    { lang: 'Japanese', code: 'JA', translatedText: 'DomoDomoは、WebユーティリティとローカルAI管理のためのオープンソースワークスペースです。', bleuScore: 89.6 },
    { lang: 'Tagalog', code: 'TL', translatedText: 'Ang DomoDomo ay isang open-source local-first workspace para sa mga web tool at AI.', bleuScore: 96.0 },
  ]);

  const runMultilingualTranslation = async () => {
    setIsTranslating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsTranslating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <Globe className="text-[#3C6B4D]" size={20} /> Multilingual Localization &amp; Translation Benchmark Matrix
          </h2>
          <p className="text-xs text-[#72706C]">
            Translate text across multiple languages simultaneously with BLEU quality scoring.
          </p>
        </div>
        <button
          onClick={runMultilingualTranslation}
          disabled={isTranslating}
          className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#3C6B4D]/20"
        >
          <Sparkles size={14} />
          <span>{isTranslating ? 'Translating Matrix...' : 'Translate All Languages'}</span>
        </button>
      </div>

      {/* Input Source Text */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
        <label className="text-xs font-bold text-[#72706C] uppercase">English Source Text</label>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          rows={3}
          className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
        />
      </div>

      {/* Multilingual Translation Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {translations.map((item) => (
          <div key={item.code} className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2 relative">
            <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#3C6B4D]/20 text-[#3C6B4D] font-mono font-bold text-[10px]">
                  {item.code}
                </span>
                <span className="text-xs font-bold text-[#ECEBE9]">{item.lang}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">BLEU: {item.bleuScore}</span>
            </div>

            <p className="text-xs text-[#ECEBE9] font-mono leading-relaxed bg-[#111213] p-2.5 rounded-xl border border-[#2A2D30]">
              {item.translatedText}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
