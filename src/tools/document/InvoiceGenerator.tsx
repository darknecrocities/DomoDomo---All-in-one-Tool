import { triggerTextDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { FileText, Download, Plus, Trash2, Printer } from 'lucide-react';

interface InvoiceItem {
  id: string;
  desc: string;
  qty: number;
  price: number;
}

export const InvoiceGeneratorTool = () => {
  const [invoiceId, setInvoiceId] = useState('INV-2026-001');
  const [company, setCompany] = useState('DomoDomo Tech Labs');
  const [client, setClient] = useState('Acme Corporation');
  const [date, setDate] = useState('2026-06-19');
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', desc: 'In-browser heavy WASM processing', qty: 1, price: 150 },
    { id: '2', desc: 'Local Client-side Toolbox deployment', qty: 2, price: 45 }
  ]);
  const [taxRate, setTaxRate] = useState<number>(12); // 12% VAT standard

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { id: Math.random().toString(), desc: 'New Invoice Item', qty: 1, price: 10 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, val: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  // Computations
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const compileReceiptText = () => {
    return `INVOICE ${invoiceId}
Date: ${date}
--------------------------------------------------
Sender: ${company}
Bill To: ${client}
--------------------------------------------------
ITEMS LIST
${items.map((item, index) => `${index + 1}. ${item.desc} (x${item.qty}) - $${(item.qty * item.price).toFixed(2)}`).join('\n')}

--------------------------------------------------
Subtotal: $${subtotal.toFixed(2)}
Tax Rate: ${taxRate}%
Tax Amount: $${taxAmount.toFixed(2)}
--------------------------------------------------
GRAND TOTAL: $${grandTotal.toFixed(2)}
==================================================`;
  };

  const handleDownload = () => {
    const text = compileReceiptText();
    triggerTextDownload(text, `invoice_${invoiceId.toLowerCase()}.txt`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Input specs */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-[#4E8E5E]" size={22} />
              <span>Invoice Form Creator</span>
            </h2>
          </div>

          {/* Header Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500">Invoice ID</label>
              <input type="text" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500">Issue Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500">Company Name</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500">Client / Bill To</label>
              <input type="text" value={client} onChange={(e) => setClient(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
            </div>
          </div>

          {/* Table of items */}
          <div className="flex flex-col gap-3 pt-3 border-t border-slate-850">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-455 font-bold uppercase tracking-wider">Itemized Rows</span>
              <button
                onClick={handleAddItem}
                className="py-1 px-3 bg-[#4E8E5E]/20 text-[#4E8E5E] border border-[#4E8E5E]/30 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-[#4E8E5E]/35"
              >
                <Plus size={10} />
                <span>Add Row</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center bg-slate-900/30 p-2.5 rounded-xl border border-slate-850 text-xs">
                  <input
                    type="text"
                    value={item.desc}
                    onChange={(e) => handleUpdateItem(item.id, 'desc', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  />
                  <input
                    type="number"
                    value={item.qty}
                    min="1"
                    onChange={(e) => handleUpdateItem(item.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-center"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    value={item.price}
                    min="0"
                    onChange={(e) => handleUpdateItem(item.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-center"
                    placeholder="Price"
                  />
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 hover:bg-rose-950/20 text-rose-400 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Invoicing Workspace */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 justify-between min-h-[500px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider">Receipt Summary</h3>
            <button
              onClick={() => window.print()}
              className="py-1 px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400 flex items-center gap-1 hover:text-slate-200"
            >
              <Printer size={10} />
              <span>Print Page</span>
            </button>
          </div>

          {/* Formatted invoice template */}
          <div className="flex-1 bg-slate-950 p-5 rounded-2xl border border-slate-900 overflow-y-auto leading-relaxed text-xs">
            <div className="flex flex-col gap-4 text-slate-300 font-sans">
              <div className="flex justify-between border-b border-slate-900 pb-3">
                <div className="flex flex-col">
                  <span className="font-bold text-white text-base">{company}</span>
                  <span className="text-[10px] text-slate-500 mt-1">Issue Date: {date}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[#4E8E5E] font-bold text-xs uppercase tracking-wider">INVOICE</span>
                  <span className="font-mono text-slate-400 font-bold mt-1">{invoiceId}</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Bill To</span>
                <span className="text-slate-200 font-semibold">{client}</span>
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
                {items.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 truncate max-w-[150px]">{index + 1}. {item.desc}</span>
                    <span className="font-mono text-slate-300">
                      {item.qty} × ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial metrics block */}
              <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-900 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                
                {/* Tax configuration */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span>Tax VAT Ratio:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-10 bg-slate-900 border border-slate-800 rounded text-center text-[10px] text-slate-200 py-0.5"
                    />
                    <span>%</span>
                  </span>
                  <span className="font-mono">${taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-t border-slate-900 pt-2 font-bold text-white">
                  <span>Grand Total:</span>
                  <span className="text-[#4E8E5E] font-mono">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-slate-800">
            <button onClick={handleDownload} className="btn-primary w-full py-3">
              <Download size={18} />
              <span>Save Invoice Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
