import React, { useEffect, useState } from "react";

// A single floating petal (SVG rose petal shape)
const PetalSVG = ({ style, color = "#C58D8B" }) => (
  <svg
    viewBox="0 0 30 40"
    style={style}
    className="pointer-events-none select-none absolute"
    aria-hidden="true"
  >
    <ellipse cx="15" cy="20" rx="12" ry="18" fill={color} opacity="0.5" />
    <ellipse
      cx="15"
      cy="18"
      rx="8"
      ry="14"
      fill={color}
      opacity="0.3"
      transform="rotate(-10,15,18)"
    />
  </svg>
);

const COLORS = ["#C58D8B", "#B49A7C", "#7B2027", "#D4A5A3"];

export default function FloatingPetals({ count = 8 }) {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 90 + 2}%`,
      size: Math.random() * 18 + 10,
      duration: Math.random() * 14 + 12,
      delay: Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      swayDuration: Math.random() * 4 + 3,
    }));
    setPetals(generated);
  }, [count]);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {petals.map((p) => (
        <PetalSVG
          key={p.id}
          color={p.color}
          style={{
            left: p.left,
            top: "-60px",
            width: p.size,
            height: p.size * 1.4,
            animation: `floatDown ${p.duration}s ${p.delay}s linear infinite,
                        sway ${p.swayDuration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
