import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  UserPlus,
  Moon,
  Sun,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

// ✅ FIX 1: Moved OUTSIDE Register component.
// Previously defined inside Register, which caused React to treat it as a
// brand-new component on every render (every keystroke), unmounting and
// remounting the <input> — making the mobile keyboard disappear each time.
const InputField = ({
  id,
  label,
  type,
  icon: Icon,
  placeholder,
  value,
  onChange,
  error,
  disabled,
  showToggle,
  onToggle,
  showPw,
  autoComplete,
  name,
  inputMode,
}) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label
        style={{ color: "var(--text-secondary)" }}
        className="text-sm font-semibold"
        htmlFor={id}
      >
        {label}
      </label>
    )}
    <div className="relative flex items-center">
      <Icon
        className="absolute left-4 pointer-events-none z-10"
        size={18}
        style={{ color: "var(--text-muted)" }}
      />
      <input
        id={id}
        name={name} // ✅ FIX 4: Added name for accessibility & autofill
        type={showToggle ? (showPw ? "text" : "password") : type}
        autoComplete={autoComplete} // ✅ FIX 3: Added autoComplete for better mobile UX
        inputMode={inputMode} // ✅ FIX 5: Added inputMode for correct mobile keyboard type
        style={{
          background: "var(--bg-secondary)",
          borderColor: error ? "var(--error)" : "var(--border-color)",
          color: "var(--text-primary)",
        }}
        className="w-full pl-11 pr-12 py-3.5 border-2 rounded-xl text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] disabled:opacity-60 placeholder-[var(--text-muted)]"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {showToggle && (
        <button
          type="button"
          style={{ color: "var(--text-muted)" }}
          className="absolute right-3 p-2 rounded-lg flex items-center justify-center hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-all"
          onClick={onToggle}
        >
          {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && (
      <span style={{ color: "var(--error)" }} className="text-xs font-medium">
        {error}
      </span>
    )}
  </div>
);

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
    { label: "Contains special char", met: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.met).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i < score ? colors[score - 1] : "var(--border-color)",
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium"
          style={{
            color: score > 0 ? colors[score - 1] : "var(--text-tertiary)",
          }}
        >
          {score > 0 ? labels[score - 1] : ""}
        </span>
        <div className="flex flex-wrap gap-x-3 justify-end">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`text-[10px] flex items-center gap-0.5 ${c.met ? "opacity-100" : "opacity-40"}`}
              style={{ color: c.met ? "#22c55e" : "var(--text-tertiary)" }}
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

