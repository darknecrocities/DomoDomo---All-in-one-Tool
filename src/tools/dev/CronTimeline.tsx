import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';

import {
  type CronOccurrence,
  parseCronField,
  validateCronExpression,
  calculateCronOccurrences,
} from './cronHelper';

export type { CronOccurrence };
export { parseCronField, validateCronExpression, calculateCronOccurrences };

export const CronTimelineTool: React.FC = () => {
  const [cronExpression, setCronExpression] = useState<string>('*/15 9-17 * * 1-5');
  const [scale, setScale] = useState<number>(1.0);

  // Compute the next 50 execution dates
  const occurrences = useMemo<CronOccurrence[]>(() => {
    return calculateCronOccurrences(cronExpression, 50);
  }, [cronExpression]);

  // Aggregate weekly matrix (7 days x 24 hours)
  const heatmap = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    occurrences.forEach((occ) => {
      const day = occ.date.getDay();
      grid[day][occ.hour] += 1;
    });
    return grid;
  }, [occurrences]);

  const handleExportJson = () => {
    const data = {
      expression: cronExpression,
      generatedAt: new Date().toISOString(),
      occurrences: occurrences.map((o) => ({
        index: o.index,
        timestamp: o.iso,
        relative: o.relative,
        dayOfWeek: o.dayOfWeek,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cron-schedule-occurrences.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportIcs = () => {
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DomoDomo//Cron Timeline Generator//EN\n';
    occurrences.forEach((occ) => {
      const start = occ.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const end = new Date(occ.date.getTime() + 5 * 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      ics += `BEGIN:VEVENT\nSUMMARY:Cron Job Execution #${occ.index}\nDESCRIPTION:Cron: ${cronExpression}\nDTSTART:${start}\nDTEND:${end}\nEND:VEVENT\n`;
    });
    ics += 'END:VCALENDAR';

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cron-schedule.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A3A09B] uppercase tracking-wider mb-1">
            <span>Developer Suite</span>
            <span>/</span>
            <span className="text-white">Job Scheduling</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="text-[#D4AF37]" size={24} />
            <span>Cron Schedule Timeline & Calendar</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate and visually map the next 50 execution runs of any cron expression offline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="px-3 py-2 bg-[#18191B] border border-[#2A2D30] hover:bg-[#2A2D30] text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={handleExportIcs}
            className="px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Calendar size={14} />
            <span>Export iCal (.ics)</span>
          </button>
        </div>
      </div>

      {/* Cron Expression Input & Presets */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#A3A09B] uppercase tracking-wider">
            Cron Expression (5-part: min hour dom mon dow)
          </label>
          <div className="flex items-center bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2.5 focus-within:border-white">
            <input
              type="text"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="*/15 9-17 * * 1-5"
              className="w-full bg-transparent text-white font-mono text-sm focus:outline-none placeholder-slate-600"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2A2D30]/60 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold">Presets:</span>
          {[
            { label: 'Every 15 min (business hrs)', val: '*/15 9-17 * * 1-5' },
            { label: 'Every hour at :00', val: '0 * * * *' },
            { label: 'Midnight daily', val: '0 0 * * *' },
            { label: 'Sunday 3 AM weekly', val: '0 3 * * 0' },
            { label: '1st of every month', val: '0 0 1 * *' },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setCronExpression(preset.val)}
              className="px-2.5 py-1 bg-[#111213] border border-[#2A2D30] hover:border-[#72706C] text-[#A3A09B] hover:text-white rounded-lg text-[11px] transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Timeline Viewport */}
      <div className="bg-[#111213] border border-[#2A2D30] rounded-3xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Activity size={14} className="text-[#D4AF37]" />
              <span>Next Runs Heatmap (24h x 7 Days)</span>
            </span>
            <span className="text-[#A3A09B] font-mono bg-[#18191B] px-2 py-0.5 rounded border border-[#2A2D30]">
              {Math.round(scale * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(s - 0.15, 0.5))}
              className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              onClick={() => setScale(1.0)}
              className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300"
              title="Reset Zoom"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(s + 0.15, 2.0))}
              className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        </div>

        {/* Heatmap Grid Viewport */}
        <div className="overflow-auto bg-[#0D0D0D] border border-[#2A2D30] rounded-2xl p-5">
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', minWidth: '700px' }}>
            <div className="grid grid-cols-25 gap-1 text-[10px] text-center text-slate-500 mb-2">
              <span className="w-12 text-left font-bold text-slate-400">Day</span>
              {Array.from({ length: 24 }).map((_, h) => (
                <span key={h} className="font-mono">
                  {h}h
                </span>
              ))}
            </div>

            {heatmap.map((row, dayIdx) => (
              <div key={dayIdx} className="grid grid-cols-25 gap-1 items-center mb-1.5">
                <span className="w-12 text-left font-bold text-xs text-slate-300">{dayNames[dayIdx]}</span>
                {row.map((count, h) => {
                  const bg =
                    count === 0
                      ? 'bg-[#18191B]'
                      : count === 1
                      ? 'bg-[#D4AF37]/40'
                      : count <= 3
                      ? 'bg-[#D4AF37]/80'
                      : 'bg-white';
                  return (
                    <div
                      key={h}
                      title={`${dayNames[dayIdx]} at ${h}:00 - ${count} run(s)`}
                      className={`h-6 rounded border border-[#2A2D30]/60 flex items-center justify-center font-mono text-[9px] font-bold ${bg} ${
                        count > 3 ? 'text-black' : 'text-white'
                      }`}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table of Next 50 Runs */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
        <span className="font-bold text-[#ECEBE9] uppercase tracking-wider text-[11px] flex items-center gap-2">
          <Layers size={14} className="text-[#D4AF37]" />
          <span>Calculated Next 50 Execution Dates</span>
        </span>

        <div className="overflow-auto max-h-[360px] rounded-xl border border-[#2A2D30]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#111213] text-[#A3A09B] uppercase text-[10px] font-bold sticky top-0 border-b border-[#2A2D30]">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Execution Time</th>
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-3">Relative</th>
                <th className="py-2.5 px-3">ISO String</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2D30]/50 font-mono text-slate-300">
              {occurrences.map((occ) => (
                <tr key={occ.index} className="hover:bg-[#111213] transition-colors">
                  <td className="py-2 px-3 text-[#D4AF37] font-bold">{occ.index}</td>
                  <td className="py-2 px-3 text-white font-semibold">{occ.date.toLocaleString()}</td>
                  <td className="py-2 px-3 text-slate-400">{occ.dayOfWeek}</td>
                  <td className="py-2 px-3 text-amber-300/80">{occ.relative}</td>
                  <td className="py-2 px-3 text-slate-500 text-[11px] truncate">{occ.iso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Security */}
      <div className="flex items-center gap-2 p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl text-[11px] text-[#A3A09B]">
        <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
        <span>100% Client-side Chrono calculation. No backend servers involved.</span>
      </div>
    </div>
  );
};
