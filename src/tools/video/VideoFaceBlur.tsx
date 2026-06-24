import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Download, Film, Sliders, Play, Pause, Shield } from 'lucide-react';

interface TrackedZone {
  id: string;
  x: number; // 0 to 1 relative position
  y: number; // 0 to 1 relative position
  w: number; // relative width
  h: number; // relative height
  shape: 'circle' | 'rect';
  type: 'blur' | 'pixelate' | 'blackout';
  intensity: number;
  name: string;
}

export const VideoFaceBlurTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Controls
  const [autoDetect, setAutoDetect] = useState(true);
  const [blurType, setBlurType] = useState<'blur' | 'pixelate' | 'blackout'>('blur');
  const [blurIntensity, setBlurIntensity] = useState<number>(25);
  const [faceCoverage, setFaceCoverage] = useState<number>(1.85); // Generous default coverage multiplier for the entire face/head
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [bitrate, setBitrate] = useState(4000000);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Decoupled caching for smooth, high-fps face tracking
  const trackedFacesRef = useRef<{ x: number; y: number; w: number; h: number }[]>([]);
  const animatedFacesRef = useRef<{ x: number; y: number; w: number; h: number }[]>([]);

  // Dynamic tracking.js script injection for local facial recognition
  useEffect(() => {
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/tracking.js/1.1.3/tracking-min.js';
    script1.async = true;

    const script2 = document.createElement('script');
    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/tracking.js/1.1.3/data/face-min.js';
    script2.async = true;

    script1.onload = () => {
      document.body.appendChild(script2);
    };

    document.body.appendChild(script1);

    return () => {
      if (document.body.contains(script1)) document.body.removeChild(script1);
      if (document.body.contains(script2)) document.body.removeChild(script2);
    };
  }, []);

  // Load video file
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setIsPlaying(false);
      setCurrentTime(0);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) {
      setDuration(v.duration);
    }
  };

  // Update time tracker
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v) {
      setCurrentTime(v.currentTime);
    }
  };

  // Auto Skin-Tone Face Detector (Downsampled scan for high performance)
  const runSkinToneDetection = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!autoDetect) return null;

    try {
      // Downsample frames for real-time analysis
      const scanW = 40;
      const scanH = 30;
      const scanCanvas = document.createElement('canvas');
      scanCanvas.width = scanW;
      scanCanvas.height = scanH;
      const scanCtx = scanCanvas.getContext('2d')!;
      scanCtx.drawImage(ctx.canvas, 0, 0, scanW, scanH);

      const imgData = scanCtx.getImageData(0, 0, scanW, scanH);
      const data = imgData.data;

      let sumX = 0;
      let sumY = 0;
      let skinCount = 0;

      for (let y = 0; y < scanH; y++) {
        for (let x = 0; x < scanW; x++) {
          const idx = (y * scanW + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Normalized skin tone ranges in RGB space
          const isSkin =
            r > 95 &&
            g > 40 &&
            b > 20 &&
            r > g &&
            r > b &&
            Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
            Math.abs(r - g) > 15;

          if (isSkin) {
            sumX += x;
            sumY += y;
            skinCount++;
          }
        }
      }

      if (skinCount > 15) {
        // Average coordinates mapping back to full canvas size
        const avgX = (sumX / skinCount) / scanW;
        const avgY = (sumY / skinCount) / scanH;
        return { x: avgX, y: avgY, w: 0.16, h: 0.20 };
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, [autoDetect]);

  // Run real Viola-Jones face detection on a downsampled canvas (capped dimension for max speed)
  const detectFacesOnCanvas = useCallback((canvas: HTMLCanvasElement): { x: number; y: number; w: number; h: number }[] => {
    // @ts-ignore
    if (!window.tracking || !window.tracking.ViolaJones || !window.tracking.ViolaJones.classifiers || !window.tracking.ViolaJones.classifiers.face) {
      // Fall back to skin-tone contour heuristics if tracking.js has not finished loading from CDN
      const skinFace = runSkinToneDetection(canvas.getContext('2d')!);
      return skinFace ? [skinFace] : [];
    }

    try {
      // Downsample to max 240px to ensure ultra-smooth 60fps tracking
      const maxDim = 240;
      let scale = 1;
      if (canvas.width > maxDim || canvas.height > maxDim) {
        scale = maxDim / Math.max(canvas.width, canvas.height);
      }
      const scanW = Math.round(canvas.width * scale);
      const scanH = Math.round(canvas.height * scale);
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = scanW;
      tempCanvas.height = scanH;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(canvas, 0, 0, scanW, scanH);

      const imgData = tempCtx.getImageData(0, 0, scanW, scanH);
      
      // @ts-ignore
      const results = window.tracking.ViolaJones.detect(
        imgData.data,
        scanW,
        scanH,
        4.5, // initialScale (larger values make detection much faster)
        1.25, // scaleFactor
        3, // stepSize (higher values scan fewer pixels, running faster)
        0.1, // edgesDensity
        // @ts-ignore
        window.tracking.ViolaJones.classifiers.face
      );

      if (results && results.length > 0) {
        return results.map((r: any) => ({
          x: (r.x + r.width / 2) / scanW, // Map to relative center coordinates
          y: (r.y + r.height / 2) / scanH,
          w: r.width / scanW,
          h: r.height / scanH
        }));
      }
    } catch (e) {
      console.error('Viola-Jones detection error:', e);
    }
    // Fall back to skin-tone
    const skinFace = runSkinToneDetection(canvas.getContext('2d')!);
    return skinFace ? [skinFace] : [];
  }, [autoDetect, runSkinToneDetection]);

  // Run face detection asynchronously in the background loop to prevent render thread lagging
  useEffect(() => {
    if (!file || !autoDetect || rendering) return;

    let active = true;
    const runLoop = async () => {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c || v.paused || v.ended) {
        if (active) setTimeout(runLoop, 150);
        return;
      }

      try {
        const detected = detectFacesOnCanvas(c);
        if (detected.length > 0) {
          trackedFacesRef.current = detected;
        }
      } catch (e) {
        console.error(e);
      }

      if (active) {
        setTimeout(runLoop, 100); // 100ms intervals (approx 10 scans per second) is perfect for smooth Lerping
      }
    };

    runLoop();

    return () => {
      active = false;
    };
  }, [file, autoDetect, rendering, detectFacesOnCanvas]);

  // Main canvas renderer
  const renderFrame = useCallback(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || rendering) return;

    const ctx = c.getContext('2d')!;
    if (v.readyState >= 2) {
      c.width = v.videoWidth;
      c.height = v.videoHeight;

      // Draw original frame
      ctx.drawImage(v, 0, 0, c.width, c.height);

      // Smoothly animate/Lerp the tracked face positions for high-fps visual ease
      const targetFaces = trackedFacesRef.current;
      if (animatedFacesRef.current.length !== targetFaces.length) {
        animatedFacesRef.current = targetFaces.map(f => ({ ...f }));
      } else {
        animatedFacesRef.current = animatedFacesRef.current.map((f, idx) => {
          const target = targetFaces[idx];
          if (!target) return f;
          return {
            x: f.x + (target.x - f.x) * 0.2, // Smooth interpolation ease speed
            y: f.y + (target.y - f.y) * 0.2,
            w: f.w + (target.w - f.w) * 0.2,
            h: f.h + (target.h - f.h) * 0.2
          };
        });
      }

      // Compile temporary active list (animated auto-detected face zones if enabled)
      let activeZones: TrackedZone[] = [];
      if (autoDetect && animatedFacesRef.current.length > 0) {
        animatedFacesRef.current.forEach((face, idx) => {
          activeZones.push({
            id: `auto-face-${idx}`,
            x: face.x,
            y: face.y - face.h * 0.18, // Shift up to cover full forehead/hair
            w: face.w * faceCoverage, // Expanded width for whole face coverage
            h: face.h * (faceCoverage * 1.1), // Expanded height for whole head coverage
            shape: 'circle',
            type: blurType,
            intensity: blurIntensity,
            name: `🔍 Auto Face ${idx + 1}`
          });
        });
      }

      // Apply blur zones
      activeZones.forEach(z => {
        const zX = (z.x - z.w / 2) * c.width;
        const zY = (z.y - z.h / 2) * c.height;
        const zW = z.w * c.width;
        const zH = z.h * c.height;

        ctx.save();

        // 1. Create shape mask clipping
        ctx.beginPath();
        if (z.shape === 'circle') {
          ctx.arc(zX + zW / 2, zY + zH / 2, Math.min(zW, zH) / 2, 0, 2 * Math.PI);
        } else {
          ctx.rect(zX, zY, zW, zH);
        }
        ctx.clip();

        // 2. Render target filter
        if (z.type === 'blackout') {
          ctx.fillStyle = 'black';
          ctx.fillRect(zX, zY, zW, zH);
        } else if (z.type === 'pixelate') {
          // Disable smooth rendering
          ctx.imageSmoothingEnabled = false;
          const pixelSize = Math.max(2, 60 - z.intensity);
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = Math.max(1, zW / pixelSize);
          tempCanvas.height = Math.max(1, zH / pixelSize);
          const tempCtx = tempCanvas.getContext('2d')!;

          tempCtx.drawImage(c, zX, zY, zW, zH, 0, 0, tempCanvas.width, tempCanvas.height);
          ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, zX, zY, zW, zH);
          ctx.imageSmoothingEnabled = true;
        } else {
          // Standard Canvas Gaussian Blur - Optimized to only blur the bounding box region using an offscreen canvas
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = Math.max(1, zW);
          tempCanvas.height = Math.max(1, zH);
          const tempCtx = tempCanvas.getContext('2d')!;
          
          // Draw just the sub-region from the main canvas
          tempCtx.drawImage(c, zX, zY, zW, zH, 0, 0, zW, zH);
          
          // Blur just this small temp canvas
          tempCtx.filter = `blur(${z.intensity}px)`;
          tempCtx.drawImage(tempCanvas, 0, 0);
          
          // Draw the blurred sub-region back
          ctx.drawImage(tempCanvas, zX, zY, zW, zH);
        }

        ctx.restore();
      });
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    }
  }, [autoDetect, isPlaying, rendering, blurType, blurIntensity, faceCoverage]);

  // Handle Play/Pause
  const togglePlay = () => {
    const v = videoRef.current;
    if (v) {
      if (isPlaying) {
        v.pause();
        setIsPlaying(false);
        cancelAnimationFrame(animationFrameRef.current);
      } else {
        v.play();
        setIsPlaying(true);
      }
    }
  };

  // Sync canvas render frame when playing state shifts
  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    } else {
      renderFrame();
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, renderFrame]);

  // Trigger manual render when zones update offline
  useEffect(() => {
    renderFrame();
  }, [currentTime, autoDetect, renderFrame, blurType, blurIntensity, faceCoverage]);

  // Export blurred video using MediaRecorder canvas streaming
  const handleExport = async () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !file) return;

    setRendering(true);
    setRenderProgress(0);
    setIsPlaying(false);
    v.pause();

    try {
      const renderCanvas = document.createElement('canvas');
      renderCanvas.width = v.videoWidth;
      renderCanvas.height = v.videoHeight;
      const ctx = renderCanvas.getContext('2d')!;

      const stream = renderCanvas.captureStream(30);

      // Record audio
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();
      const src = audioCtx.createMediaElementSource(v);
      src.connect(dest);
      src.connect(audioCtx.destination);
      stream.addTrack(dest.stream.getAudioTracks()[0] || dest.stream.getVideoTracks()[0]);

      const chunks: BlobPart[] = [];
      const mr = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm',
        videoBitsPerSecond: bitrate,
      });

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      let exportFrameCount = 0;
      let cachedExportFaces: any[] = [];

      let animationId: number;
      const renderLoop = () => {
        if (v.ended) {
          mr.stop();
          return;
        }

        ctx.drawImage(v, 0, 0, renderCanvas.width, renderCanvas.height);

        // Run face detection on export at a moderate step to prevent export slowdown
        if (autoDetect) {
          exportFrameCount++;
          if (exportFrameCount >= 8 || cachedExportFaces.length === 0) {
            exportFrameCount = 0;
            cachedExportFaces = detectFacesOnCanvas(renderCanvas);
          }
        } else {
          cachedExportFaces = [];
        }

        let activeZones: TrackedZone[] = [];
        if (autoDetect && cachedExportFaces.length > 0) {
          cachedExportFaces.forEach((face, idx) => {
            activeZones.push({
              id: `auto-face-${idx}`,
              x: face.x,
              y: face.y - face.h * 0.18, // Shift up slightly to cover full forehead/hair
              w: face.w * faceCoverage, // Expanded width
              h: face.h * (faceCoverage * 1.1), // Expanded height
              shape: 'circle',
              type: blurType,
              intensity: blurIntensity,
              name: `Auto ${idx + 1}`
            });
          });
        }

        activeZones.forEach(z => {
          const zX = (z.x - z.w / 2) * renderCanvas.width;
          const zY = (z.y - z.h / 2) * renderCanvas.height;
          const zW = z.w * renderCanvas.width;
          const zH = z.h * renderCanvas.height;

          ctx.save();
          ctx.beginPath();
          if (z.shape === 'circle') {
            ctx.arc(zX + zW / 2, zY + zH / 2, Math.min(zW, zH) / 2, 0, 2 * Math.PI);
          } else {
            ctx.rect(zX, zY, zW, zH);
          }
          ctx.clip();

          if (z.type === 'blackout') {
            ctx.fillStyle = 'black';
            ctx.fillRect(zX, zY, zW, zH);
          } else if (z.type === 'pixelate') {
            ctx.imageSmoothingEnabled = false;
            const pixelSize = Math.max(2, 60 - z.intensity);
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = Math.max(1, zW / pixelSize);
            tempCanvas.height = Math.max(1, zH / pixelSize);
            const tempCtx = tempCanvas.getContext('2d')!;
            tempCtx.drawImage(renderCanvas, zX, zY, zW, zH, 0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, zX, zY, zW, zH);
            ctx.imageSmoothingEnabled = true;
          } else {
            // Standard Canvas Gaussian Blur - Optimized to only blur the bounding box region using an offscreen canvas
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = Math.max(1, zW);
            tempCanvas.height = Math.max(1, zH);
            const tempCtx = tempCanvas.getContext('2d')!;
            
            // Draw just the sub-region from the render canvas
            tempCtx.drawImage(renderCanvas, zX, zY, zW, zH, 0, 0, zW, zH);
            
            // Blur just this small temp canvas
            tempCtx.filter = `blur(${z.intensity}px)`;
            tempCtx.drawImage(tempCanvas, 0, 0);
            
            // Draw the blurred sub-region back
            ctx.drawImage(tempCanvas, zX, zY, zW, zH);
          }
          ctx.restore();
        });

        setRenderProgress(Math.min(99, (v.currentTime / duration) * 100));
        animationId = requestAnimationFrame(renderLoop);
      };

      mr.onstart = () => {
        v.currentTime = 0;
        v.play();
        renderLoop();
      };

      mr.onstop = () => {
        cancelAnimationFrame(animationId);
        v.pause();
        const blob = new Blob(chunks, { type: 'video/webm' });
        const baseName = file.name.replace(/\.[^.]+$/, '');
        triggerBlobDownload(blob, `${baseName}_blurred.webm`);
        setRendering(false);
        setRenderProgress(0);
        src.disconnect();
        audioCtx.close();
      };

      mr.start(200);

    } catch (err) {
      console.error(err);
      setRendering(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Left panel options */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3">
            <h2 className="text-xl font-bold text-[#ECEBE9] flex items-center gap-2">
              <Shield className="text-[#3C6B4D]" size={22} />
              <span>Auto Face Blur Settings</span>
            </h2>
          </div>

          {!file ? (
            <label className="flex flex-col items-center gap-3 py-12 border-2 border-dashed border-[#2A2D30] rounded-2xl cursor-pointer hover:border-[#3C6B4D]/50 transition-colors">
              <Upload size={36} className="text-[#3C6B4D]" />
              <span className="text-slate-300 text-sm font-semibold">Upload a video to begin</span>
              <span className="text-slate-500 text-xs">MP4, WebM, MOV, AVI (Local processing)</span>
              <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
            </label>
          ) : (
            <>
              {/* Tracker Mode Toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Recognition Mode</label>
                <div className="flex items-center justify-between bg-[#111213] border border-[#2A2D30] rounded-xl p-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-200 font-semibold">Auto Face Detection</span>
                    <span className="text-[10px] text-slate-500">Automatically tracks and blurs face regions</span>
                  </div>
                  <button
                    onClick={() => setAutoDetect(!autoDetect)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      autoDetect ? 'bg-[#3C6B4D]' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      autoDetect ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Blur Configuration Controls */}
              <div className="flex flex-col gap-4 border-t border-[#2A2D30]/65 pt-3.5 bg-[#111213]/25 p-3 rounded-2xl border border-[#2A2D30]/40">
                <span className="text-[10px] text-slate-400 font-bold uppercase border-b border-[#2A2D30]/50 pb-2">Blur Filter Config</span>

                {/* Filter Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500">Blur Type</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['blur', 'pixelate', 'blackout'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setBlurType(type)}
                        className={`py-1 rounded-lg text-[10px] font-bold border transition-all capitalize ${
                          blurType === type
                            ? 'bg-[#3C6B4D]/15 text-[#3C6B4D] border-[#3C6B4D]/40'
                            : 'bg-[#111213] text-slate-400 border-[#2A2D30] hover:text-slate-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Face Coverage Expansion Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[9px] text-slate-500">
                    <span>Face Coverage Area</span>
                    <span className="font-mono text-[#3C6B4D] font-bold">{faceCoverage.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.05"
                    value={faceCoverage}
                    onChange={(e) => setFaceCoverage(parseFloat(e.target.value))}
                    className="w-full accent-[#3C6B4D]"
                  />
                  <span className="text-[8px] text-slate-500">Increase coverage to ensure the entire head/hair/neck is blurred.</span>
                </div>

                {/* Intensity slider (only for blur / pixelate) */}
                {blurType !== 'blackout' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-500">Filter Intensity ({blurIntensity})</label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={blurIntensity}
                      onChange={(e) => setBlurIntensity(parseInt(e.target.value) || 5)}
                      className="w-full accent-[#3C6B4D]"
                    />
                  </div>
                )}
              </div>

              {/* Bitrate Selection */}
              <div className="flex flex-col gap-1.5 border-t border-[#2A2D30]/65 pt-3.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Export Quality (Bitrate)</label>
                <select
                  value={bitrate}
                  onChange={(e) => setBitrate(Number(e.target.value))}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#3C6B4D]"
                >
                  <option value={1500000}>Standard Definition (1.5 Mbps)</option>
                  <option value={4000000}>High Definition (4 Mbps)</option>
                  <option value={8000000}>Ultra High Quality (8 Mbps)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right panel live video and canvas */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 justify-between min-h-[500px]">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider">Video Workspace Monitor</h3>
            {file && (
              <span className="text-[10px] text-slate-500 font-mono">
                {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
              </span>
            )}
          </div>

          {/* Hidden HTML5 Video node */}
          {file && videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              className="hidden"
              loop
              preload="auto"
            />
          )}

          {/* Render Preview Frame Canvas */}
          <div className="flex-1 flex items-center justify-center bg-black/60 rounded-2xl border border-[#2A2D30] overflow-hidden relative min-h-[300px]">
            {file ? (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
                style={{ maxHeight: '420px' }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Sliders size={28} />
                <span className="text-xs">No active video workspace monitor session</span>
              </div>
            )}
          </div>

          {/* Render Progress Overlay */}
          {rendering && (
            <div className="flex flex-col gap-2 bg-[#111213] border border-[#2A2D30] p-4 rounded-xl animate-fadeIn">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-350">Processing Face Blur frames...</span>
                <span className="text-[#3C6B4D]">{renderProgress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#3C6B4D] transition-all duration-150" style={{ width: `${renderProgress}%` }} />
              </div>
            </div>
          )}

          {/* Playback Controls & Save */}
          {file && (
            <div className="flex gap-3 border-t border-[#2A2D30] pt-4">
              <button
                onClick={togglePlay}
                disabled={rendering}
                className="py-3 px-4 bg-[#111213] border border-[#2A2D30] hover:bg-slate-900 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold disabled:opacity-55"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause' : 'Play Preview'}</span>
              </button>

              <button
                onClick={handleExport}
                disabled={rendering}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold disabled:opacity-50"
              >
                {rendering ? <Film size={14} className="animate-spin" /> : <Download size={14} />}
                <span>{rendering ? `Processing Export... ${renderProgress.toFixed(0)}%` : 'Export Face-Blurred Video'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
