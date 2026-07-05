import { useState, useMemo } from 'react';
import { Download, Play, Sliders, AlertCircle, Copy, Check } from 'lucide-react';

export const JSONChartBuilderTool = () => {
  const [jsonText, setJsonText] = useState(`[
  {"month": "Jan", "sales": 4000, "profit": 2400},
  {"month": "Feb", "sales": 3000, "profit": 1398},
  {"month": "Mar", "sales": 2000, "profit": 9800},
  {"month": "Apr", "sales": 2780, "profit": 3908},
  {"month": "May", "sales": 1890, "profit": 4800},
  {"month": "Jun", "sales": 2390, "profit": 3800},
  {"month": "Jul", "sales": 3490, "profit": 4300}
]`);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [xAxisKey, setXAxisKey] = useState<string>('');
  const [yAxisKeys, setYAxisKeys] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'radar'>('bar');
  const [colorPalette, setColorPalette] = useState<string>('emerald');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isSmooth, setIsSmooth] = useState<boolean>(true);
  const [chartTitle, setChartTitle] = useState<string>('Local Analytics Chart');
  const [copied, setCopied] = useState<boolean>(false);

  // Palettes mapping
  const palettes: Record<string, string[]> = {
    emerald: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
    blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
    purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
    sunset: ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#3B82F6'],
  };

  const activeColors = palettes[colorPalette] || palettes.emerald;

  const handleParse = () => {
    try {
      setErrorMsg(null);
      const data = JSON.parse(jsonText);
      if (!Array.isArray(data)) {
        throw new Error("JSON input must be an array of objects.");
      }
      if (data.length === 0) {
        throw new Error("JSON array cannot be empty.");
      }
      
      // Auto-detect keys
      const keys = Object.keys(data[0]);
      setParsedData(data);
      
      // Set default mapping
      if (keys.length > 0) {
        setXAxisKey(keys[0]);
        // Set numerical keys as Y axes by default
        const numericKeys = keys.filter(k => typeof data[0][k] === 'number');
        setYAxisKeys(numericKeys.length > 0 ? [numericKeys[0]] : keys.slice(1, 2));
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to parse JSON string.");
      setParsedData([]);
    }
  };



  const availableKeys = useMemo(() => {
    if (parsedData.length === 0) return [];
    return Object.keys(parsedData[0]);
  }, [parsedData]);

  const handleCopySvg = () => {
    const svgEl = document.getElementById('rendered-svg-chart');
    if (svgEl) {
      navigator.clipboard.writeText(svgEl.outerHTML);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownloadSvg = () => {
    const svgEl = document.getElementById('rendered-svg-chart');
    if (svgEl) {
      const blob = new Blob([svgEl.outerHTML], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chartTitle.toLowerCase().replace(/\s+/g, '_')}_chart.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // SVG Chart Computations
  const width = 600;
  const height = 350;
  const padding = 50;

  const chartGraphics = useMemo(() => {
    if (parsedData.length === 0 || !xAxisKey || yAxisKeys.length === 0) return null;

    // Get max value
    let maxVal = 0.001;
    parsedData.forEach(d => {
      yAxisKeys.forEach(k => {
        const val = Number(d[k]);
        if (!isNaN(val) && val > maxVal) {
          maxVal = val;
        }
      });
    });

    // Make clean maximum bounds
    const roundedMax = Math.ceil(maxVal / 10) * 10 || 10;
    
    // Scale parameters
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;
    const stepX = usableWidth / Math.max(1, parsedData.length - 1);
    const stepBar = usableWidth / parsedData.length;

    const pointsList: Array<{ color: string; key: string; points: Array<{ x: number; y: number; val: number }> }> = yAxisKeys.map((k, kIdx) => {
      const color = activeColors[kIdx % activeColors.length];
      const points = parsedData.map((d, index) => {
        const val = Number(d[k]) || 0;
        const x = padding + (chartType === 'bar' ? (index * stepBar + stepBar / 2) : (index * stepX));
        const y = height - padding - (val / roundedMax) * usableHeight;
        return { x, y, val };
      });
      return { color, key: k, points };
    });

    return { pointsList, maxVal: roundedMax, usableWidth, usableHeight, stepBar, stepX };
  }, [parsedData, xAxisKey, yAxisKeys, chartType, activeColors]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Left editor panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2.5 flex items-center gap-1.5">
            <Sliders size={15} className="text-[#3C6B4D]" />
            <span>Chart Specifications</span>
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Pasted JSON Dataset</label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={8}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] w-full"
            />
          </div>

          <button
            onClick={handleParse}
            className="py-2.5 px-4 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Play size={13} />
            <span>Generate / Parse JSON</span>
          </button>

          {errorMsg && (
            <div className="bg-rose-950/20 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {parsedData.length > 0 && (
            <div className="space-y-4 border-t border-[#2A2D30] pt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Chart Title</label>
                <input
                  type="text"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3.5 py-2 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">X-Axis Variable</label>
                <select
                  value={xAxisKey}
                  onChange={(e) => setXAxisKey(e.target.value)}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                >
                  {availableKeys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Y-Axis Variables (Keys)</label>
                <div className="grid grid-cols-2 gap-2 bg-[#111213] p-2.5 rounded-xl border border-[#2A2D30] max-h-[120px] overflow-y-auto">
                  {availableKeys.map(k => {
                    const isChecked = yAxisKeys.includes(k);
                    return (
                      <label key={k} className="flex items-center gap-1.5 text-xs text-[#ECEBE9] cursor-pointer hover:text-emerald-400 transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setYAxisKeys(yAxisKeys.filter(x => x !== k));
                            } else {
                              setYAxisKeys([...yAxisKeys, k]);
                            }
                          }}
                          className="accent-[#3C6B4D]"
                        />
                        <span className="truncate">{k}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Chart Style</label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as any)}
                    className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] focus:outline-none"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="radar">Radar Chart</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Color Palette</label>
                  <select
                    value={colorPalette}
                    onChange={(e) => setColorPalette(e.target.value)}
                    className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] focus:outline-none"
                  >
                    <option value="emerald">Emerald Forest</option>
                    <option value="blue">Blue Lagoon</option>
                    <option value="purple">Vibrant Violet</option>
                    <option value="sunset">Tropical Sunset</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#2A2D30] pt-3 text-xs">
                <label className="text-[#A3A09B] cursor-pointer flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="accent-[#3C6B4D]"
                  />
                  <span>Display Grids</span>
                </label>
                {chartType === 'line' && (
                  <label className="text-[#A3A09B] cursor-pointer flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={isSmooth}
                      onChange={(e) => setIsSmooth(e.target.checked)}
                      className="accent-[#3C6B4D]"
                    />
                    <span>Spline Curves</span>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right visualization viewport */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card bg-[#18191B] p-6 border border-[#2A2D30] rounded-2xl flex flex-col gap-4">
          <div className="pb-3 border-b border-[#2A2D30] flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-[#ECEBE9]">{chartTitle}</h4>
            {parsedData.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySvg}
                  className="py-1 px-3 bg-[#111213] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg text-xs font-bold border border-[#2A2D30] flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>Copy SVG</span>
                </button>
                <button
                  onClick={handleDownloadSvg}
                  className="py-1 px-3 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download size={12} />
                  <span>Download SVG</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center bg-[#111213] rounded-2xl p-4 border border-[#2A2D30] min-h-[360px]">
            {parsedData.length === 0 ? (
              <div className="text-center space-y-1.5 text-xs">
                <p className="text-[#A3A09B] font-semibold">No dataset processed.</p>
                <p className="text-[#72706C]">Configure mapping properties or click parse on the left to begin.</p>
              </div>
            ) : !chartGraphics ? (
              <p className="text-xs text-[#A3A09B]">Please select variables to map on the chart.</p>
            ) : (
              <svg
                id="rendered-svg-chart"
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto text-xs"
              >
                {/* Background */}
                <rect width={width} height={height} rx="12" fill="#111213" />

                {/* Grid layout */}
                {showGrid && chartType !== 'pie' && chartType !== 'radar' && (
                  <g stroke="#2A2D30" strokeDasharray="3" strokeWidth="0.5">
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                      const y = padding + p * (height - padding * 2);
                      return <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} />;
                    })}
                  </g>
                )}

                {/* Axis lines */}
                {chartType !== 'pie' && chartType !== 'radar' && (
                  <g stroke="#72706C" strokeWidth="1">
                    {/* Y-Axis */}
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
                    {/* X-Axis */}
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
                  </g>
                )}

                {/* Y-Axis Label labels */}
                {chartType !== 'pie' && chartType !== 'radar' && (
                  <g fill="#A3A09B" textAnchor="end" className="font-mono text-[9px]">
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                      const y = height - padding - p * (height - padding * 2);
                      const val = Math.round(p * chartGraphics.maxVal);
                      return <text key={i} x={padding - 8} y={y + 3}>{val}</text>;
                    })}
                  </g>
                )}

                {/* X-Axis Label labels */}
                {chartType !== 'pie' && chartType !== 'radar' && (
                  <g fill="#A3A09B" textAnchor="middle" className="text-[9px]">
                    {parsedData.map((d, i) => {
                      const label = String(d[xAxisKey] || '');
                      const x = padding + (chartType === 'bar' ? (i * chartGraphics.stepBar + chartGraphics.stepBar / 2) : (i * chartGraphics.stepX));
                      return (
                        <text key={i} x={x} y={height - padding + 15} className="truncate max-w-[40px]">
                          {label.length > 6 ? label.substring(0, 5) + '..' : label}
                        </text>
                      );
                    })}
                  </g>
                )}

                {/* Main Render Graphics */}
                {chartType === 'bar' && chartGraphics.pointsList.map((dataset, dIdx) => {
                  const subBarWidth = (chartGraphics.stepBar * 0.7) / yAxisKeys.length;
                  return (
                    <g key={dIdx} fill={dataset.color}>
                      {dataset.points.map((p, pIdx) => {
                        const offset = (dIdx - yAxisKeys.length / 2) * subBarWidth + subBarWidth / 2;
                        const barHeight = height - padding - p.y;
                        return (
                          <rect
                            key={pIdx}
                            x={p.x + offset - subBarWidth / 2}
                            y={p.y}
                            width={Math.max(1, subBarWidth - 2)}
                            height={Math.max(1, barHeight)}
                            rx="3"
                            opacity="0.85"
                            className="transition-all duration-300 hover:opacity-100"
                          >
                            <title>{`${dataset.key}: ${p.val}`}</title>
                          </rect>
                        );
                      })}
                    </g>
                  );
                })}

                {chartType === 'line' && chartGraphics.pointsList.map((dataset, dIdx) => {
                  // Construct path
                  let dAttr = '';
                  if (isSmooth && dataset.points.length > 2) {
                    dAttr = `M ${dataset.points[0].x} ${dataset.points[0].y}`;
                    for (let i = 0; i < dataset.points.length - 1; i++) {
                      const p0 = dataset.points[i];
                      const p1 = dataset.points[i + 1];
                      const cpX1 = p0.x + (p1.x - p0.x) / 2;
                      const cpY1 = p0.y;
                      const cpX2 = p0.x + (p1.x - p0.x) / 2;
                      const cpY2 = p1.y;
                      dAttr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
                    }
                  } else {
                    dAttr = dataset.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  }

                  return (
                    <g key={dIdx}>
                      <path
                        d={dAttr}
                        fill="none"
                        stroke={dataset.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {dataset.points.map((p, pIdx) => (
                        <circle
                          key={pIdx}
                          cx={p.x}
                          cy={p.y}
                          r="4"
                          fill="#111213"
                          stroke={dataset.color}
                          strokeWidth="2"
                          className="cursor-pointer hover:r-6 transition-all"
                        >
                          <title>{`${dataset.key}: ${p.val}`}</title>
                        </circle>
                      ))}
                    </g>
                  );
                })}

                {chartType === 'pie' && (() => {
                  // Only plot first numerical mapped key for pie segments
                  const targetKey = yAxisKeys[0];
                  const total = parsedData.reduce((sum, d) => sum + (Number(d[targetKey]) || 0), 0) || 1;
                  const centerX = width / 2;
                  const centerY = height / 2;
                  const radius = 100;
                  
                  let startAngle = 0;

                  return (
                    <g>
                      {parsedData.map((d, i) => {
                        const val = Number(d[targetKey]) || 0;
                        const angle = (val / total) * 360;
                        const endAngle = startAngle + angle;

                        const radStart = (startAngle - 90) * Math.PI / 180;
                        const radEnd = (endAngle - 90) * Math.PI / 180;

                        const x1 = centerX + radius * Math.cos(radStart);
                        const y1 = centerY + radius * Math.sin(radStart);
                        const x2 = centerX + radius * Math.cos(radEnd);
                        const y2 = centerY + radius * Math.sin(radEnd);

                        const largeArc = angle > 180 ? 1 : 0;
                        const dPath = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                        
                        const color = activeColors[i % activeColors.length];
                        startAngle = endAngle;

                        return (
                          <path
                            key={i}
                            d={dPath}
                            fill={color}
                            stroke="#111213"
                            strokeWidth="1.5"
                            opacity="0.85"
                            className="hover:opacity-100 transition-opacity"
                          >
                            <title>{`${d[xAxisKey]}: ${val} (${Math.round(val/total*100)}%)`}</title>
                          </path>
                        );
                      })}
                    </g>
                  );
                })()}

                {chartType === 'radar' && (() => {
                  const centerX = width / 2;
                  const centerY = height / 2;
                  const maxRadius = 100;
                  const totalSides = parsedData.length;
                  const angleStep = (2 * Math.PI) / totalSides;

                  return (
                    <g>
                      {/* Inner polygon grid rings */}
                      {[0.25, 0.5, 0.75, 1].map((scale, gridIdx) => {
                        const gridPoints = parsedData.map((_, i) => {
                          const angle = i * angleStep - Math.PI / 2;
                          const r = maxRadius * scale;
                          const x = centerX + r * Math.cos(angle);
                          const y = centerY + r * Math.sin(angle);
                          return `${x},${y}`;
                        }).join(' ');
                        return (
                          <polygon
                            key={gridIdx}
                            points={gridPoints}
                            fill="none"
                            stroke="#2A2D30"
                            strokeWidth="0.5"
                          />
                        );
                      })}

                      {/* Side spokes */}
                      {parsedData.map((d, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        const x = centerX + maxRadius * Math.cos(angle);
                        const y = centerY + maxRadius * Math.sin(angle);
                        return (
                          <g key={i}>
                            <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="#2A2D30" strokeWidth="0.75" />
                            <text
                              x={centerX + (maxRadius + 15) * Math.cos(angle)}
                              y={centerY + (maxRadius + 15) * Math.sin(angle) + 4}
                              fill="#A3A09B"
                              textAnchor="middle"
                              className="text-[9px]"
                            >
                              {String(d[xAxisKey] || '').substring(0, 6)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Polygon values overlay */}
                      {yAxisKeys.map((key, keyIdx) => {
                        // Max value
                        let maxVal = 0.001;
                        parsedData.forEach(d => {
                          const val = Number(d[key]) || 0;
                          if (val > maxVal) maxVal = val;
                        });

                        const radarPoints = parsedData.map((d, i) => {
                          const val = Number(d[key]) || 0;
                          const ratio = val / maxVal;
                          const angle = i * angleStep - Math.PI / 2;
                          const r = maxRadius * ratio;
                          const x = centerX + r * Math.cos(angle);
                          const y = centerY + r * Math.sin(angle);
                          return `${x},${y}`;
                        }).join(' ');

                        const color = activeColors[keyIdx % activeColors.length];

                        return (
                          <g key={keyIdx}>
                            <polygon
                              points={radarPoints}
                              fill={color}
                              fillOpacity="0.25"
                              stroke={color}
                              strokeWidth="2"
                            />
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}

                {/* Legend group */}
                {chartType !== 'pie' && (
                  <g transform={`translate(${padding}, 15)`} className="text-[10px] font-semibold">
                    {yAxisKeys.map((k, i) => {
                      const color = activeColors[i % activeColors.length];
                      const offset = i * 85;
                      return (
                        <g key={k} transform={`translate(${offset}, 0)`}>
                          <rect width="10" height="10" rx="2" fill={color} />
                          <text x="14" y="9" fill="#ECEBE9">{k}</text>
                        </g>
                      );
                    })}
                  </g>
                )}
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
