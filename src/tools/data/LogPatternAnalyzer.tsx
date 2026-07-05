import { useState, useMemo } from 'react';
import { Sliders, Play, Search } from 'lucide-react';

export const LogPatternAnalyzerTool = () => {
  const [logText, setLogText] = useState(`127.0.0.1 - - [05/Jul/2026:14:32:10 +0000] "GET /api/v1/auth/login HTTP/1.1" 200 120 "-" "Mozilla/5.0"
192.168.1.50 - - [05/Jul/2026:14:33:15 +0000] "POST /api/v1/users/register HTTP/1.1" 201 250 "-" "Mozilla/5.0"
127.0.0.1 - - [05/Jul/2026:14:34:02 +0000] "GET /api/v1/dashboard HTTP/1.1" 401 45 "-" "Mozilla/5.0"
10.0.0.8 - - [05/Jul/2026:14:34:25 +0000] "GET /static/logo.png HTTP/1.1" 304 0 "-" "Chrome/110"
192.168.1.102 - - [05/Jul/2026:14:35:10 +0000] "GET /api/v1/auth/login HTTP/1.1" 200 120 "-" "Mozilla/5.0"
192.168.1.102 - - [05/Jul/2026:14:36:01 +0000] "DELETE /api/v1/posts/88 HTTP/1.1" 403 70 "-" "Firefox/111"
127.0.0.1 - - [05/Jul/2026:14:37:12 +0000] "POST /api/v1/upload HTTP/1.1" 500 1024 "-" "Chrome/110"
10.0.0.8 - - [05/Jul/2026:14:38:05 +0000] "GET /index.html HTTP/1.1" 200 3540 "-" "Safari/16"`);

  const [preset, setPreset] = useState<string>('nginx');
  const [parsedLogs, setParsedLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [logLevelFilter, setLogLevelFilter] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parse server log lines based on presets
  const handleParse = () => {
    try {
      setErrorMsg(null);
      const lines = logText.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        throw new Error("Log lines cannot be empty.");
      }

      // Regex definitions
      // Nginx/Apache Combined: 127.0.0.1 - - [timestamp] "GET /path HTTP/1.1" 200 size "-" "UserAgent"
      const nginxRegex = /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+)\s?\S*" (\d{3}) (\d+)/;
      // Simple Application Logs: [TIMESTAMP] [LEVEL] Message
      const appLogRegex = /^\[([^\]]+)\] \[([A-Z]+)\] (.*)$/;

      const parsedList = lines.map((line, idx) => {
        if (preset === 'nginx') {
          const match = nginxRegex.exec(line);
          if (match) {
            const status = Number(match[5]);
            let level = 'INFO';
            if (status >= 500) level = 'ERROR';
            else if (status >= 400) level = 'WARN';
            return {
              id: idx,
              ip: match[1],
              timestamp: match[2],
              method: match[3],
              path: match[4],
              status,
              size: Number(match[6]),
              level,
              message: `HTTP Request: ${match[3]} ${match[4]}`
            };
          }
        } else {
          // App Log
          const match = appLogRegex.exec(line);
          if (match) {
            return {
              id: idx,
              ip: 'N/A',
              timestamp: match[1],
              method: 'N/A',
              path: 'N/A',
              status: 0,
              size: 0,
              level: match[2].toUpperCase(),
              message: match[3]
            };
          }
        }
        // Fallback for unmatched lines
        return {
          id: idx,
          ip: 'Unknown',
          timestamp: 'Unknown',
          method: 'Unknown',
          path: 'Unknown',
          status: 0,
          size: 0,
          level: 'INFO',
          message: line
        };
      });

      setParsedLogs(parsedList);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to parse logs.");
      setParsedLogs([]);
    }
  };

  // Preset switch triggers auto parsing fill
  const handlePresetChange = (val: string) => {
    setPreset(val);
    if (val === 'nginx') {
      setLogText(`127.0.0.1 - - [05/Jul/2026:14:32:10 +0000] "GET /api/v1/auth/login HTTP/1.1" 200 120 "-" "Mozilla/5.0"
192.168.1.50 - - [05/Jul/2026:14:33:15 +0000] "POST /api/v1/users/register HTTP/1.1" 201 250 "-" "Mozilla/5.0"
127.0.0.1 - - [05/Jul/2026:14:34:02 +0000] "GET /api/v1/dashboard HTTP/1.1" 401 45 "-" "Mozilla/5.0"
10.0.0.8 - - [05/Jul/2026:14:34:25 +0000] "GET /static/logo.png HTTP/1.1" 304 0 "-" "Chrome/110"
192.168.1.102 - - [05/Jul/2026:14:35:10 +0000] "GET /api/v1/auth/login HTTP/1.1" 200 120 "-" "Mozilla/5.0"
192.168.1.102 - - [05/Jul/2026:14:36:01 +0000] "DELETE /api/v1/posts/88 HTTP/1.1" 403 70 "-" "Firefox/111"
127.0.0.1 - - [05/Jul/2026:14:37:12 +0000] "POST /api/v1/upload HTTP/1.1" 500 1024 "-" "Chrome/110"
10.0.0.8 - - [05/Jul/2026:14:38:05 +0000] "GET /index.html HTTP/1.1" 200 3540 "-" "Safari/16"`);
    } else {
      setLogText(`[2026-07-05 14:32:10] [INFO] Starting auth system daemon context...
[2026-07-05 14:33:02] [INFO] Connected to MongoDB database successfully on port 27017.
[2026-07-05 14:34:15] [WARN] Disk threshold is reaching 88%. Cleaning temp cache directories.
[2026-07-05 14:35:01] [ERROR] Uncaught ReferenceError: profileDetails is not defined in profile.ts:42
[2026-07-05 14:36:45] [INFO] Garbage collection executed. Recovered 45.2MB memory heaps.
[2026-07-05 14:37:10] [FATAL] Port 3000 is already in use by another process. Exiting daemon hook.`);
    }
  };

  // Analytics logic
  const statistics = useMemo(() => {
    if (parsedLogs.length === 0) return null;
    const total = parsedLogs.length;
    const errors = parsedLogs.filter(l => l.level === 'ERROR' || l.level === 'FATAL').length;
    const warnings = parsedLogs.filter(l => l.level === 'WARN').length;
    const errorRate = ((errors / total) * 100).toFixed(1);
    
    // Unique IPs
    const ips = Array.from(new Set(parsedLogs.map(l => l.ip))).filter(ip => ip !== 'N/A' && ip !== 'Unknown');

    // HTTP Status distribution
    const statusGroups = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
    parsedLogs.forEach(l => {
      if (l.status >= 500) statusGroups['5xx']++;
      else if (l.status >= 400) statusGroups['4xx']++;
      else if (l.status >= 300) statusGroups['3xx']++;
      else if (l.status >= 200) statusGroups['2xx']++;
    });

    // Level distribution
    const levelCounts: Record<string, number> = { INFO: 0, WARN: 0, ERROR: 0, FATAL: 0 };
    parsedLogs.forEach(l => {
      const lvl = l.level.toUpperCase();
      if (levelCounts[lvl] !== undefined) {
        levelCounts[lvl]++;
      } else {
        levelCounts.INFO++;
      }
    });

    return { total, errors, warnings, errorRate, uniqueIpsCount: ips.length, statusGroups, levelCounts };
  }, [parsedLogs]);

  // Filter logs list
  const filteredList = useMemo(() => {
    return parsedLogs.filter(l => {
      const matchesSearch = l.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            l.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            l.path.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = logLevelFilter === 'all' || l.level.toLowerCase() === logLevelFilter.toLowerCase();
      
      return matchesSearch && matchesLevel;
    });
  }, [parsedLogs, searchQuery, logLevelFilter]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configure area */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2.5 flex items-center gap-1.5">
            <Sliders size={15} className="text-[#3C6B4D]" />
            <span>Parsing Configuration</span>
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Log Format Type</label>
            <select
              value={preset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] focus:outline-none"
            >
              <option value="nginx">Nginx/Apache Combined Access Log</option>
              <option value="app">Standard Application Logger Format</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Paste Console Logs</label>
            <textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              rows={12}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>
          <button
            onClick={handleParse}
            className="py-2.5 px-4 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Play size={13} />
            <span>Process & Group Logs</span>
          </button>

          {errorMsg && (
            <div className="bg-rose-950/20 border border-rose-500/30 text-rose-450 p-2.5 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}
        </div>
      </div>


      {/* Output stats */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 flex flex-col gap-1">
              <span className="text-[10px] text-[#A3A09B] font-bold uppercase">Total Lines</span>
              <span className="text-2xl font-black text-[#ECEBE9]">{statistics.total}</span>
            </div>
            <div className="glass-card p-4 flex flex-col gap-1">
              <span className="text-[10px] text-[#A3A09B] font-bold uppercase">Error Rate</span>
              <span className={`text-2xl font-black ${Number(statistics.errorRate) > 10 ? 'text-rose-450' : 'text-emerald-450'}`}>{statistics.errorRate}%</span>
            </div>
            <div className="glass-card p-4 flex flex-col gap-1">
              <span className="text-[10px] text-[#A3A09B] font-bold uppercase">Warnings</span>
              <span className="text-2xl font-black text-amber-500">{statistics.warnings}</span>
            </div>
            <div className="glass-card p-4 flex flex-col gap-1">
              <span className="text-[10px] text-[#A3A09B] font-bold uppercase">Unique Client IPs</span>
              <span className="text-2xl font-black text-blue-400">{statistics.uniqueIpsCount}</span>
            </div>
          </div>
        )}

        <div className="glass-card p-6 border border-[#2A2D30] rounded-2xl flex flex-col gap-4">
          <div className="pb-3 border-b border-[#2A2D30] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h4 className="text-sm font-extrabold text-[#ECEBE9]">Log Records Filter & Table</h4>
            <div className="flex items-center gap-2">
              {/* Search bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2 text-[#72706C]" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#111213] border border-[#2A2D30] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] w-[180px]"
                />
              </div>

              {/* Level select */}
              <select
                value={logLevelFilter}
                onChange={(e) => setLogLevelFilter(e.target.value)}
                className="bg-[#111213] border border-[#2A2D30] rounded-lg px-2 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
              >
                <option value="all">All Levels</option>
                <option value="info">INFO</option>
                <option value="warn">WARN</option>
                <option value="error">ERROR</option>
                <option value="fatal">FATAL</option>
              </select>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[300px] bg-[#111213] border border-[#2A2D30] rounded-xl">
            {filteredList.length === 0 ? (
              <div className="text-center p-12 space-y-1.5 text-xs text-[#A3A09B]">
                <p className="font-semibold">No records matched.</p>
                <p className="text-[#72706C]">Modify query filters or process a log set first.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#18191B] border-b border-[#2A2D30]">
                    <th className="p-3 text-[#A3A09B] font-extrabold w-[80px]">Level</th>
                    <th className="p-3 text-[#A3A09B] font-extrabold w-[120px]">IP / Client</th>
                    <th className="p-3 text-[#A3A09B] font-extrabold w-[160px]">Timestamp</th>
                    <th className="p-3 text-[#A3A09B] font-extrabold">Log Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D30]/40 text-[#ECEBE9] font-mono text-[11px]">
                  {filteredList.map((log) => {
                    let lvlColor = 'text-blue-400 bg-blue-500/10 border-blue-500/25';
                    if (log.level === 'WARN') lvlColor = 'text-amber-400 bg-amber-500/10 border-amber-500/25';
                    else if (log.level === 'ERROR') lvlColor = 'text-rose-450 bg-rose-500/10 border-rose-500/25';
                    else if (log.level === 'FATAL') lvlColor = 'text-red-400 bg-red-600/15 border-red-600/30';
                    return (
                      <tr key={log.id} className="hover:bg-[#1E2022]/40 transition-colors">
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${lvlColor}`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="p-3 text-[#A3A09B]">{log.ip}</td>
                        <td className="p-3 text-[#72706C]">{log.timestamp}</td>
                        <td className="p-3 font-semibold select-all break-all">{log.message}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
