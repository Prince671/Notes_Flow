import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Tag,
  Clock,
  FileText,
  Share2,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Moon,
  Sun,
  Sparkles,
  BookOpen,
} from "lucide-react";

/* ── inject styles matching the NoteFlow design system ── */
const injectStyles = () => {
  if (document.getElementById("shared-note-styles")) return;
  const style = document.createElement("style");
  style.id = "shared-note-styles";
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
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
      --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
      --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
      --shadow-xl: 0 20px 60px rgba(0,0,0,0.14);
      --gradient-start: #1e40af;
      --gradient-end: #7c3aed;
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
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }

    @keyframes sn-slideInUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes sn-fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes sn-scaleIn {
      from { opacity: 0; transform: scale(0.88); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes sn-spinFast {
      to { transform: rotate(360deg); }
    }
    @keyframes sn-shimmer {
      from { background-position: -200% 0; }
      to   { background-position: 200% 0; }
    }
    @keyframes sn-shake {
      0%,100% { transform: translateX(0); }
      20%,60% { transform: translateX(-6px); }
      40%,80% { transform: translateX(6px); }
    }
    @keyframes sn-tagIn {
      from { opacity: 0; transform: translateY(8px) scale(0.9); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes sn-pulse {
      0%,100% { opacity: 1; }
      50%      { opacity: 0.5; }
    }
    @keyframes sn-floatBg {
      0%,100% { transform: translateY(0) scale(1); }
      50%      { transform: translateY(-20px) scale(1.03); }
    }

    .sn-slide-d1 { animation: sn-slideInUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
    .sn-slide-d2 { animation: sn-slideInUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
    .sn-slide-d3 { animation: sn-slideInUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
    .sn-slide-d4 { animation: sn-slideInUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
    .sn-fade     { animation: sn-fadeIn 0.4s ease both; }
    .sn-scale    { animation: sn-scaleIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
    .sn-spin     { animation: sn-spinFast 0.9s linear infinite; }
    .sn-shake    { animation: sn-shake 0.5s ease both; }
    .sn-pulse    { animation: sn-pulse 1.8s ease-in-out infinite; }
    .sn-float    { animation: sn-floatBg 9s ease-in-out infinite; }
    .sn-float-d  { animation: sn-floatBg 12s ease-in-out infinite; animation-delay: 3s; }

    .sn-skeleton {
      background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-hover) 50%, var(--bg-tertiary) 75%);
      background-size: 200% 100%;
      animation: sn-shimmer 1.5s infinite;
      border-radius: 8px;
    }
    .sn-tag {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: 999px;
      font-size: 13px; font-weight: 600;
      border: 1.5px solid rgba(99,102,241,0.18);
      color: var(--accent-primary);
      cursor: default;
      transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
      background: var(--accent-light);
    }
    .sn-tag:hover {
      background: linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed));
      color: #fff; border-color: transparent;
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(99,102,241,0.4);
    }
    .sn-copy-btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 18px; border-radius: 10px;
      font-size: 13px; font-weight: 600; font-family: inherit;
      cursor: pointer; border: 1.5px solid var(--border-color);
      background: var(--bg-tertiary); color: var(--text-secondary);
      transition: all 0.2s;
    }
    .sn-copy-btn:hover {
      border-color: var(--accent-primary); color: var(--accent-primary);
      background: var(--accent-light);
    }
    .sn-copy-btn.copied {
      border-color: var(--success); color: var(--success);
      background: rgba(16,185,129,0.08);
    }
    @media (max-width: 640px) {
      .sn-card    { padding: 24px 20px !important; }
      .sn-header  { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
      .sn-title   { font-size: clamp(22px, 6vw, 32px) !important; }
    }
    @media (max-width: 480px) {
      .sn-meta-row { flex-direction: column !important; align-items: flex-start !important; }
    }
  `;
  document.head.appendChild(style);
};

/* ── Skeleton loader ── */
const SkeletonLoader = () => (
  <div style={{ maxWidth: 820, width: "100%", margin: "0 auto" }}>
    <div
      className="sn-card"
      style={{
        background: "var(--bg-secondary)",
        borderRadius: 24,
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-xl)",
        padding: "48px 56px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            "linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-hover) 50%, var(--bg-tertiary) 75%)",
          backgroundSize: "200% 100%",
          animation: "sn-shimmer 1.5s infinite",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <div className="sn-skeleton" style={{ width: 80, height: 26 }} />
      </div>
      <div
        className="sn-skeleton"
        style={{ height: 36, width: "75%", marginBottom: 20 }}
      />
      <div
        className="sn-skeleton"
        style={{ height: 18, width: "100%", marginBottom: 10 }}
      />
      <div
        className="sn-skeleton"
        style={{ height: 18, width: "90%", marginBottom: 10 }}
      />
      <div
        className="sn-skeleton"
        style={{ height: 18, width: "80%", marginBottom: 10 }}
      />
      <div
        className="sn-skeleton"
        style={{ height: 18, width: "60%", marginBottom: 28 }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        {[60, 80, 70].map((w, i) => (
          <div
            key={i}
            className="sn-skeleton"
            style={{ height: 30, width: w, borderRadius: 999 }}
          />
        ))}
      </div>
    </div>
  </div>
);

/* ── Format date helper ── */
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
};

/* ── Reading time estimate ── */
const readingTime = (text = "") => {
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
};

/* ── Main component ── */
const SharedNote = () => {
  const { publicId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("notes-theme") || "false");
    } catch {
      return false;
    }
  });

  const API_BASE = import.meta.env.VITE_API_BASE + "/notes";

  useEffect(() => {
    injectStyles();
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
  }, [darkMode]);

  useEffect(() => {
    injectStyles();
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE}/share/${publicId}`);
        setNote(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [publicId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  /* gradient for the top accent bar */
  const accentGradient =
    "linear-gradient(90deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed))";
  const bgPage =
    "linear-gradient(135deg, var(--gradient-start, #1e40af) 0%, var(--gradient-end, #7c3aed) 100%)";

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className="sn-fade"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          background: bgPage,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* Floating bg blobs */}
        <div
          className="sn-float"
          style={{
            position: "fixed",
            top: "-20%",
            left: "-20%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          className="sn-float-d"
          style={{
            position: "fixed",
            bottom: "-15%",
            right: "-15%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            textAlign: "center",
            color: "#fff",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            className="sn-spin"
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.2)",
              borderTopColor: "#fff",
              margin: "0 auto 20px",
            }}
          />
          <p
            className="sn-pulse"
            style={{ fontSize: 17, fontWeight: 600, opacity: 0.9 }}
          >
            Loading shared note…
          </p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!note) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          background: bgPage,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          className="sn-float"
          style={{
            position: "fixed",
            top: "-20%",
            left: "-20%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          className="sn-scale"
          style={{
            background: "var(--bg-secondary)",
            borderRadius: 24,
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-xl)",
            padding: "48px 40px",
            textAlign: "center",
            maxWidth: 480,
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            className="sn-shake"
            style={{
              width: 80,
              height: 80,
              borderRadius: 22,
              background: "rgba(239,68,68,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              border: "1.5px solid rgba(239,68,68,0.18)",
            }}
          >
            <AlertTriangle size={38} color="#ef4444" />
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "var(--text-primary)",
              margin: "0 0 12px",
              letterSpacing: "-0.5px",
            }}
          >
            Note Not Found
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              marginBottom: 32,
              lineHeight: 1.7,
            }}
          >
            This note doesn't exist, has been removed, or is no longer shared
            publicly.
          </p>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 28px",
              borderRadius: 14,
              background:
                "linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed))",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}
          >
            <BookOpen size={18} />
            Open NoteFlow
          </Link>
        </div>
      </div>
    );
  }

  /* ── Note found ── */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: bgPage,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        position: "relative",
      }}
    >
      {/* Background blobs */}
      <div
        className="sn-float"
        style={{
          position: "fixed",
          top: "-20%",
          left: "-20%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="sn-float-d"
        style={{
          position: "fixed",
          bottom: "-15%",
          right: "-15%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Theme toggle */}
      <button
        onClick={() => {
          const next = !darkMode;
          setDarkMode(next);
          document.documentElement.setAttribute(
            "data-theme",
            next ? "dark" : "light",
          );
          localStorage.setItem("notes-theme", JSON.stringify(next));
        }}
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          border: "1.5px solid rgba(255,255,255,0.25)",
          borderRadius: 10,
          cursor: "pointer",
          zIndex: 100,
          color: "#fff",
          transition: "all 0.2s",
        }}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* ── Top nav bar ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <div
          style={{
            maxWidth: 820,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid rgba(255,255,255,0.3)",
              }}
            >
              <svg
                viewBox="0 0 100 100"
                fill="none"
                style={{ width: 18, height: 18 }}
              >
                <rect
                  x="15"
                  y="25"
                  width="70"
                  height="60"
                  rx="10"
                  fill="white"
                  opacity="0.95"
                />
                <line
                  x1="27"
                  y1="43"
                  x2="73"
                  y2="43"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="27"
                  y1="55"
                  x2="63"
                  y2="55"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: 17,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.3px",
              }}
            >
              NoteFlow
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className={`sn-copy-btn${copied ? " copied" : ""}`}
              onClick={handleCopyLink}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              <ExternalLink size={13} />
              Open App
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        style={{ padding: "40px 16px 64px", position: "relative", zIndex: 1 }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          {/* ── Note card ── */}
          <div
            className="sn-card sn-slide-d1"
            style={{
              background: "var(--bg-secondary)",
              borderRadius: 24,
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-xl)",
              overflow: "hidden",
            }}
          >
            {/* accent top bar */}
            <div style={{ height: 4, background: accentGradient }} />

            <div style={{ padding: "40px 48px" }} className="sn-card">
              {/* ── Badge row ── */}
              <div
                className="sn-slide-d1 sn-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 28,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 999,
                      background:
                        "linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed))",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                    }}
                  >
                    <Share2 size={11} />
                    Shared Note
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 12px",
                      borderRadius: 999,
                      background: "var(--accent-light)",
                      border: "1.5px solid rgba(99,102,241,0.18)",
                      color: "var(--accent-primary)",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    <Sparkles size={10} />
                    NoteFlow
                  </span>
                </div>
                <button
                  className={`sn-copy-btn${copied ? " copied" : ""}`}
                  onClick={handleCopyLink}
                  style={{ fontSize: 12 }}
                >
                  {copied ? <Check size={13} /> : <Share2 size={13} />}
                  {copied ? "Link Copied!" : "Share"}
                </button>
              </div>

              {/* ── Title ── */}
              <h1
                className="sn-title sn-slide-d2"
                style={{
                  fontSize: "clamp(24px, 4.5vw, 38px)",
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  margin: "0 0 18px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.8px",
                  wordBreak: "break-word",
                }}
              >
                {note.title}
              </h1>

              {/* ── Meta row ── */}
              <div
                className="sn-slide-d2 sn-meta-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 18,
                  marginBottom: 32,
                  paddingBottom: 24,
                  borderBottom: "1.5px solid var(--border-color)",
                }}
              >
                {note.createdAt && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      color: "var(--text-tertiary)",
                      fontWeight: 500,
                    }}
                  >
                    <Clock size={13} />
                    {formatDate(note.createdAt)}
                  </span>
                )}
                {note.description && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      color: "var(--text-tertiary)",
                      fontWeight: 500,
                    }}
                  >
                    <FileText size={13} />
                    {readingTime(note.description)}
                  </span>
                )}
                {note.tags?.length > 0 && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      color: "var(--text-tertiary)",
                      fontWeight: 500,
                    }}
                  >
                    <Tag size={13} />
                    {note.tags.length} tag{note.tags.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* ── Body ── */}
              <div className="sn-slide-d3" style={{ marginBottom: 36 }}>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.85,
                    color: "var(--text-secondary)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    textAlign: "justify",
                    margin: 0,
                  }}
                >
                  {note.description}
                </p>
              </div>

              {/* ── Tags ── */}
              {note.tags?.length > 0 && (
                <div
                  className="sn-slide-d4"
                  style={{
                    paddingTop: 24,
                    borderTop: "1.5px solid var(--border-color)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "1.2px",
                      marginBottom: 12,
                    }}
                  >
                    Tags
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {note.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="sn-tag"
                        style={{
                          animation: `sn-tagIn 0.4s cubic-bezier(0.22,1,0.36,1) ${0.35 + idx * 0.06}s both`,
                        }}
                      >
                        <Tag size={11} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer CTA ── */}
          <div
            className="sn-slide-d4"
            style={{ textAlign: "center", marginTop: 40 }}
          >
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              Created & shared with NoteFlow — your intelligent note-taking
              companion
            </p>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 28px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.16)",
                backdropFilter: "blur(12px)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                transition: "all 0.2s",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}
            >
              <BookOpen size={18} />
              Start taking notes for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedNote;
