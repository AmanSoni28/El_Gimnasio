"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { lenisRef } from "@/lib/scroll";
import { introPhase, useStore } from "@/lib/store";

/**
 * Single smooth-scroll engine (Lenis) driven by GSAP's ticker so Lenis and
 * ScrollTrigger share one RAF loop. Touch devices keep native scrolling.
 */
export default function SmoothScroll() {
  const phase = useStore(introPhase, "pending");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
    });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    if (introPhase.get() !== "done" && document.documentElement.dataset.intro === "play") lenis.stop();
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (phase === "done") {
      lenis?.start();
      // Keep GSAP's default lag smoothing while the intro plays (a hitch must
      // never skip the sequence); afterwards keep Lenis + ScrollTrigger in lockstep.
      gsap.ticker.lagSmoothing(0);
      // Layout is final once the intro is gone and fonts are in.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    } else if (phase === "intro") {
      lenis?.stop();
    }
  }, [phase]);

  return null;
}
