"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import MagneticButton from "@/components/animations/MagneticButton";
import { CONTACT, NAV } from "@/lib/content";
import { lenisRef, scrollToId } from "@/lib/scroll";
import { activeSection, introPhase, openJoin, useStore } from "@/lib/store";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Navbar() {
  const phase = useStore(introPhase, "pending");
  const active = useStore(activeSection, "home");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const shown = phase === "revealing" || phase === "done";

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > prev && y > 640 && !open);
  });

  // Freeze page scroll while the mobile menu is open.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // Let the menu close before scrolling on mobile.
    setTimeout(() => scrollToId(id), open ? 450 : 0);
  };

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: !shown || hidden ? "-110%" : "0%", opacity: shown ? 1 : 0 }}
        transition={{ duration: shown && phase === "revealing" ? 1.2 : 0.6, ease, delay: phase === "revealing" ? 0.9 : 0 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`mx-auto flex items-center justify-between gap-6 gutter transition-[background-color,height,border-color,backdrop-filter] duration-700 ease-lux ${
            scrolled
              ? "h-[64px] border-b border-line bg-ink/75 backdrop-blur-xl"
              : "h-[var(--nav-h)] border-b border-transparent bg-transparent"
          }`}
        >
          <button
            type="button"
            onClick={() => go("home")}
            className="group flex items-center gap-3"
            aria-label="EL GIMNASIO: back to top"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-256.webp"
              alt=""
              width={44}
              height={44}
              className="h-10 w-10 transition-transform duration-700 ease-lux group-hover:rotate-[20deg] sm:h-11 sm:w-11"
            />
            <span className="flex flex-col items-start leading-none">
              <span className="font-serif text-[1.15rem] font-semibold tracking-[0.12em] text-bone">EL GIMNASIO</span>
              <span className="label mt-1 text-[0.5rem] tracking-[0.45em] text-gold">The Gym</span>
            </span>
          </button>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-3">
              {NAV.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        go(item.id);
                      }}
                      aria-current={isActive ? "true" : undefined}
                      className={`group relative block px-3 py-2 label text-[0.64rem] transition-colors duration-300 ${
                        isActive ? "text-bone" : "text-bone/55 hover:text-bone"
                      }`}
                    >
                      {item.label}
                      <span className="absolute inset-x-3 bottom-0.5 h-px origin-left scale-x-0 bg-gold/70 transition-transform duration-500 ease-lux group-hover:scale-x-100" />
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-x-3 bottom-0.5 h-px bg-gold-bright"
                          transition={{ type: "spring", stiffness: 380, damping: 34 }}
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <MagneticButton variant="ghost" onClick={() => openJoin()} className="px-6! py-3!" arrow={false}>
                Join the movement
              </MagneticButton>
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-bone/20 lg:hidden"
            >
              <span
                className={`absolute h-px w-5 bg-bone transition-transform duration-500 ease-lux ${open ? "rotate-45" : "-translate-y-[4px]"}`}
              />
              <span
                className={`absolute h-px w-5 bg-bone transition-transform duration-500 ease-lux ${open ? "-rotate-45" : "translate-y-[4px]"}`}
              />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.75, ease }}
            className="grain fixed inset-0 z-40 flex flex-col bg-ink-2 pt-[calc(var(--nav-h)+2rem)] lg:hidden"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(212,175,55,0.12),transparent_55%)]" />
            <nav aria-label="Mobile" className="relative flex-1 gutter">
              <ul className="flex flex-col">
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ delay: 0.25 + i * 0.06, duration: 0.8, ease }}
                    className="border-b border-line"
                  >
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        go(item.id);
                      }}
                      className="flex items-baseline justify-between py-4"
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="font-display text-sm text-gold">0{i + 1}</span>
                        <span
                          className={`font-serif text-[clamp(2rem,9vw,3rem)] uppercase leading-none ${
                            active === item.id ? "text-gold-bright" : "text-bone"
                          }`}
                        >
                          {item.label}
                        </span>
                      </span>
                      <span className="label text-[0.55rem] text-mute">{item.es}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.6 } }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col gap-5 gutter pb-10 pt-6"
            >
              <MagneticButton
                onClick={() => {
                  setOpen(false);
                  openJoin();
                }}
                className="w-full"
              >
                Join the movement
              </MagneticButton>
              <a href={CONTACT.instagram.url} target="_blank" rel="noopener noreferrer" className="label text-center text-[0.6rem] text-mute">
                Instagram · {CONTACT.instagram.handle}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
