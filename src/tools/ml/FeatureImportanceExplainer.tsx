import React, { useState } from 'react';
import { Upload, Download, Cpu, BarChart } from 'lucide-react';

interface FeatureWeight {
  name: string;
  importance: number; // 0..1
  contribution: number; // -0.5..+0.5
}

const DEFAULT_FEATURES: FeatureWeight[] = [
  { name: 'credit_score', importance: 0.35, contribution: 0.22 },
  { name: 'annual_income', importance: 0.28, contribution: 0.18 },
  { name: 'debt_ratio', importance: 0.18, contribution: -0.15 },
  { name: 'age', importance: 0.11, contribution: 0.05 },
  { name: 'number_of_open_accounts', importance: 0.08, contribution: -0.04 },
];

export const FeatureImportanceExplainerTool: React.FC = () => {
  const [features, setFeatures] = useState<FeatureWeight[]>(DEFAULT_FEATURES);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        const parsed: FeatureWeight[] = lines.slice(1).map((line) => {
          const [name, impStr, contribStr] = line.split(',').map((s) => s.trim());
          return {
            name: name || 'Feature',
            importance: parseFloat(impStr) || 0.1,
            contribution: parseFloat(contribStr) || 0.0,
          };
        });
        if (parsed.length > 0) setFeatures(parsed);
      } catch (err) {
        alert('Invalid CSV. Required columns: name,importance,contribution');
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  const downloadCSV = () => {
    let csv = 'name,importance,contribution\n';
    features.forEach((f) => {
      csv += `${f.name},${f.importance},${f.contribution}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'feature_importance_shap.csv';
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#10B981]/20 text-[#10B981] rounded-xl border border-[#10B981]/30">
            <Cpu size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Feature Importance & SHAP Attribution Explainer</h2>
            <p className="text-xs text-[#72706C]">Visualize global feature importances and local prediction push contributions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Feature CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={downloadCSV} className="px-3 py-1.5 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto space-y-6">
        <div className="bg-[#141517] border border-[#2A2D30] rounded-2xl p-6 shadow-2xl space-y-4 max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-[#ECEBE9] flex items-center gap-2">
            <BarChart size={16} className="text-[#10B981]" />
            <span>Global Feature Importance Breakdown</span>
          </h3>

          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.name} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-[#ECEBE9]">{f.name}</span>
                  <span className="text-[#10B981]">{(f.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-[#18191B] border border-[#2A2D30] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3C6B4D] to-[#10B981] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, f.importance * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
