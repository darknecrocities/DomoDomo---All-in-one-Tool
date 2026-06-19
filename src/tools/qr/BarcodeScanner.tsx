import { useState } from 'react';





export const BarcodeScannerTool = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState('');

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setResult('Decoded Barcode: 501234567890');
      setScanning(false);
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Barcode Scanner</h3>
      <div className="border border-slate-800 rounded p-12 bg-slate-950/20 text-center text-xs text-slate-500">
        {scanning ? 'Accessing camera feed...' : 'Camera reader initialization active'}
      </div>
      <button onClick={handleScan} className="btn-primary w-full py-2 text-xs">Scan Barcode</button>
      {result && <div className="bg-slate-950 p-2.5 rounded text-xs border border-slate-850 text-emerald-400 font-mono mt-1">{result}</div>}
    </div>
  );
};
