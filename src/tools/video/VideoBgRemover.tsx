import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Video, Download, Play, Pause, RefreshCw, ZoomIn, ZoomOut, RotateCcw, Pipette, Sliders, Image as ImageIcon, Film } from 'lucide-react';

export const VideoBgRemoverTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  // Keying configuration
  const [keyColor, setKeyColor] = useState('#00ff00'); // Default green screen (#00FF00)
  const [tolerance, setTolerance] = useState(40); // 1 to 100
  const [smoothness, setSmoothness] = useState(15); // 0 to 50
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);

  // Background replacement configuration
  const [bgType, setBgType] = useState<'transparent' | 'color' | 'image'>('transparent');
  const [bgColor, setBgColor] = useState('#111213');
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);

  // Zoom controls (Mandatory interactive viewport controls)
  const [zoom, setZoom] = useState(1);

  // Render & Export states
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const animRef = useRef<number>(0);

  // Handle video source load
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Handle custom background image load
  useEffect(() => {
    if (bgImageFile) {
      const url = URL.createObjectURL(bgImageFile);
      setBgImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setBgImageUrl(null);
    }
  }, [bgImageFile]);

  // Setup video metadata listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMetadata = () => {
      setDuration(v.duration);
      if (canvasRef.current) {
        canvasRef.current.width = v.videoWidth || 640;
        canvasRef.current.height = v.videoHeight || 360;
      }
    };
    v.addEventListener('loadedmetadata', onMetadata);
    return () => v.removeEventListener('loadedmetadata', onMetadata);
  }, [videoUrl]);

  // Convert Hex color to RGB
  const hexToRgb = (hex: string) => {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  // Perform Chroma Keying and composite on canvas
  const renderFrame = useCallback(() => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw Background (Solid Color, Custom Image, or Checkerboard grid for transparent)
    if (bgType === 'color') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
    } else if (bgType === 'image' && bgImageRef.current && bgImageRef.current.complete) {
      ctx.drawImage(bgImageRef.current, 0, 0, w, h);
    } else {
      // Clear canvas (Transparent)
      ctx.clearRect(0, 0, w, h);
    }

    // 2. Draw Video Frame to offscreen buffer or directly for processing
    const offCanvas = document.createElement('canvas');
    offCanvas.width = w;
    offCanvas.height = h;
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    offCtx.drawImage(v, 0, 0, w, h);
    const frame = offCtx.getImageData(0, 0, w, h);
    const data = frame.data;
    const len = data.length;

    const keyRgb = hexToRgb(keyColor);
    const tolSq = Math.pow(tolerance * 2.2, 2);
    const smoothSq = Math.pow((tolerance + smoothness) * 2.2, 2);

    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate Euclidean color distance to target key color
      const distSq = Math.pow(r - keyRgb.r, 2) + Math.pow(g - keyRgb.g, 2) + Math.pow(b - keyRgb.b, 2);

      if (distSq < tolSq) {
        data[i + 3] = 0; // Completely transparent
      } else if (distSq < smoothSq && smoothness > 0) {
        // Smooth transition edge
        const alphaFraction = (distSq - tolSq) / (smoothSq - tolSq);
        data[i + 3] = Math.round(data[i + 3] * alphaFraction);
      }
    }

    offCtx.putImageData(frame, 0, 0);

    // 3. Composite processed frame on main canvas
    ctx.drawImage(offCanvas, 0, 0, w, h);
  }, [keyColor, tolerance, smoothness, bgType, bgColor]);

  // Main animation loop
  useEffect(() => {
    const loop = () => {
      const v = videoRef.current;
      if (v) {
        setCurrentTime(v.currentTime);
        renderFrame();
      }
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [renderFrame]);

  // Eyedropper click on Canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEyedropperActive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvasRef.current.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvasRef.current.height / rect.height));

    const v = videoRef.current;
    if (!v) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = v.videoWidth || 640;
    tempCanvas.height = v.videoHeight || 360;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(v, 0, 0, tempCanvas.width, tempCanvas.height);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
    setKeyColor(hex);
    setIsEyedropperActive(false);
  };

  // Play / Pause video
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      v.play();
      setIsPlaying(true);
    }
  };

  // Seek video
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    const v = videoRef.current;
    if (v) {
      v.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  // Export current keyed frame as PNG
  const handleExportFrame = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        triggerBlobDownload(blob, `video_frame_${Math.round(currentTime)}s.png`);
      }
    }, 'image/png');
  };

  // Record composite canvas stream to WebM video download
  const handleRecordVideo = async () => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas) return;

    setIsRecording(true);
    setRecordProgress(0);

    v.pause();
    v.currentTime = 0;
    setIsPlaying(false);

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      triggerBlobDownload(blob, `video_bg_removed_${Date.now()}.webm`);
      setIsRecording(false);
    };

    mediaRecorder.start();
    await v.play();
    setIsPlaying(true);

    const checkEnd = setInterval(() => {
      if (v) {
        setRecordProgress(Math.round((v.currentTime / v.duration) * 100));
        if (v.ended || v.currentTime >= v.duration - 0.1) {
          clearInterval(checkEnd);
          v.pause();
          setIsPlaying(false);
          mediaRecorder.stop();
        }
      }
    }, 200);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left">
      {/* Hidden Source Assets */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          loop={isLooping}
          muted
          playsInline
          className="hidden"
        />
      )}
      {bgImageUrl && (
        <img
          ref={bgImageRef}
          src={bgImageUrl}
          alt="Custom Background"
          className="hidden"
          onLoad={() => renderFrame()}
        />
      )}

      {/* Main Tool Container */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Control Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-5 p-6 rounded-3xl bg-[#18191B] border border-[#2A2D30] shadow-xl shrink-0">
          <div className="flex items-center gap-2 border-b border-[#2A2D30] pb-3">
            <Film size={18} className="text-[#3C6B4D]" />
            <h2 className="text-base font-extrabold text-[#ECEBE9]">Video Background Settings</h2>
          </div>

          {/* File Upload Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#A3A09B]">Select Input Video</label>
            <label className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#111213] border border-dashed border-[#2A2D30] hover:border-[#3C6B4D]/60 cursor-pointer transition-all text-xs font-bold text-[#ECEBE9]">
              <Upload size={15} className="text-[#3C6B4D]" />
              <span className="truncate">{file ? file.name : "Upload MP4, WebM, MOV"}</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/avi"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Keying Settings */}
          <div className="flex flex-col gap-4 border-t border-[#2A2D30] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5">
                <Sliders size={13} className="text-[#3C6B4D]" /> Keying Controls
              </span>
              <button
                onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
                  isEyedropperActive
                    ? 'bg-[#3C6B4D]/20 border-[#3C6B4D] text-[#4E8E5E]'
                    : 'bg-[#111213] border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9]'
                }`}
                title="Click canvas to pick key color"
              >
                <Pipette size={13} />
                <span>Eyedropper</span>
              </button>
            </div>

            {/* Key Color Picker */}
            <div className="flex items-center justify-between bg-[#111213] p-2.5 rounded-xl border border-[#2A2D30]">
              <span className="text-xs font-semibold text-[#A3A09B]">Target Key Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={keyColor}
                  onChange={(e) => setKeyColor(e.target.value)}
                  className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border-0"
                />
                <span className="text-xs font-mono font-bold text-[#ECEBE9] uppercase">{keyColor}</span>
              </div>
            </div>

            {/* Color Presets */}
            <div className="flex gap-1.5">
              {[
                { name: 'Green', hex: '#00ff00' },
                { name: 'Blue', hex: '#0000ff' },
                { name: 'White', hex: '#ffffff' },
                { name: 'Grey', hex: '#808080' },
                { name: 'Black', hex: '#000000' },
              ].map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => setKeyColor(preset.hex)}
                  className="flex-1 py-1 rounded-lg border border-[#2A2D30] text-[10px] font-bold text-[#A3A09B] hover:text-[#ECEBE9] transition-all flex items-center justify-center gap-1"
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: preset.hex }} />
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Tolerance Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#A3A09B]">
                <span>Tolerance Threshold</span>
                <span className="font-mono text-[#ECEBE9]">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={tolerance}
                onChange={(e) => setTolerance(parseInt(e.target.value))}
                className="w-full accent-[#3C6B4D]"
              />
            </div>

            {/* Edge Smoothness Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#A3A09B]">
                <span>Edge Smoothness</span>
                <span className="font-mono text-[#ECEBE9]">{smoothness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={smoothness}
                onChange={(e) => setSmoothness(parseInt(e.target.value))}
                className="w-full accent-[#3C6B4D]"
              />
            </div>
          </div>

          {/* Background Replacement Settings */}
          <div className="flex flex-col gap-3 border-t border-[#2A2D30] pt-4">
            <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5">
              <ImageIcon size={13} className="text-[#3C6B4D]" /> Background Replacement
            </span>

            <div className="grid grid-cols-3 gap-1.5 bg-[#111213] p-1 rounded-xl border border-[#2A2D30]">
              <button
                onClick={() => setBgType('transparent')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  bgType === 'transparent' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                Alpha
              </button>
              <button
                onClick={() => setBgType('color')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  bgType === 'color' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                Color
              </button>
              <button
                onClick={() => setBgType('image')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  bgType === 'image' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                Image
              </button>
            </div>

            {/* Custom Color Selector */}
            {bgType === 'color' && (
              <div className="flex items-center justify-between bg-[#111213] p-2 rounded-xl border border-[#2A2D30]">
                <span className="text-xs font-semibold text-[#A3A09B]">Background Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border-0"
                  />
                  <span className="text-xs font-mono font-bold text-[#ECEBE9] uppercase">{bgColor}</span>
                </div>
              </div>
            )}

            {/* Custom Image Upload Selector */}
            {bgType === 'image' && (
              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#111213] border border-dashed border-[#2A2D30] hover:border-[#3C6B4D]/60 cursor-pointer transition-all text-xs font-bold text-[#ECEBE9]">
                <ImageIcon size={14} className="text-[#3C6B4D]" />
                <span className="truncate">{bgImageFile ? bgImageFile.name : "Select Image Background"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setBgImageFile(e.target.files[0]);
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Right Preview Viewport */}
        <div className="flex-1 w-full flex flex-col gap-4">
          <div className="relative rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 shadow-xl flex flex-col items-center justify-center min-h-[420px] overflow-hidden">
            {/* Mandatory Interactive Viewport Zoom Controls */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 p-1 rounded-xl bg-[#111213]/90 border border-[#2A2D30] backdrop-blur-md shadow-lg">
              <button
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.15))}
                className="p-1.5 rounded-lg text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#2A2D30] transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-[11px] font-mono font-bold text-[#ECEBE9] px-2 min-w-[45px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(prev => Math.min(2.5, prev + 0.15))}
                className="p-1.5 rounded-lg text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#2A2D30] transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 rounded-lg text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#2A2D30] transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Video Canvas Container */}
            {file ? (
              <div className="relative max-w-full overflow-auto p-4 flex items-center justify-center">
                <div
                  className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom})`,
                    backgroundImage: bgType === 'transparent' ? 'radial-gradient(#2A2D30 1px, transparent 0)' : 'none',
                    backgroundSize: '16px 16px',
                    backgroundColor: bgType === 'transparent' ? '#111213' : 'transparent'
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className={`max-w-full max-h-[480px] object-contain rounded-2xl ${
                      isEyedropperActive ? 'cursor-crosshair ring-2 ring-[#3C6B4D]' : ''
                    }`}
                  />
                  {isEyedropperActive && (
                    <div className="absolute top-3 left-3 bg-black/80 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/40 backdrop-blur-md pointer-events-none">
                      Click video frame to pick key color
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 p-12 text-center text-[#72706C]">
                <Video size={48} className="text-[#2A2D30] animate-pulse" />
                <h3 className="text-base font-bold text-[#ECEBE9]">No Video Selected</h3>
                <p className="text-xs text-[#A3A09B] max-w-sm">
                  Upload an MP4 or WebM video on the left panel to remove green screen or custom background colors.
                </p>
              </div>
            )}

            {/* Playback Progress Controls */}
            {file && (
              <div className="w-full flex flex-col gap-3 mt-4 pt-4 border-t border-[#2A2D30] z-20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2.5 rounded-xl bg-[#3C6B4D] hover:bg-[#4E8E5E] text-white font-bold transition-all shadow-md shrink-0"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.05"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full accent-[#3C6B4D] cursor-pointer"
                  />

                  <span className="text-xs font-mono text-[#A3A09B] shrink-0 min-w-[85px] text-right font-bold">
                    {Math.floor(currentTime)}s / {Math.floor(duration)}s
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isLooping
                          ? 'bg-[#3C6B4D]/15 border-[#3C6B4D]/40 text-[#4E8E5E]'
                          : 'bg-[#111213] border-[#2A2D30] text-[#72706C]'
                      }`}
                    >
                      Loop Playback
                    </button>
                  </div>

                  {/* Export CTAs */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportFrame}
                      className="px-4 py-2 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Download size={14} />
                      <span>Export Frame</span>
                    </button>

                    <button
                      onClick={handleRecordVideo}
                      disabled={isRecording}
                      className="px-5 py-2 rounded-xl bg-[#3C6B4D] hover:bg-[#4E8E5E] text-white text-xs font-black flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                    >
                      {isRecording ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Rendering ({recordProgress}%)</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          <span>Export Keyed Video (.WebM)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
