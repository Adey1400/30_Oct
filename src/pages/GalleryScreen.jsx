import React from "react";
import { motion } from "framer-motion";
import { PHOTOS, QUOTES } from "../config/content";
import { PhotoFrame } from "../components/PhotoFrame";
import QuoteCard from "../components/QuoteCard";
import { FlowerDivider, RoseBud } from "../components/RoseSVG";

// Alternate tilt values per photo index
const TILTS = [-2, 1.8, -1.5, 2.2];

// Decorative rose bud beside a frame — inside the card flow so no clipping
function SideBud({ side = "left" }) {
  return (
    <div
      className="flex items-center"
      style={{
        justifyContent: side === "left" ? "flex-start" : "flex-end",
        paddingLeft: side === "left" ? "4px" : 0,
        paddingRight: side === "right" ? "4px" : 0,
        marginBottom: "-6px",
        position: "relative",
        zIndex: 2,
      }}
      aria-hidden="true"
    >
      <RoseBud size={28} style={{ opacity: 0.75, transform: side === "right" ? "scaleX(-1)" : "none" }} />
    </div>
  );
}

// A single memory card: side bud → polaroid → dots
function MemoryCard({ photo, index }) {
  const alignRight = index % 2 === 1;
  const tilt = TILTS[index % TILTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
      className="mx-auto mb-12"
      style={{ maxWidth: "300px", width: "100%" }}
    >
      {/* Floral bud — above frame on alternating sides */}
      <SideBud side={alignRight ? "right" : "left"} />

      {/* Polaroid — tilt applied here ONCE via the rotate prop */}
      <PhotoFrame photo={photo} index={index} rotate={tilt} />

      {/* Decorative dots below */}
      <div className="flex justify-center mt-3" aria-hidden="true">
        <span
          style={{
            color: "var(--rose-pink)",
            fontSize: "9px",
            letterSpacing: "0.5em",
            opacity: 0.7,
          }}
        >
          · · ·
        </span>
      </div>
    </motion.div>
  );
}

export default function GalleryScreen() {
  return (
    <section
      className="relative py-12 paper-grain"
      style={{ background: "var(--ivory)", minHeight: "100vh" }}
    >
      {/* ── Section header ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10 px-6"
      >
        <p
          style={{
            fontFamily: "'Dancing Script', cursive",
            color: "var(--brown)",
            fontSize: "0.85rem",
            letterSpacing: "0.1em",
          }}
        >
          — little pieces of time —
        </p>
        <h2
          className="mt-1"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.55rem",
            color: "var(--sepia)",
            fontStyle: "italic",
          }}
        >
          Photographs
        </h2>
        <div className="flex justify-center mt-2" aria-hidden="true">
          <span
            style={{
              color: "var(--antique-red)",
              fontSize: "9px",
              letterSpacing: "0.3em",
              opacity: 0.7,
            }}
          >
            ✦ ✦ ✦
          </span>
        </div>
      </motion.div>

      {/* Horizontal padding wraps everything */}
      <div className="px-8">
        {/* Quote 1 */}
        <QuoteCard quote={QUOTES[0]} index={0} />

        {/* Photos 1 & 2 */}
        {[0, 1].map((i) => (
          <MemoryCard key={PHOTOS[i].id} photo={PHOTOS[i]} index={i} />
        ))}

        {/* Floral divider */}
        <FlowerDivider className="my-8 max-w-xs mx-auto" />

        {/* Quote 2 */}
        <QuoteCard quote={QUOTES[1]} index={1} />

        {/* Photos 3 & 4 */}
        {[2, 3].map((i) => (
          <MemoryCard key={PHOTOS[i].id} photo={PHOTOS[i]} index={i} />
        ))}

        {/* Bottom floral divider */}
        <FlowerDivider className="mt-6 max-w-xs mx-auto" />
      </div>
    </section>
  );
}
