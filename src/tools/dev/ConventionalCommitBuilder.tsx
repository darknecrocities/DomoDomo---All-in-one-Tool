import React, { useState, useMemo } from 'react';
import {
  GitCommit,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Terminal,
  CheckCircle2,
} from 'lucide-react';

import {
  COMMIT_TYPES,
  formatConventionalCommit,
  formatGitCommitCommand,
  lintConventionalCommit,
} from './conventionalCommitHelper';

export { COMMIT_TYPES, formatConventionalCommit, formatGitCommitCommand, lintConventionalCommit };

export const ConventionalCommitBuilderTool: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('feat');
  const [scope, setScope] = useState<string>('auth');
  const [isBreaking, setIsBreaking] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('implement passkey biometric authentication');
  const [body, setBody] = useState<string>('Add WebAuthn credential registration and verification handlers with secure local fallback.');
  const [footerKey, setFooterKey] = useState<string>('Closes');
  const [footerValue, setFooterValue] = useState<string>('#102');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Formatted Conventional Commit Message
  const formattedCommit = useMemo(() => {
    return formatConventionalCommit({
      type: selectedType,
      scope,
      isBreaking,
      description,
      body,
      footerKey,
      footerValue,
    });
  }, [selectedType, scope, isBreaking, description, body, footerKey, footerValue]);

  // Bash git command representation
  const gitCommand = useMemo(() => {
    return formatGitCommitCommand({
      type: selectedType,
      scope,
      isBreaking,
      description,
      body,
      footerKey,
      footerValue,
    });
  }, [selectedType, scope, isBreaking, description, body, footerKey, footerValue]);

  // Linting Rules
  const lintIssues = useMemo(() => {
    return lintConventionalCommit(description, scope);
  }, [description, scope]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A3A09B] uppercase tracking-wider mb-1">
            <span>Developer Suite</span>
            <span>/</span>
            <span className="text-white">Git Conventions</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitCommit className="text-[#D4AF37]" size={24} />
            <span>Conventional Commit Builder & Linter</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Construct standardized Conventional Commits 1.0.0 messages with live linting and command generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopy(formattedCommit, 'msg')}
            className="px-3 py-2 bg-[#18191B] border border-[#2A2D30] hover:bg-[#2A2D30] text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            {copiedType === 'msg' ? <Check size={14} className="text-[#D4AF37]" /> : <Copy size={14} />}
            <span>{copiedType === 'msg' ? 'Copied Message' : 'Copy Message'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleCopy(gitCommand, 'cmd')}
            className="px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            {copiedType === 'cmd' ? <Check size={14} /> : <Terminal size={14} />}
            <span>Copy Git Command</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Builder Form */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Commit Type Selector */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
              1. Select Commit Type
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMIT_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setSelectedType(t.type)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    selectedType === t.type
                      ? 'bg-white text-black border-white shadow-md'
                      : 'bg-[#111213] border-[#2A2D30] text-slate-300 hover:border-[#72706C]'
                  }`}
                >
                  <span className="text-xs font-bold font-mono">{t.type}</span>
                  <span className={`text-[10px] truncate ${selectedType === t.type ? 'text-slate-700' : 'text-slate-500'}`}>
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scope & Description */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-4">
            <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
              2. Scope & Short Description
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">Optional Scope</label>
                <input
                  type="text"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="e.g. auth, api, ui"
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <label>Subject Line</label>
                  <span className={`font-mono ${description.length > 50 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {description.length} / 50 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="describe the change in lowercase imperative mood"
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="rounded accent-white w-4 h-4"
              />
              <span className="font-semibold text-amber-300">Mark as Breaking Change (!)</span>
            </label>
          </div>

          {/* Body & Footer */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
              3. Body & Trailer Footers
            </span>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400">Detailed Message Body (Optional)</label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Explain the motivation and context behind this commit..."
                className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-white text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">Footer Tag</label>
                <select
                  value={footerKey}
                  onChange={(e) => setFooterKey(e.target.value)}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                >
                  <option value="Closes">Closes #issue</option>
                  <option value="Fixes">Fixes #issue</option>
                  <option value="BREAKING CHANGE">BREAKING CHANGE</option>
                  <option value="Signed-off-by">Signed-off-by</option>
                  <option value="Co-authored-by">Co-authored-by</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">Footer Value</label>
                <input
                  type="text"
                  value={footerValue}
                  onChange={(e) => setFooterValue(e.target.value)}
                  placeholder="e.g. #42 or John Doe <john@example.com>"
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output & Linter Inspector */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Linter Checks */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#D4AF37]" />
              <span>Real-Time Commit Linter</span>
            </span>

            {lintIssues.length === 0 ? (
              <div className="p-3 bg-white/5 border border-white/20 rounded-xl text-white text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0" />
                <span>Passes all Conventional Commits 1.0.0 lint rules!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {lintIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                      issue.severity === 'error'
                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{issue.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formatted Preview */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
              Commit Preview
            </span>
            <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs font-mono text-white whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {formattedCommit}
            </pre>
          </div>

          {/* Shell Command */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-2">
            <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-1.5">
              <Terminal size={14} className="text-[#D4AF37]" />
              <span>Terminal Command</span>
            </span>
            <pre className="p-3 bg-[#0D0D0D] border border-[#2A2D30] rounded-xl text-[11px] font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto">
              {gitCommand}
            </pre>
          </div>
        </div>
      </div>

      {/* Footer Security */}
      <div className="flex items-center gap-2 p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl text-[11px] text-[#A3A09B]">
        <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
        <span>100% Client-side formatting. Adheres to Conventional Commits specification.</span>
      </div>
    </div>
  );
};
