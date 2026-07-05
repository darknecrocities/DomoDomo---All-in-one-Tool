import React, { useState, useMemo } from 'react';
import { Download, Sliders, AlertCircle, Copy, Check, FileSpreadsheet } from 'lucide-react';

export const CSVPivotAnalyzerTool = () => {
  const [csvText, setCsvText] = useState(`Product,Category,Region,Sales,Quantity
Laptop,Electronics,North,1200,1
Smartphone,Electronics,North,800,2
Smartwatch,Electronics,South,250,1
Laptop,Electronics,South,1200,1
Coffee Maker,Appliances,North,150,3
Blender,Appliances,South,80,1
Toaster,Appliances,North,45,2
Smartphone,Electronics,South,800,1
Coffee Maker,Appliances,South,150,1`);
  
  const [records, setRecords] = useState<any[]>([]);
  const [rowKey, setRowKey] = useState<string>('');
  const [columnKey, setColumnKey] = useState<string>('');
  const [valueKey, setValueKey] = useState<string>('');
  const [aggFunc, setAggFunc] = useState<'sum' | 'count' | 'avg' | 'min' | 'max'>('sum');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const parseCSV = (text: string) => {
    try {
      setErrorMsg(null);
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        throw new Error("CSV must contain at least a header row and one data row.");
      }

      // Simple CSV line parser split by comma but respecting quotes
      const parseLine = (line: string) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const headers = parseLine(lines[0]);
      const data: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const rowVals = parseLine(lines[i]);
        const obj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          const rawVal = rowVals[idx] || '';
          // Try parse numeric
          const num = Number(rawVal);
          obj[h] = !isNaN(num) && rawVal !== '' ? num : rawVal;
        });
        data.push(obj);
      }

      setRecords(data);
      setRowKey(headers[0] || '');
      setColumnKey(headers[1] || '');
      // Find numeric key for value aggregation if possible
      const numericKeys = headers.filter(h => typeof data[0]?.[h] === 'number');
      setValueKey(numericKeys[0] || headers[headers.length - 1] || '');
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to parse CSV.");
      setRecords([]);
    }
  };

  const headersList = useMemo(() => {
    if (records.length === 0) return [];
    return Object.keys(records[0]);
  }, [records]);

  // Pivot Table Generation Logic
  const pivotTableData = useMemo(() => {
    if (records.length === 0 || !rowKey) return null;

    // Get unique row dimensions
    const uniqueRows = Array.from(new Set(records.map(r => String(r[rowKey] !== undefined ? r[rowKey] : '(blank)')))).sort();
    
    // Get unique column dimensions (if columnKey set)
    const uniqueCols = columnKey 
      ? Array.from(new Set(records.map(r => String(r[columnKey] !== undefined ? r[columnKey] : '(blank)')))).sort()
      : ['Value'];

    // Matrix calculation
    const matrix: Record<string, Record<string, number[]>> = {};
    uniqueRows.forEach(rVal => {
      matrix[rVal] = {};
      uniqueCols.forEach(cVal => {
        matrix[rVal][cVal] = [];
      });
    });

    records.forEach(r => {
      const rVal = String(r[rowKey] !== undefined ? r[rowKey] : '(blank)');
      const cVal = columnKey ? String(r[columnKey] !== undefined ? r[columnKey] : '(blank)') : 'Value';
      
      const v = Number(r[valueKey]);
      const actualVal = !isNaN(v) ? v : 1; // fallback to 1 for counts
      
      if (matrix[rVal]?.[cVal] !== undefined) {
        matrix[rVal][cVal].push(actualVal);
      }
    });

    // Aggregate matrix
    const finalGrid: Record<string, Record<string, number>> = {};
    const rowTotals: Record<string, number> = {};
    const colTotals: Record<string, number[]> = {};
    
    uniqueCols.forEach(cVal => {
      colTotals[cVal] = [];
    });

    uniqueRows.forEach(rVal => {
      finalGrid[rVal] = {};
      const rowVals: number[] = [];

      uniqueCols.forEach(cVal => {
        const arr = matrix[rVal][cVal];
        let val = 0;

        if (arr.length > 0) {
          if (aggFunc === 'sum') {
            val = arr.reduce((a, b) => a + b, 0);
          } else if (aggFunc === 'count') {
            val = arr.length;
          } else if (aggFunc === 'avg') {
            val = arr.reduce((a, b) => a + b, 0) / arr.length;
          } else if (aggFunc === 'min') {
            val = Math.min(...arr);
          } else if (aggFunc === 'max') {
            val = Math.max(...arr);
          }
        }

        finalGrid[rVal][cVal] = val;
        rowVals.push(val);
        colTotals[cVal].push(val);
      });

      // Compute Row Aggregation
      rowTotals[rVal] = aggFunc === 'sum' || aggFunc === 'count'
        ? rowVals.reduce((a, b) => a + b, 0)
        : (aggFunc === 'avg' ? (rowVals.reduce((a, b) => a + b, 0) / rowVals.length) : (aggFunc === 'min' ? Math.min(...rowVals) : Math.max(...rowVals)));
    });

    // Compute Grand Totals
    const grandTotals: Record<string, number> = {};
    let allGrandVals: number[] = [];
    uniqueCols.forEach(cVal => {
      const arr = colTotals[cVal];
      const val = aggFunc === 'sum' || aggFunc === 'count'
        ? arr.reduce((a, b) => a + b, 0)
        : (aggFunc === 'avg' ? (arr.reduce((a, b) => a + b, 0) / arr.length) : (aggFunc === 'min' ? Math.min(...arr) : Math.max(...arr)));
      grandTotals[cVal] = val;
      allGrandVals.push(val);
    });

    const finalGrandTotal = aggFunc === 'sum' || aggFunc === 'count'
      ? allGrandVals.reduce((a, b) => a + b, 0)
      : (aggFunc === 'avg' ? (allGrandVals.reduce((a, b) => a + b, 0) / allGrandVals.length) : (aggFunc === 'min' ? Math.min(...allGrandVals) : Math.max(...allGrandVals)));

    return {
      uniqueRows,
      uniqueCols,
      grid: finalGrid,
      rowTotals,
      grandTotals,
      finalGrandTotal
    };
  }, [records, rowKey, columnKey, valueKey, aggFunc]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvText(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const getPivotCSV = () => {
    if (!pivotTableData) return '';
    const headers = [rowKey, ...pivotTableData.uniqueCols, 'Grand Total'];
    const rows = pivotTableData.uniqueRows.map(rVal => {
      return [
        rVal,
        ...pivotTableData.uniqueCols.map(cVal => pivotTableData.grid[rVal][cVal]),
        pivotTableData.rowTotals[rVal]
      ];
    });
    const footer = [
      'Grand Total',
      ...pivotTableData.uniqueCols.map(cVal => pivotTableData.grandTotals[cVal]),
      pivotTableData.finalGrandTotal
    ];
    return [headers, ...rows, footer].map(r => r.join(',')).join('\n');
  };

  const handleCopy = () => {
    const text = getPivotCSV();
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownload = () => {
    const text = getPivotCSV();
    if (text) {
      const blob = new Blob([text], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pivot_report_${rowKey.toLowerCase()}_vs_${columnKey.toLowerCase()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration column */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2.5 flex items-center gap-1.5">
            <Sliders size={15} className="text-[#3C6B4D]" />
            <span>Pivot Builder Settings</span>
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Upload CSV Document</label>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".csv"
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Paste Raw CSV Lines</label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={8}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>

          <button
            onClick={() => parseCSV(csvText)}
            className="py-2.5 px-4 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <FileSpreadsheet size={13} />
            <span>Process & Map CSV</span>
          </button>

          {errorMsg && (
            <div className="bg-rose-950/20 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {records.length > 0 && (
            <div className="space-y-3.5 border-t border-[#2A2D30] pt-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Row Grouping (Rows)</label>
                <select
                  value={rowKey}
                  onChange={(e) => setRowKey(e.target.value)}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] focus:outline-none"
                >
                  <option value="">-- Choose Row Dimension --</option>
                  {headersList.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Column Grouping (Columns)</label>
                <select
                  value={columnKey}
                  onChange={(e) => setColumnKey(e.target.value)}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] focus:outline-none"
                >
                  <option value="">-- No Columns (Single Value Summary) --</option>
                  {headersList.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Value Column</label>
                  <select
                    value={valueKey}
                    onChange={(e) => setValueKey(e.target.value)}
                    className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] focus:outline-none"
                  >
                    {headersList.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Aggregator</label>
                  <select
                    value={aggFunc}
                    onChange={(e) => setAggFunc(e.target.value as any)}
                    className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] focus:outline-none"
                  >
                    <option value="sum">SUM</option>
                    <option value="count">COUNT</option>
                    <option value="avg">AVERAGE</option>
                    <option value="min">MINIMUM</option>
                    <option value="max">MAXIMUM</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid container */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card bg-[#18191B] p-6 border border-[#2A2D30] rounded-2xl flex flex-col gap-4">
          <div className="pb-3 border-b border-[#2A2D30] flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-[#ECEBE9]">Pivot Results Summary</h4>
            {pivotTableData && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="py-1 px-3 bg-[#111213] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg text-xs font-bold border border-[#2A2D30] flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>Copy CSV</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="py-1 px-3 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download size={12} />
                  <span>Export CSV</span>
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto bg-[#111213] border border-[#2A2D30] rounded-xl">
            {!pivotTableData ? (
              <div className="text-center p-12 space-y-1.5 text-xs text-[#A3A09B]">
                <p className="font-semibold">No active pivot configuration.</p>
                <p className="text-[#72706C]">Upload or paste a CSV above and click process to generate reports.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#18191B] border-b border-[#2A2D30]">
                    <th className="p-3 text-[#A3A09B] font-extrabold">{rowKey}</th>
                    {pivotTableData.uniqueCols.map(c => (
                      <th key={c} className="p-3 text-[#A3A09B] font-extrabold">{c}</th>
                    ))}
                    <th className="p-3 text-[#3C6B4D] font-extrabold">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D30]/40 text-[#ECEBE9]">
                  {pivotTableData.uniqueRows.map(rVal => (
                    <tr key={rVal} className="hover:bg-[#1E2022]/40 transition-colors">
                      <td className="p-3 font-semibold text-[#A3A09B]">{rVal}</td>
                      {pivotTableData.uniqueCols.map(cVal => {
                        const val = pivotTableData.grid[rVal][cVal];
                        return (
                          <td key={cVal} className="p-3 font-mono">
                            {typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0}
                          </td>
                        );
                      })}
                      <td className="p-3 font-mono font-bold text-emerald-450 bg-[#3C6B4D]/5">
                        {pivotTableData.rowTotals[rVal].toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {/* Grand total footer */}
                  <tr className="bg-[#18191B]/80 font-bold border-t border-[#2A2D30]">
                    <td className="p-3 text-[#A3A09B]">Grand Total</td>
                    {pivotTableData.uniqueCols.map(cVal => (
                      <td key={cVal} className="p-3 font-mono text-emerald-450">
                        {pivotTableData.grandTotals[cVal].toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                    ))}
                    <td className="p-3 font-mono text-emerald-400 bg-[#3C6B4D]/10">
                      {pivotTableData.finalGrandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
