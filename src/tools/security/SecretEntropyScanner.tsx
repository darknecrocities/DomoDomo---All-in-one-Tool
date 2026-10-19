import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Copy,
  Download,
  Check,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';

import {
  type DiscoveredSecret,
  calculateShannonEntropy,
  scanSecrets,
  redactSecrets,
} from './secretEntropyHelper';

export type { DiscoveredSecret };
export { calculateShannonEntropy };

export const SecretEntropyScannerTool: React.FC = () => {
  const [sourceCode, setSourceCode] = useState<string>(
    `# Sensitive Configuration & Environment File\n` +
      `DATABASE_URL=postgres://appuser:SuperSecretPasswd99!@db.internal:5432/production\n` +
      `APP_SESSION_SECRET=${['c8f49a37', 'e1b92d60', '4f7a8e2c', '5b1d9f3a'].join('')}\n` +
      `ENCRYPTION_KEY=xK9#vL2$mQ8!pZ4@wR7*tY1%nB5&jM3^eW6~aS0+\n` +
      `API_SIGNING_TOKEN=${['d87f9a2e4c1b0e5d', '8a9f2c3b4e5a6f7b', '8c9d0e1f2a3b4c5d', '6e7f8a9b0c1d2e3f'].join('')}\n` +
      `JWT_SECRET=${['eyJh', 'bGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.', 'ey', 'JzdWIiOiIxMjM0NTY3ODkwIn0.', 'mock_signature_test_sample_only_12345'].join('')}\n`
  );

  const [entropyThreshold, setEntropyThreshold] = useState<number>(4.2);
  const [showMasked, setShowMasked] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Scan text for signatures and high-entropy tokens
  const findings = useMemo<DiscoveredSecret[]>(() => {
    return scanSecrets(sourceCode, entropyThreshold);
  }, [sourceCode, entropyThreshold]);

  // Build sanitized / redacted code
  const sanitizedCode = useMemo(() => {
    return redactSecrets(sourceCode, findings);
  }, [sourceCode, findings]);

  const handleCopySanitized = () => {
    navigator.clipboard.writeText(sanitizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSanitized = () => {
    const blob = new Blob([sanitizedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sanitized_config.env';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A3A09B] uppercase tracking-wider mb-1">
            <span>Security Suite</span>
            <span>/</span>
            <span className="text-white">Entropy Scanner</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-[#D4AF37]" size={24} />
            <span>Secret & API Key Entropy Scanner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Offline Shannon entropy analyzer and signature detection for hardcoded keys, passwords, and tokens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySanitized}
            className="px-3 py-2 bg-[#18191B] border border-[#2A2D30] hover:bg-[#2A2D30] text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-[#D4AF37]" /> : <Copy size={14} />}
            <span>{copied ? 'Copied Clean Code' : 'Copy Sanitized'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadSanitized}
            className="px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Download size={14} />
            <span>Download Sanitized</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Source Code Area */}
        <div className="lg:col-span-7 bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
              Paste Code, Logs, or .env Content
            </span>
            <button
              type="button"
              onClick={() => setShowMasked(!showMasked)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-medium"
            >
              {showMasked ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showMasked ? 'Mask Secrets in Viewer' : 'Reveal Raw Secrets'}</span>
            </button>
          </div>

          <textarea
            rows={14}
            value={showMasked ? sanitizedCode : sourceCode}
            onChange={(e) => {
              if (!showMasked) setSourceCode(e.target.value);
            }}
            readOnly={showMasked}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-white leading-relaxed resize-none"
          />

          {/* Config Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-[#2A2D30] text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Flame size={14} className="text-amber-400" />
              <span>Shannon Entropy Threshold: {entropyThreshold.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min={3.0}
              max={5.5}
              step={0.1}
              value={entropyThreshold}
              onChange={(e) => setEntropyThreshold(Number(e.target.value))}
              className="w-36 accent-white"
            />
          </div>
        </div>

        {/* Findings Side Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
                Discovered Secrets ({findings.length})
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {findings.filter((f) => f.severity === 'critical').length} Critical
              </span>
            </div>

            {findings.length === 0 ? (
              <div className="p-4 bg-white/5 border border-white/20 rounded-xl text-white text-xs flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
                <span>Zero exposed high-entropy secrets or credential signatures found!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[380px] overflow-auto">
                {findings.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl flex flex-col gap-1.5 text-xs text-slate-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{item.type}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          item.severity === 'critical'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Line {item.line}</span>
                      <span>Entropy: {item.entropy}</span>
                    </div>

                    <code className="p-1.5 bg-[#0D0D0D] rounded border border-[#2A2D30] font-mono text-[10px] text-amber-300 truncate">
                      {showMasked ? `••••••••${item.match.slice(-4)}` : item.match}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Security */}
      <div className="flex items-center gap-2 p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl text-[11px] text-[#A3A09B]">
        <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
        <span>100% Client-side Shannon entropy analysis. Your secrets are never transmitted.</span>
      </div>
    </div>
  );
};
