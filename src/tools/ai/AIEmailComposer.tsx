import { useState } from 'react';
import { Mail, Loader2, Copy, Check, Download, RefreshCw, ChevronDown } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

type EmailMode = 'compose' | 'reply' | 'followup';
type Tone = 'formal' | 'friendly' | 'assertive' | 'apologetic' | 'persuasive';
type Length = 'brief' | 'standard' | 'detailed';

interface EmailHistory { subject: string; body: string; tone: Tone; timestamp: string }

export const AIEmailComposerTool = () => {
  const [mode, setMode] = useState<EmailMode>('compose');
  const [intent, setIntent] = useState('Request a project deadline extension of one week due to unexpected technical issues');
  const [receivedEmail, setReceivedEmail] = useState('');
  const [tone, setTone] = useState<Tone>('formal');
  const [length, setLength] = useState<Length>('standard');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<EmailHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [ccField, setCcField] = useState('');
  const [bccField, setBccField] = useState('');

  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert business email writer. Write clear, professional emails that achieve their goals effectively.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(350);

  const lengthGuide = { brief: '2–3 sentences', standard: '1–2 paragraphs', detailed: '3–4 paragraphs' };

  const generate = async () => {
    setLoading(true);
    setStatusMsg('Composing email...');
    try {
      let prompt = '';
      if (mode === 'compose') {
        prompt = `Write a ${tone} ${length} email for this intent: "${intent}". Length guide: ${lengthGuide[length]}. Return ONLY JSON: {"subject":"...","body":"..."}`;
      } else if (mode === 'reply') {
        prompt = `Write a ${tone} ${length} reply to this email: "${receivedEmail}". My intent: "${intent}". Return ONLY JSON: {"subject":"...","body":"..."}`;
      } else {
        prompt = `Write a ${tone} follow-up email for: "${intent}". Assume prior communication. Length: ${lengthGuide[length]}. Return ONLY JSON: {"subject":"...","body":"..."}`;
      }
      const result = await aiService.generateText(
        prompt,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setGeneratedSubject(parsed.subject || '');
        setGeneratedBody(parsed.body || '');
        setHistory(prev => [{ subject: parsed.subject, body: parsed.body, tone, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
      } else {
        setGeneratedBody(result);
      }
    } catch { setStatusMsg('Error. Ensure Ollama is running.'); setTimeout(() => setStatusMsg(''), 3000); }
    setStatusMsg('');
    setLoading(false);
  };

  const fullEmail = `Subject: ${generatedSubject}\n${ccField ? `CC: ${ccField}\n` : ''}${bccField ? `BCC: ${bccField}\n` : ''}\n${generatedBody}`;

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      <LocalAIConfigPanel
        systemPrompt={systemPrompt} onSystemPromptChange={setSystemPrompt}
        temperature={temperature} onTemperatureChange={setTemperature}
        maxTokens={maxTokens} onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel} onModelChange={setSelectedModel}
      />

      {/* Mode selector */}
      <div className="flex gap-2">
        {(['compose', 'reply', 'followup'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${mode === m ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'}`}>
            {m === 'compose' ? '✉️ Compose' : m === 'reply' ? '↩️ Reply' : '🔄 Follow-up'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left — Input */}
        <div className="flex flex-col gap-3">
          <textarea value={intent} onChange={e => setIntent(e.target.value)}
            className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
            placeholder="Describe what you want to say (bullet points or intent)..." />

          {mode === 'reply' && (
            <textarea value={receivedEmail} onChange={e => setReceivedEmail(e.target.value)}
              className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-sky-500 resize-none font-mono"
              placeholder="Paste the email you're replying to..." />
          )}

          {/* Tone & Length */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tone</label>
              <div className="relative">
                <select value={tone} onChange={e => setTone(e.target.value as Tone)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 appearance-none">
                  {(['formal', 'friendly', 'assertive', 'apologetic', 'persuasive'] as Tone[]).map(t => (
                    <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Length</label>
              <div className="relative">
                <select value={length} onChange={e => setLength(e.target.value as Length)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 appearance-none">
                  {(['brief', 'standard', 'detailed'] as Length[]).map(l => (
                    <option key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* CC/BCC */}
          <input value={ccField} onChange={e => setCcField(e.target.value)} placeholder="CC (optional)"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500" />
          <input value={bccField} onChange={e => setBccField(e.target.value)} placeholder="BCC (optional)"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500" />

          <button onClick={generate} disabled={loading || !intent.trim()}
            className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95">
            {loading ? <><Loader2 size={15} className="animate-spin" /><span>{statusMsg}</span></> : <><Mail size={15} /><span>Generate Email</span></>}
          </button>
        </div>

        {/* Right — Output */}
        <div className="flex flex-col gap-3">
          {generatedSubject && (
            <div className="bg-sky-950/30 border border-sky-800/30 rounded-xl px-3 py-2">
              <div className="text-[10px] font-bold text-sky-400 mb-0.5">SUBJECT</div>
              <div className="text-sm font-semibold text-slate-200">{generatedSubject}</div>
              {ccField && <div className="text-[10px] text-slate-500 mt-1">CC: {ccField}</div>}
              {bccField && <div className="text-[10px] text-slate-500">BCC: {bccField}</div>}
            </div>
          )}
          <div className="flex-1 min-h-48 bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap overflow-auto max-h-64">
            {generatedBody || <span className="text-slate-600 text-xs">Email body will appear here...</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleTextCopy(fullEmail, setCopied)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />} Copy All
            </button>
            <button onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([fullEmail], {type:'text/plain'})); a.download = 'email.txt'; a.click(); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
              <Download size={12} /> Save
            </button>
            <button onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
              <RefreshCw size={12} /> History ({history.length})
            </button>
          </div>
          {showHistory && (
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              {history.map((h, i) => (
                <button key={i} onClick={() => { setGeneratedSubject(h.subject); setGeneratedBody(h.body); setShowHistory(false); }}
                  className="text-left p-2 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs text-slate-400 transition-all">
                  <span className="text-sky-400">[{h.tone}]</span> {h.timestamp} — {h.subject}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
