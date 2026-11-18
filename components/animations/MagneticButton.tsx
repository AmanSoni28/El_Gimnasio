"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Variant = "gold" | "ghost" | "dark";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: Variant;
  className?: string;
  strength?: number;
  arrow?: boolean;
  cursor?: string;
  ariaLabel?: string;
  external?: boolean;
};

const base =
  "group relative inline-flex select-none items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-4 label text-[0.68rem] transition-colors duration-500 sm:px-8";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-ink hover:text-ink",
  ghost: "border border-bone/25 text-bone hover:border-gold/70 hover:text-gold-bright",
  dark: "bg-ink text-bone border border-gold/40 hover:border-gold",
};

/**
 * Magnetic CTA: follows the mouse a little inside its hit area (Framer
 * Motion springs). On touch it behaves like a normal button.
 */
export default function MagneticButton({
  children,
  onClick,
  href,
  variant = "gold",
  className = "",
  strength = 0.3,
  arrow = true,
  cursor,
  ariaLabel,
  external,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  const ix = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const mx = e.clientX - (r.left + r.width / 2);
    const my = e.clientY - (r.top + r.height / 2);
    x.set(mx * strength);
    y.set(my * strength);
    ix.set(mx * strength * 0.35);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
    ix.set(0);
  };

  const inner = (
    <>
      {variant === "gold" && (
        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,#f5c451,#d4af37_55%,#b8902a)]" />
      )}
      {variant === "gold" && (
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_20%,rgba(255,246,214,0.75)_50%,transparent_80%)] transition-transform duration-[900ms] ease-lux group-hover:translate-x-full"
        />
      )}
      <motion.span style={{ x: ix }} className="relative z-10 flex items-center gap-3">
        {children}
        {arrow && (
          <span className="relative block h-3 w-5 overflow-hidden" aria-hidden>
            <svg viewBox="0 0 20 12" className="absolute inset-0 h-3 w-5 transition-transform duration-500 ease-lux group-hover:translate-x-[120%]">
              <path d="M0 6h18M13 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <svg viewBox="0 0 20 12" className="absolute inset-0 h-3 w-5 translate-x-[-120%] transition-transform duration-500 ease-lux group-hover:translate-x-0">
              <path d="M0 6h18M13 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
        )}
      </motion.span>
    </>
  );

  const common = {
    onPointerMove: onMove,
    onPointerLeave: reset,
    style: { x: sx, y: sy },
    whileTap: { scale: 0.96 },
    className: `${base} ${variants[variant]} ${className}`,
    "data-cursor": cursor,
    "aria-label": ariaLabel,
  };

  if (href) {
    return (
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...common}
      >
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.button ref={ref as React.Ref<HTMLButtonElement>} type="button" onClick={onClick} {...common}>
      {inner}
    </motion.button>
  );
}
