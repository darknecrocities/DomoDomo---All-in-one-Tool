import React, { useState } from 'react';
import { AreaChart, Plus, Trash, Check, Copy, Activity } from 'lucide-react';

interface StudyData {
  id: string;
  name: string;
  n: number;
  effectSize: number; // Cohen's d
  ciLower?: number;
  ciUpper?: number;
}

const META_PRESETS = [
  {
    name: 'Statins vs CVD Risk (5 Studies)',
    studies: [
      { id: '1', name: '4S Trial (1994)', n: 4444, effectSize: 0.32 },
      { id: '2', name: 'WOSCOPS (1995)', n: 6595, effectSize: 0.28 },
      { id: '3', name: 'CARE Trial (1996)', n: 4159, effectSize: 0.24 },
      { id: '4', name: 'LIPID Trial (1998)', n: 9014, effectSize: 0.29 },
      { id: '5', name: 'HPS Trial (2002)', n: 20536, effectSize: 0.31 },
    ],
  },
  {
    name: 'CBT vs Anxiety (4 Studies)',
    studies: [
      { id: '1', name: 'Borkovec et al. (1993)', n: 55, effectSize: 0.65 },
      { id: '2', name: 'Barlow et al. (2000)', n: 112, effectSize: 0.72 },
      { id: '3', name: 'Hunot et al. (2007)', n: 240, effectSize: 0.58 },
      { id: '4', name: 'Cuijpers et al. (2014)', n: 480, effectSize: 0.64 },
    ],
  },
];

