import { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Database, FileUp, Download, Table, BarChart2, RefreshCw, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import alasql from 'alasql';

interface TableMetaData {
  name: string;
  columns: string[];
  rowCount: number;
}

const sampleSales = [
  { product: 'Sneakers', category: 'Footwear', price: 120, quantity: 15, date: '2026-01-01' },
  { product: 'T-Shirt', category: 'Apparel', price: 35, quantity: 42, date: '2026-01-02' },
  { product: 'Hoodie', category: 'Apparel', price: 75, quantity: 28, date: '2026-01-03' },
  { product: 'Running Shoes', category: 'Footwear', price: 150, quantity: 12, date: '2026-01-04' },
  { product: 'Socks', category: 'Accessories', price: 12, quantity: 150, date: '2026-01-05' },
  { product: 'Backpack', category: 'Accessories', price: 90, quantity: 25, date: '2026-01-06' },
  { product: 'Cap', category: 'Accessories', price: 25, quantity: 60, date: '2026-01-07' }
];

export const SQLWorkbenchTool = () => {
  const [tables, setTables] = useState<TableMetaData[]>([]);
  const [query, setQuery] = useState<string>('SELECT category, SUM(price * quantity) AS total_revenue, SUM(quantity) AS items_sold \nFROM sales \nGROUP BY category\nORDER BY total_revenue DESC;');
  const [results, setResults] = useState<any[]>([]);
  const [resultColumns, setResultColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isQueryRunning, setIsQueryRunning] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Chart configuration states
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [xAxisKey, setXAxisKey] = useState<string>('');
  const [yAxisKey, setYAxisKey] = useState<string>('');
  const [showChart, setShowChart] = useState<boolean>(false);

  // Load sample dataset on mount
  useEffect(() => {
    try {
      alasql('DROP TABLE IF EXISTS sales');
      alasql('CREATE TABLE sales');
      alasql('SELECT * INTO sales FROM ?', [sampleSales]);
      
      setTables([
        {
          name: 'sales',
          columns: Object.keys(sampleSales[0]),
          rowCount: sampleSales.length
        }
      ]);
    } catch (e: any) {
      console.error(e);
    }
  }, []);

  // Set default chart keys when results change
  useEffect(() => {
    if (results.length > 0 && resultColumns.length >= 2) {
      // Find a numeric column for Y axis and categorical for X axis
      const sampleRow = results[0];
      const numericCol = resultColumns.find(col => typeof sampleRow[col] === 'number') || resultColumns[1];
      const textCol = resultColumns.find(col => typeof sampleRow[col] === 'string') || resultColumns[0];
      
      setXAxisKey(textCol);
      setYAxisKey(numericCol);
    }
  }, [results, resultColumns]);

  // Execute query handler
  const runQuery = useCallback(() => {
    if (!query.trim()) return;
    setIsQueryRunning(true);
    setError(null);
    setShowChart(false);

    // Minor delay to show loader spinner
    setTimeout(() => {
      try {
        const cleanedQuery = query.replace(/;\s*$/, '');
        const queryRes = alasql(cleanedQuery);
        
        if (Array.isArray(queryRes)) {
          setResults(queryRes);
          if (queryRes.length > 0) {
            setResultColumns(Object.keys(queryRes[0]));
          } else {
            setResultColumns([]);
          }
        } else {
          // Non-select queries return count or metadata
          setResults([{ result: String(queryRes) }]);
          setResultColumns(['result']);
        }
        setCurrentPage(1);
      } catch (err: any) {
        setError(err.message || 'SQL execution failed. Please verify syntax.');
        setResults([]);
        setResultColumns([]);
      } finally {
        setIsQueryRunning(false);
      }
    }, 100);
  }, [query]);

  // File Upload parsing
  const registerFileTable = (name: string, data: any[]) => {
    if (data.length === 0) return;
    const cleanName = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

    try {
      alasql(`DROP TABLE IF EXISTS ${cleanName}`);
      alasql(`CREATE TABLE ${cleanName}`);
      alasql(`SELECT * INTO ${cleanName} FROM ?`, [data]);

      const meta: TableMetaData = {
        name: cleanName,
        columns: Object.keys(data[0]),
        rowCount: data.length
      };

      setTables(prev => {
        const filtered = prev.filter(t => t.name !== cleanName);
        return [...filtered, meta];
      });
      
      // Update query input to let them inspect the new table
      setQuery(`SELECT * FROM ${cleanName} LIMIT 10;`);
    } catch (e: any) {
      setError(`Failed to create database table: ${e.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          registerFileTable(baseName, results.data);
        },
        error: (err) => {
          setError(`CSV parse error: ${err.message}`);
        }
      });
    } else if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const rows = Array.isArray(parsed) ? parsed : [parsed];
          registerFileTable(baseName, rows);
        } catch (err) {
          setError('Invalid JSON structure. Verify file contains a JSON array.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          registerFileTable(baseName, results.data);
        },
        error: (err) => {
          setError(`CSV parse error: ${err.message}`);
        }
      });
    } else if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const rows = Array.isArray(parsed) ? parsed : [parsed];
          registerFileTable(baseName, rows);
        } catch (err) {
          setError('Invalid JSON structure.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Exporters
  const downloadCSV = () => {
    if (results.length === 0) return;
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sql_query_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    if (results.length === 0) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sql_query_results.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Paginated data selectors
  const totalPages = Math.ceil(results.length / pageSize) || 1;
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, currentPage, pageSize]);

  // SVG Chart Calculator
  const chartData = useMemo(() => {
    if (!xAxisKey || !yAxisKey || results.length === 0) return [];
    
    // Group/Extract keys
    return results.slice(0, 15).map(row => {
      const xVal = String(row[xAxisKey] ?? 'Unknown');
      const yVal = parseFloat(row[yAxisKey]) || 0;
      return { label: xVal, value: yVal };
    });
  }, [results, xAxisKey, yAxisKey]);

  const maxChartValue = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(...chartData.map(d => d.value), 1);
  }, [chartData]);

  return (
    <div className="flex flex-col gap-6 text-left w-full">
      {/* Top Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Tables Schema Registry & File Drop */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-[#2A2D30]">
            <h3 className="font-bold text-sm text-[#ECEBE9] flex items-center gap-2">
              <Database size={16} className="text-[#3C6B4D]" />
              <span>In-Memory Tables</span>
            </h3>
            <span className="px-2 py-0.5 rounded bg-[#3C6B4D]/10 text-[#4E8E5E] border border-[#3C6B4D]/20 text-[9px] font-bold">
              SQLite (AlaSQL)
            </span>
          </div>

          {/* Tables schemas list */}
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {tables.length === 0 ? (
              <span className="text-[10px] text-[#72706C] italic py-4 block text-center">No active tables. Ingest a CSV or JSON below.</span>
            ) : (
              tables.map(table => (
                <div key={table.name} className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-[#ECEBE9]">{table.name}</span>
                    <span className="text-[10px] font-semibold text-[#72706C]">{table.rowCount} rows</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {table.columns.map(col => (
                      <span key={col} className="px-1.5 py-0.5 rounded bg-[#18191B] border border-[#2A2D30] font-mono text-[9px] text-[#A3A09B]">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ingest area */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
              dragOver ? 'border-[#3C6B4D] bg-[#3C6B4D]/5' : 'border-[#2A2D30] hover:border-[#3C6B4D]/40 bg-[#111213]/40'
            }`}
          >
            <FileUp size={24} className={dragOver ? 'text-[#3C6B4D]' : 'text-[#72706C]'} />
            <div className="text-center">
              <label className="text-[10px] font-bold text-[#ECEBE9] cursor-pointer hover:underline">
                Upload CSV / JSON
                <input 
                  type="file" 
                  accept=".csv,.json" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
              <p className="text-[9px] text-[#72706C] mt-0.5">Drag files here to automatically create a table</p>
            </div>
          </div>
        </div>

        {/* Right Side: Query console */}
        <div className="lg:col-span-8 flex flex-col gap-4 bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-[#2A2D30]">
            <h3 className="font-bold text-sm text-[#ECEBE9] flex items-center gap-2">
              <Play size={16} className="text-[#3C6B4D]" />
              <span>SQL Query Editor</span>
            </h3>
            
            {/* Quick Templates */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-[#72706C] uppercase">Templates:</span>
              <button 
                onClick={() => setQuery('SELECT * FROM sales LIMIT 5;')}
                className="px-2 py-0.5 rounded bg-[#111213] border border-[#2A2D30] text-[9px] font-bold text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D]/30 transition-all"
              >
                Inspect All
              </button>
              <button 
                onClick={() => setQuery('SELECT category, SUM(price * quantity) AS revenue \nFROM sales \nGROUP BY category;')}
                className="px-2 py-0.5 rounded bg-[#111213] border border-[#2A2D30] text-[9px] font-bold text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D]/30 transition-all"
              >
                Group Aggregation
              </button>
            </div>
          </div>

          {/* SQL Editor Area */}
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full min-h-[140px] p-3 font-mono text-xs bg-[#111213] text-[#ECEBE9] border border-[#2A2D30] rounded-xl focus:border-[#3C6B4D] focus:outline-none resize-y leading-relaxed"
            placeholder="Write your SQLite query here..."
            spellCheck={false}
          />

          <div className="flex justify-between items-center">
            <button
              onClick={runQuery}
              disabled={isQueryRunning}
              className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/90 text-white rounded-xl font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-all shadow-md shrink-0"
            >
              {isQueryRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
              <span>Execute Query</span>
            </button>

            {error && (
              <div className="flex items-center gap-2 text-rose-500 text-[10px] pl-4 font-mono font-bold text-left animate-fadeIn">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Query Results / Charting Grid */}
      {results.length > 0 && (
        <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl overflow-hidden flex flex-col gap-4 p-5 animate-fadeIn">
          
          {/* Controls toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#2A2D30] pb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowChart(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                  !showChart 
                    ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/40 text-[#ECEBE9]' 
                    : 'border-transparent text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                <Table size={14} />
                <span>Data Table</span>
              </button>

              <button
                onClick={() => setShowChart(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                  showChart 
                    ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/40 text-[#ECEBE9]' 
                    : 'border-transparent text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                <BarChart2 size={14} />
                <span>Visual Chart</span>
              </button>
            </div>

            {/* Exporters */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-[#72706C] uppercase">Export Results:</span>
              <button 
                onClick={downloadCSV}
                className="px-3 py-1.5 rounded-lg bg-[#111213] border border-[#2A2D30] text-xs font-bold text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D]/40 transition-all flex items-center gap-1.5"
              >
                <Download size={12} />
                <span>CSV</span>
              </button>
              <button 
                onClick={downloadJSON}
                className="px-3 py-1.5 rounded-lg bg-[#111213] border border-[#2A2D30] text-xs font-bold text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D]/40 transition-all flex items-center gap-1.5"
              >
                <Download size={12} />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* VIEW PANE */}
          {!showChart ? (
            /* DATA TABLE VIEW */
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto border border-[#2A2D30] rounded-xl max-h-[400px]">
                <table className="w-full border-collapse text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-[#111213] border-b border-[#2A2D30] text-[#72706C] uppercase font-bold text-[10px]">
                      {resultColumns.map(col => (
                        <th key={col} className="px-4 py-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2D30]/60 text-[#A3A09B]">
                    {paginatedResults.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#111213]/40 transition-colors">
                        {resultColumns.map(col => (
                          <td key={col} className="px-4 py-3 font-semibold text-[#ECEBE9] whitespace-nowrap">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-[#72706C] italic">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination footer */}
              {results.length > pageSize && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-[#72706C] font-semibold">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, results.length)} of {results.length} rows
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 rounded bg-[#111213] border border-[#2A2D30] text-[10px] font-bold text-[#A3A09B] hover:text-[#ECEBE9] disabled:opacity-40 transition-all"
                    >
                      Prev
                    </button>
                    <span className="text-[10px] text-[#ECEBE9] font-bold">Page {currentPage} of {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 rounded bg-[#111213] border border-[#2A2D30] text-[10px] font-bold text-[#A3A09B] hover:text-[#ECEBE9] disabled:opacity-40 transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* CHART PANE VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
              
              {/* Left selectors */}
              <div className="lg:col-span-3 flex flex-col gap-4 bg-[#111213] border border-[#2A2D30] p-4 rounded-xl text-xs">
                <span className="font-bold text-[10px] text-[#72706C] uppercase mb-1 block">Chart Parameters</span>
                
                {/* Chart type */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-[#A3A09B]">Chart Type</span>
                  <div className="grid grid-cols-3 gap-1 bg-[#18191B] p-1 border border-[#2A2D30] rounded-lg">
                    {(['bar', 'line', 'pie'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`py-1 rounded text-[10px] font-bold capitalize transition-all ${
                          chartType === type 
                            ? 'bg-[#3C6B4D] text-white' 
                            : 'text-[#72706C] hover:text-[#ECEBE9]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* X Axis */}
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[#A3A09B]">X-Axis (Label)</span>
                  <select
                    value={xAxisKey}
                    onChange={(e) => setXAxisKey(e.target.value)}
                    className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-2 text-[#ECEBE9] font-mono focus:outline-none"
                  >
                    {resultColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                {/* Y Axis */}
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[#A3A09B]">Y-Axis (Values)</span>
                  <select
                    value={yAxisKey}
                    onChange={(e) => setYAxisKey(e.target.value)}
                    className="w-full bg-[#18191B] border border-[#2A2D30] rounded p-2 text-[#ECEBE9] font-mono focus:outline-none"
                  >
                    {resultColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Chart Canvas */}
              <div className="lg:col-span-9 flex items-center justify-center bg-[#111213] border border-[#2A2D30] rounded-xl p-6 min-h-[300px]">
                {chartData.length === 0 ? (
                  <span className="text-xs text-[#72706C] italic">Choose fields to render values</span>
                ) : chartType === 'bar' ? (
                  /* SVG BAR CHART */
                  <div className="w-full flex flex-col gap-4">
                    <svg viewBox="0 0 500 240" className="w-full overflow-visible">
                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = 20 + ratio * 160;
                        const labelValue = Math.round(maxChartValue * (1 - ratio));
                        return (
                          <g key={idx}>
                            <line x1="45" y1={y} x2="480" y2={y} stroke="#2A2D30" strokeWidth="0.8" strokeDasharray="3 3" />
                            <text x="35" y={y + 3} fill="#72706C" fontSize="8" textAnchor="end" fontFamily="monospace">
                              {labelValue}
                            </text>
                          </g>
                        );
                      })}

                      {/* Render Bars */}
                      {chartData.map((data, idx) => {
                        const barWidth = Math.max(10, 320 / chartData.length);
                        const spacing = 100 / chartData.length;
                        const x = 55 + idx * (barWidth + spacing);
                        const barHeight = (data.value / maxChartValue) * 160;
                        const y = 180 - barHeight;

                        return (
                          <g key={idx} className="group/bar">
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              fill="#3C6B4D"
                              rx="3"
                              className="transition-all duration-300 hover:fill-[#4E8E5E] cursor-pointer"
                            />
                            {/* Hover tooltip value */}
                            <text 
                              x={x + barWidth / 2} 
                              y={Math.max(15, y - 5)} 
                              fill="#ECEBE9" 
                              fontSize="8" 
                              fontWeight="bold" 
                              textAnchor="middle" 
                              fontFamily="monospace"
                              className="opacity-0 group-hover/bar:opacity-100 transition-opacity"
                            >
                              {data.value}
                            </text>
                            
                            {/* Label */}
                            <text
                              x={x + barWidth / 2}
                              y="195"
                              fill="#A3A09B"
                              fontSize="8"
                              textAnchor="middle"
                              fontFamily="monospace"
                              transform={`rotate(15, ${x + barWidth / 2}, 195)`}
                            >
                              {data.label.length > 10 ? data.label.substring(0, 8) + '..' : data.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : chartType === 'line' ? (
                  /* SVG LINE CHART */
                  <div className="w-full flex flex-col gap-4">
                    <svg viewBox="0 0 500 240" className="w-full overflow-visible">
                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = 20 + ratio * 160;
                        const labelValue = Math.round(maxChartValue * (1 - ratio));
                        return (
                          <g key={idx}>
                            <line x1="45" y1={y} x2="480" y2={y} stroke="#2A2D30" strokeWidth="0.8" strokeDasharray="3 3" />
                            <text x="35" y={y + 3} fill="#72706C" fontSize="8" textAnchor="end" fontFamily="monospace">
                              {labelValue}
                            </text>
                          </g>
                        );
                      })}

                      {/* Assemble line path */}
                      {(() => {
                        const spacing = 420 / (chartData.length - 1 || 1);
                        const points = chartData.map((data, idx) => {
                          const x = 55 + idx * spacing;
                          const y = 180 - (data.value / maxChartValue) * 160;
                          return `${x},${y}`;
                        }).join(' ');

                        return (
                          <polyline
                            fill="none"
                            stroke="#3C6B4D"
                            strokeWidth="2.5"
                            points={points}
                          />
                        );
                      })()}

                      {/* Nodes */}
                      {chartData.map((data, idx) => {
                        const spacing = 420 / (chartData.length - 1 || 1);
                        const x = 55 + idx * spacing;
                        const y = 180 - (data.value / maxChartValue) * 160;

                        return (
                          <g key={idx} className="group/node">
                            <circle
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#4E8E5E"
                              stroke="#111213"
                              strokeWidth="1.5"
                              className="cursor-pointer hover:r-6 hover:fill-emerald-400 transition-all"
                            />
                            {/* Value label */}
                            <text
                              x={x}
                              y={Math.max(15, y - 8)}
                              fill="#ECEBE9"
                              fontSize="8"
                              fontWeight="bold"
                              textAnchor="middle"
                              fontFamily="monospace"
                              className="opacity-0 group-hover/node:opacity-100 transition-opacity"
                            >
                              {data.value}
                            </text>
                            
                            {/* X label */}
                            <text
                              x={x}
                              y="195"
                              fill="#A3A09B"
                              fontSize="8"
                              textAnchor="middle"
                              fontFamily="monospace"
                              transform={`rotate(15, ${x}, 195)`}
                            >
                              {data.label.length > 10 ? data.label.substring(0, 8) + '..' : data.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  /* SVG PIE CHART */
                  <div className="w-full flex items-center justify-center gap-8 flex-wrap">
                    <svg viewBox="0 0 200 200" className="w-48 h-48 overflow-visible">
                      {(() => {
                        const total = chartData.reduce((sum, d) => sum + d.value, 0) || 1;
                        let accumulatedAngle = 0;
                        const colors = ['#3C6B4D', '#4E8E5E', '#5FA170', '#71B482', '#83C794', '#95DAA6', '#A7EDA8'];

                        return chartData.map((data, idx) => {
                          const percentage = data.value / total;
                          const angle = percentage * 360;
                          
                          // Convert polar to cartesian coordinates
                          const getCoordinatesForPercent = (percent: number) => {
                            const x = Math.cos(2 * Math.PI * percent);
                            const y = Math.sin(2 * Math.PI * percent);
                            return [x, y];
                          };

                          const [startX, startY] = getCoordinatesForPercent(accumulatedAngle / 360);
                          accumulatedAngle += angle;
                          const [endX, endY] = getCoordinatesForPercent(accumulatedAngle / 360);

                          const largeArcFlag = angle > 180 ? 1 : 0;

                          const pathData = [
                            `M 0 0`,
                            `L ${startX * 80} ${startY * 80}`,
                            `A 80 80 0 ${largeArcFlag} 1 ${endX * 80} ${endY * 80}`,
                            `Z`
                          ].join(' ');

                          const color = colors[idx % colors.length];

                          return (
                            <g key={idx} transform="translate(100, 100)" className="group/slice">
                              <path 
                                d={pathData} 
                                fill={color} 
                                stroke="#111213"
                                strokeWidth="1"
                                className="transition-all duration-300 hover:scale-[1.05] cursor-pointer origin-center"
                              />
                            </g>
                          );
                        });
                      })()}
                    </svg>

                    {/* Legends list */}
                    <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-2 text-[10px]">
                      {(() => {
                        const colors = ['#3C6B4D', '#4E8E5E', '#5FA170', '#71B482', '#83C794', '#95DAA6', '#A7EDA8'];
                        return chartData.map((data, idx) => (
                          <div key={idx} className="flex items-center gap-2 font-mono">
                            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                            <span className="font-bold text-[#ECEBE9]">{data.label}:</span>
                            <span className="text-[#A3A09B]">{data.value}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
