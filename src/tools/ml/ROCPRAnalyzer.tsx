import React, { useState, useMemo } from 'react';
import { Upload, Download, Activity, Target } from 'lucide-react';

interface ProbPoint {
  yTrue: 0 | 1;
  prob: number;
}

const DEFAULT_POINTS: ProbPoint[] = [
  { yTrue: 1, prob: 0.95 }, { yTrue: 1, prob: 0.88 }, { yTrue: 1, prob: 0.82 },
  { yTrue: 1, prob: 0.76 }, { yTrue: 0, prob: 0.65 }, { yTrue: 1, prob: 0.62 },
  { yTrue: 0, prob: 0.55 }, { yTrue: 0, prob: 0.48 }, { yTrue: 1, prob: 0.45 },
  { yTrue: 0, prob: 0.35 }, { yTrue: 0, prob: 0.25 }, { yTrue: 0, prob: 0.12 },
];

export const ROCPRAnalyzerTool: React.FC = () => {
  const [data, setData] = useState<ProbPoint[]>(DEFAULT_POINTS);
  const [cutoff, setCutoff] = useState<number>(0.5);

  const curveData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.prob - a.prob);
    const totalP = sorted.filter((d) => d.yTrue === 1).length;
    const totalN = sorted.filter((d) => d.yTrue === 0).length;

    let tp = 0;
    let fp = 0;
    const points: Array<{ threshold: number; tpr: number; fpr: number; precision: number; recall: number }> = [];

    sorted.forEach((d) => {
      if (d.yTrue === 1) tp++;
      else fp++;

      const tpr = totalP > 0 ? tp / totalP : 0;
      const fpr = totalN > 0 ? fp / totalN : 0;
      const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
      const recall = tpr;

      points.push({ threshold: d.prob, tpr, fpr, precision, recall });
    });

    // Compute ROC AUC via Trapezoidal Rule
    let rocauc = 0;
    for (let i = 1; i < points.length; i++) {
      const dFpr = points[i].fpr - points[i - 1].fpr;
      const avgTpr = (points[i].tpr + points[i - 1].tpr) / 2;
      rocauc += dFpr * avgTpr;
    }

    return { points, totalP, totalN, rocauc: Math.max(0, Math.min(1, rocauc)) };
  }, [data]);

  const activeMetrics = useMemo(() => {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    data.forEach((d) => {
      const pred = d.prob >= cutoff ? 1 : 0;
      if (d.yTrue === 1 && pred === 1) tp++;
      if (d.yTrue === 0 && pred === 1) fp++;
      if (d.yTrue === 0 && pred === 0) tn++;
      if (d.yTrue === 1 && pred === 0) fn++;
    });

    const tpr = tp + fn > 0 ? tp / (tp + fn) : 0;
    const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tpr;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return { tp, fp, tn, fn, tpr, fpr, precision, recall, f1 };
  }, [data, cutoff]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        const parsed: ProbPoint[] = lines.slice(1).map((line) => {
          const [yStr, probStr] = line.split(',').map((s) => s.trim());
          return {
            yTrue: parseInt(yStr, 10) === 1 ? 1 : 0,
            prob: parseFloat(probStr) || 0,
          };
        });
        if (parsed.length > 0) setData(parsed);
      } catch (err) {
        alert('Invalid CSV format. Please provide columns: yTrue,prob');
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  const downloadCSV = () => {
    let csv = 'Threshold,TPR,FPR,Precision,Recall\n';
    curveData.points.forEach((p) => {
      csv += `${p.threshold.toFixed(4)},${p.tpr.toFixed(4)},${p.fpr.toFixed(4)},${p.precision.toFixed(4)},${p.recall.toFixed(4)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'roc_pr_threshold_table.csv';
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#3B82F6]/20 text-[#3B82F6] rounded-xl border border-[#3B82F6]/30">
            <Activity size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">ROC & Precision-Recall Curve Analyzer</h2>
            <p className="text-xs text-[#72706C]">Compute ROC AUC, PR AUC, and threshold decision tradeoffs</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-[#ECEBE9] rounded-xl text-xs font-semibold transition-all"
          >
            <Download size={14} />
            <span>Export Threshold Table</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-[#141517] border-r border-[#2A2D30] p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#72706C]">Summary Specs</h3>
            <div className="p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl flex justify-between items-center">
              <span className="text-xs text-[#A3A09B]">ROC AUC Score</span>
              <span className="text-base font-bold text-[#10B981] font-mono">{curveData.rocauc.toFixed(3)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#2A2D30]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#72706C]">Cutoff Scrubber</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#A3A09B]">Threshold</span>
                <span className="text-[#3B82F6] font-bold">{cutoff.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.01"
                value={cutoff}
                onChange={(e) => setCutoff(parseFloat(e.target.value))}
                className="w-full accent-[#3B82F6] cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-[#2A2D30] text-xs font-mono">
            <div className="flex justify-between"><span className="text-[#72706C]">True Positives (TP)</span><span className="text-[#10B981] font-bold">{activeMetrics.tp}</span></div>
            <div className="flex justify-between"><span className="text-[#72706C]">False Positives (FP)</span><span className="text-[#EF4444] font-bold">{activeMetrics.fp}</span></div>
            <div className="flex justify-between"><span className="text-[#72706C]">True Rate (TPR)</span><span className="text-[#ECEBE9]">{activeMetrics.tpr.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-[#72706C]">False Rate (FPR)</span><span className="text-[#ECEBE9]">{activeMetrics.fpr.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-[#72706C]">F1 Score</span><span className="text-[#3B82F6] font-bold">{activeMetrics.f1.toFixed(2)}</span></div>
          </div>
        </div>

        {/* SVG Plot */}
        <div className="flex-1 bg-[#0D0E0F] relative p-6 flex items-center justify-center overflow-auto">
          <div className="w-full max-w-xl bg-[#141517] border border-[#2A2D30] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#ECEBE9] flex items-center gap-2">
              <Target size={16} className="text-[#3B82F6]" />
              <span>ROC Curve (TPR vs FPR)</span>
            </h3>

            <svg viewBox="0 0 400 300" className="w-full h-auto bg-[#111213] rounded-xl border border-[#2A2D30] p-4">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="40" y2="260" stroke="#2A2D30" strokeWidth="1" />
              <line x1="40" y1="260" x2="380" y2="260" stroke="#2A2D30" strokeWidth="1" />
              {/* Diagonal baseline */}
              <line x1="40" y1="260" x2="380" y2="20" stroke="#72706C" strokeDasharray="4,4" strokeWidth="1" />

              {/* Curve path */}
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                points={`40,260 ${curveData.points.map((p) => `${40 + p.fpr * 340},${260 - p.tpr * 240}`).join(' ')}`}
              />

              {/* Active Cutoff Dot */}
              <circle
                cx={40 + activeMetrics.fpr * 340}
                cy={260 - activeMetrics.tpr * 240}
                r="6"
                fill="#3B82F6"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