const Register = () => {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const s = localStorage.getItem("notes-theme");
      return s ? JSON.parse(s) : false;
    } catch {
      return false;
    }
  });
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerErrors, setRegisterErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
    localStorage.setItem("notes-theme", JSON.stringify(darkMode));
  }, [darkMode]);

  // ✅ FIX 2: removeToast as useCallback to avoid stale closure in setTimeout
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 3500);
    },
    [removeToast],
  );

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateRegisterForm = () => {
    const errors = {};
    if (!registerName.trim()) errors.name = "Name is required";
    else if (registerName.trim().length < 2)
      errors.name = "Name must be at least 2 characters";
    if (!registerEmail.trim()) errors.email = "Email is required";
    else if (!validateEmail(registerEmail))
      errors.email = "Invalid email format";
    if (!registerPassword) errors.password = "Password is required";
    else if (registerPassword.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (!registerConfirmPassword)
      errors.confirmPassword = "Please confirm your password";
    else if (registerPassword !== registerConfirmPassword)
      errors.confirmPassword = "Passwords do not match";
    if (!agreeTerms) errors.terms = "Please agree to Terms of Service";
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const AUTH_BASE = import.meta.env.VITE_API_BASE + "/auth";

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) {
      addToast("Please fix the errors in the form", "error");
      return;
    }
    setRegisterLoading(true);
    try {
      const response = await fetch(`${AUTH_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      addToast("Account created successfully! Please sign in.", "success");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setRegisterLoading(false);
    }
  };

  const toastBorder = {
    success: "border-l-[var(--success)]",
    error: "border-l-[var(--error)]",
    info: "border-l-[var(--accent-primary)]",
  };

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
      }}
      className="min-h-screen flex items-stretch relative overflow-hidden transition-colors duration-300"
    >
      {/* Toast */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[90vw] max-w-[380px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: "var(--bg-primary)",
              borderColor: "var(--border-color)",
            }}
            className={`flex items-center justify-between gap-3 px-4 py-3.5 border rounded-xl shadow-theme-xl border-l-4 ${toastBorder[t.type] || toastBorder.info} animate-slide-in-right`}
          >
            <span
              style={{ color: "var(--text-primary)" }}
              className="flex-1 text-sm font-medium"
            >
              {t.message}
            </span>
            <button
              style={{ color: "var(--text-tertiary)" }}
              className="w-6 h-6 flex items-center justify-center rounded text-xl hover:bg-[var(--bg-hover)] transition-colors"
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
        className="fixed top-4 left-4 w-10 h-10 flex items-center justify-center border rounded-lg z-[1000] shadow-theme-md hover:scale-105 hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Left Side */}
      <div
        className="hidden lg:flex flex-col justify-between p-10 xl:p-14 text-white relative overflow-hidden flex-[1] min-w-0"
        style={{
          background:
            "linear-gradient(135deg, var(--gradient-start, #1e40af) 0%, var(--gradient-end, #7c3aed) 100%)",
        }}
      >
        <div
          className="absolute top-[-20%] right-[-20%] w-96 h-96 rounded-full opacity-20 animate-float pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-64 h-64 rounded-full opacity-10 animate-float pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
            animationDelay: "1.5s",
          }}
        />

        <div className="relative z-10">
          <div className="w-14 h-14 mb-6">
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
            </svg>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black mb-3 tracking-tight">
            Join NoteFlow
          </h1>
          <p className="text-lg opacity-90 font-normal max-w-sm">
            Start your productivity journey today — free forever.
          </p>
        </div>

        {/* Benefits */}
        <div className="flex flex-col gap-3 relative z-10">
          {[
            {
              icon: <Sparkles size={20} />,
              title: "AI-Powered Notes",
              desc: "Ask questions about your notes with our built-in AI assistant.",
            },
            {
              icon: <ShieldCheck size={20} />,
              title: "Secure & Private",
              desc: "Your notes are encrypted and never shared with anyone.",
            },
            {
              icon: <CheckCircle2 size={20} />,
              title: "Anywhere Access",
              desc: "Access your notes from any device, anytime, anywhere.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <div className="text-sm font-bold mb-0.5">{item.title}</div>
                <div className="text-xs opacity-80 leading-relaxed">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm opacity-80">
          <ShieldCheck size={16} />
          <span>Free forever. No credit card required.</span>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div
        style={{ background: "var(--bg-primary)" }}
        className="flex flex-col justify-center px-5 py-10 sm:px-10 md:px-14 flex-[1] overflow-y-auto"
      >
        <div className="max-w-[440px] w-full mx-auto">
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

          <div className="mb-7">
            <h2
              style={{ color: "var(--text-primary)" }}
              className="text-3xl font-black mb-2 tracking-tight"
            >
              Create your account
            </h2>
            <p
              style={{ color: "var(--text-tertiary)" }}
              className="text-[0.9375rem]"
            >
              Start for free, no credit card required
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            <InputField
              id="name"
              name="name"
              label="Full Name"
              type="text"
              icon={User}
              placeholder="John Doe"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              error={registerErrors.name}
              disabled={registerLoading}
              autoComplete="name"
            />

            <InputField
              id="reg-email"
              name="email"
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              error={registerErrors.email}
              disabled={registerLoading}
              autoComplete="email"
              inputMode="email"
            />

            <div>
              <InputField
                id="reg-password"
                name="password"
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                error={registerErrors.password}
                disabled={registerLoading}
                showToggle
                onToggle={() => setShowRegisterPassword(!showRegisterPassword)}
                showPw={showRegisterPassword}
                autoComplete="new-password"
              />
              <PasswordStrength password={registerPassword} />
            </div>

            <InputField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={registerConfirmPassword}
              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
              error={registerErrors.confirmPassword}
              disabled={registerLoading}
              showToggle
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              showPw={showConfirmPassword}
              autoComplete="new-password"
            />

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 cursor-pointer rounded accent-[var(--accent-primary)] shrink-0"
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    style={{ color: "var(--accent-primary)" }}
                    className="font-semibold no-underline hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    style={{ color: "var(--accent-primary)" }}
                    className="font-semibold no-underline hover:underline"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
              {registerErrors.terms && (
                <span
                  style={{ color: "var(--error)" }}
                  className="text-xs font-medium block mt-1"
                >
                  {registerErrors.terms}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                background:
                  "linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed))",
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-white text-[0.9375rem] font-bold cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(59,130,246,0.3)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              disabled={registerLoading}
            >
              {registerLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <span
                style={{ color: "var(--text-tertiary)" }}
                className="text-sm"
              >
                Already have an account?{" "}
              </span>
              <Link
                to="/"
                style={{ color: "var(--accent-primary)" }}
                className="text-sm font-bold no-underline hover:underline transition-colors"
              >
                Sign In
              </Link>
            </div>
          </form>

          <div className="mt-6">
            <div
              style={{
                background: "var(--accent-bg, rgba(59,130,246,0.05))",
                borderColor: "var(--border-color)",
                color: "var(--text-secondary)",
              }}
              className="flex items-center gap-2 px-4 py-3 border rounded-xl text-xs font-medium justify-center"
            >
              <ShieldCheck
                size={14}
                style={{ color: "var(--success, #10b981)", flexShrink: 0 }}
              />
              <span>Your information is secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
