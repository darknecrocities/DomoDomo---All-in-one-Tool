import React, { useState } from 'react';
import { Mail, ShieldAlert, ShieldCheck, AlertTriangle, Search, CheckCircle2 } from 'lucide-react';

export const PhishingDetectorTool: React.FC = () => {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeContent = () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setResult(null);

    // Simulate processing
    setTimeout(() => {
      let riskScore = 0; // 0 to 10
      const findings: { type: 'danger' | 'warning' | 'info'; text: string }[] = [];
      const lowerText = text.toLowerCase();

      // 1. Urgency / Threat Heuristics
      const urgencyWords = [
        'urgent', 'immediate', 'suspend', 'suspended', 'close your account', 
        'validate', 'verify your account', 'unauthorized access', 'within 24 hours',
        'past due', 'final notice', 'act now'
      ];
      const foundUrgency = urgencyWords.filter(w => lowerText.includes(w));
      if (foundUrgency.length > 0) {
        riskScore += Math.min(foundUrgency.length * 2, 4);
        findings.push({
          type: 'danger',
          text: `Found urgency/threat language (${foundUrgency.join(', ')}). Attackers use this to force quick, panicked actions.`
        });
      }

      // 2. Financial / Action Heuristics
      const financialWords = [
        'invoice', 'payment received', 'receipt', 'wire transfer', 'crypto', 
        'bitcoin', 'gift card', 'refund', 'tax return'
      ];
      const foundFinancial = financialWords.filter(w => lowerText.includes(w));
      if (foundFinancial.length > 0) {
        riskScore += 2;
        findings.push({
          type: 'warning',
          text: `Found financial requests (${foundFinancial.join(', ')}). Always verify invoices out-of-band (e.g. by calling the sender).`
        });
      }

      // 3. Generic Greeting Heuristics
      const genericGreetings = ['dear customer', 'dear user', 'dear member', 'attention user'];
      if (genericGreetings.some(g => lowerText.includes(g))) {
        riskScore += 2;
        findings.push({
          type: 'warning',
          text: 'Uses a generic greeting ("Dear Customer"). Legitimate companies usually address you by your full name.'
        });
      }

      // 4. Suspicious Link Heuristics
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex) || [];
      if (urls.length > 0) {
        let suspiciousLinkFound = false;
        urls.forEach(url => {
          if (url.includes('bit.ly') || url.includes('tinyurl') || url.includes('.xyz') || url.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}/)) {
            suspiciousLinkFound = true;
          }
        });

        if (suspiciousLinkFound) {
          riskScore += 4;
          findings.push({
            type: 'danger',
            text: 'Contains highly suspicious links (shortened URLs, IP addresses, or unusual top-level domains).'
          });
        } else {
          findings.push({
            type: 'info',
            text: `Contains ${urls.length} link(s). Hover over them in your actual email client to ensure they go where they claim to.`
          });
        }
      }

      // 5. Attachment Heuristics
      const attachmentWords = ['attached', 'attachment', 'view document', 'open file'];
      if (attachmentWords.some(w => lowerText.includes(w))) {
        findings.push({
          type: 'info',
          text: 'Mentions an attachment. Do NOT open unexpected attachments, especially .zip, .exe, or .docm files.'
        });
      }

      // Cap at 10
      riskScore = Math.min(10, riskScore);

      setResult({
        riskScore,
        findings,
        wordCount: text.split(/\s+/).filter(w => w.length > 0).length
      });
      setAnalyzing(false);
    }, 800);
  };

  const getRiskColor = (score: number) => {
    if (score >= 7) return 'text-rose-450';
    if (score >= 4) return 'text-amber-500';
    return 'text-[#3C6B4D]';
  };

  const getRiskBg = (score: number) => {
    if (score >= 7) return 'bg-rose-500/10 border-rose-500/30';
    if (score >= 4) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-[#3C6B4D]/10 border-[#3C6B4D]/30';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 7) return 'High Phishing Risk';
    if (score >= 4) return 'Suspicious Content';
    return 'Likely Safe / Routine';
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
          <Mail size={20} className="text-[#3C6B4D]" />
          Phishing Text Detector
        </h3>
        <p className="text-[#A3A09B] text-xs leading-relaxed">
          Paste the body of a suspicious email or text message below. This tool uses local heuristic rules 
          to identify psychological manipulation (urgency), generic greetings, and suspicious URL structures.
        </p>
      </div>

      <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the suspicious email text here..."
          className="w-full h-48 bg-[#18191B] border border-[#2A2D30] rounded-xl p-4 text-sm text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] transition-all resize-none placeholder:text-[#72706C]"
        />
        
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-[#72706C] font-mono">
            {text.length} characters
          </span>
          <button
            onClick={analyzeContent}
            disabled={analyzing || !text.trim()}
            className="btn-primary py-2 px-8 text-sm font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {analyzing ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Search size={16} />
            )}
            <span>Analyze Text</span>
          </button>
        </div>
      </div>

      {result && (
        <div className="flex flex-col gap-6">
          <div className={`glass-card p-8 border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${getRiskBg(result.riskScore)}`}>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#72706C]">Risk Assessment</span>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-extrabold tracking-tight ${getRiskColor(result.riskScore)}`}>
                  {getRiskLabel(result.riskScore)}
                </span>
                <span className={`text-sm font-bold px-2 py-1 rounded-lg border ${getRiskBg(result.riskScore)} ${getRiskColor(result.riskScore)}`}>
                  Score: {result.riskScore}/10
                </span>
              </div>
            </div>
            
            <div className="shrink-0">
              {result.riskScore >= 7 ? (
                <ShieldAlert size={64} className="text-rose-450 opacity-80" />
              ) : result.riskScore >= 4 ? (
                <AlertTriangle size={64} className="text-amber-500 opacity-80" />
              ) : (
                <ShieldCheck size={64} className="text-[#3C6B4D] opacity-80" />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[#ECEBE9] text-sm flex items-center gap-2 uppercase tracking-wider text-[#72706C]">
              Heuristic Findings
            </h4>
            
            <div className="flex flex-col gap-3">
              {result.findings.length === 0 ? (
                <div className="glass-card p-6 border-[#3C6B4D]/30 bg-[#3C6B4D]/5 flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#3C6B4D] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[#ECEBE9] text-sm">No Obvious Threats</span>
                    <span className="text-[#A3A09B] text-xs leading-relaxed">
                      The text doesn't contain common phishing indicators like urgent language or suspicious links. 
                      However, sophisticated spear-phishing attacks can bypass these basic checks. Always verify the sender's actual address.
                    </span>
                  </div>
                </div>
              ) : (
                result.findings.map((f: any, i: number) => (
                  <div key={i} className={`glass-card p-5 border flex items-start gap-3 ${
                    f.type === 'danger' ? 'border-rose-500/30 bg-rose-500/5' : 
                    f.type === 'warning' ? 'border-amber-500/30 bg-amber-500/5' : 
                    'border-[#2A2D30] bg-[#18191B]'
                  }`}>
                    <div className="shrink-0 mt-0.5">
                      {f.type === 'danger' ? <ShieldAlert size={18} className="text-rose-450" /> : 
                       f.type === 'warning' ? <AlertTriangle size={18} className="text-amber-500" /> : 
                       <Search size={18} className="text-[#3C6B4D]" />}
                    </div>
                    <span className="text-xs text-[#ECEBE9] leading-relaxed mt-0.5">
                      {f.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
