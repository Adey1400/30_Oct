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

// ── Discovery data ─────────────────────────────────────────────
const DISCOVERIES = [
  {
    id: 0,
    title: "The Land of Memories",
    emoji: "🌸",
    lat: 28,
    lon: -30,
    message:
      "Some places exist on maps. Others exist in the little corners of our hearts.",
  },
  {
    id: 1,
    title: "The Land of Dreams",
    emoji: "✨",
    lat: -20,
    lon: 115,
    message:
      "May you discover beautiful places, experience wonderful things, and collect memories that make you smile for years to come.",
  },
  {
    id: 2,
    title: "The Land of Possibilities",
    emoji: "🌿",
    lat: 55,
    lon: 75,
    message:
      "The world is bigger than we can imagine. I hope your journey through it brings you beautiful experiences, unexpected happiness, and countless reasons to smile.",
  },
];

// ── Continent outlines ─────────────────────────────────────────
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

// ── 3-D → 2-D projection ──────────────────────────────────────
function project(lat, lon, rotY, rotX, cx, cy, r) {
  const phi = (lat * Math.PI) / 180;
  const lam = (lon * Math.PI) / 180;
  const rY  = (rotY * Math.PI) / 180;
  const rX  = (rotX * Math.PI) / 180;

  const x0 = Math.cos(phi) * Math.cos(lam);
  const y0 = Math.sin(phi);
  const z0 = Math.cos(phi) * Math.sin(lam);

  // Spin (Y)
  const x1 =  x0 * Math.cos(rY) + z0 * Math.sin(rY);
  const z1 = -x0 * Math.sin(rY) + z0 * Math.cos(rY);

  // Tilt (X)
  const y2 = y0 * Math.cos(rX) - z1 * Math.sin(rX);

  return {
    x: cx + x1 * r,
    y: cy - y2 * r,
    visible: x1 > -0.04,
  };
}