export const MetaAnalysisAggregator: React.FC = () => {
  const [studies, setStudies] = useState<StudyData[]>(META_PRESETS[0].studies);
  const [newName, setNewName] = useState('');
  const [newN, setNewN] = useState(100);
  const [newEffectSize, setNewEffectSize] = useState(0.35);
  const [summary, setSummary] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleAddStudy = () => {
    if (!newName.trim()) return;
    setStudies([
      ...studies,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        n: Number(newN),
        effectSize: Number(newEffectSize)
      }
    ]);
    setNewName('');
  };

  const handleDeleteStudy = (id: string) => {
    setStudies(studies.filter((s) => s.id !== id));
  };

  const handleAggregate = () => {
    if (studies.length === 0) return;

    // Calculate individual Study Standard Errors & Confidence Intervals
    // SE = 1 / sqrt(n)
    const computedStudies = studies.map((s) => {
      const se = 1 / Math.sqrt(s.n);
      const ciLower = s.effectSize - 1.96 * se;
      const ciUpper = s.effectSize + 1.96 * se;
      return {
        ...s,
        se,
        ciLower,
        ciUpper,
        weight: 1 / (se * se) // Inverse variance weighting
      };
    });

    // Weighted mean calculation (Fixed Effect Model)
    const totalWeight = computedStudies.reduce((acc, s) => acc + s.weight, 0);
    const weightedSum = computedStudies.reduce((acc, s) => acc + s.effectSize * s.weight, 0);
    const pooledEffect = weightedSum / totalWeight;
    const pooledSE = Math.sqrt(1 / totalWeight);
    const pooledCiLower = pooledEffect - 1.96 * pooledSE;
    const pooledCiUpper = pooledEffect + 1.96 * pooledSE;

    // Cochran's Q and I-squared heterogeneity calculation
    let Q = 0;
    computedStudies.forEach((s) => {
      Q += s.weight * Math.pow(s.effectSize - pooledEffect, 2);
    });
    const df = studies.length - 1;
    const I2 = df > 0 ? Math.max(0, ((Q - df) / (Q || 1)) * 100) : 0;

    setSummary({
      studies: computedStudies,
      pooledEffect,
      pooledCiLower,
      pooledCiUpper,
      I2,
      totalN: studies.reduce((acc, s) => acc + s.n, 0)
    });
  };

  const handleCopyReport = () => {
    if (!summary) return;
    let report = `# Meta-Analysis Summary Report\n\n`;
    report += `- Total Included Studies: ${summary.studies.length}\n`;
    report += `- Cumulative Sample Size (N): ${summary.totalN}\n`;
    report += `- Pooled Effect Size (Cohen's d): ${summary.pooledEffect.toFixed(3)} [95% CI: ${summary.pooledCiLower.toFixed(3)} to ${summary.pooledCiUpper.toFixed(3)}]\n`;
    report += `- Heterogeneity (I²): ${summary.I2.toFixed(1)}%\n\n`;
    report += `### Included Study Weights & Bounds\n`;
    report += `| Study | Sample N | Effect (d) | 95% CI Lower | 95% CI Upper | Weight |\n`;
    report += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    summary.studies.forEach((s: any) => {
      report += `| ${s.name} | ${s.n} | ${s.effectSize.toFixed(2)} | ${s.ciLower.toFixed(2)} | ${s.ciUpper.toFixed(2)} | ${(s.weight / summary.studies.reduce((a: any, b: any) => a + b.weight, 0) * 100).toFixed(1)}% |\n`;
    });

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2D30] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl">
            <AreaChart size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Meta-Analysis Statistics Aggregator</h3>
            <p className="text-xs text-[#A3A09B]">
              Aggregate study effect sizes, calculate I² heterogeneity, and render interactive SVG Forest Plots offline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#72706C] font-semibold uppercase tracking-wider">Presets:</span>
          {META_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setStudies(p.studies);
                setSummary(null);
              }}
              className="text-[11px] px-2.5 py-1 bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D] rounded-lg transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Manager Form */}
        <div className="lg:col-span-1 bg-[#111213] border border-[#2A2D30] p-4 rounded-xl flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-bold text-[#ECEBE9]">Primary Studies Pool</span>
            <span className="text-[10px] text-[#72706C]">{studies.length} Studies</span>
          </div>

          <div className="flex flex-col gap-2 max-h-[180px] overflow-auto pr-1">
            {studies.map((s) => (
              <div key={s.id} className="flex justify-between items-center bg-[#18191B] px-3 py-2 rounded-lg border border-[#2A2D30] text-xs">
                <div>
                  <span className="font-bold block text-[#ECEBE9]">{s.name}</span>
                  <span className="text-[10px] text-[#72706C] font-mono">N={s.n} | d={s.effectSize}</span>
                </div>
                <button
                  onClick={() => handleDeleteStudy(s.id)}
                  className="text-rose-450 hover:text-rose-500 p-1"
                >
                  <Trash size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-[#2A2D30] pt-3">
            <span className="text-[10px] text-[#72706C] uppercase font-bold">Add Individual Study</span>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Study citation label"
              className="bg-[#18191B] border border-[#2A2D30] rounded-lg px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newN}
                onChange={(e) => setNewN(Number(e.target.value))}
                placeholder="Sample N"
                className="w-1/2 bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1.5 text-xs text-[#ECEBE9] font-mono"
              />
              <input
                type="number"
                step="0.05"
                value={newEffectSize}
                onChange={(e) => setNewEffectSize(Number(e.target.value))}
                placeholder="Effect (d)"
                className="w-1/2 bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1.5 text-xs text-[#ECEBE9] font-mono"
              />
            </div>
            <button
              onClick={handleAddStudy}
              className="btn-primary text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1 mt-1"
            >
              <Plus size={12} />
              <span>Add Study to Dataset</span>
            </button>
          </div>
        </div>

        {/* Aggregation Render Dashboard */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <button
            onClick={handleAggregate}
            disabled={studies.length === 0}
            className="w-full btn-primary py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2"
          >
            <Activity size={14} />
            <span>Compute Meta-Analysis & Render SVG Forest Plot</span>
          </button>

          {summary && (
            <div className="flex flex-col gap-4 bg-[#111213] border border-[#2A2D30] p-5 rounded-xl animate-fadeIn">
              {/* Stat badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#18191B] p-3 rounded-lg border border-[#2A2D30] text-center">
                  <span className="text-[9px] text-[#72706C] block uppercase font-bold">Pooled Effect (d)</span>
                  <span className="text-base font-extrabold text-[#3C6B4D] font-mono">{summary.pooledEffect.toFixed(2)}</span>
                </div>
                <div className="bg-[#18191B] p-3 rounded-lg border border-[#2A2D30] text-center">
                  <span className="text-[9px] text-[#72706C] block uppercase font-bold">95% Confidence Interval</span>
                  <span className="text-xs font-extrabold text-[#ECEBE9] font-mono">{summary.pooledCiLower.toFixed(2)} to {summary.pooledCiUpper.toFixed(2)}</span>
                </div>
                <div className="bg-[#18191B] p-3 rounded-lg border border-[#2A2D30] text-center">
                  <span className="text-[9px] text-[#72706C] block uppercase font-bold">Heterogeneity (I²)</span>
                  <span className="text-base font-extrabold text-[#E29E2D] font-mono">{summary.I2.toFixed(1)}%</span>
                </div>
                <div className="bg-[#18191B] p-3 rounded-lg border border-[#2A2D30] text-center">
                  <span className="text-[9px] text-[#72706C] block uppercase font-bold">Total Subjects (N)</span>
                  <span className="text-base font-extrabold text-[#3B82F6] font-mono">{summary.totalN.toLocaleString()}</span>
                </div>
              </div>

              {/* Interactive SVG Forest Plot */}
              <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-lg flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2 text-xs">
                  <span className="font-bold text-[#ECEBE9]">SVG Forest Plot (Effect Size & 95% CI)</span>
                  <button
                    onClick={handleCopyReport}
                    className="btn-secondary text-[11px] py-1 px-3 flex items-center gap-1"
                  >
                    {copied ? <Check size={12} className="text-[#3C6B4D]" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy Table'}</span>
                  </button>
                </div>

                <svg className="w-full h-48 bg-[#111213] rounded border border-[#2A2D30] p-2" viewBox="0 0 500 180">
                  {/* Zero line */}
                  <line x1="250" y1="10" x2="250" y2="150" stroke="#72706C" strokeDasharray="3 3" opacity="0.5" />

                  {/* Study Lines */}
                  {summary.studies.map((s: any, idx: number) => {
                    const y = 25 + idx * 25;
                    const xCenter = 250 + s.effectSize * 150;
                    const xMin = 250 + s.ciLower * 150;
                    const xMax = 250 + s.ciUpper * 150;

                    return (
                      <g key={s.id}>
                        <text x="10" y={y + 4} fill="#A3A09B" fontSize="10" fontFamily="monospace">{s.name}</text>
                        <line x1={xMin} y1={y} x2={xMax} y2={y} stroke="#3C6B4D" strokeWidth="2" />
                        <rect x={xCenter - 4} y={y - 4} width="8" height="8" fill="#3C6B4D" rx="1" />
                        <text x="440" y={y + 4} fill="#ECEBE9" fontSize="10" fontFamily="monospace">{s.effectSize.toFixed(2)}</text>
                      </g>
                    );
                  })}

                  {/* Summary Diamond */}
                  {(() => {
                    const yDiamond = 25 + summary.studies.length * 25 + 10;
                    const xCenter = 250 + summary.pooledEffect * 150;
                    const xMin = 250 + summary.pooledCiLower * 150;
                    const xMax = 250 + summary.pooledCiUpper * 150;
                    return (
                      <g>
                        <line x1="10" y1={yDiamond - 10} x2="490" y2={yDiamond - 10} stroke="#2A2D30" />
                        <text x="10" y={yDiamond + 4} fill="#ECEBE9" fontWeight="bold" fontSize="10" fontFamily="sans-serif">Pooled Effect (Fixed)</text>
                        <polygon
                          points={`${xMin},${yDiamond} ${xCenter},${yDiamond - 6} ${xMax},${yDiamond} ${xCenter},${yDiamond + 6}`}
                          fill="#E29E2D"
                        />
                        <text x="440" y={yDiamond + 4} fill="#E29E2D" fontWeight="bold" fontSize="10" fontFamily="monospace">{summary.pooledEffect.toFixed(2)}</text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MetaAnalysisAggregatorTool = {
  id: 'meta-analysis-aggregator',
  name: 'Meta-Analysis Statistics Aggregator',
  categories: ['investigation' as any],
  description: 'Aggregate study effect sizes, calculate I² heterogeneity, and render interactive SVG Forest Plots offline.',
  icon: 'AreaChart',
  run: async (input: any) => input,
  component: MetaAnalysisAggregator
};
