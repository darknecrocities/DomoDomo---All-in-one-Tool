import React, { useState, useEffect } from 'react';
import { Terminal, Zap } from 'lucide-react';

interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

interface McpConnectionManagerProps {
  mcpServerUrl: string;
  setMcpServerUrl: (url: string) => void;
  mcpConnected: boolean;
  setMcpConnected: (status: boolean) => void;
  mcpTools: McpTool[];
  setMcpTools: (tools: McpTool[]) => void;
}

export const McpConnectionManager: React.FC<McpConnectionManagerProps> = ({
  mcpServerUrl,
  setMcpServerUrl,
  mcpConnected,
  setMcpConnected,
  mcpTools,
  setMcpTools
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [testToolName, setTestToolName] = useState<string>('git_status');
  const [testArgsJson, setTestArgsJson] = useState<string>('{}');
  const [testResult, setTestResult] = useState<string>('');
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toTimeString().split(' ')[0]}] ${msg}`]);
  };

  const handleConnectMcp = async () => {
    addLog(`Connecting to MCP Server at ${mcpServerUrl}...`);
    try {
      // Connect to the Server-Sent Events endpoint
      const eventSource = new EventSource(mcpServerUrl);
      
      eventSource.onopen = () => {
        setMcpConnected(true);
        addLog('✅ SSE channel established successfully.');
        fetchTools();
      };

      eventSource.onerror = (e) => {
        console.error('SSE Error:', e);
        setMcpConnected(false);
        addLog('❌ Connection to SSE endpoint failed. Is the MCP server running?');
        eventSource.close();
      };

      // Listen for incoming messages from server
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addLog(`📥 Received RPC: ${JSON.stringify(data)}`);
        } catch (err) {
          addLog(`📥 Raw Event: ${event.data}`);
        }
      };

    } catch (err: any) {
      addLog(`❌ Connection setup exception: ${err.message}`);
    }
  };

  const fetchTools = async () => {
    addLog('📤 Querying tools list (tools/list)...');
    try {
      const msgUrl = mcpServerUrl.replace('/sse', '/message');
      const res = await fetch(msgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          id: 1
        })
      });
      if (res.ok) {
        const data = await res.json();
        const toolsList = data.result?.tools || [];
        setMcpTools(toolsList);
        addLog(`✅ Successfully loaded ${toolsList.length} MCP tools.`);
      } else {
        addLog('❌ Failed loading tools list from post messages.');
      }
    } catch (err: any) {
      addLog(`❌ Error fetching tools: ${err.message}`);
    }
  };

  const handleRunTestCall = async () => {
    if (isRunningTest) return;
    setIsRunningTest(true);
    setTestResult('');
    addLog(`📤 Calling MCP tool: ${testToolName}...`);

    try {
      const parsedArgs = JSON.parse(testArgsJson);
      const msgUrl = mcpServerUrl.replace('/sse', '/message');
      
      const res = await fetch(msgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: testToolName,
            arguments: parsedArgs
          },
          id: 2
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result?.isError) {
          setTestResult(`Error: ${JSON.stringify(data.result, null, 2)}`);
          addLog(`❌ Tool call error result received.`);
        } else {
          setTestResult(JSON.stringify(data.result || data, null, 2));
          addLog(`✅ Tool call successfully resolved.`);
        }
      } else {
        setTestResult(`HTTP error: ${res.statusText}`);
        addLog(`❌ Tool call failed HTTP check.`);
      }
    } catch (err: any) {
      setTestResult(`Exception: ${err.message}`);
      addLog(`❌ Tool call exception: ${err.message}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  useEffect(() => {
    // Autoconnect check on load if URL is present
    if (mcpServerUrl) {
      handleConnectMcp();
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left animate-fadeIn">
      {/* Configuration */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card bg-[#18191B] p-5 border border-[#2A2D30] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#2A2D30]">
            <h3 className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-[#3C6B4D]" />
              <span>MCP Server Config</span>
            </h3>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
              mcpConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {mcpConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">SSE Server Endpoint</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={mcpServerUrl}
                onChange={(e) => setMcpServerUrl(e.target.value)}
                placeholder="http://localhost:3001/sse"
                className="flex-1 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
              />
              <button
                onClick={handleConnectMcp}
                className="px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl"
              >
                Connect
              </button>
            </div>
            <span className="text-[9px] text-[#72706C] leading-normal block pt-1">
              Ensure you started the Node server by running `npm start` inside `mcp-server/`.
            </span>
          </div>
        </div>

        {/* Available tools list */}
        <div className="glass-card bg-[#18191B] p-5 border border-[#2A2D30] space-y-3">
          <h3 className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider border-b border-[#2A2D30] pb-2">
            Discovered Tools ({mcpTools.length})
          </h3>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {mcpTools.length === 0 ? (
              <span className="text-xs text-[#72706C] italic block text-center py-6">No tools discovered yet. Connect to a server.</span>
            ) : (
              mcpTools.map((tool) => (
                <div key={tool.name} className="bg-[#111213] border border-[#2A2D30] p-2.5 rounded-lg space-y-1">
                  <span className="text-[11px] font-mono font-bold text-emerald-400">{tool.name}</span>
                  <p className="text-[9px] text-[#A3A09B] leading-relaxed">{tool.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Diagnostics Console and Live Test */}
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card bg-[#18191B] p-5 border border-[#2A2D30] space-y-4">
          <h3 className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider border-b border-[#2A2D30] pb-2 flex items-center gap-1.5">
            <Terminal size={14} className="text-[#3C6B4D]" />
            <span>Interactive Tool Runner & Diagnostics</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#72706C] uppercase">Select Tool</label>
              <select
                value={testToolName}
                onChange={(e) => {
                  setTestToolName(e.target.value);
                  const selected = mcpTools.find(t => t.name === e.target.value);
                  if (selected) {
                    // Populate default empty args matching schema keys
                    const defaultArgs: Record<string, string> = {};
                    if (selected.inputSchema?.properties) {
                      Object.keys(selected.inputSchema.properties).forEach(k => {
                        defaultArgs[k] = '';
                      });
                    }
                    setTestArgsJson(JSON.stringify(defaultArgs, null, 2));
                  }
                }}
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
              >
                {mcpTools.length === 0 ? (
                  <>
                    <option value="git_status">git_status</option>
                    <option value="execute_command">execute_command</option>
                    <option value="stitch">stitch</option>
                  </>
                ) : (
                  mcpTools.map(t => <option key={t.name} value={t.name}>{t.name}</option>)
                )}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#72706C] uppercase">Tool Arguments (JSON)</label>
              <textarea
                value={testArgsJson}
                onChange={(e) => setTestArgsJson(e.target.value)}
                rows={2}
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-2 text-xs font-mono text-[#ECEBE9] focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-[#2A2D30]/60">
            <button
              onClick={handleRunTestCall}
              disabled={isRunningTest}
              className="px-4 py-1.5 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {isRunningTest ? 'Running Call...' : 'Execute Tool Call'}
            </button>
          </div>

          {/* Test output block */}
          {testResult && (
            <div className="space-y-1.5 text-left">
              <span className="text-[9px] font-bold text-[#72706C] uppercase block">JSONRPC Response</span>
              <pre className="bg-[#0A0B0C] border border-[#2A2D30] rounded-xl p-3 h-32 overflow-y-auto font-mono text-[10px] text-[#A3A09B]">
                <code>{testResult}</code>
              </pre>
            </div>
          )}
        </div>

        {/* SSE Logging Feed */}
        <div className="glass-card bg-[#18191B] p-5 border border-[#2A2D30] space-y-3">
          <h3 className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider border-b border-[#2A2D30] pb-2">
            SSE Connection Logs
          </h3>
          <div className="bg-[#0A0B0C] border border-[#2A2D30] rounded-xl p-3.5 h-36 overflow-y-auto font-mono text-[10px] text-[#A3A09B] space-y-1.5">
            {logs.length === 0 ? (
              <span className="text-[#72706C] italic block text-center py-6">Logs empty. Connection logs will stream here.</span>
            ) : (
              logs.map((logLine, idx) => (
                <div key={idx} className="leading-relaxed">
                  {logLine}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
