import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

export const CronParserTool = () => {
  const [cronExpression, setCronExpression] = useState('*/5 * * * *');
  const [description, setDescription] = useState('');
  const [nextRuns, setNextRuns] = useState<string[]>([]);
  const [preset, setPreset] = useState('every-5');

  // Generator states
  const [genMin, setGenMin] = useState('*/5');
  const [genHour, setGenHour] = useState('*');
  const [genDom, setGenDom] = useState('*');
  const [genMonth, setGenMonth] = useState('*');
  const [genDow, setGenDow] = useState('*');

  const handlePresetChange = (p: string) => {
    setPreset(p);
    let expr = '*/5 * * * *';
    if (p === 'every-minute') expr = '* * * * *';
    else if (p === 'every-5') expr = '*/5 * * * *';
    else if (p === 'hourly') expr = '0 * * * *';
    else if (p === 'daily') expr = '0 0 * * *';
    else if (p === 'weekly') expr = '0 0 * * 0';
    else if (p === 'monthly') expr = '0 0 1 * *';

    setCronExpression(expr);
    const parts = expr.split(' ');
    if (parts.length === 5) {
      setGenMin(parts[0]);
      setGenHour(parts[1]);
      setGenDom(parts[2]);
      setGenMonth(parts[3]);
      setGenDow(parts[4]);
    }
  };

  const handleGenChange = (field: string, value: string) => {
    setPreset('custom');
    let m = genMin, h = genHour, dom = genDom, mon = genMonth, dow = genDow;
    if (field === 'min') { setGenMin(value); m = value; }
    else if (field === 'hour') { setGenHour(value); h = value; }
    else if (field === 'dom') { setGenDom(value); dom = value; }
    else if (field === 'month') { setGenMonth(value); mon = value; }
    else if (field === 'dow') { setGenDow(value); dow = value; }

    setCronExpression(`${m} ${h} ${dom} ${mon} ${dow}`);
  };

  const parseCronText = (expr: string) => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) {
      return 'Invalid cron expression. Must have exactly 5 fields (minute, hour, day of month, month, day of week).';
    }

    const [min, hour, dom, month, dow] = parts;

    const describeField = (val: string, type: 'min' | 'hour' | 'dom' | 'month' | 'dow') => {
      if (val === '*') return `every ${type === 'min' ? 'minute' : type === 'hour' ? 'hour' : type === 'dom' ? 'day' : type === 'month' ? 'month' : 'day of the week'}`;
      if (val.startsWith('*/')) {
        const step = val.split('/')[1];
        return `every ${step} ${type === 'min' ? 'minutes' : type === 'hour' ? 'hours' : type === 'dom' ? 'days' : type === 'month' ? 'months' : 'days of the week'}`;
      }
      return `at ${type === 'min' ? 'minute' : type === 'hour' ? 'hour' : type === 'dom' ? 'day' : type === 'month' ? 'month' : 'day of week'} ${val}`;
    };

    return `Runs ${describeField(min, 'min')} ${describeField(hour, 'hour')} on ${describeField(dom, 'dom')} of ${describeField(month, 'month')} on ${describeField(dow, 'dow')}.`;
  };

  const calculateNextRuns = (expr: string) => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return [];

    // Simple mockup of next execution times for display
    const times: string[] = [];
    let base = new Date();
    
    // Adjust base time to match simple cron rules
    const minVal = parts[0] === '*' ? 1 : parseInt(parts[0]) || 5;
    const hourVal = parts[1] === '*' ? 0 : parseInt(parts[1]) || 0;

    for (let i = 1; i <= 5; i++) {
      const next = new Date(base.getTime());
      if (parts[1] === '*') {
        next.setMinutes(next.getMinutes() + i * minVal);
      } else if (parts[0] === '*') {
        next.setHours(next.getHours() + i);
        next.setMinutes(0);
      } else {
        next.setHours(hourVal);
        next.setMinutes(minVal);
        next.setDate(next.getDate() + i);
      }
      times.push(next.toLocaleString());
    }
    return times;
  };

  useEffect(() => {
    setDescription(parseCronText(cronExpression));
    setNextRuns(calculateNextRuns(cronExpression));
  }, [cronExpression]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Editor Board */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2">Cron Expression Parser</h3>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase">Cron Expression</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 text-sm font-mono focus:outline-none focus:border-[#4E8E5E] flex-1"
                placeholder="e.g. */5 * * * *"
              />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-850/80 p-4 rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Human Interpretation</span>
            <p className="text-xs text-slate-200 leading-relaxed font-semibold">{description}</p>
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Interactive Generator</span>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'Minute', field: 'min', val: genMin, placeholder: '0-59' },
                { label: 'Hour', field: 'hour', val: genHour, placeholder: '0-23' },
                { label: 'Day (Month)', field: 'dom', val: genDom, placeholder: '1-31' },
                { label: 'Month', field: 'month', val: genMonth, placeholder: '1-12' },
                { label: 'Day (Week)', field: 'dow', val: genDow, placeholder: '0-6' }
              ].map((f) => (
                <div key={f.field} className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-bold text-center">{f.label}</span>
                  <input
                    type="text"
                    value={f.val}
                    onChange={(e) => handleGenChange(f.field, e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-center text-xs font-mono text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Presets & Runs</h3>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold">Common Schedules</label>
            <select
              value={preset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="every-minute">Every Minute (* * * * *)</option>
              <option value="every-5">Every 5 Minutes (*/5 * * * *)</option>
              <option value="hourly">Hourly (0 * * * *)</option>
              <option value="daily">Daily Midnight (0 0 * * *)</option>
              <option value="weekly">Weekly Sunday (0 0 * * 0)</option>
              <option value="monthly">Monthly 1st (0 0 1 * *)</option>
              <option value="custom">Custom Configuration</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-800 pt-3 mt-2">
            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5"><Play size={12} className="text-[#4E8E5E]" /> Next 5 Executions</span>
            <div className="flex flex-col gap-1.5 font-mono text-[10px] text-slate-300">
              {nextRuns.map((time, idx) => (
                <div key={idx} className="bg-slate-900/60 p-2 rounded border border-slate-850/50 flex justify-between">
                  <span className="text-slate-500">#{idx + 1}</span>
                  <span className="font-bold">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
