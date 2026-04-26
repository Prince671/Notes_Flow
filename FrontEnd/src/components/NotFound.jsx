import { useState, useEffect } from "react";
import { Home, ArrowLeft, Search, Compass } from "lucide-react";

const injectStyles = () => {
  if (document.getElementById("notfound-styles")) return;
  const style = document.createElement("style");
  style.id = "notfound-styles";
  style.textContent = `
    @keyframes floatUp {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-18px) rotate(1deg); }
      66% { transform: translateY(-8px) rotate(-1deg); }
    }
    @keyframes orbitRing {
      from { transform: rotateX(70deg) rotateZ(0deg); }
      to   { transform: rotateX(70deg) rotateZ(360deg); }
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.04); }
    }
    @keyframes twinkle {
      0%, 100% { opacity: 0.2; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes riseParticle {
      0% { opacity: 0; transform: translateY(0) scale(0); }
      10% { opacity: 1; transform: translateY(-20px) scale(1); }
      90% { opacity: 0.6; }
      100% { opacity: 0; transform: translateY(-80vh) scale(0.5); }
    }
    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(30px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeScaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes spinSlow {
      to { transform: rotate(360deg); }
    }
    @keyframes dashFloat {
      0%, 100% { stroke-dashoffset: 0; }
      50% { stroke-dashoffset: 20; }
    }
    .nf-float   { animation: floatUp 6s ease-in-out infinite; }
    .nf-float-d { animation: floatUp 6s ease-in-out infinite; animation-delay: 0.8s; }
    .nf-pulse   { animation: pulseGlow 3s ease-in-out infinite; }
    .nf-twinkle { animation: twinkle var(--dur, 3s) ease-in-out infinite; animation-delay: var(--delay, 0s); }
    .nf-rise    { animation: riseParticle var(--dur, 12s) ease-in infinite; animation-delay: var(--delay, 0s); }
    .nf-spin    { animation: spinSlow 20s linear infinite; }
    .nf-slide-d1 { animation: slideInUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
    .nf-slide-d2 { animation: slideInUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
    .nf-slide-d3 { animation: slideInUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.4s both; }
    .nf-slide-d4 { animation: slideInUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
    .nf-fade-in  { animation: fadeScaleIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
    .nf-btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 28px; border-radius: 14px; border: none;
      font-size: 0.9375rem; font-weight: 700; color: #fff; cursor: pointer;
      background: linear-gradient(135deg, var(--gradient-start, #1e40af), var(--gradient-end, #7c3aed));
      box-shadow: 0 8px 24px rgba(99,102,241,0.35);
      transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
      font-family: inherit;
    }
    .nf-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(99,102,241,0.5); }
    .nf-btn-primary:active { transform: translateY(0); }
    .nf-btn-secondary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 13px 28px; border-radius: 14px;
      font-size: 0.9375rem; font-weight: 700; cursor: pointer;
      background: var(--bg-tertiary); color: var(--text-primary);
      border: 2px solid var(--border-color);
      transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
      font-family: inherit;
    }
    .nf-btn-secondary:hover {
      transform: translateY(-2px);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      background: var(--accent-light);
    }
    .nf-btn-secondary:active { transform: translateY(0); }
    @media (max-width: 640px) {
      .nf-hero-num { font-size: 100px !important; }
      .nf-planet   { width: 100px !important; height: 100px !important; }
      .nf-astronaut { width: 80px !important; height: 96px !important; top: 5% !important; right: 2% !important; }
      .nf-btn-row { flex-direction: column !important; }
      .nf-btn-primary, .nf-btn-secondary { width: 100%; justify-content: center; }
    }
  `;
  document.head.appendChild(style);
};

