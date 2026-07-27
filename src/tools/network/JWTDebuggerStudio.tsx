import React, { useState, useEffect } from 'react';
import { KeyRound, Cpu, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const JWTDebuggerStudioTool: React.FC = () => {
  const [tokenInput, setTokenInput] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIERvZSIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTc4MDAwMDAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  );
  const [copied, setCopied] = useState(false);

  // Local AI State
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      const { status, models } = await aiService.checkOllama();
      if (status && models.length > 0) {
        setModels(models);
        const saved = aiService.getSelectedOllamaModel();
        if (saved && models.includes(saved)) {
          setSelectedModel(saved);
        } else {
          setSelectedModel(models[0]);
        }
      }
    };
    fetchModels();
  }, []);

  const decodePart = (part: string) => {
    try {
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const parts = tokenInput.trim().split('.');
  const headerObj = parts[0] ? decodePart(parts[0]) : null;
  const payloadObj = parts[1] ? decodePart(parts[1]) : null;
  const signatureStr = parts[2] || '';

  const expTime = payloadObj?.exp ? new Date(payloadObj.exp * 1000) : null;
  const isExpired = expTime ? expTime < new Date() : false;

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(payloadObj, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAiJwtAudit = async () => {
    if (!selectedModel) return;
    setIsAuditing(true);
    setError(null);

    const systemPrompt = `You are a Principal Security Architect & Authentication Systems Specialist.
JWT Token Header: ${JSON.stringify(headerObj)}
JWT Token Claims Payload: ${JSON.stringify(payloadObj)}

Provide a security audit:
1. Algorithm security (none algorithm vulnerability, HS256 vs RS256/ES256 asymmetric keys).
2. Claim verification (exp, iat, nbf, iss, aud sanity check).
3. Secret storage best practices (HttpOnly SameSite cookies vs localStorage).
Format with clean markdown tables and bullet points.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Audit JWT claims: ${JSON.stringify(payloadObj)}`, 2048, systemPrompt);
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze JWT with Local AI.');
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <KeyRound size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI JWT Token Inspector & Claims Auditor</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Decode JSON Web Tokens (Header, Payload, Signature) offline, inspect expiration claims, verify signing algorithms, and audit security with Local AI.
              </p>
            </div>
          </div>
          {models.length > 0 && (
            <div className="flex items-center gap-2 bg-[#111213] p-2 rounded-xl border border-[#2A2D30]">
              <Cpu size={16} className="text-[#3C6B4D]" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs text-[#ECEBE9] focus:outline-none cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Input Token Box */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-3 text-left">
        <h4 className="text-sm font-semibold text-[#ECEBE9]">Encoded JWT Token String</h4>
        <textarea
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          rows={3}
          placeholder="Paste eyJhbGciOi..."
          className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3 rounded-xl font-mono resize-none focus:outline-none focus:border-[#3C6B4D]"
        />
      </div>

      {/* Main Decoded Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Header & Signature */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
          <h4 className="text-sm font-semibold text-rose-400 font-mono">1. Decoded Header (Algorithm & Token Type)</h4>
          <pre className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-xs text-[#ECEBE9] overflow-x-auto min-h-[100px]">
            {headerObj ? JSON.stringify(headerObj, null, 2) : 'Invalid Token Header'}
          </pre>

          <h4 className="text-sm font-semibold text-cyan-400 font-mono">3. Signature Verification Spec</h4>
          <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-xs text-[#A3A09B] truncate">
            {signatureStr || 'No signature present'}
          </div>
        </div>

        {/* Payload Claims */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-purple-400 font-mono">2. Decoded Payload (Claims Data)</h4>
              <button onClick={copyPayload} className="text-xs text-[#3C6B4D] hover:underline font-semibold flex items-center gap-1 cursor-pointer">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy Payload'}
              </button>
            </div>

            <pre className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-xs text-[#ECEBE9] overflow-x-auto min-h-[140px]">
              {payloadObj ? JSON.stringify(payloadObj, null, 2) : 'Invalid Token Payload'}
            </pre>
          </div>

          <div className="mt-4 pt-4 border-t border-[#2A2D30] flex items-center justify-between">
            <span className="text-xs text-[#A3A09B]">Expiration Status:</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${isExpired ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {expTime ? (isExpired ? `Expired (${expTime.toLocaleDateString()})` : `Valid until ${expTime.toLocaleString()}`) : 'No Expiration (exp claim missing)'}
            </span>
          </div>
        </div>
      </div>

      {/* Local AI Audit */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI JWT Security & Claims Auditor</h4>
          </div>
          <button
            onClick={handleRunAiJwtAudit}
            disabled={isAuditing || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isAuditing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isAuditing ? 'Auditing Claims...' : 'Run Local AI Security Audit'}
          </button>
        </div>

        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">{error}</div>}

        {aiOutput && (
          <div
            className="bg-[#111213] p-5 rounded-xl border border-[#2A2D30] text-[#ECEBE9] text-xs leading-relaxed overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(aiOutput) }}
          />
        )}
      </div>
    </div>
  );
};
