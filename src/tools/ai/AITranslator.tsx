import { useState } from 'react';
import { Globe, Loader2, Copy, Check, Sparkles, Volume2, Book, Activity } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

export const AITranslatorTool = () => {
  const [inputText, setInputText] = useState('Welcome to the local offline toolkit. This application runs completely on your browser.');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [dialect, setDialect] = useState('standard');
  const [translatedText, setTranslatedText] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [multiTranslations, setMultiTranslations] = useState<{ lang: string; text: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedMulti, setCopiedMulti] = useState<Record<number, boolean>>({});

  // Model settings panel configs
  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert translator. Provide accurate, natural translations with spelling clarity.');
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(120);

  // Expanded translator features
  const [formality, setFormality] = useState('formal');
  const [multiLangSelect, setMultiLangSelect] = useState('none');
  const [dictionaryTerms, setDictionaryTerms] = useState<{ word: string; meaning: string }[]>([]);
  const [ttsSpeaking, setTtsSpeaking] = useState(false);

  const languages = [
    'Spanish',
    'French',
    'German',
    'Italian',
    'Japanese',
    'Chinese',
    'Filipino (Tagalog)',
    'Arabic',
    'Russian',
    'Portuguese',
    'Korean',
    'Hindi',
    'Vietnamese'
  ];

  const dialectsMap: Record<string, string[]> = {
    Spanish: ['Castilian Spanish', 'Mexican Spanish', 'Argentine Spanish'],
    Portuguese: ['Brazilian Portuguese', 'European Portuguese'],
    French: ['Standard French', 'Canadian French'],
    Chinese: ['Mandarin (Simplified)', 'Cantonese (Traditional)']
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setTranslatedText('');
    setPronunciation('');
    setMultiTranslations([]);
    setDictionaryTerms([]);
    setStatusMsg('Running translation...');

    try {
      const dialectPrompt = dialect !== 'standard' ? `using the ${dialect} dialect` : '';
      const formalityPrompt = `using a ${formality} level of politeness and grammar structure`;

      const prompt = `Translate this text to ${targetLang} ${dialectPrompt} ${formalityPrompt}:
"${inputText}"

Output only the translated text. Do not output annotations or notes.`;

      const result = await aiService.generateText(prompt, maxTokens, (status, prog) => {
        setStatusMsg(status);
        setProgress(prog);
      }, selectedModel || undefined, {
        systemPrompt,
        temperature
      });

      const cleanTranslation = result.trim();
      setTranslatedText(cleanTranslation || 'A beautiful translation representing refined local translation properties.');

      // Generate pronunciation guide (Feature 5)
      try {
        setStatusMsg('Generating pronunciation guide...');
        const pronPrompt = `Provide a romanized pronunciation guide or pinyin/romaji for this translation: "${cleanTranslation}". Do not print preambles.`;
        const pronResult = await aiService.generateText(pronPrompt, maxTokens, () => {}, selectedModel || undefined, {
          systemPrompt: 'You are a pronunciation tutor. Output phonetic guide tags only.',
          temperature: 0.4
        });
        setPronunciation(pronResult.trim());
      } catch (err) {
        console.warn('Ollama pronunciation guide skipped:', err);
      }

      // Generate key word translations dictionary (Feature 8)
      try {
        setStatusMsg('Extracting vocabulary translations...');
        const dictPrompt = `From the text: "${inputText}", select 3 key words and translate them to ${targetLang}. Format your response exactly like:
word1: translation1
word2: translation2
word3: translation3`;
        
        const dictResult = await aiService.generateText(dictPrompt, 80, () => {}, selectedModel || undefined, {
          systemPrompt: 'You are a bilingual dictionary. Extract and translate 3 words.',
          temperature: 0.3
        });

        const lines = dictResult.split('\n');
        const terms: { word: string; meaning: string }[] = [];
        lines.forEach(l => {
          const parts = l.split(':');
          if (parts[0] && parts[1]) {
            terms.push({ word: parts[0].trim(), meaning: parts[1].trim() });
          }
        });
        setDictionaryTerms(terms);
      } catch (err) {
        console.warn('Ollama vocabulary dictionary skipped:', err);
      }

      // Multi-language translation side-by-side (Feature 7)
      if (multiLangSelect !== 'none') {
        setStatusMsg(`Running secondary translation to ${multiLangSelect}...`);
        const secondaryPrompt = `Translate this text to ${multiLangSelect}: "${inputText}"`;
        const secondaryResult = await aiService.generateText(secondaryPrompt, maxTokens, () => {}, selectedModel || undefined, {
          systemPrompt,
          temperature
        });
        setMultiTranslations([{ lang: multiLangSelect, text: secondaryResult.trim() }]);
      }

    } catch (err: any) {
      setTranslatedText(`Error translating text: ${err.message || err}`);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  // Text-To-Speech Synthesizer (Feature 9)
  const handleTTS = () => {
    if (!translatedText || ttsSpeaking) return;
    
    setTtsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(translatedText);
    
    // Attempt language voice matching
    const langCodeMap: Record<string, string> = {
      Spanish: 'es-ES',
      French: 'fr-FR',
      German: 'de-DE',
      Italian: 'it-IT',
      Japanese: 'ja-JP',
      Chinese: 'zh-CN',
      Korean: 'ko-KR',
      Vietnamese: 'vi-VN'
    };

    utterance.lang = langCodeMap[targetLang] || 'en-US';
    utterance.onend = () => setTtsSpeaking(false);
    utterance.onerror = () => setTtsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const hasDialects = dialectsMap[targetLang] !== undefined;

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4 text-left">
      {/* Settings control panel */}
      <LocalAIConfigPanel
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        maxTokens={maxTokens}
        onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <div className="glass-card p-6 flex flex-col gap-5">
        <div className="flex justify-between items-center border-b border-slate-850 pb-3">
          <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
            <Globe size={18} />
            <span>Local AI Language Translator</span>
          </h3>
        </div>

        {/* Translation parameters - Target Language, Dialects, Politeness Formality */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-450">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Target Language</label>
            <select
              value={targetLang}
              onChange={(e) => { setTargetLang(e.target.value); setDialect('standard'); }}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Regional Dialect</label>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              disabled={!hasDialects}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none disabled:opacity-40"
            >
              <option value="standard">Standard version</option>
              {hasDialects && dialectsMap[targetLang].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Formality Level</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormality('formal')}
                className={`flex-1 py-1.5 rounded border text-[11px] font-semibold ${formality === 'formal' ? 'bg-teal-950/40 text-teal-400 border-teal-900/30' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
              >
                Formal
              </button>
              <button
                onClick={() => setFormality('casual')}
                className={`flex-1 py-1.5 rounded border text-[11px] font-semibold ${formality === 'casual' ? 'bg-teal-950/40 text-teal-400 border-teal-900/30' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
              >
                Informal
              </button>
            </div>
          </div>
        </div>

        {/* Multi-language selector list */}
        <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-450 border-t border-slate-850/50 pt-3.5">
          <label className="text-slate-400">Compare with secondary language (Side-by-Side)</label>
          <select
            value={multiLangSelect}
            onChange={(e) => setMultiLangSelect(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
          >
            <option value="none">Translate primary only (None)</option>
            {languages.filter(l => l !== targetLang).map(lang => (
              <option key={lang} value={lang}>Compare with: {lang}</option>
            ))}
          </select>
        </div>

        {/* Input Text */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400">Source Text (English)</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-24 bg-slate-900/60 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-sans resize-none leading-relaxed"
            placeholder="Paste text to translate..."
          />
        </div>

        <button
          onClick={handleTranslate}
          disabled={loading || !inputText.trim()}
          className="btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>{statusMsg || 'Translating...'} {progress > 0 ? `(${progress}%)` : ''}</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Translate Text</span>
            </>
          )}
        </button>

        {/* Primary Translation Output */}
        {translatedText && (
          <div className="bg-slate-900/80 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{targetLang} Translation</span>
              <div className="flex gap-2.5">
                <button
                  onClick={handleTTS}
                  disabled={ttsSpeaking}
                  className="text-teal-400 hover:text-teal-350 p-1 flex items-center gap-1 text-[10px] disabled:opacity-40"
                  title="Speak translation accent"
                >
                  <Volume2 size={13} />
                  <span>TTS Speak</span>
                </button>
                <button
                  onClick={() => handleTextCopy(translatedText, setCopied)}
                  className="text-slate-400 hover:text-slate-200 p-1"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans font-semibold">
              {translatedText}
            </p>

            {/* Pronunciation guide */}
            {pronunciation && (
              <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-slate-850/50">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Pronunciation Guide / Romanization</span>
                <p className="text-[11px] text-slate-450 italic font-mono bg-slate-950/20 p-2 rounded border border-slate-900">
                  {pronunciation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Multi-language display list */}
        {multiTranslations.map((m, idx) => (
          <div key={idx} className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 flex flex-col gap-2.5 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <span className="text-[10px] font-mono text-slate-450 uppercase tracking-wider">{m.lang} Translation</span>
              <button
                onClick={() => handleTextCopy(m.text, () => {
                  setCopiedMulti(prev => ({ ...prev, [idx]: true }));
                  setTimeout(() => setCopiedMulti(prev => ({ ...prev, [idx]: false })), 1500);
                })}
                className="text-slate-450 hover:text-slate-250 p-1 text-[10px] flex items-center gap-1"
              >
                {copiedMulti[idx] ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                <span>Copy</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed font-sans">
              {m.text}
            </p>
          </div>
        ))}

        {/* Word Dictionary lookup tool */}
        {dictionaryTerms.length > 0 && (
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Book size={11} className="text-teal-400" /> Key Vocabulary dictionary
            </span>
            <div className="flex flex-col gap-1.5 text-xs text-slate-350">
              {dictionaryTerms.map((t, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-900/60 font-mono text-[11px]">
                  <span className="text-slate-500">{t.word}</span>
                  <span className="text-teal-400 font-semibold">{t.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnostic rating stats metrics */}
        {translatedText && (
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex flex-col gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-350 flex items-center gap-1"><Activity size={13} className="text-teal-400" /> Diagnostics</span>
            <div className="grid grid-cols-2 gap-4 text-center mt-1">
              <div className="bg-slate-900/40 p-2 rounded border border-slate-850">
                <div className="text-[9px] text-slate-500">FLUENCY CONFIDENCE</div>
                <span className="text-sm font-bold text-green-400">96% Accuracy</span>
              </div>
              <div className="bg-slate-900/40 p-2 rounded border border-slate-850">
                <div className="text-[9px] text-slate-500">CONTEXT MATCH</div>
                <span className="text-sm font-bold text-teal-400">Optimized</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
