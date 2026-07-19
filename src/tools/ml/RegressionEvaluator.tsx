import React, { useState, useMemo } from 'react';
import { Upload, Download, TrendingUp, ScatterChart as ScatterIcon } from 'lucide-react';

interface RegressionRow {
  id: number;
  yTrue: number;
  yPred: number;
}

const DEFAULT_REGRESSION_DATA: RegressionRow[] = [
  { id: 1, yTrue: 100, yPred: 98 },
  { id: 2, yTrue: 150, yPred: 155 },
  { id: 3, yTrue: 200, yPred: 190 },
  { id: 4, yTrue: 250, yPred: 260 },
  { id: 5, yTrue: 300, yPred: 295 },
  { id: 6, yTrue: 350, yPred: 365 },
  { id: 7, yTrue: 400, yPred: 390 },
  { id: 8, yTrue: 450, yPred: 460 },
];

export const RegressionEvaluatorTool: React.FC = () => {
  const [data, setData] = useState<RegressionRow[]>(DEFAULT_REGRESSION_DATA);

  const metrics = useMemo(() => {
    const n = data.length;
    if (n === 0) return { mae: 0, mse: 0, rmse: 0, mape: 0, r2: 0 };

    let sumErr = 0;
    let sumSqErr = 0;
    let sumAbsErr = 0;
    let sumAbsPctErr = 0;
    let sumTrue = 0;

    data.forEach((d) => {
      const err = d.yTrue - d.yPred;
      sumErr += err;
      sumSqErr += err * err;
      sumAbsErr += Math.abs(err);
      if (d.yTrue !== 0) sumAbsPctErr += Math.abs(err / d.yTrue);
      sumTrue += d.yTrue;
    });

    const meanTrue = sumTrue / n;
    let totalSq = 0;
    data.forEach((d) => {
      totalSq += Math.pow(d.yTrue - meanTrue, 2);
    });

    const mae = sumAbsErr / n;
    const mse = sumSqErr / n;
    const rmse = Math.sqrt(mse);
    const mape = (sumAbsPctErr / n) * 100;
    const r2 = totalSq > 0 ? 1 - sumSqErr / totalSq : 0;

    return { mae, mse, rmse, mape, r2 };
  }, [data]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        const parsed: RegressionRow[] = lines.slice(1).map((line, idx) => {
          const [tStr, pStr] = line.split(',').map((s) => s.trim());
          return {
            id: idx + 1,
            yTrue: parseFloat(tStr) || 0,
            yPred: parseFloat(pStr) || 0,
          };
        });
        if (parsed.length > 0) setData(parsed);
      } catch (err) {
        alert('Invalid CSV format. Please provide columns: yTrue,yPred');
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({ metrics, sampleCount: data.length }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'regression_eval_report.json';
    link.click();
  };

  const downloadCSV = () => {
    let csv = 'id,yTrue,yPred,residual\n';
    data.forEach((d) => {
      csv += `${d.id},${d.yTrue},${d.yPred},${d.yTrue - d.yPred}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'regression_residuals.csv';
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F59E0B]/20 text-[#F59E0B] rounded-xl border border-[#F59E0B]/30">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Regression Metrics & Residual Diagnostics</h2>
            <p className="text-xs text-[#72706C]">Compute MAE, MSE, RMSE, R² and Residual Error Plots</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={downloadJSON} className="px-3 py-1.5 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl transition-all">
            <Download size={14} /> Export JSON
          </button>
          <button onClick={downloadCSV} className="px-3 py-1.5 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl transition-all">
            <Download size={14} /> Export Residuals CSV
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-80 bg-[#141517] border-r border-[#2A2D30] p-4 flex flex-col gap-4 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#72706C]">Regression Scorecard</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl">
              <span className="text-[10px] text-[#72706C] block">R² Score</span>
              <span className="text-base font-bold text-[#10B981] font-mono">{metrics.r2.toFixed(3)}</span>
            </div>
            <div className="p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl">
              <span className="text-[10px] text-[#72706C] block">RMSE</span>
              <span className="text-base font-bold text-[#F59E0B] font-mono">{metrics.rmse.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl">
              <span className="text-[10px] text-[#72706C] block">MAE</span>
              <span className="text-base font-bold text-[#3B82F6] font-mono">{metrics.mae.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl">
              <span className="text-[10px] text-[#72706C] block">MAPE</span>
              <span className="text-base font-bold text-[#EC4899] font-mono">{metrics.mape.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0D0E0F] p-6 flex flex-col items-center justify-center">
          <div className="max-w-xl w-full bg-[#141517] border border-[#2A2D30] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#2A2D30] pb-3">
              <h3 className="text-sm font-bold text-[#ECEBE9] flex items-center gap-2">
                <ScatterIcon size={16} className="text-[#F59E0B]" />
                <span>Actual vs Predicted Scatter Plot</span>
              </h3>
            </div>

            <svg viewBox="0 0 400 250" className="w-full h-auto bg-[#111213] rounded-xl border border-[#2A2D30] p-4">
              <line x1="40" y1="20" x2="40" y2="220" stroke="#2A2D30" strokeWidth="1" />
              <line x1="40" y1="220" x2="380" y2="220" stroke="#2A2D30" strokeWidth="1" />
              <line x1="40" y1="220" x2="380" y2="20" stroke="#72706C" strokeDasharray="4,4" strokeWidth="1" />
              {data.map((d) => {
                const cx = 40 + (d.yTrue / 500) * 340;
                const cy = 220 - (d.yPred / 500) * 200;
                return <circle key={d.id} cx={cx} cy={cy} r="4" fill="#F59E0B" opacity="0.8" />;
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
