import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Plus,
  X,
  Moon,
  Sun,
  Edit3,
  Trash2,
  Calendar,
  Search,
  Archive,
  Star,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  SortAsc,
  SortDesc,
  LogOut,
  User,
  Share2,
  CircleUser,
  Bot,
  Brush,
  Save,
  RotateCcw,
  Eraser,
  ZoomIn,
  ZoomOut,
  Minus,
  ChevronDown,
  Menu,
  RefreshCw,
  Palette,
  PenTool,
  Square,
  Circle as CircleIcon,
  Minus as LineIcon,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Layers,
  Zap,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Hash,
  FileImage,
  File,
  AlertTriangle,
  Folder,
  FolderPlus,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  MoveRight,
  Inbox,
  MoreVertical,
  Pencil,
} from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import AIAgentSidebar from "./AIAgentSidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ── CSS Variables injected globally ─────────────────────────────────────────
const injectGlobalStyles = () => {
  if (document.getElementById("noteflow-styles")) return;
  const style = document.createElement("style");
  style.id = "noteflow-styles";
  style.textContent = `
    :root {
      --bg-primary: #f8fafc;
      --bg-secondary: #ffffff;
      --bg-tertiary: #f1f5f9;
      --bg-hover: #e2e8f0;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-tertiary: #94a3b8;
      --border-color: #e2e8f0;
      --border-hover: #cbd5e1;
      --accent-primary: #6366f1;
      --accent-hover: #4f46e5;
      --accent-light: rgba(99,102,241,0.1);
      --success: #10b981;
      --error: #ef4444;
      --warning: #f59e0b;
      --info: #3b82f6;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
      --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
      --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
      --shadow-xl: 0 20px 60px rgba(0,0,0,0.14);
      --card-hover-shadow: 0 8px 30px rgba(99,102,241,0.15);
    }
    [data-theme="dark"] {
      --bg-primary: #0b0f1a;
      --bg-secondary: #131929;
      --bg-tertiary: #1e2840;
      --bg-hover: #263352;
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-tertiary: #475569;
      --border-color: #1e2840;
      --border-hover: #263352;
      --accent-primary: #818cf8;
      --accent-hover: #6366f1;
      --accent-light: rgba(129,140,248,0.12);
      --card-hover-shadow: 0 8px 30px rgba(129,140,248,0.2);
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(100px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.94) translateY(-10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes shimmer {
      from { background-position: -200% 0; }
      to   { background-position: 200% 0; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    @keyframes bounceIn {
      0%   { transform: scale(0.3); opacity: 0; }
      50%  { transform: scale(1.05); }
      70%  { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-slide-in-right { animation: slideInRight 0.35s cubic-bezier(0.22,1,0.36,1) both; }
    .animate-slide-in-up    { animation: slideInUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
    .animate-scale-in       { animation: scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }
    .animate-fade-in        { animation: fadeIn 0.3s ease both; }
    .animate-bounce-in      { animation: bounceIn 0.5s cubic-bezier(0.68,-0.55,0.27,1.55) both; }
    .skeleton-shimmer {
      background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-hover) 50%, var(--bg-tertiary) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .line-clamp-3 { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
    .scrollbar-thin::-webkit-scrollbar { width: 5px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 999px; }
    .note-card {
      transition: transform 0.22s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.22s cubic-bezier(0.22,1,0.36,1),
                  border-color 0.2s ease;
    }
    .note-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--card-hover-shadow);
    }
    .note-card:active { transform: translateY(-1px); }
    .canvas-cursor-pen { cursor: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMyAyMWwxLjUtNS41TDE4IDIuNWEyIDIgMCAwIDEgMi44MjggMi44MjhMMTMgMTMgMyAyMXoiIGZpbGw9IiM2MzY2ZjEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==') 0 24, crosshair; }
    .canvas-cursor-eraser { cursor: cell; }
    .canvas-cursor-shape { cursor: crosshair; }
    /* Prose / content formatting */
    .note-prose { white-space: pre-wrap; word-break: break-word; }
    .note-prose p { margin: 0.4em 0; }
    .note-prose ul, .note-prose ol { padding-left: 1.5em; margin: 0.4em 0; }
    .note-prose li { margin: 0.2em 0; }
    .note-prose h1,.note-prose h2,.note-prose h3,.note-prose h4 { font-weight:700; margin: 0.6em 0 0.3em; line-height:1.3; }
    .note-prose h1 { font-size:1.4em; }
    .note-prose h2 { font-size:1.2em; }
    .note-prose h3 { font-size:1.05em; }
    .note-prose code {
      background: var(--bg-tertiary);
      padding: 0.15em 0.4em;
      border-radius: 4px;
      font-size: 0.85em;
      font-family: 'Fira Code', 'Cascadia Code', monospace;
      color: #e879f9;
    }
    .note-prose pre {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      padding: 0.9em 1em;
      border-radius: 10px;
      overflow-x: auto;
      margin: 0.5em 0;
    }
    .note-prose pre code {
      background: transparent;
      padding: 0;
      color: var(--text-primary);
    }
    .note-prose blockquote {
      border-left: 3px solid var(--accent-primary);
      padding-left: 0.75em;
      color: var(--text-secondary);
      margin: 0.5em 0;
      font-style: italic;
    }
    .note-prose table { border-collapse: collapse; width: 100%; margin: 0.5em 0; font-size: 0.85em; }
    .note-prose th, .note-prose td { border: 1px solid var(--border-color); padding: 0.35em 0.6em; }
    .note-prose th { background: var(--bg-tertiary); font-weight: 600; }
    .note-prose a { color: var(--accent-primary); text-decoration: underline; }
    .note-prose strong { font-weight: 700; }
    .note-prose em { font-style: italic; }
    .note-prose hr { border: none; border-top: 1px solid var(--border-color); margin: 0.8em 0; }
    @media (max-width: 1023px) {
      .main-content-area { margin-left: 0 !important; }
    }
    @media (max-width: 640px) {
      .mobile-full-modal { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; transform: none !important; width: 100% !important; max-width: 100% !important; max-height: 100% !important; border-radius: 0 !important; overflow-y: auto !important; }
      .canvas-modal-mobile { border-radius: 0 !important; height: 100dvh !important; max-height: 100dvh !important; }
      .canvas-toolbar-mobile { overflow-x: auto !important; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
      .canvas-toolbar-mobile::-webkit-scrollbar { display: none; }
      .canvas-tool-btn-mobile { width: 30px !important; height: 30px !important; }
      .canvas-color-mobile { width: 18px !important; height: 18px !important; }
      .fab-mobile { width: 40px !important; height: 40px !important; border-radius: 14px !important; }
    }
    .folder-sidebar { transition: width 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease; }
    .folder-item { transition: background 0.15s ease, transform 0.15s ease; cursor: pointer; }
    .folder-item:hover { transform: translateX(2px); }
  `;
  document.head.appendChild(style);
};

// ── Primitives ────────────────────────────────────────────────────────────────
const iconBtnCls = `w-10 h-10 border border-transparent rounded-xl flex items-center justify-center cursor-pointer
  transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-hover)] active:translate-y-0`;
const formInputCls = `w-full px-4 py-3 rounded-xl text-sm font-[inherit] transition-all duration-200 outline-none
  focus:border-[var(--accent-primary)] focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_3px_var(--accent-light)]
  disabled:opacity-60 disabled:cursor-not-allowed`;
const formLabelCls = `text-[11px] font-bold uppercase tracking-[0.8px] mb-1`;
const btnPrimary = `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer
  transition-all duration-200 shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed`;
