import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  KeyRound,
  ArrowLeft,
  Moon,
  Sun,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

/* ── inject global styles matching the NoteFlow design system ── */
const injectStyles = () => {
  if (document.getElementById("reset-pw-styles")) return;
  const style = document.createElement("style");
  style.id = "reset-pw-styles";
  style.textContent = `
    :root {
      --bg-primary: #f8fafc;
      --bg-secondary: #ffffff;
      --bg-tertiary: #f1f5f9;
      --bg-hover: #e2e8f0;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-tertiary: #94a3b8;
      --text-muted: #94a3b8;
      --border-color: #e2e8f0;
      --accent-primary: #6366f1;
      --accent-hover: #4f46e5;
      --accent-light: rgba(99,102,241,0.1);
      --success: #10b981;
      --error: #ef4444;
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
      --text-muted: #475569;
      --border-color: #1e2840;
      --accent-primary: #818cf8;
      --accent-hover: #6366f1;
      --accent-light: rgba(129,140,248,0.12);
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
    @keyframes fadeScaleIn {
      from { opacity: 0; transform: scale(0.94); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes floatBg {
      0%, 100% { transform: translateY(0) scale(1); }
      50%       { transform: translateY(-24px) scale(1.04); }
    }
    @keyframes successBounce {
      0%   { transform: scale(0.3) rotate(-10deg); opacity: 0; }
      50%  { transform: scale(1.1) rotate(5deg); }
      70%  { transform: scale(0.95) rotate(-2deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes checkDraw {
      from { stroke-dashoffset: 60; }
      to   { stroke-dashoffset: 0; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .rp-slide-in-right { animation: slideInRight 0.35s cubic-bezier(0.22,1,0.36,1) both; }
    .rp-slide-d1 { animation: slideInUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
    .rp-slide-d2 { animation: slideInUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
    .rp-slide-d3 { animation: slideInUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
    .rp-fade-in  { animation: fadeScaleIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
    .rp-success  { animation: successBounce 0.6s cubic-bezier(0.68,-0.55,0.27,1.55) both; }
    .rp-float    { animation: floatBg 8s ease-in-out infinite; }
    .rp-float-d  { animation: floatBg 10s ease-in-out infinite; animation-delay: 2s; }
    .rp-spin     { animation: spin 0.8s linear infinite; }

    .rp-input {
      width: 100%;
      padding: 14px 48px 14px 48px;
      border-radius: 14px;
      border: 2px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 0.9375rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s;
    }
    .rp-input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 4px var(--accent-light);
    }
    .rp-input.error { border-color: var(--error); }
    .rp-input:disabled { opacity: 0.6; cursor: not-allowed; }
    .rp-input::placeholder { color: var(--text-muted); }

    .rp-btn-primary {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 24px;
      border-radius: 14px;
      border: none;
      font-size: 0.9375rem;
      font-weight: 700;
      font-family: inherit;
      color: #fff;
      cursor: pointer;
      background: linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed));
      box-shadow: 0 4px 16px rgba(99,102,241,0.3);
      transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
    }
    .rp-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,102,241,0.45); }
    .rp-btn-primary:active:not(:disabled) { transform: translateY(0); }
    .rp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .rp-strength-bar {
      height: 4px;
      flex: 1;
      border-radius: 999px;
      transition: background 0.3s ease;
    }
    @media (max-width: 640px) {
      .rp-left-panel { display: none !important; }
      .rp-form-panel { padding: 24px 20px !important; }
    }
  `;
  document.head.appendChild(style);
};

