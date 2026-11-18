"use client";

import type Lenis from "lenis";

export const lenisRef: { current: Lenis | null } = { current: null };

/** Smoothly scroll to a section id, through Lenis when available. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = lenisRef.current;
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
}
