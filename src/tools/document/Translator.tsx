import { useState } from 'react';
import { Sparkles, ShieldAlert, Globe } from 'lucide-react';
import { handleTextCopy } from '../../utils/sharedHelpers';

// Local offline dictionary mappings
const OFFLINE_DICTIONARY: {
  [lang: string]: {
    [word: string]: string;
  };
} = {
  spanish: {
    hello: 'hola',
    project: 'proyecto',
    code: 'código',
    offline: 'fuera de línea',
    developer: 'desarrollador',
    file: 'archivo',
    utility: 'utilidad',
    welcome: 'bienvenido',
    sandbox: 'caja de arena',
    privacy: 'privacidad',
    secure: 'seguro',
    convert: 'convertir',
    process: 'procesar'
  },
  french: {
    hello: 'bonjour',
    project: 'projet',
    code: 'code',
    offline: 'hors ligne',
    developer: 'développeur',
    file: 'fichier',
    utility: 'utilité',
    welcome: 'bienvenue',
    sandbox: 'bac à sable',
    privacy: 'confidentialité',
    secure: 'sécurisé',
    convert: 'convertir',
    process: 'traiter'
  },
  german: {
    hello: 'hallo',
    project: 'projekt',
    code: 'code',
    offline: 'offline',
    developer: 'entwickler',
    file: 'datei',
    utility: 'dienstprogramm',
    welcome: 'willkommen',
    sandbox: 'sandkasten',
    privacy: 'datenschutz',
    secure: 'sicher',
    convert: 'konvertieren',
    process: 'prozess'
  },
  tagalog: {
    hello: 'kamusta',
    project: 'proyekto',
    code: 'kodigo',
    offline: 'offline',
    developer: 'tagabuo ng software',
    file: 'dokumento',
    utility: 'kasangkapan',
    welcome: 'maligayang pagdating',
    sandbox: 'sandbox',
    privacy: 'pribado',
    secure: 'ligtas',
    convert: 'baguhin',
    process: 'iproseso'
  }
};

export const TranslatorTool = () => {
  const [text, setText] = useState('Welcome developer! Process your code and files offline to secure your privacy.');
  const [targetLang, setTargetLang] = useState('spanish');
  const [translated, setTranslated] = useState('');
  const [copied, setCopied] = useState(false);

  const handleTranslate = () => {
    if (!text.trim()) return;

    // Split text into words, look up translations and reconstruct
    const words = text.split(/\b/);
    const dict = OFFLINE_DICTIONARY[targetLang];
    
    const output = words.map(w => {
      const lower = w.toLowerCase().trim();
      if (dict && dict[lower]) {
        // Match capitalization roughly
        const trans = dict[lower];
        if (w[0] === w[0].toUpperCase() && w.length > 1) {
          return trans[0].toUpperCase() + trans.slice(1);
        }
        return trans;
      }
      return w;
    });

    setTranslated(output.join(''));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Input panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="text-[#4E8E5E]" size={22} />
              <span>Offline Text Dictionary Translator</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Mapped string dictionary</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">English Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] h-32 resize-none leading-relaxed outline-none"
              placeholder="Type English expressions..."
            />
          </div>

          {translated && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs text-slate-455 font-bold uppercase tracking-wider">Translated Output ({targetLang})</span>
              <textarea
                readOnly
                value={translated}
                className="w-full bg-slate-950 p-4 text-xs font-mono h-32 rounded-2xl border border-slate-900 text-slate-350 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Target Language</h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500">Language</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="spanish">Spanish (Español)</option>
              <option value="french">French (Français)</option>
              <option value="german">German (Deutsch)</option>
              <option value="tagalog">Tagalog (Filipino)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button onClick={handleTranslate} className="btn-primary w-full py-3">
              <Sparkles size={18} />
              <span>Translate Text</span>
            </button>
            
            {translated && (
              <button
                onClick={() => handleTextCopy(translated, setCopied)}
                className="btn-secondary w-full py-2"
              >
                <span>{copied ? 'Copied!' : 'Copy Translation'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Offline Lookups</span>
            <span className="text-[10px] leading-relaxed">Runs entirely in active JS variables. No external translation queries are sent.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
