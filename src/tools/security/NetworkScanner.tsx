import React, { useState } from 'react';
import { Globe, ShieldAlert, Activity, Wifi, Laptop, Search } from 'lucide-react';

export const NetworkScannerTool: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [localIp, setLocalIp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLocalIP = async () => {
    setIsScanning(true);
    setError(null);
    setLocalIp(null);

    try {
      // Create a dummy RTCPeerConnection to extract the local IP address
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      return new Promise<void>((resolve, reject) => {
        pc.onicecandidate = (event) => {
          if (!event || !event.candidate) {
            // End of candidates
            if (!localIp) {
              reject(new Error('WebRTC failed to leak local IP. Modern browsers obscure local IPs for privacy via mDNS.'));
            }
            pc.close();
            setIsScanning(false);
            resolve();
            return;
          }

          const candidateParts = event.candidate.candidate.split(' ');
          const ip = candidateParts[4];
          if (ip && ip.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/)) {
            setLocalIp(ip);
            pc.close();
            setIsScanning(false);
            resolve();
          }
        };

        // Timeout fallback
        setTimeout(() => {
          pc.close();
          setIsScanning(false);
          reject(new Error('WebRTC timeout. Browser privacy settings may be preventing local IP discovery.'));
        }, 3000);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to initialize WebRTC.');
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
          <Globe size={20} className="text-[#3C6B4D]" />
          Local Network Scanner
        </h3>
        <p className="text-[#A3A09B] text-xs leading-relaxed">
          Attempts to discover your local IPv4 address using WebRTC (ICE candidates). 
          Note: Modern browsers block deep network scanning and obscure local IPs using mDNS to prevent fingerprinting.
          This tool demonstrates what web applications can see about your internal network.
        </p>
      </div>

      <div className="glass-card p-8 border-[#2A2D30] bg-[#111213] flex flex-col items-center text-center gap-6">
        <div className="w-24 h-24 rounded-full bg-[#18191B] border border-[#2A2D30] flex items-center justify-center shadow-lg relative">
          <Wifi size={40} className="text-[#3C6B4D]" />
          {isScanning && (
            <div className="absolute inset-0 rounded-full border-2 border-[#3C6B4D] animate-ping opacity-75" />
          )}
        </div>
        
        <button
          onClick={getLocalIP}
          disabled={isScanning}
          className="btn-primary py-3 px-8 text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all"
        >
          {isScanning ? (
            <>
              <Activity size={16} className="animate-spin" />
              <span>Scanning WebRTC...</span>
            </>
          ) : (
            <>
              <Search size={16} />
              <span>Discover Local IP</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="glass-card p-6 border-amber-500/30 bg-amber-500/5 flex items-start gap-4">
          <ShieldAlert size={24} className="text-amber-500 shrink-0 mt-1" />
          <div className="flex flex-col gap-1 text-left">
            <h4 className="font-bold text-amber-500 text-sm">Discovery Blocked</h4>
            <p className="text-[#ECEBE9] text-xs leading-relaxed">
              {error}
            </p>
            <p className="text-[#A3A09B] text-[10px] mt-2">
              (This is actually good for your security! It means malicious websites cannot easily map your home network.)
            </p>
          </div>
        </div>
      )}

      {localIp && (
        <div className="glass-card p-6 border-[#3C6B4D]/30 bg-[#3C6B4D]/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#111213] rounded-xl border border-[#2A2D30]">
              <Laptop size={24} className="text-[#3C6B4D]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-[#A3A09B] uppercase font-bold tracking-wider">Your Local Device IP</span>
              <span className="text-xl font-bold text-[#ECEBE9] font-mono">{localIp}</span>
            </div>
          </div>
          <div className="px-3 py-1 bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 rounded-lg text-xs font-bold text-[#3C6B4D]">
            Exposed via WebRTC
          </div>
        </div>
      )}
    </div>
  );
};
