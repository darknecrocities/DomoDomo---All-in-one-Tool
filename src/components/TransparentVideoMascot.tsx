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
    if (!video) return;

    video.play().catch(() => {});

    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animFrameId: number;

    // Fast Flood Fill to remove ONLY connected outer background pixels
    const removeConnectedBackground = (data: Uint8ClampedArray, w: number, h: number) => {
      const visited = new Uint8Array(w * h);
      const queue = new Int32Array(w * h);
      let head = 0;
      let tail = 0;

      // Seed all border pixels into the queue
      for (let x = 0; x < w; x++) {
        queue[tail++] = x;
        visited[x] = 1;
        const bottomIdx = (h - 1) * w + x;
        queue[tail++] = bottomIdx;
        visited[bottomIdx] = 1;
      }
      for (let y = 1; y < h - 1; y++) {
        const leftIdx = y * w;
        queue[tail++] = leftIdx;
        visited[leftIdx] = 1;
        const rightIdx = y * w + (w - 1);
        queue[tail++] = rightIdx;
        visited[rightIdx] = 1;
      }

      // Border background color sample (top-left 0,0)
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      while (head < tail) {
        const idx = queue[head++];
        const pixelIdx = idx * 4;

        const r = data[pixelIdx];
        const g = data[pixelIdx + 1];
        const b = data[pixelIdx + 2];

        const distSq = Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2);

        // Flood fill matching background pixels
        if (distSq < 2800 || (r > 215 && g > 215 && b > 215)) {
          data[pixelIdx + 3] = 0; // Make 100% transparent

          const x = idx % w;
          const y = (idx / w) | 0;

          if (x > 0) {
            const nIdx = idx - 1;
            if (!visited[nIdx]) { visited[nIdx] = 1; queue[tail++] = nIdx; }
          }
          if (x < w - 1) {
            const nIdx = idx + 1;
            if (!visited[nIdx]) { visited[nIdx] = 1; queue[tail++] = nIdx; }
          }
          if (y > 0) {
            const nIdx = idx - w;
            if (!visited[nIdx]) { visited[nIdx] = 1; queue[tail++] = nIdx; }
          }
          if (y < h - 1) {
            const nIdx = idx + w;
            if (!visited[nIdx]) { visited[nIdx] = 1; queue[tail++] = nIdx; }
          }
        }
      }
    };

    const processFrame = () => {
      if (!video.paused && !video.ended && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, width, height);

        const frame = ctx.getImageData(0, 0, width, height);
        removeConnectedBackground(frame.data, width, height);
        ctx.putImageData(frame, 0, 0);
      }
      animFrameId = requestAnimationFrame(processFrame);
    };

    animFrameId = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [src, width, height]);

  return (
    <div className={`relative ${className}`}>
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
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
};
