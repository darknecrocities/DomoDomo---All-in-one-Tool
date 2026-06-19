import { useState } from 'react';




export const SpeechToTextTool = () => {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);

  const handleListen = () => {
    const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Speech) {
      setText("Speech recognition is not supported in this browser.");
      return;
    }
    const rec = new Speech();
    rec.continuous = false;
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
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Speech-to-Text (Local API)</h3>
      <button onClick={handleListen} className="btn-primary w-full py-2 text-xs">
        {listening ? 'Listening...' : 'Start Transcription'}
      </button>
      {text && <textarea readOnly value={text} className="bg-slate-950 p-3 text-xs font-mono h-20 rounded border border-slate-800 text-slate-350" />}
    </div>
  );
};
