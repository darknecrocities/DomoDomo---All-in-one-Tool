import { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';



export const VoiceRecorderTool = () => {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      mediaRecorder.current = rec;
      const chunks: Blob[] = [];
      rec.ondataavailable = e => chunks.push(e.data);
      rec.onstop = () => {
        setUrl(URL.createObjectURL(new Blob(chunks, { type: 'audio/webm' })));
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      setRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stop = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 items-center text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2 w-full">Voice Recorder</h3>
      {recording ? (
        <button onClick={stop} className="btn-primary bg-rose-600 hover:bg-rose-500 py-2.5 px-6 rounded-full"><Square size={16} /> Stop Recording</button>
      ) : (
        <button onClick={start} className="btn-primary py-2.5 px-6 rounded-full"><Mic size={16} /> Record Mic</button>
      )}
      {url && <audio src={url} controls className="w-full mt-2" />}
    </div>
  );
};
