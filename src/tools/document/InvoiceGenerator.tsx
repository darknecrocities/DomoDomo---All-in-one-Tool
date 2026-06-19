import { triggerTextDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const InvoiceGeneratorTool = () => {
  const [client, setClient] = useState('Client Co');
  const [amount, setAmount] = useState('1500');

  const handleDownload = () => {
    const doc = `INVOICE\nClient: ${client}\nAmount Due: $${amount}\n\nProcessed locally on DomoDomo`;
    triggerTextDownload(doc, 'invoice.txt');
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Invoice Generator</h3>
      <input type="text" placeholder="Client Name" value={client} onChange={(e) => setClient(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <button onClick={handleDownload} className="btn-primary w-full py-2 text-xs">Generate Invoice</button>
    </div>
  );
};
