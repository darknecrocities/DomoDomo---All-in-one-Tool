import { useState, useCallback, useRef, useEffect } from 'react';

interface TransparentVideoMascotProps {
  src?: string;
  gifSrc?: string;
  movSrc?: string;
  className?: string;
  clickable?: boolean;
  isNativeTransparent?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill';
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
  "Stare long enough and I'll stare back 😏",
];

export const TransparentVideoMascot = ({
  src,
  gifSrc,
  movSrc,
  className = '',
  clickable = true,
  objectFit = 'contain',
}: TransparentVideoMascotProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lastMsg, setLastMsg] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleClick = useCallback(() => {
    if (!clickable) return;
    const pool = CUTE_MESSAGES.filter(m => m !== lastMsg);
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setLastMsg(picked);

    setMessage(picked);
    setIsVisible(true);

    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setMessage(null), 400);
    }, 3200);
  }, [clickable, lastMsg]);

  const hasVideoSource = Boolean(src || movSrc);
  const fallbackImage = gifSrc || (typeof src === 'string' && src.endsWith('.gif') ? src : undefined);
  const shouldRenderVideo = hasVideoSource && !videoError;

  useEffect(() => {
    if (shouldRenderVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may need muted attribute which is set
      });
    }
  }, [shouldRenderVideo, src, movSrc]);

  return (
    <div
      className={`relative ${className} transition-transform duration-200 ease-[var(--ease-out)] hover:-translate-y-1 active:scale-[0.94] select-none`}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      {/* Speech bubble */}
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
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#111213',
                fontFamily: 'Inter, system-ui, sans-serif',
                lineHeight: 1.4,
              }}
            >
              {message}
            </span>
            <span
              style={{
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
              }}
            />
          </div>
        </div>
      )}

      {/* Click zone */}
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

      {shouldRenderVideo ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          onError={() => setVideoError(true)}
          className={`w-full h-full object-${objectFit} pointer-events-none`}
        >
          {movSrc && <source src={movSrc} type='video/mp4; codecs="hvc1"' />}
          {src && <source src={src} type="video/webm" />}
        </video>
      ) : fallbackImage ? (
        <img
          src={fallbackImage}
          alt="Domo Mascot Animation"
          className={`w-full h-full object-${objectFit} pointer-events-none select-none`}
          loading="eager"
        />
      ) : null}
    </div>
  );
};

export default TransparentVideoMascot;
