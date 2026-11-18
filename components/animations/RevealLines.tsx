"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  stagger?: number;
  start?: string;
  delay?: number;
};

/**
 * Editorial masked line reveal: every line rises out of its own clip mask
 * with a slight skew when the block scrolls into view.
 */
export default function RevealLines({
  lines,
  as: Tag = "h2",
  className = "",
  lineClassName = "",
  stagger = 0.1,
  start = "top 82%",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(ref.current!.querySelectorAll("[data-line]"), {
          yPercent: 112,
          skewY: 4,
          duration: 1.25,
          ease: "expo.out",
          stagger,
          delay,
          scrollTrigger: { trigger: ref.current, start, once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="mask-line">
          <span data-line className={`inline-block origin-bottom-left will-change-transform ${lineClassName}`}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
