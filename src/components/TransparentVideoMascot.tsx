import { useEffect, useRef, useState, useCallback } from 'react';

interface TransparentVideoMascotProps {
  src: string;
  className?: string;
  clickable?: boolean;
  isNativeTransparent?: boolean;
}

const CUTE_MESSAGES = [
  "Hiii! 👋 Welcome to DomoDomo!",
  "You found me! 🐾 I'm Domo~",
  "I'm watching over your tools! 🛡️",
  "Need help? I gotchu! ✨",
  "Stay productive, senpai! 💪",
  "DomoDomo loves you! 💚",
  "Click me again, I dare you 😏",
  "Privacy first, always! 🔒✨",
  "No data leaves this machine~ 🏠",
  "You're doing great today! 🌟",
  "Boo! 👻 (sorry, I'm shy)",
  "100% offline. 100% cute. 🐼",
  "Tap tap tap... 🖱️",
  "I'm not a bug, I'm a feature! 🐛➡️✨",
  "All tools, zero cloud! ☁️❌",
  "Let's build something cool! 🚀",
  "nom nom nom 🍡",
  "beep boop beep 🤖",
  "uwu what's this 👀",
  "Secret: I'm powered by love 💚",
];

export const TransparentVideoMascot = ({
  src,
  className = '',
  clickable = true,
  isNativeTransparent = false,
}: TransparentVideoMascotProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMsgRef = useRef<string | null>(null);

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
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 360;

        if (canvas.width !== vw || canvas.height !== vh) {
          canvas.width = vw;
          canvas.height = vh;
        }

        ctx.drawImage(video, 0, 0, vw, vh);

        if (!isNativeTransparent) {
          const frame = ctx.getImageData(0, 0, vw, vh);
          removeConnectedBackground(frame.data, vw, vh);
          ctx.putImageData(frame, 0, 0);
        }
      }
      animFrameId = requestAnimationFrame(processFrame);
    };

    animFrameId = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [src, isNativeTransparent]);

  const handleClick = useCallback(() => {
    if (!clickable) return;

    // Pick a random message different from the last one
    let pool = CUTE_MESSAGES.filter(m => m !== lastMsgRef.current);
    const picked = pool[Math.floor(Math.random() * pool.length)];
    lastMsgRef.current = picked;

    // Clear any pending dismiss timer
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);

    setMessage(picked);
    setIsVisible(true);

    // Auto-dismiss after 3.2s
    dismissTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setMessage(null), 400); // wait for fade-out
    }, 3200);
  }, [clickable]);

  return (
    <div className={`relative ${className}`} style={{ cursor: clickable ? 'pointer' : 'default' }}>
      {/* Speech bubble — overlaid directly ON the video canvas at the top */}
      {message && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: isVisible
              ? 'translateX(-50%) translateY(0) scale(1)'
              : 'translateX(-50%) translateY(-6px) scale(0.88)',
            zIndex: 100,
            pointerEvents: 'none',
            transition: 'opacity 0.28s cubic-bezier(0.34,1.56,0.64,1), transform 0.28s cubic-bezier(0.34,1.56,0.64,1)',
            opacity: isVisible ? 1 : 0,
            transformOrigin: 'top center',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '8px 13px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.12)',
              position: 'relative',
              display: 'inline-block',
            }}
          >
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#111213',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: 1.4,
            }}>
              {message}
            </span>
            {/* Triangle tail pointing downward toward head */}
            <span style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              marginLeft: '-8px',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #ffffff',
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.10))',
            }} />
          </div>
        </div>
      )}

      {/* Invisible click zone over the canvas */}
      {clickable && (
        <div
          className="absolute inset-0 z-40"
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
          aria-label="Click Domo for a message"
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && handleClick()}
        />
      )}

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
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
};
