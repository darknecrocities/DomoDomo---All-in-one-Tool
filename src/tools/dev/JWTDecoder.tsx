import { useState, useEffect } from 'react';
import { Shield, Clock, AlertTriangle, Key, BookOpen, Clipboard, Check } from 'lucide-react';
import { handleTextCopy } from '../../utils/sharedHelpers';

export const JWTDecoderTool = () => {
  const [token, setToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjI1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Time details
  const [issuedAt, setIssuedAt] = useState<Date | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const handleDecode = () => {
    try {
      setError('');
      if (!token.trim()) return;

      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. A valid token must have exactly 3 parts separated by dots.');
      }

      const hDecoded = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
      const pDecoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      
      const parsedHeader = JSON.parse(hDecoded);
      const parsedPayload = JSON.parse(pDecoded);

      setHeader(JSON.stringify(parsedHeader, null, 2));
      setPayload(JSON.stringify(parsedPayload, null, 2));
      setSignature(parts[2]);

      // Calculate time fields
      if (parsedPayload.iat) {
        setIssuedAt(new Date(parsedPayload.iat * 1000));
      } else {
        setIssuedAt(null);
      }

      if (parsedPayload.exp) {
        const expDate = new Date(parsedPayload.exp * 1000);
        setExpiresAt(expDate);
        setIsExpired(expDate.getTime() < Date.now());
      } else {
        setExpiresAt(null);
        setIsExpired(false);
      }

    } catch (e: any) {
      setError(e.message || 'Parsing failed');
      setHeader('');
      setPayload('');
      setSignature('');
      setIssuedAt(null);
      setExpiresAt(null);
    }
  };

  useEffect(() => {
    handleDecode();
  }, [token]);

  // Visual parsing segments highlight
  const parts = token.split('.');
  const hasThreeParts = parts.length === 3;

  return (
    <div className="max-w-4xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Shield size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">JWT Decoder & Inspector</h3>
          <p className="text-[10px] text-slate-500">Offline JSON Web Token structure inspector and validity checker</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">OAuth2</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Token input block */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Paste JWT Token</span>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value.trim())}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono h-56 text-slate-200 resize-none w-full focus:outline-none focus:border-teal-500/50 break-all"
          />

          {hasThreeParts ? (
            <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-lg flex flex-col gap-1.5 text-[10px]">
              <span className="font-bold uppercase text-slate-500 text-[9px] mb-1">Color Coded Structure</span>
              <div className="break-all font-mono leading-relaxed max-h-[100px] overflow-y-auto">
                <span className="text-rose-400">{parts[0]}</span>
                <span className="text-slate-500">.</span>
                <span className="text-purple-400">{parts[1]}</span>
                <span className="text-slate-500">.</span>
                <span className="text-sky-400">{parts[2]}</span>
              </div>
            </div>
          ) : (
            <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 text-[10px] p-3 rounded-lg flex items-start gap-1.5">
              <AlertTriangle size={12} className="shrink-0 mt-0.5" />
              <span>Token must have exactly 3 parts separated by dots.</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 text-[10px] p-3 rounded-lg flex items-start gap-1.5">
              <AlertTriangle size={12} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Decoded results block */}
        <div className="lg:col-span-7 flex flex-col gap-4 border-l border-slate-850 lg:pl-6">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Decoded Payload</span>

          {header && payload ? (
            <div className="flex flex-col gap-3">
              {/* Token Time status */}
              {(issuedAt || expiresAt) && (
                <div className="grid grid-cols-2 gap-2 bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                  {issuedAt && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock size={12} className="text-slate-500" />
                      <div>
                        <div className="text-[9px] text-slate-550 uppercase">Issued At</div>
                        <div className="font-mono text-slate-200 mt-0.5">{issuedAt.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  )}

                  {expiresAt && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <Clock size={12} className={isExpired ? 'text-rose-500' : 'text-teal-500'} />
                      <div>
                        <div className="text-[9px] text-slate-550 uppercase">Expires At</div>
                        <div className={`font-mono mt-0.5 ${isExpired ? 'text-rose-400' : 'text-teal-400'}`}>
                          {expiresAt.toLocaleTimeString()} {isExpired ? '(Expired)' : '(Active)'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Header block */}
              <div className="flex flex-col gap-1 bg-rose-950/10 border border-rose-900/20 p-3 rounded-lg">
                <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5"><Key size={11} /> Header: Algorithm & Token Type</span>
                <pre className="text-[11px] font-mono text-rose-200 overflow-x-auto whitespace-pre-wrap">{header}</pre>
              </div>

              {/* Payload block */}
              <div className="flex flex-col gap-1 bg-purple-950/10 border border-purple-900/20 p-3 rounded-lg">
                <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5"><BookOpen size={11} /> Payload: Claims Data</span>
                <pre className="text-[11px] font-mono text-purple-200 overflow-x-auto whitespace-pre-wrap">{payload}</pre>
              </div>

              {/* Signature block */}
              <div className="flex flex-col gap-1 bg-sky-950/10 border border-sky-900/20 p-3 rounded-lg">
                <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wider">Signature</span>
                <span className="text-[10px] font-mono text-sky-200 truncate">{signature}</span>
              </div>
            </div>
          ) : (
            <div className="h-56 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-slate-550 text-xs">
              Provide a valid base64 token to decode
            </div>
          )}

          {payload && (
            <div className="flex gap-2">
              <button onClick={() => handleTextCopy(payload, setCopied)}
                className="flex-1 btn-secondary py-2 text-xs font-bold flex items-center justify-center gap-1.5">
                {copied ? <Check size={14} className="text-teal-400" /> : <Clipboard size={14} />}
                {copied ? 'Payload Copied' : 'Copy Payload claims'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
