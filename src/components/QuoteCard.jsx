import React from "react";
import { motion } from "framer-motion";
import { RoseBud } from "./RoseSVG";

export default function QuoteCard({ quote, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
      className="relative mx-auto my-10 max-w-sm px-6 py-7 text-center paper-grain"
      style={{
        background: "var(--parchment)",
        border: "1.5px solid var(--antique-red)",
        borderRadius: "2px",
        boxShadow: "0 4px 24px rgba(81,25,31,0.10), inset 0 0 30px rgba(180,154,124,0.12)",
      }}
    >
      {/* Corner ornaments */}
      <span
        className="absolute top-2 left-2 text-xs"
        style={{ color: "var(--antique-red)", opacity: 0.6 }}
        aria-hidden="true"
      >
        ✦
      </span>
      <span
        className="absolute top-2 right-2 text-xs"
        style={{ color: "var(--antique-red)", opacity: 0.6 }}
        aria-hidden="true"
      >
        ✦
      </span>
      <span
        className="absolute bottom-2 left-2 text-xs"
        style={{ color: "var(--antique-red)", opacity: 0.6 }}
        aria-hidden="true"
      >
        ✦
      </span>
      <span
        className="absolute bottom-2 right-2 text-xs"
        style={{ color: "var(--antique-red)", opacity: 0.6 }}
        aria-hidden="true"
      >
        ✦
      </span>

      {/* Rose bud */}
      <div className="flex justify-center mb-3">
        <RoseBud size={30} />
      </div>

      {/* Open quote */}
      <span
        className="block text-5xl leading-none mb-2 font-serif"
        style={{ color: "var(--antique-red)", opacity: 0.35, fontFamily: "Georgia, serif" }}
        aria-hidden="true"
      >
        "
      </span>

      <p
        className="italic leading-relaxed"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "1.05rem",
          color: "var(--sepia)",
          fontWeight: 400,
        }}
      >
        {quote}
      </p>

      {/* Close quote */}
      <span
        className="block text-5xl leading-none mt-2 font-serif"
        style={{ color: "var(--antique-red)", opacity: 0.35, fontFamily: "Georgia, serif" }}
        aria-hidden="true"
      >
        "
      </span>
    </motion.div>
  );
}
