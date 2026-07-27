import { useEffect, useRef } from 'react';

interface TransparentVideoMascotProps {
  src: string;
  className?: string;
  width?: number;
  height?: number;
}

export const TransparentVideoMascot = ({
  src,
  className = '',
  width = 240,
  height = 240
}: TransparentVideoMascotProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animFrameId: number;

    const processFrame = () => {
      if (video.paused || video.ended) {
        animFrameId = requestAnimationFrame(processFrame);
        return;
      }

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, width, height);

      // Extract frame pixels for chroma keying
      const frame = ctx.getImageData(0, 0, width, height);
      const data = frame.data;
      const len = data.length;

      for (let i = 0; i < len; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Key out light grey/white checkerboard pixels (r, g, b > 120 and near greyscale)
        if (r > 120 && g > 120 && b > 120 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
          data[i + 3] = 0; // Make pixel completely transparent
        }
      }

      ctx.putImageData(frame, 0, 0);
      animFrameId = requestAnimationFrame(processFrame);
    };

    const handlePlay = () => {
      processFrame();
    };

    video.addEventListener('play', handlePlay);
    if (!video.paused) {
      processFrame();
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      cancelAnimationFrame(animFrameId);
    };
  }, [width, height]);

  return (
    <div className={`relative ${className}`}>
      {/* Hidden Video element used as source */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        className="hidden"
      />
      {/* Real-time Canvas showing transparent mascot */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-contain pointer-events-none drop-shadow-xl"
      />
    </div>
  );
};
