import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, ClipboardList, HelpCircle } from 'lucide-react';

export const IPSubnetterTool = () => {
  const [ipAddress, setIpAddress] = useState('192.168.1.1');
  const [cidr, setCidr] = useState(24);
  const [copied, setCopied] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Subnetting outputs
  const [netmask, setNetmask] = useState('');
  const [wildcard, setWildcard] = useState('');
  const [networkAddress, setNetworkAddress] = useState('');
  const [broadcastAddress, setBroadcastAddress] = useState('');
  const [usableFirst, setUsableFirst] = useState('');
  const [usableLast, setUsableLast] = useState('');
  const [totalHosts, setTotalHosts] = useState(0);
  const [ipType, setIpType] = useState('Private Network');

  // Binary representations
  const [ipBinary, setIpBinary] = useState('');
  const [maskBinary, setMaskBinary] = useState('');

  // Port lookup
  const [portInput, setPortInput] = useState('80');
  const [portDescription, setPortDescription] = useState('HTTP: Hypertext Transfer Protocol (Cleartext Web)');

  const COMMON_PORTS: Record<string, string> = {
    '20': 'FTP-Data: File Transfer Protocol (Data connection)',
    '21': 'FTP-Control: File Transfer Protocol (Commands)',
    '22': 'SSH / SFTP: Secure Shell remote login or encrypted file copy',
    '23': 'Telnet: Legacy unencrypted text terminal connection',
    '25': 'SMTP: Simple Mail Transfer Protocol (Outgoing email router)',
    '53': 'DNS: Domain Name System name lookup service',
    '80': 'HTTP: Hypertext Transfer Protocol (Cleartext Web)',
    '110': 'POP3: Post Office Protocol v3 (Retrieves user mail)',
    '143': 'IMAP: Internet Message Access Protocol (Mail synchronizer)',
    '443': 'HTTPS: Hypertext Transfer Protocol Secure (Encrypted Web)',
    '3306': 'MySQL: Standard relational SQL database connection port',
    '5432': 'PostgreSQL: Relational database socket connection',
    '6379': 'Redis: Cache key-value server socket port',
    '8080': 'HTTP-Proxy: Alternative local web server endpoint',
  };

  const ipToVal = (ip: string): number => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  };

  const valToIp = (val: number): string => {
    return [
      (val >>> 24) & 255,
      (val >>> 16) & 255,
      (val >>> 8) & 255,
      val & 255
    ].join('.');
  };

  const getBinaryString = (val: number): string => {
    const raw = (val >>> 0).toString(2).padStart(32, '0');
    return raw.match(/.{8}/g)?.join('.') || raw;
  };

  const calculateSubnet = () => {
    // Validate IP format
    const ipReg = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
    if (!ipReg.test(ipAddress)) {
      setIsValid(false);
      return;
    }
    setIsValid(true);

    const ipVal = ipToVal(ipAddress);
    
    // Mask calculations
    const maskVal = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildVal = (~maskVal) >>> 0;
    
    const netVal = (ipVal & maskVal) >>> 0;
    const bcastVal = (netVal | wildVal) >>> 0;

    setNetmask(valToIp(maskVal));
    setWildcard(valToIp(wildVal));
    setNetworkAddress(valToIp(netVal));
    setBroadcastAddress(valToIp(bcastVal));

    setIpBinary(getBinaryString(ipVal));
    setMaskBinary(getBinaryString(maskVal));

    // Usable host range
    if (cidr >= 31) {
      setUsableFirst('N/A');
      setUsableLast('N/A');
      setTotalHosts(cidr === 32 ? 1 : 2);
    } else {
      setUsableFirst(valToIp(netVal + 1));
      setUsableLast(valToIp(bcastVal - 1));
      setTotalHosts(Math.max(0, bcastVal - netVal - 1));
    }

    // IP Type classification check
    const p1 = parseInt(ipAddress.split('.')[0]);
    const p2 = parseInt(ipAddress.split('.')[1]);
    if (p1 === 10 || (p1 === 172 && p2 >= 16 && p2 <= 31) || (p1 === 192 && p2 === 168)) {
      setIpType('Private Network (RFC 1918 Address Space)');
    } else if (p1 === 127) {
      setIpType('Local Loopback address (localhost)');
    } else {
      setIpType('Public Internet IP Address Space');
    }
  };

  useEffect(() => {
    calculateSubnet();
  }, [ipAddress, cidr]);

  const handlePortSearch = (port: string) => {
    setPortInput(port);
    const desc = COMMON_PORTS[port.trim()] || 'Unknown Port: Standard registry description not loaded.';
    setPortDescription(desc);
  };

  const handleExport = () => {
    const report = `IP Address Subnet Report\n=======================\nIP Address: ${ipAddress}/${cidr}\nNetwork Mask: ${netmask}\nWildcard Mask: ${wildcard}\nNetwork Address: ${networkAddress}\nBroadcast Address: ${broadcastAddress}\nUsable Host Range: ${usableFirst} - ${usableLast}\nTotal Usable Hosts: ${totalHosts}\nIP Classification: ${ipType}\n`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subnet_report_${ipAddress}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Editor Inputs */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-[#3C6B4D] font-bold border-b border-slate-800 pb-2">Subnet Mask Calculator</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase">IP Address</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. 192.168.1.1"
                className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-mono focus:outline-none focus:border-[#3C6B4D]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase">CIDR Prefix (/{cidr})</label>
              <select
                value={cidr}
                onChange={(e) => setCidr(Number(e.target.value))}
                className="bg-slate-950 border border-slate-850 text-slate-350 p-2.5 text-xs rounded-xl focus:outline-none focus:border-[#3C6B4D]"
              >
                {Array.from({ length: 32 }, (_, i) => 32 - i).map(c => (
                  <option key={c} value={c}>/{c} - Mask: {valToIp((~0 << (32 - c)) >>> 0)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            isValid 
              ? 'bg-emerald-950/10 border-emerald-900/60 text-emerald-400' 
              : 'bg-rose-950/20 border-rose-950 text-rose-400'
          }`}>
            {isValid ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
            <span className="text-xs font-semibold">{isValid ? 'IP address syntax is valid.' : 'Invalid IP address syntax.'}</span>
          </div>
        </div>

        {/* Calculated Results */}
        {isValid && (
          <div className="glass-card p-6 flex flex-col gap-4">
            <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-850 pb-2">Subnet Metrics</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                { label: 'Network Mask', val: netmask },
                { label: 'Wildcard Mask', val: wildcard },
                { label: 'Network Address', val: networkAddress },
                { label: 'Broadcast Address', val: broadcastAddress },
                { label: 'Usable Range', val: `${usableFirst} - ${usableLast}` },
                { label: 'Total Usable Hosts', val: totalHosts.toLocaleString() }
              ].map((res, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-3 border border-slate-850/50 rounded-xl">
                  <span className="text-slate-500 font-bold uppercase">{res.label}</span>
                  <span className="font-mono font-bold text-slate-200">{res.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bitwise binary visualizer */}
        {isValid && (
          <div className="glass-card p-6 flex flex-col gap-3">
            <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-850 pb-2">Bitwise Binary Representation</span>
            <div className="flex flex-col gap-2 font-mono text-[11px] text-slate-350 bg-slate-950 p-4 rounded-xl border border-slate-850/60 leading-relaxed">
              <div className="flex justify-between">
                <span className="text-slate-550">IP Address:</span>
                <span className="font-bold">{ipBinary}</span>
              </div>
              <div className="flex justify-between border-t border-slate-850/60 pt-2">
                <span className="text-slate-550">Net Mask:</span>
                <span className="font-bold">{maskBinary}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calculator sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Export calculations */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-800 pb-2">Calculations Report</span>
          <button
            onClick={handleExport}
            className="w-full py-2.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/90 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <ClipboardList size={14} />
            <span>{copied ? 'Report Exported!' : 'Export Subnet Report'}</span>
          </button>
        </div>

        {/* Port socket helper calculator */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs text-[#3C6B4D] font-bold uppercase border-b border-slate-850 pb-2 flex items-center gap-1.5"><Cpu size={14} /> Port Socket Registry</span>
          
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Enter Socket Port</label>
              <input
                type="text"
                value={portInput}
                onChange={(e) => handlePortSearch(e.target.value)}
                placeholder="e.g. 22"
                className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>

            <div className="bg-slate-950 border border-slate-850/85 p-3 rounded-xl flex items-start gap-2">
              <HelpCircle size={14} className="text-[#3C6B4D] shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-350 leading-relaxed font-semibold">{portDescription}</p>
            </div>
          </div>
        </div>

        {/* IP Classification status */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-800 pb-2">IP Classification</span>
          <div className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl text-center text-xs font-bold text-slate-300">
            {ipType}
          </div>
        </div>
      </div>
    </div>
  );
};
