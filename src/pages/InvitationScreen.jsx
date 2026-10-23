import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { INVITATION } from "../config/content";
import FloatingPetals from "../components/FloatingPetals";
import { RoseFull, RoseCorner } from "../components/RoseSVG";

export default function InvitationScreen({ onOpen }) {
  const [soundOn, setSoundOn] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden paper-grain safe-top safe-bottom"
      style={{ background: "var(--ivory)" }}
    >
      {/* Floating petals */}
      <FloatingPetals count={10} />

      {/* ── Corner roses ── */}
      <div className="absolute top-0 left-0 pointer-events-none" style={{ zIndex: 2 }}>
        <RoseCorner size={90} />
      </div>
      <div className="absolute top-0 right-0 pointer-events-none" style={{ zIndex: 2 }}>
        <RoseCorner size={90} flip />
      </div>
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{ zIndex: 2, transform: "scaleY(-1)" }}
      >
        <RoseCorner size={80} />
      </div>
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{ zIndex: 2, transform: "scale(-1,-1)" }}
      >
        <RoseCorner size={80} />
      </div>

      {/* ── Sound toggle ── */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setSoundOn((s) => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-200"
          style={{
            border: "1px solid var(--brown)",
            color: "var(--sepia)",
            background: "rgba(247,240,228,0.8)",
            fontFamily: "'Cormorant Garamond', serif",
            backdropFilter: "blur(4px)",
          }}
          aria-label={soundOn ? "Mute music" : "Play music"}
        >
          {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          <span>{soundOn ? "sound on" : "sound off"}</span>
        </button>
      </div>

      {/* ── Central card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
        className="relative z-10 text-center px-8 py-10 max-w-xs mx-auto"
        style={{
          background: "rgba(247,240,228,0.75)",
          backdropFilter: "blur(4px)",
          borderRadius: "2px",
        }}
      >
        {/* Ornamental top line */}
        <div className="flex items-center gap-2 mb-6" aria-hidden="true">
          <div className="h-px flex-1" style={{ background: "var(--brown)", opacity: 0.5 }} />
          <span style={{ color: "var(--antique-red)", fontSize: "10px" }}>✦ ✦ ✦</span>
          <div className="h-px flex-1" style={{ background: "var(--brown)", opacity: 0.5 }} />
        </div>

        {/* Rose */}
        <motion.div
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="flex justify-center mb-4"
        >
          <RoseFull size={90} />
        </motion.div>

        {/* Headline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mb-2"
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: "1.4rem",
            color: "var(--sepia)",
            lineHeight: 1.4,
          }}
        >
          {INVITATION.headline}
        </motion.p>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mb-8"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.15rem",
            fontStyle: "italic",
            color: "var(--brown)",
          }}
        >
          {INVITATION.subline}
        </motion.p>

        {/* Ornamental line */}
        <div className="flex items-center gap-2 mb-7" aria-hidden="true">
          <div className="h-px flex-1" style={{ background: "var(--brown)", opacity: 0.4 }} />
          <span style={{ color: "var(--antique-red)", fontSize: "8px", opacity: 0.7 }}>✦</span>
          <div className="h-px flex-1" style={{ background: "var(--brown)", opacity: 0.4 }} />
        </div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpen}
          className="w-full py-3.5 px-8 tracking-wide transition-all duration-300"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.05rem",
            fontWeight: 500,
            letterSpacing: "0.06em",
            background: "var(--burgundy)",
            color: "var(--ivory)",
            border: "1.5px solid var(--antique-red)",
            borderRadius: "1px",
            boxShadow: "0 2px 16px rgba(81,25,31,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
            cursor: "pointer",
          }}
          aria-label="Open your birthday letter"
        >
          {INVITATION.button}
        </motion.button>
      </motion.div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-0 right-0 text-center z-10"
        style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: "0.85rem",
          color: "var(--brown)",
          letterSpacing: "0.04em",
        }}
      >
        {INVITATION.footer}
      </motion.p>
    </motion.section>
  );
}