const NotFound = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState([]);
  const [particles, setParticles] = useState([]);
  const [darkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("notes-theme") || "false");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    injectStyles();
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );

    setStars(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2.5 + 0.5,
        dur: (Math.random() * 3 + 2).toFixed(1),
        delay: (Math.random() * 3).toFixed(1),
      })),
    );
    setParticles(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        dur: (Math.random() * 8 + 10).toFixed(1),
        delay: (Math.random() * 6).toFixed(1),
      })),
    );

    const onMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 16 - 8,
        y: (e.clientY / window.innerHeight) * 16 - 8,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* ── background: dark space or soft light ── */
  const bg = darkMode
    ? "linear-gradient(135deg, #06080f 0%, #0d1220 50%, #0b0f1a 100%)"
    : "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)";

  return (
    <div
      className="nf-fade-in"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        background: bg,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Stars ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {stars.map((s) => (
          <div
            key={s.id}
            className="nf-twinkle"
            style={{
              position: "absolute",
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: "50%",
              background: "#fff",
              "--dur": `${s.dur}s`,
              "--delay": `${s.delay}s`,
              boxShadow: "0 0 6px rgba(255,255,255,0.8)",
            }}
          />
        ))}
      </div>

      {/* ── Ambient glow blobs ── */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Main content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          maxWidth: 860,
          width: "100%",
        }}
      >
        {/* ── 404 hero ── */}
        <div
          className="nf-slide-d1"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            marginBottom: 40,
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
            transition: "transform 0.1s ease",
          }}
        >
          {/* "4" */}
          <span
            className="nf-hero-num nf-float"
            style={{
              fontSize: 160,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1,
              textShadow:
                "0 0 40px rgba(99,102,241,0.9), 0 0 80px rgba(139,92,246,0.5)",
              letterSpacing: "-6px",
              userSelect: "none",
            }}
          >
            4
          </span>

          {/* Planet "0" */}
          <div
            className="nf-planet nf-float-d nf-pulse"
            style={{ width: 160, height: 160, flexShrink: 0 }}
          >
            <svg
              viewBox="0 0 200 200"
              style={{ width: "100%", height: "100%" }}
            >
              <defs>
                <radialGradient id="pg" cx="35%" cy="35%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#3730a3" />
                </radialGradient>
                <radialGradient id="pgGlow" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="rgba(99,102,241,0.6)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <filter id="planetGlow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* glow halo */}
              <circle
                cx="100"
                cy="100"
                r="95"
                fill="url(#pgGlow)"
                opacity="0.5"
              />
              {/* planet body */}
              <circle
                cx="100"
                cy="100"
                r="72"
                fill="url(#pg)"
                filter="url(#planetGlow)"
              />
              {/* surface detail */}
              <circle cx="72" cy="78" r="14" fill="white" opacity="0.12" />
              <circle cx="130" cy="115" r="9" fill="white" opacity="0.08" />
              <circle cx="88" cy="128" r="18" fill="white" opacity="0.07" />
              {/* ring */}
              <ellipse
                cx="100"
                cy="100"
                rx="115"
                ry="28"
                fill="none"
                stroke="rgba(167,139,250,0.6)"
                strokeWidth="5"
              />
              <ellipse
                cx="100"
                cy="100"
                rx="115"
                ry="28"
                fill="none"
                stroke="rgba(99,102,241,0.3)"
                strokeWidth="10"
              />
            </svg>
          </div>

          {/* second "4" */}
          <span
            className="nf-hero-num nf-float"
            style={{
              fontSize: 160,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1,
              textShadow:
                "0 0 40px rgba(99,102,241,0.9), 0 0 80px rgba(139,92,246,0.5)",
              letterSpacing: "-6px",
              animationDelay: "1.2s",
              userSelect: "none",
            }}
          >
            4
          </span>
        </div>

        {/* ── Floating astronaut ── */}
        <div
          className="nf-float nf-astronaut"
          style={{
            position: "absolute",
            top: "12%",
            right: "8%",
            width: 120,
            height: 144,
            animationDelay: "0.5s",
          }}
        >
          <svg
            viewBox="0 0 200 250"
            style={{
              width: "100%",
              height: "100%",
              filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.4))",
            }}
          >
            {/* helmet */}
            <ellipse
              cx="100"
              cy="78"
              rx="48"
              ry="52"
              fill="#e0e7ff"
              opacity="0.95"
            />
            {/* visor */}
            <ellipse
              cx="100"
              cy="72"
              rx="38"
              ry="32"
              fill="#3730a3"
              opacity="0.85"
            />
            <ellipse
              cx="100"
              cy="70"
              rx="32"
              ry="26"
              fill="#4338ca"
              opacity="0.7"
            />
            {/* visor glint */}
            <ellipse
              cx="86"
              cy="60"
              rx="8"
              ry="5"
              fill="white"
              opacity="0.35"
              transform="rotate(-20 86 60)"
            />
            {/* body */}
            <rect
              x="68"
              y="118"
              width="64"
              height="82"
              rx="12"
              fill="#f3f4f6"
            />
            {/* chest plate */}
            <rect x="74" y="124" width="52" height="32" rx="6" fill="#6366f1" />
            <rect
              x="80"
              y="130"
              width="16"
              height="10"
              rx="3"
              fill="rgba(255,255,255,0.3)"
            />
            <circle cx="110" cy="135" r="5" fill="rgba(255,255,255,0.4)" />
            {/* arms */}
            <rect
              x="36"
              y="128"
              width="34"
              height="16"
              rx="8"
              fill="#f3f4f6"
              transform="rotate(-25 53 136)"
            />
            <rect
              x="130"
              y="128"
              width="34"
              height="16"
              rx="8"
              fill="#f3f4f6"
              transform="rotate(25 147 136)"
            />
            {/* legs */}
            <rect
              x="74"
              y="198"
              width="20"
              height="42"
              rx="10"
              fill="#f3f4f6"
            />
            <rect
              x="106"
              y="198"
              width="20"
              height="42"
              rx="10"
              fill="#f3f4f6"
            />
            {/* backpack */}
            <rect
              x="148"
              y="120"
              width="22"
              height="36"
              rx="6"
              fill="#e0e7ff"
            />
            <circle cx="100" cy="158" r="9" fill="#6366f1" />
            <line
              x1="94"
              y1="158"
              x2="82"
              y2="158"
              stroke="#818cf8"
              strokeWidth="2"
            />
            <line
              x1="106"
              y1="158"
              x2="118"
              y2="158"
              stroke="#818cf8"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* ── Orbit decoration ── */}
        <div
          className="nf-spin"
          style={{
            position: "absolute",
            top: "20%",
            left: "5%",
            width: 80,
            height: 80,
            opacity: 0.3,
          }}
        >
          <svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="rgba(167,139,250,0.6)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            <circle cx="40" cy="5" r="5" fill="#818cf8" />
          </svg>
        </div>

        {/* ── Text content ── */}
        <div className="nf-slide-d2" style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 999,
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.35)",
              marginBottom: 18,
            }}
          >
            <Compass size={14} color="#a78bfa" />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#a78bfa",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              Error 404
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 14px",
              letterSpacing: "-1px",
              textShadow: "0 2px 20px rgba(99,102,241,0.4)",
            }}
          >
            Page Lost in Space
          </h1>
          <p
            style={{
              fontSize: "1.0625rem",
              color: "rgba(224,231,255,0.85)",
              marginBottom: 8,
              lineHeight: 1.7,
            }}
          >
            Houston, we have a problem! The page you're looking for has drifted
            off into deep space.
          </p>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "rgba(199,210,254,0.65)",
              lineHeight: 1.6,
            }}
          >
            It may have been moved, deleted, or never existed in this universe.
          </p>
        </div>

        {/* ── Search suggestion ── */}
        <div
          className="nf-slide-d3"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 20px",
            borderRadius: 14,
            marginBottom: 32,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Search size={15} color="rgba(199,210,254,0.7)" />
          <span
            style={{
              fontSize: 13,
              color: "rgba(199,210,254,0.7)",
              fontStyle: "italic",
            }}
          >
            Try searching for what you need from the home page
          </span>
        </div>

        {/* ── Buttons ── */}
        <div
          className="nf-slide-d3 nf-btn-row"
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          <button
            className="nf-btn-primary"
            onClick={() => (window.location.href = "/")}
          >
            <Home size={18} />
            Return Home
          </button>
          <button
            className="nf-btn-secondary"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* ── Error code footer ── */}
        <div
          className="nf-slide-d4"
          style={{
            fontSize: 11,
            color: "rgba(165,180,252,0.5)",
            fontFamily: "monospace",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
          }}
        >
          STATUS_CODE · 404 · PAGE_NOT_FOUND · NOTEFLOW
        </div>
      </div>

      {/* ── Rising particles ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className="nf-rise"
            style={{
              position: "absolute",
              left: `${p.left}%`,
              bottom: -10,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "rgba(167,139,250,0.7)",
              boxShadow: "0 0 8px rgba(167,139,250,0.9)",
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NotFound;
