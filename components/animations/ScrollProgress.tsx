"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { introPhase, sectionMeta, useStore } from "@/lib/store";

/** Thin gold scroll-progress line + a desktop "02 / 09 — Nosotros" section indicator. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const meta = useStore(sectionMeta);
  const phase = useStore(introPhase, "pending");

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX }}
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[linear-gradient(90deg,#a8822a,#f5c451)]"
      />
      <div
        aria-hidden
        className={`pointer-events-none fixed bottom-8 left-[var(--gutter)] z-30 hidden items-center gap-4 transition-opacity duration-700 xl:flex ${
          phase === "done" && meta.index > 1 ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="relative block h-5 w-7 overflow-hidden font-display text-lg leading-5 text-gold">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={meta.index}
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {String(meta.index).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="relative block h-px w-14 bg-bone/15">
          <span
            className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-700 ease-lux"
            style={{ width: `${(meta.index / meta.total) * 100}%` }}
          />
        </span>
        <span className="font-display text-lg leading-none text-bone/40">{String(meta.total).padStart(2, "0")}</span>
        <span className="label text-[0.58rem] text-bone/60">{meta.title}</span>
      </div>
    </>
  );
}
