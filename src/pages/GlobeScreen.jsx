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
import ChibiSticker from "../components/ChibiSticker";

// ═══════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════

const DISCOVERIES = [
  {
    id: 0,
    title: "The Land of Memories",
    lat: 28, lon: -30,
    message: "Some places exist on maps. Others exist in the little corners of our hearts.",
  },
  {
    id: 1,
    title: "The Land of Dreams",
    lat: -20, lon: 115,
    message: "May you discover beautiful places, experience wonderful things, and collect memories that make you smile for years to come.",
  },
  {
    id: 2,
    title: "The Land of Possibilities",
    lat: 55, lon: 75,
    message: "The world is bigger than we can imagine. I hope your journey through it brings you beautiful experiences, unexpected happiness, and countless reasons to smile.",
  },
];

// Continent polygons — [lat, lon] each, more vertices for smoother curves
const LAND_POLYGONS = [
  // ── North America ──────────────────────────────────
  [[72,-140],[71,-125],[68,-100],[63,-82],[60,-65],[55,-60],[50,-55],[47,-53],
   [44,-66],[42,-70],[40,-74],[36,-76],[30,-82],[25,-80],[23,-87],[19,-90],
   [18,-92],[16,-90],[15,-85],[9,-82],[9,-79],[12,-83],[22,-97],[23,-106],
   [24,-110],[30,-115],[32,-117],[34,-120],[37,-122],[40,-124],[48,-124],
   [55,-132],[58,-137],[60,-142],[62,-150],[65,-168],[68,-166],[70,-160],
   [72,-155],[72,-140]],
  // ── Greenland ──────────────────────────────────────
  [[76,-65],[82,-40],[83,-25],[80,-18],[76,-18],[70,-22],[65,-38],[63,-52],[68,-55],[76,-65]],
  // ── Iceland ────────────────────────────────────────
  [[64,-24],[66,-22],[66,-14],[64,-13],[63,-18],[63,-22],[64,-24]],
  // ── South America ──────────────────────────────────
  [[12,-72],[10,-62],[8,-60],[5,-52],[2,-50],[0,-50],[-2,-44],[-5,-35],
   [-8,-35],[-12,-37],[-15,-39],[-20,-40],[-23,-43],[-28,-48],[-33,-53],
   [-38,-58],[-42,-65],[-50,-68],[-55,-68],[-56,-68],[-55,-70],[-50,-73],
   [-42,-73],[-35,-72],[-28,-71],[-18,-70],[-5,-80],[0,-80],[5,-77],
   [10,-75],[12,-72]],
  // ── Europe ─────────────────────────────────────────
  [[71,28],[70,22],[68,18],[64,14],[60,10],[58,5],[55,8],[54,8],[53,14],
   [54,18],[55,22],[56,21],[58,28],[60,25],[65,14],[68,18],[70,20],[71,28]],
  // Iberian + France
  [[48,2],[46,-1],[44,-1],[37,-9],[36,-6],[36,2],[38,4],[40,4],[42,3],[44,0],[48,2]],
  // Italy (simplified)
  [[44,8],[44,12],[46,13],[45,13],[43,16],[40,18],[38,16],[37,15],[38,12],[44,8]],
  // Scandinavian outline
  [[57,8],[57,10],[56,10],[55,12],[55,14],[56,16],[57,18],[58,17],[58,12],[60,10],[61,5],[57,8]],
  // ── Africa ─────────────────────────────────────────
  [[37,10],[36,2],[34,-5],[34,0],[32,0],[30,32],[28,34],[22,38],[15,42],[12,44],
   [8,45],[4,42],[0,42],[-4,40],[-8,40],[-12,40],[-18,36],[-26,33],
   [-34,26],[-35,18],[-34,16],[-30,17],[-22,14],[-18,12],[-12,15],[-8,14],
   [-4,10],[0,9],[4,5],[4,8],[8,4],[10,4],[16,0],[20,0],[20,10],[22,12],[37,10]],
  // Madagascar
  [[-13,49],[-16,50],[-20,47],[-25,44],[-26,44],[-22,42],[-16,44],[-13,49]],
  // ── Asia ───────────────────────────────────────────
  [[72,60],[70,50],[66,40],[60,30],[56,38],[55,37],[50,36],[47,40],[43,41],
   [40,50],[38,56],[35,58],[30,58],[25,57],[20,58],[15,50],[12,45],[13,43],
   [20,58],[22,60],[15,74],[10,78],[8,77],[6,80],[8,82],[10,80],[12,78],
   [8,100],[10,104],[14,100],[18,103],[22,114],[25,121],[28,120],[32,120],[35,117],
   [38,122],[42,131],[46,134],[52,142],[56,160],[60,163],[64,170],[70,170],
   [72,170],[73,155],[73,140],[73,120],[72,100],[70,80],[72,60]],
  // Indian subcontinent
  [[22,68],[20,70],[15,74],[10,78],[8,77],[8,80],[10,80],[15,80],[18,84],
   [20,87],[23,91],[22,92],[24,89],[26,88],[28,86],[28,84],[25,82],[22,80],[22,68]],
  // Japan (simplified)
  [[44,142],[42,140],[38,140],[34,136],[34,130],[36,130],[38,140],[42,140],[44,142]],
  // Sri Lanka
  [[10,80],[8,81],[8,80],[10,80]],
  // ── Australia ──────────────────────────────────────
  [[-14,126],[-14,136],[-16,136],[-17,140],[-20,148],[-25,152],[-32,152],
   [-38,145],[-38,140],[-35,138],[-35,136],[-32,130],[-28,124],[-22,114],
   [-20,118],[-16,124],[-14,126]],
  // Tasmania
  [[-41,144],[-43,147],[-44,148],[-42,146],[-41,144]],
  // New Zealand (simplified)
  [[-36,174],[-38,176],[-41,175],[-46,168],[-44,170],[-38,174],[-36,174]],
  // UK (simplified)
  [[51,-2],[53,-5],[55,-5],[58,-5],[59,-3],[57,0],[54,0],[52,2],[51,2],[51,-2]],
  // Ireland
  [[52,-10],[54,-10],[55,-8],[54,-6],[53,-6],[52,-8],[52,-10]],
  // ── Antarctica ─────────────────────────────────────
  [[-70,0],[-68,45],[-70,90],[-68,135],[-70,180],[-68,-135],[-70,-90],[-68,-45],[-70,0]],
];

