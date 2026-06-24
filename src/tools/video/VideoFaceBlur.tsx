import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Trash2, Download, Film, Sliders, Play, Pause, Shield } from 'lucide-react';

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
  const [zones, setZones] = useState<TrackedZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [bitrate, setBitrate] = useState(12000000);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const dragStartRef = useRef<{ x: number; y: number; zoneX: number; zoneY: number } | null>(null);

  // Cached persistent offscreen canvases to avoid massive garbage collection layout lag
  const blurCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pixelateCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Decoupled caching for smooth, high-fps face tracking
  const trackedFacesRef = useRef<{ x: number; y: number; w: number; h: number }[]>([]);
  const animatedFacesRef = useRef<{ x: number; y: number; w: number; h: number }[]>([]);
  const framesSinceLastDetectRef = useRef<number>(0);
  const detectorRef = useRef<any>(null);
  const [detectorLoading, setDetectorLoading] = useState(true);

  // Initialize MediaPipe Tasks FaceDetector
  useEffect(() => {
    let active = true;
    const initMediaPipe = async () => {
      try {
        // @ts-ignore
        const { FaceDetector, FilesetResolver } = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU"
          },
          runningMode: "VIDEO"
        });
        if (active) {
          detectorRef.current = detector;
          setDetectorLoading(false);
          console.log("MediaPipe FaceDetector loaded successfully!");
        }
      } catch (err) {
        console.error("Failed to initialize MediaPipe FaceDetector:", err);
      }
    };
    initMediaPipe();
    return () => {
      active = false;
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

  // Main canvas renderer
  const renderFrame = useCallback(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || rendering) return;

    const ctx = c.getContext('2d')!;
    if (v.readyState >= 2) {
      if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
        c.width = v.videoWidth;
        c.height = v.videoHeight;
      }

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
            x: f.x + (target.x - f.x) * 0.4, // Smooth lock-on LERP factor
            y: f.y + (target.y - f.y) * 0.4,
            w: f.w + (target.w - f.w) * 0.4,
            h: f.h + (target.h - f.h) * 0.4
          };
        });
      }

      // Compile temporary active list (manual zones + animated auto-detected face zones if enabled)
      let activeZones: TrackedZone[] = [...zones];
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

      // Create/reuse a single full-frame downscaled blurred canvas to avoid local bounding box boundaries or artifacts
      let blurCanvas: HTMLCanvasElement | null = null;
      const scale = 0.2;
      const hasBlurZone = activeZones.some(z => z.type === 'blur');
      if (activeZones.length > 0 && hasBlurZone) {
        if (!blurCanvasRef.current) {
          blurCanvasRef.current = document.createElement('canvas');
        }
        blurCanvas = blurCanvasRef.current;
        const targetW = Math.max(1, Math.floor(c.width * scale));
        const targetH = Math.max(1, Math.floor(c.height * scale));
        if (blurCanvas.width !== targetW || blurCanvas.height !== targetH) {
          blurCanvas.width = targetW;
          blurCanvas.height = targetH;
        }
        const blurCtx = blurCanvas.getContext('2d')!;
        blurCtx.drawImage(c, 0, 0, blurCanvas.width, blurCanvas.height);
        
        // Apply the filter to the entire downscaled canvas
        blurCtx.filter = `blur(${Math.max(1, blurIntensity * scale)}px)`;
        blurCtx.drawImage(blurCanvas, 0, 0);
      }

      // Apply blur zones
      activeZones.forEach(z => {
        const zX = (z.x - z.w / 2) * c.width;
        const zY = (z.y - z.h / 2) * c.height;
        const zW = z.w * c.width;
        const zH = z.h * c.height;

        ctx.save();

        // 1. Create shape mask clipping (perfectly circular or rect)
        ctx.beginPath();
        if (z.shape === 'circle') {
          ctx.ellipse(zX + zW / 2, zY + zH / 2, zW / 2, zH / 2, 0, 0, 2 * Math.PI);
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
          if (!pixelateCanvasRef.current) {
            pixelateCanvasRef.current = document.createElement('canvas');
          }
          const tempCanvas = pixelateCanvasRef.current;
          const targetW = Math.max(1, Math.floor(zW / pixelSize));
          const targetH = Math.max(1, Math.floor(zH / pixelSize));
          if (tempCanvas.width !== targetW || tempCanvas.height !== targetH) {
            tempCanvas.width = targetW;
            tempCanvas.height = targetH;
          }
          const tempCtx = tempCanvas.getContext('2d')!;

          tempCtx.drawImage(c, zX, zY, zW, zH, 0, 0, tempCanvas.width, tempCanvas.height);
          ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, zX, zY, zW, zH);
          ctx.imageSmoothingEnabled = true;
        } else if (blurCanvas) {
          // Draw the blurred region from the blurred full frame (flawless, borderless result)
          ctx.drawImage(
            blurCanvas,
            zX * scale, zY * scale, zW * scale, zH * scale,
            zX, zY, zW, zH
          );
        }

        ctx.restore();

        // 3. Draw dashed border overlay if selected, not exporting, and it is a manual zone
        if (selectedZoneId === z.id && !rendering && !z.id.startsWith('auto-')) {
          ctx.save();
          ctx.strokeStyle = '#3C6B4D';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 4]);
          
          ctx.beginPath();
          if (z.shape === 'circle') {
            ctx.ellipse(zX + zW / 2, zY + zH / 2, zW / 2, zH / 2, 0, 0, 2 * Math.PI);
          } else {
            ctx.rect(zX, zY, zW, zH);
          }
          ctx.stroke();
          ctx.restore();
          
          ctx.fillStyle = '#3C6B4D';
          ctx.fillRect(zX, zY - 24, Math.min(zW, 130), 24);
          ctx.fillStyle = 'white';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(z.name.length > 18 ? z.name.substring(0, 15) + '...' : z.name, zX + 8, zY - 8);
        }
      });
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    }
  }, [autoDetect, isPlaying, rendering, blurType, blurIntensity, faceCoverage, zones, selectedZoneId]);

  // Run MediaPipe BlazeFace detection on the frame (directly on raw canvas/video via WebGL/GPU for speed)
  const detectFaces = useCallback((source: HTMLVideoElement | HTMLCanvasElement, timestamp = performance.now()): { x: number; y: number; w: number; h: number }[] => {
    const detector = detectorRef.current;
    if (!detector) return [];

    try {
      const srcW = 'videoWidth' in source ? source.videoWidth : source.width;
      const srcH = 'videoHeight' in source ? source.videoHeight : source.height;
      if (srcW === 0 || srcH === 0) return [];

      const results = detector.detectForVideo(source, timestamp);

      if (results && results.detections && results.detections.length > 0) {
        return results.detections.map((d: any) => {
          const bbox = d.boundingBox;
          if (!bbox) return null;
          return {
            x: (bbox.originX + bbox.width / 2) / srcW, // Map to relative center coordinates
            y: (bbox.originY + bbox.height / 2) / srcH,
            w: bbox.width / srcW,
            h: bbox.height / srcH
          };
        }).filter(Boolean);
      }
    } catch (e) {
      console.error('MediaPipe FaceDetector error:', e);
    }
    return [];
  }, []);

  // Run face detection asynchronously in the background loop to prevent render thread lagging
  useEffect(() => {
    if (!file || !autoDetect || rendering) return;

    let active = true;
    const runLoop = async () => {
      const v = videoRef.current;
      if (!v || v.ended || v.readyState < 2) {
        if (active) setTimeout(runLoop, 300);
        return;
      }

      try {
        const detected = detectFaces(v, performance.now());
        if (detected.length > 0) {
          trackedFacesRef.current = detected;
          framesSinceLastDetectRef.current = 0;
        } else {
          framesSinceLastDetectRef.current += 1;
          // Clear tracked faces if no face is detected for 6 consecutive scans (approx 500ms)
          if (framesSinceLastDetectRef.current > 6) {
            trackedFacesRef.current = [];
            animatedFacesRef.current = [];
          }
        }
        // Force canvas redraw immediately to show the updated face tracking overlay (even when paused)
        renderFrame();
      } catch (e) {
        console.error(e);
      }

      if (active) {
        // Scan less frequently if paused (300ms) vs playing (60ms) to conserve CPU
        setTimeout(runLoop, v.paused ? 300 : 60);
      }
    };

    runLoop();

    return () => {
      active = false;
    };
  }, [file, autoDetect, rendering, detectFaces, renderFrame]);

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
  }, [currentTime, autoDetect, renderFrame, blurType, blurIntensity, faceCoverage, zones, selectedZoneId]);

  // Bounding box dragging utilities for manual zones
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    // Find if clicked inside any manual zone
    const clickedZone = zones.find(z => {
      return (
        pos.x >= z.x - z.w / 2 &&
        pos.x <= z.x + z.w / 2 &&
        pos.y >= z.y - z.h / 2 &&
        pos.y <= z.y + z.h / 2
      );
    });

    if (clickedZone) {
      setSelectedZoneId(clickedZone.id);
      dragStartRef.current = {
        x: pos.x,
        y: pos.y,
        zoneX: clickedZone.x,
        zoneY: clickedZone.y
      };
    } else {
      // Click empty space to spawn a new manual circular zone
      const newId = `zone-${Math.random()}`;
      const newZone: TrackedZone = {
        id: newId,
        x: pos.x,
        y: pos.y,
        w: 0.16,
        h: 0.16,
        shape: 'circle',
        type: 'blur',
        intensity: 25,
        name: `Custom Zone ${zones.length + 1}`
      };
      setZones(prev => [...prev, newZone]);
      setSelectedZoneId(newId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const dragStart = dragStartRef.current;
    if (!dragStart || !selectedZoneId) return;
    const pos = getMousePos(e);
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    const targetX = dragStart.zoneX + dx;
    const targetY = dragStart.zoneY + dy;

    setZones(prev => prev.map(z => {
      if (z.id === selectedZoneId) {
        return {
          ...z,
          x: Math.max(z.w / 2, Math.min(1 - z.w / 2, targetX)),
          y: Math.max(z.h / 2, Math.min(1 - z.h / 2, targetY))
        };
      }
      return z;
    }));
  };

  const handleMouseUp = () => {
    dragStartRef.current = null;
  };

  const handleAddZone = () => {
    const newId = `zone-${Math.random()}`;
    setZones(prev => [
      ...prev,
      {
        id: newId,
        x: 0.5,
        y: 0.5,
        w: 0.16,
        h: 0.16,
        shape: 'circle',
        type: 'blur',
        intensity: 25,
        name: `Custom Zone ${prev.length + 1}`
      }
    ]);
    setSelectedZoneId(newId);
  };

  const handleRemoveZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
    if (selectedZoneId === id) {
      setSelectedZoneId('');
    }
  };

  const handleUpdateZone = (id: string, field: keyof TrackedZone, val: any) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, [field]: val } : z));
  };

  // Export blurred video using MediaRecorder canvas streaming
  const handleExport = async () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !file) return;

    setRendering(true);
    setRenderProgress(0);
    setIsPlaying(false);
    v.pause();
    v.muted = true; // Stay silent during background export rendering
    v.loop = false; // Disable loop so ended event triggers correctly

    let audioCtx: AudioContext | null = null;
    let src: MediaElementAudioSourceNode | null = null;
    const usePlaybackRate = 1.0; // Always export at 1.0x original speed to prevent fast-forward speed manipulation

    try {
      const renderCanvas = document.createElement('canvas');
      renderCanvas.width = v.videoWidth;
      renderCanvas.height = v.videoHeight;
      const ctx = renderCanvas.getContext('2d')!;

      const stream = renderCanvas.captureStream(30);

      // Try capturing audio from the video element directly using captureStream() first (best, no stalling)
      let audioTrack: MediaStreamTrack | null = null;
      try {
        // @ts-ignore
        const vStream = v.captureStream ? v.captureStream() : (v.mozCaptureStream ? v.mozCaptureStream() : null);
        if (vStream) {
          audioTrack = vStream.getAudioTracks()[0];
        }
      } catch (e) {
        console.warn("Direct captureStream audio capture failed, trying Web Audio API:", e);
      }

      if (audioTrack) {
        stream.addTrack(audioTrack);
      } else {
        // Web Audio fallback if direct capture stream is unavailable
        try {
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }
          const dest = audioCtx.createMediaStreamDestination();
          src = audioCtx.createMediaElementSource(v);
          src.connect(dest);
          src.connect(audioCtx.destination);
          
          const audioCtxTrack = dest.stream.getAudioTracks()[0];
          if (audioCtxTrack) {
            stream.addTrack(audioCtxTrack);
            v.muted = false;
          }
        } catch (audioErr) {
          console.warn("Audio capture failed. Exporting video-only.", audioErr);
          v.muted = true;
          if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
          }
        }
      }

      // Determine browser-compatible MIME type (prioritizing the original file format if supported)
      let mimeType = '';
      if (file.type && MediaRecorder.isTypeSupported(file.type)) {
        mimeType = file.type;
      } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
        mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
      } else {
        mimeType = 'video/webm';
      }

      const chunks: BlobPart[] = [];
      const mr = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: bitrate,
      });

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      let exportFrameCount = 0;
      let cachedExportFaces: any[] = [];

      let animationId: number;
      const renderLoop = () => {
        if (v.ended || v.currentTime >= duration - 0.05) {
          mr.stop();
          return;
        }

        ctx.drawImage(v, 0, 0, renderCanvas.width, renderCanvas.height);

        // Run face detection on export at a moderate step to prevent export slowdown
        if (autoDetect) {
          exportFrameCount++;
          // Scan every 3 frames for perfect accuracy and high speed during export
          if (exportFrameCount >= 3 || cachedExportFaces.length === 0) {
            exportFrameCount = 0;
            cachedExportFaces = detectFaces(renderCanvas, performance.now());
          }
        } else {
          cachedExportFaces = [];
        }

        let activeZones: TrackedZone[] = [...zones];
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
              name: `Auto Face ${idx + 1}`
            });
          });
        }

        // Apply blur on export (reuse offscreen canvas)
        let exportBlurCanvas: HTMLCanvasElement | null = null;
        const scale = 0.2;
        const hasBlurZone = activeZones.some(z => z.type === 'blur');
        if (activeZones.length > 0 && hasBlurZone) {
          if (!blurCanvasRef.current) {
            blurCanvasRef.current = document.createElement('canvas');
          }
          exportBlurCanvas = blurCanvasRef.current;
          const targetW = Math.max(1, Math.floor(renderCanvas.width * scale));
          const targetH = Math.max(1, Math.floor(renderCanvas.height * scale));
          if (exportBlurCanvas.width !== targetW || exportBlurCanvas.height !== targetH) {
            exportBlurCanvas.width = targetW;
            exportBlurCanvas.height = targetH;
          }
          const exportBlurCtx = exportBlurCanvas.getContext('2d')!;
          exportBlurCtx.drawImage(renderCanvas, 0, 0, exportBlurCanvas.width, exportBlurCanvas.height);
          
          exportBlurCtx.filter = `blur(${Math.max(1, blurIntensity * scale)}px)`;
          exportBlurCtx.drawImage(exportBlurCanvas, 0, 0);
        }

        activeZones.forEach(z => {
          const zX = (z.x - z.w / 2) * renderCanvas.width;
          const zY = (z.y - z.h / 2) * renderCanvas.height;
          const zW = z.w * renderCanvas.width;
          const zH = z.h * renderCanvas.height;

          ctx.save();
          ctx.beginPath();
          if (z.shape === 'circle') {
            ctx.ellipse(zX + zW / 2, zY + zH / 2, zW / 2, zH / 2, 0, 0, 2 * Math.PI);
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
            if (!pixelateCanvasRef.current) {
              pixelateCanvasRef.current = document.createElement('canvas');
            }
            const tempCanvas = pixelateCanvasRef.current;
            const targetW = Math.max(1, Math.floor(zW / pixelSize));
            const targetH = Math.max(1, Math.floor(zH / pixelSize));
            if (tempCanvas.width !== targetW || tempCanvas.height !== targetH) {
              tempCanvas.width = targetW;
              tempCanvas.height = targetH;
            }
            const tempCtx = tempCanvas.getContext('2d')!;
            tempCtx.drawImage(renderCanvas, zX, zY, zW, zH, 0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, zX, zY, zW, zH);
            ctx.imageSmoothingEnabled = true;
          } else if (exportBlurCanvas) {
            ctx.drawImage(
              exportBlurCanvas,
              zX * scale, zY * scale, zW * scale, zH * scale,
              zX, zY, zW, zH
            );
          }
          ctx.restore();
        });

        setRenderProgress(Math.min(99, (v.currentTime / duration) * 100));
        animationId = requestAnimationFrame(renderLoop);
      };

      mr.onstop = () => {
        cancelAnimationFrame(animationId);
        v.pause();
        v.playbackRate = 1.0; // Reset playback rate
        v.muted = false; // Restore audio for preview
        v.loop = true; // Restore loop for preview
        const blob = new Blob(chunks, { type: mimeType });
        const baseName = file.name.replace(/\.[^.]+$/, '');
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        triggerBlobDownload(blob, `${baseName}_blurred.${extension}`);
        setRendering(false);
        setRenderProgress(0);
        if (src) src.disconnect();
        if (audioCtx) audioCtx.close();
      };

      // Play the video and start recording only when playback actually begins
      v.currentTime = 0;
      v.playbackRate = usePlaybackRate; // Sped up if no Web Audio node to stall it, otherwise 1.0x for sync
      
      const startRecording = () => {
        mr.start(200);
        renderLoop();
      };

      v.play()
        .then(startRecording)
        .catch(err => {
          console.warn("Autoplay block on export, falling back to muted recording:", err);
          v.muted = true;
          v.play().then(startRecording);
        });

    } catch (err) {
      console.error("Export failure:", err);
      v.playbackRate = 1.0;
      v.muted = true;
      setRendering(false);
      if (audioCtx) audioCtx.close();
    }
  };

  const selectedZone = zones.find(z => z.id === selectedZoneId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Left panel options */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3">
            <h2 className="text-xl font-bold text-[#ECEBE9] flex items-center gap-2">
              <Shield className="text-[#3C6B4D]" size={22} />
              <span>Face Blur Settings</span>
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
                    <span className="text-[10px] text-slate-500">
                      {detectorLoading ? 'Loading MediaPipe AI Engine...' : 'Automatically tracks and blurs face regions'}
                    </span>
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
                <span className="text-[10px] text-slate-400 font-bold uppercase border-b border-[#2A2D30]/50 pb-2">Auto Blur Config</span>

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

              {/* Custom Blur Zones List */}
              <div className="flex flex-col gap-3 border-t border-[#2A2D30]/65 pt-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Custom Blur Zones</span>
                  <button
                    onClick={handleAddZone}
                    className="py-1 px-3 bg-[#3C6B4D]/15 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded-xl text-[10px] font-bold flex items-center gap-1 hover:bg-[#3C6B4D]/30"
                  >
                    <span>+ Add Zone</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
                  {zones.map((z) => (
                    <div
                      key={z.id}
                      onClick={() => setSelectedZoneId(z.id)}
                      className={`flex justify-between items-center p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedZoneId === z.id
                          ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/40 text-[#3C6B4D]'
                          : 'bg-[#111213]/40 border-[#2A2D30]/60 text-slate-300 hover:border-[#2A2D30]'
                      }`}
                    >
                      <span className="font-semibold">{z.name} ({z.shape})</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveZone(z.id); }}
                        className="p-1 hover:bg-rose-950/20 text-rose-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {zones.length === 0 && (
                    <span className="text-xs text-slate-500 text-center italic py-2">No manual zones configured. Click the video workspace preview to draw and resize a custom circle.</span>
                  )}
                </div>
              </div>

              {/* Selected Custom Zone Configurator */}
              {selectedZone && (
                <div className="flex flex-col gap-3 border-t border-[#2A2D30]/65 pt-3.5 bg-[#111213]/25 p-3 rounded-2xl border border-[#2A2D30]/40">
                  <div className="flex items-center justify-between border-b border-[#2A2D30]/50 pb-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Configure Custom Zone</span>
                    <input
                      type="text"
                      value={selectedZone.name}
                      onChange={(e) => handleUpdateZone(selectedZone.id, 'name', e.target.value)}
                      className="bg-transparent border-b border-slate-700 text-xs text-slate-200 px-1 py-0.5 text-right max-w-[120px] focus:outline-none focus:border-[#3C6B4D]"
                    />
                  </div>

                  {/* Width & Height Resizers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-500">Circle Width Size</label>
                      <input
                        type="range"
                        min="0.05"
                        max="0.85"
                        step="0.01"
                        value={selectedZone.w}
                        onChange={(e) => handleUpdateZone(selectedZone.id, 'w', parseFloat(e.target.value))}
                        className="w-full accent-[#3C6B4D]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-500">Circle Height Size</label>
                      <input
                        type="range"
                        min="0.05"
                        max="0.85"
                        step="0.01"
                        value={selectedZone.h}
                        onChange={(e) => handleUpdateZone(selectedZone.id, 'h', parseFloat(e.target.value))}
                        className="w-full accent-[#3C6B4D]"
                      />
                    </div>
                  </div>

                  {/* Shape Switcher */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-500">Zone Shape</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['circle', 'rect'] as const).map(shape => (
                        <button
                          key={shape}
                          onClick={() => handleUpdateZone(selectedZone.id, 'shape', shape)}
                          className={`py-1 rounded-lg text-[9px] font-bold border transition-all capitalize ${
                            selectedZone.shape === shape
                              ? 'bg-[#3C6B4D]/15 text-[#3C6B4D] border-[#3C6B4D]/40'
                              : 'bg-[#111213] text-slate-400 border-[#2A2D30] hover:text-slate-200'
                          }`}
                        >
                          {shape === 'circle' ? 'Circle' : 'Rectangle'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Type */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-500">Zone Type</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['blur', 'pixelate', 'blackout'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => handleUpdateZone(selectedZone.id, 'type', type)}
                          className={`py-1 rounded-lg text-[9px] font-bold border transition-all capitalize ${
                            selectedZone.type === type
                              ? 'bg-[#3C6B4D]/15 text-[#3C6B4D] border-[#3C6B4D]/40'
                              : 'bg-[#111213] text-slate-400 border-[#2A2D30] hover:text-slate-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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
                  <option value={12000000}>Original High Quality (12 Mbps)</option>
                  <option value={16000000}>Maximum Quality (16 Mbps)</option>
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
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px', overflow: 'hidden' }}
              loop
              preload="auto"
              playsInline
              muted={false}
            />
          )}

          {/* Render Preview Frame Canvas */}
          <div className="flex-1 flex items-center justify-center bg-black/60 rounded-2xl border border-[#2A2D30] overflow-hidden relative min-h-[300px]">
            {file ? (
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full h-full object-contain cursor-crosshair"
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