// ── Canvas globe component ─────────────────────────────────────
function GlobeCanvas({ size, rotY, rotX, completedIds, activeMarkerId, pulsePhase }) {
  const canvasRef = useRef(null);
  const cx = size / 2, cy = size / 2, r = size * 0.44;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);

    // ── Clip to sphere ──
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Ocean gradient
    const ocean = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.28, r * 0.05, cx, cy, r);
    ocean.addColorStop(0,   "#7FBCD2");
    ocean.addColorStop(0.55,"#6B93A8");
    ocean.addColorStop(1,   "#3A5F72");
    ctx.fillStyle = ocean;
    ctx.fillRect(cx - r - 1, cy - r - 1, r * 2 + 2, r * 2 + 2);

    // Latitude lines
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 0.6;
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (lat * Math.PI) / 180;
      const rX2 = (rotX * Math.PI) / 180;
      const yr  = cy - Math.sin(phi) * r;
      const rxE = Math.cos(phi) * r;
      const ryE = rxE * Math.abs(Math.cos(rX2));
      if (rxE > 2) {
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
      ctx.fillStyle = "#CAB98A";
      ctx.fill();
      ctx.strokeStyle = "#8B7040";
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    // Top-left sheen
    const sheen = ctx.createRadialGradient(cx - r * 0.33, cy - r * 0.33, 0, cx - r * 0.33, cy - r * 0.33, r * 0.68);
    sheen.addColorStop(0, "rgba(255,255,255,0.22)");
    sheen.addColorStop(0.55, "rgba(255,255,255,0.04)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(cx - r - 1, cy - r - 1, r * 2 + 2, r * 2 + 2);

    ctx.restore(); // end clip

    // Rim shadow
    const rim = ctx.createRadialGradient(cx, cy, r * 0.80, cx, cy, r + 2);
    rim.addColorStop(0, "rgba(40,10,10,0)");
    rim.addColorStop(0.75, "rgba(40,10,10,0.14)");
    rim.addColorStop(1, "rgba(40,10,10,0.45)");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = rim;
    ctx.fill();

    // Border ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(180,154,124,0.65)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── Markers ──
    for (const d of DISCOVERIES) {
      const p = project(d.lat, d.lon, rotY, rotX, cx, cy, r);
      if (!p.visible) continue;

      const isActive    = activeMarkerId === d.id;
      const isCompleted = completedIds.has(d.id);
      const pinH        = p.y;  // centre of pin head
      const pinC        = pinH - 8; // top of head

      // Animated pulse ring (uses pulsePhase 0→1)
      const pulse = 0.5 + 0.5 * Math.sin(pulsePhase * Math.PI * 2);
      const haloR = isActive ? 18 : 12 + pulse * 5;
      const haloA = isActive ? 0.35 : 0.12 + pulse * 0.08;
      ctx.beginPath();
      ctx.arc(p.x, pinC, haloR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196,64,80,${haloA})`;
      ctx.fill();

      // Second ring for active
      if (isActive) {
        ctx.beginPath();
        ctx.arc(p.x, pinC, 24, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(196,64,80,0.2)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Pin teardrop shadow
      ctx.beginPath();
      ctx.arc(p.x + 1.5, pinC + 1.5, 9, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fill();

      // Pin head gradient
      const pinGrad = ctx.createRadialGradient(p.x - 2.5, pinC - 2.5, 1, p.x, pinC, 9);
      pinGrad.addColorStop(0, isActive ? "#E85070" : "#9B2832");
      pinGrad.addColorStop(0.6, isActive ? "#C44050" : "#7B2027");
      pinGrad.addColorStop(1, isActive ? "#8B2035" : "#51191F");
      ctx.beginPath();
      ctx.arc(p.x, pinC, 9, 0, Math.PI * 2);
      ctx.fillStyle = pinGrad;
      ctx.fill();

      // Pin head border
      ctx.beginPath();
      ctx.arc(p.x, pinC, 9, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(247,240,228,0.7)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pin tail (teardrop point)
      ctx.beginPath();
      ctx.moveTo(p.x - 5, pinC + 5);
      ctx.lineTo(p.x,     pinH + 4);
      ctx.lineTo(p.x + 5, pinC + 5);
      ctx.fillStyle = isActive ? "#C44050" : "#7B2027";
      ctx.fill();

      // Inner shine dot
      ctx.beginPath();
      ctx.arc(p.x - 2.5, pinC - 2.5, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fill();

      // Completed checkmark or rose dot
      if (isCompleted) {
        ctx.beginPath();
        ctx.arc(p.x, pinC, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(247,240,228,0.9)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, pinC, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#7B2027";
        ctx.fill();
      }
    }
  }, [size, rotY, rotX, completedIds, activeMarkerId, pulsePhase, cx, cy, r]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: "block" }}
      aria-hidden="true"
    />
  );
}

// ── Full-screen modal discovery card ──────────────────────────
function DiscoveryModal({ discovery, onClose }) {
  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(49,21,14,0.65)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      {/* Card — stop propagation so clicking card doesn't dismiss */}
      <motion.div
        key="modal-card"
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="paper-grain"
        style={{
          background: "#EDE0C4",
          borderRadius: "3px",
          border: "1px solid rgba(180,154,124,0.55)",
          boxShadow:
            "0 24px 80px rgba(49,21,14,0.5), 0 4px 16px rgba(0,0,0,0.2), inset 0 0 60px rgba(180,154,124,0.08)",
          padding: "36px 28px 30px",
          width: "100%",
          maxWidth: "340px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Double border frame */}
        <div style={{ position:"absolute", inset: 10, border:"0.5px solid rgba(81,25,31,0.18)", borderRadius:"2px", pointerEvents:"none" }} aria-hidden="true" />
        <div style={{ position:"absolute", inset: 14, border:"0.5px solid rgba(81,25,31,0.08)", borderRadius:"2px", pointerEvents:"none" }} aria-hidden="true" />

        {/* Corner ornaments */}
        {[
          { top: 6, left: 6 },
          { top: 6, right: 6 },
          { bottom: 6, left: 6, transform: "scaleY(-1)" },
          { bottom: 6, right: 6, transform: "scale(-1,-1)" },
        ].map((s, i) => (
          <div key={i} style={{ position:"absolute", ...s, pointerEvents:"none", opacity:0.35 }} aria-hidden="true">
            <svg width={16} height={16} viewBox="0 0 20 20">
              <path d="M2 2 L8 2 L2 8 Z" fill="#7B2027" />
            </svg>
          </div>
        ))}

        {/* Top ornament */}
        <div className="text-center mb-3" aria-hidden="true">
          <span style={{ color:"#7B2027", fontSize:"10px", letterSpacing:"0.35em", opacity:0.55 }}>✦ ✦ ✦</span>
        </div>

        {/* Rose */}
        <motion.div
          className="flex justify-center mb-4"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: "backOut" }}
        >
          <RoseBud size={40} />
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center mb-1"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.15rem",
            fontStyle: "italic",
            color: "#51191F",
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {discovery.title}
        </motion.h3>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-2 my-4"
          aria-hidden="true"
        >
          <div className="h-px flex-1" style={{ background:"#B49A7C", opacity:0.45 }} />
          <span style={{ color:"#7B2027", fontSize:"9px" }}>✦</span>
          <div className="h-px flex-1" style={{ background:"#B49A7C", opacity:0.45 }} />
        </motion.div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.7 }}
          className="text-center"
          style={{
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: "1.05rem",
            lineHeight: 1.85,
            color: "#49362C",
            fontStyle: "italic",
          }}
        >
          {discovery.message}
        </motion.p>

        {/* Bottom ornament */}
        <div className="text-center mt-5 mb-5" aria-hidden="true">
          <span style={{ color:"#7B2027", fontSize:"10px", letterSpacing:"0.35em", opacity:0.55 }}>✦ ✦ ✦</span>
        </div>

        {/* Close button */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex justify-center"
        >
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1.5px solid #7B2027",
              borderRadius: "1px",
              padding: "8px 28px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "0.9rem",
              color: "#51191F",
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
            aria-label="Close message"
          >
            close ✕
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Rose progress icon ─────────────────────────────────────────
function RoseIcon({ filled }) {
  return (
    <svg viewBox="0 0 32 32" width={24} height={24} aria-hidden="true">
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
          <ellipse cx="16" cy="14" rx="9" ry="11" fill="none" stroke="#B49A7C" strokeWidth="1.3" opacity="0.55" />
          <ellipse cx="16" cy="13" rx="7" ry="9"  fill="none" stroke="#B49A7C" strokeWidth="0.8" opacity="0.35" />
          <circle  cx="16" cy="11" r="3"           fill="none" stroke="#B49A7C" strokeWidth="0.8" opacity="0.35" />
          <path d="M16 25 Q15 20 14 15" stroke="#5C7A3E" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.45" />
          <path d="M15 19 Q10 17 9 13 Q14 14 15 19Z" fill="#6A8A4A" opacity="0.35" />
        </>
      )}
    </svg>
  );
}

// ── Final surprise ─────────────────────────────────────────────
function FinalSurprise({ onResetView }) {
  const [startTw, setStartTw] = useState(false);
  const [twDone,  setTwDone]  = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStartTw(true), 800);
    return () => clearTimeout(t);
  }, []);

  const finalText =
    "Wherever this beautiful world takes you, I hope happiness finds its way to you.\n\n" +
    "May this new chapter bring you wonderful adventures, beautiful memories, and everything your heart wishes for.\n\n" +
    "Happy Birthday. ♡";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="paper-grain"
      style={{
        background: "#EDE0C4",
        border: "1px solid rgba(180,154,124,0.42)",
        borderRadius: "3px",
        boxShadow: "0 16px 60px rgba(81,25,31,0.2), inset 0 0 50px rgba(180,154,124,0.08)",
        padding: "36px 26px 30px",
        width: "100%", maxWidth: "340px",
        margin: "0 auto", position: "relative",
      }}
    >
      <div style={{ position:"absolute", inset:10, border:"0.5px solid rgba(81,25,31,0.14)", borderRadius:"2px", pointerEvents:"none" }} aria-hidden="true" />

      <p className="text-center mb-5" style={{
        fontFamily:"'Dancing Script', cursive",
        color:"#B49A7C", fontSize:"0.85rem", letterSpacing:"0.09em",
      }}>
        — a final note —
      </p>

      <motion.div
        className="flex justify-center mb-6"
        animate={{ rotate: [0, 3, -3, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      >
        <RoseFull size={92} />
      </motion.div>

      <div className="mb-6" style={{ minHeight: "130px" }}>
        {startTw && (
          <TypewriterText
            text={finalText}
            speed={26}
            onComplete={() => setTwDone(true)}
            className="text-center"
            style={{
              fontFamily:"'Cormorant Garamond', Georgia, serif",
              fontSize:"1rem", lineHeight:1.88,
              color:"#49362C", fontStyle:"italic",
            }}
          />
        )}
      </div>

      <div className="flex items-center gap-2 mb-5" aria-hidden="true">
        <div className="h-px flex-1" style={{ background:"#B49A7C", opacity:0.4 }} />
        <span style={{ color:"#7B2027", fontSize:"9px" }}>✦</span>
        <div className="h-px flex-1" style={{ background:"#B49A7C", opacity:0.4 }} />
      </div>

      <motion.div
        initial={{ opacity:0, y:8 }}
        animate={twDone ? { opacity:1, y:0 } : {}}
        transition={{ duration:0.6 }}
        className="flex justify-center"
      >
        <button
          onClick={onResetView}
          style={{
            background:"transparent", border:"1.5px solid #7B2027",
            borderRadius:"1px", padding:"9px 24px",
            fontFamily:"'Cormorant Garamond', Georgia, serif",
            fontSize:"0.9rem", color:"#51191F",
            letterSpacing:"0.06em", cursor:"pointer",
          }}
          aria-label="Explore the globe again"
        >
          Explore the globe again ↺
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Tap hint ripple (shows once on first load) ─────────────────
function TapHint() {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const t = setTimeout(() => setVisible(false), 4000); return () => clearTimeout(t); }, []);
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center gap-2 mt-3"
      aria-live="polite"
    >
      <motion.span
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
        style={{ fontSize: "1rem", lineHeight: 1 }}
      >
        👆
      </motion.span>
      <span style={{
        fontFamily: "'Dancing Script', cursive",
        color: "#B49A7C", fontSize: "0.82rem", fontStyle: "italic",
      }}>
        Tap a glowing pin to reveal a message
      </span>
    </motion.div>
  );
}

// ── Main GlobeScreen ───────────────────────────────────────────
export default function GlobeScreen() {
  /* ── rotation state ── */
  const rotYRef = useRef(0);
  const rotXRef = useRef(-15);
  const [rotSnapshot, setRotSnapshot] = useState({ y: 0, x: -15 });

  /* ── drag state ── */
  const dragRef      = useRef({ active: false, lastX: 0, lastY: 0, moved: false });
  const velRef       = useRef({ vx: 0, vy: 0 });
  const rafRef       = useRef(null);
  const idleRef      = useRef(null);
  const isIdleRef    = useRef(true);
  const containerRef = useRef(null);

  /* ── ui state ── */
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [completedIds, setCompletedIds]     = useState(new Set());
  const [showFinal, setShowFinal]           = useState(false);
  const [finalTriggered, setFinalTriggered] = useState(false);
  const [globeSize, setGlobeSize]           = useState(300);
  const [pulsePhase, setPulsePhase]         = useState(0);

  /* ── responsive sizing ── */
  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      setGlobeSize(Math.min(Math.max(w - 40, 240), 340));
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  /* ── pulse animation (independent of rotation RAF) ── */
  useEffect(() => {
    let frame = 0;
    let id;
    const tick = () => {
      frame++;
      setPulsePhase((frame % 60) / 60);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  /* ── snapshot helper (triggers re-render) ── */
  const commit = useCallback(() => {
    setRotSnapshot({ y: rotYRef.current, x: rotXRef.current });
  }, []);

  /* ── idle auto-rotation ── */
  const startIdle = useCallback(() => {
    if (!isIdleRef.current) return;
    const step = () => {
      if (!isIdleRef.current) return;
      rotYRef.current = (rotYRef.current + 0.18) % 360;
      commit();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [commit]);

  const stopIdle = useCallback(() => {
    isIdleRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (idleRef.current)  { clearTimeout(idleRef.current); idleRef.current = null; }
  }, []);

  const scheduleIdle = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => {
      isIdleRef.current = true;
      startIdle();
    }, 2200);
  }, [startIdle]);

  useEffect(() => {
    isIdleRef.current = true;
    startIdle();
    return () => stopIdle();
  }, [startIdle, stopIdle]);

  /* ── inertia after drag ── */
  const startInertia = useCallback(() => {
    const step = () => {
      const { vx, vy } = velRef.current;
      if (Math.abs(vx) < 0.04 && Math.abs(vy) < 0.04) {
        scheduleIdle();
        return;
      }
      rotYRef.current += vx;
      rotXRef.current = Math.max(-40, Math.min(40, rotXRef.current + vy));
      velRef.current.vx *= 0.93;
      velRef.current.vy *= 0.93;
      commit();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [scheduleIdle, commit]);

  /* ── pointer down ── */
  const onPointerDown = useCallback((e) => {
    stopIdle();
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, moved: false };
    velRef.current  = { vx: 0, vy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [stopIdle]);

  /* ── pointer move ── */
  const onPointerMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.moved = true;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    const sensitivity = 0.42;
    const dY = dx * sensitivity;
    const dX = dy * sensitivity;
    rotYRef.current += dY;
    rotXRef.current = Math.max(-40, Math.min(40, rotXRef.current + dX));
    velRef.current  = { vx: dY * 0.55, vy: dX * 0.55 };
    commit();
  }, [commit]);

  /* ── pointer up ── */
  const onPointerUp = useCallback((e) => {
    if (!dragRef.current.active) return;
    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;

    if (!wasDrag) {
      // It was a tap — check marker hit
      const canvas = e.currentTarget.querySelector("canvas");
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const cxG = globeSize / 2, cyG = globeSize / 2, rG = globeSize * 0.44;

      let hit = null;
      // Check against pin HEAD position (y - 8 offset for head centre)
      for (const d of DISCOVERIES) {
        const p = project(d.lat, d.lon, rotYRef.current, rotXRef.current, cxG, cyG, rG);
        if (!p.visible) continue;
        const headCy = p.y - 8;
        const dist   = Math.hypot(px - p.x, py - headCy);
        if (dist < 22) { hit = d; break; }
      }
      if (hit) {
        setActiveMarkerId(hit.id);
        setCompletedIds((prev) => { const n = new Set(prev); n.add(hit.id); return n; });
      }
      // Don't start inertia for taps
      scheduleIdle();
      return;
    }

    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    startInertia();
  }, [globeSize, startInertia, scheduleIdle]);

  /* ── prevent page scroll while dragging ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e) => { if (dragRef.current.active) e.preventDefault(); };
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => el.removeEventListener("touchmove", prevent);
  }, []);

  /* ── final reveal when all 3 done ── */
  useEffect(() => {
    if (completedIds.size === 3 && !finalTriggered) {
      setFinalTriggered(true);
      setTimeout(() => setShowFinal(true), 800);
    }
  }, [completedIds, finalTriggered]);

  const activeDiscovery = useMemo(
    () => DISCOVERIES.find((d) => d.id === activeMarkerId) ?? null,
    [activeMarkerId]
  );

  // ── render ──
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9 }}
      className="relative w-full py-12 px-4 paper-grain"
      style={{ background: "#F7F0E4", minHeight: "100vh" }}
    >
      {/* Subtle petals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[{ left:"9%", dur:20, delay:0 }, { left:"82%", dur:26, delay:10 }].map((p, i) => (
          <svg key={i} viewBox="0 0 30 40" style={{
            position:"absolute", left:p.left, top:"-50px",
            width:13, height:18,
            animation:`floatDown ${p.dur}s ${p.delay}s linear infinite`,
          }} aria-hidden="true">
            <ellipse cx="15" cy="20" rx="12" ry="18" fill="#C58D8B" opacity="0.4" />
          </svg>
        ))}
      </div>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity:0, y:14 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.8, delay:0.2 }}
        className="text-center mb-2 px-4"
      >
        <p style={{ fontFamily:"'Dancing Script', cursive", color:"#B49A7C", fontSize:"0.85rem", letterSpacing:"0.1em" }}>
          — an atlas, just for you —
        </p>
        <h2 style={{
          fontFamily:"'Playfair Display', Georgia, serif",
          fontSize:"clamp(1.4rem, 6vw, 1.85rem)",
          fontStyle:"italic", color:"#49362C",
          fontWeight:700, marginTop:"6px", lineHeight:1.3,
        }}>
          A Little World, Just for You
        </h2>
        <p className="mt-3 mx-auto" style={{
          fontFamily:"'EB Garamond', Georgia, serif",
          fontSize:"0.95rem", color:"#B49A7C",
          lineHeight:1.7, maxWidth:"280px", fontStyle:"italic",
        }}>
          A little journey, a few hidden words, and something special waiting to be discovered.
        </p>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-2 max-w-xs mx-auto my-5" aria-hidden="true">
        <div className="h-px flex-1" style={{ background:"#B49A7C", opacity:0.3 }} />
        <RoseBud size={22} />
        <div className="h-px flex-1" style={{ background:"#B49A7C", opacity:0.3 }} />
      </div>

      {/* ── Globe section ── */}
      <motion.div
        initial={{ opacity:0, scale:0.9 }}
        animate={{ opacity:1, scale:1 }}
        transition={{ duration:1, delay:0.45 }}
        className="flex flex-col items-center"
      >
        <div
          ref={containerRef}
          style={{ width:"100%", maxWidth:"380px", display:"flex", flexDirection:"column", alignItems:"center" }}
        >
          {/* Globe + stand */}
          <div style={{ position:"relative", display:"inline-block" }}>
            {/* Outer decorative rings */}
            <div style={{ position:"absolute", inset:-10, borderRadius:"50%", border:"1.5px solid rgba(180,154,124,0.25)", pointerEvents:"none" }} aria-hidden="true" />
            <div style={{ position:"absolute", inset:-18, borderRadius:"50%", border:"0.5px solid rgba(180,154,124,0.1)", pointerEvents:"none" }} aria-hidden="true" />

            {/* Interactive globe div — ALL pointer events live here */}
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                cursor: "grab",
                touchAction: "none",
                userSelect: "none",
                borderRadius: "50%",
                boxShadow: "0 10px 50px rgba(81,25,31,0.22), 0 3px 10px rgba(0,0,0,0.14)",
              }}
              aria-label="Interactive globe — drag to spin, tap a glowing red pin to read a message"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") { rotYRef.current += 15; commit(); }
                if (e.key === "ArrowLeft")  { rotYRef.current -= 15; commit(); }
              }}
            >
              <GlobeCanvas
                size={globeSize}
                rotY={rotSnapshot.y}
                rotX={rotSnapshot.x}
                completedIds={completedIds}
                activeMarkerId={activeMarkerId}
                pulsePhase={pulsePhase}
              />
            </div>

            {/* Brass stand */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginTop:"2px" }}>
              <div style={{ width:4, height:24, background:"linear-gradient(180deg,#D0AE50,#A0802E,#D0AE50)", borderRadius:"2px" }} aria-hidden="true" />
              <div style={{ width:globeSize*0.52, height:12, background:"linear-gradient(180deg,#D8B450,#A58030)", borderRadius:"7px 7px 4px 4px", boxShadow:"0 3px 12px rgba(0,0,0,0.2)" }} aria-hidden="true" />
              <div style={{ width:globeSize*0.36, height:5, background:"linear-gradient(180deg,#A58030,#7A6020)", borderRadius:"0 0 4px 4px" }} aria-hidden="true" />
            </div>
          </div>

          {/* Instruction + tap hint */}
          <p className="text-center mt-5" style={{
            fontFamily:"'Dancing Script', cursive",
            color:"#B49A7C", fontSize:"0.9rem",
            fontStyle:"italic", letterSpacing:"0.02em",
          }}>
            Give the globe a little spin and discover the surprises hidden within. ♡
          </p>
          <AnimatePresence><TapHint /></AnimatePresence>

          {/* ── Progress indicator ── */}
          <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            transition={{ delay:1 }}
            className="flex flex-col items-center mt-5 mb-1 gap-2"
          >
            <p style={{
              fontFamily:"'EB Garamond', Georgia, serif",
              fontSize:"0.9rem", color:"#49362C", opacity:0.82,
            }}>
              Three little discoveries await you:{" "}
              <motion.span
                key={completedIds.size}
                initial={{ scale:1.4 }}
                animate={{ scale:1 }}
                transition={{ duration:0.3 }}
                style={{ color:"#7B2027", fontWeight:700, display:"inline-block" }}
              >
                {completedIds.size}/3
              </motion.span>
            </p>
            <div className="flex gap-3" role="img" aria-label={`${completedIds.size} of 3 discoveries made`}>
              {[0,1,2].map((i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={completedIds.has(i) ? { scale:[1,1.35,1] } : { scale:1 }}
                  transition={{ duration:0.4 }}
                >
                  <RoseIcon filled={completedIds.has(i)} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Final surprise ── */}
      <AnimatePresence>
        {showFinal && (
          <div className="w-full px-2 mt-10">
            <FinalSurprise onResetView={() => {
              rotYRef.current = 0;
              rotXRef.current = -15;
              commit();
              isIdleRef.current = true;
              startIdle();
            }} />
          </div>
        )}
      </AnimatePresence>

      {/* Bottom floral divider */}
      <FlowerDivider className="mt-12 max-w-xs mx-auto px-4" />

      {/* ── Discovery modal (portal-like fixed overlay) ── */}
      <AnimatePresence>
        {activeDiscovery && (
          <DiscoveryModal
            key={activeDiscovery.id}
            discovery={activeDiscovery}
            onClose={() => setActiveMarkerId(null)}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
}