// ═══════════════════════════════════════════════════════
//  GEOMETRY — Sutherland-Hodgman hemisphere clipping
// ═══════════════════════════════════════════════════════

const DEG = Math.PI / 180;

/** Transform lat/lon → rotated 3-D unit-sphere point */
function toWorld(lat, lon, cosRY, sinRY, cosRX, sinRX) {
  const phi = lat * DEG;
  const lam = lon * DEG;
  const x0  = Math.cos(phi) * Math.cos(lam);
  const y0  = Math.sin(phi);
  const z0  = Math.cos(phi) * Math.sin(lam);
  // Rotate around Y (spin)
  const x1 =  x0 * cosRY + z0 * sinRY;
  const z1 = -x0 * sinRY + z0 * cosRY;
  // Rotate around X (tilt)
  const y2 =  y0 * cosRX - z1 * sinRX;
  return { x: x1, y: y2 };   // x > 0  ⇒  front hemisphere
}

/**
 * Sutherland-Hodgman clip polygon against the plane x = CLIP_EPS.
 * Returns an array of {x, y} in world space, or null if fully hidden.
 */
const CLIP_EPS = 0.005;
function clipHemisphere(pts) {
  if (pts.length < 2) return null;
  const out = [];
  const n   = pts.length;
  for (let i = 0; i < n; i++) {
    const a   = pts[i];
    const b   = pts[(i + 1) % n];
    const aIn = a.x > CLIP_EPS;
    const bIn = b.x > CLIP_EPS;
    if (aIn) out.push(a);
    if (aIn !== bIn) {
      // Intersection with plane x = CLIP_EPS
      const t = (CLIP_EPS - a.x) / (b.x - a.x);
      out.push({ x: CLIP_EPS, y: a.y + t * (b.y - a.y) });
    }
  }
  return out.length >= 3 ? out : null;
}

