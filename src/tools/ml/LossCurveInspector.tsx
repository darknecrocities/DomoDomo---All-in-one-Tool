import React, { useState, useMemo } from 'react';
import { Upload, Download, Activity, CheckCircle } from 'lucide-react';

interface EpochLog {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAcc: number;
  valAcc: number;
}

const DEFAULT_LOGS: EpochLog[] = [
  { epoch: 1, trainLoss: 1.25, valLoss: 1.30, trainAcc: 0.55, valAcc: 0.52 },
  { epoch: 2, trainLoss: 0.95, valLoss: 1.05, trainAcc: 0.68, valAcc: 0.64 },
  { epoch: 3, trainLoss: 0.72, valLoss: 0.85, trainAcc: 0.76, valAcc: 0.72 },
  { epoch: 4, trainLoss: 0.55, valLoss: 0.78, trainAcc: 0.82, valAcc: 0.77 },
  { epoch: 5, trainLoss: 0.42, valLoss: 0.75, trainAcc: 0.86, valAcc: 0.79 },
  { epoch: 6, trainLoss: 0.32, valLoss: 0.79, trainAcc: 0.90, valAcc: 0.78 },
  { epoch: 7, trainLoss: 0.25, valLoss: 0.86, trainAcc: 0.93, valAcc: 0.77 },
];

export const LossCurveInspectorTool: React.FC = () => {
  const [logs, setLogs] = useState<EpochLog[]>(DEFAULT_LOGS);

  const diagnostics = useMemo(() => {
    if (logs.length === 0) return { bestEpoch: 1, minValLoss: 0, overfittingGap: 0 };
    let minLoss = logs[0].valLoss;
    let bestEp = logs[0].epoch;

    logs.forEach((l) => {
      if (l.valLoss < minLoss) {
        minLoss = l.valLoss;
        bestEp = l.epoch;
      }
    });

    const last = logs[logs.length - 1];
    const gap = last.valLoss - last.trainLoss;

    return { bestEpoch: bestEp, minValLoss: minLoss, overfittingGap: Math.max(0, gap) };
  }, [logs]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        const parsed: EpochLog[] = lines.slice(1).map((line, idx) => {
          const [ep, tL, vL, tA, vA] = line.split(',').map((s) => s.trim());
          return {
            epoch: parseInt(ep, 10) || idx + 1,
            trainLoss: parseFloat(tL) || 0.5,
            valLoss: parseFloat(vL) || 0.6,
            trainAcc: parseFloat(tA) || 0.8,
            valAcc: parseFloat(vA) || 0.75,
          };
        });
        if (parsed.length > 0) setLogs(parsed);
      } catch (err) {
        alert('Invalid CSV. Columns: epoch,trainLoss,valLoss,trainAcc,valAcc');
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({ diagnostics, logs }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'training_loss_diagnostics.json';
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#3B82F6]/20 text-[#3B82F6] rounded-xl border border-[#3B82F6]/30">
            <Activity size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Hyperparameter Loss Curve & Training Inspector</h2>
            <p className="text-xs text-[#72706C]">Detect overfitting gaps, early stopping epoch, and loss convergence</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Log CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={downloadJSON} className="px-3 py-1.5 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl transition-all">
            <Download size={14} /> Export Report JSON
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-80 bg-[#141517] border-r border-[#2A2D30] p-4 flex flex-col gap-4 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#72706C]">Training Health</h3>
          <div className="p-4 bg-[#18191B] border border-[#2A2D30] rounded-xl space-y-2">
            <span className="text-xs text-[#72706C]">Recommended Early Stopping Epoch</span>
            <span className="text-2xl font-extrabold text-[#10B981] font-mono block">Epoch {diagnostics.bestEpoch}</span>
            <span className="text-[10px] text-[#A3A09B] block">Min Val Loss: {diagnostics.minValLoss.toFixed(4)}</span>
          </div>

          <div className="p-4 bg-[#18191B] border border-[#2A2D30] rounded-xl space-y-2">
            <span className="text-xs text-[#72706C]">Overfitting Gap Index</span>
            <span className="text-xl font-extrabold text-[#F59E0B] font-mono block">{diagnostics.overfittingGap.toFixed(4)}</span>
          </div>
        </div>

        <div className="flex-1 bg-[#0D0E0F] p-6 flex flex-col items-center justify-center">
          <div className="max-w-xl w-full bg-[#141517] border border-[#2A2D30] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#ECEBE9] flex items-center gap-2">
              <CheckCircle size={16} className="text-[#3B82F6]" />
              <span>Loss Curve (Train vs Validation)</span>
            </h3>

            <svg viewBox="0 0 400 220" className="w-full h-auto bg-[#111213] rounded-xl border border-[#2A2D30] p-4">
              <polyline fill="none" stroke="#3B82F6" strokeWidth="2.5" points={logs.map((l, idx) => `${40 + idx * 50},${200 - l.trainLoss * 100}`).join(' ')} />
              <polyline fill="none" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="4,4" points={logs.map((l, idx) => `${40 + idx * 50},${200 - l.valLoss * 100}`).join(' ')} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
