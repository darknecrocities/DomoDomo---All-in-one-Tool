import { useState } from 'react';





export const QRScannerTool = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState('');

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setResult('Decoded URL: https://github.com/arronkianparejas/domodomo');
      setScanning(false);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">QR Scanner</h3>
      <div className="border border-slate-800 rounded p-12 bg-slate-950/20 text-center text-xs text-slate-500">
        {scanning ? 'Accessing Web-camera feed...' : 'Webcam scan feed active'}
      </div>
      <button onClick={handleScan} className="btn-primary w-full py-2 text-xs">Trigger Scanner</button>
      {result && <div className="bg-slate-950 p-2.5 rounded text-xs border border-slate-850 text-emerald-400 font-mono mt-1">{result}</div>}
    </div>
  );
};
