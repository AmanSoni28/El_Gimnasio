"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";

/**
 * Desktop-only premium cursor: a precise dot + a lagging gold ring that
 * grows over interactive elements and can show a short label
 * (`data-cursor="Play"`). Never rendered on touch devices.
 */
export default function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.42, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.42, ease: "power3" });
    let shown = false;
    let current: Element | null = null;

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!shown) {
        shown = true;
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY });
        gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);

      const target = (e.target as Element | null)?.closest?.("a, button, [data-cursor], input, textarea, select, label") ?? null;
      if (target === current) return;
      current = target;
      const text = target?.getAttribute("data-cursor") ?? "";
      const isField = target?.matches("input, textarea, select");
      if (label.current) label.current.textContent = text;
      gsap.to(ring.current, {
        scale: target ? (text ? 2.6 : isField ? 0.6 : 1.7) : 1,
        backgroundColor: text ? "rgba(212,175,55,0.92)" : target ? "rgba(212,175,55,0.08)" : "rgba(212,175,55,0)",
        borderColor: text ? "rgba(212,175,55,0)" : "rgba(212,175,55,0.65)",
        duration: 0.45,
        ease: "expo.out",
      });
      gsap.to(dot.current, { scale: target ? 0 : 1, duration: 0.3 });
      gsap.to(label.current, { autoAlpha: text ? 1 : 0, duration: 0.2 });
    };
    const leave = () => {
      shown = false;
      gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.3 });
    };
    const down = () => gsap.to(ring.current, { scale: "-=0.25", duration: 0.15 });
    const up = () => gsap.to(ring.current, { scale: "+=0.25", duration: 0.25 });

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]">
      <div
        ref={ring}
        className="invisible absolute left-0 top-0 -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full border border-gold/65"
      >
        <span ref={label} className="invisible font-sans text-[0.32rem] font-bold uppercase tracking-[0.2em] text-ink" />
      </div>
      <div ref={dot} className="invisible absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-gold-bright" />
    </div>
  );
}