/* ── Password strength indicator ── */
const PasswordStrength = ({ password }) => {
  const checks = [
    { label: "6+ characters", met: password.length >= 6 },
    { label: "Has number", met: /\d/.test(password) },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Special char", met: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.met).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rp-strength-bar"
            style={{
              background: i < score ? colors[score - 1] : "var(--border-color)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: score > 0 ? colors[score - 1] : "var(--text-tertiary)",
          }}
        >
          {score > 0 ? labels[score - 1] : ""}
        </span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {checks.map((c) => (
            <span
              key={c.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 11,
                opacity: c.met ? 1 : 0.4,
                color: c.met ? "#22c55e" : "var(--text-tertiary)",
              }}
            >
              <CheckCircle2 size={10} />
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Toast container (same pattern as Login/Register) ── */
const ToastContainer = ({ toasts, onRemove }) => (
  <div
    style={{
      position: "fixed",
      top: 16,
      right: 16,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      width: "90vw",
      maxWidth: 380,
    }}
  >
    {toasts.map((t) => {
      const borderColor =
        t.type === "success"
          ? "var(--success)"
          : t.type === "error"
            ? "var(--error)"
            : "var(--accent-primary)";
      return (
        <div
          key={t.id}
          className="rp-slide-in-right"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 16px",
            background: "var(--bg-primary)",
            border: `1px solid var(--border-color)`,
            borderLeft: `4px solid ${borderColor}`,
            borderRadius: 14,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            color: "var(--text-primary)",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>
            {t.message}
          </span>
          <button
            onClick={() => onRemove(t.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-tertiary)",
              fontSize: 18,
              lineHeight: 1,
              padding: "2px 4px",
              borderRadius: 6,
            }}
          >
            ×
          </button>
        </div>
      );
    })}
  </div>
);

/* ── Left branding panel (mirrors Login) ── */
const BrandPanel = () => (
  <div
    className="rp-left-panel"
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "48px 56px",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      background:
        "linear-gradient(135deg, var(--gradient-start, #1e40af) 0%, var(--gradient-end, #7c3aed) 100%)",
    }}
  >
    {/* bg blobs */}
    <div
      className="rp-float"
      style={{
        position: "absolute",
        top: "-20%",
        left: "-20%",
        width: 420,
        height: 420,
        borderRadius: "50%",
        pointerEvents: "none",
        background:
          "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)",
      }}
    />
    <div
      className="rp-float-d"
      style={{
        position: "absolute",
        bottom: "-10%",
        right: "-10%",
        width: 320,
        height: 320,
        borderRadius: "50%",
        pointerEvents: "none",
        background:
          "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
      }}
    />

    {/* Logo */}
    <div style={{ position: "relative", zIndex: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 56,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid rgba(255,255,255,0.3)",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            style={{ width: 30, height: 30 }}
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
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1="27"
              y1="55"
              x2="63"
              y2="55"
              stroke="#3b82f6"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="73" cy="30" r="12" fill="#22c55e" />
            <path
              d="M68 30 l3 3 l6-6"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <span
          style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px" }}
        >
          NoteFlow
        </span>
      </div>

      <h2
        style={{
          fontSize: "clamp(28px, 3.5vw, 42px)",
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: "-1px",
          marginBottom: 18,
        }}
      >
        Reset your
        <br />
        password securely
      </h2>
      <p
        style={{
          fontSize: "1.0625rem",
          opacity: 0.8,
          lineHeight: 1.7,
          maxWidth: 380,
        }}
      >
        Create a strong, unique password to protect your notes and ideas.
      </p>
    </div>

    {/* Tips */}
    <div style={{ position: "relative", zIndex: 1 }}>
      {[
        { icon: <Shield size={18} />, text: "Minimum 6 characters required" },
        {
          icon: <KeyRound size={18} />,
          text: "Mix letters, numbers & symbols",
        },
        {
          icon: <Sparkles size={18} />,
          text: "Avoid using personal information",
        },
        { icon: <CheckCircle2 size={18} />, text: "Never reuse old passwords" },
      ].map((tip, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
            opacity: 0.85,
          }}
        >
          <div style={{ flexShrink: 0, opacity: 0.9 }}>{tip.icon}</div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{tip.text}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Main component ── */
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("notes-theme") || "false");
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    injectStyles();
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
    localStorage.setItem("notes-theme", JSON.stringify(darkMode));
  }, [darkMode]);

  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const validate = () => {
    const e = {};
    if (!password) e.password = "Password is required";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (!confirmPassword) e.confirm = "Please confirm your password";
    else if (password !== confirmPassword) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      addToast("Invalid or missing reset token", "error");
      return;
    }
    if (!validate()) {
      addToast("Please fix the errors below", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/auth/reset-password`,
        {
          token,
          newPassword: password,
        },
      );
      addToast(
        response.data.message || "Password reset successful!",
        "success",
      );
      setIsSuccess(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      addToast(
        err.response?.data?.error ||
          "Failed to reset password. The link may be expired.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Invalid token state ── */
  if (!token) {
    return (
      <div
        className="rp-fade-in"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary)",
          padding: 24,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            background: "var(--bg-secondary)",
            borderRadius: 24,
            border: "1px solid var(--border-color)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
            padding: "48px 40px",
            textAlign: "center",
            maxWidth: 460,
            width: "100%",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "rgba(239,68,68,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <AlertTriangle size={36} color="#ef4444" />
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
            Invalid Reset Link
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            The password reset link is invalid or missing the required token.
            Please request a new one.
          </p>
          <Link
            to="/forgot-password"
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
              transition: "all 0.2s",
            }}
          >
            Request New Link
          </Link>
          <div style={{ marginTop: 20 }}>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                color: "var(--accent-primary)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={15} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Theme toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary)",
          border: "1px solid var(--border-color)",
          borderRadius: 10,
          cursor: "pointer",
          zIndex: 1000,
          color: "var(--text-secondary)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "all 0.2s",
        }}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Left branding */}
      <BrandPanel />

      {/* ── Right form panel ── */}
      <div
        className="rp-form-panel"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 56px",
          background: "var(--bg-primary)",
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: 440, width: "100%", margin: "0 auto" }}>
          {/* Mobile logo */}
          <div style={{ display: "none" }} className="rp-mobile-logo">
            {/* shown via media query workaround — logo inline for mobile */}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 40,
            }}
            className="lg:hidden"
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                viewBox="0 0 100 100"
                fill="none"
                style={{ width: 22, height: 22 }}
              >
                <rect
                  x="15"
                  y="25"
                  width="70"
                  height="60"
                  rx="10"
                  fill="white"
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
                fontSize: 20,
                fontWeight: 900,
                color: "var(--text-primary)",
              }}
            >
              NoteFlow
            </span>
          </div>

          {isSuccess ? (
            /* ── Success state ── */
            <div className="rp-fade-in" style={{ textAlign: "center" }}>
              <div
                className="rp-success"
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: "rgba(16,185,129,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 28px",
                  border: "2px solid rgba(16,185,129,0.25)",
                }}
              >
                <svg viewBox="0 0 60 60" style={{ width: 48, height: 48 }}>
                  <circle
                    cx="30"
                    cy="30"
                    r="28"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    opacity="0.4"
                  />
                  <path
                    d="M18 30 l9 9 l15-18"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="60"
                    style={{ animation: "checkDraw 0.5s ease 0.3s both" }}
                  />
                </svg>
              </div>
              <h2
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  marginBottom: 12,
                  letterSpacing: "-0.5px",
                }}
              >
                Password Reset!
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--text-secondary)",
                  marginBottom: 8,
                  lineHeight: 1.7,
                }}
              >
                Your password has been updated successfully.
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-tertiary)",
                  marginBottom: 32,
                }}
              >
                Redirecting you to sign in in a few seconds…
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <div
                  className="rp-spin"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid var(--border-color)",
                    borderTopColor: "var(--accent-primary)",
                  }}
                />
                <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                  Taking you to login…
                </span>
              </div>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="rp-slide-d1" style={{ marginBottom: 36 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "var(--accent-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    border: "1.5px solid rgba(99,102,241,0.2)",
                  }}
                >
                  <KeyRound size={26} color="var(--accent-primary)" />
                </div>
                <h2
                  style={{
                    fontSize: 30,
                    fontWeight: 900,
                    color: "var(--text-primary)",
                    margin: "0 0 10px",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Set New Password
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--text-tertiary)",
                    margin: 0,
                  }}
                >
                  Choose a strong password for your NoteFlow account.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* New password */}
                <div
                  className="rp-slide-d2"
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                    htmlFor="rp-password"
                  >
                    New Password
                  </label>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Lock
                      size={18}
                      style={{
                        position: "absolute",
                        left: 16,
                        pointerEvents: "none",
                        color: "var(--text-muted)",
                        zIndex: 1,
                      }}
                    />
                    <input
                      id="rp-password"
                      type={showPassword ? "text" : "password"}
                      className={`rp-input${errors.password ? " error" : ""}`}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((p) => ({ ...p, password: "" }));
                      }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 14,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: "6px",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--error)",
                        fontWeight: 500,
                      }}
                    >
                      {errors.password}
                    </span>
                  )}
                  <PasswordStrength password={password} />
                </div>

                {/* Confirm password */}
                <div
                  className="rp-slide-d2"
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                    htmlFor="rp-confirm"
                  >
                    Confirm Password
                  </label>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Lock
                      size={18}
                      style={{
                        position: "absolute",
                        left: 16,
                        pointerEvents: "none",
                        color: "var(--text-muted)",
                        zIndex: 1,
                      }}
                    />
                    <input
                      id="rp-confirm"
                      type={showConfirm ? "text" : "password"}
                      className={`rp-input${errors.confirm ? " error" : ""}`}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors((p) => ({ ...p, confirm: "" }));
                      }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: "absolute",
                        right: 14,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: "6px",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirm && (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--error)",
                        fontWeight: 500,
                      }}
                    >
                      {errors.confirm}
                    </span>
                  )}
                  {/* match indicator */}
                  {confirmPassword && !errors.confirm && (
                    <span
                      style={{
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        color:
                          password === confirmPassword ? "#22c55e" : "#f97316",
                        fontWeight: 500,
                      }}
                    >
                      <CheckCircle2 size={12} />
                      {password === confirmPassword
                        ? "Passwords match"
                        : "Passwords don't match yet"}
                    </span>
                  )}
                </div>

                {/* Submit */}
                <div className="rp-slide-d3">
                  <button
                    type="submit"
                    className="rp-btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="rp-spin"
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            display: "inline-block",
                          }}
                        />
                        Resetting Password…
                      </>
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Reset Password
                      </>
                    )}
                  </button>
                </div>

                {/* Back link */}
                <div className="rp-slide-d3" style={{ textAlign: "center" }}>
                  <Link
                    to="/"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--accent-primary)",
                      textDecoration: "none",
                    }}
                  >
                    <ArrowLeft size={15} />
                    Back to Sign In
                  </Link>
                </div>
              </form>

              {/* Security badge */}
              <div
                className="rp-slide-d3"
                style={{
                  marginTop: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 18px",
                  borderRadius: 12,
                  background: "rgba(16,185,129,0.06)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <Shield size={14} style={{ color: "#10b981", flexShrink: 0 }} />
                Your password is encrypted and stored securely
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
