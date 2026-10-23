import React from "react";
import { motion } from "framer-motion";

/**
 * Antique Scrapbook Chibi Sticker Component
 * Preserves chibi proportions with object-fit: contain.
 * Styled with a delicate antique ivory/parchment border, soft paper drop shadow,
 * subtle washi-tape accent, and handwriting caption.
 */
export default function ChibiSticker({
  src,
  alt,
  caption,
  width = 130,
  maxWidth,
  rotate = 0,
  tape = true,
  tapeColor = "rgba(224, 208, 185, 0.78)",
  className = "",
  style = {},
  delay = 0.2,
  priority = false,
  onClick,
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        maxWidth: maxWidth || "100%",
        transform: `rotate(${rotate}deg)`,
        background: "#FAF4EB",
        padding: "6px 6px 7px 6px",
        borderRadius: "6px",
        border: "1.5px solid rgba(180, 154, 124, 0.45)",
        boxShadow:
          "0 4px 16px rgba(81, 25, 31, 0.12), 0 1.5px 4px rgba(0, 0, 0, 0.08), inset 0 0 12px rgba(180, 154, 124, 0.1)",
        zIndex: 2,
        ...style,
      }}
    >
      {/* Decorative Washi Tape Strip */}
      {tape && (
        <span
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "38px",
            height: "11px",
            background: tapeColor,
            border: "0.5px solid rgba(180, 154, 124, 0.35)",
            borderRadius: "1px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            transform: "rotate(-1.5deg)",
            zIndex: 4,
          }}
          aria-hidden="true"
        />
      )}

      {/* Image with strict object-fit: contain to preserve original proportions */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          borderRadius: "4px",
          background: "#F7F0E4",
        }}
      >
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            objectFit: "contain",
          }}
        />
      </div>
    </motion.figure>
  );
}
