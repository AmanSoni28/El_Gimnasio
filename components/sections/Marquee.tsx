"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const WORDS = ["Fuerza", "Strength", "Disciplina", "Discipline", "Excelencia", "Excellence"];

/**
 * Motion language: kinetic. An endless band of the gym's three values that
 * accelerates, reverses and leans with your scroll velocity, then eases back.
 */
export default function Marquee() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const loop = gsap.to("[data-track]", { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
        const skew = gsap.quickTo("[data-track]", "skewX", { duration: 0.6, ease: "power3" });
        let dir = 1;
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = self.getVelocity();
            if (v) dir = v > 0 ? 1 : -1;
            gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(v) / 250, 6)), duration: 0.2, overwrite: true });
            skew(gsap.utils.clamp(-8, 8, v / -300));
          },
        });
        // Settle back to a slow drift (keeping the last direction) once scrolling stops.
        const settle = () => {
          gsap.to(loop, { timeScale: dir, duration: 1.2, ease: "power3.out", overwrite: true });
          skew(0);
        };
        ScrollTrigger.addEventListener("scrollEnd", settle);
        return () => {
          st.kill();
          ScrollTrigger.removeEventListener("scrollEnd", settle);
        };
      });
    },
    { scope: root },
  );

  const row = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {WORDS.map((w, i) => (
        <span key={w} className="flex items-center">
          <span
            className={`px-6 font-serif text-[clamp(2.4rem,6vw,5.5rem)] font-medium uppercase leading-none sm:px-10 ${
              i % 2 ? "text-outline italic" : "text-bone"
            }`}
          >
            {w}
          </span>
          <span className="text-[clamp(1rem,2vw,1.6rem)] text-gold">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div ref={root} className="relative overflow-hidden border-y border-gold/15 bg-ink py-7 sm:py-10">
      <div data-track className="flex w-max will-change-transform">
        {row(false)}
        {row(true)}
      </div>
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent sm:w-48" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent sm:w-48" />
    </div>
  );
}
