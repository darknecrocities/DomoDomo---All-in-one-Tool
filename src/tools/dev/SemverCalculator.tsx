import React, { useState, useMemo } from 'react';
import {
  Tag,
  ArrowUpRight,
  Check,
  X,
  Copy,
  ShieldCheck,
  Sparkles,
  GitCompare,
  AlertTriangle,
} from 'lucide-react';
import {
  type ParsedSemver,
  parseSemver,
  compareSemver,
  satisfiesRange,
  calculateBumps,
  calculateDiff,
} from './semverHelper';

export type { ParsedSemver };
export { parseSemver, compareSemver, satisfiesRange, calculateBumps, calculateDiff };

export const SemverCalculatorTool: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<string>('1.4.2');
  const [targetVersion, setTargetVersion] = useState<string>('2.0.0');
  const [rangeQuery, setRangeQuery] = useState<string>('^1.4.0');
  const [testCandidates, setTestCandidates] = useState<string>('1.4.0, 1.4.2, 1.5.0, 2.0.0, 1.3.9');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const parsedCurrent = useMemo(() => parseSemver(currentVersion), [currentVersion]);
  const parsedTarget = useMemo(() => parseSemver(targetVersion), [targetVersion]);

  // Calculated Version Bumps
  const bumps = useMemo(() => {
    if (!parsedCurrent) return null;
    return calculateBumps(parsedCurrent);
  }, [parsedCurrent]);

  // Diff comparison between current & target
  const diffResult = useMemo(() => {
    if (!parsedCurrent || !parsedTarget) return null;
    return calculateDiff(parsedCurrent, parsedTarget);
  }, [parsedCurrent, parsedTarget]);

  // Range evaluation against candidate list
  const candidateResults = useMemo(() => {
    const list = testCandidates
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return list.map((cand) => {
      const parsed = parseSemver(cand);
      const satisfies = parsed ? satisfiesRange(parsed, rangeQuery) : false;
      return { version: cand, valid: !!parsed, satisfies };
    });
  }, [testCandidates, rangeQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A3A09B] uppercase tracking-wider mb-1">
            <span>Developer Suite</span>
            <span>/</span>
            <span className="text-white">SemVer Calculator</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tag className="text-[#D4AF37]" size={24} />
            <span>SemVer Calculator & Range Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Validate SemVer 2.0.0 strings, compute releases, and evaluate npm/Cargo range constraints offline.
          </p>
        </div>
      </div>

      {/* Version Input & Bumps Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Version Input Box */}
        <div className="md:col-span-5 bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-4">
          <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
            Current Base Version
          </span>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={currentVersion}
              onChange={(e) => setCurrentVersion(e.target.value)}
              placeholder="e.g. 1.4.2"
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-white"
            />
            {parsedCurrent ? (
              <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold">
                <Check size={14} />
                <span>Valid SemVer 2.0.0 string</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-red-400 font-semibold">
                <X size={14} />
                <span>Invalid SemVer syntax</span>
              </div>
            )}
          </div>

          {parsedCurrent && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#2A2D30] text-center font-mono">
              <div className="bg-[#111213] p-2 rounded-xl border border-[#2A2D30]">
                <span className="block text-[10px] text-slate-500 uppercase">Major</span>
                <span className="text-base font-bold text-white">{parsedCurrent.major}</span>
              </div>
              <div className="bg-[#111213] p-2 rounded-xl border border-[#2A2D30]">
                <span className="block text-[10px] text-slate-500 uppercase">Minor</span>
                <span className="text-base font-bold text-white">{parsedCurrent.minor}</span>
              </div>
              <div className="bg-[#111213] p-2 rounded-xl border border-[#2A2D30]">
                <span className="block text-[10px] text-slate-500 uppercase">Patch</span>
                <span className="text-base font-bold text-white">{parsedCurrent.patch}</span>
              </div>
            </div>
          )}
        </div>

        {/* Calculated Next Releases */}
        <div className="md:col-span-7 bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
          <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpRight size={14} className="text-[#D4AF37]" />
            <span>Calculated Next Version Bumps</span>
          </span>

          {bumps ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Patch Release', val: bumps.patch, desc: 'Bug fixes' },
                { label: 'Minor Release', val: bumps.minor, desc: 'New features' },
                { label: 'Major Release', val: bumps.major, desc: 'Breaking change' },
                { label: 'Pre-Patch', val: bumps.prepatch, desc: 'Beta bugfix' },
                { label: 'Pre-Minor', val: bumps.preminor, desc: 'Beta feature' },
                { label: 'Pre-Major', val: bumps.premajor, desc: 'Beta breaking' },
              ].map((bump) => (
                <div
                  key={bump.label}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 flex flex-col justify-between gap-2"
                >
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">{bump.label}</span>
                    <span className="font-mono text-xs font-bold text-white">{bump.val}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#2A2D30]/60">
                    <span className="text-[9px] text-slate-400">{bump.desc}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(bump.val)}
                      className="text-slate-400 hover:text-white"
                      title="Copy"
                    >
                      {copiedText === bump.val ? <Check size={12} className="text-[#D4AF37]" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-500">Provide a valid semver to calculate bumps.</span>
          )}
        </div>
      </div>

      {/* Version Diff & Breaking Risk Analyzer */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-4">
        <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-1.5">
          <GitCompare size={14} className="text-[#D4AF37]" />
          <span>Version Upgrade & Breaking Risk Diff</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">Target Comparison Version</label>
            <input
              type="text"
              value={targetVersion}
              onChange={(e) => setTargetVersion(e.target.value)}
              placeholder="e.g. 2.0.0"
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>

          {diffResult && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-3 ${
                diffResult.type === 'breaking'
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : diffResult.type === 'minor'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-[#111213] border-[#2A2D30] text-slate-200'
              }`}
            >
              <AlertTriangle size={18} className="shrink-0" />
              <div className="text-xs">
                <span className="font-bold block uppercase text-[10px]">{diffResult.type}</span>
                <span>{diffResult.desc}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dependency Range Evaluator */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-4">
        <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#D4AF37]" />
          <span>Dependency Range Satisfaction Matrix</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">Range Constraint (e.g. ^1.4.0, ~1.4.0, &gt;=1.0.0)</label>
            <input
              type="text"
              value={rangeQuery}
              onChange={(e) => setRangeQuery(e.target.value)}
              placeholder="^1.4.0"
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>
          <div className="md:col-span-8 flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">Candidate Version Matrix (comma-separated)</label>
            <input
              type="text"
              value={testCandidates}
              onChange={(e) => setTestCandidates(e.target.value)}
              placeholder="1.4.0, 1.4.2, 1.5.0, 2.0.0"
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Matrix Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {candidateResults.map((cand) => (
            <div
              key={cand.version}
              className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 ${
                cand.satisfies
                  ? 'bg-white text-black border-white'
                  : 'bg-[#111213] border-[#2A2D30] text-slate-500'
              }`}
            >
              {cand.satisfies ? <Check size={13} className="text-black" /> : <X size={13} />}
              <span>{cand.version}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Security */}
      <div className="flex items-center gap-2 p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl text-[11px] text-[#A3A09B]">
        <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
        <span>100% Client-side SemVer 2.0.0 algorithm. Zero network activity.</span>
      </div>
    </div>
  );
};
