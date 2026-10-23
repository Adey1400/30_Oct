import React, { useState } from "react";
import { motion } from "framer-motion";
import { LETTER } from "../config/content";
import TypewriterText from "../components/TypewriterText";
import { RoseFull, FlowerDivider } from "../components/RoseSVG";
import ChibiSticker from "../components/ChibiSticker";

// ── Envelope-open transition ───────────────────────────────
function EnvelopeOpener({ onDone }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ background: "var(--ivory)" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      {/* Envelope body */}
      <div className="relative" style={{ width: 220, height: 160 }}>
        {/* Body */}
        <div
          className="absolute inset-0 rounded-sm"
          style={{
            background: "var(--parchment)",
            border: "1.5px solid var(--brown)",
            boxShadow: "0 8px 32px rgba(81,25,31,0.2)",
          }}
        />
        {/* V-flap (animated) */}
        <motion.div
          className="absolute left-0 right-0 top-0"
          style={{
            height: 0,
            borderLeft: "110px solid transparent",
            borderRight: "110px solid transparent",
            borderTop: "70px solid var(--brown)",
            opacity: 0.6,
            transformOrigin: "top center",
          }}
          animate={{ rotateX: [0, -180] }}
          transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
        />
        {/* Seal */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            background: "var(--burgundy)",
            border: "2px solid var(--antique-red)",
          }}
          animate={{ scale: [1, 0], opacity: [1, 0] }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <span style={{ color: "var(--ivory)", fontSize: "18px" }}>♡</span>
        </motion.div>
      </div>

      <motion.p
        className="mt-6 text-center"
        style={{ fontFamily: "'Dancing Script', cursive", color: "var(--brown)", fontSize: "1.1rem" }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, delay: 0.2 }}
        onAnimationComplete={onDone}
      >
        opening your letter...
      </motion.p>
    </motion.div>
  );
}

// ── Parchment paper edges (CSS clip-path trick) ────────────
function ParchmentEdge({ side = "top" }) {
  const d =
    side === "top"
      ? "M0,0 Q10,8 20,2 Q30,10 40,3 Q50,9 60,1 Q70,8 80,2 Q90,10 100,3 L100,0 Z"
      : "M0,100 Q10,92 20,98 Q30,90 40,97 Q50,91 60,99 Q70,92 80,98 Q90,90 100,97 L100,100 Z";
  return (
    <svg
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className="w-full absolute left-0"
      style={{ height: 12, [side]: 0 }}
      aria-hidden="true"
    >
      <path d={d} fill="var(--parchment)" />
    </svg>
  );
}

export default function LetterScreen() {
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [letterVisible, setLetterVisible] = useState(false);

  const fullText = `${LETTER.salutation}\n\n${LETTER.body}`;

  if (showEnvelope) {
    return (
      <EnvelopeOpener
        onDone={() => {
          setShowEnvelope(false);
          setTimeout(() => setLetterVisible(true), 200);
        }}
      />
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen w-full py-12 px-4 paper-grain"
      style={{ background: "var(--ivory)" }}
    >
      {/* Section header */}
      <div className="text-center mb-8">
        <p
          style={{
            fontFamily: "'Dancing Script', cursive",
            color: "var(--brown)",
            fontSize: "0.9rem",
            letterSpacing: "0.08em",
          }}
        >
          — your letter —
        </p>
      </div>

      {/* Rose illustration */}
      <div className="flex justify-center mb-6">
        <RoseFull size={80} />
      </div>

      {/* Parchment letter */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={letterVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative mx-auto max-w-sm paper-grain"
        style={{
          background: "var(--parchment)",
          borderRadius: "2px",
          boxShadow:
            "0 8px 40px rgba(81,25,31,0.15), 0 2px 8px rgba(0,0,0,0.08), inset 0 0 40px rgba(180,154,124,0.15)",
          border: "1px solid rgba(180,154,124,0.4)",
          paddingTop: "28px",
          paddingBottom: "32px",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        {/* Decorative top line */}
        <ParchmentEdge side="top" />

        {/* Header ornament */}
        <div className="text-center mb-5" aria-hidden="true">
          <span
            style={{ color: "var(--antique-red)", fontSize: "11px", letterSpacing: "0.3em", opacity: 0.6 }}
          >
            ✦ ✦ ✦
          </span>
        </div>

        {/* Letter content */}
        <TypewriterText
          text={fullText}
          speed={25}
          className="relative z-10"
          style={{
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: "1.05rem",
            lineHeight: 1.85,
            color: "var(--sepia)",
          }}
        />

        {/* Footer ornament */}
        <div className="text-center mt-6" aria-hidden="true">
          <span
            style={{ color: "var(--antique-red)", fontSize: "11px", letterSpacing: "0.3em", opacity: 0.6 }}
          >
            ✦ ✦ ✦
          </span>
        </div>

        {/* Ink stain / aged mark */}
        <div
          className="absolute bottom-8 right-6 rounded-full pointer-events-none"
          style={{ width: 8, height: 8, background: "var(--brown)", opacity: 0.12 }}
          aria-hidden="true"
        />

        <ParchmentEdge side="bottom" />
      </motion.article>

      {/* Chibi 1: Beside birthday letter lower corner */}
      <div className="max-w-sm mx-auto flex justify-end -mt-3 pr-4 relative z-20">
        <ChibiSticker
          src="/images/chibi-1.jpg"
          alt="girl sleeping at her laptop"
          width={130}
          rotate={2.5}
          delay={0.5}
        />
      </div>

      {/* Floral divider below letter */}
      <FlowerDivider className="mt-8 max-w-sm mx-auto px-4" />

      {/* Chibi 2: Playful transition between letter and interactive globe */}
      <div className="flex justify-center mt-7 mb-2">
        <ChibiSticker
          src="/images/chibi-2.jpg"
          alt="girl eating noodles"
          width={124}
          rotate={-2}
          delay={0.3}
        />
      </div>
    </motion.section>
  );
}
