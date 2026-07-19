import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Target, FileCode, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface KeypointNode {
  id: number;
  name: string;
  x: number; // normalized [0..1]
  y: number; // normalized [0..1]
  visibility: 0 | 1 | 2; // 0: absent, 1: occluded, 2: visible
}

interface SkeletonLink {
  from: number;
  to: number;
  color: string;
}

const COCO_KEYPOINTS: Array<{ id: number; name: string }> = [
  { id: 0, name: 'nose' },
  { id: 1, name: 'left_eye' },
  { id: 2, name: 'right_eye' },
  { id: 3, name: 'left_ear' },
  { id: 4, name: 'right_ear' },
  { id: 5, name: 'left_shoulder' },
  { id: 6, name: 'right_shoulder' },
  { id: 7, name: 'left_elbow' },
  { id: 8, name: 'right_elbow' },
  { id: 9, name: 'left_wrist' },
  { id: 10, name: 'right_wrist' },
  { id: 11, name: 'left_hip' },
  { id: 12, name: 'right_hip' },
  { id: 13, name: 'left_knee' },
  { id: 14, name: 'right_knee' },
  { id: 15, name: 'left_ankle' },
  { id: 16, name: 'right_ankle' },
];

const COCO_LINKS: SkeletonLink[] = [
  { from: 0, to: 1, color: '#FF5722' }, { from: 0, to: 2, color: '#FF5722' },
  { from: 1, to: 3, color: '#FF5722' }, { from: 2, to: 4, color: '#FF5722' },
  { from: 5, to: 6, color: '#4CAF50' }, { from: 5, to: 7, color: '#2196F3' },
  { from: 7, to: 9, color: '#2196F3' }, { from: 6, to: 8, color: '#9C27B0' },
  { from: 8, to: 10, color: '#9C27B0' }, { from: 5, to: 11, color: '#4CAF50' },
  { from: 6, to: 12, color: '#4CAF50' }, { from: 11, to: 12, color: '#FFEB3B' },
  { from: 11, to: 13, color: '#00BCD4' }, { from: 13, to: 15, color: '#00BCD4' },
  { from: 12, to: 14, color: '#E91E63' }, { from: 14, to: 16, color: '#E91E63' },
];

