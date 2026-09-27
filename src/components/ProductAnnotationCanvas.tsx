import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Pencil,
  Highlighter,
  Type,
  Eraser,
  Undo2,
  Trash2,
  Download,
  Share2,
  Check,
  X,
  ArrowUpRight,
  Plus,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export interface CustomNote {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  text: string;
  color: string;
}

export interface DrawStroke {
  id: string;
  tool: 'pen' | 'highlighter' | 'arrow';
  color: string;
  width: number;
  points: { x: number; y: number }[]; // relative 0-1
}

interface ProductAnnotationCanvasProps {
  language: 'bn' | 'en';
  containerWidth: number;
  containerHeight: number;
  onClose: () => void;
  onShareAnnotated: (annotatedBlob: Blob, dataUrl: string, notesSummary: string) => void;
  baseImageSrc: string;
  filterCss?: string;
  ambientOverlay?: string;
}

const PRESET_COLORS = [
  { label: 'Smart Orange', hex: '#f85606' },
  { label: 'Fluorescent Yellow', hex: '#facc15' },
  { label: 'Neon Green', hex: '#10b981' },
  { label: 'Electric Blue', hex: '#06b6d4' },
  { label: 'Hot Crimson', hex: '#ef4444' },
  { label: 'Pure White', hex: '#ffffff' },
  { label: 'Pitch Black', hex: '#1e293b' }
];

const PRESET_QUICK_NOTES = {
  en: [
    'Check this detail! ✨',
    'Love this finish! 🔥',
    'Is this authentic? 🤔',
    'Perfect gift idea! 🎁',
    'Must buy! 💯'
  ],
  bn: [
    'এই অংশটি অসাধারণ! ✨',
    'কালারটা দারুণ! 🔥',
    'অরিজিনাল কোয়ালিটি? 🤔',
    'উপহার দেওয়ার মতো! 🎁',
    'অর্ডার করছি! 💯'
  ]
};

