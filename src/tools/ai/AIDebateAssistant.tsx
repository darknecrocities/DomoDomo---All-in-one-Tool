import { useState } from 'react';
import { MessageSquare, Loader2, Copy, Check, Download, Sparkles, Shield, Swords } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

type DebateMode = 'arguments' | 'rebuttal' | 'opening' | 'closing' | 'steelman';

interface SavedDebate { topic: string; proArgs: string; conArgs: string; timestamp: string }

export const AIDebateAssistantTool = () => {
  const [topic, setTopic] = useState('Social media does more harm than good to society');
  const [mode, setMode] = useState<DebateMode>('arguments');
  const [opposingArg, setOpposingArg] = useState('');
  const [proArgs, setProArgs] = useState('');
  const [conArgs, setConArgs] = useState('');
  const [rebuttal, setRebuttal] = useState('');
  const [openingStatement, setOpeningStatement] = useState('');
  const [closingStatement, setClosingStatement] = useState('');
  const [steelman, setSteelman] = useState('');
  const [strengthScore, setStrengthScore] = useState<{ pro: number; con: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedDebates, setSavedDebates] = useState<SavedDebate[]>([]);
  const [side, setSide] = useState<'pro' | 'con'>('pro');

  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert debate coach and critical thinker. Provide well-structured, logical arguments with evidence and examples.');
  const [temperature, setTemperature] = useState(0.65);
  const [maxTokens, setMaxTokens] = useState(400);

  const generateArguments = async () => {
    setLoading(true);
    setStatusMsg('Generating arguments...');
    try {
      const result = await aiService.generateText(
        `For this debate topic: "${topic}"\nGenerate 5 strong PRO arguments and 5 strong CON arguments.\nReturn JSON: {"pro":["arg1","arg2",...],"con":["arg1","arg2",...],"proScore":78,"conScore":72}`,
        500,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setProArgs(parsed.pro?.join('\n\n') || result);
        conArgs && setConArgs(parsed.con?.join('\n\n') || '');
        setConArgs(parsed.con?.join('\n\n') || '');
        if (parsed.proScore && parsed.conScore) {
          setStrengthScore({ pro: parsed.proScore, con: parsed.conScore });
        }
      } else {
        setProArgs(result);
      }
    } catch { setStatusMsg('Error. Ensure Ollama is running.'); setTimeout(() => setStatusMsg(''), 3000); }
    setStatusMsg('');
    setLoading(false);
  };

  const generateRebuttal = async () => {
    if (!opposingArg.trim()) return;
    setLoading(true);
    setStatusMsg('Generating rebuttal...');
    try {
      const result = await aiService.generateText(
        `Generate a strong, logical rebuttal to this argument in the debate about "${topic}":\n"${opposingArg}"\n\nProvide 3 counter-points with evidence.`,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      setRebuttal(result);
    } catch { setRebuttal('Error connecting to Ollama.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const generateOpening = async () => {
    setLoading(true);
    setStatusMsg('Writing opening statement...');
    try {
      const result = await aiService.generateText(
        `Write a powerful ${side === 'pro' ? 'FOR' : 'AGAINST'} opening statement for this debate: "${topic}". Should be 3–4 sentences, hook the audience, and set the tone.`,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature: 0.75 }
      );
      setOpeningStatement(result);
    } catch { setOpeningStatement('Error connecting to Ollama.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const generateClosing = async () => {
    setLoading(true);
    setStatusMsg('Writing closing statement...');
    try {
      const result = await aiService.generateText(
        `Write a persuasive ${side === 'pro' ? 'FOR' : 'AGAINST'} closing statement for the debate: "${topic}". Summarize key points and leave a lasting impression.`,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature: 0.75 }
      );
      setClosingStatement(result);
    } catch { setClosingStatement('Error connecting to Ollama.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const generateSteelman = async () => {
    setLoading(true);
    setStatusMsg('Building steelman...');
    try {
      const result = await aiService.generateText(
        `Present the strongest possible ${side === 'pro' ? 'AGAINST' : 'FOR'} argument for the topic: "${topic}". Steel-man the opposing side — make it as compelling as possible, even if you disagree.`,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature: 0.6 }
      );
      setSteelman(result);
    } catch { setSteelman('Error connecting to Ollama.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const handleGenerate = () => {
    if (mode === 'arguments') generateArguments();
    else if (mode === 'rebuttal') generateRebuttal();
    else if (mode === 'opening') generateOpening();
    else if (mode === 'closing') generateClosing();
    else generateSteelman();
  };

  const saveDebate = () => {
    setSavedDebates(prev => [{ topic, proArgs, conArgs, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
  };

  const exportBrief = () => {
    const content = `DEBATE BRIEF: ${topic}\n\n=== PRO ARGUMENTS ===\n${proArgs}\n\n=== CON ARGUMENTS ===\n${conArgs}\n\n=== OPENING STATEMENT ===\n${openingStatement}\n\n=== CLOSING STATEMENT ===\n${closingStatement}\n\n=== STEELMAN ===\n${steelman}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = 'debate-brief.txt';
    a.click();
  };

  const currentOutput = mode === 'arguments' ? `PRO:\n${proArgs}\n\nCON:\n${conArgs}`
    : mode === 'rebuttal' ? rebuttal
    : mode === 'opening' ? openingStatement
    : mode === 'closing' ? closingStatement
    : steelman;

  const modeConfig = [
    { key: 'arguments', label: '⚔️ Arguments', icon: <Swords size={12} /> },
    { key: 'rebuttal', label: '🛡️ Rebuttal', icon: <Shield size={12} /> },
    { key: 'opening', label: '🎙️ Opening', icon: <MessageSquare size={12} /> },
    { key: 'closing', label: '🏁 Closing', icon: <MessageSquare size={12} /> },
    { key: 'steelman', label: '💪 Steelman', icon: <Sparkles size={12} /> },
  ] as const;

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      <LocalAIConfigPanel
        systemPrompt={systemPrompt} onSystemPromptChange={setSystemPrompt}
        temperature={temperature} onTemperatureChange={setTemperature}
        maxTokens={maxTokens} onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel} onModelChange={setSelectedModel}
      />

      {/* Topic */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Debate Topic</label>
        <input value={topic} onChange={e => setTopic(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
          placeholder="Enter a debate topic..." />
      </div>

      {/* Side selector */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Your Side:</span>
        <div className="flex gap-2">
          {(['pro', 'con'] as const).map(s => (
            <button key={s} onClick={() => setSide(s)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${side === s ? (s === 'pro' ? 'bg-green-700 border-green-600 text-white' : 'bg-red-700 border-red-600 text-white') : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
              {s === 'pro' ? '✅ FOR' : '❌ AGAINST'}
            </button>
          ))}
        </div>
        {strengthScore && (
          <div className="ml-auto flex gap-3 text-[11px]">
            <span className="text-green-400 font-mono font-bold">PRO: {strengthScore.pro}%</span>
            <span className="text-red-400 font-mono font-bold">CON: {strengthScore.con}%</span>
          </div>
        )}
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {modeConfig.map(m => (
          <button key={m.key} onClick={() => setMode(m.key as DebateMode)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === m.key ? 'bg-rose-700 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'rebuttal' && (
        <textarea value={opposingArg} onChange={e => setOpposingArg(e.target.value)}
          className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-rose-500 resize-none"
          placeholder="Paste the opposing argument you want to rebut..." />
      )}

      <button onClick={handleGenerate} disabled={loading}
        className="flex items-center justify-center gap-2 bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95">
        {loading ? <><Loader2 size={15} className="animate-spin" /><span>{statusMsg}</span></> : <><Swords size={15} /><span>Generate {modeConfig.find(m => m.key === mode)?.label.split(' ')[1]}</span></>}
      </button>

      {/* Output */}
      {mode === 'arguments' && (proArgs || conArgs) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[{ label: '✅ PRO', content: proArgs, color: 'border-green-800/40 bg-green-950/20' }, { label: '❌ CON', content: conArgs, color: 'border-red-800/40 bg-red-950/20' }].map(col => (
            <div key={col.label} className={`border rounded-xl p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto ${col.color}`}>
              <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">{col.label}</div>
              {col.content}
            </div>
          ))}
        </div>
      ) : currentOutput ? (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-auto">
          {currentOutput}
        </div>
      ) : null}

      <div className="flex gap-2 flex-wrap">
        {currentOutput && (
          <button onClick={() => handleTextCopy(currentOutput, setCopied)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />} Copy
          </button>
        )}
        {(proArgs || conArgs) && (
          <>
            <button onClick={saveDebate} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
              💾 Save Session
            </button>
            <button onClick={exportBrief} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
              <Download size={12} /> Export Brief
            </button>
          </>
        )}
      </div>

      {savedDebates.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Saved Sessions</div>
          {savedDebates.map((d, i) => (
            <button key={i} onClick={() => { setTopic(d.topic); setProArgs(d.proArgs); setConArgs(d.conArgs); }}
              className="text-left p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-400 transition-all">
              <span className="text-rose-400">[{d.timestamp}]</span> {d.topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
