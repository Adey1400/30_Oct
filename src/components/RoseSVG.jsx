import React from "react";

// ── Full botanical rose ────────────────────────────────────
export function RoseFull({ className = "", size = 120, ...props }) {
  return (
    <svg
      viewBox="0 0 120 150"
      width={size}
      height={size * 1.25}
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Stem */}
      <path d="M60 148 Q56 120 54 100 Q52 80 58 65" stroke="#5C7A3E" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Leaves */}
      <path d="M56 110 Q40 105 38 92 Q50 94 56 110Z" fill="#6A8A4A" opacity="0.85"/>
      <path d="M58 98 Q74 90 76 78 Q64 82 58 98Z" fill="#5C7A3E" opacity="0.75"/>
      {/* Outer petals */}
      <ellipse cx="60" cy="55" rx="22" ry="28" fill="#8B2328" opacity="0.75" transform="rotate(-15,60,55)"/>
      <ellipse cx="60" cy="55" rx="22" ry="28" fill="#8B2328" opacity="0.75" transform="rotate(15,60,55)"/>
      <ellipse cx="60" cy="55" rx="20" ry="26" fill="#9B2B30" opacity="0.7" transform="rotate(-45,60,55)"/>
      <ellipse cx="60" cy="55" rx="20" ry="26" fill="#9B2B30" opacity="0.7" transform="rotate(45,60,55)"/>
      {/* Mid petals */}
      <ellipse cx="60" cy="52" rx="17" ry="22" fill="#A52D33" opacity="0.85"/>
      <ellipse cx="60" cy="52" rx="17" ry="22" fill="#A52D33" opacity="0.8" transform="rotate(30,60,52)"/>
      <ellipse cx="60" cy="52" rx="16" ry="20" fill="#B03038" opacity="0.85" transform="rotate(-30,60,52)"/>
      {/* Inner petals */}
      <ellipse cx="60" cy="50" rx="13" ry="17" fill="#7B2027" opacity="0.9"/>
      <ellipse cx="60" cy="50" rx="11" ry="15" fill="#7B2027" transform="rotate(60,60,50)" opacity="0.9"/>
      {/* Centre */}
      <ellipse cx="60" cy="46" rx="8" ry="9" fill="#51191F"/>
      <circle cx="60" cy="44" r="5" fill="#3D1015"/>
      {/* Highlights */}
      <ellipse cx="57" cy="41" rx="3" ry="4" fill="#C44050" opacity="0.4"/>
    </svg>
  );
}

// ── Small corner rose ─────────────────────────────────────
export function RoseCorner({ className = "", size = 60, flip = false, ...props }) {
  return (
    <svg
      viewBox="0 0 80 100"
      width={size}
      height={size * 1.25}
      className={className}
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : {}}
      {...props}
    >
      <path d="M40 98 Q38 78 36 62 Q34 46 40 34" stroke="#5C7A3E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M37 72 Q24 68 22 56 Q33 58 37 72Z" fill="#6A8A4A" opacity="0.8"/>
      <ellipse cx="40" cy="30" rx="16" ry="20" fill="#8B2328" opacity="0.7" transform="rotate(-10,40,30)"/>
      <ellipse cx="40" cy="30" rx="16" ry="20" fill="#8B2328" opacity="0.7" transform="rotate(10,40,30)"/>
      <ellipse cx="40" cy="28" rx="13" ry="17" fill="#A52D33" opacity="0.85"/>
      <ellipse cx="40" cy="26" rx="9" ry="12" fill="#7B2027" opacity="0.9"/>
      <circle cx="40" cy="23" r="5" fill="#51191F"/>
      <ellipse cx="38" cy="21" rx="2" ry="3" fill="#C44050" opacity="0.4"/>
    </svg>
  );
}

// ── Tiny rose bud ─────────────────────────────────────────
export function RoseBud({ className = "", size = 40, ...props }) {
  return (
    <svg
      viewBox="0 0 40 55"
      width={size}
      height={size * 1.375}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M20 54 Q19 42 18 30" stroke="#5C7A3E" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M19 38 Q11 35 10 27 Q18 29 19 38Z" fill="#6A8A4A" opacity="0.8"/>
      <ellipse cx="20" cy="23" rx="11" ry="15" fill="#8B2328" opacity="0.75" transform="rotate(-8,20,23)"/>
      <ellipse cx="20" cy="23" rx="11" ry="15" fill="#8B2328" opacity="0.75" transform="rotate(8,20,23)"/>
      <ellipse cx="20" cy="21" rx="8" ry="12" fill="#7B2027" opacity="0.9"/>
      <circle cx="20" cy="18" r="4" fill="#51191F"/>
    </svg>
  );
}

// ── Ornamental divider ─────────────────────────────────────
export function FlowerDivider({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, #B49A7C)" }} />
      <RoseBud size={28} />
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ color: "#B49A7C", fontSize: "8px" }}>✦</span>
        ))}
      </div>
      <RoseBud size={28} />
      <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, #B49A7C)" }} />
    </div>
  );
}
