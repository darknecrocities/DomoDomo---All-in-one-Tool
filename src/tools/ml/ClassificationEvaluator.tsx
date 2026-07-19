import React, { useState, useMemo } from 'react';
import { Upload, Download, Sliders, BarChart2 } from 'lucide-react';

interface PredictionRow {
  id: number;
  trueLabel: string;
  predLabel: string;
  confidence: number;
}

const SAMPLE_DATA: PredictionRow[] = [
  { id: 1, trueLabel: 'Cat', predLabel: 'Cat', confidence: 0.94 },
  { id: 2, trueLabel: 'Cat', predLabel: 'Cat', confidence: 0.88 },
  { id: 3, trueLabel: 'Cat', predLabel: 'Dog', confidence: 0.52 },
  { id: 4, trueLabel: 'Dog', predLabel: 'Dog', confidence: 0.91 },
  { id: 5, trueLabel: 'Dog', predLabel: 'Dog', confidence: 0.85 },
  { id: 6, trueLabel: 'Dog', predLabel: 'Cat', confidence: 0.48 },
  { id: 7, trueLabel: 'Bird', predLabel: 'Bird', confidence: 0.97 },
  { id: 8, trueLabel: 'Bird', predLabel: 'Cat', confidence: 0.61 },
  { id: 9, trueLabel: 'Cat', predLabel: 'Cat', confidence: 0.95 },
  { id: 10, trueLabel: 'Dog', predLabel: 'Dog', confidence: 0.89 },
];

