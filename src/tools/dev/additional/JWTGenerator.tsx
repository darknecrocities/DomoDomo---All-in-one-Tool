import { useState, useEffect } from 'react';
import { Copy, Check, ShieldCheck, ShieldAlert, Key, Calendar } from 'lucide-react';

export const JWTGeneratorTool = () => {
  const [header, setHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "admin": true\n}');
  const [secret, setSecret] = useState('your-256-bit-secret-here');
  const [showSecret, setShowSecret] = useState(false);
  const [algorithm, setAlgorithm] = useState('HS256');
  
  const [encodedToken, setEncodedToken] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Expiration helper states
  const [expMinutes, setExpMinutes] = useState(60);
  
  // Verification states
  const [tokenToVerify, setTokenToVerify] = useState('');
  const [verifiedHeader, setVerifiedHeader] = useState('');
  const [verifiedPayload, setVerifiedPayload] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // Base64URL helpers
  const base64UrlEncode = (str: string): string => {
    const bytes = new TextEncoder().encode(str);
    let binString = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binString += String.fromCharCode(bytes[i]);
    }
    return btoa(binString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const base64UrlDecode = (str: string): string => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  };

  // Cryptographic HS256 signature using SubtleCrypto
  const generateSignature = async (headerB64: string, payloadB64: string, secretStr: string): Promise<string> => {
    if (algorithm === 'none') return '';
    try {
      const enc = new TextEncoder();
      const keyData = enc.encode(secretStr);
      const data = enc.encode(`${headerB64}.${payloadB64}`);
      
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false,
        ['sign']
      );
      
      const signature = await window.crypto.subtle.sign('HMAC', key, data);
      
      // Convert ArrayBuffer to Base64URL
      const signBytes = new Uint8Array(signature);
      let binString = '';
      for (let i = 0; i < signBytes.byteLength; i++) {
        binString += String.fromCharCode(signBytes[i]);
      }
      return btoa(binString)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } catch (e) {
      console.error(e);
      return 'SIGNATURE_ERROR';
    }
  };

  // JWT Generator triggers
  useEffect(() => {
    const buildToken = async () => {
      try {
        // Validation check
        JSON.parse(header);
        JSON.parse(payload);
        
        const hB64 = base64UrlEncode(header.trim());
        const pB64 = base64UrlEncode(payload.trim());
        const sig = await generateSignature(hB64, pB64, secret);
        
        setEncodedToken(`${hB64}.${pB64}.${sig}`);
      } catch (err) {
        setEncodedToken('INVALID_JSON_INPUT');
      }
    };
    buildToken();
  }, [header, payload, secret, algorithm]);

  // Copy helper
  const handleCopy = () => {
    if (encodedToken && encodedToken !== 'INVALID_JSON_INPUT') {
      navigator.clipboard.writeText(encodedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Add Expiration Claim
  const addExpiration = () => {
    try {
      const parsed = JSON.parse(payload);
      const expTime = Math.floor(Date.now() / 1000) + (expMinutes * 60);
      parsed.exp = expTime;
      setPayload(JSON.stringify(parsed, null, 2));
    } catch (e) {
      alert('Invalid Payload JSON');
    }
  };

  // Add Dynamic claims (iat / nbf)
  const addClaim = (type: 'iat' | 'nbf') => {
    try {
      const parsed = JSON.parse(payload);
      parsed[type] = Math.floor(Date.now() / 1000);
      setPayload(JSON.stringify(parsed, null, 2));
    } catch (e) {
      alert('Invalid Payload JSON');
    }
  };

  // Verify JWT
  const handleVerify = async () => {
    setVerificationStatus('idle');
    const parts = tokenToVerify.trim().split('.');
    if (parts.length !== 3) {
      setVerificationStatus('invalid');
      setVerifiedHeader('{"error": "Invalid JWT format. Must contain 3 dot-separated parts."}');
      setVerifiedPayload('{}');
      return;
    }

    try {
      const decodedH = base64UrlDecode(parts[0]);
      const decodedP = base64UrlDecode(parts[1]);
      setVerifiedHeader(JSON.stringify(JSON.parse(decodedH), null, 2));
      setVerifiedPayload(JSON.stringify(JSON.parse(decodedP), null, 2));

      // Calculate expected signature
      const expectedSig = await generateSignature(parts[0], parts[1], secret);
      if (parts[2] === expectedSig) {
        setVerificationStatus('valid');
      } else {
        setVerificationStatus('invalid');
      }
    } catch (err) {
      setVerificationStatus('invalid');
      setVerifiedHeader('{"error": "Failed to decode payload."}');
      setVerifiedPayload('{}');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Panels */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Editor Inputs */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-emerald-400 font-bold">JWT Generator & Signer</h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Algorithm</span>
              <select
                value={algorithm}
                onChange={(e) => {
                  setAlgorithm(e.target.value);
                  try {
                    const parsed = JSON.parse(header);
                    parsed.alg = e.target.value === 'none' ? 'none' : 'HS256';
                    setHeader(JSON.stringify(parsed, null, 2));
                  } catch (err) {}
                }}
                className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1 text-xs text-slate-350 focus:outline-none"
              >
                <option value="HS256">HMAC SHA-256 (HS256)</option>
                <option value="none">None (Unsigned)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Header (JSON)</span>
              <textarea
                value={header}
                onChange={(e) => setHeader(e.target.value)}
                rows={6}
                className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Payload (Claims)</span>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={6}
                className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Claim Generators */}
          <div className="flex flex-wrap gap-2.5 items-center bg-slate-900/40 p-3.5 rounded-xl border border-slate-850/50">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5"><Calendar size={12} /> Claim Helpers:</span>
            
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={expMinutes}
                onChange={(e) => setExpMinutes(Number(e.target.value) || 0)}
                className="w-14 bg-slate-950 border border-slate-800 rounded p-1 text-center text-xs font-mono text-slate-200"
              />
              <button
                onClick={addExpiration}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded hover:text-white transition-colors"
              >
                + Add exp
              </button>
            </div>

            <button
              onClick={() => addClaim('iat')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded hover:text-white transition-colors"
            >
              + Add iat (issued at)
            </button>
            <button
              onClick={() => addClaim('nbf')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded hover:text-white transition-colors"
            >
              + Add nbf (not before)
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1"><Key size={12} /> Secret Key</span>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
                placeholder="HMAC secret key"
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-2 text-[10px] text-slate-500 font-bold hover:text-slate-350"
              >
                {showSecret ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>
        </div>

        {/* Decoder Verifier */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-850 pb-2">JWT Signature Verifier</span>
          
          <div className="flex flex-col gap-2">
            <textarea
              value={tokenToVerify}
              onChange={(e) => setTokenToVerify(e.target.value)}
              placeholder="Paste raw JWT here to verify..."
              rows={3}
              className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-300 text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleVerify}
              className="py-2.5 bg-emerald-700 hover:bg-emerald-650 text-white rounded-xl text-xs font-bold transition-all"
            >
              Decode & Verify Signature
            </button>
          </div>

          {verificationStatus !== 'idle' && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              verificationStatus === 'valid' 
                ? 'bg-emerald-950/20 border-emerald-800 text-emerald-400' 
                : 'bg-rose-950/20 border-rose-950 text-rose-400'
            }`}>
              {verificationStatus === 'valid' ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
              <div className="flex flex-col">
                <span className="text-xs font-bold">{verificationStatus === 'valid' ? 'Signature Verified!' : 'Invalid Signature / Token'}</span>
                <span className="text-[10px] text-slate-500">{verificationStatus === 'valid' ? 'The token matches the configured secret.' : 'The signature is incorrect or invalid.'}</span>
              </div>
            </div>
          )}

          {verifiedHeader && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Decoded Header</span>
                <pre className="bg-slate-950/60 p-3 border border-slate-850 rounded-lg text-[10px] font-mono text-slate-350 overflow-x-auto max-h-[150px]">{verifiedHeader}</pre>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Decoded Payload</span>
                <pre className="bg-slate-950/60 p-3 border border-slate-850 rounded-lg text-[10px] font-mono text-slate-350 overflow-x-auto max-h-[150px]">{verifiedPayload}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Encoded Output</span>
          
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Raw Token</span>
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl text-xs font-mono break-all text-slate-300 select-all min-h-[180px]">
              {encodedToken === 'INVALID_JSON_INPUT' ? (
                <span className="text-rose-500 font-bold font-sans">Error: Invalid JSON Inputs</span>
              ) : (
                <>
                  <span className="text-rose-400">{encodedToken.split('.')[0]}</span>
                  <span className="text-slate-500">.</span>
                  <span className="text-cyan-400">{encodedToken.split('.')[1]}</span>
                  {encodedToken.split('.')[2] && (
                    <>
                      <span className="text-slate-500">.</span>
                      <span className="text-emerald-400">{encodedToken.split('.')[2]}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleCopy}
            disabled={!encodedToken || encodedToken === 'INVALID_JSON_INPUT'}
            className="w-full py-3 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-40"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied Token!' : 'Copy to Clipboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
