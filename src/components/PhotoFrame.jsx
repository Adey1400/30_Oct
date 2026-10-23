import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

// ── Lightbox ───────────────────────────────────────────────
function Lightbox({ photo, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(20,6,8,0.93)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          style={{
            maxWidth: "88vw",
            maxHeight: "75vh",
            objectFit: "contain",
            borderRadius: "2px",
            boxShadow: "0 12px 60px rgba(0,0,0,0.7)",
            display: "block",
          }}
        />
        <p
          className="mt-4 text-center italic"
          style={{
            fontFamily: "'Dancing Script', cursive",
            color: "#E8D7BD",
            fontSize: "1rem",
            letterSpacing: "0.03em",
          }}
        >
          {photo.caption}
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 rounded-full flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            background: "var(--burgundy)",
            color: "var(--ivory)",
            border: "1.5px solid var(--antique-red)",
            cursor: "pointer",
          }}
          aria-label="Close photo"
        >
          <X size={15} />
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Placeholder — reddish-brown bg, ivory text ─────────────
function PhotoPlaceholder({ number }) {
  return (
    <div
      className="w-full flex flex-col items-center justify-center gap-3 px-4"
      style={{
        // Deep reddish-brown gradient matching the antique rose palette
        background: "linear-gradient(145deg, #6B2126 0%, #7B2027 45%, #51191F 100%)",
        aspectRatio: "4 / 3",
      }}
    >
      {/* Camera icon — ivory on dark red */}
      <svg
        viewBox="0 0 24 24"
        width="38"
        height="38"
        fill="none"
        stroke="#F7F0E4"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.55 }}
      >
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>

      <p
        style={{
          fontFamily: "'Dancing Script', cursive",
          color: "#F7F0E4",
          fontSize: "1rem",
          opacity: 0.75,
        }}
      >
        photo {number}
      </p>

      <p
        className="text-center"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: "#E8D7BD",
          fontSize: "0.7rem",
          lineHeight: 1.7,
          opacity: 0.55,
        }}
      >
        Add your image at
        <br />
        <code
          style={{
            fontFamily: "monospace",
            fontSize: "0.65rem",
            background: "rgba(247,240,228,0.12)",
            padding: "1px 5px",
            borderRadius: "2px",
          }}
        >
          /public/photos/photo{number}.jpeg
        </code>
      </p>
    </div>
  );
}

// ── Polaroid Frame ─────────────────────────────────────────
export function PhotoFrame({ photo, index, rotate = 0 }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.75, ease: "easeOut", delay: index * 0.1 }}
        whileHover={{ scale: 1.025, rotate: 0 }}
        className="relative cursor-pointer group"
        style={{ rotate: `${rotate}deg` }}
        onClick={() => !hasError && setLightboxOpen(true)}
        aria-label={`View photo: ${photo.caption}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          e.key === "Enter" && !hasError && setLightboxOpen(true)
        }
      >
        {/* Polaroid white shell */}
        <div
          className="relative overflow-visible paper-grain"
          style={{
            background: "#FDFAF3",
            padding: "10px 10px 44px 10px",
            boxShadow: [
              "0 4px 6px rgba(0,0,0,0.10)",
              "0 10px 28px rgba(81,25,31,0.16)",
              "inset 0 0 24px rgba(180,154,124,0.06)",
            ].join(", "),
            border: "1px solid rgba(180,154,124,0.25)",
          }}
        >
          {/* ── Photo area ─────────────────────────────── */}
          <div
            className="relative overflow-hidden"
            style={{
              width: "100%",
              aspectRatio: "4 / 3",
              background: "#7B2027", // reddish-brown visible before image loads
            }}
          >
            {!hasError ? (
              <>
                <img
                  src={photo.src}
                  alt={photo.alt}
                  onError={() => setHasError(true)}
                  onLoad={() => setImgLoaded(true)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block",
                    filter: "sepia(0.04) contrast(1.02) brightness(1.01)",
                    opacity: imgLoaded ? 1 : 0,
                    transition: "opacity 0.5s ease",
                  }}
                />

                {/* Loading skeleton */}
                {!imgLoaded && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(145deg, #6B2126 0%, #7B2027 45%, #51191F 100%)",
                    }}
                  >
                    <span
                      style={{
                        color: "#F7F0E4",
                        fontSize: "0.65rem",
                        opacity: 0.45,
                        fontFamily: "Georgia,serif",
                        letterSpacing: "0.06em",
                      }}
                    >
                      ♡
                    </span>
                  </div>
                )}

                {/* Hover zoom overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{ background: "rgba(81,25,31,0.22)" }}
                  aria-hidden="true"
                >
                  <ZoomIn size={30} color="rgba(247,240,228,0.92)" />
                </div>
              </>
            ) : (
              <PhotoPlaceholder number={photo.id} />
            )}
          </div>

          {/* ── Handwritten caption ────────────────────── */}
          <p
            className="absolute bottom-0 left-0 right-0 text-center"
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: "0.88rem",
              color: "var(--sepia)",
              letterSpacing: "0.02em",
              lineHeight: 1,
              paddingBottom: "12px",
              paddingTop: "6px",
            }}
          >
            {photo.caption}
          </p>

          {/* ── Corner bracket ornaments ─────────────── */}
          {[
            { top: 4, left: 4 },
            { top: 4, right: 4 },
            { bottom: 48, left: 4 },
            { bottom: 48, right: 4 },
          ].map((pos, i) => (
            <svg
              key={i}
              viewBox="0 0 12 12"
              width="10"
              height="10"
              className="absolute"
              style={{ ...pos, opacity: 0.35 }}
              aria-hidden="true"
            >
              <path
                d={
                  i === 0
                    ? "M1 6 L1 1 L6 1"
                    : i === 1
                    ? "M6 1 L11 1 L11 6"
                    : i === 2
                    ? "M1 6 L1 11 L6 11"
                    : "M6 11 L11 11 L11 6"
                }
                fill="none"
                stroke="var(--brown)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          ))}
        </div>
      </motion.div>

      {lightboxOpen && (
        <Lightbox photo={photo} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
