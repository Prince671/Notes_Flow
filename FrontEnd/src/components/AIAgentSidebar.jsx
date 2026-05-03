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
  Loader2,
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** derive a ≤48-char title from the first user message */
const deriveTitle = (text = "") => {
  const words = text
    .trim()
    .replace(/[#*`_~]/g, "")
    .split(/\s+/)
    .slice(0, 7);
  if (!words.length) return "New Chat";
  const t = words.join(" ");
  return t.length > 48 ? t.slice(0, 48) + "…" : t;
};

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
    const label = fmtDate(s.updatedAt || s.createdAt);
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
   INJECT STYLES
───────────────────────────────────────────────────────────────────────────── */
const injectAIStyles = () => {
  if (document.getElementById("ai-sidebar-styles-v4")) return;
  const s = document.createElement("style");
  s.id = "ai-sidebar-styles-v4";
  s.textContent = `
    @keyframes ai-dot-bounce {
      0%,80%,100% { transform:translateY(0); opacity:.4; }
      40%          { transform:translateY(-5px); opacity:1; }
    }
    .ai-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--accent-primary); animation:ai-dot-bounce 1.4s ease-in-out infinite; }
    .ai-dot:nth-child(2){ animation-delay:.16s; }
    .ai-dot:nth-child(3){ animation-delay:.32s; }

    @keyframes ai-msg-in {
      from { opacity:0; transform:translateY(8px) scale(.98); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }
    .ai-msg { animation:ai-msg-in .24s cubic-bezier(.22,1,.36,1) both; }

    @keyframes ai-sess-in {
      from { opacity:0; transform:translateX(-10px); }
      to   { opacity:1; transform:translateX(0); }
    }
    .ai-sess-item { animation:ai-sess-in .22s cubic-bezier(.22,1,.36,1) both; }

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

    .ai-gradient-text {
      background:linear-gradient(135deg,var(--gradient-start,#1e40af),var(--gradient-end,#7c3aed));
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }

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

    /* ── code block: light grey ChatGPT/Claude style ── */
    .ai-code-block { margin:.6em 0; border-radius:10px; overflow:hidden; border:1px solid #e2e4e9; box-shadow:0 1px 4px rgba(0,0,0,.06); }
    .ai-code-header { display:flex; align-items:center; justify-content:space-between; padding:8px 14px; background:#f0f1f3; border-bottom:1px solid #e2e4e9; }
    .ai-code-lang { font-family:'JetBrains Mono','Fira Code',ui-monospace,monospace; font-size:.7rem; font-weight:600; color:#555e6e; text-transform:uppercase; letter-spacing:.7px; display:flex; align-items:center; gap:6px; }
    .ai-code-lang::before { content:''; display:inline-block; width:6px; height:6px; border-radius:50%; background:#6366f1; }
    .ai-code-copy-btn { display:flex; align-items:center; gap:4px; padding:3px 10px; border-radius:6px; background:#fff; border:1px solid #d1d5db; color:#555e6e; font-size:10.5px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .18s; }
    .ai-code-copy-btn:hover { background:#e8eaf0; color:#374151; border-color:#b0b7c3; }
    .ai-code-copy-btn.copied { background:#ecfdf5; color:#059669; border-color:#6ee7b7; }
    .ai-code-body { background:#f6f7f9; }
    .ai-code-block pre { margin:0!important; border-radius:0!important; background:#f6f7f9!important; }

    .ai-scrollbar::-webkit-scrollbar { width:4px; }
    .ai-scrollbar::-webkit-scrollbar-track { background:transparent; }
    .ai-scrollbar::-webkit-scrollbar-thumb { background:var(--border-hover,#cbd5e1); border-radius:999px; }

    .ai-resize-handle:hover { background:var(--accent-primary)!important; opacity:.6; }
    .ai-msg-group:hover .ai-msg-copy { opacity:1!important; }
    .ai-msg-copy { opacity:0; transition:opacity .18s; }

    .ai-sess-btn { transition:all .18s; }
    .ai-sess-btn:hover { background:var(--bg-hover)!important; }
    .ai-sess-btn.active { background:var(--accent-light)!important; border-color:rgba(99,102,241,.3)!important; }

    @keyframes ai-hist-in {
      from { transform:translateX(-100%); opacity:0; }
      to   { transform:translateX(0); opacity:1; }
    }
    .ai-hist-panel { animation:ai-hist-in .28s cubic-bezier(.22,1,.36,1) both; }

    @keyframes ai-fade-in {
      from { opacity:0; } to { opacity:1; }
    }
    .ai-fade-in { animation:ai-fade-in .22s ease both; }

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
      .ai-hist-panel { width:270px!important; }
    }
  `;
  document.head.appendChild(s);
};

/* ─────────────────────────────────────────────────────────────────────────────
   CODE BLOCK  — light grey, ChatGPT/Claude style
───────────────────────────────────────────────────────────────────────────── */
const CodeBlock = ({ inline, className, children }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");
  const lang = match?.[1] ?? "text";

  if (inline) {
    return (
      <code
        style={{
          background: "#f0f1f3",
          padding: "1px 6px",
          borderRadius: 5,
          fontFamily: "'JetBrains Mono','Fira Code',ui-monospace,monospace",
          fontSize: ".82em",
          color: "#374151",
          border: "1px solid #e2e4e9",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="ai-code-block">
      {/* Header: language label + copy button */}
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

      {/* Body: light grey background, color-coded syntax */}
      <div className="ai-code-body">
        <SyntaxHighlighter
          style={oneLight}
          language={lang}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: ".8rem",
            lineHeight: 1.65,
            background: "#f6f7f9",
            padding: "14px 16px",
          }}
          codeTagProps={{
            style: {
              fontFamily: "'JetBrains Mono','Fira Code',ui-monospace,monospace",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────────────────────────── */
const MessageBubble = ({ msg, onCopy, copiedId, getFullUrl }) => {
  const isAI = msg.role === "ai";
  const isErr = msg.isError;
  const id = msg._id || msg.id;

  return (
    <div
      className="ai-msg ai-msg-group"
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
          {(msg.createdAt || msg.timestamp) && (
            <span
              className="ai-msg-time"
              style={{ fontSize: 9.5, color: "var(--text-tertiary)" }}
            >
              {fmt(msg.createdAt || msg.timestamp)}
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
        {isAI && !isErr && (
          <button
            className="ai-msg-copy"
            onClick={() => onCopy(msg.text, id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 8px",
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              cursor: "pointer",
              fontSize: 10.5,
              fontWeight: 600,
              color: "var(--text-tertiary)",
              fontFamily: "inherit",
              transition: "all .18s",
            }}
          >
            {copiedId === id ? (
              <>
                <Check size={10} style={{ color: "#10b981" }} />
                Copied
              </>
            ) : (
              <>
                <Copy size={10} />
                Copy
              </>
            )}
          </button>
        )}
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
   HISTORY PANEL
───────────────────────────────────────────────────────────────────────────── */
const HistoryPanel = ({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onClose,
  loading,
}) => {
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [menuId, setMenuId] = useState(null);
  const groups = groupByDate([...sessions]);

  const startRename = (s, e) => {
    e.stopPropagation();
    setMenuId(null);
    setRenaming(s._id);
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

      {/* Session list */}
      <div
        className="ai-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px 0",
              gap: 8,
              color: "var(--text-tertiary)",
              fontSize: 12,
            }}
          >
            <Loader2 size={16} className="ai-spin" /> Loading…
          </div>
        ) : sessions.length === 0 ? (
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
                  key={s._id}
                  className="ai-sess-item"
                  style={{
                    animationDelay: `${idx * 0.04}s`,
                    position: "relative",
                    marginBottom: 2,
                  }}
                >
                  {renaming === s._id ? (
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
                        boxSizing: "border-box",
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
                        className={`ai-sess-btn${s._id === activeId ? " active" : ""}`}
                        onClick={() => {
                          onSelect(s._id);
                          onClose();
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 32px 8px 10px",
                          borderRadius: 9,
                          border: `1px solid ${s._id === activeId ? "rgba(99,102,241,.28)" : "transparent"}`,
                          background:
                            s._id === activeId
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
                              s._id === activeId
                                ? "var(--accent-primary)"
                                : "var(--text-tertiary)",
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12.5,
                              fontWeight: s._id === activeId ? 700 : 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color:
                                s._id === activeId
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
                            {s.userMsgCount ?? 0} messages
                          </p>
                        </div>
                      </button>

                      {/* 3-dot menu btn */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId(menuId === s._id ? null : s._id);
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
                          opacity:
                            menuId === s._id || s._id === activeId ? 1 : 0,
                          transition: "opacity .18s",
                        }}
                        className="ai-sess-btn"
                      >
                        <MoreHorizontal size={13} />
                      </button>

                      {/* Dropdown */}
                      {menuId === s._id && (
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
                              onDelete(s._id);
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
  // ── Sessions from DB ──
  const [sessions, setSessions] = useState([]); // lightweight list (no messages)
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]); // messages of the open session
  const [historyLoading, setHistoryLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // ── UI state ──
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
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  // Track the last logged-in userId so we can detect logout/account switch
  const lastUserIdRef = useRef(null);

  const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(
    /\/notes\/?$/,
    "",
  );
  const CHAT_API = `${API_BASE}/chat`;

  const token = () => localStorage.getItem("token");

  /** Decode userId from JWT payload (no library needed) */
  const getUserIdFromToken = () => {
    try {
      const t = token();
      if (!t) return null;
      const payload = JSON.parse(atob(t.split(".")[1]));
      return payload?.id || payload?.userId || payload?.sub || null;
    } catch {
      return null;
    }
  };

  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const base = (API_BASE || "").replace(/\/$/, "");
    return `${base}${url.startsWith("/") ? url : `/${url}`}`;
  };

  /* ── inject styles ── */
  useEffect(() => {
    injectAIStyles();
  }, []);

  /* ── scroll to bottom on new messages ── */
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, scrollToBottom]);

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
    if (isListening) recognitionRef.current?.stop();
    else {
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

  /* ───────────────────────────────────────────────────────────────────────────
     DB HELPERS
  ─────────────────────────────────────────────────────────────────────────── */

  /** Fetch the session list (lightweight, no messages) */
  const fetchSessions = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${CHAT_API}/history`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("fetchSessions error", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [CHAT_API]);

  /** Fetch full messages for one session */
  const fetchSessionMessages = useCallback(
    async (sessId) => {
      if (!sessId) return;
      setMessagesLoading(true);
      try {
        const res = await axios.get(`${CHAT_API}/history/${sessId}`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        setActiveMessages(res.data.session?.messages || []);
      } catch (err) {
        console.error("fetchSessionMessages error", err);
        setActiveMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    },
    [CHAT_API],
  );

  /** Create a new session in DB, returns the session object */
  const createSessionInDB = useCallback(
    async (title = "New Chat") => {
      const res = await axios.post(
        `${CHAT_API}/session`,
        { title },
        { headers: { Authorization: `Bearer ${token()}` } },
      );
      return res.data.session;
    },
    [CHAT_API],
  );

  /** Append a message to a session in DB */
  const appendMessageToDB = useCallback(
    async (sessId, { role, text, isError = false, files = [] }) => {
      try {
        const res = await axios.post(
          `${CHAT_API}/session/${sessId}/message`,
          { role, text, isError, files },
          { headers: { Authorization: `Bearer ${token()}` } },
        );
        return res.data.message;
      } catch (err) {
        console.error("appendMessageToDB error", err);
        return null;
      }
    },
    [CHAT_API],
  );

  /** Rename a session in DB */
  const renameSessionInDB = useCallback(
    async (sessId, title) => {
      try {
        await axios.patch(
          `${CHAT_API}/session/${sessId}/title`,
          { title },
          { headers: { Authorization: `Bearer ${token()}` } },
        );
        // Update local list
        setSessions((prev) =>
          prev.map((s) => (s._id === sessId ? { ...s, title } : s)),
        );
      } catch (err) {
        console.error("renameSessionInDB error", err);
      }
    },
    [CHAT_API],
  );

  /** Delete a session from DB */
  const deleteSessionInDB = useCallback(
    async (sessId) => {
      try {
        await axios.delete(`${CHAT_API}/session/${sessId}`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        setSessions((prev) => {
          const next = prev.filter((s) => s._id !== sessId);
          if (activeSessionId === sessId) {
            if (next.length > 0) {
              setActiveSessionId(next[0]._id);
              fetchSessionMessages(next[0]._id);
            } else {
              setActiveSessionId(null);
              setActiveMessages([]);
            }
          }
          return next;
        });
      } catch (err) {
        console.error("deleteSessionInDB error", err);
      }
    },
    [CHAT_API, activeSessionId, fetchSessionMessages],
  );

  /* ── on open: detect user change (logout) → always start fresh ── */
  useEffect(() => {
    if (!isOpen) return;

    const currentUserId = getUserIdFromToken();

    // User logged out or switched account — wipe all local state first
    if (lastUserIdRef.current && lastUserIdRef.current !== currentUserId) {
      setSessions([]);
      setActiveSessionId(null);
      setActiveMessages([]);
      setInputMessage("");
      setChatFiles([]);
    }

    lastUserIdRef.current = currentUserId;

    // No token → don't try to fetch (guest/logged-out state)
    if (!currentUserId) return;

    // Fetch sessions for this user; always start on a blank new chat
    setActiveSessionId(null);
    setActiveMessages([]);
    fetchSessions();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sessions loaded — do NOT auto-select any session.
  // The sidebar always opens on a fresh blank chat.
  // The user picks a previous conversation via the History panel.
  // (No useEffect needed here for auto-selection)

  /* ── when active session changes, load its messages ── */
  const handleSelectSession = useCallback(
    async (sessId) => {
      setActiveSessionId(sessId);
      setActiveMessages([]);
      await fetchSessionMessages(sessId);
      setShowHistory(false);
    },
    [fetchSessionMessages],
  );

  /* ───────────────────────────────────────────────────────────────────────────
     NEW CHAT
  ─────────────────────────────────────────────────────────────────────────── */
  const handleNewChat = useCallback(async () => {
    setInputMessage("");
    setChatFiles([]);
    setActiveMessages([]);
    setActiveSessionId(null);
    setShowHistory(false);
  }, []);

  /* ───────────────────────────────────────────────────────────────────────────
     SEND MESSAGE
  ─────────────────────────────────────────────────────────────────────────── */
  const handleSendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      if ((!inputMessage.trim() && chatFiles.length === 0) || isLoading) return;

      const savedInput = inputMessage.trim();
      const savedFiles = [...chatFiles];
      setInputMessage("");
      setChatFiles([]);
      setIsLoading(true);
      abortRef.current = new AbortController();

      // ── 1. Optimistic user message for instant display ──
      const optimisticUserMsg = {
        _id: `opt-${Date.now()}`,
        role: "user",
        text: savedInput,
        files: savedFiles.map((f) => ({ name: f.name, type: f.type })),
        createdAt: new Date().toISOString(),
      };
      setActiveMessages((prev) => [...prev, optimisticUserMsg]);

      try {
        // ── 2. Ensure we have a session ──
        let sessId = activeSessionId;
        let isNewSession = false;
        if (!sessId) {
          // Create new session; title will be auto-set below
          const newSess = await createSessionInDB("New Chat");
          sessId = newSess._id;
          setActiveSessionId(sessId);
          isNewSession = true;
          // Add to local list immediately
          setSessions((prev) => [{ ...newSess, userMsgCount: 0 }, ...prev]);
        }

        // ── 3. Auto-title on first user message of a new/blank session ──
        const isFirstMsg = activeMessages.length === 0;
        if (isFirstMsg || isNewSession) {
          const autoTitle = deriveTitle(savedInput);
          // Fire-and-forget rename (don't await to keep UI snappy)
          renameSessionInDB(sessId, autoTitle);
        }

        // ── 4. Persist user message to DB ──
        const savedUserMsg = await appendMessageToDB(sessId, {
          role: "user",
          text: savedInput,
          files: savedFiles.map((f) => ({ name: f.name, type: f.type })),
        });
        // Replace optimistic msg with DB msg (keeps _id consistent)
        if (savedUserMsg) {
          setActiveMessages((prev) =>
            prev.map((m) =>
              m._id === optimisticUserMsg._id
                ? { ...savedUserMsg, role: "user" }
                : m,
            ),
          );
        }

        // ── 5. Update session message count in sidebar ──
        setSessions((prev) =>
          prev.map((s) =>
            s._id === sessId
              ? {
                  ...s,
                  userMsgCount: (s.userMsgCount || 0) + 1,
                  updatedAt: new Date().toISOString(),
                }
              : s,
          ),
        );

        // ── 6. Call AI ──
        const fd = new FormData();
        fd.append("question", savedInput);
        savedFiles.forEach((f) => fd.append("files", f));
        const res = await axios.post(`${API_BASE}/notes/ask`, fd, {
          headers: {
            Authorization: `Bearer ${token()}`,
            "Content-Type": "multipart/form-data",
          },
          signal: abortRef.current.signal,
        });

        const aiText =
          res.data.answer || "Sorry, I couldn't generate an answer.";

        // ── 7. Optimistic AI message ──
        const optimisticAiMsg = {
          _id: `opt-ai-${Date.now()}`,
          role: "ai",
          text: aiText,
          createdAt: new Date().toISOString(),
        };
        setActiveMessages((prev) => [...prev, optimisticAiMsg]);

        // ── 8. Persist AI message to DB ──
        const savedAiMsg = await appendMessageToDB(sessId, {
          role: "ai",
          text: aiText,
        });
        if (savedAiMsg) {
          setActiveMessages((prev) =>
            prev.map((m) =>
              m._id === optimisticAiMsg._id ? { ...savedAiMsg, role: "ai" } : m,
            ),
          );
        }
      } catch (err) {
        if (axios.isCancel(err) || err.name === "CanceledError") return;

        // ── Error message ──
        const errText = `⚠️ **Something went wrong**\n\n${err.response?.data?.error || err.message}\n\nPlease try again.`;
        const optimisticErrMsg = {
          _id: `opt-err-${Date.now()}`,
          role: "ai",
          isError: true,
          text: errText,
          createdAt: new Date().toISOString(),
        };
        setActiveMessages((prev) => [...prev, optimisticErrMsg]);

        if (activeSessionId) {
          appendMessageToDB(activeSessionId, {
            role: "ai",
            text: errText,
            isError: true,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      inputMessage,
      chatFiles,
      isLoading,
      activeSessionId,
      activeMessages,
      createSessionInDB,
      appendMessageToDB,
      renameSessionInDB,
      API_BASE,
    ],
  );

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

  /* ── clear current session messages ── */
  const handleClearConfirm = useCallback(async () => {
    setShowClearModal(false);
    if (!activeSessionId) return;
    // Delete then re-create — simplest way to clear a session
    await deleteSessionInDB(activeSessionId);
    setActiveMessages([]);
  }, [activeSessionId, deleteSessionInDB]);

  /* ── retry ── */
  const handleRetry = () => {
    const last = [...activeMessages].reverse().find((m) => m.role === "user");
    if (!last) return;
    setActiveMessages((prev) => prev.filter((m) => m._id !== last._id));
    setInputMessage(last.text);
    textareaRef.current?.focus();
  };

  /* ── derived ── */
  const activeSession = sessions.find((s) => s._id === activeSessionId) ?? null;
  const showEmpty = activeMessages.length === 0 && !messagesLoading;
  const lastIsError = activeMessages[activeMessages.length - 1]?.isError;
  const userMsgCount = activeMessages.filter((m) => m.role === "user").length;

  /* ────────────────────────────────────────────────────────────────────────────
     RENDER
  ─────────────────────────────────────────────────────────────────────────── */
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

        {/* History panel overlay */}
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
              onSelect={handleSelectSession}
              onNew={handleNewChat}
              onDelete={deleteSessionInDB}
              onRename={renameSessionInDB}
              onClose={() => setShowHistory(false)}
              loading={historyLoading}
            />
          </>
        )}

        {/* Clear modal */}
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
            title="Delete this chat?"
            desc="All messages in this conversation will be permanently deleted."
            confirmLabel="Delete"
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
                {activeSession?.title ||
                  (activeSessionId ? "Chat" : "AI Assistant")}
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
                {messagesLoading
                  ? "Loading…"
                  : isLoading
                    ? "Thinking…"
                    : "Online"}
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
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

            {/* Clear/Delete */}
            {activeSessionId && (
              <button
                title="Delete this chat"
                onClick={() => setShowClearModal(true)}
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
                  e.currentTarget.style.background = "rgba(239,68,68,.07)";
                  e.currentTarget.style.color = "#ef4444";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-color)";
                }}
              >
                <Trash2 size={13} />
              </button>
            )}

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
                e.currentTarget.style.background = "rgba(239,68,68,.07)";
                e.currentTarget.style.color = "#ef4444";
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

        {/* ── MESSAGES AREA ── */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="ai-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            scrollBehavior: "smooth",
          }}
        >
          {messagesLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                gap: 10,
                color: "var(--text-tertiary)",
                fontSize: 13,
              }}
            >
              <Loader2 size={18} className="ai-spin" />
              Loading conversation…
            </div>
          ) : showEmpty ? (
            <WelcomeScreen onPromptClick={handlePromptClick} />
          ) : (
            <>
              {activeMessages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  msg={msg}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                  getFullUrl={getFullUrl}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── SCROLL TO BOTTOM btn ── */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom()}
            className="ai-scroll-pulse"
            style={{
              position: "absolute",
              bottom: 130,
              right: 18,
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1.5px solid var(--border-color)",
              background: "var(--bg-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-primary)",
              boxShadow: "0 3px 12px rgba(0,0,0,.12)",
              zIndex: 10,
            }}
          >
            <ChevronDown size={16} />
          </button>
        )}

        {/* ── FILE PREVIEWS ── */}
        {chatFiles.length > 0 && (
          <div
            style={{
              padding: "8px 14px 0",
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              borderTop: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              flexShrink: 0,
            }}
          >
            {chatFiles.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 9px",
                  borderRadius: 8,
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  maxWidth: 180,
                }}
              >
                {f.type.startsWith("image/") ? (
                  <ImageIcon size={12} />
                ) : (
                  <FileText size={12} />
                )}
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {f.name}
                </span>
                <button
                  onClick={() => removeFile(i)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    color: "var(--text-tertiary)",
                    flexShrink: 0,
                  }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── INPUT AREA ── */}
        <div
          style={{
            padding: "10px 14px 12px",
            borderTop: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 13,
              border: "1.5px solid var(--border-color)",
              background: "var(--bg-tertiary)",
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
