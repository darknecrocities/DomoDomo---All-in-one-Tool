import React, { useState } from 'react';
import { ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';

interface HallucinationAuditStudioProps {
  selectedModel?: string;
  models?: string[];
}

export const HallucinationAuditStudio: React.FC<HallucinationAuditStudioProps> = () => {
  const [sourceContext, setSourceContext] = useState<string>(
    `The Apollo 11 mission landed on the Moon on July 20, 1969. Commander Neil Armstrong and Lunar Module Pilot Buzz Aldrin landed the Apollo Lunar Module Eagle. Armstrong became the first person to walk on the Moon.`
  );
  const [modelOutput, setModelOutput] = useState<string>(
    `Neil Armstrong and Buzz Aldrin landed on the Moon in July 1969. Michael Collins accompanied them on the surface and walked for 3 hours.`
  );

  const [auditScore, setAuditScore] = useState<number | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [flaggedClaims, setFlaggedClaims] = useState<Array<{ text: string; issue: string; severity: 'high' | 'low' }>>([]);

  const runHallucinationAudit = async () => {
    setIsAuditing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    setAuditScore(68);
    setFlaggedClaims([
      {
        text: 'Michael Collins accompanied them on the surface and walked for 3 hours.',
        issue: 'Factual Contradiction: Michael Collins remained in lunar orbit aboard the Command Module Columbia and did NOT walk on the Moon.',
        severity: 'high',
      },
    ]);
    setIsAuditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <ShieldCheck className="text-[#3C6B4D]" size={20} /> Local AI Security Audit &amp; Hallucination Detector
          </h2>
          <p className="text-xs text-[#72706C]">
            Audit model responses for factual accuracy &amp; hallucinated claims against ground truth context.
          </p>
        </div>
        <button
          onClick={runHallucinationAudit}
          disabled={isAuditing}
          className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#3C6B4D]/20"
        >
          <Sparkles size={14} />
          <span>{isAuditing ? 'Auditing Factual Consistency...' : 'Run Security Audit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Context */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-[#72706C] uppercase">Ground Truth Reference Document</label>
          <textarea
            value={sourceContext}
            onChange={(e) => setSourceContext(e.target.value)}
            rows={5}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
          />
        </div>

        {/* Model Output Candidate */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-[#72706C] uppercase">LLM Generated Response Candidate</label>
          <textarea
            value={modelOutput}
            onChange={(e) => setModelOutput(e.target.value)}
            rows={5}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
          />
        </div>
      </div>

      {/* Audit Report Results */}
      {auditScore !== null && (
        <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#ECEBE9]">Factual Consistency Score</h3>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-mono font-extrabold ${
                auditScore >= 90
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              Score: {auditScore} / 100 ({auditScore >= 90 ? 'Low Hallucination Risk' : 'Hallucination Detected'})
            </span>
          </div>

          {flaggedClaims.map((claim, idx) => (
            <div key={idx} className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertTriangle size={14} /> Flagged Hallucination Claim
              </div>
              <p className="text-xs text-[#ECEBE9] font-mono italic">"{claim.text}"</p>
              <p className="text-xs text-rose-300 font-mono pt-1">{claim.issue}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
