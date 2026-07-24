import React, { useState } from 'react';
import { AreaChart, Plus, Trash } from 'lucide-react';

interface StudyData {
  id: string;
  name: string;
  n: number;
  effectSize: number; // Cohen's d
  ciLower?: number;
  ciUpper?: number;
}

export const MetaAnalysisAggregator: React.FC = () => {
  const [studies, setStudies] = useState<StudyData[]>([
    { id: '1', name: 'Smith et al. 2021', n: 45, effectSize: 0.35 },
    { id: '2', name: 'Mendoza et al. 2022', n: 60, effectSize: 0.52 },
    { id: '3', name: 'Alvarez et al. 2023', n: 30, effectSize: 0.18 },
  ]);

  const [newName, setNewName] = useState('');
  const [newN, setNewN] = useState(50);
  const [newEffectSize, setNewEffectSize] = useState(0.4);
  const [summary, setSummary] = useState<any>(null);

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
    // SE = sqrt( ((n1 + n2) / (n1 * n2)) + (d^2 / (2 * (n1 + n2))) )
    // As a simplification for single-sample study: SE = 1 / sqrt(n)
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
      Q += s.weight * Math.pow(s.effectSize - pooledEffect, 0);
    });
    const df = studies.length - 1;
    const I2 = df > 0 ? Math.max(0, ((Q - df) / Q) * 100) : 0;

    setSummary({
      studies: computedStudies,
      pooledEffect,
      pooledCiLower,
      pooledCiUpper,
      I2,
      totalN: studies.reduce((acc, s) => acc + s.n, 0)
    });
  };

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#3C6B4D]/10 text-[#3C6B4D] rounded-lg">
          <AreaChart size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Meta-Analysis Statistics Aggregator</h3>
          <p className="text-xs text-[#A3A09B]">Aggregate study effect sizes, calculate pooling metrics, and render visual SVG Forest Plots client-side.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Manager Form */}
        <div className="lg:col-span-1 bg-[#111213] border border-[#2A2D30] p-4 rounded-xl flex flex-col gap-4">
          <span className="text-xs font-semibold text-[#A3A09B] border-b border-[#2A2D30] pb-2">Individual Research Studies</span>
          
          <div className="flex flex-col gap-2 max-h-[160px] overflow-auto">
            {studies.map((s) => (
              <div key={s.id} className="flex justify-between items-center bg-[#18191B] px-3 py-1.5 rounded-lg border border-[#2A2D30] text-xs">
                <div>
                  <span className="font-semibold block">{s.name}</span>
                  <span className="text-[10px] text-[#A3A09B]">N={s.n} | d={s.effectSize}</span>
                </div>
                <button
                  onClick={() => handleDeleteStudy(s.id)}
                  className="text-rose-450 hover:text-rose-500 transition-colors"
                >
                  <Trash size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-[#2A2D30] pt-3">
            <span className="text-[10px] text-[#A3A09B] uppercase font-bold">Add Study Parameters</span>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Study citation label"
              className="bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1 text-xs text-[#ECEBE9] focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newN}
                onChange={(e) => setNewN(Number(e.target.value))}
                placeholder="N size"
                className="w-1/2 bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9]"
              />
              <input
                type="number"
                step="0.05"
                value={newEffectSize}
                onChange={(e) => setNewEffectSize(Number(e.target.value))}
                placeholder="Effect (d)"
                className="w-1/2 bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9]"
              />
            </div>
            <button
              onClick={handleAddStudy}
              className="btn-primary text-xs py-1 rounded-lg font-bold flex items-center justify-center gap-1 mt-1"
            >
              <Plus size={12} />
              <span>Add Study</span>
            </button>
          </div>
        </div>

        {/* Aggregation Render Dashboard */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <button
            onClick={handleAggregate}
            className="w-full btn-primary py-2 text-xs font-bold"
          >
            Compute Pooled Effect & Render Forest Plot
          </button>

          {summary && (
            <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl flex flex-col gap-4 animate-fadeIn">
              <div className="grid grid-cols-3 gap-2 text-center text-xs border-b border-[#2A2D30] pb-3">
                <div>
                  <span className="text-[#A3A09B] block text-[10px] uppercase font-semibold">Total Sample N</span>
                  <span className="font-bold text-[#ECEBE9]">{summary.totalN}</span>
                </div>
                <div>
                  <span className="text-[#A3A09B] block text-[10px] uppercase font-semibold">Pooled Effect (d)</span>
                  <span className="font-bold text-[#3C6B4D]">{summary.pooledEffect.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-[#A3A09B] block text-[10px] uppercase font-semibold">Heterogeneity (I²)</span>
                  <span className="font-bold text-[#ECEBE9]">{summary.I2.toFixed(1)}%</span>
                </div>
              </div>

              {/* SVG Forest Plot */}
              <div>
                <span className="text-[10px] text-[#A3A09B] uppercase font-bold block mb-2">Visual Forest Plot (Cohen's d & 95% CI)</span>
                <svg viewBox="0 0 400 180" className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg p-2">
                  {/* Axis Line */}
                  <line x1="50" y1="140" x2="350" y2="140" stroke="#2A2D30" strokeWidth="1" />
                  <line x1="200" y1="20" x2="200" y2="140" stroke="#A3A09B" strokeDasharray="3,3" strokeWidth="1" />
                  
                  {/* Axis Ticks */}
                  <text x="200" y="155" fill="#A3A09B" fontSize="8" textAnchor="middle">0.0 (Null)</text>
                  <text x="300" y="155" fill="#A3A09B" fontSize="8" textAnchor="middle">+1.0</text>
                  <text x="100" y="155" fill="#A3A09B" fontSize="8" textAnchor="middle">-1.0</text>

                  {/* Draw Individual Studies */}
                  {summary.studies.map((s: any, idx: number) => {
                    const y = 30 + idx * 25;
                    const x = 200 + s.effectSize * 100;
                    const xMin = Math.max(50, 200 + s.ciLower * 100);
                    const xMax = Math.min(350, 200 + s.ciUpper * 100);

                    return (
                      <g key={s.id}>
                        {/* Study Label */}
                        <text x="15" y={y + 3} fill="#ECEBE9" fontSize="8">{s.name}</text>
                        
                        {/* CI Line */}
                        <line x1={xMin} y1={y} x2={xMax} y2={y} stroke="#ECEBE9" strokeWidth="1" />
                        
                        {/* Point Estimate */}
                        <rect x={x - 3} y={y - 3} width="6" height="6" fill="#3C6B4D" />
                      </g>
                    );
                  })}

                  {/* Summary Pooled Estimate (Diamond shape) */}
                  <g>
                    <text x="15" y="125" fill="#3C6B4D" fontSize="8" fontWeight="bold">Pooled Summary (FE)</text>
                    {/* Diamond coordinates */}
                    {(() => {
                      const y = 122;
                      const x = 200 + summary.pooledEffect * 100;
                      const xMin = 200 + summary.pooledCiLower * 100;
                      const xMax = 200 + summary.pooledCiUpper * 100;
                      return (
                        <polygon
                          points={`${xMin},${y} ${x},${y-4} ${xMax},${y} ${x},${y+4}`}
                          fill="#3C6B4D"
                        />
                      );
                    })()}
                  </g>
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
  description: 'Aggregate study effect sizes, calculate pooling metrics, and render visual SVG Forest Plots client-side.',
  icon: 'AreaChart',
  run: async (input: any) => input,
  component: MetaAnalysisAggregator
};
