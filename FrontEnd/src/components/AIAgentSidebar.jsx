import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
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
  Terminal,
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

/* ─────────────────────────────────────────────────────────────────────────────
   Global styles
───────────────────────────────────────────────────────────────────────────── */
const injectAIStyles = () => {
  if (document.getElementById("ai-sidebar-styles")) return;
  const style = document.createElement("style");
  style.id = "ai-sidebar-styles";
  style.textContent = `
    /* ── typing dots ── */
    @keyframes ai-dot-bounce {
      0%,80%,100% { transform: translateY(0); opacity: 0.45; }
      40%          { transform: translateY(-5px); opacity: 1; }
    }
    .ai-dot {
      display: inline-block;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--accent-primary, #6366f1);
      animation: ai-dot-bounce 1.4s ease-in-out infinite;
    }
    .ai-dot:nth-child(2) { animation-delay: 0.18s; }
    .ai-dot:nth-child(3) { animation-delay: 0.36s; }

    /* ── message slide-in ── */
    @keyframes ai-msg-in {
      from { opacity: 0; transform: translateY(10px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .ai-msg { animation: ai-msg-in 0.28s cubic-bezier(0.22,1,0.36,1) both; }

    /* ── scroll button pulse ── */
    @keyframes ai-scroll-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
      50%      { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
    }
    .ai-scroll-pulse { animation: ai-scroll-pulse 2s ease-in-out infinite; }

    @keyframes ai-spin { to { transform: rotate(360deg); } }
    .ai-spin { animation: ai-spin 0.85s linear infinite; }

    @keyframes ai-mic-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
      50%      { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
    }
    .ai-mic-active { animation: ai-mic-pulse 1.2s ease-in-out infinite; }

    /* ─── AI prose — all text inherits the theme ─── */
    .ai-prose {
      font-size: 0.9rem;
      line-height: 1.78;
      color: var(--text-primary);
      word-break: break-word;
    }
    .ai-prose > *:first-child { margin-top: 0 !important; }
    .ai-prose > *:last-child  { margin-bottom: 0 !important; }

    .ai-prose p  { margin: 0 0 0.65em; }
    .ai-prose p:last-child { margin-bottom: 0; }

    .ai-prose h1 {
      font-size: 1.18rem; font-weight: 800;
      color: var(--text-primary);
      margin: 1em 0 0.45em;
      letter-spacing: -0.3px;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 4px;
    }
    .ai-prose h2 {
      font-size: 1.06rem; font-weight: 800;
      color: var(--text-primary);
      margin: 0.9em 0 0.4em;
      letter-spacing: -0.2px;
    }
    .ai-prose h3 {
      font-size: 0.97rem; font-weight: 700;
      color: var(--text-primary);
      margin: 0.75em 0 0.3em;
    }

    /* ── lists ── */
    .ai-prose ul {
      margin: 0.4em 0 0.75em;
      padding-left: 0;
      list-style: none;
    }
    .ai-prose ul li {
      position: relative;
      padding-left: 1.35em;
      margin-bottom: 0.3em;
      color: var(--text-primary);
    }
    .ai-prose ul li::before {
      content: '';
      position: absolute; left: 0.1em; top: 0.58em;
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--accent-primary, #6366f1);
    }
    .ai-prose ol {
      margin: 0.4em 0 0.75em;
      padding-left: 1.5em;
    }
    .ai-prose ol li {
      margin-bottom: 0.3em;
      color: var(--text-primary);
    }
    /* nested lists */
    .ai-prose ul ul,
    .ai-prose ol ul { margin: 0.2em 0 0.2em 0.5em; }
    .ai-prose ul ol,
    .ai-prose ol ol { margin: 0.2em 0 0.2em 0.5em; }

    .ai-prose strong { font-weight: 700; color: var(--text-primary); }
    .ai-prose em     { font-style: italic; color: var(--text-secondary); }
    .ai-prose del    { text-decoration: line-through; color: var(--text-tertiary); }

    .ai-prose a {
      color: var(--accent-primary, #6366f1);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .ai-prose a:hover { opacity: 0.78; }

    .ai-prose blockquote {
      border-left: 3px solid var(--accent-primary, #6366f1);
      margin: 0.7em 0;
      padding: 0.45em 0 0.45em 1em;
      background: var(--accent-light, rgba(99,102,241,0.06));
      border-radius: 0 8px 8px 0;
      font-style: italic;
      color: var(--text-secondary);
    }

    .ai-prose hr {
      border: none;
      border-top: 1.5px solid var(--border-color);
      margin: 0.9em 0;
    }

    /* ── tables ── */
    .ai-prose table {
      width: 100%; border-collapse: collapse;
      font-size: 0.865rem; margin: 0.7em 0;
      border-radius: 8px; overflow: hidden;
    }
    .ai-prose th {
      background: var(--accent-light, rgba(99,102,241,0.08));
      padding: 7px 12px; text-align: left;
      font-weight: 700;
      border: 1px solid var(--border-color);
      color: var(--accent-primary, #6366f1);
      font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.4px;
    }
    .ai-prose td {
      padding: 7px 12px;
      border: 1px solid var(--border-color);
      vertical-align: top;
      color: var(--text-primary);
    }
    .ai-prose tr:nth-child(even) td { background: var(--bg-tertiary); }

    /* ── inline code ── */
    .ai-prose code {
      background: var(--bg-hover, rgba(0,0,0,0.06));
      padding: 2px 6px; border-radius: 5px;
      font-family: 'JetBrains Mono','Fira Code','Cascadia Code',monospace;
      font-size: 0.83em;
      color: var(--accent-primary, #6366f1);
      border: 1px solid var(--border-color);
      white-space: pre-wrap;
      word-break: break-all;
    }

    /* ── code block wrapper ── */
    .ai-code-block {
      margin: 0.7em 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(99,102,241,0.18);
      box-shadow: 0 3px 14px rgba(0,0,0,0.18);
    }
    .ai-code-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 14px;
      background: #1e2030;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .ai-code-lang {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem; font-weight: 700;
      color: #a78bfa;
      text-transform: uppercase; letter-spacing: 0.9px;
      display: flex; align-items: center; gap: 7px;
    }
    .ai-code-lang-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      flex-shrink: 0;
    }
    .ai-code-copy-btn {
      display: flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 7px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.10);
      color: rgba(255,255,255,0.55); font-size: 11px; font-weight: 600;
      cursor: pointer; font-family: inherit;
      transition: all 0.18s;
      line-height: 1;
    }
    .ai-code-copy-btn:hover {
      background: rgba(99,102,241,0.28);
      color: #fff;
      border-color: rgba(99,102,241,0.45);
    }
    .ai-code-copy-btn.copied {
      background: rgba(16,185,129,0.18);
      color: #34d399;
      border-color: rgba(16,185,129,0.35);
    }
    .ai-code-block pre { margin: 0 !important; border-radius: 0 !important; }

    /* ── user bubble prose (plain white text) ── */
    .user-prose {
      font-size: 0.9rem;
      line-height: 1.68;
      color: #fff;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
    }

    /* ── scrollbar ── */
    .ai-scrollbar::-webkit-scrollbar { width: 5px; }
    .ai-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .ai-scrollbar::-webkit-scrollbar-thumb {
      background: var(--border-hover, #cbd5e1);
      border-radius: 999px;
    }

    /* ── resize handle ── */
    .ai-resize-handle:hover { background: var(--accent-primary, #6366f1) !important; opacity: 0.6; }

    /* ── gradient text ── */
    .ai-gradient-text {
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ── copy button on hover ── */
    .ai-msg-group:hover .ai-msg-copy { opacity: 1 !important; }
    .ai-msg-copy { opacity: 0; transition: opacity 0.18s; }

    /* ── mobile ── */
    @media (max-width: 640px) {
      .ai-sidebar { width: 100% !important; max-width: 100% !important; }
    }
  `;
  document.head.appendChild(style);
};

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const SUGGESTED_PROMPTS = [
  { icon: "🔍", text: "Summarize my recent notes" },
  { icon: "💡", text: "Find notes about a topic" },
  { icon: "✍️", text: "Help me write a note" },
  { icon: "📊", text: "Organize my ideas" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CodeBlock — fenced code with syntax highlight + copy
───────────────────────────────────────────────────────────────────────────── */
const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const codeText = String(children).replace(/\n$/, "");
  const lang = match ? match[1] : "text";

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inline code — render without block chrome
  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  // Block code
  return (
    <div className="ai-code-block">
      <div className="ai-code-header">
        <span className="ai-code-lang">
          <span className="ai-code-lang-dot" />
          {lang}
        </span>
        <button
          className={`ai-code-copy-btn${copied ? " copied" : ""}`}
          onClick={handleCopy}
          type="button"
        >
          {copied ? (
            <>
              <Check size={11} /> Copied!
            </>
          ) : (
            <>
              <Copy size={11} /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={lang}
        PreTag="div"
        wrapLongLines
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.8rem",
          lineHeight: 1.65,
          background: "#1a1d2e",
          padding: "14px 16px",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
          },
        }}
      >
        {codeText}
      </SyntaxHighlighter>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   ReactMarkdown component map — used for AI messages
───────────────────────────────────────────────────────────────────────────── */
const MD_COMPONENTS = {
  code: CodeBlock,
  // ensure table elements render properly
  table: ({ children, ...props }) => (
    <div style={{ overflowX: "auto", margin: "0.6em 0" }}>
      <table {...props}>{children}</table>
    </div>
  ),
};

/* ─────────────────────────────────────────────────────────────────────────────
   MessageBubble
───────────────────────────────────────────────────────────────────────────── */
const MessageBubble = ({ msg, onCopy, copiedId, getFullUrl }) => {
  const isAI = msg.sender === "ai";
  const isError = msg.isError;

  return (
    <div
      className="ai-msg ai-msg-group"
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        flexDirection: isAI ? "row" : "row-reverse",
        maxWidth: "100%",
      }}
    >
      {/* ── Avatar ── */}
      <div
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isAI
            ? isError
              ? "rgba(239,68,68,0.1)"
              : "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.14))"
            : "linear-gradient(135deg,#6366f1,#8b5cf6)",
          border: isAI
            ? `1.5px solid ${isError ? "rgba(239,68,68,0.28)" : "rgba(99,102,241,0.22)"}`
            : "none",
          boxShadow: isAI ? "none" : "0 2px 10px rgba(99,102,241,0.38)",
        }}
      >
        {isAI ? (
          isError ? (
            <AlertCircle size={15} style={{ color: "#ef4444" }} />
          ) : (
            <Bot size={15} style={{ color: "var(--accent-primary,#6366f1)" }} />
          )
        ) : (
          <User size={15} style={{ color: "#fff" }} />
        )}
      </div>

      {/* ── Content column ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minWidth: 0,
          flex: 1,
          alignItems: isAI ? "flex-start" : "flex-end",
          maxWidth: "calc(100% - 44px)",
        }}
      >
        {/* Sender + timestamp */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexDirection: isAI ? "row" : "row-reverse",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: isAI
                ? isError
                  ? "#ef4444"
                  : "var(--accent-primary,#6366f1)"
                : "var(--text-tertiary)",
              letterSpacing: "0.3px",
            }}
          >
            {isAI ? (isError ? "Error" : "AI Assistant") : "You"}
          </span>
          {msg.timestamp && (
            <span
              style={{
                fontSize: 10,
                color: "var(--text-tertiary)",
                letterSpacing: "0.1px",
              }}
            >
              {formatTime(msg.timestamp)}
            </span>
          )}
        </div>

        {/* ── Bubble ── */}
        <div
          style={{
            position: "relative",
            padding: isAI ? "12px 16px" : "10px 14px",
            borderRadius: isAI ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
            background: isAI
              ? isError
                ? "rgba(239,68,68,0.07)"
                : "var(--bg-tertiary)"
              : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: isAI
              ? `1px solid ${isError ? "rgba(239,68,68,0.22)" : "var(--border-color)"}`
              : "none",
            boxShadow: isAI
              ? "0 1px 6px rgba(0,0,0,0.07)"
              : "0 4px 18px rgba(99,102,241,0.32)",
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          {isAI ? (
            /* ── AI message — full markdown ── */
            <div className="ai-prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={MD_COMPONENTS}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ) : (
            /* ── User message — plain white text + attachments ── */
            <>
              {msg.text && <p className="user-prose">{msg.text}</p>}
              {msg.files?.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 7,
                    marginTop: msg.text ? 10 : 0,
                  }}
                >
                  {msg.files.map((f, i) => (
                    <div key={i}>
                      {f.type?.includes("image") ? (
                        <div
                          style={{
                            borderRadius: 9,
                            overflow: "hidden",
                            background: "rgba(255,255,255,0.18)",
                            maxWidth: 160,
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        >
                          <img
                            src={getFullUrl(f.path)}
                            alt={f.name}
                            style={{
                              display: "block",
                              maxWidth: "100%",
                              maxHeight: 130,
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 11px",
                            borderRadius: 8,
                            background: "rgba(255,255,255,0.16)",
                            fontSize: 12,
                            color: "#fff",
                            fontWeight: 500,
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        >
                          <FileText size={12} />
                          <span
                            style={{
                              maxWidth: 120,
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

        {/* ── Copy button ── */}
        <button
          className="ai-msg-copy"
          onClick={() => onCopy(msg.text, msg.id)}
          title="Copy message"
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 9px",
            borderRadius: 7,
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-color)",
            color: copiedId === msg.id ? "#10b981" : "var(--text-tertiary)",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.18s",
          }}
        >
          {copiedId === msg.id ? (
            <>
              <Check size={10} /> Copied
            </>
          ) : (
            <>
              <Copy size={10} /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Welcome screen
───────────────────────────────────────────────────────────────────────────── */
const WelcomeScreen = ({ onPromptClick }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      padding: "32px 20px",
      textAlign: "center",
    }}
  >
    {/* Icon */}
    <div
      style={{
        width: 68,
        height: 68,
        borderRadius: 22,
        marginBottom: 20,
        background:
          "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.14))",
        border: "1.5px solid rgba(99,102,241,0.24)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 28px rgba(99,102,241,0.14)",
      }}
    >
      <Sparkles size={30} style={{ color: "var(--accent-primary,#6366f1)" }} />
    </div>

    <h3
      className="ai-gradient-text"
      style={{
        fontSize: "1.15rem",
        fontWeight: 900,
        margin: "0 0 8px",
        letterSpacing: "-0.3px",
      }}
    >
      NoteFlow AI Assistant
    </h3>

    <p
      style={{
        fontSize: 13,
        color: "var(--text-tertiary)",
        margin: "0 0 28px",
        maxWidth: 270,
        lineHeight: 1.65,
      }}
    >
      Ask me anything about your notes — I can summarize, search, and help you
      think.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        width: "100%",
        maxWidth: 310,
      }}
    >
      {SUGGESTED_PROMPTS.map((p) => (
        <button
          key={p.text}
          onClick={() => onPromptClick(p.text)}
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 12px",
            borderRadius: 11,
            textAlign: "left",
            background: "var(--bg-tertiary)",
            border: "1.5px solid var(--border-color)",
            color: "var(--text-secondary)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-primary,#6366f1)";
            e.currentTarget.style.color = "var(--accent-primary,#6366f1)";
            e.currentTarget.style.background =
              "var(--accent-light,rgba(99,102,241,0.07))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-color)";
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.background = "var(--bg-tertiary)";
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>{p.icon}</span>
          <span style={{ lineHeight: 1.35 }}>{p.text}</span>
        </button>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Typing indicator
───────────────────────────────────────────────────────────────────────────── */
const TypingIndicator = () => (
  <div
    className="ai-msg"
    style={{
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      maxWidth: "92%",
    }}
  >
    <div
      style={{
        flexShrink: 0,
        width: 32,
        height: 32,
        borderRadius: 10,
        background:
          "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.14))",
        border: "1.5px solid rgba(99,102,241,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Bot size={15} style={{ color: "var(--accent-primary,#6366f1)" }} />
    </div>
    <div
      style={{
        padding: "13px 18px",
        borderRadius: "4px 16px 16px 16px",
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border-color)",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <span className="ai-dot" />
        <span className="ai-dot" />
        <span className="ai-dot" />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Clear chat confirmation modal
───────────────────────────────────────────────────────────────────────────── */
const ClearConfirmModal = ({ onConfirm, onCancel }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 10,
      background: "rgba(0,0,0,0.35)",
      backdropFilter: "blur(4px)",
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
        padding: "28px 28px 24px",
        maxWidth: 300,
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 15,
          background: "rgba(239,68,68,0.1)",
          border: "1.5px solid rgba(239,68,68,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <Trash2 size={24} style={{ color: "#ef4444" }} />
      </div>
      <h4
        style={{
          margin: "0 0 8px",
          fontSize: "1rem",
          fontWeight: 800,
          color: "var(--text-primary)",
        }}
      >
        Clear Chat History?
      </h4>
      <p
        style={{
          margin: "0 0 22px",
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}
      >
        All messages will be permanently deleted. This cannot be undone.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 10,
            background: "var(--bg-tertiary)",
            border: "1.5px solid var(--border-color)",
            color: "var(--text-primary)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.18s",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,#ef4444,#dc2626)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
            transition: "all 0.18s",
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────────────────── */
const AIAgentSidebar = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(440);
  const [isResizing, setIsResizing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [chatFiles, setChatFiles] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const messageCounterRef = useRef(0);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(
    /\/notes\/?$/,
    "",
  );

  const getFullUrl = useCallback(
    (url) => {
      if (!url) return "";
      if (url.startsWith("http") || url.startsWith("data:")) return url;
      const base = (API_BASE || "").replace(/\/$/, "");
      return `${base}${url.startsWith("/") ? url : `/${url}`}`;
    },
    [API_BASE],
  );

  /* ── Inject styles once ── */
  useEffect(() => {
    injectAIStyles();
  }, []);

  /* ── Initial welcome message ── */
  const initialWelcomeMsg = () => ({
    id: "init-1",
    sender: "ai",
    text:
      "Hello! I'm your **NoteFlow AI Assistant**. I can help you:\n\n" +
      "- 🔍 Search and summarize your notes\n" +
      "- ✍️ Draft and improve content\n" +
      "- 💡 Answer questions from your notes\n" +
      "- 📊 Organize and categorize ideas\n\n" +
      "What would you like to explore today?",
    timestamp: new Date().toISOString(),
  });

  /* ── Fetch chat history ── */
  useEffect(() => {
    if (!isOpen) return;
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessages([initialWelcomeMsg()]);
          return;
        }
        const response = await axios.get(`${API_BASE}/chat/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.messages?.length) {
          const formatted = response.data.messages.map((m, i) => ({
            id: `hist-${i}-${Date.now()}`,
            sender: m.role === "user" ? "user" : "ai",
            text: m.text || "",
            files: m.files || [],
            timestamp: m.timestamp || new Date().toISOString(),
          }));
          setMessages(formatted);
        } else {
          setMessages([initialWelcomeMsg()]);
        }
      } catch {
        setMessages([initialWelcomeMsg()]);
      }
    };
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ── Scroll to bottom ── */
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    if (messages.length) scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ── Show scroll-to-bottom button ── */
  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  };

  /* ── Abort on unmount ── */
  useEffect(() => () => abortControllerRef.current?.abort(), []);

  /* ── Speech recognition ── */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInputMessage((p) => (p ? `${p} ${t}` : t));
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  /* ── Resize sidebar ── */
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

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 130)}px`;
  }, [inputMessage]);

  const generateId = () => {
    messageCounterRef.current += 1;
    return `msg-${messageCounterRef.current}-${Date.now()}`;
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text || "").catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleFileChange = (e) => {
    setChatFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    e.target.value = "";
  };
  const removeFile = (i) =>
    setChatFiles((p) => p.filter((_, idx) => idx !== i));

  /* ── Send message ── */
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!inputMessage.trim() && chatFiles.length === 0) || isLoading) return;

    const ts = new Date().toISOString();
    const userMsg = {
      id: generateId(),
      sender: "user",
      text: inputMessage.trim(),
      files: chatFiles.map((f) => ({ name: f.name, type: f.type })),
      timestamp: ts,
    };

    setMessages((p) => [...p, userMsg]);
    const savedInput = inputMessage.trim();
    const savedFiles = [...chatFiles];
    setInputMessage("");
    setChatFiles([]);
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("question", savedInput);
      savedFiles.forEach((f) => formData.append("files", f));

      const response = await axios.post(`${API_BASE}/notes/ask`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        signal: abortControllerRef.current.signal,
      });

      const answerText =
        response.data?.answer ||
        response.data?.message ||
        response.data?.text ||
        "Sorry, I couldn't generate an answer.";

      setMessages((p) => [
        ...p,
        {
          id: generateId(),
          sender: "ai",
          text: answerText,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      if (axios.isCancel(error) || error.name === "CanceledError") return;
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      setMessages((p) => [
        ...p,
        {
          id: generateId(),
          sender: "ai",
          isError: true,
          text: `⚠️ **Something went wrong**\n\n\`\`\`\n${errMsg}\n\`\`\`\n\nPlease check your connection and try again.`,
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
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  /* ── Clear chat ── */
  const handleClearConfirm = async () => {
    setShowClearConfirm(false);
    setIsClearing(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/chat/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      /* fail silently */
    } finally {
      setMessages([
        {
          id: `init-clear-${Date.now()}`,
          sender: "ai",
          text: "Chat history cleared. How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ]);
      setIsClearing(false);
    }
  };

  /* ── Retry last user message ── */
  const handleRetry = () => {
    const lastUser = [...messages].reverse().find((m) => m.sender === "user");
    if (!lastUser) return;
    setMessages((p) => p.filter((m) => m.id !== lastUser.id));
    setInputMessage(lastUser.text);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const showEmpty = messages.length === 0;
  const lastMsgIsError = messages[messages.length - 1]?.isError;
  const canSend =
    !isLoading && (inputMessage.trim().length > 0 || chatFiles.length > 0);

  /* ─────────────────────────────────────────────────────────────────────────
     Render
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
            background: "rgba(0,0,0,0.22)",
            backdropFilter: "blur(2px)",
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        className="ai-sidebar"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100dvh",
          width: isOpen ? `${sidebarWidth}px` : 0,
          maxWidth: "88%",
          background: "var(--bg-secondary)",
          borderLeft: "1px solid var(--border-color)",
          boxShadow: "-6px 0 40px rgba(0,0,0,0.14)",
          display: "flex",
          flexDirection: "column",
          zIndex: 1050,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition:
            "transform 0.32s cubic-bezier(0.16,1,0.3,1), width 0.32s cubic-bezier(0.16,1,0.3,1)",
          overflow: "hidden",
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
            transition: "background 0.2s",
          }}
          onMouseDown={startResizing}
        />

        {/* Clear confirm modal */}
        {showClearConfirm && (
          <ClearConfirmModal
            onConfirm={handleClearConfirm}
            onCancel={() => setShowClearConfirm(false)}
          />
        )}

        {/* ── Header ── */}
        <div
          style={{
            padding: "13px 16px",
            borderBottom: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            gap: 8,
          }}
        >
          {/* Left: branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(99,102,241,0.38)",
                flexShrink: 0,
              }}
            >
              <Sparkles size={17} style={{ color: "#fff" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "0.965rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.2px",
                  whiteSpace: "nowrap",
                }}
              >
                AI Assistant
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: isLoading
                    ? "var(--accent-primary,#6366f1)"
                    : "#10b981",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isLoading
                      ? "var(--accent-primary,#6366f1)"
                      : "#10b981",
                    display: "inline-block",
                    flexShrink: 0,
                    animation: isLoading
                      ? "ai-spin 1.2s linear infinite"
                      : "none",
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
              gap: 5,
              flexShrink: 0,
            }}
          >
            {/* Message count */}
            {messages.filter((m) => m.sender === "user").length > 0 && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "var(--accent-light,rgba(99,102,241,0.08))",
                  border: "1px solid rgba(99,102,241,0.2)",
                  color: "var(--accent-primary,#6366f1)",
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {messages.filter((m) => m.sender === "user").length} msgs
              </span>
            )}

            {/* Retry after error */}
            {lastMsgIsError && (
              <button
                type="button"
                title="Retry last message"
                onClick={handleRetry}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: "transparent",
                  border: "1px solid var(--border-color)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--accent-primary,#6366f1)";
                  e.currentTarget.style.color = "var(--accent-primary,#6366f1)";
                  e.currentTarget.style.background =
                    "var(--accent-light,rgba(99,102,241,0.07))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <RotateCcw size={15} />
              </button>
            )}

            {/* Clear chat */}
            <button
              type="button"
              title="Clear chat history"
              onClick={() => setShowClearConfirm(true)}
              disabled={isClearing || messages.length <= 1}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "transparent",
                border: "1px solid var(--border-color)",
                cursor: messages.length <= 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                transition: "all 0.18s",
                opacity: messages.length <= 1 ? 0.35 : 1,
              }}
              onMouseEnter={(e) => {
                if (messages.length > 1) {
                  e.currentTarget.style.borderColor = "#ef4444";
                  e.currentTarget.style.color = "#ef4444";
                  e.currentTarget.style.background = "rgba(239,68,68,0.07)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {isClearing ? (
                <span
                  className="ai-spin"
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    border: "2px solid var(--border-color)",
                    borderTopColor: "var(--accent-primary,#6366f1)",
                    display: "inline-block",
                  }}
                />
              ) : (
                <Trash2 size={15} />
              )}
            </button>

            {/* Close */}
            <button
              type="button"
              title="Close"
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "transparent",
                border: "1px solid var(--border-color)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                transition: "all 0.18s",
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
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Messages area ── */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="ai-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: showEmpty ? 0 : "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
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
          <div ref={messagesEndRef} style={{ height: 2 }} />
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollBtn && !showEmpty && (
          <button
            type="button"
            className="ai-scroll-pulse"
            onClick={() => scrollToBottom()}
            title="Scroll to latest"
            style={{
              position: "absolute",
              bottom: 122,
              right: 18,
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "none",
              background: "var(--accent-primary,#6366f1)",
              color: "#fff",
              cursor: "pointer",
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 18px rgba(99,102,241,0.45)",
              transition: "transform 0.18s",
            }}
          >
            <ChevronDown size={18} />
          </button>
        )}

        {/* ── Footer / input area ── */}
        <div
          style={{
            padding: "12px 14px 15px",
            borderTop: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            flexShrink: 0,
          }}
        >
          {/* Attached file chips */}
          {chatFiles.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 10,
              }}
            >
              {chatFiles.map((file, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 9px 4px 8px",
                    borderRadius: 8,
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color)",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {file.type.includes("image") ? (
                    <ImageIcon
                      size={12}
                      style={{
                        color: "var(--accent-primary,#6366f1)",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <FileText
                      size={12}
                      style={{
                        color: "var(--accent-primary,#6366f1)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      maxWidth: 110,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--text-primary)",
                    }}
                  >
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-tertiary)",
                      fontSize: 15,
                      lineHeight: 1,
                      padding: "0 1px",
                      display: "flex",
                      alignItems: "center",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#ef4444")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-tertiary)")
                    }
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
              gap: 8,
              alignItems: "flex-end",
              padding: "8px 10px 8px 12px",
              borderRadius: 16,
              background: "var(--bg-tertiary)",
              border: "1.5px solid var(--border-color)",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor =
                "var(--accent-primary,#6366f1)";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px var(--accent-light,rgba(99,102,241,0.1))";
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Attach file */}
            <label
              title="Attach image or PDF"
              style={{
                color: "var(--text-tertiary)",
                cursor: "pointer",
                padding: "4px",
                borderRadius: 7,
                display: "flex",
                alignItems: "center",
                transition: "all 0.18s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent-primary,#6366f1)";
                e.currentTarget.style.background =
                  "var(--accent-light,rgba(99,102,241,0.08))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-tertiary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Paperclip size={17} />
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
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                fontSize: "0.9rem",
                color: "var(--text-primary)",
                lineHeight: 1.65,
                padding: "3px 0",
                minHeight: 28,
                maxHeight: 130,
                overflowY: "auto",
                caretColor: "var(--accent-primary,#6366f1)",
              }}
              placeholder="Ask anything about your notes… (Shift+Enter for new line)"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            {/* Mic + Send */}
            <div
              style={{
                display: "flex",
                gap: 5,
                alignItems: "flex-end",
                flexShrink: 0,
              }}
            >
              {/* Mic button */}
              <button
                type="button"
                title={isListening ? "Stop recording" : "Voice input"}
                onClick={toggleListening}
                disabled={isLoading}
                className={isListening ? "ai-mic-active" : ""}
                style={{
                  width: 33,
                  height: 33,
                  borderRadius: 9,
                  border: "none",
                  background: isListening
                    ? "rgba(239,68,68,0.1)"
                    : "transparent",
                  color: isListening ? "#ef4444" : "var(--text-tertiary)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.18s",
                  opacity: isLoading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isListening && !isLoading) {
                    e.currentTarget.style.background =
                      "var(--accent-light,rgba(99,102,241,0.08))";
                    e.currentTarget.style.color =
                      "var(--accent-primary,#6366f1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isListening) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-tertiary)";
                  }
                }}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {/* Send button */}
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!canSend}
                title="Send message"
                style={{
                  width: 33,
                  height: 33,
                  borderRadius: 9,
                  border: "none",
                  background: canSend
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : "var(--bg-hover)",
                  color: canSend ? "#fff" : "var(--text-tertiary)",
                  cursor: canSend ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: canSend
                    ? "0 3px 12px rgba(99,102,241,0.42)"
                    : "none",
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => {
                  if (canSend) {
                    e.currentTarget.style.transform = "scale(1.07)";
                    e.currentTarget.style.boxShadow =
                      "0 5px 18px rgba(99,102,241,0.55)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = canSend
                    ? "0 3px 12px rgba(99,102,241,0.42)"
                    : "none";
                }}
              >
                {isLoading ? (
                  <span
                    className="ai-spin"
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      display: "inline-block",
                    }}
                  />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </div>
          </div>

          {/* Hint line */}
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 10.5,
              color: "var(--text-tertiary)",
              textAlign: "center",
              letterSpacing: "0.2px",
            }}
          >
            <Zap
              size={9}
              style={{
                display: "inline",
                verticalAlign: "middle",
                marginRight: 3,
              }}
            />
            Powered by NoteFlow AI · Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
};

export default AIAgentSidebar;
