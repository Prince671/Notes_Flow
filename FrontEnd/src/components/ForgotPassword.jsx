import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  Send,
  CheckCircle,
  Moon,
  Sun,
  Shield,
} from "lucide-react";

const injectStyles = () => {
  if (document.getElementById("noteflow-fp-styles")) return;
  const style = document.createElement("style");
  style.id = "noteflow-fp-styles";
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
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
      --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
      --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
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
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-12px); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes checkBounce {
      0%   { transform: scale(0.3) rotate(-20deg); opacity: 0; }
      50%  { transform: scale(1.15) rotate(5deg); }
      70%  { transform: scale(0.92) rotate(-3deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    .animate-slide-in-right { animation: slideInRight 0.35s cubic-bezier(0.22,1,0.36,1) both; }
    .animate-fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
    .animate-float { animation: float 4s ease-in-out infinite; }
    .animate-scale-in { animation: scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
    .animate-check-bounce { animation: checkBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
    .fp-input {
      width: 100%;
      padding: 14px 14px 14px 44px;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      font-size: 0.9375rem;
      font-family: inherit;
      background: var(--bg-secondary);
      color: var(--text-primary);
      outline: none;
      transition: all 0.2s;
    }
    .fp-input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 4px var(--accent-light);
    }
    .fp-input::placeholder { color: var(--text-muted); }
    .fp-input:disabled { opacity: 0.6; cursor: not-allowed; }
    .fp-input.error { border-color: var(--error); }
    .fp-btn-primary {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 24px;
      border: none;
      border-radius: 12px;
      font-size: 0.9375rem;
      font-weight: 700;
      font-family: inherit;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      background: linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed));
      box-shadow: 0 4px 14px rgba(99,102,241,0.35);
    }
    .fp-btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(99,102,241,0.45);
    }
    .fp-btn-primary:active:not(:disabled) { transform: translateY(0); }
    .fp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .fp-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }
    .toast-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 90vw;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-secondary);
      color: var(--text-primary);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      animation: slideInRight 0.35s cubic-bezier(0.22,1,0.36,1) both;
    }
    .toast.success { border-left: 4px solid var(--success); }
    .toast.error   { border-left: 4px solid var(--error); }
    .left-panel-bg {
      background: linear-gradient(135deg, var(--gradient-start, #1e40af) 0%, var(--gradient-end, #7c3aed) 100%);
    }
    @media (max-width: 1023px) {
      .lg-hidden { display: none !important; }
    }
    @media (min-width: 1024px) {
      .lg-flex { display: flex !important; }
    }
  `;
  document.head.appendChild(style);
};

const ForgotPassword = () => {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("notes-theme")) || false;
    } catch {
      return false;
    }
  });
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");
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
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to send reset email");
      addToast(data.message || "Reset link sent!", "success");
      setIsSuccess(true);
    } catch (err) {
      addToast(
        err.message || "Failed to send reset email. Please try again.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
      }}
      className="min-h-screen flex items-stretch relative overflow-hidden transition-colors duration-300"
    >
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 500 }}>
              {t.message}
            </span>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-tertiary)",
                fontSize: "20px",
                lineHeight: 1,
                padding: "2px 4px",
              }}
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Theme Toggle */}
      <button
        style={{
          background: "var(--bg-primary)",
          borderColor: "var(--border-color)",
          color: "var(--text-secondary)",
          position: "fixed",
          top: 16,
          left: 16,
          width: 40,
          height: 40,
          border: "1px solid",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          transition: "all 0.2s",
        }}
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Left Panel — Branding */}
      <div
        className="lg-flex lg-hidden"
        style={{
          display: "none",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          color: "white",
          position: "relative",
          overflow: "hidden",
          flex: 1,
          minWidth: 0,
          background:
            "linear-gradient(135deg, var(--gradient-start, #1e40af) 0%, var(--gradient-end, #7c3aed) 100%)",
        }}
      >
        {/* Animated blobs */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-20%",
            width: 384,
            height: 384,
            borderRadius: "50%",
            opacity: 0.2,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
            animation: "float 4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: 288,
            height: 288,
            borderRadius: "50%",
            opacity: 0.1,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
            animation: "float 4s ease-in-out infinite",
            animationDelay: "1s",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            animation: "fadeInUp 0.5s both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <svg
                viewBox="0 0 100 100"
                fill="none"
                style={{ width: 28, height: 28 }}
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
                <circle cx="72" cy="32" r="14" fill="#6366f1" />
                <line
                  x1="72"
                  y1="26"
                  x2="72"
                  y2="38"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line
                  x1="66"
                  y1="32"
                  x2="78"
                  y2="32"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                letterSpacing: "-0.02em",
              }}
            >
              NoteFlow
            </span>
          </div>

          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            Recover your
            <br />
            account securely
          </h1>
          <p style={{ fontSize: "1.0625rem", opacity: 0.85, lineHeight: 1.65 }}>
            We'll send a secure reset link to your email so you can get back to
            your notes in seconds.
          </p>
        </div>

        {/* Info cards */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {[
            {
              icon: "🔐",
              title: "Secure link",
              desc: "Your reset link expires in 1 hour",
            },
            {
              icon: "⚡",
              title: "Instant delivery",
              desc: "Emails delivered within seconds",
            },
            {
              icon: "🛡️",
              title: "Encrypted",
              desc: "All data protected with TLS 1.3",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 20px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                animation: `fadeInUp 0.5s ${0.2 + i * 0.1}s both`,
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  {item.title}
                </div>
                <div
                  style={{ opacity: 0.75, fontSize: "0.8125rem", marginTop: 2 }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div
        style={{
          background: "var(--bg-primary)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "40px 20px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>
          {/* Mobile logo */}
          <div
            className="lg-hidden"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed))",
              }}
            >
              <svg
                viewBox="0 0 100 100"
                fill="none"
                style={{ width: 20, height: 20 }}
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
                fontSize: "1.25rem",
                fontWeight: 900,
                color: "var(--text-primary)",
              }}
            >
              NoteFlow
            </span>
          </div>

          {isSuccess ? (
            /* ── Success State ── */
            <div
              style={{
                animation: "scaleIn 0.4s cubic-bezier(0.22,1,0.36,1) both",
              }}
            >
              {/* Success icon */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 28,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
                    animation:
                      "checkBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
                  }}
                >
                  <CheckCircle size={40} color="white" />
                </div>
              </div>

              <h2
                style={{
                  color: "var(--text-primary)",
                  fontSize: "1.875rem",
                  fontWeight: 900,
                  textAlign: "center",
                  marginBottom: 8,
                  letterSpacing: "-0.02em",
                }}
              >
                Check your inbox!
              </h2>
              <p
                style={{
                  color: "var(--text-tertiary)",
                  textAlign: "center",
                  fontSize: "0.9375rem",
                  lineHeight: 1.65,
                  marginBottom: 28,
                }}
              >
                We've sent a password reset link to{" "}
                <span
                  style={{ color: "var(--accent-primary)", fontWeight: 700 }}
                >
                  {email}
                </span>
              </p>

              {/* Info box */}
              <div
                style={{
                  background: "var(--accent-light)",
                  border: "1px solid var(--accent-primary)",
                  borderRadius: 14,
                  padding: "16px 20px",
                  marginBottom: 24,
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                >
                  <Mail
                    size={16}
                    style={{
                      color: "var(--accent-primary)",
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    The link will expire in{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      15 minutes
                    </strong>
                    . Didn't receive it? Check your spam folder or{" "}
                    <button
                      onClick={() => setIsSuccess(false)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-primary)",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "inherit",
                        padding: 0,
                        textDecoration: "underline",
                      }}
                    >
                      try again
                    </button>
                    .
                  </div>
                </div>
              </div>

              <Link
                to="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "14px 24px",
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed))",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                }}
              >
                <ArrowLeft size={18} />
                Back to Login
              </Link>

              {/* Steps */}
              <div
                style={{
                  marginTop: 28,
                  padding: "20px",
                  background: "var(--bg-secondary)",
                  borderRadius: 14,
                  border: "1px solid var(--border-color)",
                }}
              >
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 14,
                  }}
                >
                  Next steps
                </p>
                {[
                  "Open the email from NoteFlow",
                  "Click the secure reset link",
                  "Create your new password",
                ].map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: i < 2 ? 10 : 0,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "var(--accent-light)",
                        color: "var(--accent-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              {/* Header */}
              <div
                style={{ marginBottom: 32, animation: "fadeInUp 0.4s both" }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background:
                      "linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    boxShadow: "0 8px 20px rgba(99,102,241,0.3)",
                  }}
                >
                  <Mail size={26} color="white" />
                </div>
                <h2
                  style={{
                    color: "var(--text-primary)",
                    fontSize: "1.875rem",
                    fontWeight: 900,
                    marginBottom: 8,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Forgot password?
                </h2>
                <p
                  style={{
                    color: "var(--text-tertiary)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                  }}
                >
                  No worries! Enter your email and we'll send you a reset link
                  right away.
                </p>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* Email field */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label
                    htmlFor="fp-email"
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail
                      size={18}
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)",
                        pointerEvents: "none",
                        zIndex: 1,
                      }}
                    />
                    <input
                      id="fp-email"
                      type="email"
                      className={`fp-input${emailError ? " error" : ""}`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      disabled={isLoading}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    />
                  </div>
                  {emailError && (
                    <span
                      style={{
                        color: "var(--error)",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                      }}
                    >
                      {emailError}
                    </span>
                  )}
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  className="fp-btn-primary"
                  disabled={isLoading}
                  style={{ marginTop: 4 }}
                >
                  {isLoading ? (
                    <>
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                          flexShrink: 0,
                        }}
                      />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "var(--border-color)",
                    }}
                  />
                  <span
                    style={{
                      color: "var(--text-tertiary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    or
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "var(--border-color)",
                    }}
                  />
                </div>

                {/* Back to login */}
                <div style={{ textAlign: "center" }}>
                  <span
                    style={{
                      color: "var(--text-tertiary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Remember your password?{" "}
                  </span>
                  <Link
                    to="/"
                    style={{
                      color: "var(--accent-primary)",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      textDecoration: "none",
                    }}
                  >
                    Sign In
                  </Link>
                </div>

                <Link
                  to="/"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  <ArrowLeft size={15} />
                  Back to Login
                </Link>
              </div>

              {/* Security badge */}
              <div
                style={{
                  marginTop: 28,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 16px",
                  border: "1px solid var(--border-color)",
                  borderRadius: 12,
                  background: "rgba(16,185,129,0.04)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                }}
              >
                <Shield
                  size={14}
                  style={{ color: "var(--success)", flexShrink: 0 }}
                />
                <span>
                  Your connection is secure and encrypted with TLS 1.3
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "var(--text-tertiary)",
            marginTop: 32,
            opacity: 0.7,
          }}
        >
          © {new Date().getFullYear()} NoteFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
