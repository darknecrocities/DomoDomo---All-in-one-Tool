import React, { useState, useRef, useCallback } from 'react';
import { Upload, Lock, ShieldCheck, Download, RefreshCcw, FileText, Key, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export const FileEncryptionTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const deriveKey = async (passwordStr: string, salt: Uint8Array): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(passwordStr),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const handleEncrypt = async () => {
    if (!file || !password) return;
    setIsProcessing(true);
    setError(null);
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(password, salt);

      const encryptedContent = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        arrayBuffer
      );

      // Package: [Salt (16)] + [IV (12)] + [Encrypted Data]
      const encryptedBlob = new Blob([salt, iv, new Uint8Array(encryptedContent)], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(encryptedBlob);
      
      setResultUrl(url);
      setResultFileName(`${file.name}.domoguard`);
    } catch (err: any) {
      setError(err.message || 'Encryption failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!file || !password) return;
    setIsProcessing(true);
    setError(null);
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      if (arrayBuffer.byteLength < 28) {
        throw new Error('Invalid file format. File is too small.');
      }

      const salt = new Uint8Array(arrayBuffer.slice(0, 16));
      const iv = new Uint8Array(arrayBuffer.slice(16, 28));
      const encryptedData = arrayBuffer.slice(28);

      const key = await deriveKey(password, salt);

      const decryptedContent = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
      );

      const decryptedBlob = new Blob([new Uint8Array(decryptedContent)], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(decryptedBlob);
      
      setResultUrl(url);
      setResultFileName(file.name.replace('.domoguard', '').replace('.encrypted', ''));
    } catch (err: any) {
      setError('Decryption failed. Incorrect password or corrupted file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (droppedFile.name.endsWith('.domoguard')) {
        setMode('decrypt');
      } else {
        setMode('encrypt');
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.name.endsWith('.domoguard')) {
        setMode('decrypt');
      } else {
        setMode('encrypt');
      }
    }
  };

  const reset = () => {
    setFile(null);
    setPassword('');
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
          <Lock size={20} className="text-[#3C6B4D]" />
          File Encryption Tool
        </h3>
        <p className="text-[#A3A09B] text-xs">
          Securely encrypt and decrypt files using AES-GCM-256 with PBKDF2 key derivation. 
          All cryptography is performed locally inside your browser—files are never uploaded.
        </p>
      </div>

      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`glass-card border-2 border-dashed flex flex-col items-center justify-center p-16 cursor-pointer transition-all ${
            isDragging ? 'border-[#3C6B4D] bg-[#3C6B4D]/5' : 'border-[#2A2D30] bg-[#111213]/40 hover:border-[#3C6B4D]/50 hover:bg-[#18191B]'
          }`}
        >
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 rounded-2xl bg-[#18191B] border border-[#2A2D30] flex items-center justify-center mb-4 text-[#3C6B4D] shadow-lg">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#ECEBE9] tracking-tight">Drop File to Encrypt/Decrypt</h3>
          <p className="text-[#72706C] text-sm mt-2 max-w-sm text-center">
            Supports any file type. Max size ~500MB based on browser memory limits.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="p-4 rounded-xl bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 shrink-0">
                <FileText size={24} />
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <h4 className="font-bold text-[#ECEBE9] text-base truncate">{file.name}</h4>
                <div className="flex items-center gap-3 text-[11px] text-[#72706C] font-mono">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span className="uppercase text-[#3C6B4D] font-bold">{mode} MODE</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={reset}
              className="btn-secondary py-2 px-4 text-xs shrink-0 flex items-center gap-2"
            >
              <RefreshCcw size={14} />
              <span>Select Another File</span>
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-xs text-rose-450 font-semibold flex items-center gap-2">
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          {isProcessing ? (
            <div className="glass-card p-12 border-[#2A2D30] bg-[#18191B] flex flex-col items-center justify-center gap-4">
              <div className="animate-spin w-8 h-8 border-4 border-[#3C6B4D] border-t-transparent rounded-full"></div>
              <p className="text-[#ECEBE9] font-bold text-sm">
                {mode === 'encrypt' ? 'Encrypting file with AES-256...' : 'Decrypting file...'}
              </p>
            </div>
          ) : resultUrl ? (
            <div className="glass-card p-8 border-[#2A2D30] bg-[#18191B] border-t-4 border-t-[#3C6B4D] flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-[#3C6B4D]/10 text-[#3C6B4D] flex items-center justify-center border border-[#3C6B4D]/20">
                <ShieldCheck size={36} />
              </div>
              
              <div className="flex flex-col gap-2 max-w-md">
                <h3 className="text-xl font-bold text-[#ECEBE9] tracking-tight">
                  {mode === 'encrypt' ? 'Encryption Successful' : 'Decryption Successful'}
                </h3>
                <p className="text-[#A3A09B] text-xs leading-relaxed">
                  {mode === 'encrypt' 
                    ? 'Your file has been secured with military-grade encryption. Do not lose your password, or this file will be unrecoverable.'
                    : 'Your file has been successfully decrypted and restored to its original state.'}
                </p>
              </div>

              <a 
                href={resultUrl} 
                download={resultFileName}
                className="btn-primary py-3 px-8 text-sm font-bold flex items-center gap-2 mt-2 shadow-lg shadow-[#3C6B4D]/20"
              >
                <Download size={18} />
                <span>Download {mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} File</span>
              </a>
            </div>
          ) : (
            <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4">
              <label className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-2">
                <Key size={14} className="text-[#72706C]" />
                {mode === 'encrypt' ? 'Create a strong password' : 'Enter decryption password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password..."
                  className="w-full bg-[#111213] border-2 border-[#2A2D30] rounded-xl px-4 py-4 text-lg text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] transition-all placeholder:text-[#72706C] pr-12 font-mono"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#72706C] hover:text-[#ECEBE9] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <button
                onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
                disabled={!password}
                className="btn-primary w-full py-4 mt-2 font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                {mode === 'encrypt' ? 'Encrypt & Lock File' : 'Decrypt File'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
