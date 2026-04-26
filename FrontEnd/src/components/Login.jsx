import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Moon,
  Sun,
  CheckCircle2,
  Shield,
  Zap,
  Users,
  Sparkles,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const s = localStorage.getItem("notes-theme");
      return s ? JSON.parse(s) : false;
    } catch {
      return false;
    }
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
    localStorage.setItem("notes-theme", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered-email");
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateLoginForm = () => {
    const errors = {};
    if (!loginEmail.trim()) errors.email = "Email is required";
    else if (!validateEmail(loginEmail)) errors.email = "Invalid email format";
    if (!loginPassword) errors.password = "Password is required";
    else if (loginPassword.length < 6)
      errors.password = "Password must be at least 6 characters";
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const AUTH_BASE = import.meta.env.VITE_API_BASE + "/auth";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) {
      addToast("Please fix the errors in the form", "error");
      return;
    }
    setLoginLoading(true);
    try {
      const response = await fetch(`${AUTH_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (rememberMe) localStorage.setItem("remembered-email", loginEmail);
      else localStorage.removeItem("remembered-email");
      addToast("Login successful! Welcome back!", "success");
      navigate("/notes");
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const toastBorder = {
    success: "border-l-[var(--success)]",
    error: "border-l-[var(--error)]",
    info: "border-l-[var(--accent-primary)]",
  };

  const features = [
    { icon: <Shield size={18} />, text: "End-to-end encrypted" },
    { icon: <Zap size={18} />, text: "Lightning fast sync" },
    { icon: <Users size={18} />, text: "Share & collaborate" },
    { icon: <Sparkles size={18} />, text: "AI-powered assistant" },
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "1M+", label: "Notes Created" },
  ];

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
      }}
      className="min-h-screen flex items-stretch relative overflow-hidden transition-colors duration-300"
    >
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[90vw] max-w-[380px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: "var(--bg-primary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
            className={`flex items-center justify-between gap-3 px-4 py-3.5 border rounded-xl shadow-theme-xl border-l-4 ${toastBorder[t.type] || toastBorder.info} animate-slide-in-right`}
          >
            <span className="flex-1 text-sm font-medium">{t.message}</span>
            <button
              style={{ color: "var(--text-tertiary)" }}
              className="w-6 h-6 flex items-center justify-center rounded text-xl hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
              onClick={() => removeToast(t.id)}
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
        }}
        className="fixed top-4 left-4 w-10 h-10 flex items-center justify-center border rounded-lg z-[1000] shadow-theme-md hover:scale-105 hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all duration-200"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Left Side - Branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-10 xl:p-14 text-white relative overflow-hidden flex-[1] min-w-0"
        style={{
          background:
            "linear-gradient(135deg, var(--gradient-start, #1e40af) 0%, var(--gradient-end, #7c3aed) 100%)",
        }}
      >
        {/* Animated BG circles */}
        <div
          className="absolute top-[-20%] left-[-20%] w-96 h-96 rounded-full opacity-20 animate-float pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-72 h-72 rounded-full opacity-10 animate-float pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
            animationDelay: "1s",
          }}
        />

        {/* Logo & title */}
        <div className="relative z-10">
          <div className="w-14 h-14 mb-6 animate-fade-in-down">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-lg"
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
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <line
                x1="27"
                y1="55"
                x2="63"
                y2="55"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <line
                x1="27"
                y1="67"
                x2="68"
                y2="67"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="78" cy="28" r="16" fill="#f59e0b" />
              <path
                d="M72 28l4 4 8-8"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1
            className="text-4xl xl:text-5xl font-black mb-3 tracking-tight"
            style={{ animation: "fadeInDown 0.6s ease 0.1s both" }}
          >
            NoteFlow
          </h1>
          <p
            className="text-lg opacity-90 font-normal max-w-xs"
            style={{ animation: "fadeInDown 0.6s ease 0.2s both" }}
          >
            Capture ideas, organize thoughts, and achieve more — beautifully.
          </p>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-2 gap-4 relative z-10"
          style={{ animation: "fadeInUp 0.6s ease 0.3s both" }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl backdrop-blur-sm border border-white/20 bg-white/10 hover:bg-white/15 transition-all duration-200"
            >
              <div className="text-3xl font-black leading-none mb-1">
                {stat.number}
              </div>
              <div className="text-sm opacity-85 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div
          className="grid grid-cols-2 gap-3 relative z-10"
          style={{ animation: "fadeInUp 0.6s ease 0.4s both" }}
        >
          {features.map((f) => (
            <div
              key={f.text}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium hover:bg-white/15 transition-colors"
            >
              <span className="shrink-0 opacity-90">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div
          className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 relative z-10"
          style={{ animation: "fadeInUp 0.6s ease 0.5s both" }}
        >
          <div className="flex gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm leading-relaxed mb-4 italic opacity-95">
            "The best note-taking app I've ever used. Simple, powerful, and
            beautiful."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              PS
            </div>
            <div>
              <div className="text-sm font-bold">Prince Soni</div>
              <div className="text-xs opacity-75">Software Engineer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div
        style={{ background: "var(--bg-primary)" }}
        className="flex flex-col justify-center px-5 py-10 sm:px-10 md:px-16 flex-[1] min-h-screen lg:min-h-0"
      >
        <div className="max-w-[420px] w-full mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed))",
              }}
            >
              <svg viewBox="0 0 100 100" fill="none" className="w-6 h-6">
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
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <line
                  x1="27"
                  y1="55"
                  x2="63"
                  y2="55"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              className="text-xl font-black"
              style={{ color: "var(--text-primary)" }}
            >
              NoteFlow
            </span>
          </div>

          <div className="mb-8">
            <h2
              style={{ color: "var(--text-primary)" }}
              className="text-3xl font-black mb-2 tracking-tight"
            >
              Welcome back
            </h2>
            <p
              style={{ color: "var(--text-tertiary)" }}
              className="text-[0.9375rem]"
            >
              Sign in to access your notes
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label
                style={{ color: "var(--text-secondary)" }}
                className="text-sm font-semibold"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail
                  className="absolute left-4 pointer-events-none z-10"
                  size={18}
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="email"
                  type="email"
                  style={{
                    background: "var(--bg-secondary)",
                    borderColor: loginErrors.email
                      ? "var(--error)"
                      : "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  className="w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] disabled:opacity-60 placeholder-[var(--text-muted)]"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={loginLoading}
                />
              </div>
              {loginErrors.email && (
                <span
                  style={{ color: "var(--error)" }}
                  className="text-xs font-medium"
                >
                  {loginErrors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label
                style={{ color: "var(--text-secondary)" }}
                className="text-sm font-semibold"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <Lock
                  className="absolute left-4 pointer-events-none z-10"
                  size={18}
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="password"
                  type={showLoginPassword ? "text" : "password"}
                  style={{
                    background: "var(--bg-secondary)",
                    borderColor: loginErrors.password
                      ? "var(--error)"
                      : "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  className="w-full pl-11 pr-12 py-3.5 border-2 rounded-xl text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] disabled:opacity-60 placeholder-[var(--text-muted)]"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={loginLoading}
                />
                <button
                  type="button"
                  style={{ color: "var(--text-muted)" }}
                  className="absolute right-3 p-2 rounded-lg flex items-center justify-center hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-all"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {loginErrors.password && (
                <span
                  style={{ color: "var(--error)" }}
                  className="text-xs font-medium"
                >
                  {loginErrors.password}
                </span>
              )}
            </div>

            {/* Actions row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <label
                style={{ color: "var(--text-secondary)" }}
                className="flex items-center gap-2 cursor-pointer text-sm select-none"
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 cursor-pointer rounded accent-[var(--accent-primary)]"
                />
                <span>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                style={{ color: "var(--accent-primary)" }}
                className="text-sm font-semibold no-underline hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                background:
                  "linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed))",
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-white text-[0.9375rem] font-bold font-[inherit] cursor-pointer transition-all duration-200 shadow-sm hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(59,130,246,0.3)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div
                className="flex-1 h-px"
                style={{ background: "var(--border-color)" }}
              />
              <span
                className="text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                or
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "var(--border-color)" }}
              />
            </div>

            <div className="text-center">
              <span
                style={{ color: "var(--text-tertiary)" }}
                className="text-sm"
              >
                Don't have an account?{" "}
              </span>
              <Link
                to="/register"
                style={{ color: "var(--accent-primary)" }}
                className="text-sm font-bold no-underline hover:underline transition-colors"
              >
                Create Account
              </Link>
            </div>
          </form>

          <div className="mt-8">
            <div
              style={{
                background: "var(--accent-bg, rgba(59,130,246,0.05))",
                borderColor: "var(--border-color)",
                color: "var(--text-secondary)",
              }}
              className="flex items-center gap-2 px-4 py-3 border rounded-xl text-xs font-medium justify-center"
            >
              <Shield
                size={14}
                style={{ color: "var(--success, #10b981)", flexShrink: 0 }}
              />
              <span>Your connection is secure and encrypted with TLS 1.3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
