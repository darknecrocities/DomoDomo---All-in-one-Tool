import { useState } from 'react';




export const TextToSpeechTool = () => {
  const [text, setText] = useState('DomoDomo is running fully offline.');

  const handleSpeak = () => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Text-to-Speech Synthesizer</h3>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <button onClick={handleSpeak} className="btn-primary w-full py-2 text-xs">Speak Text</button>
    </div>
  );
};
