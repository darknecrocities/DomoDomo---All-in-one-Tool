import { triggerTextDownload } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import { FileText, Download, Plus, Trash2, Printer, Globe, DollarSign } from 'lucide-react';
import domodomoLogo from '../../assets/domodomo.png';

interface InvoiceItem {
  id: string;
  desc: string;
  qty: number;
  price: number;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 0.92 },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rateToUSD: 58.50 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 155.0 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToUSD: 1.37 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 1.50 }
];

export const InvoiceGeneratorTool = () => {
  const [invoiceId, setInvoiceId] = useState('INV-2026-001');
  const [company, setCompany] = useState('DomoDomo Tech Labs');
  const [companyAddress, setCompanyAddress] = useState('123 Bamboo Lane, Manila, Philippines');
  const [companyEmail, setCompanyEmail] = useState('billing@domodomo.io');
  
  const [client, setClient] = useState('Acme Corporation');
  const [clientAddress, setClientAddress] = useState('456 Industrial Parkway, CA 94043');
  const [clientEmail, setClientEmail] = useState('accounts@acme.com');
  
  const [date, setDate] = useState('2026-06-24');
  const [dueDate, setDueDate] = useState('2026-07-24');
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', desc: 'In-browser heavy WASM processing services', qty: 1, price: 150 },
    { id: '2', desc: 'Local Client-side Custom Toolbox deployment', qty: 2, price: 45 }
  ]);
  const [taxRate, setTaxRate] = useState<number>(12); // 12% VAT standard
  const [notes, setNotes] = useState('Thank you for choosing DomoDomo. Payment due within 30 days.');

  // FX Conversion State
  const [baseCurrencyCode, setBaseCurrencyCode] = useState('USD');
  const [targetCurrencyCode, setTargetCurrencyCode] = useState('PHP');
  const [exchangeRate, setExchangeRate] = useState<number>(58.50);
  const [enableFX, setEnableFX] = useState(false);

  // Sync exchange rate dynamically when base or target currency shifts
  useEffect(() => {
    const base = CURRENCIES.find(c => c.code === baseCurrencyCode);
    const target = CURRENCIES.find(c => c.code === targetCurrencyCode);
    if (base && target) {
      // Calculate relative rate: (target rate to USD) / (base rate to USD)
      const calculatedRate = target.rateToUSD / base.rateToUSD;
      setExchangeRate(parseFloat(calculatedRate.toFixed(4)));
    }
  }, [baseCurrencyCode, targetCurrencyCode]);

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

  const baseCurrency = CURRENCIES.find(c => c.code === baseCurrencyCode) || CURRENCIES[0];
  const targetCurrency = CURRENCIES.find(c => c.code === targetCurrencyCode) || CURRENCIES[2];

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  // FX Converted Calculations
  const convSubtotal = subtotal * exchangeRate;
  const convTaxAmount = taxAmount * exchangeRate;
  const convGrandTotal = grandTotal * exchangeRate;

  const compileReceiptText = () => {
    let text = `INVOICE ${invoiceId}
Date: ${date} | Due Date: ${dueDate}
--------------------------------------------------
SENDER DETAILS:
Company: ${company}
Address: ${companyAddress}
Email: ${companyEmail}

BILL TO:
Client: ${client}
Address: ${clientAddress}
Email: ${clientEmail}
--------------------------------------------------
ITEMS LIST:
${items.map((item, idx) => `${idx + 1}. ${item.desc} (x${item.qty}) - ${baseCurrency.symbol}${item.price.toFixed(2)} = ${baseCurrency.symbol}${(item.qty * item.price).toFixed(2)}`).join('\n')}

--------------------------------------------------
Subtotal: ${baseCurrency.symbol}${subtotal.toFixed(2)}
Tax Rate: ${taxRate}%
Tax Amount: ${baseCurrency.symbol}${taxAmount.toFixed(2)}
--------------------------------------------------
GRAND TOTAL: ${baseCurrency.symbol}${grandTotal.toFixed(2)}`;

    if (enableFX) {
      text += `\n\n==================================================
FOREIGN EXCHANGE RATES CONVERSION:
Base: ${baseCurrencyCode} (${baseCurrency.symbol})
Target: ${targetCurrencyCode} (${targetCurrency.symbol})
Exchange Rate: 1 ${baseCurrencyCode} = ${exchangeRate} ${targetCurrencyCode}

CONVERTED SUMMARY:
Subtotal (${targetCurrencyCode}): ${targetCurrency.symbol}${convSubtotal.toFixed(2)}
Tax Amount (${targetCurrencyCode}): ${targetCurrency.symbol}${convTaxAmount.toFixed(2)}
GRAND TOTAL (${targetCurrencyCode}): ${targetCurrency.symbol}${convGrandTotal.toFixed(2)}`;
    }

    text += `\n==================================================\nNotes: ${notes}`;
    return text;
  };

  const handleDownload = () => {
    const text = compileReceiptText();
    triggerTextDownload(text, `invoice_${invoiceId.toLowerCase()}.txt`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Input Form Panel */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3">
            <h2 className="text-xl font-bold text-[#ECEBE9] flex items-center gap-2">
              <FileText className="text-[#3C6B4D]" size={22} />
              <span>Invoice Form Creator</span>
            </h2>
          </div>

          {/* Invoice ID, dates, and tax rate */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">Invoice ID</label>
              <input type="text" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#3C6B4D]/60" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">Issue Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#3C6B4D]/60" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#3C6B4D]/60" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">Tax Rate (%)</label>
              <input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(Math.max(0, parseInt(e.target.value) || 0))} className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#3C6B4D]/60 font-mono" />
            </div>
          </div>

          {/* Sender & Receiver Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#2A2D30]/65 pt-3.5">
            {/* Sender Column */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-[#3C6B4D] font-bold uppercase tracking-wider">Sender Details (Company)</span>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500">Name</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500">Address</label>
                <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500">Email Address</label>
                <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none" />
              </div>
            </div>

            {/* Receiver Column */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-[#E29E2D] font-bold uppercase tracking-wider">Bill To (Client)</span>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500">Name</label>
                <input type="text" value={client} onChange={(e) => setClient(e.target.value)} className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500">Address</label>
                <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500">Email Address</label>
                <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Currency & FX Section */}
          <div className="flex flex-col gap-3 border-t border-[#2A2D30]/65 pt-3.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={13} className="text-[#3C6B4D]" />
                <span>Currency & Foreign Exchange (FX)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">FX Conversion</span>
                <button
                  onClick={() => setEnableFX(!enableFX)}
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    enableFX ? 'bg-[#3C6B4D]' : 'bg-slate-700'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                    enableFX ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-500">Invoice Currency (Base)</label>
                <select
                  value={baseCurrencyCode}
                  onChange={(e) => setBaseCurrencyCode(e.target.value)}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>

              {enableFX && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-500">Target Currency</label>
                    <select
                      value={targetCurrencyCode}
                      onChange={(e) => setTargetCurrencyCode(e.target.value)}
                      className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-500">Exchange Rate (1 {baseCurrencyCode} =)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Itemized Rows */}
          <div className="flex flex-col gap-3 border-t border-[#2A2D30]/65 pt-3.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Itemized Rows</span>
              <button
                onClick={handleAddItem}
                className="py-1 px-3 bg-[#3C6B4D]/15 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded-xl text-[10px] font-bold flex items-center gap-1 hover:bg-[#3C6B4D]/30"
              >
                <Plus size={10} />
                <span>Add Row</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[190px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center bg-[#111213]/40 p-2.5 rounded-xl border border-[#2A2D30]/60 text-xs">
                  <input
                    type="text"
                    value={item.desc}
                    onChange={(e) => handleUpdateItem(item.id, 'desc', e.target.value)}
                    className="flex-1 bg-[#111213] border border-[#2A2D30] rounded-lg px-2.5 py-1 text-slate-200"
                    placeholder="Description"
                  />
                  <input
                    type="number"
                    value={item.qty}
                    min="1"
                    onChange={(e) => handleUpdateItem(item.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 bg-[#111213] border border-[#2A2D30] rounded-lg px-2.5 py-1 text-slate-200 text-center font-mono"
                    placeholder="Qty"
                  />
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-[10px]">{baseCurrency.symbol}</span>
                    <input
                      type="number"
                      value={item.price}
                      min="0"
                      onChange={(e) => handleUpdateItem(item.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-20 bg-[#111213] border border-[#2A2D30] rounded-lg pl-6 pr-2 py-1 text-slate-200 text-center font-mono"
                      placeholder="Price"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 hover:bg-rose-950/20 text-rose-400 rounded-xl transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Customization */}
          <div className="flex flex-col gap-1.5 border-t border-[#2A2D30]/65 pt-3.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Invoice Notes & Terms</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none h-14 resize-none"
              placeholder="Payment terms, bank details, etc."
            />
          </div>
        </div>
      </div>

      {/* Visual Invoicing Workspace Preview */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 justify-between min-h-[500px]">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider">Preview Sheet</h3>
            <button
              onClick={() => window.print()}
              className="py-1.5 px-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-[10px] text-slate-400 flex items-center gap-1.5 hover:text-slate-200 transition-all"
            >
              <Printer size={11} />
              <span>Print Invoice</span>
            </button>
          </div>

          {/* Styled Document Template */}
          <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 overflow-y-auto leading-relaxed text-xs text-slate-800 shadow-inner">
            <div className="flex flex-col gap-6 font-sans">
              
              {/* Top Banner Row */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <img src={domodomoLogo} alt="Logo" className="w-10 h-10 rounded-xl overflow-hidden shadow border border-slate-200" />
                  <div className="text-left">
                    <span className="font-extrabold text-base text-slate-900 block">{company}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{companyEmail}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#3C6B4D] tracking-widest block uppercase">INVOICE</span>
                  <span className="font-mono font-bold text-slate-500 mt-1 block">{invoiceId}</span>
                </div>
              </div>

              {/* Addresses Grid */}
              <div className="grid grid-cols-2 gap-4 text-left border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">From</span>
                  <span className="font-semibold text-slate-800 block">{company}</span>
                  <span className="text-slate-500 text-[10px] block leading-tight">{companyAddress}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bill To</span>
                  <span className="font-semibold text-slate-800 block">{client}</span>
                  <span className="text-slate-500 text-[10px] block leading-tight">{clientAddress}</span>
                  <span className="text-slate-400 text-[9px] font-mono block mt-1">{clientEmail}</span>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-4 text-left border-b border-slate-100 pb-4 text-[10px] font-mono">
                <div>
                  <span className="text-slate-400">Date of Issue:</span>
                  <span className="text-slate-700 font-bold ml-1.5">{date}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Due Date:</span>
                  <span className="text-rose-500 font-bold ml-1.5">{dueDate}</span>
                </div>
              </div>

              {/* Table Header */}
              <div className="flex flex-col gap-2 pt-2 text-left">
                <div className="grid grid-cols-12 font-bold text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  <div className="col-span-7">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-3 text-right">Amount</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-slate-50">
                  {items.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 py-2.5 items-center text-[10px]">
                      <div className="col-span-7 font-medium text-slate-700 truncate">{idx + 1}. {item.desc}</div>
                      <div className="col-span-2 text-center font-mono text-slate-500">{item.qty}</div>
                      <div className="col-span-3 text-right font-mono text-slate-700">
                        {baseCurrency.symbol}{(item.qty * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Calculation Block */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 font-mono text-[10px] text-slate-650">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal:</span>
                  <span>{baseCurrency.symbol}{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tax VAT ({taxRate}%):</span>
                  <span>{baseCurrency.symbol}{taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-2.5 font-bold text-slate-900 text-xs font-sans">
                  <span>Grand Total ({baseCurrencyCode}):</span>
                  <span className="text-[#3C6B4D] font-mono">{baseCurrency.symbol}{grandTotal.toFixed(2)}</span>
                </div>

                {/* FX Converted Output Highlight */}
                {enableFX && (
                  <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3.5 mt-2 flex flex-col gap-1.5 text-left font-sans text-[10px] text-slate-800 animate-fadeIn">
                    <div className="flex items-center justify-between pb-1 border-b border-emerald-100/40 text-emerald-800 font-bold uppercase tracking-wider text-[9px]">
                      <span className="flex items-center gap-1">
                        <DollarSign size={10} />
                        <span>FX Conversion ({targetCurrencyCode})</span>
                      </span>
                      <span>1 {baseCurrencyCode} = {exchangeRate} {targetCurrencyCode}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Subtotal:</span>
                      <span>{targetCurrency.symbol}{convSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Tax Amount:</span>
                      <span>{targetCurrency.symbol}{convTaxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-800 border-t border-emerald-100/40 pt-1.5 text-xs">
                      <span>Total Due ({targetCurrencyCode}):</span>
                      <span className="font-mono">{targetCurrency.symbol}{convGrandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes display */}
              {notes && (
                <div className="border-t border-slate-100 pt-4 text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider mb-1">Notes / Terms</span>
                  <p className="text-slate-500 text-[10px] leading-snug whitespace-pre-wrap">{notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Download Button */}
          <div className="flex gap-2.5 pt-2 border-t border-[#2A2D30]">
            <button onClick={handleDownload} className="btn-primary w-full py-3">
              <Download size={18} />
              <span>Save Invoice Text Summary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
