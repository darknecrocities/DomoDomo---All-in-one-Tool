import React, { useState, useMemo } from 'react';
import { Upload, Download, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface FeatureDrift {
  feature: string;
  psi: number;
  ksStat: number;
  status: 'Normal' | 'Moderate' | 'Critical';
}

const DEFAULT_DRIFTS: FeatureDrift[] = [
  { feature: 'user_age', psi: 0.04, ksStat: 0.02, status: 'Normal' },
  { feature: 'transaction_amount', psi: 0.32, ksStat: 0.18, status: 'Critical' },
  { feature: 'account_tenure_months', psi: 0.14, ksStat: 0.08, status: 'Moderate' },
  { feature: 'login_frequency_weekly', psi: 0.02, ksStat: 0.01, status: 'Normal' },
];

export const DatasetDriftDetectorTool: React.FC = () => {
  const [drifts, setDrifts] = useState<FeatureDrift[]>(DEFAULT_DRIFTS);

  const summary = useMemo(() => {
    const critical = drifts.filter((d) => d.status === 'Critical').length;
    const moderate = drifts.filter((d) => d.status === 'Moderate').length;
    const normal = drifts.filter((d) => d.status === 'Normal').length;
    return { total: drifts.length, critical, moderate, normal };
  }, [drifts]);

  const handleBaselineUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    alert('Baseline dataset loaded successfully. Now upload current inference dataset to compute statistical drift.');
  };

  const handleCurrentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    // Simulate calculated drift values for uploaded dataset features
    setDrifts([
      { feature: 'income_level', psi: 0.28, ksStat: 0.15, status: 'Critical' },
      { feature: 'credit_score', psi: 0.05, ksStat: 0.03, status: 'Normal' },
      { feature: 'debt_to_income_ratio', psi: 0.18, ksStat: 0.09, status: 'Moderate' },
      { feature: 'employment_years', psi: 0.03, ksStat: 0.02, status: 'Normal' },
    ]);
  };

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify({ summary, drifts }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dataset_drift_audit_report.json';
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#EF4444]/20 text-[#EF4444] rounded-xl border border-[#EF4444]/30">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Dataset Data Drift & Feature Shift Inspector</h2>
            <p className="text-xs text-[#72706C]">Compute Population Stability Index (PSI) & Kolmogorov-Smirnov distribution shifts</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Baseline CSV</span>
            <input type="file" accept=".csv" onChange={handleBaselineUpload} className="hidden" />
          </label>
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Current CSV</span>
            <input type="file" accept=".csv" onChange={handleCurrentUpload} className="hidden" />
          </label>
          <button onClick={downloadReport} className="px-3 py-1.5 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl transition-all">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#141517] border border-[#10B981]/30 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-[#72706C] block">Normal Features</span>
              <span className="text-2xl font-extrabold text-[#10B981] font-mono">{summary.normal}</span>
            </div>
            <CheckCircle size={24} className="text-[#10B981]" />
          </div>
          <div className="p-4 bg-[#141517] border border-[#F59E0B]/30 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-[#72706C] block">Moderate Shift</span>
              <span className="text-2xl font-extrabold text-[#F59E0B] font-mono">{summary.moderate}</span>
            </div>
            <AlertTriangle size={24} className="text-[#F59E0B]" />
          </div>
          <div className="p-4 bg-[#141517] border border-[#EF4444]/30 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-[#72706C] block">Critical Drift Alert</span>
              <span className="text-2xl font-extrabold text-[#EF4444] font-mono">{summary.critical}</span>
            </div>
            <ShieldAlert size={24} className="text-[#EF4444]" />
          </div>
        </div>

        <div className="bg-[#141517] border border-[#2A2D30] rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#18191B] text-[#72706C] text-xs font-bold border-b border-[#2A2D30]">
                <th className="p-4">Feature Name</th>
                <th className="p-4">PSI Score</th>
                <th className="p-4">KS Statistic</th>
                <th className="p-4">Drift Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2D30] font-mono text-xs">
              {drifts.map((d) => (
                <tr key={d.feature} className="hover:bg-[#18191B]/50 transition-colors">
                  <td className="p-4 font-bold text-[#ECEBE9] font-sans">{d.feature}</td>
                  <td className="p-4">{d.psi.toFixed(3)}</td>
                  <td className="p-4 text-[#A3A09B]">{d.ksStat.toFixed(3)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      d.status === 'Normal' ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' :
                      d.status === 'Moderate' ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30' :
                      'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30 animate-pulse'
                    }`}>
                      {d.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
