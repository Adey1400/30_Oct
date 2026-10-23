import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoseFull, RoseBud, FlowerDivider } from "../components/RoseSVG";
import TypewriterText from "../components/TypewriterText";

// ── Colour palette (matches existing site) ────────────────────
const C = {
  ivory:      "#F7F0E4",
  parchment:  "#E8D7BD",
  burgundy:   "#51191F",
  red:        "#7B2027",
  brown:      "#B49A7C",
  sepia:      "#49362C",
  ocean:      "#6B93A8",
  land:       "#C8B882",
  landDark:   "#A89660",
  border:     "#8B7355",
};

// ── Discovery data ─────────────────────────────────────────────
const DISCOVERIES = [
  {
    id: 0,
    title: "The Land of Memories",
    lat: 28,
    lon: -30,
    message:
      "Some places exist on maps. Others exist in the little corners of our hearts.",
  },
  {
    id: 1,
    title: "The Land of Dreams",
    lat: -20,
    lon: 115,
    message:
      "May you discover beautiful places, experience wonderful things, and collect memories that make you smile for years to come.",
  },
  {
    id: 2,
    title: "The Land of Possibilities",
    lat: 55,
    lon: 75,
    message:
      "The world is bigger than we can imagine. I hope your journey through it brings you beautiful experiences, unexpected happiness, and countless reasons to smile.",
  },
];

// ── Globe geometry helpers ─────────────────────────────────────

function project(lat, lon, rotY, rotX, cx, cy, r) {
  const phi = (lat * Math.PI) / 180;
  const lam = (lon * Math.PI) / 180;
  const rY = (rotY * Math.PI) / 180;
  const rX = (rotX * Math.PI) / 180;

  let x0 = Math.cos(phi) * Math.cos(lam);
  let y0 = Math.sin(phi);
  let z0 = Math.cos(phi) * Math.sin(lam);

  // Rotate around Y axis (spin)
  const x1 = x0 * Math.cos(rY) + z0 * Math.sin(rY);
  const z1 = -x0 * Math.sin(rY) + z0 * Math.cos(rY);

  // Rotate around X axis (tilt)
  const y2 = y0 * Math.cos(rX) - z1 * Math.sin(rX);
  const z2 = y0 * Math.sin(rX) + z1 * Math.cos(rX);

  const visible = x1 > -0.05;
  return { x: cx + x1 * r, y: cy - y2 * r, z: z2, visible };
}

// Simplified continent polygons [lat, lon]
const CONTINENTS = [
  // North America
  [[72,-140],[70,-95],[68,-77],[60,-65],[47,-53],[44,-66],[41,-70],[25,-80],[21,-87],[10,-83],[8,-77],[9,-79],[19,-90],[23,-106],[23,-110],[30,-115],[32,-117],[37,-122],[48,-124],[55,-132],[60,-142],[65,-168],[68,-166],[72,-160],[72,-140]],
  // Greenland
  [[76,-65],[83,-35],[83,-22],[76,-18],[70,-22],[65,-38],[63,-52],[68,-55],[76,-65]],
  // South America
  [[12,-72],[10,-62],[8,-60],[5,-52],[0,-50],[-5,-35],[-10,-37],[-15,-39],[-23,-43],[-33,-53],[-42,-65],[-55,-68],[-56,-68],[-55,-70],[-42,-73],[-30,-71],[-18,-70],[-5,-81],[0,-80],[10,-75],[12,-72]],
  // Europe
  [[71,28],[70,20],[59,10],[48,2],[44,-1],[37,-9],[36,-6],[36,5],[38,16],[40,18],[45,14],[47,9],[54,8],[58,5],[58,11],[65,14],[71,28]],
  // Africa
  [[37,10],[33,12],[30,32],[12,44],[2,42],[-4,40],[-12,40],[-26,33],[-35,18],[-34,26],[-20,35],[-12,37],[-10,40],[0,42],[10,44],[20,38],[30,32],[32,22],[36,10],[37,10]],
  // Asia
  [[72,60],[60,30],[55,37],[43,41],[40,50],[36,60],[25,57],[12,45],[13,43],[22,60],[10,78],[6,80],[10,104],[22,120],[38,122],[42,131],[52,142],[64,170],[72,170],[73,140],[72,100],[60,100],[60,60],[72,60]],
  // Australia
  [[-14,126],[-14,136],[-17,140],[-25,152],[-38,145],[-38,140],[-35,136],[-32,130],[-22,114],[-14,126]],
  // Antarctica
  [[-70,0],[-68,45],[-70,90],[-68,135],[-70,180],[-68,-135],[-70,-90],[-68,-45],[-70,0]],
];

