"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import RevealLines from "@/components/animations/RevealLines";
import LazyVideo from "@/components/ui/LazyVideo";
import SectionLabel from "@/components/ui/SectionLabel";
import { PROGRAMS, type Program } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";
import { openJoin } from "@/lib/store";

const ease = [0.22, 1, 0.36, 1] as const;

function Arrow({ className = "" }: { className?: string }) {
  return (
    <span className={`relative block h-3 w-6 overflow-hidden ${className}`} aria-hidden>
      <svg viewBox="0 0 24 12" className="absolute inset-0 h-3 w-6 transition-transform duration-500 ease-lux group-hover/cta:translate-x-[120%]">
        <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      <svg viewBox="0 0 24 12" className="absolute inset-0 h-3 w-6 translate-x-[-120%] transition-transform duration-500 ease-lux group-hover/cta:translate-x-0">
        <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    </span>
  );
}

function EnquireButton({ program }: { program: Program }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openJoin({ program: program.id });
      }}
      className="group/cta inline-flex items-center gap-4 border-b border-gold/50 pb-2 label text-[0.62rem] text-gold-bright transition-colors hover:border-gold-bright"
    >
      Enquire about {program.title}
      <Arrow />
    </button>
  );
}

/* ─────────────── Desktop accordion panel ─────────────── */
function Panel({ p, active, onActivate }: { p: Program; active: boolean; onActivate: () => void }) {
  return (
    <div
      data-program
      role="tab"
      tabIndex={0}
      aria-selected={active}
      aria-label={p.title}
      onPointerEnter={(e) => e.pointerType === "mouse" && onActivate()}
      onFocus={onActivate}
      onClick={onActivate}
      data-cursor={active ? undefined : "View"}
      className="group relative min-w-0 cursor-pointer overflow-hidden rounded-[3px] bg-ink-2 transition-[flex-grow] duration-[900ms] ease-lux"
      style={{ flexGrow: active ? 5.2 : 1, flexBasis: 0 }}
    >
      <div className={`absolute inset-0 transition-transform duration-[1400ms] ease-lux ${active ? "scale-100 group-hover:scale-[1.05]" : "scale-[1.15]"}`}>
        <LazyVideo src={p.video} poster={p.poster} active={active} className="h-full w-full object-cover" label={`${p.title} at EL GIMNASIO`} />
      </div>

      {/* Grade */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${active ? "opacity-0" : "opacity-100"} bg-ink/72`} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.5)_0%,transparent_30%,rgba(8,8,8,0.15)_55%,rgba(8,8,8,0.95)_100%)]" />
      <div className={`absolute inset-x-0 top-0 h-px origin-left bg-gold transition-transform duration-700 ease-lux ${active ? "scale-x-100" : "scale-x-0"}`} />

      {/* Index (always) */}
      <div className="absolute left-5 top-5 flex items-center gap-3">
        <span className={`font-display text-2xl transition-colors duration-500 ${active ? "text-gold-bright" : "text-bone/60"}`}>{p.index}</span>
      </div>

      {/* Collapsed vertical title */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${active ? "pointer-events-none opacity-0" : "opacity-100 delay-200"}`}
      >
        <span className="block whitespace-nowrap font-serif text-[1.65rem] uppercase tracking-wide text-bone/85 [writing-mode:vertical-rl] rotate-180">
          {p.title}
        </span>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.8, ease } }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
            className="absolute inset-x-0 bottom-0 p-8 xl:p-10"
          >
            <p className="label text-[0.58rem] text-gold">{p.es}</p>
            <h3 className="mt-3 font-serif text-[clamp(2.4rem,3.6vw,3.8rem)] font-medium uppercase leading-[0.92]">{p.title}</h3>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-bone/72">{p.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {p.focus.map((f) => (
                <span key={f} className="rounded-full border border-bone/15 px-3 py-1 text-[0.68rem] text-bone/70">
                  {f}
                </span>
              ))}
            </div>
            <div className="mt-7">
              <EnquireButton program={p} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────── Mobile / tablet card ─────────────── */