export const ClassificationEvaluatorTool: React.FC = () => {
  const [data, setData] = useState<PredictionRow[]>(SAMPLE_DATA);
  const [threshold, setThreshold] = useState<number>(0.5);
  const [showPercentage, setShowPercentage] = useState<boolean>(false);

  const classes = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      set.add(d.trueLabel);
      set.add(d.predLabel);
    });
    return Array.from(set).sort();
  }, [data]);

  const matrix = useMemo(() => {
    const grid: Record<string, Record<string, number>> = {};
    classes.forEach((c1) => {
      grid[c1] = {};
      classes.forEach((c2) => {
        grid[c1][c2] = 0;
      });
    });

    data.forEach((d) => {
      const adjustedPred = d.confidence < threshold ? (classes.find((c) => c !== d.trueLabel) || d.predLabel) : d.predLabel;
      if (grid[d.trueLabel] && grid[d.trueLabel][adjustedPred] !== undefined) {
        grid[d.trueLabel][adjustedPred] += 1;
      }
    });

    return grid;
  }, [data, classes, threshold]);

  const metrics = useMemo(() => {
    let total = data.length;
    if (total === 0) return { accuracy: 0, precision: 0, recall: 0, f1: 0 };
    let correct = 0;
    classes.forEach((c) => {
      correct += matrix[c]?.[c] || 0;
    });

    const accuracy = correct / total;
    // Macro Average Precision & Recall
    let sumP = 0;
    let sumR = 0;
    classes.forEach((c) => {
      let tp = matrix[c]?.[c] || 0;
      let fp = 0;
      let fn = 0;
      classes.forEach((other) => {
        if (other !== c) {
          fp += matrix[other]?.[c] || 0;
          fn += matrix[c]?.[other] || 0;
        }
      });
      const p = tp + fp > 0 ? tp / (tp + fp) : 0;
      const r = tp + fn > 0 ? tp / (tp + fn) : 0;
      sumP += p;
      sumR += r;
    });

    const precision = sumP / classes.length;
    const recall = sumR / classes.length;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return { accuracy, precision, recall, f1 };
  }, [matrix, data, classes]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          setData(parsed);
        } else {
          // CSV Parsing
          const lines = text.split('\n').filter((l) => l.trim());
          const rows: PredictionRow[] = lines.slice(1).map((line, idx) => {
            const [trueLabel, predLabel, confStr] = line.split(',').map((s) => s.trim());
            return {
              id: idx + 1,
              trueLabel: trueLabel || 'ClassA',
              predLabel: predLabel || 'ClassA',
              confidence: parseFloat(confStr) || 0.8,
            };
          });
          if (rows.length > 0) setData(rows);
        }
      } catch (err) {
        alert('Could not parse file. Ensure valid CSV with columns: trueLabel,predLabel,confidence');
      }
    };
    reader.readAsText(file);
  };

  const downloadReport = () => {
    const report = {
      totalSamples: data.length,
      metrics: {
        accuracy: (metrics.accuracy * 100).toFixed(2) + '%',
        precision: (metrics.precision * 100).toFixed(2) + '%',
        recall: (metrics.recall * 100).toFixed(2) + '%',
        f1Score: (metrics.f1 * 100).toFixed(2) + '%',
      },
      confusionMatrix: matrix,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'classification_evaluation_report.json';
    link.click();
  };

  const downloadMatrixCSV = () => {
    let csv = `True/Pred,${classes.join(',')}\n`;
    classes.forEach((r) => {
      const rowVals = classes.map((c) => matrix[r][c]);
      csv += `${r},${rowVals.join(',')}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'confusion_matrix.csv';
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl border border-[#3C6B4D]/30">
            <BarChart2 size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Model Classification Evaluator</h2>
            <p className="text-xs text-[#72706C]">Compute Accuracy, F1-Score, Precision, Recall & Confusion Matrix</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload CSV / JSON</span>
            <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-[#ECEBE9] rounded-xl text-xs font-semibold transition-all"
          >
            <Download size={14} />
            <span>Export JSON Report</span>
          </button>
          <button
            onClick={downloadMatrixCSV}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-[#ECEBE9] rounded-xl text-xs font-semibold transition-all"
          >
            <Download size={14} />
            <span>Export Matrix CSV</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Controls Sidebar */}
        <div className="w-full md:w-80 bg-[#141517] border-r border-[#2A2D30] p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#72706C]">Evaluation Metrics</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl">
                <span className="text-[10px] text-[#72706C] block">Accuracy</span>
                <span className="text-base font-bold text-[#10B981] font-mono">{(metrics.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl">
                <span className="text-[10px] text-[#72706C] block">F1 Score</span>
                <span className="text-base font-bold text-[#3B82F6] font-mono">{(metrics.f1 * 100).toFixed(1)}%</span>
              </div>
              <div className="p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl">
                <span className="text-[10px] text-[#72706C] block">Precision</span>
                <span className="text-base font-bold text-[#F59E0B] font-mono">{(metrics.precision * 100).toFixed(1)}%</span>
              </div>
              <div className="p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl">
                <span className="text-[10px] text-[#72706C] block">Recall</span>
                <span className="text-base font-bold text-[#EC4899] font-mono">{(metrics.recall * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#2A2D30]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#72706C]">Confidence Threshold</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#A3A09B]">Decision Threshold</span>
                <span className="text-[#3C6B4D] font-bold">{threshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.95"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#3C6B4D] cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#2A2D30]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#72706C]">Display Settings</h3>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#ECEBE9] cursor-pointer">
              <input
                type="checkbox"
                checked={showPercentage}
                onChange={(e) => setShowPercentage(e.target.checked)}
                className="rounded accent-[#3C6B4D]"
              />
              Show Percentage Matrix
            </label>
          </div>
        </div>

        {/* Confusion Matrix Viewport */}
        <div className="flex-1 bg-[#0D0E0F] relative p-6 overflow-auto flex flex-col items-center justify-center">
          <div className="max-w-xl w-full bg-[#141517] border border-[#2A2D30] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#ECEBE9] flex items-center gap-2">
              <Sliders size={16} className="text-[#3C6B4D]" />
              <span>Confusion Matrix Heatmap</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-xs font-bold text-[#72706C] border-b border-[#2A2D30]">Actual \ Predicted</th>
                    {classes.map((c) => (
                      <th key={c} className="p-2 text-xs font-bold text-[#ECEBE9] border-b border-[#2A2D30] font-mono">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classes.map((r) => {
                    const rowTotal = classes.reduce((sum, c) => sum + matrix[r][c], 0);
                    return (
                      <tr key={r}>
                        <td className="p-2 text-xs font-bold text-[#ECEBE9] border-r border-[#2A2D30] font-mono">{r}</td>
                        {classes.map((c) => {
                          const val = matrix[r][c];
                          const pct = rowTotal > 0 ? (val / rowTotal) * 100 : 0;
                          const isDiagonal = r === c;
                          return (
                            <td
                              key={c}
                              className={`p-4 text-xs font-bold font-mono border border-[#2A2D30]/40 transition-all ${
                                isDiagonal ? 'bg-[#3C6B4D]/30 text-[#10B981]' : val > 0 ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#18191B] text-[#72706C]'
                              }`}
                            >
                              {showPercentage ? `${pct.toFixed(0)}%` : val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
