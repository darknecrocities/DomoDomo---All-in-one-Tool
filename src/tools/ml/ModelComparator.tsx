import React, { useState } from 'react';
import { Upload, Download, Trophy } from 'lucide-react';

interface ModelEntry {
  name: string;
  accuracy: number;
  f1: number;
  precision: number;
  recall: number;
  latencyMs: number;
}

const DEFAULT_MODELS: ModelEntry[] = [
  { name: 'XGBoost Classifier', accuracy: 0.942, f1: 0.938, precision: 0.945, recall: 0.931, latencyMs: 12 },
  { name: 'Random Forest', accuracy: 0.915, f1: 0.910, precision: 0.920, recall: 0.901, latencyMs: 18 },
  { name: 'LightGBM', accuracy: 0.938, f1: 0.934, precision: 0.940, recall: 0.928, latencyMs: 8 },
  { name: 'Logistic Regression', accuracy: 0.840, f1: 0.832, precision: 0.845, recall: 0.820, latencyMs: 2 },
];

export const ModelComparatorTool: React.FC = () => {
  const [models, setModels] = useState<ModelEntry[]>(DEFAULT_MODELS);
  const [sortBy, setSortBy] = useState<'accuracy' | 'f1' | 'latencyMs'>('f1');

  const sortedModels = [...models].sort((a, b) => {
    if (sortBy === 'latencyMs') return a.latencyMs - b.latencyMs;
    return b[sortBy] - a[sortBy];
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        const parsed: ModelEntry[] = lines.slice(1).map((line) => {
          const [name, acc, f1, prec, rec, lat] = line.split(',').map((s) => s.trim());
          return {
            name: name || 'Custom Model',
            accuracy: parseFloat(acc) || 0.8,
            f1: parseFloat(f1) || 0.8,
            precision: parseFloat(prec) || 0.8,
            recall: parseFloat(rec) || 0.8,
            latencyMs: parseFloat(lat) || 10,
          };
        });
        if (parsed.length > 0) setModels(parsed);
      } catch (err) {
        alert('Invalid CSV format. Columns: name,accuracy,f1,precision,recall,latencyMs');
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  const downloadCSV = () => {
    let csv = 'name,accuracy,f1,precision,recall,latencyMs\n';
    sortedModels.forEach((m) => {
      csv += `${m.name},${m.accuracy},${m.f1},${m.precision},${m.recall},${m.latencyMs}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'model_leaderboard.csv';
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#EC4899]/20 text-[#EC4899] rounded-xl border border-[#EC4899]/30">
            <Trophy size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Multi-Model Leaderboard & Comparator</h2>
            <p className="text-xs text-[#72706C]">Compare Accuracy, F1, Precision, Recall, and Inference Latency across models</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Benchmark CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={downloadCSV} className="px-3 py-1.5 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl transition-all">
            <Download size={14} /> Export Leaderboard CSV
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex justify-between items-center bg-[#141517] p-4 rounded-xl border border-[#2A2D30]">
          <span className="text-xs font-bold text-[#A3A09B] uppercase tracking-wider">Sort Leaderboard By:</span>
          <div className="flex gap-2">
            {(['f1', 'accuracy', 'latencyMs'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                  sortBy === key ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border-[#3C6B4D]/40' : 'bg-[#18191B] text-[#72706C] border-[#2A2D30]'
                }`}
              >
                {key === 'latencyMs' ? 'Latency (Speed)' : key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#141517] border border-[#2A2D30] rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#18191B] text-[#72706C] text-xs font-bold border-b border-[#2A2D30]">
                <th className="p-4">Rank</th>
                <th className="p-4">Model Name</th>
                <th className="p-4">F1-Score</th>
                <th className="p-4">Accuracy</th>
                <th className="p-4">Precision</th>
                <th className="p-4">Recall</th>
                <th className="p-4">Latency (ms)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2D30]">
              {sortedModels.map((m, idx) => (
                <tr key={m.name} className="hover:bg-[#18191B]/50 transition-colors font-mono text-xs">
                  <td className="p-4 font-bold text-[#3C6B4D]">#{idx + 1}</td>
                  <td className="p-4 font-bold text-[#ECEBE9] font-sans">{m.name}</td>
                  <td className="p-4 text-[#10B981] font-bold">{(m.f1 * 100).toFixed(1)}%</td>
                  <td className="p-4 text-[#3B82F6]">{(m.accuracy * 100).toFixed(1)}%</td>
                  <td className="p-4 text-[#A3A09B]">{(m.precision * 100).toFixed(1)}%</td>
                  <td className="p-4 text-[#A3A09B]">{(m.recall * 100).toFixed(1)}%</td>
                  <td className="p-4 text-[#EC4899] font-bold">{m.latencyMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
