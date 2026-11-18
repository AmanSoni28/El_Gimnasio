"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

type Props = {
  src: string;
  poster: string;
  className?: string;
  /** Extra gate (e.g. only the active program card plays). */
  active?: boolean;
  /** Load immediately (hero). */
  eager?: boolean;
  /** Visible fraction required before playback starts. */
  threshold?: number;
  label?: string;
};

/**
 * Muted, looping, inline video that:
 *  - doesn't fetch the file until it's near the viewport,
 *  - plays only while visible (and `active`),
 *  - pauses as soon as it leaves the screen,
 *  - stays on its poster for reduced-motion users.
 */
export default function LazyVideo({ src, poster, className = "", active = true, eager = false, threshold = 0.25, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(eager);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nearIO = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          nearIO.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    const visIO = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold });
    if (!eager) nearIO.observe(el);
    visIO.observe(el);
    return () => {
      nearIO.disconnect();
      visIO.disconnect();
    };
  }, [eager, threshold]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !near) return;
    if (visible && active && !reduced && document.visibilityState !== "hidden") {
      const p = el.play();
      if (p) p.catch(() => {});
    } else {
      el.pause();
    }
  }, [near, visible, active, reduced]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      src={near ? src : undefined}
      muted
      loop
      playsInline
      preload={near ? (eager ? "auto" : "metadata") : "none"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      disablePictureInPicture
    />
  );
}