export const PoseSkeletonAnnotatorTool: React.FC = () => {
  const [image, setImage] = useState<{ url: string; width: number; height: number; name: string } | null>(null);
  const [keypoints, setKeypoints] = useState<KeypointNode[]>([]);
  const [activeKeypointId, setActiveKeypointId] = useState<number>(0);
  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        setImage({
          url: evt.target?.result as string,
          width: img.width,
          height: img.height,
          name: file.name,
        });

        // Initialize default centered COCO skeleton template
        const initialNodes: KeypointNode[] = COCO_KEYPOINTS.map((kp) => ({
          id: kp.id,
          name: kp.name,
          x: 0.5 + (Math.sin(kp.id) * 0.15),
          y: 0.2 + (kp.id * 0.04),
          visibility: 2,
        }));
        setKeypoints(initialNodes);
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!image) {
      imgRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      drawCanvas();
    };
    img.src = image.url;
  }, [image]);

  const drawCanvas = useCallback(() => {
    if (!image || !canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width * zoom;
    canvas.height = image.height * zoom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

      // Render Skeleton Bones
      COCO_LINKS.forEach((link) => {
        const k1 = keypoints.find((k) => k.id === link.from);
        const k2 = keypoints.find((k) => k.id === link.to);
        if (k1 && k2 && k1.visibility > 0 && k2.visibility > 0) {
          ctx.beginPath();
          ctx.moveTo(k1.x * canvas.width, k1.y * canvas.height);
          ctx.lineTo(k2.x * canvas.width, k2.y * canvas.height);
          ctx.strokeStyle = link.color;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      });

      // Render Keypoint Nodes
      keypoints.forEach((kp) => {
        if (kp.visibility === 0) return;
        const x = kp.x * canvas.width;
        const y = kp.y * canvas.height;
        const isSelected = kp.id === activeKeypointId;

        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = kp.visibility === 2 ? '#10B981' : '#F59E0B';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#FFFFFF' : '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(kp.name, x + 10, y + 4);
      });
  }, [image, keypoints, activeKeypointId, zoom]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !image) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    // Find closest keypoint node
    let closestId: number | null = null;
    let minDist = 0.05; // radius tolerance

    keypoints.forEach((kp) => {
      const dist = Math.hypot(kp.x - nx, kp.y - ny);
      if (dist < minDist) {
        minDist = dist;
        closestId = kp.id;
      }
    });

    if (closestId !== null) {
      setDraggingNodeId(closestId);
      setActiveKeypointId(closestId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingNodeId === null || !canvasRef.current || !image) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setKeypoints((prev) =>
      prev.map((k) => (k.id === draggingNodeId ? { ...k, x: nx, y: ny } : k))
    );
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const setNodeVisibility = (id: number, vis: 0 | 1 | 2) => {
    setKeypoints((prev) =>
      prev.map((k) => (k.id === id ? { ...k, visibility: vis } : k))
    );
  };

  const downloadCOCOPoseJSON = () => {
    if (!image) return;
    const keypointsArray: number[] = [];
    keypoints.forEach((kp) => {
      keypointsArray.push(
        Math.round(kp.x * image.width),
        Math.round(kp.y * image.height),
        kp.visibility
      );
    });

    const cocoPose = {
      image: image.name,
      width: image.width,
      height: image.height,
      keypoints: keypointsArray,
      num_keypoints: keypoints.filter((k) => k.visibility > 0).length,
    };

    const blob = new Blob([JSON.stringify(cocoPose, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `coco_pose_${image.name.replace(/\.[^/.]+$/, '')}.json`;
    link.click();
  };

  const downloadOverlay = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `skeleton_pose_${image.name}`;
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#3B82F6]/20 text-[#3B82F6] rounded-xl border border-[#3B82F6]/30">
            <Target size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Pose Estimation & Keypoint Skeleton Annotator</h2>
            <p className="text-xs text-[#72706C]">Drag 17 COCO keypoint nodes to annotate human pose skeletons and export JSON</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Image</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {image && (
            <>
              <button
                onClick={downloadCOCOPoseJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2022] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl text-[#ECEBE9]"
              >
                <FileCode size={14} className="text-[#3B82F6]" />
                <span>COCO Keypoints JSON</span>
              </button>
              <button
                onClick={downloadOverlay}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-xs font-semibold rounded-xl text-[#3C6B4D]"
              >
                <Download size={14} />
                <span>Pose Overlay PNG</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Studio Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Keypoints Sidebar */}
        <div className="w-80 bg-[#141517] border-r border-[#2A2D30] p-4 flex flex-col gap-4 overflow-y-auto">
          <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider">COCO 17 Keypoints</span>

          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
            {keypoints.map((kp) => (
              <div
                key={kp.id}
                onClick={() => setActiveKeypointId(kp.id)}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                  activeKeypointId === kp.id
                    ? 'bg-[#1E2022] border-[#3C6B4D] text-white shadow-sm'
                    : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                <span className="font-semibold">{kp.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNodeVisibility(kp.id, 2);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      kp.visibility === 2 ? 'bg-[#10B981] text-white' : 'bg-[#111213] text-[#72706C]'
                    }`}
                  >
                    Visible
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNodeVisibility(kp.id, 1);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      kp.visibility === 1 ? 'bg-[#F59E0B] text-white' : 'bg-[#111213] text-[#72706C]'
                    }`}
                  >
                    Hidden
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="flex-1 bg-[#0D0E0F] relative flex items-center justify-center p-6 overflow-auto min-h-[400px]">
          {image && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#18191B]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#2A2D30] z-20 shadow-xl">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs font-mono text-[#A3A09B] px-1">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <div className="w-[1px] h-4 bg-[#2A2D30] mx-0.5" />
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          )}

          {image ? (
            <div 
              className="relative border border-[#2A2D30] rounded-xl overflow-hidden shadow-2xl bg-[#141517] transition-transform duration-150 ease-out origin-center"
              style={{ transform: `scale(${zoom})` }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="cursor-move block max-w-full max-h-[75vh] object-contain"
              />
            </div>
          ) : (
            <div className="text-center p-12 max-w-md border-2 border-dashed border-[#2A2D30] rounded-3xl bg-[#141517]/50">
              <div className="w-16 h-16 rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center mx-auto mb-4 border border-[#3B82F6]/20">
                <Target size={32} />
              </div>
              <h3 className="text-base font-bold text-[#ECEBE9] mb-1">Pose Skeleton Studio</h3>
              <p className="text-xs text-[#72706C] mb-6">Upload an image of a person to place and adjust COCO 17-keypoint skeleton nodes.</p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-lg">
                <Upload size={14} />
                <span>Select Image</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
