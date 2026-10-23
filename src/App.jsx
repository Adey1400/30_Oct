import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import InvitationScreen from "./pages/InvitationScreen";
import LetterScreen from "./pages/LetterScreen";
import GlobeScreen from "./pages/GlobeScreen";
import GalleryScreen from "./pages/GalleryScreen";
import FinalScreen from "./pages/FinalScreen";
import "./index.css";

/*
  Screens / flow:
    0 → invitation (opening card)
    1 → letter     (envelope + typewriter)
    2 → globe      (interactive world + discoveries)
    3 → gallery    (scrapbook photos)
    4 → final      (birthday closing)
*/

export default function App() {
  const [screen, setScreen] = useState(0);
  const topRef = useRef(null);

  // Scroll to top whenever screen changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen]);

  const goTo = (s) => setScreen(s);
  const restart = () => {
    setScreen(0);
  };

  return (
    /*
      Desktop: centres the mobile-width experience in the viewport
      Mobile:  fills the full screen width
    */
    <div
      ref={topRef}
      className="relative min-h-screen w-full"
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        background: "var(--ivory)",
        boxShadow: "0 0 80px rgba(81,25,31,0.08)",
      }}
    >
      <AnimatePresence mode="wait">
        {screen === 0 && (
          <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <InvitationScreen onOpen={() => goTo(1)} />
          </motion.div>
        )}

        {screen === 1 && (
          <motion.div key="letter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LetterScreen />
            {/* Scroll-progress indicator → take reader to globe */}
            <ScrollCTA label="Explore the world ↓" onClick={() => goTo(2)} />
          </motion.div>
        )}

        {screen === 2 && (
          <motion.div key="globe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlobeScreen />
            <ScrollCTA label="See the photographs ↓" onClick={() => goTo(3)} />
          </motion.div>
        )}

        {screen === 3 && (
          <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GalleryScreen />
            <ScrollCTA label="Continue ↓" onClick={() => goTo(4)} />
          </motion.div>
        )}

        {screen === 4 && (
          <motion.div key="final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FinalScreen onRestart={restart} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky progress dots (top navigation) */}
      {screen > 0 && (
        <nav
          className="fixed top-4 left-1/2 -translate-x-1/2 flex gap-2 z-50"
          aria-label="Navigation progress"
        >
          {[1, 2, 3, 4].map((s) => (
            <button
              key={s}
              onClick={() => goTo(s)}
              className="rounded-full transition-all duration-300"
              style={{
                width: screen === s ? "24px" : "8px",
                height: "8px",
                background: screen === s ? "var(--antique-red)" : "var(--brown)",
                opacity: screen === s ? 1 : 0.4,
                border: "none",
                cursor: "pointer",
              }}
              aria-label={`Go to section ${s}`}
              aria-current={screen === s ? "page" : undefined}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

// ── Gentle "continue" prompt ────────────────────────────────
function ScrollCTA({ label, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="flex justify-center pb-10 pt-4"
    >
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1 group"
        style={{ background: "none", border: "none", cursor: "pointer" }}
        aria-label={label}
      >
        <span
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: "0.9rem",
            color: "var(--brown)",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </span>
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          style={{ color: "var(--antique-red)", fontSize: "1.2rem", lineHeight: 1 }}
          aria-hidden="true"
        >
          ↓
        </motion.span>
      </button>
    </motion.div>
  );
}
