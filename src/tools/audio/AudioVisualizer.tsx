import { useState, useRef, useEffect } from 'react';




export const AudioVisualizerTool = () => {
  const [active, setActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const drawMockWave = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, 300, 100);
    ctx.fillStyle = '#4E8E5E';
    for (let i = 0; i < 300; i += 8) {
      const height = Math.random() * 80;
      ctx.fillRect(i, 50 - height/2, 4, height);
    }
    animationRef.current = requestAnimationFrame(drawMockWave);
  };

  useEffect(() => {
    if (active) {
      drawMockWave();
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [active]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Audio Visualizer</h3>
      <div className="flex justify-center mt-2">
        <canvas ref={canvasRef} width="300" height="100" className="rounded border border-slate-800" />
      </div>
      <button onClick={() => setActive(!active)} className="btn-primary w-full py-2 text-xs">
        {active ? 'Stop Visualizer' : 'Start Visualizer'}
      </button>
    </div>
  );
};