const btnSecondary = `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

// ── Confirmation Modal ────────────────────────────────────────────────────────
const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  confirmColor = "#ef4444",
  onConfirm,
  onCancel,
  icon,
}) => {
  if (!isOpen) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
        onClick={onCancel}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm z-[10000] rounded-2xl animate-scale-in"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `${confirmColor}18` }}
          >
            {icon || (
              <AlertTriangle size={26} style={{ color: confirmColor }} />
            )}
          </div>
          <div>
            <h3
              className="text-base font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {message}
            </p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={onCancel}
              className={btnSecondary + " flex-1 justify-center"}
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={btnPrimary + " flex-1 justify-center"}
              style={{ background: confirmColor }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Attachment Preview Helper ─────────────────────────────────────────────────
const getAttachmentType = (att) => {
  if (!att) return "file";
  const name = (att.name || att.url || "").toLowerCase();
  const mime = (att.mimetype || att.type || "").toLowerCase();
  if (
    mime.startsWith("image/") ||
    /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/.test(name)
  )
    return "image";
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (/\.(doc|docx)$/.test(name)) return "doc";
  if (/\.(xls|xlsx)$/.test(name)) return "excel";
  if (/\.(ppt|pptx)$/.test(name)) return "ppt";
  if (/\.(mp4|webm|mov|avi)$/.test(name)) return "video";
  if (/\.(mp3|wav|ogg|m4a)$/.test(name)) return "audio";
  return "file";
};

const AttachmentIcon = ({ type, size = 16 }) => {
  const icons = {
    pdf: { icon: "📄", color: "#ef4444" },
    doc: { icon: "📝", color: "#3b82f6" },
    excel: { icon: "📊", color: "#10b981" },
    ppt: { icon: "📑", color: "#f97316" },
    video: { icon: "🎬", color: "#8b5cf6" },
    audio: { icon: "🎵", color: "#ec4899" },
    file: { icon: "📎", color: "#64748b" },
  };
  const info = icons[type] || icons.file;
  return <span style={{ fontSize: size }}>{info.icon}</span>;
};

// ── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div
    className="rounded-2xl p-5 border pointer-events-none overflow-hidden relative"
    style={{
      background: "var(--bg-secondary)",
      borderColor: "var(--border-color)",
    }}
  >
    <div className="absolute top-0 left-0 right-0 h-[3px] skeleton-shimmer rounded-t-2xl" />
    <div className="mt-2">
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 w-3/5 rounded-lg skeleton-shimmer" />
        <div className="w-5 h-5 rounded-full skeleton-shimmer" />
      </div>
      <div className="h-3.5 w-1/3 rounded skeleton-shimmer mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-14 rounded-full skeleton-shimmer" />
        <div className="h-5 w-10 rounded-full skeleton-shimmer" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3.5 w-full rounded skeleton-shimmer" />
        <div className="h-3.5 w-4/5 rounded skeleton-shimmer" />
        <div className="h-3.5 w-3/5 rounded skeleton-shimmer" />
      </div>
    </div>
  </div>
);

// ── White Canvas Component ────────────────────────────────────────────────────
const WhiteCanvas = ({
  onClose,
  onSave,
  existingCanvasUrl,
  noteId,
  initialCanvasName,
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#6366f1");
  const [lineWidth, setLineWidth] = useState(3);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);
  const [fillMode, setFillMode] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [canvasTitle, setCanvasTitle] = useState(
    initialCanvasName || "Canvas Drawing",
  );
  const [editingTitle, setEditingTitle] = useState(false);
  // Text overlay input
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState(null); // {x, y} canvas coords for pending text
  const textInputRef = useRef(null);
  // Shape move state
  const [shapes, setShapes] = useState([]); // [{type, x, y, w, h, color, fill, lineWidth, ...}]
  const [selectedShapeIdx, setSelectedShapeIdx] = useState(null);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const lastPos = useRef(null);
  const histRef = useRef({ history: [], step: -1 });

  const COLORS = [
    "#000000",
    "#ffffff",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#06b6d4",
    "#f59e0b",
    "#10b981",
    "#64748b",
    "#1e293b",
  ];

  // Redraw all shapes onto the canvas (over base)
  const redrawShapes = useCallback(
    (ctx, canvas, shapeList) => {
      shapeList.forEach((s, idx) => {
        ctx.save();
        ctx.strokeStyle = s.color;
        ctx.fillStyle = s.color;
        ctx.lineWidth = s.lineWidth || 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (s.type === "rect") {
          ctx.beginPath();
          ctx.rect(s.x, s.y, s.w, s.h);
          s.fill ? ctx.fill() : ctx.stroke();
        } else if (s.type === "circle") {
          ctx.beginPath();
          ctx.ellipse(
            s.x + s.w / 2,
            s.y + s.h / 2,
            Math.abs(s.w / 2),
            Math.abs(s.h / 2),
            0,
            0,
            2 * Math.PI,
          );
          s.fill ? ctx.fill() : ctx.stroke();
        } else if (s.type === "line") {
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + s.w, s.y + s.h);
          ctx.stroke();
        } else if (s.type === "arrow") {
          const angle = Math.atan2(s.h, s.w);
          const headLen = 15;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + s.w, s.y + s.h);
          ctx.lineTo(
            s.x + s.w - headLen * Math.cos(angle - Math.PI / 6),
            s.y + s.h - headLen * Math.sin(angle - Math.PI / 6),
          );
          ctx.moveTo(s.x + s.w, s.y + s.h);
          ctx.lineTo(
            s.x + s.w - headLen * Math.cos(angle + Math.PI / 6),
            s.y + s.h - headLen * Math.sin(angle + Math.PI / 6),
          );
          ctx.stroke();
        } else if (s.type === "triangle") {
          ctx.beginPath();
          ctx.moveTo(s.x + s.w / 2, s.y);
          ctx.lineTo(s.x + s.w, s.y + s.h);
          ctx.lineTo(s.x, s.y + s.h);
          ctx.closePath();
          s.fill ? ctx.fill() : ctx.stroke();
        } else if (s.type === "diamond") {
          ctx.beginPath();
          ctx.moveTo(s.x + s.w / 2, s.y);
          ctx.lineTo(s.x + s.w, s.y + s.h / 2);
          ctx.lineTo(s.x + s.w / 2, s.y + s.h);
          ctx.lineTo(s.x, s.y + s.h / 2);
          ctx.closePath();
          s.fill ? ctx.fill() : ctx.stroke();
        } else if (s.type === "star") {
          const cx = s.x + s.w / 2,
            cy = s.y + s.h / 2;
          const outerR = Math.min(Math.abs(s.w), Math.abs(s.h)) / 2;
          const innerR = outerR * 0.4;
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? outerR : innerR;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          s.fill ? ctx.fill() : ctx.stroke();
        } else if (s.type === "text") {
          ctx.font = `${s.fontSize || 20}px ${s.fontFamily || "Arial"}`;
          ctx.fillStyle = s.color;
          ctx.fillText(s.text || "", s.x, s.y);
        }

        // Selection highlight
        if (idx === selectedShapeIdx) {
          ctx.strokeStyle = "#6366f1";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          const pad = 6;
          const bx =
            s.type === "text" ? s.x - pad : Math.min(s.x, s.x + s.w) - pad;
          const by =
            s.type === "text"
              ? s.y - (s.fontSize || 20) - pad
              : Math.min(s.y, s.y + s.h) - pad;
          const bw =
            s.type === "text"
              ? ctx.measureText(s.text || "").width + pad * 2
              : Math.abs(s.w) + pad * 2;
          const bh =
            s.type === "text"
              ? (s.fontSize || 20) + pad * 2
              : Math.abs(s.h) + pad * 2;
          ctx.strokeRect(bx, by, bw, bh);
          ctx.setLineDash([]);
        }
        ctx.restore();
      });
    },
    [selectedShapeIdx],
  );

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;
    const rect = parent
      ? parent.getBoundingClientRect()
      : { width: 800, height: 500 };
    const w = Math.max(rect.width || 800, 400);
    const h = Math.max(rect.height || 500, 300);
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    if (existingCanvasUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        doSaveHistory(ctx, canvas);
      };
      img.onerror = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        doSaveHistory(ctx, canvas);
      };
      img.src = existingCanvasUrl;
    } else {
      doSaveHistory(ctx, canvas);
    }
  }, [existingCanvasUrl]);

  useEffect(() => {
    const timeout = setTimeout(initCanvas, 50);
    return () => clearTimeout(timeout);
  }, [initCanvas]);

  // Keyboard shortcuts inside canvas modal
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        e.preventDefault();
        redo();
      } else if (e.key === "Escape") {
        if (textPos) {
          setTextPos(null);
          setTextInput("");
        } else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [textPos, onClose]); // undo/redo are stable refs so omitting them is safe

  const doSaveHistory = (ctx, canvas) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    histRef.current.history = [
      ...histRef.current.history.slice(0, histRef.current.step + 1),
      imageData,
    ];
    histRef.current.step = histRef.current.history.length - 1;
    setHistory([...histRef.current.history]);
    setHistoryStep(histRef.current.step);
  };

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    doSaveHistory(ctx, canvas);
  };

  const undo = () => {
    if (histRef.current.step <= 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    histRef.current.step -= 1;
    setHistoryStep(histRef.current.step);
    ctx.putImageData(histRef.current.history[histRef.current.step], 0, 0);
    // Remove last committed shape if any
    setShapes((prev) => (prev.length > 0 ? prev.slice(0, -1) : []));
    setSelectedShapeIdx(null);
  };

  const redo = () => {
    if (histRef.current.step >= histRef.current.history.length - 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    histRef.current.step += 1;
    setHistoryStep(histRef.current.step);
    ctx.putImageData(histRef.current.history[histRef.current.step], 0, 0);
    setSelectedShapeIdx(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setShapes([]);
    setSelectedShapeIdx(null);
    setTextPos(null);
    setTextInput("");
    saveHistory();
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Hit-test a shape
  const hitTestShape = (s, px, py) => {
    if (s.type === "text") {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.font = `${s.fontSize || 20}px ${s.fontFamily || "Arial"}`;
      const tw = ctx.measureText(s.text || "").width;
      return (
        px >= s.x - 6 &&
        px <= s.x + tw + 6 &&
        py >= s.y - (s.fontSize || 20) - 6 &&
        py <= s.y + 6
      );
    }
    const minX = Math.min(s.x, s.x + s.w) - 6;
    const maxX = Math.max(s.x, s.x + s.w) + 6;
    const minY = Math.min(s.y, s.y + s.h) - 6;
    const maxY = Math.max(s.y, s.y + s.h) + 6;
    return px >= minX && px <= maxX && py >= minY && py <= maxY;
  };

  // Redraw canvas with all shapes after state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || histRef.current.step < 0) return;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(histRef.current.history[histRef.current.step], 0, 0);
    redrawShapes(ctx, canvas, shapes);
  }, [shapes, selectedShapeIdx, redrawShapes]);

  const isShapeTool = (t) =>
    ["rect", "circle", "line", "arrow", "triangle", "diamond", "star"].includes(
      t,
    );

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);

    // Text tool: place text input overlay
    if (tool === "text") {
      setTextPos(pos);
      setTextInput("");
      setTimeout(() => textInputRef.current?.focus(), 50);
      return;
    }

    // Move tool: check hit
    if (tool === "move") {
      for (let i = shapes.length - 1; i >= 0; i--) {
        if (hitTestShape(shapes[i], pos.x, pos.y)) {
          setSelectedShapeIdx(i);
          setDragOffset({ dx: pos.x - shapes[i].x, dy: pos.y - shapes[i].y });
          setIsDraggingShape(true);
          return;
        }
      }
      setSelectedShapeIdx(null);
      return;
    }

    setIsDrawing(true);
    setStartPos(pos);
    lastPos.current = pos;
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (tool === "pen" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);

    // Dragging a shape
    if (isDraggingShape && selectedShapeIdx !== null) {
      setShapes((prev) => {
        const next = [...prev];
        const s = { ...next[selectedShapeIdx] };
        s.x = pos.x - dragOffset.dx;
        s.y = pos.y - dragOffset.dy;
        next[selectedShapeIdx] = s;
        return next;
      });
      return;
    }

    if (!isDrawing) return;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 5 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "pen" || tool === "eraser") {
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos.current = pos;
    } else if (snapshot && isShapeTool(tool)) {
      // Live preview: restore base + draw all committed shapes + preview new shape
      ctx.putImageData(snapshot, 0, 0);
      redrawShapes(ctx, canvas, shapes);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      const w = pos.x - startPos.x;
      const h = pos.y - startPos.y;
      if (tool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === "rect") {
        fillMode
          ? ctx.fillRect(startPos.x, startPos.y, w, h)
          : ctx.strokeRect(startPos.x, startPos.y, w, h);
      } else if (tool === "circle") {
        ctx.ellipse(
          startPos.x + w / 2,
          startPos.y + h / 2,
          Math.abs(w / 2),
          Math.abs(h / 2),
          0,
          0,
          2 * Math.PI,
        );
        fillMode ? ctx.fill() : ctx.stroke();
      } else if (tool === "arrow") {
        const angle = Math.atan2(h, w);
        const headLen = 15;
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.lineTo(
          pos.x - headLen * Math.cos(angle - Math.PI / 6),
          pos.y - headLen * Math.sin(angle - Math.PI / 6),
        );
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(
          pos.x - headLen * Math.cos(angle + Math.PI / 6),
          pos.y - headLen * Math.sin(angle + Math.PI / 6),
        );
        ctx.stroke();
      } else if (tool === "triangle") {
        ctx.moveTo(startPos.x + w / 2, startPos.y);
        ctx.lineTo(startPos.x + w, startPos.y + h);
        ctx.lineTo(startPos.x, startPos.y + h);
        ctx.closePath();
        fillMode ? ctx.fill() : ctx.stroke();
      } else if (tool === "diamond") {
        ctx.moveTo(startPos.x + w / 2, startPos.y);
        ctx.lineTo(startPos.x + w, startPos.y + h / 2);
        ctx.lineTo(startPos.x + w / 2, startPos.y + h);
        ctx.lineTo(startPos.x, startPos.y + h / 2);
        ctx.closePath();
        fillMode ? ctx.fill() : ctx.stroke();
      } else if (tool === "star") {
        const cx = startPos.x + w / 2,
          cy = startPos.y + h / 2;
        const outerR = Math.min(Math.abs(w), Math.abs(h)) / 2;
        const innerR = outerR * 0.4;
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        fillMode ? ctx.fill() : ctx.stroke();
      }
    }
  };

  const endDraw = (e) => {
    if (isDraggingShape) {
      setIsDraggingShape(false);
      // Flatten shapes onto canvas and save history
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      // Keep shapes in overlay — just save the composite
      saveHistory();
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (isShapeTool(tool) && snapshot) {
      const canvas = canvasRef.current;
      const pos = e.touches
        ? getPos({ touches: e.changedTouches }, canvas)
        : getPos(e, canvas);
      const w = pos.x - startPos.x;
      const h = pos.y - startPos.y;
      // Add shape to shape list
      setShapes((prev) => [
        ...prev,
        {
          type: tool,
          x: startPos.x,
          y: startPos.y,
          w,
          h,
          color,
          fill: fillMode,
          lineWidth,
        },
      ]);
    }

    setSnapshot(null);
    if (!isShapeTool(tool)) saveHistory();
  };

  // Commit text to canvas
  const commitText = () => {
    if (!textPos || !textInput.trim()) {
      setTextPos(null);
      setTextInput("");
      return;
    }
    setShapes((prev) => [
      ...prev,
      {
        type: "text",
        x: textPos.x,
        y: textPos.y,
        w: 0,
        h: 0,
        color,
        text: textInput,
        fontSize,
        fontFamily,
      },
    ]);
    setTextPos(null);
    setTextInput("");
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    // Restore base pixel data then flatten all shapes on top
    if (histRef.current.step >= 0) {
      ctx.putImageData(histRef.current.history[histRef.current.step], 0, 0);
    }
    redrawShapes(ctx, canvas, shapes);
    setSaving(true);
    try {
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Canvas toBlob returned null"));
        }, "image/png");
      });
      await onSave(blob, canvasTitle);
    } catch (err) {
      console.error("Canvas save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (histRef.current.step >= 0) {
      ctx.putImageData(histRef.current.history[histRef.current.step], 0, 0);
    }
    redrawShapes(ctx, canvas, shapes);
    const link = document.createElement("a");
    link.download = "canvas-drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const getCursorClass = () => {
    if (tool === "eraser") return "canvas-cursor-eraser";
    if (tool === "pen") return "canvas-cursor-pen";
    if (tool === "move") return "cursor-grab";
    if (tool === "text") return "cursor-text";
    return "canvas-cursor-shape";
  };

  const tools = [
    { id: "pen", icon: <PenTool size={15} />, label: "Pen" },
    { id: "eraser", icon: <Eraser size={15} />, label: "Eraser" },
    {
      id: "text",
      icon: <span className="text-xs font-bold">T</span>,
      label: "Text",
    },
    { id: "line", icon: <LineIcon size={15} />, label: "Line" },
    { id: "rect", icon: <Square size={15} />, label: "Rectangle" },
    { id: "circle", icon: <CircleIcon size={15} />, label: "Circle" },
    {
      id: "triangle",
      icon: <span className="text-xs font-bold">△</span>,
      label: "Triangle",
    },
    {
      id: "diamond",
      icon: <span className="text-xs font-bold">◇</span>,
      label: "Diamond",
    },
    {
      id: "star",
      icon: <span className="text-xs font-bold">★</span>,
      label: "Star",
    },
    {
      id: "arrow",
      icon: <span className="text-sm font-bold">→</span>,
      label: "Arrow",
    },
    {
      id: "move",
      icon: <span className="text-xs font-bold">✥</span>,
      label: "Move Shape",
    },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-fade-in">
      <div
        className="flex flex-col w-full max-w-6xl animate-scale-in canvas-modal-mobile"
        style={{
          height: "min(95dvh, 720px)",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "0px",
          boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
        }}
      >
        {/* On sm+ screens, restore rounded corners */}
        <style>{`@media(min-width:640px){.canvas-inner{border-radius:20px!important;}}`}</style>
        <div
          className="canvas-inner flex flex-col w-full h-full overflow-hidden"
          style={{ borderRadius: "0px", background: "var(--bg-secondary)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b shrink-0"
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                }}
              >
                <Brush size={15} />
              </div>
              <div className="min-w-0">
                {editingTitle ? (
                  <input
                    autoFocus
                    value={canvasTitle}
                    onChange={(e) => setCanvasTitle(e.target.value)}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Escape")
                        setEditingTitle(false);
                    }}
                    className="font-bold text-base outline-none border-b-2 bg-transparent"
                    style={{
                      color: "var(--text-primary)",
                      borderColor: "var(--accent-primary)",
                      minWidth: 140,
                    }}
                    maxLength={60}
                  />
                ) : (
                  <button
                    onClick={() => setEditingTitle(true)}
                    className="flex items-center gap-1.5 group border-none bg-transparent cursor-pointer p-0"
                    title="Click to rename"
                  >
                    <h3
                      className="font-bold text-base"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {canvasTitle}
                    </h3>
                    <Pencil
                      size={12}
                      className="opacity-0 group-hover:opacity-60 transition-opacity"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                  </button>
                )}
                <p
                  className="text-xs hidden sm:block"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {noteId ? "Editing canvas drawing" : "New canvas drawing"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadCanvas}
                title="Download PNG"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-[var(--bg-hover)]"
                style={{
                  color: "var(--text-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <Download size={13} /> PNG
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                }}
              >
                <Save size={14} />
                <span>{saving ? "Saving..." : "Save"}</span>
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-500"
                style={{
                  color: "var(--text-secondary)",
                  background: "var(--bg-tertiary)",
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div
            className="canvas-toolbar-mobile flex items-center gap-2 px-3 sm:px-4 py-2 border-b shrink-0 overflow-x-auto"
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-tertiary)",
            }}
          >
            <div
              className="flex items-center gap-0.5 p-1 rounded-xl shrink-0 flex-wrap"
              style={{ background: "var(--bg-hover)" }}
            >
              {tools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  title={t.label}
                  className="canvas-tool-btn-mobile w-8 h-8 rounded-lg flex items-center justify-center transition-all text-xs shrink-0"
                  style={{
                    background:
                      tool === t.id ? "var(--accent-primary)" : "transparent",
                    color: tool === t.id ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {t.icon}
                </button>
              ))}
            </div>

            {(tool === "rect" ||
              tool === "circle" ||
              tool === "triangle" ||
              tool === "diamond" ||
              tool === "star") && (
              <button
                onClick={() => setFillMode(!fillMode)}
                title="Toggle fill"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0"
                style={{
                  background: fillMode
                    ? "var(--accent-primary)"
                    : "var(--bg-secondary)",
                  color: fillMode ? "#fff" : "var(--text-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                Fill
              </button>
            )}

            {tool === "text" && (
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg border"
                  style={{
                    background: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  {[
                    "Arial",
                    "Georgia",
                    "Courier New",
                    "Verdana",
                    "Times New Roman",
                    "Comic Sans MS",
                  ].map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="8"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(+e.target.value)}
                  className="w-14 text-xs px-2 py-1 rounded-lg border"
                  style={{
                    background: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            )}

            <div
              className="w-px h-6 shrink-0"
              style={{ background: "var(--border-color)" }}
            />

            {tool !== "text" && (
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="text-xs font-medium shrink-0"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {tool === "eraser" ? "Erase:" : "Size:"}
                </span>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(+e.target.value)}
                  className="w-20 sm:w-24 cursor-pointer"
                  style={{ accentColor: "var(--accent-primary)" }}
                />
                <span
                  className="text-xs font-bold w-5 text-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {lineWidth}
                </span>
              </div>
            )}

            <div
              className="w-px h-6 shrink-0"
              style={{ background: "var(--border-color)" }}
            />

            <div className="flex items-center gap-1 flex-nowrap shrink-0">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  title={c}
                  className="canvas-color-mobile w-5 h-5 rounded-full transition-all hover:scale-110 shrink-0"
                  style={{
                    background: c,
                    border:
                      color === c
                        ? "2px solid var(--accent-primary)"
                        : "2px solid transparent",
                    boxShadow:
                      c === "#ffffff"
                        ? "0 0 0 1px var(--border-color)"
                        : color === c
                          ? "0 0 0 2px var(--accent-light)"
                          : "0 1px 3px rgba(0,0,0,0.15)",
                  }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                title="Custom color"
                className="canvas-color-mobile w-5 h-5 rounded-full cursor-pointer overflow-hidden shrink-0"
                style={{ border: "2px solid var(--border-color)", padding: 0 }}
              />
            </div>

            <div className="flex items-center gap-1 ml-auto shrink-0">
              <button
                onClick={undo}
                title="Undo (Ctrl+Z)"
                disabled={historyStep <= 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all hover:bg-[var(--bg-hover)]"
                style={{ color: "var(--text-secondary)" }}
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={redo}
                title="Redo"
                disabled={historyStep >= histRef.current.history.length - 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all hover:bg-[var(--bg-hover)]"
                style={{ color: "var(--text-secondary)" }}
              >
                <RotateCcw size={15} style={{ transform: "scaleX(-1)" }} />
              </button>
              <button
                onClick={clearCanvas}
                title="Clear canvas"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-100 hover:text-red-500"
                style={{ color: "var(--text-secondary)" }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Canvas area */}
          <div
            className="flex-1 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #f8f8ff 0%, #f0f0f8 100%)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full touch-none ${getCursorClass()}`}
              style={{ background: "transparent" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={(e) => {
                // Only end freehand drawing on mouse leave, not shapes (shapes need mouseUp)
                if (isDrawing && (tool === "pen" || tool === "eraser")) {
                  endDraw(e);
                }
                if (isDraggingShape) {
                  setIsDraggingShape(false);
                }
              }}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />

            {/* Text input overlay */}
            {textPos && (
              <div
                className="absolute"
                style={{
                  left: `${(textPos.x / (canvasRef.current?.width || 800)) * 100}%`,
                  top: `${(textPos.y / (canvasRef.current?.height || 500)) * 100}%`,
                  transform: "translate(0, -100%)",
                  zIndex: 100,
                }}
              >
                <input
                  ref={textInputRef}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitText();
                    if (e.key === "Escape") {
                      setTextPos(null);
                      setTextInput("");
                    }
                  }}
                  onBlur={commitText}
                  placeholder="Type here…"
                  className="outline-none border-b-2 bg-transparent px-1"
                  style={{
                    color,
                    fontSize: `${fontSize}px`,
                    fontFamily,
                    borderColor: "#6366f1",
                    minWidth: "80px",
                  }}
                />
              </div>
            )}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-medium"
                style={{
                  background: "rgba(0,0,0,0.08)",
                  color: "var(--text-tertiary)",
                }}
              >
                {tool === "eraser"
                  ? "Click and drag to erase"
                  : tool === "pen"
                    ? "Click and drag to draw"
                    : tool === "text"
                      ? "Click to place text, Enter to confirm"
                      : tool === "move"
                        ? "Click a shape to select, then drag to move"
                        : `Click and drag to draw ${tool}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Note Card Component ───────────────────────────────────────────────────────
const NoteCard = ({
  note,
  isExpanded,
  isHovered,
  onExpand,
  onHover,
  onLeave,
  onEdit,
  onDelete,
  onStar,
  onArchive,
  onCopy,
  onShare,
  onDownload,
  onCanvas,
  onView,
  onMove,
  getFullUrl,
  formatDate,
  getPriorityColor,
  deletingId,
}) => {
  const priorityGrad = {
    high: "linear-gradient(135deg, #ef4444, #dc2626)",
    medium: "linear-gradient(135deg, #f59e0b, #d97706)",
    low: "linear-gradient(135deg, #10b981, #059669)",
  };

  // Separate attachments by type
  const imageAttachments = (note.attachments || []).filter(
    (a) => getAttachmentType(a) === "image",
  );
  const nonImageAttachments = (note.attachments || []).filter(
    (a) => getAttachmentType(a) !== "image",
  );

  return (
    <div
      className="note-card rounded-2xl border flex flex-col relative overflow-hidden"
      style={{
        background: "var(--bg-secondary)",
        borderColor: isExpanded
          ? "var(--accent-primary)"
          : "var(--border-color)",
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Priority stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{
          background: priorityGrad[note.priority] || priorityGrad.medium,
        }}
      />

      <div className="px-4 sm:px-5 pt-5 pb-3 flex-1 flex flex-col gap-2.5">
        {/* Header row */}
        <div className="flex items-start gap-2">
          <h3
            className="font-bold text-sm sm:text-base leading-snug flex-1 min-w-0 break-words line-clamp-2"
            style={{ color: "var(--text-primary)" }}
          >
            {note.title || (
              <span
                style={{ color: "var(--text-tertiary)", fontStyle: "italic" }}
              >
                Untitled
              </span>
            )}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStar(note);
            }}
            className="shrink-0 p-1 rounded-lg transition-all hover:scale-125 border-none bg-transparent cursor-pointer"
            style={{ color: note.starred ? "#f59e0b" : "var(--text-tertiary)" }}
          >
            <Star
              size={15}
              fill={note.starred ? "#f59e0b" : "none"}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {note.createdAt && (
            <span
              className="flex items-center gap-1 text-[11px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              <Calendar size={10} />
              {formatDate(note.createdAt)}
            </span>
          )}
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize"
            style={{
              background: `${getPriorityColor(note.priority)}18`,
              color: getPriorityColor(note.priority),
            }}
          >
            {note.priority}
          </span>
          {note.archived && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-tertiary)",
              }}
            >
              <Archive size={9} /> archived
            </span>
          )}
          {(note.canvases?.length > 0 || note.canvasImage) && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5"
              style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}
            >
              <Brush size={9} />{" "}
              {note.canvases?.length > 0 ? note.canvases.length : 1} canvas
              {(note.canvases?.length || 1) > 1 ? "es" : ""}
            </span>
          )}
          {imageAttachments.length > 0 && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
            >
              <FileImage size={9} /> {imageAttachments.length} image
              {imageAttachments.length > 1 ? "s" : ""}
            </span>
          )}
          {nonImageAttachments.length > 0 && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-tertiary)",
              }}
            >
              📎 {nonImageAttachments.length} file
              {nonImageAttachments.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, isExpanded ? 10 : 3).map((tag, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center gap-0.5"
                style={{
                  background: "var(--accent-light)",
                  color: "var(--accent-primary)",
                }}
              >
                <Hash size={9} />
                {tag}
              </span>
            ))}
            {!isExpanded && note.tags.length > 3 && (
              <span
                className="text-[11px] px-2 py-0.5 rounded-md"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-tertiary)",
                }}
              >
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Canvas previews (multiple) */}
        {(note.canvases?.length > 0 || note.canvasImage) &&
          (() => {
            const canvasList =
              note.canvases?.length > 0
                ? note.canvases
                : [
                    {
                      url: note.canvasImage,
                      name: note.canvasName || "Canvas Drawing",
                    },
                  ];
            return (
              <div className="flex flex-col gap-1.5">
                {canvasList
                  .slice(0, isExpanded ? canvasList.length : 2)
                  .map((cv, ci) => (
                    <div
                      key={ci}
                      className="rounded-xl overflow-hidden border"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      {canvasList.length > 1 && (
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1"
                          style={{
                            background: "var(--bg-tertiary)",
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          <Brush size={9} style={{ color: "#6366f1" }} />
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: "#6366f1" }}
                          >
                            {cv.name || `Canvas ${ci + 1}`}
                          </span>
                        </div>
                      )}
                      <img
                        src={getFullUrl(cv.url)}
                        alt={cv.name || `Canvas ${ci + 1}`}
                        className={`w-full object-cover transition-all duration-300 ${isExpanded ? "max-h-64" : "max-h-28"}`}
                        style={{ background: "#fff" }}
                      />
                    </div>
                  ))}
                {!isExpanded && canvasList.length > 2 && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-md self-start"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    +{canvasList.length - 2} more canvas
                    {canvasList.length - 2 > 1 ? "es" : ""}
                  </span>
                )}
              </div>
            );
          })()}

        {/* ── Image attachments preview (always visible) ── */}
        {imageAttachments.length > 0 && (
          <div
            className={`grid gap-1.5 ${imageAttachments.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
          >
            {imageAttachments
              .slice(0, isExpanded ? imageAttachments.length : 4)
              .map((att, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden border"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <img
                    src={getFullUrl(att.url)}
                    alt={att.name || `Image ${i + 1}`}
                    className={`w-full object-cover transition-all duration-300 ${imageAttachments.length === 1 ? (isExpanded ? "max-h-56" : "max-h-40") : isExpanded ? "h-32" : "h-24"}`}
                    style={{ background: "var(--bg-tertiary)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(getFullUrl(att.url), "_blank");
                    }}
                  />
                  {!isExpanded && imageAttachments.length > 4 && i === 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                      <span className="text-white font-bold text-sm">
                        +{imageAttachments.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* ── Non-image attachment previews (always visible) ── */}
        {nonImageAttachments.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {nonImageAttachments
              .slice(0, isExpanded ? nonImageAttachments.length : 3)
              .map((att, i) => {
                const atype = getAttachmentType(att);
                const typeLabels = {
                  pdf: "PDF",
                  doc: "Word",
                  excel: "Excel",
                  ppt: "PowerPoint",
                  video: "Video",
                  audio: "Audio",
                  file: "File",
                };
                const typeColors = {
                  pdf: "#ef4444",
                  doc: "#3b82f6",
                  excel: "#10b981",
                  ppt: "#f97316",
                  video: "#8b5cf6",
                  audio: "#ec4899",
                  file: "#64748b",
                };
                return (
                  <a
                    key={i}
                    href={getFullUrl(att.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all hover:bg-[var(--bg-hover)] group"
                    style={{
                      background: "var(--bg-tertiary)",
                      borderColor: "var(--border-color)",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                      style={{ background: `${typeColors[atype]}15` }}
                    >
                      <AttachmentIcon type={atype} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {att.name || `File ${i + 1}`}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {typeLabels[atype] || "File"}
                      </p>
                    </div>
                    <Download
                      size={13}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                  </a>
                );
              })}
            {!isExpanded && nonImageAttachments.length > 3 && (
              <p
                className="text-[11px] text-center"
                style={{ color: "var(--text-tertiary)" }}
              >
                +{nonImageAttachments.length - 3} more files
              </p>
            )}
          </div>
        )}

        {/* Description */}
        <div className="flex-1">
          {isExpanded ? (
            <div
              className="note-prose text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {note.description || ""}
              </ReactMarkdown>
            </div>
          ) : (
            <p
              className="text-sm leading-relaxed line-clamp-3"
              style={{
                color: "var(--text-secondary)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {note.description}
            </p>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div
        className={`px-3 sm:px-5 py-2.5 border-t flex items-center gap-0.5 flex-wrap`}
        style={{ borderColor: "var(--border-color)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {[
          {
            icon: <Eye size={12} />,
            label: "View",
            action: () => onView(note),
            color: "var(--accent-primary)",
          },
          {
            icon: <Edit3 size={12} />,
            label: "Edit",
            action: () => onEdit(note),
            color: "var(--text-secondary)",
          },
          {
            icon: <Copy size={12} />,
            label: "Copy",
            action: () => onCopy(note),
            color: "var(--text-secondary)",
          },
          {
            icon: <Share2 size={12} />,
            label: "Share",
            action: () => onShare(note),
            color: "var(--text-secondary)",
          },
          {
            icon: <Download size={12} />,
            label: "Download",
            action: () => onDownload(note),
            color: "var(--text-secondary)",
          },
          {
            icon: <Archive size={12} />,
            label: note.archived ? "Restore" : "Archive",
            action: () => onArchive(note),
            color: "var(--text-secondary)",
          },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all border-none cursor-pointer hover:bg-[var(--bg-hover)]"
            style={{ color: btn.color, background: "transparent" }}
          >
            {btn.icon}
            <span className="hidden sm:inline">{btn.label}</span>
          </button>
        ))}
        <button
          onClick={() => onCanvas(note)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border-none cursor-pointer"
          style={{ color: "#6366f1", background: "rgba(99,102,241,0.08)" }}
        >
          <Brush size={12} />
          <span className="hidden sm:inline">+ Canvas</span>
        </button>
        <button
          onClick={() => onMove(note)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border-none cursor-pointer"
          style={{ color: "#10b981", background: "rgba(16,185,129,0.08)" }}
        >
          <MoveRight size={12} />
          <span className="hidden sm:inline">Move</span>
        </button>
        <button
          onClick={() => onDelete(note._id)}
          disabled={deletingId === note._id}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all border-none cursor-pointer ml-auto hover:bg-red-50 disabled:opacity-50"
          style={{ color: "#ef4444", background: "transparent" }}
        >
          <Trash2 size={12} />
          <span className="hidden sm:inline">
            {deletingId === note._id ? "..." : "Delete"}
          </span>
        </button>
      </div>
    </div>
  );
};

// ── Rich Text Editor Toolbar ──────────────────────────────────────────────────
const RichTextEditor = ({ value, onChange, placeholder, minHeight = 160 }) => {
  const textareaRef = React.useRef(null);

  const insertAround = (before, after = before) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = value.substring(start, end);
    const newVal =
      value.substring(0, start) + before + sel + after + value.substring(end);
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(
        start + before.length,
        start + before.length + sel.length,
      );
    }, 0);
  };

  const insertLinePrefix = (prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const currentLine = value.substring(lineStart, start);
    const hasPrefix = currentLine.startsWith(prefix);
    let newVal;
    if (hasPrefix) {
      newVal =
        value.substring(0, lineStart) +
        currentLine.substring(prefix.length) +
        value.substring(lineStart + currentLine.length);
    } else {
      newVal =
        value.substring(0, lineStart) + prefix + value.substring(lineStart);
    }
    onChange(newVal);
    setTimeout(() => ta.focus(), 0);
  };

  const toolbarBtnCls =
    "flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold cursor-pointer transition-all hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border-hover)] select-none";

  const ToolBtn = ({ label, title, action, style: s }) => (
    <button
      type="button"
      title={title}
      onClick={action}
      className={toolbarBtnCls}
      style={{ color: "var(--text-secondary)", ...(s || {}) }}
    >
      {label}
    </button>
  );

  const Divider = () => (
    <div
      className="w-px h-5 mx-0.5 shrink-0"
      style={{ background: "var(--border-color)" }}
    />
  );

  return (
    <div
      className="flex flex-col rounded-xl border overflow-hidden transition-all duration-200 focus-within:border-[var(--accent-primary)] focus-within:shadow-[0_0_0_3px_var(--accent-light)]"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 border-b flex-wrap"
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-tertiary)",
        }}
      >
        {/* Headings */}
        <ToolBtn
          label="H1"
          title="Heading 1"
          action={() => insertLinePrefix("# ")}
        />
        <ToolBtn
          label="H2"
          title="Heading 2"
          action={() => insertLinePrefix("## ")}
        />
        <ToolBtn
          label="H3"
          title="Heading 3"
          action={() => insertLinePrefix("### ")}
        />
        <Divider />
        {/* Inline */}
        <ToolBtn
          label={<span style={{ fontWeight: 900 }}>B</span>}
          title="Bold"
          action={() => insertAround("**")}
        />
        <ToolBtn
          label={<span style={{ fontStyle: "italic" }}>I</span>}
          title="Italic"
          action={() => insertAround("*")}
        />
        <ToolBtn
          label={<span style={{ textDecoration: "underline" }}>U</span>}
          title="Underline"
          action={() => insertAround("<u>", "</u>")}
        />
        <ToolBtn
          label={<span style={{ textDecoration: "line-through" }}>S</span>}
          title="Strikethrough"
          action={() => insertAround("~~")}
        />
        <Divider />
        {/* Lists */}
        <ToolBtn
          label="• –"
          title="Bullet list"
          action={() => insertLinePrefix("- ")}
        />
        <ToolBtn
          label="1."
          title="Numbered list"
          action={() => insertLinePrefix("1. ")}
        />
        <ToolBtn
          label="☑"
          title="Task list"
          action={() => insertLinePrefix("- [ ] ")}
        />
        <Divider />
        {/* Block */}
        <ToolBtn
          label="❝"
          title="Blockquote"
          action={() => insertLinePrefix("> ")}
        />
        <ToolBtn
          label="{}"
          title="Code block"
          action={() => insertAround("\n```\n", "\n```\n")}
        />
        <ToolBtn
          label="`"
          title="Inline code"
          action={() => insertAround("`")}
        />
        <Divider />
        {/* Special */}
        <ToolBtn
          label="—"
          title="Horizontal rule"
          action={() => {
            const ta = textareaRef.current;
            if (!ta) return;
            const s = ta.selectionStart;
            const newVal =
              value.substring(0, s) + "\n---\n" + value.substring(s);
            onChange(newVal);
            setTimeout(() => {
              ta.focus();
              ta.setSelectionRange(s + 5, s + 5);
            }, 0);
          }}
        />
        <ToolBtn
          label="🔗"
          title="Link"
          action={() => {
            const ta = textareaRef.current;
            if (!ta) return;
            const s = ta.selectionStart;
            const e = ta.selectionEnd;
            const sel = value.substring(s, e) || "link text";
            const newVal =
              value.substring(0, s) + `[${sel}](url)` + value.substring(e);
            onChange(newVal);
            setTimeout(() => ta.focus(), 0);
          }}
        />
      </div>
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        className="w-full px-4 py-3 text-sm font-[inherit] outline-none resize-y leading-relaxed bg-transparent"
        style={{
          color: "var(--text-primary)",
          minHeight,
          fontFamily: "inherit",
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Allow all standard keyboard shortcuts within the textarea
          if (e.ctrlKey || e.metaKey) {
            e.stopPropagation();
          }
        }}
        rows={6}
      />
      <div
        className="px-3 py-1.5 text-[10px] border-t"
        style={{
          color: "var(--text-tertiary)",
          borderColor: "var(--border-color)",
          background: "var(--bg-tertiary)",
        }}
      >
        Supports <strong>Markdown</strong>: **bold**, *italic*, # Heading, -
        list, {">"} quote, ```code```
      </div>
    </div>
  );
};

// ── View Note Modal ───────────────────────────────────────────────────────────
const ViewNoteModal = ({
  note,
  onClose,
  getFullUrl,
  formatDate,
  getPriorityColor,
  onEdit,
  onDelete,
  onCanvas,
  deletingId,
}) => {
  if (!note) return null;
  const priorityGrad = {
    high: "linear-gradient(135deg, #ef4444, #dc2626)",
    medium: "linear-gradient(135deg, #f59e0b, #d97706)",
    low: "linear-gradient(135deg, #10b981, #059669)",
  };
  const imageAttachments = (note.attachments || []).filter(
    (a) => getAttachmentType(a) === "image",
  );
  const nonImageAttachments = (note.attachments || []).filter(
    (a) => getAttachmentType(a) !== "image",
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990]"
        onClick={onClose}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] max-w-[720px] z-[9995] rounded-2xl animate-scale-in"
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <div
          className="flex flex-col rounded-2xl border shadow-[var(--shadow-xl)] overflow-hidden"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            maxHeight: "90vh",
          }}
        >
          {/* Priority stripe */}
          <div
            className="h-[4px] shrink-0"
            style={{
              background: priorityGrad[note.priority] || priorityGrad.medium,
            }}
          />

          {/* Header */}
          <div
            className="px-5 sm:px-7 py-5 border-b flex items-start gap-4 shrink-0"
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-secondary)",
            }}
          >
            <div className="flex-1 min-w-0">
              <h2
                className="text-xl sm:text-2xl font-bold leading-snug break-words"
                style={{ color: "var(--text-primary)" }}
              >
                {note.title || (
                  <span
                    style={{
                      color: "var(--text-tertiary)",
                      fontStyle: "italic",
                    }}
                  >
                    Untitled
                  </span>
                )}
              </h2>
              <div className="flex items-center flex-wrap gap-2 mt-2">
                {note.createdAt && (
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <Calendar size={11} /> {formatDate(note.createdAt)}
                  </span>
                )}
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                  style={{
                    background: `${getPriorityColor(note.priority)}18`,
                    color: getPriorityColor(note.priority),
                  }}
                >
                  {note.priority}
                </span>
                {note.starred && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: "rgba(245,158,11,0.12)",
                      color: "#f59e0b",
                    }}
                  >
                    ⭐ Starred
                  </span>
                )}
                {note.archived && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    Archived
                  </span>
                )}
              </div>
              {note.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center gap-0.5"
                      style={{
                        background: "var(--accent-light)",
                        color: "var(--accent-primary)",
                      }}
                    >
                      <Hash size={9} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-[var(--bg-hover)] hover:rotate-90 border-none shrink-0"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 flex flex-col gap-5 scrollbar-thin">
            {/* Canvas previews (multiple) */}
            {(note.canvases?.length > 0 || note.canvasImage) &&
              (() => {
                const canvasList =
                  note.canvases?.length > 0
                    ? note.canvases
                    : [
                        {
                          url: note.canvasImage,
                          name: note.canvasName || "Canvas Drawing",
                        },
                      ];
                return (
                  <div className="flex flex-col gap-3">
                    <p
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Canvas Drawings ({canvasList.length})
                    </p>
                    {canvasList.map((cv, ci) => (
                      <div
                        key={ci}
                        className="rounded-xl overflow-hidden border"
                        style={{ borderColor: "var(--border-color)" }}
                      >
                        <div
                          className="flex items-center justify-between px-3 py-1.5"
                          style={{
                            background: "var(--bg-tertiary)",
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <Brush size={11} style={{ color: "#6366f1" }} />
                            <span
                              className="text-xs font-semibold"
                              style={{ color: "#6366f1" }}
                            >
                              {cv.name || `Canvas ${ci + 1}`}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              onCanvas(note, ci);
                              onClose();
                            }}
                            className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg font-semibold cursor-pointer border-none transition-all hover:opacity-80"
                            style={{
                              background: "rgba(99,102,241,0.12)",
                              color: "#6366f1",
                            }}
                          >
                            <Pencil size={10} /> Edit
                          </button>
                        </div>
                        <img
                          src={getFullUrl(cv.url)}
                          alt={cv.name || `Canvas ${ci + 1}`}
                          className="w-full object-contain max-h-64"
                          style={{ background: "#fff" }}
                        />
                      </div>
                    ))}
                  </div>
                );
              })()}

            {/* Content */}
            {note.description && (
              <div
                className="note-prose text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: "var(--accent-primary)" }}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {note.description}
                </ReactMarkdown>
              </div>
            )}

            {/* Image attachments */}
            {imageAttachments.length > 0 && (
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Images
                </p>
                <div
                  className={`grid gap-2 ${imageAttachments.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}
                >
                  {imageAttachments.map((att, i) => (
                    <a
                      key={i}
                      href={getFullUrl(att.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={getFullUrl(att.url)}
                        alt={att.name || `Image ${i + 1}`}
                        className="w-full h-36 object-cover rounded-xl border transition-transform hover:scale-[1.02]"
                        style={{ borderColor: "var(--border-color)" }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* File attachments */}
            {nonImageAttachments.length > 0 && (
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Attachments
                </p>
                <div className="flex flex-col gap-1.5">
                  {nonImageAttachments.map((att, i) => {
                    const atype = getAttachmentType(att);
                    const typeLabels = {
                      pdf: "PDF",
                      doc: "Word",
                      excel: "Excel",
                      ppt: "PowerPoint",
                      video: "Video",
                      audio: "Audio",
                      file: "File",
                    };
                    return (
                      <a
                        key={i}
                        href={getFullUrl(att.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all hover:bg-[var(--bg-hover)]"
                        style={{
                          background: "var(--bg-tertiary)",
                          borderColor: "var(--border-color)",
                          textDecoration: "none",
                        }}
                      >
                        <AttachmentIcon type={atype} size={18} />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-semibold truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {att.name || `File ${i + 1}`}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {typeLabels[atype] || "File"}
                          </p>
                        </div>
                        <Download
                          size={13}
                          style={{ color: "var(--text-tertiary)" }}
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div
            className="px-5 sm:px-7 py-4 border-t flex items-center gap-2 flex-wrap shrink-0"
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-secondary)",
            }}
          >
            <button
              onClick={() => {
                onEdit(note);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all border-none hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                color: "#fff",
              }}
            >
              <Edit3 size={14} /> Edit
            </button>
            <button
              onClick={() => {
                onCanvas(note);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all border-none hover:opacity-90"
              style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}
            >
              <Brush size={14} /> Add Canvas
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all border hover:bg-[var(--bg-hover)] ml-auto"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                onDelete(note._id);
                onClose();
              }}
              disabled={deletingId === note._id}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all border-none hover:bg-red-50 disabled:opacity-50"
              style={{ color: "#ef4444", background: "transparent" }}
            >
              <Trash2 size={14} /> {deletingId === note._id ? "..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Create / Edit Folder Modal ────────────────────────────────────────────────
const FolderFormModal = ({ isOpen, folder, onClose, onSave }) => {
  const [name, setName] = React.useState(folder?.name || "");
  const [color, setColor] = React.useState(folder?.color || "#6366f1");
  const [icon, setIcon] = React.useState(folder?.icon || "📁");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName(folder?.name || "");
      setColor(folder?.color || "#6366f1");
      setIcon(folder?.icon || "📁");
    }
  }, [isOpen, folder]);

  if (!isOpen) return null;

  const FOLDER_COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#64748b",
  ];
  const FOLDER_ICONS = [
    "📁",
    "📂",
    "📌",
    "📝",
    "🎯",
    "💡",
    "🔖",
    "⭐",
    "🏷️",
    "🗂️",
    "📚",
    "💼",
    "🎨",
    "🔬",
    "🏆",
  ];

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), color, icon });
    setSaving(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
        onClick={onClose}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm z-[10000] rounded-2xl animate-scale-in"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ background: color }}
              >
                <span className="text-sm">{icon}</span>
              </div>
              <h3
                className="text-base font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {folder ? "Edit Folder" : "New Folder"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all hover:bg-[var(--bg-hover)]"
              style={{
                color: "var(--text-secondary)",
                background: "var(--bg-tertiary)",
              }}
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[11px] font-bold uppercase tracking-[0.8px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Folder Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="e.g. Work, Personal, Ideas..."
              maxLength={40}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-all focus:border-[var(--accent-primary)]"
              style={{
                background: "var(--bg-tertiary)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[11px] font-bold uppercase tracking-[0.8px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Icon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FOLDER_ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className="w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all hover:scale-110 border-none cursor-pointer"
                  style={{
                    background:
                      icon === ic
                        ? "var(--accent-light)"
                        : "var(--bg-tertiary)",
                    outline:
                      icon === ic ? "2px solid var(--accent-primary)" : "none",
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[11px] font-bold uppercase tracking-[0.8px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-all hover:scale-125 border-none cursor-pointer"
                  style={{
                    background: c,
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all disabled:opacity-50"
              style={{ background: color, boxShadow: `0 4px 14px ${color}50` }}
            >
              {saving ? "Saving..." : folder ? "Save Changes" : "Create Folder"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Move to Folder Modal ──────────────────────────────────────────────────────
const MoveToFolderModal = ({ isOpen, note, folders, onClose, onMove }) => {
  const [selected, setSelected] = React.useState(null);
  const [moving, setMoving] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) setSelected(note?.folderId || null);
  }, [isOpen, note]);

  if (!isOpen || !note) return null;

  const handleMove = async () => {
    setMoving(true);
    await onMove(note._id, selected);
    setMoving(false);
    onClose();
  };

  const selectedFolder = folders.find((f) => f._id === selected);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
        onClick={onClose}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm z-[10000] rounded-2xl animate-scale-in"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.12)" }}
            >
              <MoveRight size={20} style={{ color: "#6366f1" }} />
            </div>
            <div>
              <h3
                className="text-base font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Move Note
              </h3>
              <p
                className="text-xs truncate max-w-[200px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                "{note.title || "Untitled"}"
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto scrollbar-thin">
            <button
              onClick={() => setSelected(null)}
              className="folder-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left border"
              style={{
                background:
                  selected === null
                    ? "var(--accent-light)"
                    : "var(--bg-tertiary)",
                color:
                  selected === null
                    ? "var(--accent-primary)"
                    : "var(--text-primary)",
                borderColor:
                  selected === null ? "var(--accent-primary)" : "transparent",
              }}
            >
              <Inbox
                size={16}
                style={{
                  color:
                    selected === null
                      ? "var(--accent-primary)"
                      : "var(--text-tertiary)",
                }}
              />
              <span className="flex-1">Inbox (No Folder)</span>
              {selected === null && (
                <CheckCircle
                  size={14}
                  style={{ color: "var(--accent-primary)" }}
                />
              )}
            </button>
            {folders.map((f) => (
              <button
                key={f._id}
                onClick={() => setSelected(f._id)}
                className="folder-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left border"
                style={{
                  background:
                    selected === f._id ? `${f.color}18` : "var(--bg-tertiary)",
                  color: selected === f._id ? f.color : "var(--text-primary)",
                  borderColor: selected === f._id ? f.color : "transparent",
                }}
              >
                <span className="text-base">{f.icon}</span>
                <span className="flex-1">{f.name}</span>
                {selected === f._id && (
                  <CheckCircle size={14} style={{ color: f.color }} />
                )}
              </button>
            ))}
            {folders.length === 0 && (
              <p
                className="text-sm text-center py-4"
                style={{ color: "var(--text-tertiary)" }}
              >
                No folders yet. Create one first!
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              disabled={moving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
              }}
            >
              <MoveRight size={14} />
              {moving
                ? "Moving..."
                : `Move${selectedFolder ? ` to ${selectedFolder.name}` : " to Inbox"}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Folder Sidebar ────────────────────────────────────────────────────────────
const FolderSidebar = ({
  isOpen,
  onToggle,
  folders,
  activeFolderId,
  onSelectFolder,
  notes,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
}) => {
  const [hovered, setHovered] = React.useState(null);

  const getCount = (folderId) =>
    notes.filter(
      (n) => !n.archived && (folderId ? n.folderId === folderId : !n.folderId),
    ).length;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[49] lg:hidden"
          onClick={onToggle}
        />
      )}
      <div
        className={`fixed left-0 z-[50] flex flex-col folder-sidebar ${isOpen ? "w-64" : "w-0 lg:w-14"} overflow-hidden`}
        style={{
          top: 61,
          bottom: 0,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-color)",
          boxShadow: isOpen ? "4px 0 24px rgba(0,0,0,0.08)" : "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-3 border-b shrink-0"
          style={{ borderColor: "var(--border-color)" }}
        >
          {isOpen && (
            <span
              className="text-[10px] font-bold uppercase tracking-[1px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Folders
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto">
            {isOpen && (
              <button
                onClick={onCreateFolder}
                className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer transition-all hover:opacity-80"
                style={{
                  color: "var(--accent-primary)",
                  background: "var(--accent-light)",
                }}
                title="New Folder"
              >
                <FolderPlus size={13} />
              </button>
            )}
            <button
              onClick={onToggle}
              className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer transition-all hover:bg-[var(--bg-hover)]"
              style={{
                color: "var(--text-secondary)",
                background: "var(--bg-tertiary)",
              }}
              title={isOpen ? "Collapse" : "Folders"}
            >
              {isOpen ? <ChevronLeft size={14} /> : <Folder size={14} />}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2 flex flex-col gap-0.5">
          {/* Inbox */}
          <button
            onClick={() => onSelectFolder(null)}
            onMouseEnter={() => setHovered("inbox")}
            onMouseLeave={() => setHovered(null)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all border-none cursor-pointer"
            style={{
              background:
                activeFolderId === null
                  ? "var(--accent-light)"
                  : hovered === "inbox"
                    ? "var(--bg-hover)"
                    : "transparent",
              color:
                activeFolderId === null
                  ? "var(--accent-primary)"
                  : "var(--text-secondary)",
            }}
            title="Inbox"
          >
            <Inbox
              size={14}
              style={{
                flexShrink: 0,
                color:
                  activeFolderId === null
                    ? "var(--accent-primary)"
                    : "var(--text-tertiary)",
              }}
            />
            {isOpen && (
              <>
                <span className="flex-1 text-sm font-medium truncate">
                  Inbox
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background:
                      activeFolderId === null
                        ? "var(--accent-primary)"
                        : "var(--bg-tertiary)",
                    color:
                      activeFolderId === null ? "#fff" : "var(--text-tertiary)",
                  }}
                >
                  {getCount(null)}
                </span>
              </>
            )}
          </button>

          {/* Folders */}
          {folders.map((f) => (
            <div
              key={f._id}
              className="relative group"
              onMouseEnter={() => setHovered(f._id)}
              onMouseLeave={() => setHovered(null)}
            >
              <button
                onClick={() => onSelectFolder(f._id)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all border-none cursor-pointer"
                style={{
                  background:
                    activeFolderId === f._id
                      ? `${f.color}18`
                      : hovered === f._id
                        ? "var(--bg-hover)"
                        : "transparent",
                  color:
                    activeFolderId === f._id
                      ? f.color
                      : "var(--text-secondary)",
                }}
                title={f.name}
              >
                <span style={{ fontSize: 14, flexShrink: 0 }}>{f.icon}</span>
                {isOpen && (
                  <>
                    <span className="flex-1 text-sm font-medium truncate">
                      {f.name}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{
                        background:
                          activeFolderId === f._id
                            ? f.color
                            : "var(--bg-tertiary)",
                        color:
                          activeFolderId === f._id
                            ? "#fff"
                            : "var(--text-tertiary)",
                      }}
                    >
                      {getCount(f._id)}
                    </span>
                  </>
                )}
              </button>
              {isOpen && hovered === f._id && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-0.5 animate-fade-in">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditFolder(f);
                    }}
                    className="w-5 h-5 rounded flex items-center justify-center border-none cursor-pointer hover:bg-[var(--bg-secondary)]"
                    style={{ color: "var(--text-tertiary)" }}
                    title="Edit"
                  >
                    <Pencil size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(f);
                    }}
                    className="w-5 h-5 rounded flex items-center justify-center border-none cursor-pointer hover:bg-red-100"
                    style={{ color: "#ef4444" }}
                    title="Delete"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {isOpen && folders.length === 0 && (
            <div className="px-2 py-5 text-center">
              <FolderPlus
                size={22}
                className="mx-auto mb-2"
                style={{ color: "var(--text-tertiary)" }}
              />
              <p
                className="text-xs mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                No folders yet
              </p>
              <button
                onClick={onCreateFolder}
                className="text-xs font-semibold border-none bg-transparent cursor-pointer underline"
                style={{ color: "var(--accent-primary)" }}
              >
                Create one
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Stats Bar ─────────────────────────────────────────────────────────────────
const StatsBar = ({ notes }) => {
  const total = notes.length;
  const starred = notes.filter((n) => n.starred).length;
  const archived = notes.filter((n) => n.archived).length;
  const withCanvas = notes.filter(
    (n) => n.canvases?.length > 0 || !!n.canvasImage,
  ).length;
  const high = notes.filter((n) => n.priority === "high").length;

  const stats = [
    {
      label: "Total",
      value: total,
      icon: <FileText size={14} />,
      color: "#6366f1",
    },
    {
      label: "Starred",
      value: starred,
      icon: <Star size={14} />,
      color: "#f59e0b",
    },
    {
      label: "Archived",
      value: archived,
      icon: <Archive size={14} />,
      color: "#64748b",
    },
    {
      label: "Canvas",
      value: withCanvas,
      icon: <Brush size={14} />,
      color: "#8b5cf6",
    },
    {
      label: "High Pri",
      value: high,
      icon: <Zap size={14} />,
      color: "#ef4444",
    },
  ];

  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-thin">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0 border"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          <span style={{ color: s.color }}>{s.icon}</span>
          <div>
            <p
              className="text-xs font-bold leading-none"
              style={{ color: "var(--text-primary)" }}
            >
              {s.value}
            </p>
            <p
              className="text-[10px] leading-none mt-0.5"
              style={{ color: "var(--text-tertiary)" }}
            >
              {s.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Notes = () => {
  useEffect(() => {
    injectGlobalStyles();
  }, []);

  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [addingSkeletonCount, setAddingSkeletonCount] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);
  const [clickedId, setClickedId] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const s = localStorage.getItem("notes-theme");
      return s ? JSON.parse(s) : false;
    } catch {
      return false;
    }
  });
  const [editingNote, setEditingNote] = useState(null);
  const [editingSaving, setEditingSaving] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [viewMode, setViewMode] = useState("grid");
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasNoteId, setCanvasNoteId] = useState(null);
  const [canvasExistingUrl, setCanvasExistingUrl] = useState(null);
  const [canvasEditIndex, setCanvasEditIndex] = useState(null); // index within note.canvases, null = new canvas
  const [syncIndicator, setSyncIndicator] = useState(false);

  // ── Folder state ───────────────────────────────────────────────────────────
  const [folders, setFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState(null); // null = show inbox
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [folderFormModal, setFolderFormModal] = useState({
    isOpen: false,
    folder: null,
  });
  const [moveModal, setMoveModal] = useState({ isOpen: false, note: null });
  const [canvasName, setCanvasName] = useState("Canvas Drawing");
  const [showCanvasNameInput, setShowCanvasNameInput] = useState(false);

  // ── Confirm modal state ────────────────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    confirmColor: "#ef4444",
    onConfirm: null,
    icon: null,
  });

  const showConfirm = ({
    title,
    message,
    confirmLabel,
    confirmColor,
    onConfirm,
    icon,
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmLabel: confirmLabel || "Confirm",
      confirmColor: confirmColor || "#ef4444",
      onConfirm,
      icon: icon || null,
    });
  };
  const closeConfirm = () =>
    setConfirmModal((p) => ({ ...p, isOpen: false, onConfirm: null }));

  const API_BASE = import.meta.env.VITE_API_BASE + "/notes";
  const AUTH_BASE = import.meta.env.VITE_API_BASE + "/auth";

  // ── Fetch Folders ──────────────────────────────────────────────────────────
  const fetchFolders = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/folders/fetch`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setFolders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch folders error:", err);
    }
  }, [API_BASE]);

  useEffect(() => {
    if (currentUser) fetchFolders();
  }, [currentUser, fetchFolders]);

  // ── Folder CRUD handlers ───────────────────────────────────────────────────
  const handleCreateFolder = async ({ name, color, icon }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/folders/create`,
        { name, color, icon },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      setFolders((prev) => [...prev, res.data.folder]);
      setFolderFormModal({ isOpen: false, folder: null });
      addToast("Folder created!", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to create folder", "error");
    }
  };

  const handleEditFolder = async ({ name, color, icon }) => {
    const folderId = folderFormModal.folder?._id;
    if (!folderId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE}/folders/update/${folderId}`,
        { name, color, icon },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      setFolders((prev) =>
        prev.map((f) => (f._id === folderId ? res.data.folder : f)),
      );
      setFolderFormModal({ isOpen: false, folder: null });
      addToast("Folder updated!", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to update folder", "error");
    }
  };

  const handleDeleteFolder = (folder) => {
    showConfirm({
      title: "Delete Folder",
      message: `Delete "${folder.name}"? Notes inside will be moved to Inbox.`,
      confirmLabel: "Delete",
      confirmColor: "#ef4444",
      icon: <Trash2 size={26} style={{ color: "#ef4444" }} />,
      onConfirm: async () => {
        closeConfirm();
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_BASE}/folders/delete/${folder._id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setFolders((prev) => prev.filter((f) => f._id !== folder._id));
          if (activeFolderId === folder._id) setActiveFolderId(null);
          setNotes((prev) =>
            prev.map((n) =>
              n.folderId === folder._id ? { ...n, folderId: null } : n,
            ),
          );
          addToast("Folder deleted", "success");
        } catch (err) {
          addToast("Failed to delete folder", "error");
        }
      },
    });
  };

  const handleMoveNote = async (noteId, folderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/move/${noteId}`,
        { folderId },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      setNotes((prev) =>
        prev.map((n) =>
          n._id === noteId ? { ...n, folderId: folderId || null } : n,
        ),
      );
      const folder = folders.find((f) => f._id === folderId);
      addToast(
        folderId ? `Moved to "${folder?.name}"` : "Moved to Inbox",
        "success",
      );
    } catch (err) {
      addToast("Failed to move note", "error");
    }
  };

  // ── Theme ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("notes-theme", JSON.stringify(darkMode));
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
  }, [darkMode]);

  // ── User ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (userStr) setCurrentUser(JSON.parse(userStr));
      else if (token) fetchUserProfile();
    } catch (e) {
      console.error("Error parsing user:", e);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${AUTH_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.user) {
        setCurrentUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const normalizeNote = (n) => {
    // Backward compat: if old canvasImage exists but no canvases array, migrate it
    let canvases = Array.isArray(n.canvases) ? n.canvases : [];
    if (canvases.length === 0 && n.canvasImage) {
      canvases = [
        { url: n.canvasImage, name: n.canvasName || "Canvas Drawing" },
      ];
    }
    return {
      ...n,
      description: n.description ?? n.desc ?? "",
      tags: Array.isArray(n.tags)
        ? n.tags
        : typeof n.tags === "string" && n.tags.length
          ? n.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      createdAt: n.createdAt ?? n.created_at ?? n.created ?? null,
      attachments: n.attachments ?? [],
      canvasImage: n.canvasImage ?? null,
      canvasName: n.canvasName ?? "Canvas Drawing",
      canvases,
      folderId: n.folderId ?? null,
    };
  };

  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const base = import.meta.env.VITE_API_BASE.replace(
      /\/notes\/?$/,
      "",
    ).replace(/\/$/, "");
    return `${base}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const formatDate = (d) => {
    const date = new Date(d);
    if (isNaN(date)) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getPriorityColor = (p) =>
    ({ high: "#ef4444", medium: "#f59e0b", low: "#10b981" })[p] || "#6b7280";

  // ── Toasts ─────────────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  }, []);

  // ── Fetch Notes ────────────────────────────────────────────────────────────
  const fetchNotes = useCallback(
    async (userParam, silent = false) => {
      const user = userParam || currentUser;
      if (!user) return;
      if (!silent) setLoading(true);
      if (silent) setSyncIndicator(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/fetch`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setNotes(data.map(normalizeNote));
        setLastRefreshed(new Date());
      } catch (err) {
        if (!silent)
          addToast(
            `Error fetching notes: ${err.response?.data?.error || err.message}`,
            "error",
          );
      } finally {
        if (!silent) setLoading(false);
        if (silent) setSyncIndicator(false);
      }
    },
    [currentUser, API_BASE, addToast],
  );

  useEffect(() => {
    if (currentUser) fetchNotes();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => fetchNotes(null, true), 30000);
    return () => clearInterval(interval);
  }, [currentUser, fetchNotes]);

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  useEffect(() => {
    let filtered = [...notes];
    filtered = filtered.filter((n) =>
      showArchived ? !!n.archived : !n.archived,
    );
    // Folder filter (only when not showing archived)
    if (!showArchived && !showAllNotes) {
      filtered = filtered.filter((n) =>
        activeFolderId ? n.folderId === activeFolderId : !n.folderId,
      );
    }
    if (selectedFilter !== "all") {
      if (selectedFilter === "starred")
        filtered = filtered.filter((n) => !!n.starred);
      else if (selectedFilter === "canvas")
        filtered = filtered.filter((n) => !!n.canvasImage);
      else if (["high", "medium", "low"].includes(selectedFilter))
        filtered = filtered.filter((n) => n.priority === selectedFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          (n.title || "").toLowerCase().includes(q) ||
          (n.description || "").toLowerCase().includes(q) ||
          (Array.isArray(n.tags) &&
            n.tags.some((t) => t.toLowerCase().includes(q))),
      );
    }
    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "title")
        cmp = (a.title || "").localeCompare(b.title || "");
      else if (sortBy === "priority") {
        const o = { high: 3, medium: 2, low: 1 };
        cmp = (o[b.priority] || 0) - (o[a.priority] || 0);
      } else cmp = new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return sortOrder === "asc" ? -cmp : cmp;
    });
    setFilteredNotes(filtered);
  }, [
    notes,
    searchQuery,
    selectedFilter,
    showArchived,
    sortBy,
    sortOrder,
    activeFolderId,
    showAllNotes,
  ]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!title.trim() && !description.trim()) {
      addToast("Please fill in title or description.", "warning");
      return;
    }
    setShowForm(false);
    setAdding(true);
    setAddingSkeletonCount(1);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("desc", description.trim());
      formData.append("description", description.trim());
      formData.append("priority", priority);
      formData.append(
        "tags",
        tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(","),
      );
      if (activeFolderId) formData.append("folderId", activeFolderId);
      selectedFiles.forEach((file) => formData.append("files", file));
      const res = await axios.post(`${API_BASE}/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const rawNote = res.data?.note ?? res.data ?? null;
      if (rawNote) {
        setNotes((prev) => [normalizeNote(rawNote), ...prev]);
        addToast("Note added!", "success");
      }
      setTitle("");
      setDescription("");
      setTags("");
      setPriority("medium");
      setSelectedFiles([]);
    } catch (err) {
      addToast(
        `Error adding note: ${err.response?.data?.error || err.message}`,
        "error",
      );
    } finally {
      setAdding(false);
      setAddingSkeletonCount(0);
    }
  };

  const handleEditSave = async () => {
    if (!editingNote) return;
    setEditingSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", editingNote.title?.trim() || "");
      formData.append("desc", editingNote.description?.trim() || "");
      formData.append("description", editingNote.description?.trim() || "");
      formData.append("tags", (editingNote.tags || []).join(","));
      formData.append("priority", editingNote.priority || "medium");
      formData.append("archived", !!editingNote.archived);
      formData.append("starred", !!editingNote.starred);
      formData.append(
        "existingAttachments",
        JSON.stringify(editingNote.attachments || []),
      );
      // Persist canvases array (for removal support)
      if (editingNote.canvases) {
        formData.append("canvases", JSON.stringify(editingNote.canvases));
      }
      selectedFiles.forEach((file) => formData.append("files", file));
      const res = await axios.put(
        `${API_BASE}/update/${editingNote._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const rawUpdated = res.data?.note ?? res.data ?? null;
      if (rawUpdated) {
        setNotes((prev) =>
          prev.map((n) =>
            n._id === rawUpdated._id ? normalizeNote(rawUpdated) : n,
          ),
        );
        addToast("Note updated!", "success");
        setEditingNote(null);
        setSelectedFiles([]);
      }
    } catch (err) {
      addToast(
        `Error updating: ${err.response?.data?.error || err.message}`,
        "error",
      );
    } finally {
      setEditingSaving(false);
    }
  };

  // ── Delete with modal confirmation ─────────────────────────────────────────
  const handleDeleteNote = (id) => {
    showConfirm({
      title: "Delete Note",
      message:
        "This note will be permanently deleted. This action cannot be undone.",
      confirmLabel: "Delete",
      confirmColor: "#ef4444",
      icon: <Trash2 size={26} style={{ color: "#ef4444" }} />,
      onConfirm: async () => {
        closeConfirm();
        if (id.toString().startsWith("import-")) {
          setNotes((prev) => prev.filter((n) => n._id !== id));
          addToast("Note removed", "success");
          return;
        }
        setDeletingId(id);
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_BASE}/delete/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setNotes((prev) => prev.filter((n) => n._id !== id));
          if (clickedId === id) setClickedId(null);
          addToast("Note deleted", "success");
        } catch (err) {
          addToast(
            `Error: ${err.response?.data?.error || err.message}`,
            "error",
          );
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const toggleStar = async (note) => {
    try {
      const token = localStorage.getItem("token");
      const updated = { ...note, starred: !note.starred };
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? normalizeNote(updated) : n)),
      );
      await axios.put(
        `${API_BASE}/update/${note._id}`,
        {
          title: updated.title,
          desc: updated.description ?? "",
          tags: updated.tags || [],
          priority: updated.priority || "medium",
          starred: updated.starred,
          archived: !!updated.archived,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
    } catch (err) {
      addToast(`Error: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  const toggleArchive = async (note) => {
    try {
      const token = localStorage.getItem("token");
      const updated = { ...note, archived: !note.archived };
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? normalizeNote(updated) : n)),
      );
      await axios.put(
        `${API_BASE}/update/${note._id}`,
        {
          title: updated.title,
          desc: updated.description ?? "",
          tags: updated.tags || [],
          priority: updated.priority || "medium",
          starred: !!updated.starred,
          archived: updated.archived,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      addToast(updated.archived ? "Note archived" : "Note restored", "success");
    } catch (err) {
      addToast(`Error: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  const copyNote = async (note) => {
    try {
      await navigator.clipboard.writeText(note.description || "");
      addToast("Content copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  const shareNote = (note) => {
    if (!note.publicId) {
      addToast("This note cannot be shared", "error");
      return;
    }
    navigator.clipboard
      .writeText(`${window.location.origin}/notes/shared/${note.publicId}`)
      .then(() => addToast("Share link copied!", "success"))
      .catch(() => addToast("Failed to copy link", "error"));
  };

  const [downloadModal, setDownloadModal] = useState(null); // note to download

  const addWatermarkToPdf = (doc) => {
    const pw = doc.internal.pageSize.width;
    const ph = doc.internal.pageSize.height;
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.07 }));
      doc.setFontSize(52);
      doc.setTextColor(99, 102, 241);
      doc.setFont("helvetica", "bold");
      doc.text("NotesFlow", pw / 2, ph / 2, {
        align: "center",
        angle: 45,
        baseline: "middle",
      });
      doc.restoreGraphicsState();
    }
  };

  // ── Attachment helpers ─────────────────────────────────────────────────────

  // Fetch any URL (including cross-origin server uploads) as a base64 data URL.
  // Returns null if the fetch/decode fails so callers can gracefully skip.
  const fetchAsBase64 = async (url) => {
    try {
      const fullUrl = getFullUrl(url);
      if (!fullUrl) return null;
      // If it's already a data URL just return it
      if (fullUrl.startsWith("data:")) return fullUrl;
      const resp = await fetch(fullUrl);
      if (!resp.ok) return null;
      const blob = await resp.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  // Derive a clean mime type string from a data URL or attachment object
  const getMimeFromDataUrl = (dataUrl) => {
    const m = dataUrl && dataUrl.match(/^data:([^;]+);/);
    return m ? m[1] : "image/png";
  };

  // Convert a data URL to a raw Uint8Array (strips the header)
  const dataUrlToUint8Array = (dataUrl) => {
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return arr;
  };

  // Determine if a mime type / filename is a renderable image
  const isRenderableImage = (att) => {
    const type = getAttachmentType(att);
    return type === "image";
  };

  // ── PDF Download (with attachments) ───────────────────────────────────────
  const downloadNoteAsPdf = async (note) => {
    addToast("Preparing PDF…", "info");
    try {
      const doc = new jsPDF();
      const pw = doc.internal.pageSize.width;
      const ph = doc.internal.pageSize.height;
      const margin = 14;
      const contentW = pw - margin * 2;
      let y = 20;

      const checkPage = (needed = 10) => {
        if (y + needed > ph - 20) {
          doc.addPage();
          y = 20;
        }
      };

      // ── Header ──
      doc.setFontSize(22);
      doc.setTextColor(99, 102, 241);
      doc.setFont("helvetica", "bold");
      doc.text(note.title || "Untitled", margin, y);
      y += 12;

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.setFont("helvetica", "italic");
      const metaLine = `${formatDate(note.createdAt)} | Priority: ${note.priority}${note.tags?.length ? "  |  Tags: " + note.tags.join(", ") : ""}`;
      doc.text(metaLine, margin, y);
      y += 10;

      doc.setDrawColor(199, 202, 241);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pw - margin, y);
      y += 10;

      // ── Body text ──
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "normal");
      const bodyLines = doc.splitTextToSize(note.description || "", contentW);
      bodyLines.forEach((line) => {
        checkPage(7);
        doc.text(line, margin, y);
        y += 7;
      });

      // ── Canvas image ──
      if (note.canvasImage) {
        y += 6;
        checkPage(12);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(99, 102, 241);
        doc.text("Canvas Drawing", margin, y);
        y += 4;
        doc.setDrawColor(199, 202, 241);
        doc.line(margin, y, pw - margin, y);
        y += 6;

        const canvasData = await fetchAsBase64(note.canvasImage);
        if (canvasData) {
          const mime = getMimeFromDataUrl(canvasData);
          const imgFormat =
            mime.includes("jpeg") || mime.includes("jpg") ? "JPEG" : "PNG";
          // Calculate proportional size — max width = contentW, max height = 100mm
          const maxW = contentW;
          const maxH = 100;
          // Use jsPDF's getImageProperties to get real dimensions
          try {
            const props = doc.getImageProperties(canvasData);
            const ratio = Math.min(maxW / props.width, maxH / props.height, 1);
            const imgW = props.width * ratio;
            const imgH = props.height * ratio;
            checkPage(imgH + 4);
            doc.addImage(canvasData, imgFormat, margin, y, imgW, imgH);
            y += imgH + 8;
          } catch {
            doc.addImage(canvasData, imgFormat, margin, y, maxW, 60);
            y += 68;
          }
        } else {
          doc.setFontSize(10);
          doc.setTextColor(156, 163, 175);
          doc.text("[Canvas image could not be loaded]", margin, y);
          y += 8;
        }
      }

      // ── Attachments ──
      const attachments = note.attachments || [];
      if (attachments.length > 0) {
        y += 6;
        checkPage(12);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(99, 102, 241);
        doc.text(`Attachments (${attachments.length})`, margin, y);
        y += 4;
        doc.setDrawColor(199, 202, 241);
        doc.line(margin, y, pw - margin, y);
        y += 6;

        for (let i = 0; i < attachments.length; i++) {
          const att = attachments[i];
          const attType = getAttachmentType(att);
          const attName = att.name || att.url || `Attachment ${i + 1}`;

          if (attType === "image") {
            // Render image inline
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(55, 65, 81);
            checkPage(10);
            doc.text(`[Image] ${attName}`, margin, y);
            y += 5;

            const imgData = await fetchAsBase64(att.url);
            if (imgData) {
              const mime = getMimeFromDataUrl(imgData);
              const imgFormat =
                mime.includes("jpeg") || mime.includes("jpg") ? "JPEG" : "PNG";
              const maxW = contentW;
              const maxH = 90;
              try {
                const props = doc.getImageProperties(imgData);
                const ratio = Math.min(
                  maxW / props.width,
                  maxH / props.height,
                  1,
                );
                const imgW = props.width * ratio;
                const imgH = props.height * ratio;
                checkPage(imgH + 4);
                doc.addImage(imgData, imgFormat, margin, y, imgW, imgH);
                y += imgH + 8;
              } catch {
                doc.addImage(imgData, imgFormat, margin, y, maxW, 60);
                y += 68;
              }
            } else {
              doc.setFontSize(10);
              doc.setTextColor(156, 163, 175);
              doc.setFont("helvetica", "italic");
              doc.text("  [Image could not be loaded]", margin, y);
              y += 8;
            }
          } else {
            // Non-image: labelled box with file info
            checkPage(18);
            const typeLabels = {
              pdf: "PDF Document",
              doc: "Word Document",
              excel: "Excel Spreadsheet",
              ppt: "PowerPoint",
              video: "Video File",
              audio: "Audio File",
              file: "File",
            };
            const typeColors = {
              pdf: [239, 68, 68],
              doc: [59, 130, 246],
              excel: [16, 185, 129],
              ppt: [249, 115, 22],
              video: [139, 92, 246],
              audio: [236, 72, 153],
              file: [100, 116, 139],
            };
            const [r, g, b] = typeColors[attType] || typeColors.file;

            // Draw a subtle card
            doc.setFillColor(r, g, b);
            doc.roundedRect(margin, y, contentW, 14, 2, 2, "F");
            // Dim overlay for readability
            doc.setFillColor(255, 255, 255);
            doc.setGState(new doc.GState({ opacity: 0.88 }));
            doc.roundedRect(margin, y, contentW, 14, 2, 2, "F");
            doc.setGState(new doc.GState({ opacity: 1 }));

            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(r, g, b);
            doc.text(
              `${typeLabels[attType] || "File"}: ${attName}`,
              margin + 4,
              y + 9,
            );
            y += 18;
          }
        }
      }

      // ── Footer + watermark ──
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.setFont("helvetica", "normal");
        doc.text(`NotesFlow  |  Page ${i} of ${totalPages}`, pw / 2, ph - 8, {
          align: "center",
        });
      }
      addWatermarkToPdf(doc);
      doc.save(
        `${(note.title || "note").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`,
      );
      addToast("Downloaded as PDF", "success");
    } catch (err) {
      console.error("PDF error:", err);
      addToast("PDF download failed", "error");
    }
  };

  // ── DOCX Download (with attachments) ──────────────────────────────────────
  const downloadNoteAsDocx = async (note) => {
    addToast("Preparing DOCX…", "info");
    try {
      const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        ImageRun,
        AlignmentType,
        BorderStyle,
        WidthType,
      } = await import("docx");
      const { saveAs } = await import("file-saver");

      const safeName = (note.title || "note")
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase();
      const metaLine = `${formatDate(note.createdAt)}  |  Priority: ${note.priority}${note.tags?.length ? "  |  Tags: " + note.tags.join(", ") : ""}`;

      // Helper: section-heading paragraph
      const sectionHeading = (text) =>
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: "Arial",
              size: 24,
              bold: true,
              color: "6366F1",
            }),
          ],
          spacing: { before: 320, after: 120 },
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 2,
              color: "C7CAF1",
              space: 4,
            },
          },
        });

      // Helper: build ImageRun from data URL; returns null on failure
      const buildImageRun = async (url, maxWidthEmu = 5000000) => {
        const dataUrl = await fetchAsBase64(url);
        if (!dataUrl) return null;
        try {
          const mime = getMimeFromDataUrl(dataUrl);
          const typeMap = {
            "image/png": "png",
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/gif": "gif",
            "image/webp": "png", // docx doesn't support webp natively
          };
          const imgType = typeMap[mime] || "png";
          const data = dataUrlToUint8Array(dataUrl);

          // Derive natural size via Image element
          const dims = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () =>
              resolve({ w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = () => resolve({ w: 600, h: 400 });
            img.src = dataUrl;
          });

          // Scale to fit content width (6 inches = 5486400 EMU)
          const contentEmu = 5486400;
          const ratio = Math.min(contentEmu / (dims.w * 9144), 1); // 9144 EMU per px at 96 dpi
          const wEmu = Math.round(dims.w * 9144 * ratio);
          const hEmu = Math.round(dims.h * 9144 * ratio);

          return new ImageRun({
            data,
            transformation: { width: wEmu / 9144, height: hEmu / 9144 },
            type: imgType,
          });
        } catch {
          return null;
        }
      };

      // ── Build document children ──
      const children = [];

      // Brand header
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "── NotesFlow ──",
              font: "Arial",
              size: 18,
              color: "C7CAF1",
              bold: true,
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        }),
      );

      // Title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: note.title || "Untitled",
              font: "Arial",
              size: 44,
              bold: true,
              color: "6366F1",
            }),
          ],
          spacing: { after: 120 },
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 4,
              color: "C7CAF1",
              space: 4,
            },
          },
        }),
      );

      // Meta
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: metaLine,
              font: "Arial",
              size: 18,
              italics: true,
              color: "6B7280",
            }),
          ],
          spacing: { after: 280 },
        }),
      );

      // Body text
      const bodyLines = (note.description || "").split("\n");
      bodyLines.forEach((line) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line || " ",
                font: "Arial",
                size: 24,
                color: "1F2937",
              }),
            ],
            spacing: { after: 80 },
          }),
        );
      });

      // Canvas image
      if (note.canvasImage) {
        children.push(sectionHeading("Canvas Drawing"));
        const imgRun = await buildImageRun(note.canvasImage);
        if (imgRun) {
          children.push(
            new Paragraph({ children: [imgRun], spacing: { after: 200 } }),
          );
        } else {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "[Canvas image could not be embedded]",
                  font: "Arial",
                  size: 20,
                  color: "9CA3AF",
                  italics: true,
                }),
              ],
              spacing: { after: 160 },
            }),
          );
        }
      }

      // Attachments
      const attachments = note.attachments || [];
      if (attachments.length > 0) {
        children.push(sectionHeading(`Attachments (${attachments.length})`));

        for (let i = 0; i < attachments.length; i++) {
          const att = attachments[i];
          const attType = getAttachmentType(att);
          const attName = att.name || att.url || `Attachment ${i + 1}`;

          if (attType === "image") {
            // Label
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `📷  ${attName}`,
                    font: "Arial",
                    size: 20,
                    bold: true,
                    color: "374151",
                  }),
                ],
                spacing: { before: 160, after: 80 },
              }),
            );
            // Image
            const imgRun = await buildImageRun(att.url);
            if (imgRun) {
              children.push(
                new Paragraph({ children: [imgRun], spacing: { after: 200 } }),
              );
            } else {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  [Image could not be embedded]",
                      font: "Arial",
                      size: 20,
                      color: "9CA3AF",
                      italics: true,
                    }),
                  ],
                  spacing: { after: 120 },
                }),
              );
            }
          } else {
            // Non-image: labelled entry with icon emoji
            const typeEmojis = {
              pdf: "📄",
              doc: "📝",
              excel: "📊",
              ppt: "📑",
              video: "🎬",
              audio: "🎵",
              file: "📎",
            };
            const typeLabels = {
              pdf: "PDF",
              doc: "Word Doc",
              excel: "Excel",
              ppt: "PowerPoint",
              video: "Video",
              audio: "Audio",
              file: "File",
            };
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${typeEmojis[attType] || "📎"}  `,
                    font: "Arial",
                    size: 22,
                  }),
                  new TextRun({
                    text: `[${typeLabels[attType] || "File"}]  `,
                    font: "Arial",
                    size: 22,
                    bold: true,
                    color: "6366F1",
                  }),
                  new TextRun({
                    text: attName,
                    font: "Arial",
                    size: 22,
                    color: "374151",
                  }),
                ],
                spacing: { before: 120, after: 120 },
                border: {
                  left: {
                    style: BorderStyle.SINGLE,
                    size: 16,
                    color: "C7CAF1",
                    space: 8,
                  },
                },
              }),
            );
          }
        }
      }

      // Footer watermark
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Created with NotesFlow",
              font: "Arial",
              size: 16,
              color: "D1D5DB",
              italics: true,
            }),
          ],
          spacing: { before: 640 },
        }),
      );

      const document = new Document({
        background: { color: "FFFFFF" },
        sections: [
          {
            properties: {
              page: {
                size: { width: 12240, height: 15840 },
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
              },
            },
            children,
          },
        ],
      });

      const buffer = await Packer.toBlob(document);
      saveAs(buffer, `${safeName}.docx`);
      addToast("Downloaded as DOCX", "success");
    } catch (err) {
      console.error("DOCX error:", err);
      addToast("DOCX download failed — try PDF instead", "error");
    }
  };

  const downloadNote = (note) => {
    setDownloadModal(note);
  };

  const exportNotes = () => {
    if (!notes.length) {
      addToast("No notes to export", "warning");
      return;
    }
    const doc = new jsPDF();
    const ph = doc.internal.pageSize.height;
    const pw = doc.internal.pageSize.width;
    let y = 20;
    notes.forEach((note, idx) => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${note.title || "Untitled"}`, 10, y);
      y += 9;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.splitTextToSize(note.description || "", pw - 20).forEach((line) => {
        if (y + 7 > ph - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 10, y);
        y += 7;
      });
      y += 5;
      if (idx < notes.length - 1 && y + 30 > ph - 20) {
        doc.addPage();
        y = 20;
      }
    });
    // Footer on each page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.setFont("helvetica", "normal");
      doc.text(`NotesFlow | Page ${i} of ${totalPages}`, pw / 2, ph - 8, {
        align: "center",
      });
    }
    addWatermarkToPdf(doc);
    doc.save(`notes-export-${new Date().toISOString().split("T")[0]}.pdf`);
    addToast("Exported!", "success");
  };

  const importNotes = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/json") {
      setAdding(true);
      setAddingSkeletonCount(1);
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("title", file.name);
        formData.append("desc", `Imported: ${file.name}`);
        formData.append("priority", "medium");
        formData.append("tags", "imported");
        formData.append("files", file);
        // ── FIX: import into the currently open folder ──
        if (activeFolderId) formData.append("folderId", activeFolderId);
        const res = await axios.post(`${API_BASE}/add`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        const rawNote = res.data?.note ?? res.data ?? null;
        if (rawNote) {
          setNotes((prev) => [normalizeNote(rawNote), ...prev]);
          addToast("File imported as note", "success");
        }
      } catch {
        addToast("Error importing file", "error");
      } finally {
        setAdding(false);
        setAddingSkeletonCount(0);
      }
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const jsonData = JSON.parse(ev.target.result);
        if (Array.isArray(jsonData)) {
          setNotes((prev) => [
            ...jsonData.map((n) =>
              normalizeNote({
                ...n,
                _id: n._id ?? `import-${Date.now()}-${Math.random()}`,
                // ── FIX: import into the currently open folder ──
                folderId: activeFolderId ?? n.folderId ?? null,
              }),
            ),
            ...prev,
          ]);
          addToast(`Imported ${jsonData.length} note(s)`, "success");
        } else addToast("Invalid JSON format", "error");
      } catch {
        addToast("Error reading file", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Canvas Save ────────────────────────────────────────────────────────────
  const handleCanvasSave = async (blob, savedCanvasName) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("canvasImage", blob, "canvas.png");
      if (canvasNoteId) {
        if (savedCanvasName) formData.append("canvasName", savedCanvasName);
        if (canvasEditIndex !== null)
          formData.append("canvasIndex", canvasEditIndex);
        const res = await axios.put(
          `${API_BASE}/update/${canvasNoteId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        const updated = res.data?.note ?? res.data;
        if (updated) {
          setNotes((prev) =>
            prev.map((n) => {
              if (n._id !== canvasNoteId) return n;
              const norm = normalizeNote(updated);
              // Backend returned canvases array — use it directly
              if (norm.canvases && norm.canvases.length > 0) return norm;
              // Backend didn't return canvases[] — build it client-side
              // Get the existing canvases from the current note state (before update)
              const existingCanvases =
                n.canvases && n.canvases.length > 0
                  ? [...n.canvases]
                  : n.canvasImage
                    ? [
                        {
                          url: n.canvasImage,
                          name: n.canvasName || "Canvas Drawing",
                        },
                      ]
                    : [];
              const newEntry = {
                url: norm.canvasImage || updated.canvasImage,
                name: savedCanvasName || "Canvas Drawing",
              };
              if (
                canvasEditIndex !== null &&
                canvasEditIndex < existingCanvases.length
              ) {
                // Replace existing canvas at index
                existingCanvases[canvasEditIndex] = newEntry;
              } else {
                // Append new canvas
                existingCanvases.push(newEntry);
              }
              return { ...norm, canvases: existingCanvases };
            }),
          );
        }
      } else {
        // Standalone canvas — create a new note
        const cName = savedCanvasName || canvasName || "Canvas Drawing";
        formData.append("title", cName);
        formData.append("desc", "Created with White Canvas");
        formData.append("canvasName", cName);
        formData.append("priority", "medium");
        if (activeFolderId) formData.append("folderId", activeFolderId);
        const res = await axios.post(`${API_BASE}/add`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        const rawNote = res.data?.note ?? res.data;
        if (rawNote) setNotes((prev) => [normalizeNote(rawNote), ...prev]);
      }
      addToast("Canvas saved!", "success");
      setShowCanvas(false);
      setCanvasNoteId(null);
      setCanvasExistingUrl(null);
      setCanvasEditIndex(null);
      setCanvasName("Canvas Drawing");
    } catch (err) {
      addToast(
        `Canvas save failed: ${err.response?.data?.error || err.message}`,
        "error",
      );
    }
  };

  const userInitial = currentUser?.name?.charAt(0)?.toUpperCase() || "U";

  // ── Logout with modal confirmation ─────────────────────────────────────────
  const handleLogout = () => {
    showConfirm({
      title: "Sign Out",
      message: "Are you sure you want to log out of NoteFlow?",
      confirmLabel: "Log Out",
      confirmColor: "#6366f1",
      icon: <LogOut size={26} style={{ color: "#6366f1" }} />,
      onConfirm: () => {
        closeConfirm();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("notes-theme");
        addToast("Logged out", "success");
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      },
    });
  };

  // ── Click outside profile ─────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest(".profile-menu-container"))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (confirmModal.isOpen) {
          closeConfirm();
          return;
        }
        if (showCanvas) {
          setShowCanvas(false);
          return;
        }
        if (editingNote) {
          setEditingNote(null);
          return;
        }
        if (showForm) {
          setShowForm(false);
          return;
        }
        if (clickedId) {
          setClickedId(null);
          return;
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showCanvas, editingNote, showForm, clickedId, confirmModal.isOpen]);

  const inputStyle = {
    background: "var(--bg-tertiary)",
    borderColor: "var(--border-color)",
    color: "var(--text-primary)",
  };
  const selectStyle = {
    background: "var(--bg-tertiary)",
    borderColor: "var(--border-color)",
    color: "var(--text-primary)",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    appearance: "none",
  };

  const toastIcons = {
    success: <CheckCircle size={15} />,
    error: <AlertCircle size={15} />,
    warning: <AlertCircle size={15} />,
    info: <Info size={15} />,
  };
  const toastColors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  };

  const filterOptions = [
    { id: "all", label: "All" },
    { id: "starred", label: "⭐ Starred" },
    { id: "canvas", label: "🎨 Canvas" },
    { id: "high", label: "🔴 High" },
    { id: "medium", label: "🟡 Medium" },
    { id: "low", label: "🟢 Low" },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      className="min-h-screen transition-colors duration-300"
    >
      {/* ── Confirm Modal ── */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        confirmColor={confirmModal.confirmColor}
        icon={confirmModal.icon}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      {/* ── Folder Form Modal ── */}
      <FolderFormModal
        isOpen={folderFormModal.isOpen}
        folder={folderFormModal.folder}
        onClose={() => setFolderFormModal({ isOpen: false, folder: null })}
        onSave={folderFormModal.folder ? handleEditFolder : handleCreateFolder}
      />

      {/* ── Move to Folder Modal ── */}
      <MoveToFolderModal
        isOpen={moveModal.isOpen}
        note={moveModal.note}
        folders={folders}
        onClose={() => setMoveModal({ isOpen: false, note: null })}
        onMove={handleMoveNote}
      />

      {/* ── Folder Sidebar ── */}
      <FolderSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        folders={folders}
        activeFolderId={activeFolderId}
        onSelectFolder={(id) => {
          setActiveFolderId(id);
          setShowAllNotes(false);
          setSidebarOpen(false);
        }}
        notes={notes}
        onCreateFolder={() =>
          setFolderFormModal({ isOpen: true, folder: null })
        }
        onEditFolder={(f) => setFolderFormModal({ isOpen: true, folder: f })}
        onDeleteFolder={handleDeleteFolder}
      />

      {/* ── Download Format Modal ── */}
      {downloadModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            onClick={() => setDownloadModal(null)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm z-[10000] rounded-2xl animate-scale-in"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.12)" }}
              >
                <Download size={26} style={{ color: "#6366f1" }} />
              </div>
              <div>
                <h3
                  className="text-base font-bold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Download Note
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Choose a format — a <strong>NotesFlow</strong> watermark will
                  be included.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-1">
                <button
                  onClick={() => {
                    downloadNoteAsPdf(downloadModal);
                    setDownloadModal(null);
                  }}
                  className={btnPrimary + " flex-1 justify-center"}
                  style={{ background: "#ef4444" }}
                >
                  <FileText size={15} /> PDF
                </button>
                <button
                  onClick={() => {
                    downloadNoteAsDocx(downloadModal);
                    setDownloadModal(null);
                  }}
                  className={btnPrimary + " flex-1 justify-center"}
                  style={{ background: "#3b82f6" }}
                >
                  <File size={15} /> DOCX
                </button>
              </div>
              <button
                onClick={() => setDownloadModal(null)}
                className="text-xs font-medium transition-all hover:underline"
                style={{
                  color: "var(--text-tertiary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Toasts ── */}
      <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none max-w-[90vw] sm:max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[var(--shadow-lg)] pointer-events-auto animate-slide-in-right"
            style={{
              background: "var(--bg-secondary)",
              borderLeft: `4px solid ${toastColors[t.type] || toastColors.info}`,
              color: "var(--text-primary)",
            }}
          >
            <span style={{ color: toastColors[t.type] }}>
              {toastIcons[t.type]}
            </span>
            <span className="flex-1 text-sm font-medium">{t.message}</span>
            <button
              style={{ color: "var(--text-tertiary)" }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors text-lg leading-none"
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* ── Header ── */}
      <header
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
        }}
        className="border-b sticky top-0 z-[100] backdrop-blur-md shadow-[var(--shadow-sm)]"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen((o) => !o)}
                className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all hover:bg-[var(--bg-hover)] shrink-0"
                style={{
                  color: "var(--text-secondary)",
                  background: "var(--bg-tertiary)",
                }}
                title="Toggle folder sidebar"
              >
                <Folder size={17} />
              </button>
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-[var(--shadow-md)] shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                }}
              >
                <Sparkles size={20} />
              </div>
              <div className="min-w-0">
                <h1
                  className="text-lg sm:text-xl font-extrabold tracking-tight leading-none"
                  style={{ color: "var(--text-primary)" }}
                >
                  NoteFlow
                </h1>
                <p
                  className="text-[10px] sm:text-xs truncate mt-0.5 hidden sm:block"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Your intelligent notes workspace
                </p>
              </div>
            </div>

            {/* Desktop controls */}
            <div className="hidden md:flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all hover:bg-[var(--bg-hover)]"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-tertiary)",
                }}
                onClick={() => fetchNotes(null, false)}
              >
                <RefreshCw
                  size={11}
                  className={syncIndicator || loading ? "animate-spin" : ""}
                />
                <span className="hidden lg:inline">
                  Synced {timeAgo(lastRefreshed)}
                </span>
              </div>

              <input
                type="file"
                accept="*"
                onChange={importNotes}
                className="hidden"
                id="import-file"
              />

              {[
                {
                  icon: <Brush size={17} />,
                  title: "Open Canvas",
                  action: () => {
                    setShowCanvas(true);
                    setCanvasNoteId(null);
                    setCanvasExistingUrl(null);
                    setCanvasEditIndex(null);
                  },
                },
                {
                  icon: <Download size={17} />,
                  title: "Export PDF",
                  action: exportNotes,
                },
                {
                  icon: <Upload size={17} />,
                  title: "Import",
                  action: () => document.getElementById("import-file").click(),
                },
                {
                  icon: showArchived ? (
                    <EyeOff size={17} />
                  ) : (
                    <Archive size={17} />
                  ),
                  title: showArchived ? "Hide archived" : "Archived",
                  action: () => setShowArchived(!showArchived),
                },
                {
                  icon: darkMode ? <Sun size={17} /> : <Moon size={17} />,
                  title: darkMode ? "Light mode" : "Dark mode",
                  action: () => setDarkMode(!darkMode),
                },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  title={btn.title}
                  className={
                    iconBtnCls +
                    " hover:bg-[var(--bg-hover)] hover:text-[var(--accent-primary)]"
                  }
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {btn.icon}
                </button>
              ))}

              <button
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all shadow-[0_4px_14px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] active:translate-y-0 border-none"
                onClick={() => {
                  if (!showForm) setSelectedFiles([]);
                  setShowForm(!showForm);
                }}
              >
                <Plus size={17} /> New Note
              </button>

              {/* Profile */}
              <div className="relative profile-menu-container">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full border-none text-white text-sm font-bold flex items-center justify-center cursor-pointer shrink-0 shadow-[var(--shadow-md)] transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #ec4899)",
                  }}
                >
                  {userInitial}
                </button>
                {showProfileMenu && (
                  <div
                    className="absolute right-0 top-12 w-56 rounded-2xl shadow-[var(--shadow-xl)] border z-[200] overflow-hidden animate-scale-in"
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <div
                      className="px-4 py-4 border-b"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <p
                        className="font-bold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {currentUser?.name || "User"}
                      </p>
                      <p
                        className="text-xs mt-0.5 truncate"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {currentUser?.email || ""}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-red-50 border-none"
                        style={{ color: "#ef4444", background: "transparent" }}
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={iconBtnCls + " hover:bg-[var(--bg-hover)]"}
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white border-none shadow-[var(--shadow-sm)] transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                }}
              >
                <Plus size={20} />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={iconBtnCls + " hover:bg-[var(--bg-hover)]"}
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
              >
                <Menu size={18} />
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div
              className="md:hidden mt-3 pt-3 border-t animate-slide-in-up"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div className="flex flex-wrap gap-2 mb-3">
                <input
                  type="file"
                  accept="*"
                  onChange={importNotes}
                  className="hidden"
                  id="import-file-mobile"
                />
                {[
                  {
                    icon: <Brush size={16} />,
                    label: "Canvas",
                    action: () => {
                      setShowCanvas(true);
                      setCanvasNoteId(null);
                      setCanvasExistingUrl(null);
                      setCanvasEditIndex(null);
                      setMobileMenuOpen(false);
                    },
                  },
                  {
                    icon: <Download size={16} />,
                    label: "Export",
                    action: () => {
                      exportNotes();
                      setMobileMenuOpen(false);
                    },
                  },
                  {
                    icon: <Upload size={16} />,
                    label: "Import",
                    action: () => {
                      document.getElementById("import-file-mobile").click();
                      setMobileMenuOpen(false);
                    },
                  },
                  {
                    icon: <Archive size={16} />,
                    label: showArchived ? "Active" : "Archived",
                    action: () => {
                      setShowArchived(!showArchived);
                      setMobileMenuOpen(false);
                    },
                  },
                  {
                    icon: <LogOut size={16} />,
                    label: "Logout",
                    action: () => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    },
                  },
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.action}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-secondary)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    {btn.icon}
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Add Note Form ── */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
            onClick={() => setShowForm(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] max-w-[660px] z-[1000] animate-scale-in"
            style={{
              maxHeight: "94vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="border rounded-2xl shadow-[var(--shadow-xl)] flex flex-col overflow-hidden"
              style={{
                background: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
                maxHeight: "94vh",
              }}
            >
              {/* ── Gradient Header ── */}
              <div
                className="px-5 sm:px-7 pt-6 pb-5 shrink-0 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)",
                }}
              >
                {/* Background decoration */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                  style={{
                    background: "white",
                    transform: "translate(30%, -30%)",
                  }}
                />
                <div
                  className="absolute bottom-0 left-12 w-20 h-20 rounded-full opacity-10"
                  style={{
                    background: "white",
                    transform: "translate(-30%, 50%)",
                  }}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        <Plus size={15} className="text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg">
                        Create New Note
                      </h3>
                    </div>
                    <p className="text-white/70 text-xs">
                      {activeFolderId ? (
                        <span>
                          Adding to{" "}
                          <strong className="text-white/90">
                            {
                              folders.find((f) => f._id === activeFolderId)
                                ?.name
                            }
                          </strong>
                        </span>
                      ) : (
                        "Adding to Inbox"
                      )}
                    </p>
                  </div>
                  <button
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "white",
                    }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-white/25 hover:rotate-90 border-none shrink-0"
                    onClick={() => setShowForm(false)}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleAddNote}
                className="px-5 sm:px-6 py-5 flex flex-col gap-5 overflow-y-auto scrollbar-thin flex-1"
              >
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label
                    style={{ color: "var(--text-secondary)" }}
                    className={formLabelCls}
                  >
                    📝 Title
                  </label>
                  <input
                    type="text"
                    style={inputStyle}
                    className={`${formInputCls} border text-base font-semibold`}
                    placeholder="Give your note a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    autoFocus
                  />
                </div>

                {/* Tags + Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      style={{ color: "var(--text-secondary)" }}
                      className={formLabelCls}
                    >
                      🏷️ Tags
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      className={`${formInputCls} border`}
                      placeholder="tag1, tag2, tag3"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      style={{ color: "var(--text-secondary)" }}
                      className={formLabelCls}
                    >
                      ⚡ Priority
                    </label>
                    <select
                      style={{ ...selectStyle, ...inputStyle }}
                      className={`${formInputCls} border pr-10`}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🔴 High</option>
                    </select>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1.5">
                  <label
                    style={{ color: "var(--text-secondary)" }}
                    className={formLabelCls}
                  >
                    📄 Content
                  </label>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder={
                      "Write your note here...\n\nUse the toolbar above for formatting.\nOr type Markdown: **bold**, *italic*, # Heading"
                    }
                    minHeight={160}
                  />
                </div>

                {/* Attachments */}
                <div className="flex flex-col gap-1.5">
                  <label
                    style={{ color: "var(--text-secondary)" }}
                    className={formLabelCls}
                  >
                    📎 Attachments
                  </label>
                  <div>
                    <input
                      type="file"
                      multiple
                      key={selectedFiles.length === 0 ? "reset" : "active"}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files);
                        if (newFiles.length > 0) {
                          setSelectedFiles((prev) => {
                            const existingNames = new Set(
                              prev.map((f) => f.name + f.size),
                            );
                            const unique = newFiles.filter(
                              (f) => !existingNames.has(f.name + f.size),
                            );
                            return [...prev, ...unique];
                          });
                        }
                        // Reset input so same file can be re-added after removal
                        e.target.value = "";
                      }}
                      className="hidden"
                      id="note-files"
                    />
                    <label
                      htmlFor="note-files"
                      className="flex items-center gap-2 px-4 py-3 border-[1.5px] border-dashed rounded-xl text-sm font-medium cursor-pointer transition-all hover:border-[var(--accent-primary)] hover:bg-[var(--accent-light)]"
                      style={{
                        background: "var(--bg-tertiary)",
                        borderColor: "var(--border-color)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Upload
                        size={16}
                        style={{ color: "var(--accent-primary)" }}
                      />
                      {selectedFiles.length > 0
                        ? `${selectedFiles.length} file(s) selected — click to add more`
                        : "Attach files (images, PDFs, docs, etc.)"}
                    </label>
                  </div>
                  {/* New file previews */}
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                      {selectedFiles.map((file, idx) => {
                        const isImg = file.type.startsWith("image/");
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl border"
                            style={{
                              background: "var(--bg-tertiary)",
                              borderColor: "var(--border-color)",
                            }}
                          >
                            {isImg ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-10 h-10 object-cover rounded-lg border"
                                style={{ borderColor: "var(--border-color)" }}
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                style={{ background: "var(--bg-hover)" }}
                              >
                                <AttachmentIcon
                                  type={getAttachmentType({
                                    name: file.name,
                                    type: file.type,
                                  })}
                                  size={20}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-xs font-semibold truncate"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {file.name}
                              </p>
                              <p
                                className="text-[10px]"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedFiles((p) =>
                                  p.filter((_, i) => i !== idx),
                                )
                              }
                              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-red-100 border-none cursor-pointer"
                              style={{
                                color: "var(--error)",
                                background: "transparent",
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    className={
                      btnSecondary +
                      " flex-1 justify-center hover:bg-[var(--bg-hover)]"
                    }
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-color)",
                    }}
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={btnPrimary + " flex-1 justify-center"}
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                    }}
                    disabled={adding || (!title.trim() && !description.trim())}
                  >
                    {adding ? (
                      <>
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={15} /> Add Note
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
      {/* ── Main content ── */}
      <main
        className="main-content-area px-3 sm:px-6 py-4 sm:py-8 transition-all duration-300"
        style={{
          maxWidth: 1400,
          marginLeft: sidebarOpen ? 256 : 56,
          marginRight: "auto",
        }}
      >
        {/* Folder breadcrumb / context bar */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <div className="flex items-center gap-2">
            {activeFolderId ? (
              (() => {
                const f = folders.find((x) => x._id === activeFolderId);
                return f ? (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold"
                    style={{
                      background: `${f.color}12`,
                      borderColor: `${f.color}40`,
                      color: f.color,
                    }}
                  >
                    <span>{f.icon}</span>
                    <span>{f.name}</span>
                  </div>
                ) : null;
              })()
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold"
                style={{
                  background: "var(--accent-light)",
                  borderColor: "var(--accent-primary)",
                  color: "var(--accent-primary)",
                }}
              >
                <Inbox size={14} />
                <span>Inbox</span>
              </div>
            )}
          </div>
          {/* New Note + New Folder quick actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setFolderFormModal({ isOpen: true, folder: null })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <FolderPlus size={13} /> New Folder
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white cursor-pointer transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
              }}
            >
              <Plus size={13} /> New Note
            </button>
          </div>
        </div>
        {/* Search + controls bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              type="text"
              style={{
                background: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
              className={`${formInputCls} border pl-11 pr-4 py-2.5 rounded-2xl`}
              placeholder="Search notes by title, content, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--bg-hover)]"
                style={{ color: "var(--text-tertiary)" }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-xl border text-sm font-medium cursor-pointer outline-none"
              style={{ ...selectStyle, ...inputStyle, minWidth: "110px" }}
            >
              <option value="date">By Date</option>
              <option value="title">By Title</option>
              <option value="priority">By Priority</option>
            </select>
            <button
              onClick={() =>
                setSortOrder((o) => (o === "desc" ? "asc" : "desc"))
              }
              className={
                iconBtnCls +
                " hover:bg-[var(--bg-hover)] hover:text-[var(--accent-primary)] shrink-0"
              }
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
              }}
              title={
                sortOrder === "desc" ? "Sort ascending" : "Sort descending"
              }
            >
              {sortOrder === "desc" ? (
                <SortDesc size={17} />
              ) : (
                <SortAsc size={17} />
              )}
            </button>
            <button
              onClick={() =>
                setViewMode((v) => (v === "grid" ? "list" : "grid"))
              }
              className={
                iconBtnCls +
                " hover:bg-[var(--bg-hover)] hover:text-[var(--accent-primary)] shrink-0"
              }
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
              }}
              title="Toggle view"
            >
              <Layers size={17} />
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-thin">
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all hover:-translate-y-0.5"
              style={{
                background:
                  selectedFilter === f.id
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "var(--bg-secondary)",
                color:
                  selectedFilter === f.id ? "#fff" : "var(--text-secondary)",
                borderColor:
                  selectedFilter === f.id
                    ? "transparent"
                    : "var(--border-color)",
                boxShadow:
                  selectedFilter === f.id
                    ? "0 4px 12px rgba(99,102,241,0.35)"
                    : "none",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        {notes.length > 0 && (
          <div className="mb-6 animate-fade-in">
            <StatsBar notes={notes} />
          </div>
        )}

        {/* Notes count */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm font-bold"
            style={{ color: "var(--text-secondary)" }}
          >
            {showArchived ? "Archived" : "Active"} Notes
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: "var(--accent-light)",
                color: "var(--accent-primary)",
              }}
            >
              {filteredNotes.length}
            </span>
          </h2>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {syncIndicator && (
              <span className="animate-pulse">Syncing... </span>
            )}
            Auto-sync every 30s
          </p>
        </div>

        {/* Notes grid/list */}
        {loading ? (
          <div
            className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: "var(--accent-light)" }}
            >
              <Sparkles size={32} style={{ color: "var(--accent-primary)" }} />
            </div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {searchQuery
                ? "No matching notes"
                : showArchived
                  ? "No archived notes"
                  : "No notes yet"}
            </h3>
            <p
              className="text-sm mb-6 max-w-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              {searchQuery
                ? "Try a different search term"
                : "Create your first note to get started"}
            </p>
            {!searchQuery && !showArchived && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-bold transition-all hover:-translate-y-0.5 border-none cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 6px 20px rgba(99,102,241,0.4)",
                }}
              >
                <Plus size={18} /> Create Note
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 max-w-3xl"}`}
          >
            {addingSkeletonCount > 0 && <SkeletonCard />}
            {filteredNotes.map((note, idx) => (
              <div
                key={note._id}
                style={{ animationDelay: `${idx * 0.04}s` }}
                className="animate-slide-in-up"
              >
                <NoteCard
                  note={note}
                  isExpanded={clickedId === note._id}
                  isHovered={hoveredId === note._id}
                  onExpand={() =>
                    setClickedId((id) => (id === note._id ? null : note._id))
                  }
                  onHover={() => setHoveredId(note._id)}
                  onLeave={() => setHoveredId(null)}
                  onView={(n) => setViewingNote(n)}
                  onEdit={(n) => {
                    setEditingNote({ ...n });
                    setSelectedFiles([]);
                  }}
                  onDelete={handleDeleteNote}
                  onStar={toggleStar}
                  onArchive={toggleArchive}
                  onCopy={copyNote}
                  onShare={shareNote}
                  onDownload={downloadNote}
                  onMove={(n) => setMoveModal({ isOpen: true, note: n })}
                  onCanvas={(n) => {
                    setShowCanvas(true);
                    setCanvasNoteId(n._id);
                    setCanvasExistingUrl(null); // always new canvas
                    setCanvasEditIndex(null);
                  }}
                  getFullUrl={getFullUrl}
                  formatDate={formatDate}
                  getPriorityColor={getPriorityColor}
                  deletingId={deletingId}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── View Note Modal ── */}
      {viewingNote && (
        <ViewNoteModal
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          getFullUrl={getFullUrl}
          formatDate={formatDate}
          getPriorityColor={getPriorityColor}
          onEdit={(n) => {
            setEditingNote({ ...n });
            setSelectedFiles([]);
          }}
          onDelete={handleDeleteNote}
          onCanvas={(n, ci) => {
            setShowCanvas(true);
            setCanvasNoteId(n._id);
            if (ci !== undefined && ci !== null) {
              const canvasList =
                n.canvases?.length > 0
                  ? n.canvases
                  : [
                      {
                        url: n.canvasImage,
                        name: n.canvasName || "Canvas Drawing",
                      },
                    ];
              setCanvasExistingUrl(
                canvasList[ci] ? getFullUrl(canvasList[ci].url) : null,
              );
              setCanvasEditIndex(ci);
            } else {
              setCanvasExistingUrl(null);
              setCanvasEditIndex(null);
            }
          }}
          deletingId={deletingId}
        />
      )}

      {/* ── Edit Modal ── */}
      {editingNote && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
            onClick={() => setEditingNote(null)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] max-w-[650px] z-[1000]"
            style={{
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="border rounded-2xl shadow-[var(--shadow-xl)] animate-scale-in flex flex-col overflow-hidden"
              style={{
                maxHeight: "92vh",
                background: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <div
                className="px-5 sm:px-6 py-5 border-b flex justify-between items-center shrink-0"
                style={{
                  borderColor: "var(--border-color)",
                  background: "var(--bg-secondary)",
                  zIndex: 1,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                    }}
                  >
                    <Edit3 size={16} />
                  </div>
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Edit Note
                  </h3>
                </div>
                <button
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-[var(--bg-hover)] hover:rotate-90 border-none"
                  onClick={() => setEditingNote(null)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-5 sm:px-6 py-5 flex flex-col gap-4 overflow-y-auto scrollbar-thin flex-1">
                <div className="flex flex-col gap-1.5">
                  <label
                    style={{ color: "var(--text-secondary)" }}
                    className={formLabelCls}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    style={inputStyle}
                    className={`${formInputCls} border`}
                    value={editingNote.title || ""}
                    onChange={(e) =>
                      setEditingNote((p) => ({ ...p, title: e.target.value }))
                    }
                    maxLength={100}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      style={{ color: "var(--text-secondary)" }}
                      className={formLabelCls}
                    >
                      Tags
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      className={`${formInputCls} border`}
                      value={editingNote.tags?.join(", ") || ""}
                      onChange={(e) =>
                        setEditingNote((p) => ({
                          ...p,
                          tags: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      style={{ color: "var(--text-secondary)" }}
                      className={formLabelCls}
                    >
                      Priority
                    </label>
                    <select
                      style={{ ...selectStyle, ...inputStyle }}
                      className={`${formInputCls} border pr-10`}
                      value={editingNote.priority || "medium"}
                      onChange={(e) =>
                        setEditingNote((p) => ({
                          ...p,
                          priority: e.target.value,
                        }))
                      }
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🔴 High</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    style={{ color: "var(--text-secondary)" }}
                    className={formLabelCls}
                  >
                    Content
                  </label>
                  <RichTextEditor
                    value={editingNote.description || ""}
                    onChange={(val) =>
                      setEditingNote((p) => ({ ...p, description: val }))
                    }
                    placeholder="Write your note content here..."
                    minHeight={140}
                  />
                </div>
                {/* Canvas section */}
                <div className="flex flex-col gap-1.5">
                  <label
                    style={{ color: "var(--text-secondary)" }}
                    className={formLabelCls}
                  >
                    Canvas Drawings (
                    {
                      (editingNote.canvases?.length > 0
                        ? editingNote.canvases
                        : editingNote.canvasImage
                          ? [
                              {
                                url: editingNote.canvasImage,
                                name:
                                  editingNote.canvasName || "Canvas Drawing",
                              },
                            ]
                          : []
                      ).length
                    }
                    )
                  </label>
                  {/* Existing canvases */}
                  {(() => {
                    const canvasList =
                      editingNote.canvases?.length > 0
                        ? editingNote.canvases
                        : editingNote.canvasImage
                          ? [
                              {
                                url: editingNote.canvasImage,
                                name:
                                  editingNote.canvasName || "Canvas Drawing",
                              },
                            ]
                          : [];
                    return canvasList.map((cv, ci) => (
                      <div
                        key={ci}
                        className="relative rounded-xl overflow-hidden border"
                        style={{ borderColor: "var(--border-color)" }}
                      >
                        <div
                          className="flex items-center justify-between px-3 py-1.5"
                          style={{
                            background: "var(--bg-tertiary)",
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          <span
                            className="text-xs font-semibold flex items-center gap-1"
                            style={{ color: "#6366f1" }}
                          >
                            <Brush size={10} /> {cv.name || `Canvas ${ci + 1}`}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setShowCanvas(true);
                                setCanvasNoteId(editingNote._id);
                                setCanvasExistingUrl(getFullUrl(cv.url));
                                setCanvasEditIndex(ci);
                                setEditingNote(null);
                              }}
                              className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg font-semibold cursor-pointer border-none"
                              style={{
                                background: "rgba(99,102,241,0.12)",
                                color: "#6366f1",
                              }}
                            >
                              <Pencil size={9} /> Edit
                            </button>
                            <button
                              onClick={() =>
                                setEditingNote((p) => ({
                                  ...p,
                                  canvases: (p.canvases?.length > 0
                                    ? p.canvases
                                    : [
                                        {
                                          url: p.canvasImage,
                                          name:
                                            p.canvasName || "Canvas Drawing",
                                        },
                                      ]
                                  ).filter((_, i) => i !== ci),
                                  canvasImage:
                                    ci === 0 && (p.canvases?.length || 1) === 1
                                      ? null
                                      : p.canvasImage,
                                }))
                              }
                              className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg font-semibold cursor-pointer border-none"
                              style={{
                                background: "rgba(239,68,68,0.1)",
                                color: "#ef4444",
                              }}
                            >
                              <Trash2 size={9} /> Remove
                            </button>
                          </div>
                        </div>
                        <img
                          src={getFullUrl(cv.url)}
                          alt={cv.name || `Canvas ${ci + 1}`}
                          className="w-full max-h-32 object-cover"
                          style={{ background: "#fff" }}
                        />
                      </div>
                    ));
                  })()}
                  {/* Add new canvas button */}
                  <button
                    onClick={() => {
                      setShowCanvas(true);
                      setCanvasNoteId(editingNote._id);
                      setCanvasExistingUrl(null);
                      setCanvasEditIndex(null);
                      setEditingNote(null);
                    }}
                    className="flex items-center gap-2 px-4 py-3 border-[1.5px] border-dashed rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-[var(--bg-hover)] hover:border-[var(--accent-primary)]"
                    style={{
                      background: "var(--bg-tertiary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Brush size={16} style={{ color: "#6366f1" }} />
                    <span>Add a new canvas drawing</span>
                  </button>
                </div>
                {/* Attachments */}
                <div className="flex flex-col gap-1.5">
                  <label
                    style={{ color: "var(--text-secondary)" }}
                    className={formLabelCls}
                  >
                    Attachments
                  </label>
                  {/* Existing attachments */}
                  {editingNote.attachments?.length > 0 && (
                    <div className="flex flex-col gap-2 mb-2">
                      {editingNote.attachments.map((att, idx) => {
                        const atype = getAttachmentType(att);
                        const isImg = atype === "image";
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl border"
                            style={{
                              background: "var(--bg-tertiary)",
                              borderColor: "var(--border-color)",
                            }}
                          >
                            {isImg ? (
                              <img
                                src={getFullUrl(att.url)}
                                alt={att.name}
                                className="w-10 h-10 object-cover rounded-lg border"
                                style={{ borderColor: "var(--border-color)" }}
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                style={{ background: "var(--bg-hover)" }}
                              >
                                <AttachmentIcon type={atype} size={20} />
                              </div>
                            )}
                            <span
                              className="flex-1 min-w-0 text-xs font-medium truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {att.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingNote((p) => ({
                                  ...p,
                                  attachments: p.attachments.filter(
                                    (_, i) => i !== idx,
                                  ),
                                }))
                              }
                              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-red-100 border-none cursor-pointer"
                              style={{
                                color: "var(--error)",
                                background: "transparent",
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <input
                    type="file"
                    multiple
                    key={
                      selectedFiles.length === 0 ? "edit-reset" : "edit-active"
                    }
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files);
                      if (newFiles.length > 0) {
                        setSelectedFiles((prev) => {
                          const existingNames = new Set(
                            prev.map((f) => f.name + f.size),
                          );
                          const unique = newFiles.filter(
                            (f) => !existingNames.has(f.name + f.size),
                          );
                          return [...prev, ...unique];
                        });
                      }
                      e.target.value = "";
                    }}
                    className="hidden"
                    id="edit-note-files"
                  />
                  <label
                    htmlFor="edit-note-files"
                    className="flex items-center gap-2 px-4 py-2.5 border-[1.5px] border-dashed rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-[var(--bg-hover)] hover:border-[var(--accent-primary)]"
                    style={{
                      background: "var(--bg-tertiary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Upload size={16} />
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} new file(s) selected — click to add more`
                      : "Add more files"}
                  </label>
                  {/* New file previews */}
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                      {selectedFiles.map((file, idx) => {
                        const isImg = file.type.startsWith("image/");
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl border"
                            style={{
                              background: "var(--bg-tertiary)",
                              borderColor: "var(--border-color)",
                            }}
                          >
                            {isImg ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-10 h-10 object-cover rounded-lg border"
                                style={{ borderColor: "var(--border-color)" }}
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                style={{ background: "var(--bg-hover)" }}
                              >
                                <AttachmentIcon
                                  type={getAttachmentType({
                                    name: file.name,
                                    type: file.type,
                                  })}
                                  size={20}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-xs font-semibold truncate"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {file.name}
                              </p>
                              <p
                                className="text-[10px]"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedFiles((p) =>
                                  p.filter((_, i) => i !== idx),
                                )
                              }
                              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-red-100 border-none cursor-pointer"
                              style={{
                                color: "var(--error)",
                                background: "transparent",
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{ borderColor: "var(--border-color)" }}
                className="px-5 sm:px-6 py-4 border-t flex flex-col sm:flex-row justify-end gap-3 shrink-0"
              >
                <button
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border-color)",
                  }}
                  className={
                    btnSecondary +
                    " hover:bg-[var(--bg-hover)] w-full sm:w-auto justify-center"
                  }
                  onClick={() => setEditingNote(null)}
                  disabled={editingSaving}
                >
                  Cancel
                </button>
                <button
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  }}
                  className={
                    btnPrimary +
                    " hover:opacity-90 w-full sm:w-auto justify-center"
                  }
                  onClick={handleEditSave}
                  disabled={editingSaving}
                >
                  {editingSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Canvas Modal ── */}
      {showCanvas && (
        <WhiteCanvas
          onClose={() => {
            setShowCanvas(false);
            setCanvasNoteId(null);
            setCanvasExistingUrl(null);
            setCanvasEditIndex(null);
          }}
          onSave={handleCanvasSave}
          existingCanvasUrl={canvasExistingUrl}
          noteId={canvasNoteId}
          initialCanvasName={
            canvasNoteId && canvasEditIndex !== null
              ? (() => {
                  const n = notes.find((x) => x._id === canvasNoteId);
                  return (
                    n?.canvases?.[canvasEditIndex]?.name || "Canvas Drawing"
                  );
                })()
              : canvasNoteId
                ? notes.find((n) => n._id === canvasNoteId)?.canvasName ||
                  "Canvas Drawing"
                : canvasName
          }
        />
      )}

      {/* ── Floating buttons ── */}
      <div className="fixed bottom-5 right-4 sm:right-6 flex flex-col gap-2.5 z-[1000]">
        <button
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          className="fab-mobile w-10 h-10 sm:w-14 sm:h-14 rounded-2xl text-white border-none flex items-center justify-center shadow-[0_6px_24px_rgba(99,102,241,0.5)] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_30px_rgba(99,102,241,0.6)] active:translate-y-0 active:scale-95"
          onClick={() => {
            setShowCanvas(true);
            setCanvasNoteId(null);
            setCanvasExistingUrl(null);
            setCanvasEditIndex(null);
          }}
          title="Open Canvas"
        >
          <Brush size={18} className="sm:hidden" />
          <Brush size={22} className="hidden sm:block" />
        </button>
        <button
          style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
          className="fab-mobile w-10 h-10 sm:w-14 sm:h-14 rounded-2xl text-white border-none flex items-center justify-center shadow-[0_6px_24px_rgba(99,102,241,0.45)] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_30px_rgba(99,102,241,0.55)] active:translate-y-0 active:scale-95"
          onClick={() => setIsAIAgentOpen(true)}
          title="AI Assistant"
        >
          <Bot size={18} className="sm:hidden" />
          <Bot size={22} className="hidden sm:block" />
        </button>
      </div>

      {/* ── AI Agent ── */}
      <AIAgentSidebar
        isOpen={isAIAgentOpen}
        onClose={() => setIsAIAgentOpen(false)}
      />
    </div>
  );
};

export default Notes;