export const ProductAnnotationCanvas: React.FC<ProductAnnotationCanvasProps> = ({
  language,
  containerWidth,
  containerHeight,
  onClose,
  onShareAnnotated,
  baseImageSrc,
  filterCss = 'none',
  ambientOverlay
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'arrow' | 'note' | 'eraser'>('highlighter');
  const [selectedColor, setSelectedColor] = useState<string>('#facc15');
  const [lineWidth, setLineWidth] = useState<number>(10);
  
  // Strokes & Notes state
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [notes, setNotes] = useState<CustomNote[]>([]);
  const [history, setHistory] = useState<{ strokes: DrawStroke[]; notes: CustomNote[] }[]>([]);
  
  // Note creation modal state
  const [editingNote, setEditingNote] = useState<{ x: number; y: number; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<DrawStroke | null>(null);

  // Redraw canvas whenever strokes change or dimensions resize
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2 && stroke.tool !== 'arrow') return;

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'highlighter') {
        ctx.globalAlpha = 0.48;
        ctx.strokeStyle = stroke.color;
        // Make highlighter broad and glowing
        ctx.lineWidth = Math.max(stroke.width, 14);
      } else {
        ctx.globalAlpha = 0.95;
      }

      if (stroke.tool === 'arrow') {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        if (!start || !end) {
          ctx.restore();
          return;
        }
        const sx = start.x * canvas.width;
        const sy = start.y * canvas.height;
        const ex = end.x * canvas.width;
        const ey = end.y * canvas.height;

        // Line
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(ey - sy, ex - sx);
        const headlen = Math.max(14, stroke.width * 2.5);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - headlen * Math.cos(angle - Math.PI / 6), ey - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - headlen * Math.cos(angle + Math.PI / 6), ey - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else {
        const first = stroke.points[0];
        ctx.moveTo(first.x * canvas.width, first.y * canvas.height);
        for (let i = 1; i < stroke.points.length; i++) {
          const pt = stroke.points[i];
          ctx.lineTo(pt.x * canvas.width, pt.y * canvas.height);
        }
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [strokes]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas, containerWidth, containerHeight]);

  // Handle pointer down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const relX = Math.max(0, Math.min(1, clientX / rect.width));
    const relY = Math.max(0, Math.min(1, clientY / rect.height));

    if (activeTool === 'note') {
      // Place a note at this location
      setEditingNote({ x: relX * 100, y: relY * 100, text: '' });
      return;
    }

    if (activeTool === 'eraser') {
      // Erase strokes near this point
      const threshold = 0.05;
      const filtered = strokes.filter((st) => {
        return !st.points.some((p) => Math.hypot(p.x - relX, p.y - relY) < threshold);
      });
      if (filtered.length !== strokes.length) {
        setHistory((prev) => [...prev, { strokes, notes }]);
        setStrokes(filtered);
      }
      return;
    }

    // Begin drawing stroke
    isDrawingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    // Save history for undo
    setHistory((prev) => [...prev, { strokes, notes }]);

    const newStroke: DrawStroke = {
      id: 'stroke-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      tool: activeTool,
      color: selectedColor,
      width: activeTool === 'highlighter' ? Math.max(lineWidth, 16) : lineWidth,
      points: [{ x: relX, y: relY }]
    };

    currentStrokeRef.current = newStroke;
    setStrokes((prev) => [...prev, newStroke]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    if (currentStrokeRef.current.tool === 'arrow') {
      // For arrow, update only the endpoint
      const updated = {
        ...currentStrokeRef.current,
        points: [currentStrokeRef.current.points[0], { x: relX, y: relY }]
      };
      currentStrokeRef.current = updated;
      setStrokes((prev) => [...prev.slice(0, -1), updated]);
    } else {
      // For pen & highlighter, append point
      const updated = {
        ...currentStrokeRef.current,
        points: [...currentStrokeRef.current.points, { x: relX, y: relY }]
      };
      currentStrokeRef.current = updated;
      setStrokes((prev) => [...prev.slice(0, -1), updated]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      currentStrokeRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setStrokes(previous.strokes);
    setNotes(previous.notes);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    if (strokes.length === 0 && notes.length === 0) return;
    setHistory((prev) => [...prev, { strokes, notes }]);
    setStrokes([]);
    setNotes([]);
  };

  // Note management
  const handleSaveNote = (text: string) => {
    if (!editingNote || !text.trim()) {
      setEditingNote(null);
      return;
    }
    setHistory((prev) => [...prev, { strokes, notes }]);
    const newNote: CustomNote = {
      id: 'note-' + Date.now(),
      x: editingNote.x,
      y: editingNote.y,
      text: text.trim(),
      color: selectedColor
    };
    setNotes((prev) => [...prev, newNote]);
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => [...prev, { strokes, notes }]);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Generate high-resolution annotated image composite (Base Product Image + Filters + Annotations + Notes)
  const generateCompositeBlob = async (): Promise<{ blob: Blob; dataUrl: string }> => {
    const exportSize = 1080;
    const offscreen = document.createElement('canvas');
    offscreen.width = exportSize;
    offscreen.height = exportSize;
    const ctx = offscreen.getContext('2d');
    if (!ctx) throw new Error('Could not get offscreen canvas context');

    // 1. Draw base product image
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => {
        // fallback to non-cors or draw placeholder
        resolve();
      };
      img.src = baseImageSrc;
    });

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportSize, exportSize);

    // Apply Filter if present
    if (filterCss && filterCss !== 'none') {
      try {
        ctx.filter = filterCss;
      } catch {
        ctx.filter = 'none';
      }
    }

    try {
      if (img.width && img.height) {
        // Center cover-fit
        const scale = Math.max(exportSize / img.width, exportSize / img.height);
        const x = (exportSize - img.width * scale) / 2;
        const y = (exportSize - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      }
    } catch (e) {
      console.warn('Canvas drawImage error (likely CORS):', e);
    }

    // Reset filter for annotations
    ctx.filter = 'none';

    // 2. Ambient Overlay if present
    if (ambientOverlay) {
      ctx.fillStyle = ambientOverlay.includes('gradient') ? 'rgba(255, 180, 50, 0.1)' : 'transparent';
      ctx.fillRect(0, 0, exportSize, exportSize);
    }

    // 3. Draw All User Strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2 && stroke.tool !== 'arrow') return;

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Scale stroke width to 1080px canvas
      const scaledWidth = (stroke.width / (containerWidth || 400)) * exportSize;

      if (stroke.tool === 'highlighter') {
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = Math.max(scaledWidth, 24);
      } else {
        ctx.globalAlpha = 0.95;
        ctx.lineWidth = Math.max(scaledWidth, 5);
      }

      if (stroke.tool === 'arrow') {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        if (start && end) {
          const sx = start.x * exportSize;
          const sy = start.y * exportSize;
          const ex = end.x * exportSize;
          const ey = end.y * exportSize;

          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();

          const angle = Math.atan2(ey - sy, ex - sx);
          const headlen = Math.max(28, scaledWidth * 3.5);
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - headlen * Math.cos(angle - Math.PI / 6), ey - headlen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - headlen * Math.cos(angle + Math.PI / 6), ey - headlen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
      } else {
        const first = stroke.points[0];
        ctx.moveTo(first.x * exportSize, first.y * exportSize);
        for (let i = 1; i < stroke.points.length; i++) {
          const pt = stroke.points[i];
          ctx.lineTo(pt.x * exportSize, pt.y * exportSize);
        }
        ctx.stroke();
      }

      ctx.restore();
    });

    // 4. Draw Custom Text Notes onto the Composite Image
    notes.forEach((note) => {
      const nx = (note.x / 100) * exportSize;
      const ny = (note.y / 100) * exportSize;

      ctx.save();
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      const textMetrics = ctx.measureText(note.text);
      const textWidth = textMetrics.width;
      const paddingX = 20;
      const paddingY = 14;
      const boxWidth = textWidth + paddingX * 2 + 10;
      const boxHeight = 54;

      // Pin badge dot
      ctx.beginPath();
      ctx.arc(nx, ny, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#f85606';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Note callout bubble
      const bx = Math.min(Math.max(16, nx - 20), exportSize - boxWidth - 16);
      const by = Math.max(20, ny - boxHeight - 14);

      // Bubble shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      // Bubble background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.beginPath();
      // Round rect
      const radius = 12;
      ctx.roundRect(bx, by, boxWidth, boxHeight, radius);
      ctx.fill();

      // Colored left indicator bar
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = note.color || '#f85606';
      ctx.beginPath();
      ctx.roundRect(bx, by, 6, boxHeight, [radius, 0, 0, radius]);
      ctx.fill();

      // Note text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(note.text, bx + paddingX + 4, by + 36);

      ctx.restore();
    });

    // 5. Watermark Badge in bottom corner
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.roundRect(exportSize - 220, exportSize - 52, 204, 38, 10);
    ctx.fill();
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillStyle = '#f85606';
    ctx.fillText('SmartBazaar', exportSize - 206, exportSize - 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('• Studio Note', exportSize - 100, exportSize - 28);
    ctx.restore();

    const dataUrl = offscreen.toDataURL('image/png');
    const blob = await new Promise<Blob>((resolve, reject) => {
      offscreen.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas blob conversion failed'));
      }, 'image/png');
    });

    return { blob, dataUrl };
  };

  // Share action triggered by user
  const handleTriggerShare = async () => {
    setIsExporting(true);
    try {
      const { blob, dataUrl } = await generateCompositeBlob();
      const notesSummary = notes.map((n) => n.text).join(' • ');
      onShareAnnotated(blob, dataUrl, notesSummary);
    } catch (err) {
      console.error('Failed to generate annotated image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Direct download action
  const handleDirectDownload = async () => {
    setIsExporting(true);
    try {
      const { dataUrl } = await generateCompositeBlob();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `smartbazaar-highlight-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      id="product-drawing-overlay"
      className="absolute inset-0 z-35 flex flex-col justify-between pointer-events-auto touch-none select-none"
    >
      {/* Top Bar: Drawing Mode Title, Tools & Close */}
      <div className="p-2 sm:p-3 flex items-center justify-between gap-1.5 bg-black/80 backdrop-blur-md text-white border-b border-white/10 z-40">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#f85606] flex items-center justify-center shadow-xs">
            <Highlighter className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] sm:text-xs font-black tracking-tight">
                {language === 'bn' ? 'ড্রয়িং ও নোট হাইলাইটার' : 'Annotate & Highlight'}
              </span>
              <span className="hidden xs:inline text-[9px] bg-orange-500/30 text-orange-400 border border-orange-500/40 px-1.5 py-0.2 rounded-full font-bold">
                Studio
              </span>
            </div>
          </div>
        </div>

        {/* Undo, Clear & Close */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-gray-200 transition cursor-pointer"
            title={language === 'bn' ? 'পূর্বাবস্থায় ফিরুন (Undo)' : 'Undo last action'}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={strokes.length === 0 && notes.length === 0}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/30 disabled:opacity-30 text-gray-200 hover:text-red-400 transition cursor-pointer"
            title={language === 'bn' ? 'সব মুছুন (Clear All)' : 'Clear all drawings'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition cursor-pointer ml-1"
            title={language === 'bn' ? 'ড্রয়িং মোড বন্ধ করুন' : 'Exit annotation mode'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Drawing Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden cursor-crosshair">
        <canvas
          id="product-drawing-canvas"
          ref={canvasRef}
          width={containerWidth || 500}
          height={containerHeight || 500}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="absolute inset-0 w-full h-full touch-none"
        />

        {/* Render Custom Notes as Interactive Floating Badges */}
        {notes.map((note) => (
          <div
            key={note.id}
            style={{ left: `${note.x}%`, top: `${note.y}%` }}
            className="absolute -translate-x-3 -translate-y-full z-45 group pointer-events-auto cursor-pointer animate-in zoom-in-75 duration-200"
          >
            {/* Note Marker Dot */}
            <div className="w-3 h-3 rounded-full bg-[#f85606] border-2 border-white shadow-md mb-1 relative animate-bounce" />

            {/* Note Bubble Card */}
            <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold py-1.5 px-2.5 rounded-xl shadow-2xl border border-white/20 flex items-center gap-2 max-w-[200px]">
              <span
                className="w-1.5 h-3.5 rounded-full shrink-0"
                style={{ background: note.color }}
              />
              <span className="truncate">{note.text}</span>
              <button
                type="button"
                onClick={(e) => handleDeleteNote(note.id, e)}
                className="opacity-60 hover:opacity-100 text-gray-300 hover:text-red-400 p-0.5 rounded-full hover:bg-white/10 transition"
                title={language === 'bn' ? 'নোট মুছুন' : 'Delete note'}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Note Creator Dialog */}
        {editingNote && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3"
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 w-full max-w-xs shadow-2xl border border-gray-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-[#f85606]" />
                  <span>{language === 'bn' ? 'কাস্টম নোট লিখুন' : 'Add Custom Note'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                id="custom-note-input"
                type="text"
                autoFocus
                placeholder={language === 'bn' ? 'যেমন: এই ফিনিশটা দারুণ! ✨' : 'e.g. Love this detail! 🔥'}
                value={editingNote.text}
                onChange={(e) => setEditingNote({ ...editingNote, text: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNote(editingNote.text);
                }}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-hidden focus:border-[#f85606] mb-2 text-gray-800 dark:text-gray-100"
              />

              {/* Quick Preset Badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {(language === 'bn' ? PRESET_QUICK_NOTES.bn : PRESET_QUICK_NOTES.en).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEditingNote({ ...editingNote, text: preset })}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-950 text-gray-700 dark:text-gray-300 hover:text-[#f85606] transition cursor-pointer border border-transparent hover:border-orange-300"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNote(editingNote.text)}
                  disabled={!editingNote.text.trim()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f85606] hover:bg-orange-600 disabled:opacity-40 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{language === 'bn' ? 'যোগ করুন' : 'Add Note'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Drawing Toolbar */}
      <div className="p-2 sm:p-2.5 bg-black/90 dark:bg-slate-900/95 backdrop-blur-md border-t border-white/10 z-40 flex flex-col gap-2">
        {/* Tools row + Colors + Action Buttons */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          {/* Tool Selector Buttons */}
          <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl">
            {/* Highlighter Tool */}
            <button
              id="draw-tool-highlighter"
              type="button"
              onClick={() => {
                setActiveTool('highlighter');
                setLineWidth(14);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTool === 'highlighter'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
              title={language === 'bn' ? 'হাইলাইটার মার্কার' : 'Highlighter marker'}
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{language === 'bn' ? 'হাইলাইট' : 'Highlight'}</span>
            </button>

            {/* Pen Tool */}
            <button
              id="draw-tool-pen"
              type="button"
              onClick={() => {
                setActiveTool('pen');
                setLineWidth(4);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTool === 'pen'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
              title={language === 'bn' ? 'পেন / মার্কার' : 'Pen / Freehand'}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{language === 'bn' ? 'পেন' : 'Pen'}</span>
            </button>

            {/* Arrow Tool */}
            <button
              id="draw-tool-arrow"
              type="button"
              onClick={() => {
                setActiveTool('arrow');
                setLineWidth(5);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTool === 'arrow'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
              title={language === 'bn' ? 'তীর চিহ্ন নির্দেশক' : 'Directional arrow'}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{language === 'bn' ? 'অ্যারো' : 'Arrow'}</span>
            </button>

            {/* Custom Text Note Tool */}
            <button
              id="draw-tool-note"
              type="button"
              onClick={() => {
                setActiveTool('note');
                // Open note creator right away in center if none exists
                setEditingNote({ x: 50, y: 50, text: '' });
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTool === 'note'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
              title={language === 'bn' ? 'কাস্টম নোট লিখুন' : 'Add custom note'}
            >
              <Type className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{language === 'bn' ? 'নোট' : 'Note'}</span>
            </button>

            {/* Eraser */}
            <button
              id="draw-tool-eraser"
              type="button"
              onClick={() => setActiveTool('eraser')}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTool === 'eraser'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
              title={language === 'bn' ? 'ইরেজার' : 'Eraser'}
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Color Palette Dots */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setSelectedColor(c.hex)}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-transform cursor-pointer border ${
                  selectedColor === c.hex
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110 border-white'
                    : 'border-white/30 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>

          {/* Share Annotated Image & Download Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              id="download-annotated-btn"
              type="button"
              onClick={handleDirectDownload}
              disabled={isExporting}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition cursor-pointer"
              title={language === 'bn' ? 'ছবিটি ডাউনলোড করুন' : 'Download annotated image'}
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              id="share-annotated-btn"
              type="button"
              onClick={handleTriggerShare}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 via-[#f85606] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
              title={language === 'bn' ? 'হাইলাইটসহ সোশ্যাল মিডিয়ায় শেয়ার করুন' : 'Share annotated image on social media'}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>
                {isExporting
                  ? (language === 'bn' ? 'তৈরি হচ্ছে...' : 'Exporting...')
                  : (language === 'bn' ? 'শেয়ার করুন' : 'Share Annotated')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
