"use client";

import { useEffect, useRef } from "react";

type HeroTypewriterProps = {
  /** Single phrase to type out (e.g. hero highlight). */
  text: string;
  /** Optional extra strings to cycle after the first (loop). */
  extraStrings?: string[];
  /** Typing speed in ms per character. */
  typeSpeed?: number;
  /** Delay before starting in ms. */
  startDelay?: number;
  className?: string;
};

// Typed.js instance has .destroy()
interface TypedInstance {
  destroy: () => void;
}

export function HeroTypewriter({
  text,
  extraStrings = [],
  typeSpeed = 52,
  startDelay = 400,
  className = "",
}: HeroTypewriterProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const typedRef = useRef<TypedInstance | null>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el || typeof window === "undefined") return;

    const strings = [text, ...extraStrings];
    const timer = window.setTimeout(() => {
      import("typed.js").then(({ default: Typed }) => {
        typedRef.current = new Typed(el, {
          strings,
          typeSpeed,
          backSpeed: 28,
          backDelay: 1200,
          startDelay: 0,
          loop: extraStrings.length > 0,
          showCursor: true,
          cursorChar: "|",
          autoInsertCss: true,
        }) as TypedInstance;
      });
    }, startDelay);

    return () => {
      window.clearTimeout(timer);
      typedRef.current?.destroy();
      typedRef.current = null;
    };
  }, [text, typeSpeed, startDelay, extraStrings.length, extraStrings]);

  return <span ref={spanRef} className={className} aria-live="polite" />;
}