/** Project a clipped polygon to 2-D canvas coords */
function projectPoly(worldPts, cx, cy, r) {
  return worldPts.map(p => ({ x: cx + p.x * r, y: cy - p.y * r }));
}

// ═══════════════════════════════════════════════════════
//  GLOBE CANVAS
// ═══════════════════════════════════════════════════════
function GlobeCanvas({ size, rotY, rotX, completedIds, activeMarkerId, pulsePhase }) {
  const canvasRef = useRef(null);
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.44;

  // Set canvas physical size once when size changes (for DPR)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;
  }, [size]);

  // Draw on every rotation / state change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const W    = canvas.width;
    const H    = canvas.height;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);   // reset scale each frame
    ctx.clearRect(0, 0, size, size);

    // Pre-compute rotation trig (shared across all polygons)
    const rY   = rotY * DEG;
    const rX   = rotX * DEG;
    const cosRY = Math.cos(rY), sinRY = Math.sin(rY);
    const cosRX = Math.cos(rX), sinRX = Math.sin(rX);

    // ── 1. Clip to sphere circle ────────────────────────
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // ── 2. Ocean fill ────────────────────────────────────
    const oceanGrad = ctx.createRadialGradient(
      cx - r * 0.25, cy - r * 0.25, r * 0.04,
      cx, cy, r
    );
    oceanGrad.addColorStop(0,    "#7AB4CC");
    oceanGrad.addColorStop(0.45, "#5E8FA8");
    oceanGrad.addColorStop(1,    "#2E556A");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(cx - r - 1, cy - r - 1, r * 2 + 2, r * 2 + 2);

    // ── 3. Longitude grid lines (great circles, sampled) ─
    ctx.strokeStyle = "rgba(255,255,255,0.055)";
    ctx.lineWidth   = 0.6;
    for (let lon = 0; lon < 360; lon += 30) {
      let penDown = false;
      ctx.beginPath();
      for (let lat = -88; lat <= 88; lat += 4) {
        const w = toWorld(lat, lon, cosRY, sinRY, cosRX, sinRX);
        if (w.x > 0) {
          const px = cx + w.x * r;
          const py = cy - w.y * r;
          if (!penDown) { ctx.moveTo(px, py); penDown = true; }
          else            ctx.lineTo(px, py);
        } else {
          penDown = false;
        }
      }
      ctx.stroke();
    }

    // ── 4. Latitude lines ────────────────────────────────
    ctx.strokeStyle = "rgba(255,255,255,0.055)";
    ctx.lineWidth   = 0.6;
    for (let lat = -60; lat <= 60; lat += 30) {
      let penDown = false;
      ctx.beginPath();
      for (let lon = -180; lon <= 180; lon += 4) {
        const w = toWorld(lat, lon, cosRY, sinRY, cosRX, sinRX);
        if (w.x > 0) {
          const px = cx + w.x * r;
          const py = cy - w.y * r;
          if (!penDown) { ctx.moveTo(px, py); penDown = true; }
          else            ctx.lineTo(px, py);
        } else {
          penDown = false;
        }
      }
      ctx.stroke();
    }

    // ── 5. Continents — clipped & projected ──────────────
    for (const poly of LAND_POLYGONS) {
      // Transform to world space
      const world = poly.map(([lat, lon]) =>
        toWorld(lat, lon, cosRY, sinRY, cosRX, sinRX)
      );

      // Sutherland-Hodgman clip against front hemisphere
      const clipped = clipHemisphere(world);
      if (!clipped) continue;

      // Project to canvas 2D
      const pts2d = projectPoly(clipped, cx, cy, r);

      // Continent fill — antique parchment land colour
      ctx.beginPath();
      ctx.moveTo(pts2d[0].x, pts2d[0].y);
      for (let i = 1; i < pts2d.length; i++) ctx.lineTo(pts2d[i].x, pts2d[i].y);
      ctx.closePath();

      ctx.fillStyle   = "#C9B07A";
      ctx.fill();
      ctx.strokeStyle = "#7A5E30";
      ctx.lineWidth   = 0.75;
      ctx.stroke();
    }

    // ── 6. Specular / glass sheen ─────────────────────────
    const sheen = ctx.createRadialGradient(
      cx - r * 0.30, cy - r * 0.30, 0,
      cx - r * 0.30, cy - r * 0.30, r * 0.70
    );
    sheen.addColorStop(0,    "rgba(255,255,255,0.20)");
    sheen.addColorStop(0.50, "rgba(255,255,255,0.05)");
    sheen.addColorStop(1,    "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(cx - r - 1, cy - r - 1, r * 2 + 2, r * 2 + 2);

    // ── End sphere clip ──────────────────────────────────
    ctx.restore();

    // ── 7. Atmospheric limb shadow ────────────────────────
    const limb = ctx.createRadialGradient(cx, cy, r * 0.78, cx, cy, r + 1);
    limb.addColorStop(0,    "rgba(25,5,5,0)");
    limb.addColorStop(0.72, "rgba(25,5,5,0.10)");
    limb.addColorStop(1,    "rgba(25,5,5,0.50)");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = limb;
    ctx.fill();

    // ── 8. Outer border ring ──────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(180,154,124,0.70)";
    ctx.lineWidth   = 2;
    ctx.stroke();

    // ── 9. Markers ────────────────────────────────────────
    const pulse = 0.5 + 0.5 * Math.sin(pulsePhase * Math.PI * 2);

    for (const d of DISCOVERIES) {
      const w = toWorld(d.lat, d.lon, cosRY, sinRY, cosRX, sinRX);
      if (w.x <= 0.02) continue;                // hidden — skip

      const px   = cx + w.x * r;
      const py   = cy - w.y * r;
      const headY = py - 9;                     // pin head centre

      const isActive    = activeMarkerId === d.id;
      const isCompleted = completedIds.has(d.id);
      const pinColor    = isActive ? "#E04060" : "#8B2027";

      // Outer pulse ring
      const haloR = isActive ? 20 : 11 + pulse * 6;
      const haloA = isActive ? 0.38 : 0.10 + pulse * 0.10;
      ctx.beginPath();
      ctx.arc(px, headY, haloR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196,64,80,${haloA})`;
      ctx.fill();

      if (isActive) {
        ctx.beginPath();
        ctx.arc(px, headY, 26, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(196,64,80,0.22)";
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }

      // Pin drop-shadow
      ctx.beginPath();
      ctx.arc(px + 2, headY + 2, 9.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fill();

      // Pin head gradient (gives 3-D bead look)
      const pg = ctx.createRadialGradient(px - 3, headY - 3, 1, px, headY, 9.5);
      pg.addColorStop(0,   isActive ? "#F07090" : "#B03040");
      pg.addColorStop(0.6, isActive ? "#D04060" : "#8B2027");
      pg.addColorStop(1,   isActive ? "#902040" : "#51191F");
      ctx.beginPath();
      ctx.arc(px, headY, 9.5, 0, Math.PI * 2);
      ctx.fillStyle = pg;
      ctx.fill();

      // White border
      ctx.beginPath();
      ctx.arc(px, headY, 9.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(247,240,228,0.75)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // Teardrop tail
      ctx.beginPath();
      ctx.moveTo(px - 5.5, headY + 6);
      ctx.lineTo(px,        py + 4);
      ctx.lineTo(px + 5.5, headY + 6);
      ctx.fillStyle = pinColor;
      ctx.fill();

      // Shine dot
      ctx.beginPath();
      ctx.arc(px - 3, headY - 3, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.50)";
      ctx.fill();

      // Completed inner mark
      if (isCompleted) {
        ctx.beginPath();
        ctx.arc(px, headY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(247,240,228,0.95)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, headY, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#7B2027";
        ctx.fill();
      }
    }

  // Intentionally include pulsePhase so markers pulse even while idle
  }, [size, rotY, rotX, completedIds, activeMarkerId, pulsePhase, cx, cy, r]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    />
  );
}

// ═══════════════════════════════════════════════════════
//  DISCOVERY MODAL (full-screen overlay)
// ═══════════════════════════════════════════════════════
function DiscoveryModal({ discovery, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(49,21,14,0.68)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.82, y: 48 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.90,  y: 20 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="paper-grain"
        style={{
          background: "#EDE0C4",
          borderRadius: "3px",
          border: "1px solid rgba(180,154,124,0.55)",
          boxShadow: "0 28px 90px rgba(49,21,14,0.55), 0 4px 16px rgba(0,0,0,0.22), inset 0 0 60px rgba(180,154,124,0.07)",
          padding: "36px 28px 30px",
          width: "100%", maxWidth: "340px",
          position: "relative",
        }}
      >
        {/* Double inset frame */}
        <div style={{ position:"absolute", inset:10, border:"0.5px solid rgba(81,25,31,0.20)", borderRadius:"2px", pointerEvents:"none" }} aria-hidden="true" />
        <div style={{ position:"absolute", inset:14, border:"0.5px solid rgba(81,25,31,0.08)", borderRadius:"2px", pointerEvents:"none" }} aria-hidden="true" />

        {/* Top ornament */}
        <div className="text-center mb-3" aria-hidden="true">
          <span style={{ color:"#7B2027", fontSize:"10px", letterSpacing:"0.35em", opacity:0.55 }}>✦ ✦ ✦</span>
        </div>

        {/* Rose */}
        <motion.div
          className="flex justify-center mb-4"
          initial={{ scale: 0.55, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.45, ease: "backOut" }}
        >
          <RoseBud size={42} />
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.18, duration: 0.38 }}
          className="text-center mb-1"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.18rem", fontStyle: "italic",
            color: "#51191F", fontWeight: 700, lineHeight: 1.3,
          }}
        >
          {discovery.title}
        </motion.h3>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.26, duration: 0.5 }}
          className="flex items-center gap-2 my-4" aria-hidden="true"
        >
          <div className="h-px flex-1" style={{ background:"#B49A7C", opacity:0.45 }} />
          <span style={{ color:"#7B2027", fontSize:"9px" }}>✦</span>
          <div className="h-px flex-1" style={{ background:"#B49A7C", opacity:0.45 }} />
        </motion.div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.36, duration: 0.65 }}
          className="text-center"
          style={{
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: "1.06rem", lineHeight: 1.88,
            color: "#49362C", fontStyle: "italic",
          }}
        >
          {discovery.message}
        </motion.p>

        {/* Bottom ornament */}
        <div className="text-center mt-5 mb-5" aria-hidden="true">
          <span style={{ color:"#7B2027", fontSize:"10px", letterSpacing:"0.35em", opacity:0.55 }}>✦ ✦ ✦</span>
        </div>

        {/* Close */}
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.38 }}
          className="flex justify-center"
        >
          <button
            onClick={onClose}
            style={{
              background:"transparent", border:"1.5px solid #7B2027",
              borderRadius:"1px", padding:"8px 32px",
              fontFamily:"'Cormorant Garamond', Georgia, serif",
              fontSize:"0.9rem", color:"#51191F",
              letterSpacing:"0.06em", cursor:"pointer",
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

// ═══════════════════════════════════════════════════════
//  WRONG CONTINENT FEEDBACK (Chibi 3: angry, pouting girl)
// ═══════════════════════════════════════════════════════
function WrongContinentFeedback({ onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(40,15,18,0.52)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="paper-grain"
        style={{
          background: "#EDE0C4",
          borderRadius: "4px",
          border: "1.5px solid rgba(180,154,124,0.6)",
          boxShadow: "0 24px 80px rgba(49,21,14,0.45), 0 4px 16px rgba(0,0,0,0.18)",
          padding: "24px 20px 20px",
          width: "100%",
          maxWidth: "300px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 8,
            border: "0.5px solid rgba(81,25,31,0.18)",
            borderRadius: "3px",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />

        {/* Chibi 3: angry, pouting girl */}
        <ChibiSticker
          src="/images/chibi-3.jpg"
          alt="angry, pouting girl"
          width={120}
          rotate={-2}
          delay={0.1}
        />

        <p
          className="text-center mt-3 mb-1"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.05rem",
            color: "#7B2027",
            fontWeight: 600,
            fontStyle: "italic",
          }}
        >
          wrong continent. try again!
        </p>

        <p
          className="text-center mt-1 mb-4"
          style={{
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: "0.95rem",
            color: "#49362C",
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          No secrets buried here! Give the globe a little spin and look for the glowing red rose pins. ♡
        </p>

        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "1.5px solid #7B2027",
            borderRadius: "1px",
            padding: "6px 24px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "0.85rem",
            color: "#51191F",
            letterSpacing: "0.06em",
            cursor: "pointer",
          }}
          aria-label="Keep searching"
        >
          keep looking ↺
        </button>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
//  ROSE PROGRESS ICONS
// ═══════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════
//  FINAL SURPRISE
// ═══════════════════════════════════════════════════════
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
        background: "#EDE0C4", border: "1px solid rgba(180,154,124,0.42)",
        borderRadius: "3px",
        boxShadow: "0 16px 60px rgba(81,25,31,0.2), inset 0 0 50px rgba(180,154,124,0.08)",
        padding: "36px 26px 30px",
        width: "100%", maxWidth: "340px", margin: "0 auto", position: "relative",
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
        animate={{ rotate:[0,3,-3,0] }}
        transition={{ repeat:Infinity, duration:10, ease:"easeInOut" }}
      >
        <RoseFull size={92} />
      </motion.div>

      <div className="mb-6" style={{ minHeight:"130px" }}>
        {startTw && (
          <TypewriterText
            text={finalText} speed={26}
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

// ═══════════════════════════════════════════════════════
//  TAP HINT (fades out after 5 s)
// ═══════════════════════════════════════════════════════
function TapHint() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
      exit={{ opacity:0 }} transition={{ duration:0.5 }}
      className="flex items-center justify-center gap-2 mt-3"
      aria-live="polite"
    >
      <motion.span animate={{ scale:[1,1.3,1] }} transition={{ repeat:Infinity, duration:1.4 }} style={{ fontSize:"1rem" }}>
        👆
      </motion.span>
      <span style={{ fontFamily:"'Dancing Script', cursive", color:"#B49A7C", fontSize:"0.82rem", fontStyle:"italic" }}>
        Tap a glowing pin to reveal a message
      </span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN GLOBE SCREEN
// ═══════════════════════════════════════════════════════
export default function GlobeScreen() {
  // Rotation lives in refs so we never read stale values
  const rotYRef = useRef(0);
  const rotXRef = useRef(-15);
  const [rotSnap, setRotSnap] = useState({ y: 0, x: -15 });

  const dragRef      = useRef({ active: false, lastX: 0, lastY: 0, moved: false });
  const velRef       = useRef({ vx: 0, vy: 0 });
  const rafRef       = useRef(null);
  const idleRef      = useRef(null);
  const isIdleRef    = useRef(true);
  const containerRef = useRef(null);

  const [activeMarkerId,  setActiveMarkerId]  = useState(null);
  const [completedIds,    setCompletedIds]    = useState(new Set());
  const [showFinal,       setShowFinal]       = useState(false);
  const [finalTriggered,  setFinalTriggered]  = useState(false);
  const [globeSize,       setGlobeSize]       = useState(300);
  const [pulsePhase,      setPulsePhase]      = useState(0);
  const [showWrongFeedback, setShowWrongFeedback] = useState(false);

  // ── Responsive size ────────────────────────────────────
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

  // ── Pulse animation (independent RAF) ─────────────────
  useEffect(() => {
    let frame = 0, id;
    const tick = () => {
      frame++;
      setPulsePhase((frame % 90) / 90);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  // ── Commit ref values → state (triggers canvas redraw) ─
  const commit = useCallback(() => {
    setRotSnap({ y: rotYRef.current, x: rotXRef.current });
  }, []);

  // ── Idle rotation ──────────────────────────────────────
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
    if (rafRef.current)  { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (idleRef.current) { clearTimeout(idleRef.current); idleRef.current = null; }
  }, []);

  const scheduleIdle = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => { isIdleRef.current = true; startIdle(); }, 2200);
  }, [startIdle]);

  useEffect(() => {
    isIdleRef.current = true;
    startIdle();
    return () => stopIdle();
  }, [startIdle, stopIdle]);

  // ── Inertia ────────────────────────────────────────────
  const startInertia = useCallback(() => {
    const step = () => {
      const { vx, vy } = velRef.current;
      if (Math.abs(vx) < 0.04 && Math.abs(vy) < 0.04) { scheduleIdle(); return; }
      rotYRef.current += vx;
      rotXRef.current  = Math.max(-42, Math.min(42, rotXRef.current + vy));
      velRef.current.vx *= 0.93;
      velRef.current.vy *= 0.93;
      commit();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [scheduleIdle, commit]);

  // ── Pointer events ─────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    stopIdle();
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, moved: false };
    velRef.current  = { vx: 0, vy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [stopIdle]);

  const onPointerMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.moved = true;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    const dY = dx * 0.42, dX = dy * 0.42;
    rotYRef.current += dY;
    rotXRef.current  = Math.max(-42, Math.min(42, rotXRef.current + dX));
    velRef.current   = { vx: dY * 0.55, vy: dX * 0.55 };
    commit();
  }, [commit]);

  const onPointerUp = useCallback((e) => {
    if (!dragRef.current.active) return;
    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;

    if (!wasDrag) {
      // ── Tap → hit-test markers ──
      const divEl = e.currentTarget;
      if (!divEl) return;
      const rect = divEl.getBoundingClientRect();
      const px   = e.clientX - rect.left;
      const py   = e.clientY - rect.top;

      const gSize = globeSize;
      const gcx   = gSize / 2, gcy = gSize / 2, gr = gSize * 0.44;
      const rY    = rotYRef.current * DEG;
      const rX    = rotXRef.current * DEG;
      const cosRY = Math.cos(rY), sinRY = Math.sin(rY);
      const cosRX = Math.cos(rX), sinRX = Math.sin(rX);

      let hit = null;
      for (const d of DISCOVERIES) {
        const w    = toWorld(d.lat, d.lon, cosRY, sinRY, cosRX, sinRX);
        if (w.x <= 0.02) continue;             // on back — ignore
        const sx   = gcx + w.x * gr;
        const sy   = gcy - w.y * gr;
        const headY = sy - 9;                  // pin head offset
        if (Math.hypot(px - sx, py - headY) < 24) { hit = d; break; }
      }

      if (hit) {
        setActiveMarkerId(hit.id);
        setCompletedIds((prev) => { const n = new Set(prev); n.add(hit.id); return n; });
        setShowWrongFeedback(false);
      } else {
        const distFromCenter = Math.hypot(px - gcx, py - gcy);
        if (distFromCenter < gr + 15) {
          setShowWrongFeedback(true);
        }
      }
      scheduleIdle();
      return;
    }

    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    startInertia();
  }, [globeSize, startInertia, scheduleIdle]);

  // Prevent page scroll while dragging globe
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (ev) => { if (dragRef.current.active) ev.preventDefault(); };
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => el.removeEventListener("touchmove", prevent);
  }, []);

  // ── Final reveal ───────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9 }}
      className="relative w-full py-12 px-4 paper-grain"
      style={{ background: "#F7F0E4", minHeight: "100vh" }}
    >
      {/* Petals */}
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

      {/* Header */}
      <motion.div
        initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.8, delay:0.2 }}
        className="text-center mb-2 px-4"
      >
        <p style={{ fontFamily:"'Dancing Script', cursive", color:"#B49A7C", fontSize:"0.85rem", letterSpacing:"0.1em" }}>
          — an atlas, just for you —
        </p>
        <h2 style={{
          fontFamily:"'Playfair Display', Georgia, serif",
          fontSize:"clamp(1.4rem, 6vw, 1.85rem)", fontStyle:"italic",
          color:"#49362C", fontWeight:700, marginTop:"6px", lineHeight:1.3,
        }}>
          A Little World, Just for You
        </h2>

        {/* Chibi 5: Geography explorer holding a map and globe (Prominent) */}
        <div className="flex justify-center my-3.5">
          <ChibiSticker
            src="/images/chibi-5.jpg"
            alt="geography explorer holding a map and globe"
            width={142}
            rotate={-1.5}
            priority={true}
            delay={0.25}
          />
        </div>

        <p className="mt-1 mx-auto" style={{
          fontFamily:"'EB Garamond', Georgia, serif",
          fontSize:"0.95rem", color:"#B49A7C",
          lineHeight:1.7, maxWidth:"285px", fontStyle:"italic",
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

      {/* Globe */}
      <motion.div
        initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
        transition={{ duration:1, delay:0.45 }}
        className="flex flex-col items-center"
      >
        <div
          ref={containerRef}
          style={{ width:"100%", maxWidth:"380px", display:"flex", flexDirection:"column", alignItems:"center" }}
        >
          <div style={{ position:"relative", display:"inline-block" }}>
            {/* Decorative rings */}
            <div style={{ position:"absolute", inset:-10, borderRadius:"50%", border:"1.5px solid rgba(180,154,124,0.25)", pointerEvents:"none" }} aria-hidden="true" />
            <div style={{ position:"absolute", inset:-18, borderRadius:"50%", border:"0.5px solid rgba(180,154,124,0.10)", pointerEvents:"none" }} aria-hidden="true" />

            {/* Globe interaction wrapper */}
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                cursor:"grab", touchAction:"none", userSelect:"none",
                borderRadius:"50%",
                boxShadow:"0 10px 50px rgba(81,25,31,0.22), 0 3px 10px rgba(0,0,0,0.14)",
              }}
              role="button"
              tabIndex={0}
              aria-label="Interactive globe — drag to spin, tap a glowing red pin to read a message"
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") { rotYRef.current += 15; commit(); }
                if (e.key === "ArrowLeft")  { rotYRef.current -= 15; commit(); }
              }}
            >
              <GlobeCanvas
                size={globeSize}
                rotY={rotSnap.y}
                rotX={rotSnap.x}
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

          {/* Instruction */}
          <p className="text-center mt-5" style={{
            fontFamily:"'Dancing Script', cursive",
            color:"#B49A7C", fontSize:"0.9rem", fontStyle:"italic", letterSpacing:"0.02em",
          }}>
            Give the globe a little spin and discover the surprises hidden within. ♡
          </p>
          <AnimatePresence><TapHint /></AnimatePresence>

          {/* Playful hint button for wrong continent / finding coordinates */}
          <button
            type="button"
            onClick={() => setShowWrongFeedback(true)}
            className="text-center mt-2 opacity-65 hover:opacity-100 transition-opacity"
            style={{
              background: "none",
              border: "none",
              color: "#7B2027",
              fontFamily: "'Dancing Script', cursive",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
            aria-label="Ask our navigator for hints"
          >
            (tapped the wrong continent? ask our navigator ♡)
          </button>

          {/* Progress */}
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ delay:1.1 }}
            className="flex flex-col items-center mt-5 mb-1 gap-2"
          >
            <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:"0.9rem", color:"#49362C", opacity:0.82 }}>
              Three little discoveries await you:{" "}
              <motion.span
                key={completedIds.size}
                initial={{ scale:1.4 }} animate={{ scale:1 }}
                transition={{ duration:0.3 }}
                style={{ color:"#7B2027", fontWeight:700, display:"inline-block" }}
              >
                {completedIds.size}/3
              </motion.span>
            </p>
            <div className="flex gap-3" role="img" aria-label={`${completedIds.size} of 3 discoveries made`}>
              {[0,1,2].map((i) => (
                <motion.div key={i} initial={false}
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

      {/* Final surprise */}
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

      <FlowerDivider className="mt-12 max-w-xs mx-auto px-4" />

      {/* Discovery modal */}
      <AnimatePresence>
        {activeDiscovery && (
          <DiscoveryModal
            key={activeDiscovery.id}
            discovery={activeDiscovery}
            onClose={() => setActiveMarkerId(null)}
          />
        )}
      </AnimatePresence>

      {/* Wrong continent feedback modal with Chibi 3 */}
      <AnimatePresence>
        {showWrongFeedback && (
          <WrongContinentFeedback onClose={() => setShowWrongFeedback(false)} />
        )}
      </AnimatePresence>
    </motion.section>
  );
}