// ── Canvas Globe ───────────────────────────────────────────────
function GlobeCanvas({ size, rotY, rotX, discoveries, completedIds, activeMarkerId }) {
  const canvasRef = useRef(null);
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.44;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);

    // Clip to sphere
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Ocean
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r);
    grad.addColorStop(0,   "#7AAFC0");
    grad.addColorStop(0.6, "#6B93A8");
    grad.addColorStop(1,   "#3D6070");
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 0.5;
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (lat * Math.PI) / 180;
      const rX2 = (rotX * Math.PI) / 180;
      const yr = cy - Math.sin(phi) * r;
      const rxE = Math.cos(phi) * r;
      const ryE = Math.cos(phi) * r * Math.abs(Math.cos(rX2));
      if (rxE > 1) {
        ctx.beginPath();
        ctx.ellipse(cx, yr, rxE, ryE, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Continents
    for (const poly of CONTINENTS) {
      ctx.beginPath();
      let first = true;
      for (const [lat, lon] of poly) {
        const p = project(lat, lon, rotY, rotX, cx, cy, r);
        if (!p.visible) { first = true; continue; }
        if (first) { ctx.moveTo(p.x, p.y); first = false; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fillStyle = "#C8B882";
      ctx.fill();
      ctx.strokeStyle = "#8B7355";
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // Sheen
    const sheenGrad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx - r * 0.35, cy - r * 0.35, r * 0.65);
    sheenGrad.addColorStop(0,   "rgba(255,255,255,0.2)");
    sheenGrad.addColorStop(0.6, "rgba(255,255,255,0.04)");
    sheenGrad.addColorStop(1,   "rgba(255,255,255,0)");
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    ctx.restore();

    // Rim glow (outside clip)
    const rimGrad = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r + 1);
    rimGrad.addColorStop(0,   "rgba(81,25,31,0)");
    rimGrad.addColorStop(0.8, "rgba(81,25,31,0.12)");
    rimGrad.addColorStop(1,   "rgba(81,25,31,0.4)");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // Border
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(180,154,124,0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Markers
    for (const d of discoveries) {
      const p = project(d.lat, d.lon, rotY, rotX, cx, cy, r);
      if (!p.visible) continue;

      const isActive    = activeMarkerId === d.id;
      const isCompleted = completedIds.has(d.id);
      const pinColor    = isActive ? "#C44050" : "#7B2027";

      // Pulse halo
      ctx.beginPath();
      ctx.arc(p.x, p.y - 5, isActive ? 14 : 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(123,32,39,${isActive ? 0.3 : 0.18})`;
      ctx.fill();

      // Pin head
      ctx.beginPath();
      ctx.arc(p.x, p.y - 5, 6, 0, Math.PI * 2);
      ctx.fillStyle = pinColor;
      ctx.fill();
      ctx.strokeStyle = "#F7F0E4";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Pin tail
      ctx.beginPath();
      ctx.moveTo(p.x - 3.5, p.y - 1);
      ctx.lineTo(p.x, p.y + 7);
      ctx.lineTo(p.x + 3.5, p.y - 1);
      ctx.fillStyle = pinColor;
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(p.x, p.y - 5, 2, 0, Math.PI * 2);
      ctx.fillStyle = isCompleted ? "#F7F0E4" : "rgba(255,255,255,0.7)";
      ctx.fill();
    }
  }, [size, rotY, rotX, discoveries, completedIds, activeMarkerId, cx, cy, r]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: "block" }}
      aria-label="Interactive antique globe"
    />
  );
}

// ── Parchment card ─────────────────────────────────────────────
function DiscoveryCard({ discovery, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="paper-grain"
      style={{
        background: "#E8D7BD",
        border: "1px solid rgba(180,154,124,0.5)",
        borderRadius: "2px",
        boxShadow: "0 12px 48px rgba(81,25,31,0.22), inset 0 0 40px rgba(180,154,124,0.12)",
        padding: "28px 24px 24px",
        position: "relative",
        width: "100%",
        maxWidth: "340px",
        margin: "0 auto",
      }}
    >
      <div className="text-center mb-3" aria-hidden="true">
        <span style={{ color: "#7B2027", fontSize: "10px", letterSpacing: "0.3em", opacity: 0.6 }}>✦ ✦ ✦</span>
      </div>
      <div className="flex justify-center mb-3">
        <RoseBud size={32} />
      </div>
      <h3 className="text-center mb-3" style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "1.1rem", fontStyle: "italic",
        color: "#51191F", fontWeight: 600,
      }}>
        {discovery.title}
      </h3>
      <div className="flex items-center gap-2 mb-4" aria-hidden="true">
        <div className="h-px flex-1" style={{ background: "#B49A7C", opacity: 0.4 }} />
        <span style={{ color: "#7B2027", fontSize: "8px" }}>✦</span>
        <div className="h-px flex-1" style={{ background: "#B49A7C", opacity: 0.4 }} />
      </div>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.7 }}
        className="text-center"
        style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: "1rem", lineHeight: 1.8,
          color: "#49362C", fontStyle: "italic",
        }}
      >
        {discovery.message}
      </motion.p>
      <div className="text-center mt-4 mb-4" aria-hidden="true">
        <span style={{ color: "#7B2027", fontSize: "10px", letterSpacing: "0.3em", opacity: 0.6 }}>✦ ✦ ✦</span>
      </div>
      <div className="flex justify-center">
        <button
          onClick={onClose}
          style={{
            background: "transparent", border: "1px solid #7B2027",
            borderRadius: "1px", padding: "6px 20px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "0.85rem", color: "#51191F",
            letterSpacing: "0.05em", cursor: "pointer",
          }}
          aria-label="Close discovery card"
        >
          close ✕
        </button>
      </div>
    </motion.div>
  );
}

// ── Rose progress icon ─────────────────────────────────────────
function RoseIcon({ filled }) {
  return (
    <svg viewBox="0 0 32 32" width={22} height={22} aria-hidden="true">
      {filled ? (
        <>
          <ellipse cx="16" cy="14" rx="9" ry="11" fill="#7B2027" opacity="0.9" />
          <ellipse cx="16" cy="14" rx="9" ry="11" fill="#7B2027" opacity="0.7" transform="rotate(40,16,14)" />
          <ellipse cx="16" cy="13" rx="7" ry="9" fill="#51191F" opacity="0.95" />
          <circle  cx="16" cy="11" r="4" fill="#3D1015" />
          <ellipse cx="15" cy="10" rx="2" ry="2.5" fill="#C44050" opacity="0.45" />
          <path d="M16 25 Q15 20 14 15" stroke="#5C7A3E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M15 19 Q10 17 9 13 Q14 14 15 19Z" fill="#6A8A4A" opacity="0.8" />
        </>
      ) : (
        <>
          <ellipse cx="16" cy="14" rx="9" ry="11" fill="none" stroke="#B49A7C" strokeWidth="1.2" opacity="0.6" />
          <ellipse cx="16" cy="13" rx="7" ry="9" fill="none" stroke="#B49A7C" strokeWidth="0.8" opacity="0.4" />
          <circle  cx="16" cy="11" r="3" fill="none" stroke="#B49A7C" strokeWidth="0.8" opacity="0.4" />
          <path d="M16 25 Q15 20 14 15" stroke="#5C7A3E" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d="M15 19 Q10 17 9 13 Q14 14 15 19Z" fill="#6A8A4A" opacity="0.4" />
        </>
      )}
    </svg>
  );
}

// ── Final surprise ─────────────────────────────────────────────
function FinalSurprise({ onResetView }) {
  const [startTw, setStartTw] = useState(false);
  const [twDone, setTwDone]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStartTw(true), 700);
    return () => clearTimeout(t);
  }, []);

  const finalText =
    "Wherever this beautiful world takes you, I hope happiness finds its way to you.\n\n" +
    "May this new chapter bring you wonderful adventures, beautiful memories, and everything your heart wishes for.\n\n" +
    "Happy Birthday. \u2661";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="paper-grain"
      style={{
        background: "#E8D7BD",
        border: "1px solid rgba(180,154,124,0.4)",
        borderRadius: "2px",
        boxShadow: "0 16px 60px rgba(81,25,31,0.2), inset 0 0 50px rgba(180,154,124,0.1)",
        padding: "32px 24px 28px",
        width: "100%", maxWidth: "340px",
        margin: "0 auto", position: "relative",
      }}
    >
      <div style={{
        position: "absolute", inset: 8,
        border: "0.5px solid rgba(81,25,31,0.15)",
        borderRadius: "1px", pointerEvents: "none",
      }} aria-hidden="true" />

      <p className="text-center mb-4" style={{
        fontFamily: "'Dancing Script', cursive",
        color: "#B49A7C", fontSize: "0.85rem", letterSpacing: "0.08em",
      }}>
        — a final note —
      </p>

      <motion.div
        className="flex justify-center mb-6"
        animate={{ rotate: [0, 3, -3, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      >
        <RoseFull size={88} />
      </motion.div>

      <div className="mb-6" style={{ minHeight: "120px" }}>
        {startTw && (
          <TypewriterText
            text={finalText}
            speed={28}
            onComplete={() => setTwDone(true)}
            className="text-center"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1rem", lineHeight: 1.85,
              color: "#49362C", fontStyle: "italic",
            }}
          />
        )}
      </div>

      <div className="flex items-center gap-2 mb-5" aria-hidden="true">
        <div className="h-px flex-1" style={{ background: "#B49A7C", opacity: 0.4 }} />
        <span style={{ color: "#7B2027", fontSize: "8px" }}>✦</span>
        <div className="h-px flex-1" style={{ background: "#B49A7C", opacity: 0.4 }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={twDone ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="flex justify-center"
      >
        <button
          onClick={onResetView}
          style={{
            background: "transparent", border: "1.5px solid #7B2027",
            borderRadius: "1px", padding: "8px 22px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "0.9rem", color: "#51191F",
            letterSpacing: "0.05em", cursor: "pointer",
          }}
          aria-label="Explore the globe again"
        >
          Explore the globe again \u21BA
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main GlobeScreen ───────────────────────────────────────────
export default function GlobeScreen() {
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(-15);

  const dragRef   = useRef({ active: false, lastX: 0, lastY: 0 });
  const velRef    = useRef({ vx: 0, vy: 0 });
  const rafRef    = useRef(null);
  const idleRef   = useRef(null);
  const isIdleRef = useRef(true);

  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [completedIds, setCompletedIds]     = useState(new Set());
  const [showFinal, setShowFinal]           = useState(false);
  const [finalTriggered, setFinalTriggered] = useState(false);

  const [globeSize, setGlobeSize] = useState(300);
  const containerRef = useRef(null);

  // Measure container width
  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      setGlobeSize(Math.min(Math.max(w - 32, 240), 340));
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Idle auto-rotation
  const startIdle = useCallback(() => {
    if (rafRef.current) return;
    isIdleRef.current = true;
    const step = () => {
      if (!isIdleRef.current) return;
      setRotY((y) => (y + 0.18) % 360);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const stopIdle = useCallback(() => {
    isIdleRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (idleRef.current) { clearTimeout(idleRef.current); idleRef.current = null; }
  }, []);

  const scheduleIdle = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(startIdle, 2000);
  }, [startIdle]);

  useEffect(() => { startIdle(); return () => stopIdle(); }, [startIdle, stopIdle]);

  // Inertia
  const startInertia = useCallback(() => {
    const step = () => {
      const { vx, vy } = velRef.current;
      if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) { scheduleIdle(); return; }
      setRotY((y) => y + vx);
      setRotX((x) => Math.max(-40, Math.min(40, x + vy)));
      velRef.current.vx *= 0.94;
      velRef.current.vy *= 0.94;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [scheduleIdle]);

  // Pointer handlers
  const onPointerDown = useCallback((e) => {
    stopIdle();
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    velRef.current  = { vx: 0, vy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [stopIdle]);

  const onPointerMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    const s = 0.4;
    const dY = dx * s, dX = dy * s;
    setRotY((y) => y + dY);
    setRotX((x) => Math.max(-40, Math.min(40, x + dX)));
    velRef.current = { vx: dY * 0.6, vy: dX * 0.6 };
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    startInertia();
  }, [startInertia]);

  // Prevent page scroll during touch drag
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e) => { if (dragRef.current.active) e.preventDefault(); };
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => el.removeEventListener("touchmove", prevent);
  }, []);

  // Marker hit detection
  const cx = globeSize / 2, cy = globeSize / 2, r = globeSize * 0.44;

  const handleGlobeClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    let hit = null;
    for (const d of DISCOVERIES) {
      const p = project(d.lat, d.lon, rotY, rotX, cx, cy, r);
      if (!p.visible) continue;
      if (Math.hypot(px - p.x, py - (p.y - 5)) < 20) { hit = d; break; }
    }
    if (hit) {
      setActiveMarkerId(hit.id);
      setCompletedIds((prev) => { const n = new Set(prev); n.add(hit.id); return n; });
    } else {
      setActiveMarkerId(null);
    }
  }, [rotY, rotX, cx, cy, r]);

  // Final reveal
  useEffect(() => {
    if (completedIds.size === 3 && !finalTriggered) {
      setFinalTriggered(true);
      setTimeout(() => setShowFinal(true), 700);
    }
  }, [completedIds, finalTriggered]);

  const activeDiscovery = useMemo(
    () => DISCOVERIES.find((d) => d.id === activeMarkerId),
    [activeMarkerId]
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9 }}
      className="relative w-full py-14 px-4 paper-grain"
      style={{ background: "#F7F0E4", minHeight: "100vh" }}
    >
      {/* Subtle petals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[{ left: "10%", dur: 20, delay: 0 }, { left: "80%", dur: 25, delay: 9 }].map((p, i) => (
          <svg key={i} viewBox="0 0 30 40" style={{
            position: "absolute", left: p.left, top: "-50px",
            width: 13, height: 18,
            animation: `floatDown ${p.dur}s ${p.delay}s linear infinite`,
          }} aria-hidden="true">
            <ellipse cx="15" cy="20" rx="12" ry="18" fill="#C58D8B" opacity="0.45" />
          </svg>
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center mb-2 px-4"
      >
        <p style={{ fontFamily: "'Dancing Script', cursive", color: "#B49A7C", fontSize: "0.85rem", letterSpacing: "0.1em" }}>
          — an atlas, just for you —
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(1.45rem, 6vw, 1.85rem)",
          fontStyle: "italic", color: "#49362C",
          fontWeight: 600, marginTop: "6px", lineHeight: 1.3,
        }}>
          A Little World, Just for You
        </h2>
        <p className="mt-3 mx-auto" style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: "0.95rem", color: "#B49A7C",
          lineHeight: 1.7, maxWidth: "290px", fontStyle: "italic",
        }}>
          A little journey, a few hidden words, and something special waiting to be discovered.
        </p>
      </motion.div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-2 max-w-xs mx-auto my-5" aria-hidden="true">
        <div className="h-px flex-1" style={{ background: "#B49A7C", opacity: 0.35 }} />
        <RoseBud size={22} />
        <div className="h-px flex-1" style={{ background: "#B49A7C", opacity: 0.35 }} />
      </div>

      {/* Globe container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.45 }}
        className="flex flex-col items-center"
      >
        <div ref={containerRef} style={{ width: "100%", maxWidth: "380px", display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* Globe with stand */}
          <div style={{ position: "relative", display: "inline-block" }}>
            {/* Decorative ring */}
            <div style={{ position: "absolute", inset: -9, borderRadius: "50%", border: "1.5px solid rgba(180,154,124,0.28)", pointerEvents: "none" }} aria-hidden="true" />
            <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: "0.5px solid rgba(180,154,124,0.12)", pointerEvents: "none" }} aria-hidden="true" />

            {/* Draggable globe */}
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onClick={handleGlobeClick}
              style={{
                cursor: "grab", touchAction: "none", userSelect: "none",
                borderRadius: "50%",
                boxShadow: "0 8px 40px rgba(81,25,31,0.18), 0 2px 8px rgba(0,0,0,0.12)",
              }}
              role="button"
              tabIndex={0}
              aria-label="Interactive globe — tap the red pins to discover messages"
              onKeyDown={(e) => { if (e.key === "ArrowRight") setRotY((y) => y + 12); if (e.key === "ArrowLeft") setRotY((y) => y - 12); }}
            >
              <GlobeCanvas
                size={globeSize}
                rotY={rotY}
                rotX={rotX}
                discoveries={DISCOVERIES}
                completedIds={completedIds}
                activeMarkerId={activeMarkerId}
              />
            </div>

            {/* Brass stand */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2px" }}>
              <div style={{ width: 4, height: 22, background: "linear-gradient(180deg,#C8A84B,#A0802E,#C8A84B)", borderRadius: "2px" }} aria-hidden="true" />
              <div style={{ width: globeSize * 0.5, height: 11, background: "linear-gradient(180deg,#D4AE52,#A0802E)", borderRadius: "6px 6px 4px 4px", boxShadow: "0 3px 10px rgba(0,0,0,0.18)" }} aria-hidden="true" />
              <div style={{ width: globeSize * 0.34, height: 5, background: "linear-gradient(180deg,#A0802E,#7A6020)", borderRadius: "0 0 4px 4px" }} aria-hidden="true" />
            </div>
          </div>

          {/* Instruction */}
          <p className="text-center mt-5" style={{
            fontFamily: "'Dancing Script', cursive",
            color: "#B49A7C", fontSize: "0.9rem", fontStyle: "italic", letterSpacing: "0.02em",
          }}>
            Give the globe a little spin and discover the surprises hidden within. \u2661
          </p>

          {/* Progress */}
          <div className="flex flex-col items-center mt-5 mb-1 gap-2">
            <p style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "0.88rem", color: "#49362C", opacity: 0.82,
            }}>
              Three little discoveries await you:{" "}
              <span style={{ color: "#7B2027", fontWeight: 600 }}>{completedIds.size}/3</span>
            </p>
            <div className="flex gap-3" role="img" aria-label={`${completedIds.size} of 3 discoveries made`}>
              {[0, 1, 2].map((i) => <RoseIcon key={i} filled={completedIds.has(i)} />)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Discovery card */}
      <div className="w-full px-2 mt-6">
        <AnimatePresence>
          {activeDiscovery && (
            <DiscoveryCard
              key={activeDiscovery.id}
              discovery={activeDiscovery}
              onClose={() => setActiveMarkerId(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Final surprise */}
      <AnimatePresence>
        {showFinal && (
          <div className="w-full px-2 mt-8">
            <FinalSurprise onResetView={() => { setRotY(0); setRotX(-15); startIdle(); }} />
          </div>
        )}
      </AnimatePresence>

      {/* Bottom divider */}
      <FlowerDivider className="mt-12 max-w-xs mx-auto px-4" />
    </motion.section>
  );
}
