import React, { useEffect, useRef, useState } from 'react';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  speedY: number;
  speedX: number;
  swayAngle: number;
  swaySpeed: number;
  swayDistance: number;
  layer: 'back' | 'mid' | 'front';
  isCrystal?: boolean;
  rotation?: number;
  rotationSpeed?: number;
}

export const SnowfallBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('domodomo_snowfall_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    const handleToggle = (e: CustomEvent<{ enabled?: boolean }>) => {
      if (e.detail?.enabled !== undefined) {
        setIsEnabled(e.detail.enabled);
        localStorage.setItem('domodomo_snowfall_enabled', String(e.detail.enabled));
      } else {
        setIsEnabled(prev => {
          const next = !prev;
          localStorage.setItem('domodomo_snowfall_enabled', String(next));
          return next;
        });
      }
    };

    window.addEventListener('domodomo_toggle_snowfall' as any, handleToggle as any);
    return () => {
      window.removeEventListener('domodomo_toggle_snowfall' as any, handleToggle as any);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupCanvas();

    // High-density responsive count: ~100-130 on desktop, ~45-60 on mobile
    const snowflakeCount = Math.max(45, Math.min(135, Math.floor(width / 13)));
    const snowflakes: Snowflake[] = [];

    for (let i = 0; i < snowflakeCount; i++) {
      const rand = Math.random();
      let layer: 'back' | 'mid' | 'front' = 'mid';
      let radius = 2.0;
      let baseOpacity = 0.65;
      let speedY = 1.1;

      if (rand < 0.45) {
        // Deep background layer: smaller, soft, gentle drifting
        layer = 'back';
        radius = Math.random() * 1.2 + 0.8;
        baseOpacity = Math.random() * 0.25 + 0.25; // 0.25 - 0.5
        speedY = Math.random() * 0.6 + 0.4;
      } else if (rand < 0.85) {
        // Midground layer: crisp, prominent, visible
        layer = 'mid';
        radius = Math.random() * 1.5 + 1.8;
        baseOpacity = Math.random() * 0.3 + 0.6; // 0.6 - 0.9
        speedY = Math.random() * 0.9 + 0.8;
      } else {
        // Foreground layer: larger soft bokeh & crystal flakes
        layer = 'front';
        radius = Math.random() * 2.0 + 3.2;
        baseOpacity = Math.random() * 0.2 + 0.75; // 0.75 - 0.95
        speedY = Math.random() * 1.2 + 1.3;
      }

      // ~10% of mid/foreground flakes are delicate 4-point crystal stars
      const isCrystal = layer !== 'back' && Math.random() < 0.12;

      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        baseOpacity,
        speedY,
        speedX: (Math.random() - 0.5) * 0.3,
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.02 + 0.008,
        swayDistance: Math.random() * 1.2 + 0.5,
        layer,
        isCrystal,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    let ambientTime = 0;
    let mouseWind = 0;
    let targetMouseWind = 0;
    let lastX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (lastX !== 0) {
        const delta = e.clientX - lastX;
        targetMouseWind = Math.max(-1.5, Math.min(1.5, delta * 0.04));
      }
      lastX = e.clientX;
    };

    const handleResize = () => {
      setupCanvas();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (isTabVisible) {
        ctx.clearRect(0, 0, width, height);

        ambientTime += 0.01;
        // Natural gentle wind breeze that ebbs and flows
        const naturalBreeze = Math.sin(ambientTime * 0.4) * 0.35 + Math.cos(ambientTime * 0.15) * 0.2;
        // Smoothly ease mouse wind
        mouseWind += (targetMouseWind - mouseWind) * 0.05;
        targetMouseWind *= 0.95; // decay back to 0

        const totalWind = naturalBreeze + mouseWind;

        for (let i = 0; i < snowflakes.length; i++) {
          const flake = snowflakes[i];

          // Sway calculation
          flake.swayAngle += flake.swaySpeed;
          const swayX = Math.sin(flake.swayAngle) * flake.swayDistance;

          // Wind influence based on layer depth
          const windMultiplier = flake.layer === 'back' ? 0.5 : flake.layer === 'mid' ? 0.85 : 1.2;
          flake.x += swayX + flake.speedX + totalWind * windMultiplier;
          flake.y += flake.speedY;

          // If it's a crystal snowflake, draw a delicate 4-pointed sparkle
          if (flake.isCrystal && flake.rotation !== undefined && flake.rotationSpeed !== undefined) {
            flake.rotation += flake.rotationSpeed;
            ctx.save();
            ctx.translate(flake.x, flake.y);
            ctx.rotate(flake.rotation);

            ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
            ctx.shadowBlur = 4;
            ctx.strokeStyle = `rgba(255, 255, 255, ${flake.baseOpacity})`;
            ctx.lineWidth = 0.9;

            const arm = flake.radius * 1.6;
            // Draw cross
            ctx.beginPath();
            ctx.moveTo(0, -arm);
            ctx.lineTo(0, arm);
            ctx.moveTo(-arm, 0);
            ctx.lineTo(arm, 0);
            ctx.stroke();

            // Tiny center core
            ctx.beginPath();
            ctx.arc(0, 0, flake.radius * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${flake.baseOpacity})`;
            ctx.fill();

            ctx.restore();
          } else {
            // Standard frosted snow particle
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);

            if (flake.layer === 'front') {
              // Foreground soft glowing bokeh
              ctx.shadowColor = 'rgba(235, 245, 255, 0.6)';
              ctx.shadowBlur = 6;
              ctx.fillStyle = `rgba(255, 255, 255, ${flake.baseOpacity})`;
            } else if (flake.layer === 'mid') {
              // Midground crisp white
              ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
              ctx.shadowBlur = 3;
              ctx.fillStyle = `rgba(242, 248, 255, ${flake.baseOpacity})`;
            } else {
              // Distant background speck
              ctx.shadowBlur = 0;
              ctx.fillStyle = `rgba(215, 230, 245, ${flake.baseOpacity})`;
            }
            ctx.fill();
          }

          // Continuous Non-Stop Recycling:
          // When flake falls off bottom, reset to just above top
          if (flake.y > height + 20) {
            flake.y = -15;
            flake.x = Math.random() * width;
          }

          // Wrap horizontally so wind never empties the screen
          if (flake.x > width + 25) {
            flake.x = -20;
          } else if (flake.x < -25) {
            flake.x = width + 20;
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[35] w-full h-full"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
};

export default SnowfallBackground;
