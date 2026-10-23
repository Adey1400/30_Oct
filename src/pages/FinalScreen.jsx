import React, { useState } from "react";
import { motion } from "framer-motion";
import { FINAL, QUOTES } from "../config/content";
import TypewriterText from "../components/TypewriterText";
import QuoteCard from "../components/QuoteCard";
import FloatingPetals from "../components/FloatingPetals";
import { RoseFull, RoseCorner } from "../components/RoseSVG";
import ChibiSticker from "../components/ChibiSticker";

export default function FinalScreen({ onRestart }) {
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [typewriterDone, setTypewriterDone] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      onViewportEnter={() => setTimeout(() => setShowTypewriter(true), 600)}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-16 px-6 paper-grain safe-bottom"
      style={{
        background: "var(--parchment)",
        border: "none",
      }}
    >
      {/* Floating petals (slower, fewer) */}
      <FloatingPetals count={5} />

      {/* Corner roses */}
      <div className="absolute top-0 left-0 pointer-events-none z-10">
        <RoseCorner size={70} />
      </div>
      <div className="absolute top-0 right-0 pointer-events-none z-10">
        <RoseCorner size={70} flip />
      </div>
      <div
        className="absolute bottom-0 left-0 pointer-events-none z-10"
        style={{ transform: "scaleY(-1)" }}
      >
        <RoseCorner size={64} />
      </div>
      <div
        className="absolute bottom-0 right-0 pointer-events-none z-10"
        style={{ transform: "scale(-1,-1)" }}
      >
        <RoseCorner size={64} />
      </div>

      {/* Burgundy border frame */}
      <div
        className="absolute inset-4 pointer-events-none z-10"
        style={{
          border: "1.5px solid var(--burgundy)",
          borderRadius: "2px",
          opacity: 0.3,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-6 pointer-events-none z-10"
        style={{
          border: "0.5px solid var(--brown)",
          borderRadius: "1px",
          opacity: 0.2,
        }}
        aria-hidden="true"
      />

      {/* Third quote */}
      <div className="relative z-20 w-full max-w-sm">
        <QuoteCard quote={QUOTES[2]} index={2} />
      </div>

      {/* Rose illustration */}
      <motion.div
        className="relative z-20 flex justify-center mt-4 mb-6"
        animate={{ rotate: [0, 3, -3, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      >
        <RoseFull size={100} />
      </motion.div>

      {/* Happy Birthday heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="relative z-20 text-center mb-6"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(1.8rem, 8vw, 2.4rem)",
          color: "var(--burgundy)",
          fontStyle: "italic",
          fontWeight: 700,
          textShadow: "0 2px 12px rgba(81,25,31,0.15)",
          lineHeight: 1.3,
        }}
      >
        {FINAL.heading}
      </motion.h1>

      {/* Typewriter wish */}
      <motion.div
        className="relative z-20 mx-auto max-w-sm px-2 text-center mb-6"
        initial={{ opacity: 0 }}
        animate={showTypewriter ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        {showTypewriter && (
          <TypewriterText
            text={FINAL.typewriter}
            speed={30}
            onComplete={() => setTypewriterDone(true)}
            className="text-center"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.05rem",
              lineHeight: 1.85,
              color: "var(--sepia)",
              fontStyle: "italic",
            }}
          />
        )}
      </motion.div>

      {/* Ornamental divider */}
      <div className="relative z-20 flex items-center gap-3 w-full max-w-xs my-4" aria-hidden="true">
        <div className="h-px flex-1" style={{ background: "var(--brown)", opacity: 0.5 }} />
        <span style={{ color: "var(--antique-red)", fontSize: "10px" }}>✦</span>
        <div className="h-px flex-1" style={{ background: "var(--brown)", opacity: 0.5 }} />
      </div>

      {/* Sign-off */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={typewriterDone ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-20 text-center mb-6"
        style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: "1.1rem",
          color: "var(--brown)",
          fontStyle: "italic",
        }}
      >
        {FINAL.signoff}
      </motion.p>

      {/* Chibi 6: girl sleeping while hugging a pillow — last cute visual detail */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={typewriterDone ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="relative z-20 flex justify-center mb-8"
      >
        <ChibiSticker
          src="/images/chibi-6.jpg"
          alt="girl sleeping while hugging a pillow"
          width={130}
          rotate={-2}
          delay={0}
        />
      </motion.div>

      {/* Restart button */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={typewriterDone ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRestart}
        className="relative z-20 px-8 py-3.5 tracking-wide transition-all duration-300"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "1rem",
          fontWeight: 500,
          letterSpacing: "0.06em",
          background: "transparent",
          color: "var(--burgundy)",
          border: "1.5px solid var(--antique-red)",
          borderRadius: "1px",
          boxShadow: "0 2px 12px rgba(81,25,31,0.12)",
          cursor: "pointer",
        }}
        aria-label="Read the letter from the beginning"
      >
        {FINAL.button}
      </motion.button>
    </motion.section>
  );
}
