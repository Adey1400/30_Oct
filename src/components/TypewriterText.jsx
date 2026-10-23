import React, { useEffect, useRef, useState } from "react";

/**
 * TypewriterText
 * Props:
 *  - text        : string  — full text to type out
 *  - speed       : number  — ms per character (default 28)
 *  - onComplete  : fn      — called when finished
 *  - className   : string
 */
export default function TypewriterText({
  text = "",
  speed = 28,
  onComplete,
  className = "",
  style = {},
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const finish = () => {
    clearInterval(timerRef.current);
    setDisplayed(text);
    setDone(true);
    onComplete?.();
  };

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    setDone(false);

    timerRef.current = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(timerRef.current);
        setDone(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timerRef.current);
  }, [text, speed]);

  // Tap / click to skip
  const handleSkip = () => {
    if (!done) finish();
  };

  // Render paragraphs preserving newlines
  const paragraphs = displayed.split("\n\n");

  return (
    <div
      ref={containerRef}
      className={`cursor-pointer select-none ${className}`}
      style={style}
      onClick={handleSkip}
      title={done ? "" : "Tap to reveal instantly"}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleSkip()}
      aria-label="Letter text — tap to reveal instantly"
    >
      {paragraphs.map((para, i) => (
        <p key={i} className="mb-4 last:mb-0 whitespace-pre-wrap">
          {para}
          {i === paragraphs.length - 1 && !done && (
            <span className="cursor-blink" aria-hidden="true" />
          )}
        </p>
      ))}
      {!done && (
        <p className="mt-4 text-xs italic opacity-50" style={{ color: "var(--brown)" }}>
          tap anywhere to reveal instantly
        </p>
      )}
    </div>
  );
}
