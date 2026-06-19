import { useState } from 'react';


export const AISpeechToTextTool = () => {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');

  const handleListen = () => {
    const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Speech) {
      setText("Offline speech recognition API not supported in browser.");
      return;
    }
    const rec = new Speech();
    rec.onstart = () => setListening(true);
    rec.onresult = (e: any) => {
      setText(e.results[0][0].transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.start();
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">AI Speech-to-Text</h3>
      <button onClick={handleListen} className="btn-primary w-full py-2 text-xs">
        {listening ? 'Listening...' : 'Transcribe Audio input'}
      </button>
      {text && <div className="bg-slate-950 p-3 rounded border border-slate-850 text-xs text-slate-300 font-mono mt-2">{text}</div>}
    </div>
  );
};
