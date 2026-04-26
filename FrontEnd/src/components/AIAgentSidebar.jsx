import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Copy,
  Check,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  RotateCcw,
  ChevronDown,
  AlertCircle,
  Zap,
  Plus,
  MessageSquare,
  Clock,
  ChevronLeft,
  MoreHorizontal,
  Pencil,
  PanelLeftOpen,
  History,
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

/* ─────────────────────────────────────────────────────────────────────────────
   STORAGE HELPERS  — sessions stored in localStorage per-user
───────────────────────────────────────────────────────────────────────────── */
const STORAGE_KEY = "nf_chat_sessions";

const loadSessions = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveSessions = (sessions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    /* quota exceeded – fail silently */
  }
};

/* generate a ~6-word title from the first user message */
const deriveTitle = (text = "") => {
  const words = text
    .trim()
    .replace(/[#*`_~]/g, "")
    .split(/\s+/)
    .slice(0, 7);
  if (!words.length) return "New Chat";
  const title = words.join(" ");
  return title.length > 48 ? title.slice(0, 48) + "…" : title;
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/* ─────────────────────────────────────────────────────────────────────────────
   INJECT STYLES
───────────────────────────────────────────────────────────────────────────── */
const injectAIStyles = () => {
  if (document.getElementById("ai-sidebar-styles-v3")) return;
  const s = document.createElement("style");
  s.id = "ai-sidebar-styles-v3";
  s.textContent = `
    /* ── typing dots ── */
    @keyframes ai-dot-bounce {
      0%,80%,100% { transform:translateY(0); opacity:.4; }
      40%          { transform:translateY(-5px); opacity:1; }
    }
    .ai-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--accent-primary); animation:ai-dot-bounce 1.4s ease-in-out infinite; }
    .ai-dot:nth-child(2){ animation-delay:.16s; }
    .ai-dot:nth-child(3){ animation-delay:.32s; }

    /* ── message in ── */
    @keyframes ai-msg-in {
      from { opacity:0; transform:translateY(8px) scale(.98); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }
    .ai-msg { animation:ai-msg-in .24s cubic-bezier(.22,1,.36,1) both; }

    /* ── session slide-in ── */
    @keyframes ai-sess-in {
      from { opacity:0; transform:translateX(-10px); }
      to   { opacity:1; transform:translateX(0); }
    }
    .ai-sess-item { animation:ai-sess-in .22s cubic-bezier(.22,1,.36,1) both; }

    /* ── scroll pulse ── */
    @keyframes ai-scroll-pulse {
      0%,100%{ box-shadow:0 0 0 0 rgba(99,102,241,.4); }
      50%    { box-shadow:0 0 0 8px rgba(99,102,241,0); }
    }
    .ai-scroll-pulse { animation:ai-scroll-pulse 2s ease-in-out infinite; }

    @keyframes ai-spin { to{ transform:rotate(360deg); } }
    .ai-spin { animation:ai-spin .85s linear infinite; }

    @keyframes ai-mic-pulse {
      0%,100%{ box-shadow:0 0 0 0 rgba(239,68,68,.5); }
      50%    { box-shadow:0 0 0 10px rgba(239,68,68,0); }
    }
    .ai-mic-active { animation:ai-mic-pulse 1.2s ease-in-out infinite; }

    /* ── gradient text ── */
    .ai-gradient-text {
      background:linear-gradient(135deg,var(--gradient-start,#1e40af),var(--gradient-end,#7c3aed));
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }

    /* ── markdown ── */
    .ai-prose { font-size:.875rem; line-height:1.75; color:var(--text-primary); }
    .ai-prose p  { margin:0 0 .55em; }
    .ai-prose p:last-child { margin-bottom:0; }
    .ai-prose h1 { font-size:1.05rem; font-weight:800; margin:.85em 0 .35em; letter-spacing:-.3px; }
    .ai-prose h2 { font-size:.975rem; font-weight:800; margin:.75em 0 .3em; }
    .ai-prose h3 { font-size:.9rem;  font-weight:700; margin:.65em 0 .28em; }
    .ai-prose h1:first-child,.ai-prose h2:first-child,.ai-prose h3:first-child { margin-top:0; }
    .ai-prose ul { margin:.35em 0 .65em; padding-left:1.2em; list-style:none; }
    .ai-prose ul li { position:relative; padding-left:.05em; margin-bottom:.28em; }
    .ai-prose ul li::before {
      content:''; position:absolute; left:-1em; top:.55em;
      width:5px; height:5px; border-radius:50%;
      background:var(--accent-primary); opacity:.8;
    }
    .ai-prose ol { margin:.35em 0 .65em; padding-left:1.4em; }
    .ai-prose ol li { margin-bottom:.28em; }
    .ai-prose strong { font-weight:700; color:var(--text-primary); }
    .ai-prose em { font-style:italic; opacity:.9; }
    .ai-prose a { color:var(--accent-primary); text-decoration:underline; text-underline-offset:2px; }
    .ai-prose blockquote {
      border-left:3px solid var(--accent-primary); margin:.55em 0;
      padding:.35em 0 .35em .9em; background:var(--accent-light);
      border-radius:0 8px 8px 0; font-style:italic; color:var(--text-secondary);
    }
    .ai-prose hr { border:none; border-top:1.5px solid var(--border-color); margin:.8em 0; }
    .ai-prose table { width:100%; border-collapse:collapse; font-size:.825rem; margin:.55em 0; }
    .ai-prose th { background:var(--accent-light); padding:6px 10px; text-align:left; font-weight:700; border:1px solid var(--border-color); color:var(--accent-primary); font-size:.775rem; text-transform:uppercase; letter-spacing:.4px; }
    .ai-prose td { padding:6px 10px; border:1px solid var(--border-color); vertical-align:top; }
    .ai-prose tr:nth-child(even) td { background:var(--bg-tertiary); }
    .ai-prose code {
      background:var(--bg-hover); padding:1px 5px; border-radius:5px;
      font-family:'JetBrains Mono','Fira Code',monospace; font-size:.82em;
      color:var(--accent-primary); border:1px solid var(--border-color); white-space:nowrap;
    }

    /* ── code block ── */
    .ai-code-block { margin:.55em 0; border-radius:11px; overflow:hidden; border:1px solid rgba(99,102,241,.22); box-shadow:0 2px 12px rgba(0,0,0,.15); }
    .ai-code-header { display:flex; align-items:center; justify-content:space-between; padding:7px 13px; background:#1a1d2e; border-bottom:1px solid rgba(255,255,255,.06); }
    .ai-code-lang { font-family:'JetBrains Mono',monospace; font-size:.72rem; font-weight:600; color:rgba(167,139,250,.9); text-transform:uppercase; letter-spacing:.8px; display:flex; align-items:center; gap:5px; }
    .ai-code-lang::before { content:''; display:inline-block; width:7px; height:7px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#8b5cf6); }
    .ai-code-copy-btn { display:flex; align-items:center; gap:4px; padding:3px 9px; border-radius:6px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); color:rgba(255,255,255,.6); font-size:10.5px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .18s; }
    .ai-code-copy-btn:hover { background:rgba(99,102,241,.25); color:#fff; border-color:rgba(99,102,241,.4); }
    .ai-code-copy-btn.copied { background:rgba(16,185,129,.2); color:#34d399; border-color:rgba(16,185,129,.3); }
    .ai-code-block pre { margin:0!important; border-radius:0!important; }

    /* ── scrollbar ── */
    .ai-scrollbar::-webkit-scrollbar { width:4px; }
    .ai-scrollbar::-webkit-scrollbar-track { background:transparent; }
    .ai-scrollbar::-webkit-scrollbar-thumb { background:var(--border-hover,#cbd5e1); border-radius:999px; }

    /* ── resize handle ── */
    .ai-resize-handle:hover { background:var(--accent-primary)!important; opacity:.6; }

    /* ── copy btn hover ── */
    .ai-msg-group:hover .ai-msg-copy { opacity:1!important; }
    .ai-msg-copy { opacity:0; transition:opacity .18s; }

    /* ── history session item hover ── */
    .ai-sess-btn { transition:all .18s; }
    .ai-sess-btn:hover { background:var(--bg-hover)!important; }
    .ai-sess-btn.active { background:var(--accent-light)!important; border-color:rgba(99,102,241,.3)!important; }

    /* ── history panel slide ── */
    @keyframes ai-hist-in {
      from { transform:translateX(-100%); opacity:0; }
      to   { transform:translateX(0); opacity:1; }
    }
    .ai-hist-panel { animation:ai-hist-in .28s cubic-bezier(.22,1,.36,1) both; }

    /* ── mobile ── */
    @media (max-width:640px) {
      .ai-sidebar-wrap { width:100%!important; max-width:100%!important; }
      .ai-prose { font-size:.8125rem!important; }
      .ai-prose h1 { font-size:.95rem!important; }
      .ai-prose h2 { font-size:.875rem!important; }
      .ai-prose h3 { font-size:.825rem!important; }
      .ai-prose table { font-size:.75rem!important; }
      .ai-msg-label { font-size:10px!important; }
      .ai-msg-time  { font-size:9px!important; }
      .ai-input-txt { font-size:.8125rem!important; }
      .ai-hint-txt  { display:none!important; }
      .ai-hist-panel { width:100%!important; }
    }
    @media (min-width:641px) {
      .ai-hist-panel { width:260px!important; }
    }
  `;
  document.head.appendChild(s);
};

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const fmt = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const fmtDate = (d) => {
  if (!d) return "";
  const now = new Date();
  const dt = new Date(d);
  const diff = (now - dt) / 864e5;
  if (diff < 1) return "Today";
  if (diff < 2) return "Yesterday";
  if (diff < 7) return dt.toLocaleDateString("en-US", { weekday: "long" });
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const groupByDate = (sessions) => {
  const groups = {};
  sessions.forEach((s) => {
    const label = fmtDate(s.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  });
  return groups;
};

const PROMPTS = [
  { icon: "🔍", text: "Summarize my recent notes" },
  { icon: "💡", text: "Find key ideas in my notes" },
  { icon: "✍️", text: "Help me draft a note" },
  { icon: "📊", text: "Organize and tag my ideas" },
];

const WELCOME_TEXT =
  "Hello! I'm your **NoteFlow AI Assistant**. I can help you:\n\n- 🔍 Search and summarize your notes\n- ✍️ Draft and improve content\n- 💡 Answer questions from your notes\n- 📊 Organize and categorize ideas\n\nWhat would you like to explore today?";

/* ─────────────────────────────────────────────────────────────────────────────
   CODE BLOCK
───────────────────────────────────────────────────────────────────────────── */
const CodeBlock = ({ inline, className, children }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");
  const lang = match?.[1] ?? "code";

  if (inline) return <code className={className}>{children}</code>;

  return (
    <div className="ai-code-block">
      <div className="ai-code-header">
        <span className="ai-code-lang">{lang}</span>
        <button
          className={`ai-code-copy-btn${copied ? " copied" : ""}`}
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? (
            <>
              <Check size={10} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={10} />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={atomDark}
        language={lang}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: ".78rem",
          background: "#0d0f1c",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────────────────────────── */
const MessageBubble = ({ msg, onCopy, copiedId, getFullUrl }) => {
  const isAI = msg.sender === "ai";
  const isErr = msg.isError;

  return (
    <div
      className={`ai-msg ai-msg-group`}
      style={{
        display: "flex",
        gap: 9,
        alignItems: "flex-start",
        maxWidth: "93%",
        alignSelf: isAI ? "flex-start" : "flex-end",
        flexDirection: isAI ? "row" : "row-reverse",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isAI
            ? isErr
              ? "rgba(239,68,68,.12)"
              : "linear-gradient(135deg,rgba(99,102,241,.14),rgba(139,92,246,.14))"
            : "linear-gradient(135deg,var(--gradient-start,#1e40af),var(--gradient-end,#7c3aed))",
          border: isAI
            ? `1.5px solid ${isErr ? "rgba(239,68,68,.25)" : "rgba(99,102,241,.2)"}`
            : "none",
          boxShadow: isAI ? "none" : "0 2px 7px rgba(99,102,241,.35)",
        }}
      >
        {isAI ? (
          isErr ? (
            <AlertCircle size={13} style={{ color: "#ef4444" }} />
          ) : (
            <Bot size={13} style={{ color: "var(--accent-primary)" }} />
          )
        ) : (
          <User size={13} style={{ color: "#fff" }} />
        )}
      </div>

      {/* Column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          minWidth: 0,
          flex: 1,
          alignItems: isAI ? "flex-start" : "flex-end",
        }}
      >
        {/* Label + time */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            className="ai-msg-label"
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: ".3px",
              color: isAI ? "var(--accent-primary)" : "var(--text-tertiary)",
            }}
          >
            {isAI ? "AI Assistant" : "You"}
          </span>
          {msg.timestamp && (
            <span
              className="ai-msg-time"
              style={{ fontSize: 9.5, color: "var(--text-tertiary)" }}
            >
              {fmt(msg.timestamp)}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          style={{
            padding: isAI ? "11px 14px" : "9px 13px",
            borderRadius: isAI ? "3px 13px 13px 13px" : "13px 3px 13px 13px",
            background: isAI
              ? isErr
                ? "rgba(239,68,68,.07)"
                : "var(--bg-tertiary)"
              : "linear-gradient(135deg,var(--gradient-start,#1e40af),var(--gradient-end,#7c3aed))",
            border: isAI
              ? `1px solid ${isErr ? "rgba(239,68,68,.2)" : "var(--border-color)"}`
              : "none",
            boxShadow: isAI
              ? "0 1px 3px rgba(0,0,0,.06)"
              : "0 3px 14px rgba(99,102,241,.28)",
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          {isAI ? (
            <div className="ai-prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ code: CodeBlock }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ) : (
            <>
              <p
                className="ai-input-txt"
                style={{
                  margin: 0,
                  fontSize: ".875rem",
                  lineHeight: 1.6,
                  color: "#fff",
                }}
              >
                {msg.text}
              </p>
              {msg.files?.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 5,
                    marginTop: 8,
                  }}
                >
                  {msg.files.map((f, i) => (
                    <div key={i}>
                      {f.type?.includes("image") ? (
                        <div
                          style={{
                            borderRadius: 7,
                            overflow: "hidden",
                            background: "rgba(255,255,255,.15)",
                            maxWidth: 150,
                          }}
                        >
                          <img
                            src={getFullUrl(f.path)}
                            alt={f.name}
                            style={{
                              display: "block",
                              maxWidth: "100%",
                              maxHeight: 110,
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 9px",
                            borderRadius: 7,
                            background: "rgba(255,255,255,.15)",
                            fontSize: 11,
                            color: "#fff",
                            fontWeight: 500,
                          }}
                        >
                          <FileText size={11} />
                          <span
                            style={{
                              maxWidth: 110,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {f.name}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Copy btn */}
        <button
          className="ai-msg-copy"
          onClick={() => onCopy(msg.text, msg.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: "2px 8px",
            borderRadius: 6,
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-color)",
            color: copiedId === msg.id ? "#10b981" : "var(--text-tertiary)",
            fontSize: 10.5,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all .18s",
          }}
        >
          {copiedId === msg.id ? (
            <>
              <Check size={10} />
              Copied
            </>
          ) : (
            <>
              <Copy size={10} />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   WELCOME SCREEN
───────────────────────────────────────────────────────────────────────────── */
const WelcomeScreen = ({ onPromptClick }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      padding: "28px 16px",
      textAlign: "center",
    }}
  >
    <div
      style={{
        width: 58,
        height: 58,
        borderRadius: 18,
        marginBottom: 16,
        background:
          "linear-gradient(135deg,rgba(99,102,241,.14),rgba(139,92,246,.14))",
        border: "1.5px solid rgba(99,102,241,.24)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 22px rgba(99,102,241,.14)",
      }}
    >
      <Sparkles size={24} style={{ color: "var(--accent-primary)" }} />
    </div>
    <h3
      className="ai-gradient-text"
      style={{
        fontSize: "1rem",
        fontWeight: 900,
        margin: "0 0 7px",
        letterSpacing: "-.2px",
      }}
    >
      NoteFlow AI
    </h3>
    <p
      style={{
        fontSize: 12.5,
        color: "var(--text-tertiary)",
        margin: "0 0 22px",
        maxWidth: 240,
        lineHeight: 1.55,
      }}
    >
      Ask me anything about your notes. I'll search, summarize, and help you
      think.
    </p>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 7,
        width: "100%",
        maxWidth: 290,
      }}
    >
      {PROMPTS.map((p) => (
        <button
          key={p.text}
          onClick={() => onPromptClick(p.text)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 11px",
            borderRadius: 9,
            textAlign: "left",
            background: "var(--bg-tertiary)",
            border: "1.5px solid var(--border-color)",
            color: "var(--text-secondary)",
            fontSize: 11.5,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all .18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-primary)";
            e.currentTarget.style.color = "var(--accent-primary)";
            e.currentTarget.style.background = "var(--accent-light)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-color)";
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.background = "var(--bg-tertiary)";
          }}
        >
          <span style={{ fontSize: 14 }}>{p.icon}</span>
          <span style={{ lineHeight: 1.3 }}>{p.text}</span>
        </button>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────────────────────────────────────── */
const TypingIndicator = () => (
  <div
    className="ai-msg"
    style={{
      display: "flex",
      gap: 9,
      alignItems: "flex-start",
      maxWidth: "93%",
    }}
  >
    <div
      style={{
        flexShrink: 0,
        width: 28,
        height: 28,
        borderRadius: 9,
        background:
          "linear-gradient(135deg,rgba(99,102,241,.14),rgba(139,92,246,.14))",
        border: "1.5px solid rgba(99,102,241,.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Bot size={13} style={{ color: "var(--accent-primary)" }} />
    </div>
    <div
      style={{
        padding: "11px 16px",
        borderRadius: "3px 13px 13px 13px",
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border-color)",
        boxShadow: "0 1px 3px rgba(0,0,0,.06)",
      }}
    >
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span className="ai-dot" />
        <span className="ai-dot" />
        <span className="ai-dot" />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   CONFIRM MODAL
───────────────────────────────────────────────────────────────────────────── */
const Modal = ({
  icon,
  title,
  desc,
  confirmLabel,
  confirmStyle,
  onConfirm,
  onCancel,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 20,
      background: "rgba(0,0,0,.4)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}
    onClick={onCancel}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: 18,
        padding: "26px 26px 22px",
        maxWidth: 290,
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,.28)",
        textAlign: "center",
      }}
    >
      {icon}
      <h4
        style={{
          margin: "0 0 7px",
          fontSize: ".95rem",
          fontWeight: 800,
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h4>
      <p
        style={{
          margin: "0 0 20px",
          fontSize: 12.5,
          color: "var(--text-secondary)",
          lineHeight: 1.55,
        }}
      >
        {desc}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "9px",
            borderRadius: 9,
            background: "var(--bg-tertiary)",
            border: "1.5px solid var(--border-color)",
            color: "var(--text-primary)",
            fontWeight: 700,
            fontSize: 12.5,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: "9px",
            borderRadius: 9,
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: 12.5,
            cursor: "pointer",
            fontFamily: "inherit",
            ...confirmStyle,
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   HISTORY PANEL  (left slide-in, ChatGPT-style)
───────────────────────────────────────────────────────────────────────────── */
const HistoryPanel = ({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onClose,
}) => {
  const [renaming, setRenaming] = useState(null); // session id being renamed
  const [renameVal, setRenameVal] = useState("");
  const [menuId, setMenuId] = useState(null);
  const groups = groupByDate([...sessions].reverse());

  const startRename = (s, e) => {
    e.stopPropagation();
    setMenuId(null);
    setRenaming(s.id);
    setRenameVal(s.title);
  };

  const commitRename = () => {
    if (renaming && renameVal.trim()) onRename(renaming, renameVal.trim());
    setRenaming(null);
  };

  return (
    <div
      className="ai-hist-panel ai-scrollbar"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        zIndex: 30,
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "4px 0 24px rgba(0,0,0,.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 14px 10px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <History size={15} style={{ color: "var(--accent-primary)" }} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-.2px",
            }}
          >
            Chat History
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            border: "1px solid var(--border-color)",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
          }}
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* New Chat btn */}
      <div style={{ padding: "10px 12px", flexShrink: 0 }}>
        <button
          onClick={() => {
            onNew();
            onClose();
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 12px",
            borderRadius: 10,
            border: "none",
            background:
              "linear-gradient(135deg,var(--gradient-start,#1e40af),var(--gradient-end,#7c3aed))",
            color: "#fff",
            fontWeight: 700,
            fontSize: 12.5,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 3px 10px rgba(99,102,241,.3)",
            transition: "all .18s",
          }}
        >
          <Plus size={15} />
          New Chat
        </button>
      </div>

      {/* Sessions list */}
      <div
        className="ai-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}
      >
        {sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <MessageSquare
              size={28}
              style={{ color: "var(--text-tertiary)", margin: "0 auto 10px" }}
            />
            <p
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)",
                lineHeight: 1.5,
              }}
            >
              No chats yet.
              <br />
              Start a new conversation!
            </p>
          </div>
        ) : (
          Object.entries(groups).map(([dateLabel, group]) => (
            <div key={dateLabel} style={{ marginBottom: 8 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: ".8px",
                  padding: "8px 6px 4px",
                  margin: 0,
                }}
              >
                {dateLabel}
              </p>
              {group.map((s, idx) => (
                <div
                  key={s.id}
                  className="ai-sess-item"
                  style={{
                    animationDelay: `${idx * 0.04}s`,
                    position: "relative",
                    marginBottom: 2,
                  }}
                >
                  {renaming === s.id ? (
                    <input
                      autoFocus
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setRenaming(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 9,
                        border: "1.5px solid var(--accent-primary)",
                        background: "var(--bg-tertiary)",
                        color: "var(--text-primary)",
                        fontSize: 12.5,
                        fontFamily: "inherit",
                        outline: "none",
                        boxShadow: "0 0 0 3px var(--accent-light)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <button
                        className={`ai-sess-btn${s.id === activeId ? " active" : ""}`}
                        onClick={() => {
                          onSelect(s.id);
                          onClose();
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 10px",
                          borderRadius: 9,
                          border: `1px solid ${s.id === activeId ? "rgba(99,102,241,.28)" : "transparent"}`,
                          background:
                            s.id === activeId
                              ? "var(--accent-light)"
                              : "transparent",
                          color: "var(--text-primary)",
                          fontSize: 12.5,
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textAlign: "left",
                        }}
                      >
                        <MessageSquare
                          size={12}
                          style={{
                            flexShrink: 0,
                            color:
                              s.id === activeId
                                ? "var(--accent-primary)"
                                : "var(--text-tertiary)",
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12.5,
                              fontWeight: s.id === activeId ? 700 : 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color:
                                s.id === activeId
                                  ? "var(--accent-primary)"
                                  : "var(--text-primary)",
                            }}
                          >
                            {s.title}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 10,
                              color: "var(--text-tertiary)",
                            }}
                          >
                            {s.messages?.filter((m) => m.sender === "user")
                              .length || 0}{" "}
                            messages
                          </p>
                        </div>
                      </button>
                      {/* 3-dot menu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId(menuId === s.id ? null : s.id);
                        }}
                        style={{
                          position: "absolute",
                          right: 4,
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--text-tertiary)",
                          opacity: menuId === s.id || s.id === activeId ? 1 : 0,
                          transition: "opacity .18s",
                        }}
                      >
                        <MoreHorizontal size={13} />
                      </button>
                      {/* Dropdown */}
                      {menuId === s.id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "100%",
                            zIndex: 50,
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: 10,
                            padding: 4,
                            boxShadow: "0 8px 24px rgba(0,0,0,.15)",
                            minWidth: 140,
                          }}
                        >
                          <button
                            onClick={(e) => startRename(s, e)}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              padding: "7px 10px",
                              borderRadius: 7,
                              border: "none",
                              background: "transparent",
                              color: "var(--text-primary)",
                              fontSize: 12.5,
                              fontWeight: 500,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--bg-hover)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <Pencil size={12} />
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuId(null);
                              onDelete(s.id);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              padding: "7px 10px",
                              borderRadius: 7,
                              border: "none",
                              background: "transparent",
                              color: "#ef4444",
                              fontSize: 12.5,
                              fontWeight: 500,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(239,68,68,.07)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const AIAgentSidebar = ({ isOpen, onClose }) => {
  /* ── sessions (persisted) ── */
  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState(null);

  /* ── ui state ── */
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(440);
  const [isResizing, setIsResizing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [chatFiles, setChatFiles] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const abortRef = useRef(null);
  const msgCounterRef = useRef(0);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const menuOutsideRef = useRef(null);

  const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(
    /\/notes\/?$/,
    "",
  );

  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const base = (API_BASE || "").replace(/\/$/, "");
    return `${base}${url.startsWith("/") ? url : `/${url}`}`;
  };

  /* ── active session ── */
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];

  /* ── persist on change ── */
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  /* ── inject styles ── */
  useEffect(() => {
    injectAIStyles();
  }, []);

  /* ── on open: ensure there's at least one session ── */
  useEffect(() => {
    if (!isOpen) return;
    if (sessions.length > 0) {
      if (!activeSessionId || !sessions.find((s) => s.id === activeSessionId)) {
        setActiveSessionId(sessions[sessions.length - 1].id);
      }
    } else {
      createNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ── scroll to bottom ── */
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  };

  /* ── speech recognition ── */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInputMessage((p) => (p ? `${p} ${t}` : t));
      setIsListening(false);
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  /* ── resize ── */
  const startResizing = useCallback((e) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback(
    (e) => {
      if (!isResizing) return;
      const nw = window.innerWidth - e.clientX;
      if (nw >= 320 && nw <= window.innerWidth * 0.88) setSidebarWidth(nw);
    },
    [isResizing],
  );
  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  /* ── textarea auto-resize ── */
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }, [inputMessage]);

  /* ── abort on unmount ── */
  useEffect(() => () => abortRef.current?.abort(), []);

  const genId = () => {
    msgCounterRef.current += 1;
    return `m-${msgCounterRef.current}-${Date.now()}`;
  };

  /* ── session management ── */
  const createNewSession = (initialMessages) => {
    const id = uid();
    const sess = {
      id,
      title: "New Chat",
      createdAt: new Date().toISOString(),
      messages: initialMessages ?? [],
    };
    setSessions((p) => [...p, sess]);
    setActiveSessionId(id);
    return id;
  };

  const updateSessionMessages = (sessId, updater) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessId
          ? {
              ...s,
              messages:
                typeof updater === "function" ? updater(s.messages) : updater,
            }
          : s,
      ),
    );
  };

  const updateSessionTitle = (sessId, title) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessId ? { ...s, title } : s)),
    );
  };

  const deleteSession = (sessId) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessId);
      if (activeSessionId === sessId) {
        setActiveSessionId(next.length > 0 ? next[next.length - 1].id : null);
        if (next.length === 0) setTimeout(() => createNewSession(), 50);
      }
      return next;
    });
  };

  const handleNewChat = () => {
    createNewSession();
    setInputMessage("");
    setChatFiles([]);
  };

  /* ── copy ── */
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  /* ── files ── */
  const handleFileChange = (e) => {
    setChatFiles((p) => [...p, ...Array.from(e.target.files)]);
    e.target.value = "";
  };
  const removeFile = (i) =>
    setChatFiles((p) => p.filter((_, idx) => idx !== i));

  /* ── send ── */
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!inputMessage.trim() && chatFiles.length === 0) || isLoading) return;

    let sessId = activeSessionId;
    if (!sessId) {
      sessId = createNewSession();
    }

    const ts = new Date().toISOString();
    const userMsg = {
      id: genId(),
      sender: "user",
      text: inputMessage.trim(),
      files: chatFiles.map((f) => ({ name: f.name, type: f.type })),
      timestamp: ts,
    };

    /* auto-title on first user message */
    const currentMsgs = sessions.find((s) => s.id === sessId)?.messages ?? [];
    const isFirstUserMsg = !currentMsgs.some((m) => m.sender === "user");
    if (isFirstUserMsg) updateSessionTitle(sessId, deriveTitle(inputMessage));

    updateSessionMessages(sessId, (prev) => [...prev, userMsg]);
    const savedInput = inputMessage;
    const savedFiles = [...chatFiles];
    setInputMessage("");
    setChatFiles([]);
    setIsLoading(true);
    abortRef.current = new AbortController();

    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("question", savedInput);
      savedFiles.forEach((f) => fd.append("files", f));
      const res = await axios.post(`${API_BASE}/notes/ask`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        signal: abortRef.current.signal,
      });
      const aiMsg = {
        id: genId(),
        sender: "ai",
        text: res.data.answer || "Sorry, I couldn't generate an answer.",
        timestamp: new Date().toISOString(),
      };
      updateSessionMessages(sessId, (prev) => [...prev, aiMsg]);
    } catch (err) {
      if (axios.isCancel(err) || err.name === "CanceledError") return;
      updateSessionMessages(sessId, (prev) => [
        ...prev,
        {
          id: genId(),
          sender: "ai",
          isError: true,
          text: `⚠️ **Something went wrong**\n\n${err.response?.data?.error || err.message}\n\nPlease try again.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (text) => {
    setInputMessage(text);
    textareaRef.current?.focus();
  };

  /* ── clear session ── */
  const handleClearConfirm = () => {
    setShowClearModal(false);
    if (!activeSessionId) return;
    updateSessionMessages(activeSessionId, []);
    updateSessionTitle(activeSessionId, "New Chat");
  };

  /* ── retry ── */
  const handleRetry = () => {
    if (!activeSessionId) return;
    const last = [...messages].reverse().find((m) => m.sender === "user");
    if (!last) return;
    updateSessionMessages(activeSessionId, (prev) =>
      prev.filter((m) => m.id !== last.id),
    );
    setInputMessage(last.text);
    textareaRef.current?.focus();
  };

  const showEmpty = messages.length === 0;
  const lastIsError = messages[messages.length - 1]?.isError;
  const userMsgCount = messages.filter((m) => m.sender === "user").length;

  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1040,
            background: "rgba(0,0,0,.22)",
            backdropFilter: "blur(2px)",
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar wrapper */}
      <div
        className="ai-sidebar-wrap"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100dvh",
          width: isOpen ? `${sidebarWidth}px` : 0,
          maxWidth: "88%",
          background: "var(--bg-secondary)",
          borderLeft: "1px solid var(--border-color)",
          boxShadow: "-6px 0 40px rgba(0,0,0,.13)",
          display: "flex",
          flexDirection: "column",
          zIndex: 1050,
          overflow: "hidden",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition:
            "transform .3s cubic-bezier(.16,1,.3,1), width .3s cubic-bezier(.16,1,.3,1)",
        }}
      >
        {/* Resize handle */}
        <div
          className="ai-resize-handle"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 4,
            height: "100%",
            cursor: "ew-resize",
            background: "transparent",
            zIndex: 60,
            transition: "background .2s",
          }}
          onMouseDown={startResizing}
        />

        {/* History panel (absolute overlay inside sidebar) */}
        {showHistory && (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 25,
                background: "rgba(0,0,0,.1)",
              }}
              onClick={() => setShowHistory(false)}
            />
            <HistoryPanel
              sessions={sessions}
              activeId={activeSessionId}
              onSelect={(id) => {
                setActiveSessionId(id);
                setShowHistory(false);
              }}
              onNew={() => {
                handleNewChat();
                setShowHistory(false);
              }}
              onDelete={deleteSession}
              onRename={(id, title) => updateSessionTitle(id, title)}
              onClose={() => setShowHistory(false)}
            />
          </>
        )}

        {/* Modals */}
        {showClearModal && (
          <Modal
            icon={
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(239,68,68,.1)",
                  border: "1.5px solid rgba(239,68,68,.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <Trash2 size={22} style={{ color: "#ef4444" }} />
              </div>
            }
            title="Clear this chat?"
            desc="All messages in this session will be permanently deleted."
            confirmLabel="Clear"
            confirmStyle={{
              background: "linear-gradient(135deg,#ef4444,#dc2626)",
              boxShadow: "0 4px 12px rgba(239,68,68,.3)",
            }}
            onConfirm={handleClearConfirm}
            onCancel={() => setShowClearModal(false)}
          />
        )}

        {/* ── HEADER ── */}
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            gap: 8,
          }}
        >
          {/* Left: history + logo + title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              minWidth: 0,
              flex: 1,
            }}
          >
            {/* History toggle */}
            <button
              title="Chat history"
              onClick={() => setShowHistory(true)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                border: "1px solid var(--border-color)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                flexShrink: 0,
                transition: "all .18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-light)";
                e.currentTarget.style.borderColor = "var(--accent-primary)";
                e.currentTarget.style.color = "var(--accent-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <PanelLeftOpen size={14} />
            </button>

            {/* Logo */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                flexShrink: 0,
                background:
                  "linear-gradient(135deg,var(--gradient-start,#1e40af),var(--gradient-end,#7c3aed))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 10px rgba(99,102,241,.32)",
              }}
            >
              <Sparkles size={15} style={{ color: "#fff" }} />
            </div>

            {/* Title + status */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-.2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {activeSession?.title || "AI Assistant"}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  color: isLoading ? "var(--accent-primary)" : "#10b981",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: isLoading ? "var(--accent-primary)" : "#10b981",
                    display: "inline-block",
                  }}
                />
                {isLoading ? "Thinking…" : "Online"}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            {/* Msg badge */}
            {userMsgCount > 0 && (
              <span
                style={{
                  padding: "2px 7px",
                  borderRadius: 999,
                  background: "var(--accent-light)",
                  border: "1px solid rgba(99,102,241,.2)",
                  color: "var(--accent-primary)",
                  fontSize: 10.5,
                  fontWeight: 700,
                }}
              >
                {userMsgCount}
              </span>
            )}
            {/* New chat */}
            <button
              title="New chat"
              onClick={handleNewChat}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                transition: "all .18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-light)";
                e.currentTarget.style.color = "var(--accent-primary)";
                e.currentTarget.style.borderColor = "var(--accent-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.borderColor = "var(--border-color)";
              }}
            >
              <Plus size={14} />
            </button>
            {/* Retry on error */}
            {lastIsError && (
              <button
                title="Retry"
                onClick={handleRetry}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  transition: "all .18s",
                }}
              >
                <RotateCcw size={13} />
              </button>
            )}
            {/* Clear */}
            <button
              title="Clear chat"
              onClick={() => setShowClearModal(true)}
              disabled={messages.length === 0}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                transition: "all .18s",
                opacity: messages.length === 0 ? 0.3 : 1,
              }}
              onMouseEnter={(e) => {
                if (messages.length > 0) {
                  e.currentTarget.style.borderColor = "#ef4444";
                  e.currentTarget.style.color = "#ef4444";
                  e.currentTarget.style.background = "rgba(239,68,68,.07)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Trash2 size={13} />
            </button>
            {/* Close */}
            <button
              title="Close"
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                transition: "all .18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-hover)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── MESSAGES ── */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="ai-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: showEmpty ? 0 : "18px 15px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "relative",
          }}
        >
          {showEmpty ? (
            <WelcomeScreen onPromptClick={handlePromptClick} />
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onCopy={handleCopy}
                copiedId={copiedId}
                getFullUrl={getFullUrl}
              />
            ))
          )}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} style={{ height: 4 }} />
        </div>

        {/* Scroll-to-bottom btn */}
        {showScrollBtn && !showEmpty && (
          <button
            className="ai-scroll-pulse"
            onClick={() => scrollToBottom()}
            style={{
              position: "absolute",
              bottom: 116,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: 9,
              border: "none",
              background: "var(--accent-primary)",
              color: "#fff",
              cursor: "pointer",
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(99,102,241,.42)",
            }}
          >
            <ChevronDown size={16} />
          </button>
        )}

        {/* ── FOOTER INPUT ── */}
        <div
          style={{
            padding: "10px 13px 13px",
            borderTop: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            flexShrink: 0,
          }}
        >
          {/* File chips */}
          {chatFiles.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 8,
              }}
            >
              {chatFiles.map((file, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 9px 4px 7px",
                    borderRadius: 7,
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                    fontSize: 11.5,
                    fontWeight: 500,
                  }}
                >
                  {file.type.includes("image") ? (
                    <ImageIcon
                      size={12}
                      style={{ color: "var(--accent-primary)" }}
                    />
                  ) : (
                    <FileText
                      size={12}
                      style={{ color: "var(--accent-primary)" }}
                    />
                  )}
                  <span
                    style={{
                      maxWidth: 100,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--text-primary)",
                      fontSize: 11,
                    }}
                  >
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(i)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-tertiary)",
                      fontSize: 14,
                      lineHeight: 1,
                      padding: "0 2px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input box */}
          <div
            style={{
              display: "flex",
              gap: 7,
              alignItems: "flex-end",
              padding: "7px 9px 7px 11px",
              borderRadius: 14,
              background: "var(--bg-tertiary)",
              border: "1.5px solid var(--border-color)",
              transition: "border-color .2s, box-shadow .2s",
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-primary)";
              e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-light)";
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Attach */}
            <label
              title="Attach file"
              style={{
                color: "var(--text-tertiary)",
                cursor: "pointer",
                padding: "4px",
                borderRadius: 7,
                display: "flex",
                alignItems: "center",
                transition: "all .18s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent-primary)";
                e.currentTarget.style.background = "var(--accent-light)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-tertiary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Paperclip size={15} />
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              className="ai-input-txt"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                fontSize: ".875rem",
                color: "var(--text-primary)",
                lineHeight: 1.6,
                padding: "3px 0",
                minHeight: 26,
                maxHeight: 120,
                overflowY: "auto",
              }}
              placeholder="Ask anything about your notes…"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            {/* Mic + Send */}
            <div
              style={{
                display: "flex",
                gap: 4,
                alignItems: "flex-end",
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                title={isListening ? "Stop" : "Voice input"}
                onClick={toggleListening}
                disabled={isLoading}
                className={isListening ? "ai-mic-active" : ""}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "none",
                  background: isListening
                    ? "rgba(239,68,68,.12)"
                    : "transparent",
                  color: isListening ? "#ef4444" : "var(--text-tertiary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all .18s",
                }}
                onMouseEnter={(e) => {
                  if (!isListening) {
                    e.currentTarget.style.background = "var(--accent-light)";
                    e.currentTarget.style.color = "var(--accent-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isListening) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-tertiary)";
                  }
                }}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={
                  isLoading || (!inputMessage.trim() && chatFiles.length === 0)
                }
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "none",
                  background:
                    "linear-gradient(135deg,var(--gradient-start,#1e40af),var(--gradient-end,#7c3aed))",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 3px 9px rgba(99,102,241,.38)",
                  transition: "all .18s",
                  opacity:
                    isLoading ||
                    (!inputMessage.trim() && chatFiles.length === 0)
                      ? 0.48
                      : 1,
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = "scale(1.07)";
                    e.currentTarget.style.boxShadow =
                      "0 5px 15px rgba(99,102,241,.52)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 3px 9px rgba(99,102,241,.38)";
                }}
              >
                {isLoading ? (
                  <span
                    className="ai-spin"
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,.3)",
                      borderTopColor: "#fff",
                      display: "inline-block",
                    }}
                  />
                ) : (
                  <Send size={13} />
                )}
              </button>
            </div>
          </div>

          {/* Hint */}
          <p
            className="ai-hint-txt"
            style={{
              margin: "6px 0 0",
              fontSize: 10,
              color: "var(--text-tertiary)",
              textAlign: "center",
              letterSpacing: ".2px",
            }}
          >
            <Zap
              size={8}
              style={{
                display: "inline",
                verticalAlign: "middle",
                marginRight: 3,
              }}
            />
            NoteFlow AI · Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
};

export default AIAgentSidebar;