function Card({ p, active }: { p: Program; active: boolean }) {
  return (
    <article className="relative aspect-[3/4.3] w-[80vw] max-w-[420px] shrink-0 snap-center overflow-hidden rounded-[3px] bg-ink-2 sm:w-[56vw]">
      <LazyVideo src={p.video} poster={p.poster} active={active} className="absolute inset-0 h-full w-full object-cover" label={`${p.title} at EL GIMNASIO`} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.45)_0%,transparent_28%,rgba(8,8,8,0.3)_50%,rgba(8,8,8,0.96)_100%)]" />
      <div className={`absolute inset-x-0 top-0 h-px bg-gold transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`} />
      <span className="absolute left-5 top-5 font-display text-2xl text-gold-bright">{p.index}</span>
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="label text-[0.55rem] text-gold">{p.es}</p>
        <h3 className="mt-2 font-serif text-[2.1rem] font-medium uppercase leading-[0.92]">{p.title}</h3>
        <p className="mt-3 text-[0.86rem] leading-relaxed text-bone/72">{p.description}</p>
        <div className="mt-5">
          <EnquireButton program={p} />
        </div>
      </div>
    </article>
  );
}

/** Motion language: staggered rising panels, then an elastic accordion where only the active film plays. */
export default function Programs() {
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [mobileActive, setMobileActive] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-program]", {
          yPercent: 30,
          autoAlpha: 0,
          duration: 1.3,
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: { trigger: root.current, start: "top 45%", once: true },
        });
        gsap.from("[data-fade]", {
          y: 26,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
        });
      });
    },
    { scope: root },
  );

  // Mobile: the most-visible card is the one that plays.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll("article"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setMobileActive(cards.indexOf(e.target as HTMLElement));
        });
      },
      { root: el, threshold: 0.6 },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const scrollCard = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector("article");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 16), behavior: "smooth" });
  };

  return (
    <section
      ref={root}
      id="programs"
      data-section="programs"
      data-nav="programs"
      data-title="Programas"
      data-rise
      className="relative bg-ink-2 py-20 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 hairline opacity-40" />
      <div className="gutter">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel index="03" es="Programas" en="Programs" />
            <RevealLines
              className="mt-8 font-serif text-[clamp(2.5rem,6vw,5.8rem)] font-medium uppercase leading-[0.92]"
              lines={[
                "Five disciplines.",
                <>
                  One <em className="text-gold-metal font-normal">standard.</em>
                </>,
              ]}
            />
          </div>
          <p data-scrub-text className="max-w-sm text-[0.98rem] leading-relaxed text-mute">
            Whether you&apos;re chasing your first pull-up or your next personal best, every program is coached with the same intent:
            measurable progress, built to last.
          </p>
        </div>
      </div>

      {/* Desktop accordion */}
      <div data-programs-row role="tablist" aria-label="Training programs" className="mt-16 hidden h-[min(78vh,760px)] gap-2.5 gutter lg:flex">
        {PROGRAMS.map((p, i) => (
          <Panel key={p.id} p={p} active={active === i} onActivate={() => setActive(i)} />
        ))}
      </div>

      {/* Mobile / tablet carousel */}
      <div className="mt-12 lg:hidden">
        <div
          ref={scroller}
          data-programs-row
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-[var(--gutter)] px-[var(--gutter)] pb-2"
        >
          {PROGRAMS.map((p, i) => (
            <div key={p.id} data-program className="shrink-0">
              <Card p={p} active={mobileActive === i} />
            </div>
          ))}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
        <div className="mt-6 flex items-center justify-between gutter">
          <div className="flex gap-1.5" aria-hidden>
            {PROGRAMS.map((p, i) => (
              <span key={p.id} className={`h-px transition-all duration-500 ${mobileActive === i ? "w-8 bg-gold" : "w-3 bg-bone/25"}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => scrollCard(d)}
                aria-label={d === -1 ? "Previous program" : "Next program"}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/20 text-bone/80 active:border-gold"
              >
                <svg viewBox="0 0 16 12" className={`h-3 w-4 ${d === -1 ? "rotate-180" : ""}`}>
                  <path d="M0 6h14M9 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
